from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt


# ============================================================
# CONFIGURATION
# ============================================================

SECRET_KEY = "NIDPS_CHANGE_THIS_SECRET_KEY_2026"

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60


# ============================================================
# JWT AUTHENTICATION
# ============================================================

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/login"
)


# ============================================================
# PASSWORD HASHING
# ============================================================

def hash_password(password: str) -> str:

    password_bytes = password.encode(
        "utf-8"
    )

    if len(password_bytes) > 72:
        raise ValueError(
            "Password cannot exceed 72 bytes."
        )

    hashed = bcrypt.hashpw(
        password_bytes,
        bcrypt.gensalt()
    )

    return hashed.decode("utf-8")


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:

    password_bytes = plain_password.encode(
        "utf-8"
    )

    hashed_bytes = hashed_password.encode(
        "utf-8"
    )

    if len(password_bytes) > 72:
        return False

    return bcrypt.checkpw(
        password_bytes,
        hashed_bytes
    )


# ============================================================
# DEMO USERS
# ============================================================
#
# These are generated when the module loads.
# Later we can move users into SQLite.
#

USERS = {}


def initialize_users():

    USERS["admin"] = {
        "username": "admin",
        "password_hash": hash_password(
            "admin123"
        ),
        "role": "admin",
        "name": "System Administrator",
    }

    USERS["analyst"] = {
        "username": "analyst",
        "password_hash": hash_password(
            "analyst123"
        ),
        "role": "analyst",
        "name": "Security Analyst",
    }


initialize_users()


# ============================================================
# AUTHENTICATE USER
# ============================================================

def authenticate_user(
    username: str,
    password: str
):

    user = USERS.get(username)

    if user is None:
        return None

    if not verify_password(
        password,
        user["password_hash"]
    ):
        return None

    return user


# ============================================================
# CREATE JWT TOKEN
# ============================================================

def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
):

    to_encode = data.copy()

    if expires_delta is not None:

        expire = (
            datetime.now(timezone.utc)
            + expires_delta
        )

    else:

        expire = (
            datetime.now(timezone.utc)
            + timedelta(minutes=15)
        )

    to_encode["exp"] = expire

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt


# ============================================================
# GET CURRENT USER
# ============================================================

def get_current_user(
    token: str = Depends(oauth2_scheme)
):

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={
            "WWW-Authenticate": "Bearer"
        }
    )

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        username = payload.get("sub")

        if username is None:
            raise credentials_exception

    except JWTError:

        raise credentials_exception

    user = USERS.get(username)

    if user is None:
        raise credentials_exception

    return user


# ============================================================
# ADMIN-ONLY ACCESS
# ============================================================

def require_admin(
    current_user=Depends(
        get_current_user
    )
):

    if current_user["role"] != "admin":

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator privileges required"
        )

    return current_user