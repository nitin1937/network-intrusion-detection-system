import sqlite3
from pathlib import Path


# =====================================================
# DATABASE PATH
# =====================================================

BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_PATH = BASE_DIR / "nidps.db"


# =====================================================
# DATABASE CONNECTION
# =====================================================

def get_connection():

    conn = sqlite3.connect(str(DATABASE_PATH))

    conn.row_factory = sqlite3.Row

    return conn


# =====================================================
# ADD COLUMN IF IT DOES NOT EXIST
# =====================================================

def add_column_if_missing(
    cursor,
    table,
    column,
    definition
):

    cursor.execute(
        f"PRAGMA table_info({table})"
    )

    columns = [
        row[1]
        for row in cursor.fetchall()
    ]

    if column not in columns:

        cursor.execute(
            f"""
            ALTER TABLE {table}
            ADD COLUMN {column} {definition}
            """
        )


# =====================================================
# CREATE TABLES
# =====================================================

def create_tables():

    conn = get_connection()
    cursor = conn.cursor()

    # =================================================
    # ATTACK LOGS
    # =================================================

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS attack_logs (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            attack_type TEXT NOT NULL,

            confidence REAL NOT NULL,

            source_ip TEXT,

            destination_ip TEXT,

            action TEXT,

            bytes INTEGER DEFAULT 0,

            timestamp DATETIME
                DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    # Existing database migration
    add_column_if_missing(
        cursor,
        "attack_logs",
        "source_ip",
        "TEXT"
    )

    add_column_if_missing(
        cursor,
        "attack_logs",
        "destination_ip",
        "TEXT"
    )

    add_column_if_missing(
        cursor,
        "attack_logs",
        "action",
        "TEXT"
    )

    add_column_if_missing(
        cursor,
        "attack_logs",
        "bytes",
        "INTEGER DEFAULT 0"
    )

    # =================================================
    # ALERTS
    # =================================================

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS alerts (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            attack_type TEXT NOT NULL,

            severity TEXT NOT NULL,

            message TEXT NOT NULL,

            source_ip TEXT,

            destination_ip TEXT,

            confidence REAL,

            action TEXT,

            timestamp DATETIME
                DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    add_column_if_missing(
        cursor,
        "alerts",
        "source_ip",
        "TEXT"
    )

    add_column_if_missing(
        cursor,
        "alerts",
        "destination_ip",
        "TEXT"
    )

    add_column_if_missing(
        cursor,
        "alerts",
        "confidence",
        "REAL"
    )

    add_column_if_missing(
        cursor,
        "alerts",
        "action",
        "TEXT"
    )

    # =================================================
    # BLOCKED IPS
    # =================================================

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS blocked_ips (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            ip_address TEXT UNIQUE,

            reason TEXT,

            blocked_at DATETIME
                DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    conn.commit()
    conn.close()


# =====================================================
# INITIALIZE DATABASE
# =====================================================

create_tables()