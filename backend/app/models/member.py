from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class Member(Base):
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenant.id"), nullable=True)
    workspace_id = Column(Integer, ForeignKey("workspace.id"), nullable=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    company = Column(String, nullable=True)
    designation = Column(String, nullable=True)
    avatar = Column(String, nullable=True)
    plan = Column(String, nullable=True)
    membership_type = Column(String, nullable=True)
    subscription_start = Column(Date, nullable=True)
    subscription_end = Column(Date, nullable=True)
    role = Column(String, default="member")  # super_admin, org_admin, member
    status = Column(String, default="active")  # active, expired, suspended, pending_approval
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.current_timestamp())
    updated_at = Column(DateTime(timezone=True), onupdate=func.current_timestamp())

    tenant = relationship("Tenant", backref="members")
    workspace = relationship("Workspace", backref="members")
