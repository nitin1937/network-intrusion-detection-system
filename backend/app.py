from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes import router
from backend.database import create_tables


app = FastAPI(
    title="NIDPS API",
    version="1.0.0"
)


# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://10.39.25.70:3000",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =====================================================
# DATABASE
# =====================================================

create_tables()


# =====================================================
# ROUTES
# =====================================================

app.include_router(router)


# =====================================================
# HOME
# =====================================================

@app.get("/")
def home():

    return {
        "message": "NIDPS API is running",
        "status": "online"
    }


# =====================================================
# STATUS
# =====================================================

@app.get("/status")
def status():

    return {
        "backend": "Running",
        "model": "Loaded",
        "firewall": "Not Connected",
        "database": "Connected"
    }


# =====================================================
# DETECTION STATUS
# =====================================================

@app.get("/detection-status")
def detection_status():

    return {
        "system": "NIDS",
        "mode": "Detection Only",
        "packet_capture": "Active",
        "ai_model": "Loaded",
        "feature_engine": "78 Features",
        "database": "Connected",
        "prevention": "Disabled"
    }