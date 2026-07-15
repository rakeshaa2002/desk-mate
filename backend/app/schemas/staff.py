from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr

class StaffBase(BaseModel):
    name: str
    email: EmailStr
    role: str
    status: Optional[str] = "Invited"
    tenant_id: Optional[int] = None

class StaffCreate(StaffBase):
    password: Optional[str] = None

class StaffUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    status: Optional[str] = None
    password: Optional[str] = None

class StaffOut(StaffBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    joined_date: datetime
