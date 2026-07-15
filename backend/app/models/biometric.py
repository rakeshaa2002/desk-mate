from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class EnrolledMember(Base):
    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("member.id"), unique=True, nullable=False)
    methods = Column(JSON, default=list)  # ["Fingerprint", "Face"]
    status = Column(String, default="active")
    enrolled_at = Column(DateTime(timezone=True), server_default=func.current_timestamp())

    member = relationship("Member", backref="biometric_enrollment", uselist=False)


class AccessLog(Base):
    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("member.id"), nullable=True)
    time = Column(DateTime(timezone=True), server_default=func.current_timestamp())
    method = Column(String, nullable=True)  # Fingerprint, Face
    door = Column(String, nullable=True)
    member_status = Column(String, nullable=True)  # Active, Expired, Suspended, Unknown
    result = Column(String, nullable=False)  # Granted, Denied - Expired, Failed, Denied - Suspended

    member = relationship("Member", backref="access_logs")
