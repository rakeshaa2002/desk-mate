from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class BookingCreate(BaseModel):
    workspace_id: int
    start_date: date
    end_date: date

class BookingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    member_id: int
    workspace_id: int
    invoice_id: Optional[int] = None
    start_date: date
    end_date: date
    amount: float
    status: str
    created_at: datetime
    workspace_name: Optional[str] = None
