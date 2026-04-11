from pydantic import BaseModel # type: ignore

class Driver(BaseModel):
    id: str
    name: str
    school_email: str
    curr_location: str
    phone_number: str
    gender: str
    vehicle_type: str
    passenger_cap: int
    is_verified: bool
    prefers_women: bool
