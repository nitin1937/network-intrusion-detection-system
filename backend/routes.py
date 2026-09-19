from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, Body
from fastapi.security import OAuth2PasswordRequestForm
from typing import Optional, Dict, Any

from backend.schemas import PredictionRequest, PredictionResponse
from backend.logger import save_log
from backend.database import get_connection
from backend.auth import authenticate_user, create_access_token
from backend.simulator import simulator_engine, TUNNELS


router = APIRouter()


# ============================================================
# HOME
# ============================================================

@router.get("/")
def home():

    return {
        "message": "Network Intrusion Detection System Running",
        "mode": "Detection Only",
        "model": "Hybrid CNN-RFNN",
    }


# ============================================================
# LOGIN
# ============================================================

@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends()
):

    # --------------------------------------------------------
    # Authenticate user
    # --------------------------------------------------------

    user = authenticate_user(
        form_data.username,
        form_data.password
    )

    if not user:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    # --------------------------------------------------------
    # Create JWT token
    # --------------------------------------------------------

    access_token = create_access_token(
        data={
            "sub": user["username"],
            "role": user["role"],
        }
    )

    # --------------------------------------------------------
    # Return authentication data
    # --------------------------------------------------------

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user["username"],
        "role": user["role"],
        "name": user.get(
            "name",
            user["username"]
        ),
    }


# ============================================================
# PREDICT ATTACK
# ============================================================

@router.post(
    "/predict",
    response_model=PredictionResponse
)
def predict(data: PredictionRequest):

    # Load the model only when a prediction is requested.  This keeps
    # authentication and operational endpoints available if the optional
    # local model runtime is not installed yet.
    try:
        from backend.predictor import predict_attack
    except ModuleNotFoundError as exc:
        if exc.name == "torch":
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Prediction service is unavailable: PyTorch is not installed.",
            ) from exc
        raise

    result = predict_attack(
        data.features
    )

    attack = result["attack"]

    confidence = float(
        result["confidence"]
    )

    severity = result.get(
        "severity",
        "Low"
    )

    # --------------------------------------------------------
    # Detection action
    # --------------------------------------------------------

    if str(attack).lower() == "benign":

        action = "Benign Traffic"

    elif confidence >= 95:

        action = "Threat Detected"

    elif confidence >= 80:

        action = "Alert Generated"

    else:

        action = "Monitor"

    # --------------------------------------------------------
    # Save prediction
    # --------------------------------------------------------

    save_log(
        attack_type=attack,
        confidence=confidence,
        action=action
    )

    return PredictionResponse(
        attack=attack,
        confidence=confidence,
        severity=severity,
        action=action
    )


# ============================================================
# ATTACK LOGS
# ============================================================

@router.get("/logs")
def get_logs():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT *
        FROM attack_logs
        ORDER BY id DESC
        """
    )

    logs = [
        dict(row)
        for row in cursor.fetchall()
    ]

    conn.close()

    return logs


# ============================================================
# DASHBOARD STATISTICS
# ============================================================

@router.get("/dashboard")
def dashboard():

    conn = get_connection()
    cursor = conn.cursor()

    # Total logs

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM attack_logs
        """
    )

    total_logs = cursor.fetchone()[0]

    # Total alerts

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM alerts
        """
    )

    total_alerts = cursor.fetchone()[0]

    # Detected threats

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM attack_logs
        WHERE LOWER(attack_type) != 'benign'
        """
    )

    active_threats = cursor.fetchone()[0]

    # Traffic bytes

    cursor.execute(
        """
        SELECT COALESCE(SUM(bytes), 0)
        FROM attack_logs
        """
    )

    total_bytes = cursor.fetchone()[0]

    # Risk score

    risk_score = min(
        active_threats * 10,
        100
    )

    conn.close()

    # Human-readable traffic

    if total_bytes >= 1024 * 1024 * 1024:

        total_traffic = (
            f"{total_bytes / (1024 * 1024 * 1024):.2f} GB"
        )

    elif total_bytes >= 1024 * 1024:

        total_traffic = (
            f"{total_bytes / (1024 * 1024):.2f} MB"
        )

    elif total_bytes >= 1024:

        total_traffic = (
            f"{total_bytes / 1024:.2f} KB"
        )

    else:

        total_traffic = (
            f"{total_bytes} B"
        )

    return {
        "totalTraffic": total_traffic,
        "totalAlerts": total_alerts,
        "activeThreats": active_threats,
        "riskScore": risk_score,
        "totalLogs": total_logs,
    }


