from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr

class OrgSettingsBase(BaseModel):
    org_name: Optional[str] = None
    support_email: Optional[EmailStr] = None
    currency: Optional[str] = "INR"
    gst_rate: Optional[float] = 0.18

class OrgSettingsUpdate(OrgSettingsBase):
    pass

class OrgSettingsOut(OrgSettingsBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    tenant_id: Optional[int] = None
