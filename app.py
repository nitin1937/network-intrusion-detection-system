"""
Network Intrusion Detection System (NIDS / NIDPS)
Entry point to run the FastAPI backend server.
"""

import sys
from pathlib import Path
import uvicorn

# Ensure the project root is in sys.path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

if __name__ == "__main__":
    print("=" * 60)
    print("  Starting NIDS / NIDPS Backend Server...")
    print("  API Docs available at: http://127.0.0.1:8000/docs")
    print("  API Root available at: http://127.0.0.1:8000")
    print("=" * 60)
    uvicorn.run("backend.app:app", host="127.0.0.1", port=8000, reload=False)
