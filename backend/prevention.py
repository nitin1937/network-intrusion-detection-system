import ipaddress
import platform
import subprocess

from backend.database import get_connection


# ============================================================
# CONFIGURATION
# ============================================================

FIREWALL_PREFIX = "NIDPS-AUTO-BLOCK"


# ============================================================
# VALIDATE IP
# ============================================================

def validate_ip(ip_address):

    try:
        return ipaddress.ip_address(
            str(ip_address)
        )

    except ValueError:

        return None


# ============================================================
# PROTECTED LOCAL IPS
# ============================================================

def is_protected_ip(ip_address):

    ip = validate_ip(ip_address)

    if ip is None:
        return True

    # Never block localhost
    if ip.is_loopback:
        return True

    # Never block unspecified addresses
    if ip.is_unspecified:
        return True

    # Never block multicast
    if ip.is_multicast:
        return True

    # Never block link-local
    if ip.is_link_local:
        return True

    return False


# ============================================================
# FIREWALL RULE NAME
# ============================================================

def firewall_rule_name(ip_address):

    safe_ip = str(ip_address).replace(
        ":",
        "_"
    )

    return (
        f"{FIREWALL_PREFIX}-{safe_ip}"
    )


# ============================================================
# CREATE WINDOWS FIREWALL RULE
# ============================================================

def create_firewall_rule(ip_address):

    if platform.system() != "Windows":

        return {
            "success": False,
            "message": (
                "Windows Firewall is only "
                "supported on Windows."
            )
        }

    ip = validate_ip(ip_address)

    if ip is None:

        return {
            "success": False,
            "message": "Invalid IP address."
        }

    if is_protected_ip(ip):

        return {
            "success": False,
            "message": (
                f"Protected IP {ip} "
                "was not blocked."
            )
        }

    rule_name = firewall_rule_name(ip)

    command = [
        "netsh",
        "advfirewall",
        "firewall",
        "add",
        "rule",
        f"name={rule_name}",
        "dir=in",
        "action=block",
        f"remoteip={ip}",
        "enable=yes",
        "profile=any",
    ]

    try:

        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=15,
        )

        if result.returncode == 0:

            return {
                "success": True,
                "message": (
                    f"Windows Firewall rule "
                    f"created for {ip}."
                ),
            }

        return {
            "success": False,
            "message": (
                result.stderr.strip()
                or result.stdout.strip()
                or "Firewall rule creation failed."
            ),
        }

    except Exception as e:

        return {
            "success": False,
            "message": str(e),
        }


# ============================================================
# REMOVE WINDOWS FIREWALL RULE
# ============================================================

def remove_firewall_rule(ip_address):

    if platform.system() != "Windows":

        return {
            "success": False,
            "message": (
                "Windows Firewall is only "
                "supported on Windows."
            )
        }

    rule_name = firewall_rule_name(
        ip_address
    )

    command = [
        "netsh",
        "advfirewall",
        "firewall",
        "delete",
        "rule",
        f"name={rule_name}",
    ]

    try:

        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=15,
        )

        # netsh can return non-zero if the
        # rule does not exist. That is okay
        # for our purposes.

        return {
            "success": result.returncode == 0,
            "message": (
                result.stdout.strip()
                or result.stderr.strip()
                or f"Firewall rule removed for {ip_address}."
            ),
        }

    except Exception as e:

        return {
            "success": False,
            "message": str(e),
        }


# ============================================================
# BLOCK IP ADDRESS
# ============================================================

def block_ip(
    ip_address,
    reason="Malicious Activity"
):

    ip = validate_ip(ip_address)

    if ip is None:

        return {
            "status": "error",
            "message": (
                f"Invalid IP address: "
                f"{ip_address}"
            ),
        }

    if is_protected_ip(ip):

        return {
            "status": "error",
            "message": (
                f"Protected IP {ip} "
                "cannot be blocked."
            ),
        }

    # --------------------------------------------------------
    # Create Windows Firewall Rule
    # --------------------------------------------------------

    firewall = create_firewall_rule(
        str(ip)
    )

    # --------------------------------------------------------
    # Only save as successfully blocked
    # if firewall rule was created.
    # --------------------------------------------------------

    if not firewall["success"]:

        return {
            "status": "error",
            "message": (
                f"Firewall blocking failed "
                f"for {ip}: "
                f"{firewall['message']}"
            ),
            "firewall": firewall,
        }

    # --------------------------------------------------------
    # Save blocked IP in SQLite
    # --------------------------------------------------------

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT OR IGNORE INTO blocked_ips
        (ip_address, reason)
        VALUES (?, ?)
        """,
        (
            str(ip),
            reason,
        )
    )

    conn.commit()
    conn.close()

    return {
        "status": "success",
        "message": (
            f"{ip} blocked successfully."
        ),
        "ip": str(ip),
        "firewall": "Blocked",
    }


# ============================================================
# UNBLOCK IP ADDRESS
# ============================================================

def unblock_ip(ip_address):

    ip = validate_ip(ip_address)

    if ip is None:

        return {
            "status": "error",
            "message": "Invalid IP address.",
        }

    # --------------------------------------------------------
    # Remove Windows Firewall Rule
    # --------------------------------------------------------

    firewall = remove_firewall_rule(
        str(ip)
    )

    # --------------------------------------------------------
    # Remove from SQLite
    # --------------------------------------------------------

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        DELETE FROM blocked_ips
        WHERE ip_address=?
        """,
        (
            str(ip),
        )
    )

    deleted = cursor.rowcount

    conn.commit()
    conn.close()

    return {
        "status": "success",
        "message": (
            f"{ip} unblocked successfully."
        ),
        "ip": str(ip),
        "database_removed": deleted > 0,
        "firewall": firewall,
    }


# ============================================================
# GET ALL BLOCKED IPS
# ============================================================

def get_blocked_ips():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT *
        FROM blocked_ips
        ORDER BY blocked_at DESC
        """
    )

    rows = cursor.fetchall()

    conn.close()

    return [
        dict(row)
        for row in rows
    ]


# ============================================================
# CHECK WHETHER IP IS BLOCKED
# ============================================================

def is_blocked(ip_address):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM blocked_ips
        WHERE ip_address=?
        """,
        (
            str(ip_address),
        )
    )

    blocked = (
        cursor.fetchone()[0] > 0
    )

    conn.close()

    return blocked


# ============================================================
# AUTO PREVENTION
# ============================================================

def auto_prevention(
    ip_address,
    attack,
    confidence
):

    attack = str(attack)

    confidence = float(
        confidence
    )

    # --------------------------------------------------------
    # BENIGN
    # --------------------------------------------------------

    if attack.lower() == "benign":

        return {
            "action": "Allow Traffic"
        }

    # --------------------------------------------------------
    # CRITICAL ATTACK
    # --------------------------------------------------------

    if confidence >= 95:

        result = block_ip(
            ip_address,
            (
                f"{attack} "
                f"({confidence:.2f}%)"
            )
        )

        if result["status"] == "success":

            return {
                "action": "Blocked",
                "ip": str(ip_address),
                "firewall": "Active",
            }

        # Firewall failed

        return {
            "action": "Block Failed",
            "ip": str(ip_address),
            "reason": result["message"],
        }

    # --------------------------------------------------------
    # HIGH CONFIDENCE
    # --------------------------------------------------------

    elif confidence >= 80:

        return {
            "action": "Alert Generated",
            "ip": str(ip_address),
        }

    # --------------------------------------------------------
    # MEDIUM / LOW
    # --------------------------------------------------------

    return {
        "action": "Monitor",
        "ip": str(ip_address),
    }