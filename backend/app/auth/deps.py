from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Union
from app.models.passenger import Passenger
from app.models.driver import Driver
from app.db.mock_db import passengers_db, drivers_db

_bearer = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> Union[Passenger, Driver]:
    token = credentials.credentials  # everything after "Bearer "
    if not token.startswith("mock-token-"):
        raise HTTPException(status_code=401, detail="Unauthorized")
    user_id = token.removeprefix("mock-token-")
    for u in passengers_db + drivers_db:
        if u.id == user_id:
            return u
    raise HTTPException(status_code=401, detail="Unauthorized")
