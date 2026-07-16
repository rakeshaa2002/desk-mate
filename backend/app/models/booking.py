from sqlalchemy import Column, Integer, String, Float, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class Booking(Base):
    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("member.id"), nullable=False)
    workspace_id = Column(Integer, ForeignKey("workspace.id"), nullable=False)
    invoice_id = Column(Integer, ForeignKey("invoice.id"), nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String, default="Confirmed")  # Pending, Confirmed, Cancelled, Completed
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    member = relationship("Member", backref="bookings")
    workspace = relationship("Workspace", backref="bookings")
    invoice = relationship("Invoice", backref="booking", uselist=False)
