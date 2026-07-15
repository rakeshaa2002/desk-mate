from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class Workspace(Base):
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenant.id"), nullable=True)
    name = Column(String, index=True, nullable=False)
    type = Column(String, nullable=False)  # Private Cabin, Dedicated Desk, Hot Desk, Meeting Room, Conference Room, Event Space
    status = Column(String, default="Available")  # Available, Occupied, Reserved, Under Maintenance
    capacity = Column(Integer, default=1)
    price_per_month = Column(Float, nullable=False)
    floor = Column(String, nullable=True)
    amenities = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    tenant = relationship("Tenant", backref="workspaces")
