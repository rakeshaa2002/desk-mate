from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Date, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class Plan(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    period = Column(String, default="month")  # month, year
    period_label = Column(String, nullable=True)
    features = Column(JSON, default=list)
    popular = Column(Boolean, default=False)
    color = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.current_timestamp())
    updated_at = Column(DateTime(timezone=True), onupdate=func.current_timestamp())


class Subscription(Base):
    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("member.id"), nullable=False)
    plan_id = Column(Integer, ForeignKey("plan.id"), nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    amount = Column(Float, nullable=False)
    status = Column(String, default="Active")  # Active, Expired, Pending, Cancelled
    auto_renew = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.current_timestamp())
    updated_at = Column(DateTime(timezone=True), onupdate=func.current_timestamp())

    member = relationship("Member", backref="subscriptions")
    plan = relationship("Plan", backref="subscriptions")
