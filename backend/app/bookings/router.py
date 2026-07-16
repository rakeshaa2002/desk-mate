import uuid
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import and_
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.auth import get_current_active_user
from app.models.billing import Invoice
from app.models.booking import Booking
from app.models.member import Member
from app.models.workspace import Workspace
from app.schemas.booking import BookingCreate, BookingOut

router = APIRouter(dependencies=[Depends(get_current_active_user)])

_ACTIVE_STATUSES = ("Pending", "Confirmed")

def _generate_invoice_no() -> str:
    return f"INV-{uuid.uuid4().hex[:8].upper()}"

def _to_out(booking: Booking) -> BookingOut:
    out = BookingOut.model_validate(booking)
    out.workspace_name = booking.workspace.name if booking.workspace else None
    return out

@router.get("/", response_model=list[BookingOut])
def list_my_bookings(db: Session = Depends(get_db), current_user: Member = Depends(get_current_active_user)):
    bookings = (
        db.query(Booking)
        .filter(Booking.member_id == current_user.id)
        .order_by(Booking.start_date.desc())
        .all()
    )
    return [_to_out(b) for b in bookings]

@router.post("/", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
def create_booking(
    payload: BookingCreate,
    db: Session = Depends(get_db),
    current_user: Member = Depends(get_current_active_user),
):
    if payload.end_date < payload.start_date:
        raise HTTPException(status_code=400, detail="end_date cannot be before start_date")

    workspace = db.query(Workspace).filter(Workspace.id == payload.workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    overlap = (
        db.query(Booking)
        .filter(
            Booking.workspace_id == payload.workspace_id,
            Booking.status.in_(_ACTIVE_STATUSES),
            and_(Booking.start_date <= payload.end_date, Booking.end_date >= payload.start_date),
        )
        .first()
    )
    if overlap:
        raise HTTPException(status_code=409, detail="This workspace is already booked for the selected dates")

    days = (payload.end_date - payload.start_date).days + 1
    amount = round((workspace.price_per_month / 30) * days, 2)

    # Payment is simulated: no real payment gateway is configured yet, so the
    # invoice is created as already Paid. Swap this for a real gateway later.
    invoice = Invoice(
        invoice_no=_generate_invoice_no(),
        member_id=current_user.id,
        plan=f"Workspace Booking: {workspace.name}",
        amount=amount,
        gst=round(amount * 0.18, 2),
        date=date.today(),
        due_date=date.today(),
        status="Paid",
    )
    db.add(invoice)
    db.flush()

    booking = Booking(
        member_id=current_user.id,
        workspace_id=payload.workspace_id,
        invoice_id=invoice.id,
        start_date=payload.start_date,
        end_date=payload.end_date,
        amount=amount,
        status="Confirmed",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return _to_out(booking)

@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: Member = Depends(get_current_active_user),
):
    booking = (
        db.query(Booking)
        .filter(Booking.id == booking_id, Booking.member_id == current_user.id)
        .first()
    )
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.status not in _ACTIVE_STATUSES:
        raise HTTPException(status_code=400, detail="This booking cannot be cancelled")

    booking.status = "Cancelled"
    db.add(booking)
    db.commit()
