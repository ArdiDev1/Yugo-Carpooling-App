from pydantic import BaseModel

class Passenger(BaseModel):
    id: str
    name: str
    email: str