from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class RoleBase(BaseModel):
    name: str
    permissions: List[str] = []
    tenant_id: Optional[int] = None

class RoleCreate(RoleBase):
    pass

class RoleUpdate(BaseModel):
    name: Optional[str] = None
    permissions: Optional[List[str]] = None

class RoleOut(RoleBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
