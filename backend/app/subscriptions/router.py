from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.crud_base import CRUDBase
from app.db.database import get_db
from app.dependencies.auth import get_current_active_user
from app.models.subscription import Plan, Subscription
from app.schemas.subscription import (
    PlanCreate, PlanOut, PlanUpdate,
    SubscriptionCreate, SubscriptionOut, SubscriptionUpdate,
)

router = APIRouter(dependencies=[Depends(get_current_active_user)])
plan_crud = CRUDBase[Plan, PlanCreate, PlanUpdate](Plan)
sub_crud = CRUDBase[Subscription, SubscriptionCreate, SubscriptionUpdate](Subscription)

@router.get("/plans", response_model=list[PlanOut])
def list_plans(db: Session = Depends(get_db)):
    return plan_crud.get_multi(db)

@router.post("/plans", response_model=PlanOut, status_code=status.HTTP_201_CREATED)
def create_plan(payload: PlanCreate, db: Session = Depends(get_db)):
    return plan_crud.create(db, payload)

@router.put("/plans/{plan_id}", response_model=PlanOut)
def update_plan(plan_id: int, payload: PlanUpdate, db: Session = Depends(get_db)):
    plan = plan_crud.get(db, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan_crud.update(db, plan, payload)

@router.delete("/plans/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plan(plan_id: int, db: Session = Depends(get_db)):
    plan = plan_crud.get(db, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    plan_crud.remove(db, plan)

@router.get("/", response_model=list[SubscriptionOut])
def list_subscriptions(skip: int = 0, limit: int = 200, db: Session = Depends(get_db)):
    return sub_crud.get_multi(db, skip, limit)

@router.get("/{subscription_id}", response_model=SubscriptionOut)
def get_subscription(subscription_id: int, db: Session = Depends(get_db)):
    sub = sub_crud.get(db, subscription_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return sub

@router.post("/", response_model=SubscriptionOut, status_code=status.HTTP_201_CREATED)
def create_subscription(payload: SubscriptionCreate, db: Session = Depends(get_db)):
    return sub_crud.create(db, payload)

@router.put("/{subscription_id}", response_model=SubscriptionOut)
def update_subscription(subscription_id: int, payload: SubscriptionUpdate, db: Session = Depends(get_db)):
    sub = sub_crud.get(db, subscription_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return sub_crud.update(db, sub, payload)

@router.delete("/{subscription_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subscription(subscription_id: int, db: Session = Depends(get_db)):
    sub = sub_crud.get(db, subscription_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    sub_crud.remove(db, sub)
