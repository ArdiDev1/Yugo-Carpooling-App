from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel
from typing import Annotated, Literal, Optional, Union
from datetime import date, datetime
from app.models.user import _config


class RideBase(BaseModel):
    model_config = _config

    id: str
    author_id: str
    status: Literal["open", "closed"] = "open"
    content: str
    from_location: str
    to_location: str
    purpose: Literal["shopping", "flight", "college_event", "other"]
    date: date
    time: Optional[str] = None
    flexible: bool = True
    flexible_window: Optional[str] = None
    prefers_women: bool = False
    school: Optional[str] = None
    likes: int = 0
    comments: int = 0
    gas_cost: Optional[dict] = None
    created_at: datetime


class RideOffer(RideBase):
    type: Literal["offer"] = "offer"
    seats_total: int
    seats_taken: int = 0
    storage_capacity: Literal["none", "half", "full"] = "half"
    no_payment_needed: bool = False


class RideRequest(RideBase):
    type: Literal["request"] = "request"
    luggage: Literal["none", "light", "medium", "heavy"] = "none"


Ride = Annotated[Union[RideOffer, RideRequest], Field(discriminator="type")]


class RideOfferCreate(BaseModel):
    model_config = _config

    type: Literal["offer"] = "offer"
    content: str
    from_location: str
    to_location: str
    purpose: Literal["shopping", "flight", "college_event", "other"]
    date: date
    time: Optional[str] = None
    flexible: bool = True
    prefers_women: bool = False
    seats_total: int
    storage_capacity: Literal["none", "half", "full"] = "half"
    no_payment_needed: bool = False


class RideRequestCreate(BaseModel):
    model_config = _config

    type: Literal["request"] = "request"
    content: str
    from_location: str
    to_location: str
    purpose: Literal["shopping", "flight", "college_event", "other"]
    date: date
    time: Optional[str] = None
    flexible: bool = True
    prefers_women: bool = False
    luggage: Literal["none", "light", "medium", "heavy"] = "none"


PostCreate = Annotated[Union[RideOfferCreate, RideRequestCreate], Field(discriminator="type")]


class PostUpdate(BaseModel):
    """
    Allowlist of fields the post's author may update via PATCH /posts/{post_id}.

    Identity fields (author_id, type, school), engagement counters (likes,
    comments, liked_by, interested_by), and pricing (gas_cost) are not
    user-editable.
    """
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        serialize_by_alias=True,
        extra="forbid",
    )

    status: Optional[Literal["open", "closed"]] = None
    content: Optional[str] = None
    from_location: Optional[str] = None
    to_location: Optional[str] = None
    date: Optional[date] = None
    time: Optional[str] = None
    flexible: Optional[bool] = None
    prefers_women: Optional[bool] = None
