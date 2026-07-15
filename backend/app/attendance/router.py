from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.crud_base import CRUDBase
from app.db.database import get_db
from app.dependencies.auth import get_current_active_user
from app.models.attendance import Attendance
from app.schemas.attendance import AttendanceCreate, AttendanceOut, AttendanceUpdate

router = APIRouter(dependencies=[Depends(get_current_active_user)])
crud = CRUDBase[Attendance, AttendanceCreate, AttendanceUpdate](Attendance)

@router.get("/", response_model=list[AttendanceOut])
def list_attendance(skip: int = 0, limit: int = 200, db: Session = Depends(get_db)):
    return crud.get_multi(db, skip, limit)

@router.get("/{attendance_id}", response_model=AttendanceOut)
def get_attendance(attendance_id: int, db: Session = Depends(get_db)):
    record = crud.get(db, attendance_id)
    if not record:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    return record

@router.post("/", response_model=AttendanceOut, status_code=status.HTTP_201_CREATED)
def check_in(payload: AttendanceCreate, db: Session = Depends(get_db)):
    return crud.create(db, payload)

@router.patch("/{attendance_id}/check-out", response_model=AttendanceOut)
def check_out(attendance_id: int, db: Session = Depends(get_db)):
    record = crud.get(db, attendance_id)
    if not record:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    if record.check_out:
        raise HTTPException(status_code=400, detail="Already checked out")
    record.check_out = datetime.now(timezone.utc)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

@router.delete("/{attendance_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attendance(attendance_id: int, db: Session = Depends(get_db)):
    record = crud.get(db, attendance_id)
    if not record:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    crud.remove(db, record)
