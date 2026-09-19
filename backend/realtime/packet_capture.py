from scapy.all import sniff
from scapy.layers.inet import IP

from backend.realtime.flow_manager import flow_manager
from backend.realtime.feature_extractor import FeatureExtractor

from backend.predictor import predict_attack
from backend.logger import save_log


# ============================================================
# PROCESS ONE PACKET
# ============================================================

def process_packet(packet):

    # --------------------------------------------------------
    # Ignore packets without IPv4
    # --------------------------------------------------------

    if not packet.haslayer(IP):
        return

    # --------------------------------------------------------
    # Update network flow
    # --------------------------------------------------------

    try:

        flow = flow_manager.update_flow(packet)

    except Exception as e:

        print(
            "Flow Manager Error:",
            e
        )

        return

    if flow is None:
        return

    # --------------------------------------------------------
    # Extract 78 ML features
    # --------------------------------------------------------

    try:

        extractor = FeatureExtractor(flow)

        features = extractor.basic_features()

    except Exception as e:

        print(
            "Feature Extraction Error:",
            e
        )

        return

    # --------------------------------------------------------
    # Verify feature count
    # --------------------------------------------------------

    if len(features) != 78:

        print(
            f"Invalid feature vector: "
            f"{len(features)} features"
        )

        return

    # --------------------------------------------------------
    # AI PREDICTION
    # --------------------------------------------------------

    try:

        result = predict_attack(
            features
        )

    except Exception as e:

        print(
            "Prediction Error:",
            e
        )

        return

    # --------------------------------------------------------
    # IP INFORMATION
    # --------------------------------------------------------

    src_ip = packet[IP].src
    dst_ip = packet[IP].dst

    packet_size = len(packet)

    attack = result.get(
        "attack",
        "Unknown"
    )

    confidence = float(
        result.get(
            "confidence",
            0
        )
    )

    severity = result.get(
        "severity",
        "Low"
    )

    # --------------------------------------------------------
    # DETECTION ACTION
    # --------------------------------------------------------
    #
    # IMPORTANT:
    # This is DETECTION ONLY.
    #
    # We do NOT:
    # - block IPs
    # - modify Windows Firewall
    # - terminate connections
    #
    # The system only identifies and logs threats.
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
    # TERMINAL OUTPUT
    # --------------------------------------------------------

    print(
        f"[{src_ip} -> {dst_ip}] "
        f"{attack} "
        f"({confidence:.2f}%)"
    )

    print(
        f"Severity: {severity}"
    )

    print(
        f"Action: {action}"
    )

    print("-" * 65)

    # --------------------------------------------------------
    # SAVE EVERYTHING TO DATABASE
    # --------------------------------------------------------

    try:

        save_log(
            attack_type=attack,
            confidence=confidence,
            source_ip=src_ip,
            destination_ip=dst_ip,
            action=action,
            traffic_bytes=packet_size
        )

    except Exception as e:

        print(
            "Logger Error:",
            e
        )


# ============================================================
# START REAL-TIME MONITORING
# ============================================================

def start_monitoring():

    print("=" * 70)
    print("       NIDS REAL-TIME NETWORK MONITORING")
    print("=" * 70)

    print()

    print(
        "AI Model       : ACTIVE"
    )

    print(
        "Packet Capture : ACTIVE"
    )

    print(
        "Feature Engine : 78 FEATURES"
    )

    print(
        "Detection      : ACTIVE"
    )

    print(
        "Prevention     : DISABLED"
    )

    print(
        "Database       : ACTIVE"
    )

    print()

    print(
        "System Mode    : DETECTION ONLY"
    )

    print(
        "Waiting for network packets..."
    )

    print("=" * 70)

    try:

        sniff(
            prn=process_packet,
            store=False
        )

    except KeyboardInterrupt:

        print()

        print(
            "NIDS monitoring stopped."
        )

    except Exception as e:

        print(
            "Packet Capture Error:",
            e
        )


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    start_monitoring()