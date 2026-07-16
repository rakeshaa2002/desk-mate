from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class WebAuthnCredential(Base):
    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("member.id"), nullable=False)
    credential_id = Column(String, unique=True, index=True, nullable=False)
    public_key = Column(String, nullable=False)
    sign_count = Column(Integer, default=0)
    method = Column(String, nullable=False)  # Fingerprint, Face (UX label chosen at enrollment)
    device_type = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    member = relationship("Member", backref="webauthn_credentials")
