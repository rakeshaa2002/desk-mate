from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class InvoiceBase(BaseModel):
    member_id: int
    plan: Optional[str] = None
    amount: float
    gst: float = 0.0
    date: date
    due_date: Optional[date] = None
    status: Optional[str] = "Pending"

class InvoiceCreate(InvoiceBase):
    invoice_no: Optional[str] = None

class InvoiceUpdate(BaseModel):
    plan: Optional[str] = None
    amount: Optional[float] = None
    gst: Optional[float] = None
    due_date: Optional[date] = None
    status: Optional[str] = None

class InvoiceOut(InvoiceBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    invoice_no: str
    created_at: datetime
    updated_at: Optional[datetime] = None
