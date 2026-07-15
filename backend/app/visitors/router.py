import secrets
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.crud_base import CRUDBase
from app.db.database import get_db
from app.dependencies.auth import get_current_active_user
from app.models.visitor import Visitor
from app.schemas.visitor import VisitorCreate, VisitorOut, VisitorUpdate

router = APIRouter(dependencies=[Depends(get_current_active_user)])
crud = CRUDBase[Visitor, VisitorCreate, VisitorUpdate](Visitor)

def _generate_pass_code() -> str:
    return secrets.token_hex(4).upper()

@router.get("/", response_model=list[VisitorOut])
def list_visitors(skip: int = 0, limit: int = 200, db: Session = Depends(get_db)):
    return crud.get_multi(db, skip, limit)

@router.get("/{visitor_id}", response_model=VisitorOut)
def get_visitor(visitor_id: int, db: Session = Depends(get_db)):
    visitor = crud.get(db, visitor_id)
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    return visitor

@router.post("/", response_model=VisitorOut, status_code=status.HTTP_201_CREATED)
def create_visitor(payload: VisitorCreate, db: Session = Depends(get_db)):
    return crud.create(db, payload, pass_code=_generate_pass_code())

@router.put("/{visitor_id}", response_model=VisitorOut)
def update_visitor(visitor_id: int, payload: VisitorUpdate, db: Session = Depends(get_db)):
    visitor = crud.get(db, visitor_id)
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    return crud.update(db, visitor, payload)

@router.patch("/{visitor_id}/approve", response_model=VisitorOut)
def approve_visitor(visitor_id: int, db: Session = Depends(get_db)):
    visitor = crud.get(db, visitor_id)
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    visitor.status = "Active"
    db.add(visitor); db.commit(); db.refresh(visitor)
    return visitor

@router.patch("/{visitor_id}/deny", response_model=VisitorOut)
def deny_visitor(visitor_id: int, db: Session = Depends(get_db)):
    visitor = crud.get(db, visitor_id)
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    visitor.status = "Denied"
    db.add(visitor); db.commit(); db.refresh(visitor)
    return visitor

@router.patch("/{visitor_id}/check-in", response_model=VisitorOut)
def check_in_visitor(visitor_id: int, db: Session = Depends(get_db)):
    visitor = crud.get(db, visitor_id)
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    visitor.status = "Checked In"
    visitor.checked_in_at = datetime.now(timezone.utc)
    db.add(visitor); db.commit(); db.refresh(visitor)
    return visitor

@router.patch("/{visitor_id}/check-out", response_model=VisitorOut)
def check_out_visitor(visitor_id: int, db: Session = Depends(get_db)):
    visitor = crud.get(db, visitor_id)
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    visitor.status = "Checked Out"
    visitor.checked_out_at = datetime.now(timezone.utc)
    db.add(visitor); db.commit(); db.refresh(visitor)
    return visitor

@router.delete("/{visitor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_visitor(visitor_id: int, db: Session = Depends(get_db)):
    visitor = crud.get(db, visitor_id)
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    crud.remove(db, visitor)
