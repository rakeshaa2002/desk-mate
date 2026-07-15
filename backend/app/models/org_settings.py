from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class OrgSettings(Base):
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenant.id"), unique=True, nullable=True)
    org_name = Column(String, nullable=True)
    support_email = Column(String, nullable=True)
    currency = Column(String, default="INR")
    gst_rate = Column(Float, default=0.18)

    tenant = relationship("Tenant", backref="settings", uselist=False)
