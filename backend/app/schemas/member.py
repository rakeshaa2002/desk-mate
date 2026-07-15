from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr

class MemberBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    designation: Optional[str] = None
    avatar: Optional[str] = None
    plan: Optional[str] = None
    membership_type: Optional[str] = None
    subscription_start: Optional[date] = None
    subscription_end: Optional[date] = None
    role: Optional[str] = "member"
    status: Optional[str] = "active"
    tenant_id: Optional[int] = None
    workspace_id: Optional[int] = None

class MemberCreate(MemberBase):
    password: str

class MemberUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    designation: Optional[str] = None
    avatar: Optional[str] = None
    plan: Optional[str] = None
    membership_type: Optional[str] = None
    subscription_start: Optional[date] = None
    subscription_end: Optional[date] = None
    role: Optional[str] = None
    status: Optional[str] = None
    tenant_id: Optional[int] = None
    workspace_id: Optional[int] = None
    password: Optional[str] = None

class MemberOut(MemberBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