# ============================================================
# LATEST THREAT
# ============================================================

@router.get("/latest-threat")
def latest_threat():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT
            attack_type,
            confidence,
            source_ip,
            destination_ip,
            action,
            timestamp
        FROM attack_logs
        WHERE LOWER(attack_type) != 'benign'
        ORDER BY id DESC
        LIMIT 1
        """
    )

    row = cursor.fetchone()

    conn.close()

    if row is None:

        return {
            "attack": "None",
            "confidence": 0,
            "severity": "Low",
            "recommendation": "No active threats detected",
            "source_ip": None,
            "destination_ip": None,
            "action": "System Monitoring",
        }

    confidence = float(
        row["confidence"]
    )

    if confidence >= 95:

        severity = "Critical"

    elif confidence >= 80:

        severity = "High"

    elif confidence >= 60:

        severity = "Medium"

    else:

        severity = "Low"

    return {
        "attack": row["attack_type"],
        "confidence": confidence,
        "severity": severity,
        "recommendation": (
            f"Investigate {row['attack_type']}"
        ),
        "source_ip": row["source_ip"],
        "destination_ip": row["destination_ip"],
        "action": row["action"],
        "timestamp": row["timestamp"],
    }


# ============================================================
# ALERTS
# ============================================================

@router.get("/alerts")
def get_alerts():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT *
        FROM alerts
        ORDER BY id DESC
        """
    )

    alerts = [
        dict(row)
        for row in cursor.fetchall()
    ]

    conn.close()

    return alerts


# ============================================================
# THREAT IPS
# ============================================================

@router.get("/threat-ips")
def get_threat_ips():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT
            source_ip,
            COUNT(*) AS attack_count,
            MAX(confidence) AS max_confidence,
            MAX(timestamp) AS last_seen
        FROM attack_logs
        WHERE
            LOWER(attack_type) != 'benign'
            AND source_ip IS NOT NULL
        GROUP BY source_ip
        ORDER BY attack_count DESC
        """
    )

    threats = [
        dict(row)
        for row in cursor.fetchall()
    ]

    conn.close()

    return threats


# ============================================================
# TRAFFIC HISTORY
# ============================================================

@router.get("/traffic-history")
def traffic_history():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT
            strftime('%H:%M', timestamp) AS time,
            SUM(bytes) AS traffic
        FROM attack_logs
        WHERE bytes IS NOT NULL
        GROUP BY strftime('%Y-%m-%d %H:%M', timestamp)
        ORDER BY timestamp DESC
        LIMIT 20
        """
    )

    rows = cursor.fetchall()

    conn.close()

    rows = list(reversed(rows))

    return [
        {
            "time": row["time"],
            "traffic": row["traffic"] or 0,
        }
        for row in rows
    ]


# ============================================================
# ATTACK DISTRIBUTION
# ============================================================

