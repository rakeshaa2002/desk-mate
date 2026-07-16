from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class EnrolledMemberBase(BaseModel):
    member_id: int
    methods: List[str] = []
    status: Optional[str] = "active"

class EnrolledMemberCreate(EnrolledMemberBase):
    pass

class EnrolledMemberUpdate(BaseModel):
    methods: Optional[List[str]] = None
    status: Optional[str] = None

class EnrolledMemberOut(EnrolledMemberBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    enrolled_at: datetime
    member_name: Optional[str] = None
    member_email: Optional[str] = None
    member_status: Optional[str] = None


class AccessLogBase(BaseModel):
    member_id: Optional[int] = None
    method: Optional[str] = None
    door: Optional[str] = None
    member_status: Optional[str] = None
    result: str

class AccessLogCreate(AccessLogBase):
    pass

class AccessLogOut(AccessLogBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    time: datetime
    member_name: Optional[str] = None
    member_email: Optional[str] = None
