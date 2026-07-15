from sqlalchemy import Column, Integer, String, Float, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class Invoice(Base):
    id = Column(Integer, primary_key=True, index=True)
    invoice_no = Column(String, unique=True, index=True, nullable=False)
    member_id = Column(Integer, ForeignKey("member.id"), nullable=False)
    plan = Column(String, nullable=True)
    amount = Column(Float, nullable=False)
    gst = Column(Float, default=0.0)
    date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=True)
    status = Column(String, default="Pending")  # Paid, Pending, Overdue, Draft
    created_at = Column(DateTime(timezone=True), server_default=func.current_timestamp())
    updated_at = Column(DateTime(timezone=True), onupdate=func.current_timestamp())

    member = relationship("Member", backref="invoices")
