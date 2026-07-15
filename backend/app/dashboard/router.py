from fastapi import APIRouter, Depends
from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.auth import get_current_active_user
from app.models.audit_log import AuditLog
from app.models.billing import Invoice
from app.models.member import Member
from app.models.tenant import Tenant
from app.models.workspace import Workspace

router = APIRouter(dependencies=[Depends(get_current_active_user)])

@router.get("/")
def dashboard_overview(db: Session = Depends(get_db)):
    total_members = db.query(func.count(Member.id)).scalar()
    active_members = db.query(func.count(Member.id)).filter(Member.status == "active").scalar()
    total_tenants = db.query(func.count(Tenant.id)).scalar()
    total_workspaces = db.query(func.count(Workspace.id)).scalar()
    occupied_workspaces = db.query(func.count(Workspace.id)).filter(Workspace.status == "Occupied").scalar()
    monthly_revenue = (
        db.query(func.coalesce(func.sum(Invoice.amount), 0))
        .filter(Invoice.status == "Paid")
        .scalar()
    )
    recent_activity = (
        db.query(AuditLog)
        .order_by(desc(AuditLog.timestamp))
        .limit(10)
        .all()
    )
    return {
        "kpis": {
            "total_members": total_members,
            "active_members": active_members,
            "total_tenants": total_tenants,
            "total_workspaces": total_workspaces,
            "occupied_workspaces": occupied_workspaces,
            "occupancy_rate": round((occupied_workspaces / total_workspaces) * 100, 1) if total_workspaces else 0,
            "monthly_revenue": float(monthly_revenue),
        },
        "recent_activity": [
            {
                "id": log.id,
                "action": log.action,
                "user": log.actor,
                "time": log.timestamp.isoformat() if log.timestamp else None,
            }
            for log in recent_activity
        ],
    }
