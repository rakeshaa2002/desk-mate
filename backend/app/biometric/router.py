from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.db.crud_base import CRUDBase
from app.db.database import get_db
from app.dependencies.auth import get_current_active_user
from app.enroll_link.router import create_enrollment_link
from app.models.biometric import AccessLog, EnrolledMember
from app.models.member import Member
from app.schemas.biometric import (
    AccessLogCreate, AccessLogOut,
    EnrolledMemberCreate, EnrolledMemberOut, EnrolledMemberUpdate,
)
from app.schemas.enroll_link import EnrollmentLinkCreate, EnrollmentLinkOut

router = APIRouter(dependencies=[Depends(get_current_active_user)])
enrolled_crud = CRUDBase[EnrolledMember, EnrolledMemberCreate, EnrolledMemberUpdate](EnrolledMember)
log_crud = CRUDBase[AccessLog, AccessLogCreate, AccessLogCreate](AccessLog)

def _display_status(status_value: str | None) -> str | None:
    if not status_value:
        return None
    return status_value.replace("_", " ").title()

def _enrolled_to_out(enrolled: EnrolledMember) -> EnrolledMemberOut:
    out = EnrolledMemberOut.model_validate(enrolled)
    if enrolled.member:
        out.member_name = f"{enrolled.member.first_name} {enrolled.member.last_name}".strip()
        out.member_email = enrolled.member.email
        out.member_status = _display_status(enrolled.member.status)
    return out

def _log_to_out(log: AccessLog) -> AccessLogOut:
    out = AccessLogOut.model_validate(log)
    if log.member:
        out.member_name = f"{log.member.first_name} {log.member.last_name}".strip()
        out.member_email = log.member.email
    return out

@router.get("/enrolled", response_model=list[EnrolledMemberOut])
def list_enrolled(db: Session = Depends(get_db)):
    rows = db.query(EnrolledMember).order_by(desc(EnrolledMember.enrolled_at)).all()
    return [_enrolled_to_out(r) for r in rows]

@router.post("/enrolled", response_model=EnrolledMemberOut, status_code=status.HTTP_201_CREATED)
def enroll_member(payload: EnrolledMemberCreate, db: Session = Depends(get_db)):
    existing = db.query(EnrolledMember).filter(EnrolledMember.member_id == payload.member_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="This member is already enrolled")
    enrolled = enrolled_crud.create(db, payload)
    return _enrolled_to_out(enrolled)

@router.put("/enrolled/{enrolled_id}", response_model=EnrolledMemberOut)
def update_enrollment(enrolled_id: int, payload: EnrolledMemberUpdate, db: Session = Depends(get_db)):
    enrolled = enrolled_crud.get(db, enrolled_id)
    if not enrolled:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return _enrolled_to_out(enrolled_crud.update(db, enrolled, payload))

@router.delete("/enrolled/{enrolled_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_enrollment(enrolled_id: int, db: Session = Depends(get_db)):
    enrolled = enrolled_crud.get(db, enrolled_id)
    if not enrolled:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    enrolled_crud.remove(db, enrolled)

@router.get("/logs", response_model=list[AccessLogOut])
def list_access_logs(skip: int = 0, limit: int = 200, db: Session = Depends(get_db)):
    rows = (
        db.query(AccessLog)
        .order_by(desc(AccessLog.time))
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [_log_to_out(r) for r in rows]

@router.post("/logs", response_model=AccessLogOut, status_code=status.HTTP_201_CREATED)
def create_access_log(payload: AccessLogCreate, db: Session = Depends(get_db)):
    log = log_crud.create(db, payload)
    return _log_to_out(log)

@router.delete("/logs/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_access_log(log_id: int, db: Session = Depends(get_db)):
    log = log_crud.get(db, log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Access log not found")
    log_crud.remove(db, log)

@router.post("/enrollment-links", response_model=EnrollmentLinkOut, status_code=status.HTTP_201_CREATED)
def generate_enrollment_link(payload: EnrollmentLinkCreate, db: Session = Depends(get_db)):
    member = db.query(Member).filter(Member.id == payload.member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    token = create_enrollment_link(payload.member_id)
    return EnrollmentLinkOut(token=token)
