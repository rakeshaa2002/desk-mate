from sqlalchemy import Column, Integer, String, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class Attendance(Base):
    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("member.id"), nullable=False)
    workspace_id = Column(Integer, ForeignKey("workspace.id"), nullable=True)
    date = Column(Date, nullable=False)
    check_in = Column(DateTime(timezone=True), nullable=False)
    check_out = Column(DateTime(timezone=True), nullable=True)
    flag = Column(String, default="On time")  # On time, Late entry, Early exit, Absent, Overtime
    created_at = Column(DateTime(timezone=True), server_default=func.current_timestamp())

    member = relationship("Member", backref="attendance_records")
    workspace = relationship("Workspace", backref="attendance_records")
