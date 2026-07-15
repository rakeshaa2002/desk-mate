from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class AttendanceBase(BaseModel):
    member_id: int
    workspace_id: Optional[int] = None
    date: date
    check_in: datetime
    check_out: Optional[datetime] = None
    flag: Optional[str] = "On time"

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceUpdate(BaseModel):
    check_out: Optional[datetime] = None
    flag: Optional[str] = None

class AttendanceOut(AttendanceBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
