from sqlalchemy import Column, Integer, String, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class Visitor(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    mobile = Column(String, nullable=True)
    company = Column(String, nullable=True)
    host_member_id = Column(Integer, ForeignKey("member.id"), nullable=True)
    purpose = Column(String, nullable=True)
    eta = Column(DateTime(timezone=True), nullable=True)
    date = Column(Date, nullable=False)
    status = Column(String, default="Pending Approval")  # Pending Approval, Active, Checked In, Checked Out, Denied
    pass_code = Column(String, unique=True, index=True, nullable=True)
    checked_in_at = Column(DateTime(timezone=True), nullable=True)
    checked_out_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.current_timestamp())
    updated_at = Column(DateTime(timezone=True), onupdate=func.current_timestamp())

    host = relationship("Member", backref="hosted_visitors")
