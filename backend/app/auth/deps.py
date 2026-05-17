from datetime import date
from typing import Union

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.auth.tokens import decode_access_token
from app.db.mongo import users_collection
from app.models.driver import Driver
from app.models.passenger import Passenger

_bearer = HTTPBearer()


def _doc_to_user(doc: dict) -> Union[Passenger, Driver]:
    data = {k: v for k, v in doc.items() if k != "password_hash"}
    data["id"] = data.pop("_id")
    if isinstance(data.get("dob"), str):
        data["dob"] = date.fromisoformat(data["dob"])
    if data.get("role") == "driver":
        exp = data.get("license_expiration")
        if isinstance(exp, str):
            data["license_expiration"] = date.fromisoformat(exp)
        return Driver(**data)
    return Passenger(**data)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> Union[Passenger, Driver]:
    claims = decode_access_token(credentials.credentials)
    user_id = claims.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    doc = await users_collection().find_one({"_id": user_id})
    if not doc:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return _doc_to_user(doc)
