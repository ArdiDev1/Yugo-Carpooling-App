# IdCheck.py
import base64
import os
from typing import Optional, TypedDict

import httpx

ID_ANALYZER_API_KEY = os.environ.get("ID_ANALYZER_API_KEY", "")
ID_ANALYZER_REGION = os.environ.get("ID_ANALYZER_REGION", "us")
ID_ANALYZER_URL = f"https://api2.idanalyzer.com/scan"

AUTH_THRESHOLD = 0.8


class IdCheckResult(TypedDict):
    is_valid: bool
    name: Optional[str]
    dob: Optional[str]
    document_number: Optional[str]
    expiry: Optional[str]
    score: Optional[float]


def verify_id(image_bytes: bytes) -> IdCheckResult:
    encoded = base64.b64encode(image_bytes).decode("utf-8")

    payload = {
        "document": encoded,
        "authenticate": True,
        "authenticate_module": 2,
    }
    headers = {
        "X-API-KEY": ID_ANALYZER_API_KEY,
        "Accept": "application/json",
    }

    resp = httpx.post(ID_ANALYZER_URL, json=payload, headers=headers, timeout=30.0)
    resp.raise_for_status()
    data = resp.json()

    if "error" in data:
        return _empty_result()

    result = data.get("result", {}) or {}
    authentication = data.get("authentication", {}) or {}

    score = authentication.get("score")
    is_valid = score is not None and score >= AUTH_THRESHOLD

    return {
        "is_valid": bool(is_valid),
        "name": result.get("fullName") or _join_name(result),
        "dob": result.get("dob"),
        "document_number": result.get("documentNumber"),
        "expiry": result.get("expiry"),
        "score": score,
    }


def _join_name(result: dict) -> Optional[str]:
    first = result.get("firstName") or ""
    last = result.get("lastName") or ""
    full = f"{first} {last}".strip()
    return full or None


def _empty_result() -> IdCheckResult:
    return {
        "is_valid": False,
        "name": None,
        "dob": None,
        "document_number": None,
        "expiry": None,
        "score": None,
    }


if __name__ == "__main__":
    # Local mock test — does NOT hit the IDAnalyzer API (saves quota).
    # Uses httpx's MockTransport to fake a response and verify that
    # verify_id() parses + thresholds correctly.
    from unittest.mock import patch

    fake_response_valid = {
        "result": {
            "firstName": "Jane",
            "lastName": "Doe",
            "dob": "1995-04-12",
            "documentNumber": "X1234567",
            "expiry": "2030-04-12",
        },
        "authentication": {"score": 0.92},
    }

    fake_response_invalid = {
        "result": {"firstName": "John", "lastName": "Smith"},
        "authentication": {"score": 0.35},
    }

    def make_mock(payload):
        def handler(request: httpx.Request) -> httpx.Response:
            return httpx.Response(200, json=payload)
        return httpx.MockTransport(handler)

    def run_case(label, payload):
        transport = make_mock(payload)
        with patch("httpx.post") as mocked:
            client = httpx.Client(transport=transport)
            mocked.side_effect = lambda url, **kw: client.post(url, **kw)
            result = verify_id(b"fake-jpeg-bytes")
        print(f"{label}: {result}")

    run_case("VALID ID  ", fake_response_valid)
    run_case("INVALID ID", fake_response_invalid)


# =============================================================================
# USAGE (from a FastAPI route)
# =============================================================================
#
#   from fastapi import UploadFile
#   from backend.app.services.IdCheck import verify_id
#
#   @app.post("/driver/register")
#   async def register_driver(id_image: UploadFile):
#       image_bytes = await id_image.read()
#       result = verify_id(image_bytes)
#
#       if not result["is_valid"]:
#           raise HTTPException(status_code=400, detail="ID verification failed")
#
#       # Proceed with DB registration using result["name"], result["dob"], etc.
#       ...
#
# Return shape:
#   {
#     "is_valid": bool,          # True if authenticity score >= 0.8
#     "name": str | None,
#     "dob": str | None,         # YYYY-MM-DD or YYYY/MM/DD per IDAnalyzer
#     "document_number": str | None,
#     "expiry": str | None,
#     "score": float | None      # raw authenticity score from IDAnalyzer
#   }
