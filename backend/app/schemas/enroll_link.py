from pydantic import BaseModel

class EnrollmentLinkCreate(BaseModel):
    member_id: int

class EnrollmentLinkOut(BaseModel):
    token: str

class EnrollmentLinkInfo(BaseModel):
    member_name: str
    member_email: str
