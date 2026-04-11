# type: ignore
from pydantic import BaseModel 

class Passenger(BaseModel):
    id: str
    name: str
    school_email: str
    curr_location: str
    phone_number: str
    gender: str