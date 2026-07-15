from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.auth.security import verify_password, create_access_token
from app.db.database import get_db
from app.dependencies.auth import get_current_active_user
from app.models.member import Member
from app.schemas.auth import Token
from app.schemas.member import MemberOut

router = APIRouter()

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(Member).filter(Member.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if user.status == "suspended":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account has been suspended")
    if user.status == "expired":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Membership has expired")

    access_token = create_access_token(subject=user.id)
    return Token(access_token=access_token)

@router.get("/me", response_model=MemberOut)
def read_current_user(current_user: Member = Depends(get_current_active_user)):
    return current_user
