from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class WorkspaceBase(BaseModel):
    name: str
    type: str
    status: Optional[str] = "Available"
    capacity: int = 1
    price_per_month: float
    floor: Optional[str] = None
    amenities: List[str] = []
    tenant_id: Optional[int] = None
    is_active: bool = True

class WorkspaceCreate(WorkspaceBase):
    pass

class WorkspaceUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    capacity: Optional[int] = None
    price_per_month: Optional[float] = None
    floor: Optional[str] = None
    amenities: Optional[List[str]] = None
    tenant_id: Optional[int] = None
    is_active: Optional[bool] = None

class WorkspaceOut(WorkspaceBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
