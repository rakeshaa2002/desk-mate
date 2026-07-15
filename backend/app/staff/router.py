from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.security import get_password_hash
from app.db.crud_base import CRUDBase
from app.db.database import get_db
from app.dependencies.auth import get_current_active_user
from app.models.staff import Staff
from app.schemas.staff import StaffCreate, StaffOut, StaffUpdate

router = APIRouter(dependencies=[Depends(get_current_active_user)])
crud = CRUDBase[Staff, StaffCreate, StaffUpdate](Staff)

@router.get("/", response_model=list[StaffOut])
def list_staff(db: Session = Depends(get_db)):
    return crud.get_multi(db)

@router.get("/{staff_id}", response_model=StaffOut)
def get_staff(staff_id: int, db: Session = Depends(get_db)):
    member = crud.get(db, staff_id)
    if not member:
        raise HTTPException(status_code=404, detail="Staff member not found")
    return member

@router.post("/", response_model=StaffOut, status_code=status.HTTP_201_CREATED)
def create_staff(payload: StaffCreate, db: Session = Depends(get_db)):
    if db.query(Staff).filter(Staff.email == payload.email).first():
        raise HTTPException(status_code=400, detail="A staff member with this email already exists")
    data = payload.model_dump(exclude={"password"})
    hashed_password = get_password_hash(payload.password) if payload.password else None
    staff = Staff(**data, hashed_password=hashed_password)
    db.add(staff)
    db.commit()
    db.refresh(staff)
    return staff

@router.put("/{staff_id}", response_model=StaffOut)
def update_staff(staff_id: int, payload: StaffUpdate, db: Session = Depends(get_db)):
    staff = crud.get(db, staff_id)
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")
    update_data = payload.model_dump(exclude_unset=True, exclude={"password"})
    for field, value in update_data.items():
        setattr(staff, field, value)
    if payload.password:
        staff.hashed_password = get_password_hash(payload.password)
    db.add(staff)
    db.commit()
    db.refresh(staff)
    return staff

@router.delete("/{staff_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_staff(staff_id: int, db: Session = Depends(get_db)):
    staff = crud.get(db, staff_id)
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")
    crud.remove(db, staff)
