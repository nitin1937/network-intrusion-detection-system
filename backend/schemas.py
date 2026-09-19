from pydantic import BaseModel, Field
from typing import List


# ============================================================
# LOGIN
# ============================================================

class LoginRequest(BaseModel):

    username: str

    password: str


# ============================================================
# PREDICTION REQUEST
# ============================================================

class PredictionRequest(BaseModel):

    features: List[float] = Field(
        ...,
        min_length=78,
        max_length=78,
        description="List of 78 network traffic features",
    )


# ============================================================
# PREDICTION RESPONSE
# ============================================================

class PredictionResponse(BaseModel):

    attack: str

    confidence: float

    severity: str

    action: str