from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class AuditLogBase(BaseModel):
    actor: str
    action: str
    target: Optional[str] = None
    tenant_id: Optional[int] = None

class AuditLogCreate(AuditLogBase):
    pass

class AuditLogOut(AuditLogBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    timestamp: datetime
