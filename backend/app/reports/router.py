from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.auth import get_current_active_user
from app.models.attendance import Attendance
from app.models.billing import Invoice
from app.models.member import Member
from app.models.subscription import Subscription
from app.models.visitor import Visitor
from app.models.workspace import Workspace

router = APIRouter(dependencies=[Depends(get_current_active_user)])

@router.get("/revenue")
def revenue_report(db: Session = Depends(get_db)):
    rows = (
        db.query(
            func.to_char(Invoice.date, "YYYY-MM").label("month"),
            func.sum(Invoice.amount).label("revenue"),
        )
        .filter(Invoice.status == "Paid")
        .group_by("month")
        .order_by("month")
        .all()
    )
    subs_rows = dict(
        db.query(
            func.to_char(Subscription.start_date, "YYYY-MM").label("month"),
            func.count(Subscription.id),
        ).group_by("month").all()
    )
    members_rows = dict(
        db.query(
            func.to_char(Member.created_at, "YYYY-MM").label("month"),
            func.count(Member.id),
        ).group_by("month").all()
    )
    return [
        {
            "month": r.month,
            "revenue": float(r.revenue or 0),
            "subscriptions": subs_rows.get(r.month, 0),
            "newMembers": members_rows.get(r.month, 0),
        }
        for r in rows
    ]

@router.get("/occupancy")
def occupancy_report(db: Session = Depends(get_db)):
    workspaces = db.query(Workspace).all()
    by_type: dict[str, dict[str, int]] = {}
    for ws in workspaces:
        bucket = by_type.setdefault(ws.type, {"total": 0, "occupied": 0})
        bucket["total"] += 1
        if ws.status == "Occupied":
            bucket["occupied"] += 1
    return [
        {
            "name": name,
            "occupied": counts["occupied"],
            "total": counts["total"],
            "pct": round((counts["occupied"] / counts["total"]) * 100, 1) if counts["total"] else 0,
        }
        for name, counts in by_type.items()
    ]

@router.get("/attendance")
def attendance_report(db: Session = Depends(get_db)):
    rows = (
        db.query(
            func.to_char(Attendance.date, "Dy").label("day"),
            func.count(Attendance.id).filter(Attendance.flag != "Absent").label("present"),
            func.count(Attendance.id).filter(Attendance.flag == "Absent").label("absent"),
        )
        .group_by("day")
        .all()
    )
    return [{"day": r.day, "present": r.present, "absent": r.absent} for r in rows]

@router.get("/membership")
def membership_report(db: Session = Depends(get_db)):
    rows = (
        db.query(Member.status, func.count(Member.id))
        .group_by(Member.status)
        .all()
    )
    return [{"status": status, "count": count} for status, count in rows]

@router.get("/subscription")
def subscription_report(db: Session = Depends(get_db)):
    rows = (
        db.query(Subscription.status, func.count(Subscription.id))
        .group_by(Subscription.status)
        .all()
    )
    return [{"status": status, "count": count} for status, count in rows]

@router.get("/payment")
def payment_report(db: Session = Depends(get_db)):
    rows = (
        db.query(Invoice.status, func.count(Invoice.id), func.sum(Invoice.amount))
        .group_by(Invoice.status)
        .all()
    )
    return [{"status": status, "count": count, "amount": float(amount or 0)} for status, count, amount in rows]

@router.get("/visitor")
def visitor_report(db: Session = Depends(get_db)):
    rows = (
        db.query(Visitor.status, func.count(Visitor.id))
        .group_by(Visitor.status)
        .all()
    )
    return [{"status": status, "count": count} for status, count in rows]