@router.get("/attack-distribution")
def attack_distribution():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT
            attack_type AS name,
            COUNT(*) AS value
        FROM attack_logs
        WHERE LOWER(attack_type) != 'benign'
        GROUP BY attack_type
        ORDER BY value DESC
        """
    )

    rows = cursor.fetchall()

    conn.close()

    return [
        {
            "name": row["name"],
            "value": row["value"],
        }
        for row in rows
    ]


# ============================================================
# DETECTION STATUS
# ============================================================

@router.get("/detection-status")
def detection_status():

    return {
        "system": "NIDS",
        "mode": "Detection Only",
        "packet_capture": "Active",
        "ai_model": "Loaded",
        "feature_engine": "78 Features",
        "database": "Connected",
        "prevention": "Disabled",
    }


# ============================================================
# LIVE NETWORK & TUNNEL SIMULATION ENDPOINTS
# ============================================================

@router.get("/simulation/status")
def get_simulation_status():
    """Returns real-time simulation status, active counters, and risk score."""
    return simulator_engine.get_status()


@router.get("/simulation/tunnels")
def get_simulation_tunnels():
    """Returns the list of ingress tunnels and configuration."""
    return TUNNELS


@router.get("/simulation/history")
def get_simulation_history():
    """Returns the latest packets processed by the simulation."""
    return simulator_engine.recent_packets


@router.post("/simulation/start")
async def start_simulation(payload: Optional[Dict[str, Any]] = Body(default={})):
    """Starts the continuous background traffic simulation loop."""
    delay = float(payload.get("delay", 1.0)) if payload else 1.0
    simulator_engine.start(delay=delay)
    return {"status": "running", "delay": delay}


@router.post("/simulation/stop")
async def stop_simulation():
    """Pauses the background simulation loop."""
    simulator_engine.stop()
    return {"status": "paused"}


@router.post("/simulation/inject")
async def inject_packet(payload: Optional[Dict[str, Any]] = Body(default={})):
    """
    Manually injects one specific packet or cyber attack scenario.
    Immediately processes it through the 6-stage pipeline and broadcasts it.
    """
    scenario = payload.get("scenario") if payload else None
    tunnel_id = payload.get("tunnel_id") if payload else None
    
    packet_data = simulator_engine.process_and_emit(
        scenario=scenario,
        tunnel_id=tunnel_id
    )
    
    # Broadcast to active WebSockets
    await simulator_engine.broadcast_packet(packet_data)
    
    return packet_data


@router.post("/simulation/process-dataset")
async def process_dataset_batch_endpoint(payload: Optional[Dict[str, Any]] = Body(default={})):
    """
    Simulates processing an uploaded / stored dataset batch through the 6-stage NIDS pipeline:
    Ingestion -> Cleaning -> 78 Features -> Normalization -> AI Inference -> Alert Logging.
    """
    batch_size = int(payload.get("batch_size", 8)) if payload else 8
    result = simulator_engine.process_dataset_batch(batch_size=batch_size)
    
    # Broadcast latest packet to active WebSockets
    if result["packets"]:
        await simulator_engine.broadcast_packet(result["packets"][0])
        
    return result


@router.post("/simulation/reset")
def reset_simulation():
    """Resets all simulation counters, tunnel statistics, and history."""
    simulator_engine.reset_metrics()
    return {"status": "reset_successful"}


# ============================================================
# REAL-TIME WEBSOCKET STREAM
# ============================================================

@router.websocket("/ws/simulation")
async def simulation_websocket(websocket: WebSocket):
    """
    Real-time bidirectional WebSocket connection for live telemetry,
    tunnel animations, and pipeline trace events.
    """
    await websocket.accept()
    simulator_engine.active_websockets.add(websocket)

    try:
        # Send initial status and latest history
        await websocket.send_json({
            "type": "INITIAL_STATE",
            "status": simulator_engine.get_status(),
            "tunnels": TUNNELS,
            "recent_packets": simulator_engine.recent_packets[:15]
        })

        # Listen for client control messages
        while True:
            data = await websocket.receive_json()
            action = data.get("action")

            if action == "start":
                delay = float(data.get("delay", 1.0))
                simulator_engine.start(delay=delay)
            elif action == "stop":
                simulator_engine.stop()
            elif action == "inject":
                scenario = data.get("scenario")
                tunnel_id = data.get("tunnel_id")
                pkt = simulator_engine.process_and_emit(scenario=scenario, tunnel_id=tunnel_id)
                await simulator_engine.broadcast_packet(pkt)
            elif action == "reset":
                simulator_engine.reset_metrics()
                await websocket.send_json({
                    "type": "RESET",
                    "status": simulator_engine.get_status()
                })

    except WebSocketDisconnect:
        simulator_engine.active_websockets.discard(websocket)
    except Exception as e:
        print(f"WebSocket Error: {e}")
        simulator_engine.active_websockets.discard(websocket)
