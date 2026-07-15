from typing import Optional
from pydantic import BaseModel, ConfigDict

class NotificationSettingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    category: str
    key: str
    label: Optional[str] = None
    enabled: bool

class NotificationSettingUpdate(BaseModel):
    enabled: bool
