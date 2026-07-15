from fastapi import APIRouter, Depends, status
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.auth import get_current_active_user
from app.models.audit_log import AuditLog
from app.schemas.audit_log import AuditLogCreate, AuditLogOut

router = APIRouter(dependencies=[Depends(get_current_active_user)])

@router.get("/", response_model=list[AuditLogOut])
def list_audit_logs(skip: int = 0, limit: int = 200, db: Session = Depends(get_db)):
    return (
        db.query(AuditLog)
        .order_by(desc(AuditLog.timestamp))
        .offset(skip)
        .limit(limit)
        .all()
    )

@router.post("/", response_model=AuditLogOut, status_code=status.HTTP_201_CREATED)
def create_audit_log(payload: AuditLogCreate, db: Session = Depends(get_db)):
    log = AuditLog(**payload.model_dump())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log
