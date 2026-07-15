from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class NotificationSetting(Base):
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenant.id"), nullable=True)
    category = Column(String, nullable=False)  # channel, trigger
    key = Column(String, nullable=False)  # email, sms, whatsapp, push, membership_expiry, ...
    label = Column(String, nullable=True)
    enabled = Column(Boolean, default=True)

    tenant = relationship("Tenant", backref="notification_settings")
