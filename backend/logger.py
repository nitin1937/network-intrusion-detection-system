from backend.database import get_connection


# =====================================================
# SEVERITY
# =====================================================

def calculate_severity(confidence):

    confidence = float(confidence)

    if confidence >= 95:
        return "Critical"

    if confidence >= 80:
        return "High"

    if confidence >= 60:
        return "Medium"

    return "Low"


# =====================================================
# SAVE PREDICTION LOG
# =====================================================

def save_log(
    attack_type,
    confidence,
    source_ip=None,
    destination_ip=None,
    action=None,
    traffic_bytes=0
):

    severity = calculate_severity(
        confidence
    )

    conn = get_connection()
    cursor = conn.cursor()

    # =================================================
    # SAVE ATTACK LOG
    # =================================================

    cursor.execute(
        """
        INSERT INTO attack_logs
        (
            attack_type,
            confidence,
            source_ip,
            destination_ip,
            action,
            bytes
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            str(attack_type),
            float(confidence),
            source_ip,
            destination_ip,
            action,
            int(traffic_bytes or 0)
        )
    )

    # =================================================
    # CREATE ALERT
    # =================================================

    if (
        str(attack_type).lower() != "benign"
        and severity in ["High", "Critical"]
    ):

        message = (
            f"{severity} Alert: "
            f"{attack_type} detected "
            f"with {float(confidence):.2f}% "
            f"confidence."
        )

        cursor.execute(
            """
            INSERT INTO alerts
            (
                attack_type,
                severity,
                message,
                source_ip,
                destination_ip,
                confidence,
                action
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                str(attack_type),
                severity,
                message,
                source_ip,
                destination_ip,
                float(confidence),
                action
            )
        )

    conn.commit()
    conn.close()


# =====================================================
# GET SEVERITY
# =====================================================

def get_severity(confidence):

    return calculate_severity(confidence)