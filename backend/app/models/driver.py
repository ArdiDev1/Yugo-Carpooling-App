from pydantic import BaseModel

class Driver(BaseModel):
    id: str
    name: str
    school_email: str
    phone_number: str
    gender: str
    vechicle_type: str
    passenger_capacity: int
    is_verified: bool
    prefers_women: bool
