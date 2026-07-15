from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.crud_base import CRUDBase
from app.db.database import get_db
from app.dependencies.auth import get_current_active_user
from app.models.biometric import AccessLog, EnrolledMember
from app.schemas.biometric import (
    AccessLogCreate, AccessLogOut,
    EnrolledMemberCreate, EnrolledMemberOut, EnrolledMemberUpdate,
)

router = APIRouter(dependencies=[Depends(get_current_active_user)])
enrolled_crud = CRUDBase[EnrolledMember, EnrolledMemberCreate, EnrolledMemberUpdate](EnrolledMember)
log_crud = CRUDBase[AccessLog, AccessLogCreate, AccessLogCreate](AccessLog)

@router.get("/enrolled", response_model=list[EnrolledMemberOut])
def list_enrolled(db: Session = Depends(get_db)):
    return enrolled_crud.get_multi(db)

@router.post("/enrolled", response_model=EnrolledMemberOut, status_code=status.HTTP_201_CREATED)
def enroll_member(payload: EnrolledMemberCreate, db: Session = Depends(get_db)):
    return enrolled_crud.create(db, payload)

@router.put("/enrolled/{enrolled_id}", response_model=EnrolledMemberOut)
def update_enrollment(enrolled_id: int, payload: EnrolledMemberUpdate, db: Session = Depends(get_db)):
    enrolled = enrolled_crud.get(db, enrolled_id)
    if not enrolled:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return enrolled_crud.update(db, enrolled, payload)

@router.delete("/enrolled/{enrolled_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_enrollment(enrolled_id: int, db: Session = Depends(get_db)):
    enrolled = enrolled_crud.get(db, enrolled_id)
    if not enrolled:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    enrolled_crud.remove(db, enrolled)

@router.get("/logs", response_model=list[AccessLogOut])
def list_access_logs(skip: int = 0, limit: int = 200, db: Session = Depends(get_db)):
    return log_crud.get_multi(db, skip, limit)

@router.post("/logs", response_model=AccessLogOut, status_code=status.HTTP_201_CREATED)
def create_access_log(payload: AccessLogCreate, db: Session = Depends(get_db)):
    return log_crud.create(db, payload)
