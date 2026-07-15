from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class PlanBase(BaseModel):
    name: str
    price: float
    period: str = "month"
    period_label: Optional[str] = None
    features: List[str] = []
    popular: bool = False
    color: Optional[str] = None
    is_active: bool = True

class PlanCreate(PlanBase):
    pass

class PlanUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    period: Optional[str] = None
    period_label: Optional[str] = None
    features: Optional[List[str]] = None
    popular: Optional[bool] = None
    color: Optional[str] = None
    is_active: Optional[bool] = None

class PlanOut(PlanBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None


class SubscriptionBase(BaseModel):
    member_id: int
    plan_id: Optional[int] = None
    start_date: date
    end_date: Optional[date] = None
    amount: float
    status: Optional[str] = "Active"
    auto_renew: bool = False

class SubscriptionCreate(SubscriptionBase):
    pass

class SubscriptionUpdate(BaseModel):
    plan_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    amount: Optional[float] = None
    status: Optional[str] = None
    auto_renew: Optional[bool] = None

class SubscriptionOut(SubscriptionBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
