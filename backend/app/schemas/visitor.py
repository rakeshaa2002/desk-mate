from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class VisitorBase(BaseModel):
    name: str
    email: Optional[str] = None
    mobile: Optional[str] = None
    company: Optional[str] = None
    host_member_id: Optional[int] = None
    purpose: Optional[str] = None
    eta: Optional[datetime] = None
    date: date
    status: Optional[str] = "Pending Approval"

class VisitorCreate(VisitorBase):
    pass

class VisitorUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    mobile: Optional[str] = None
    company: Optional[str] = None
    host_member_id: Optional[int] = None
    purpose: Optional[str] = None
    eta: Optional[datetime] = None
    status: Optional[str] = None

class VisitorOut(VisitorBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    pass_code: Optional[str] = None
    checked_in_at: Optional[datetime] = None
    checked_out_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
