from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.auth.security import verify_password, get_password_hash, create_access_token
from app.db.database import get_db
from app.dependencies.auth import get_current_active_user
from app.models.member import Member
from app.schemas.auth import ProfileUpdate, RegisterRequest, Token
from app.schemas.member import MemberOut

router = APIRouter()

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(Member).filter(Member.email == payload.email).first():
        raise HTTPException(status_code=400, detail="A member with this email already exists")

    member = Member(
        first_name=payload.first_name,
        last_name=payload.last_name,
        email=payload.email,
        phone=payload.phone,
        role="member",
        status="active",
        hashed_password=get_password_hash(payload.password),
    )
    db.add(member)
    db.commit()
    db.refresh(member)

    access_token = create_access_token(subject=member.id)
    return Token(access_token=access_token)

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

@router.put("/me", response_model=MemberOut)
def update_current_user(
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: Member = Depends(get_current_active_user),
):
    if payload.new_password:
        if not payload.current_password or not verify_password(payload.current_password, current_user.hashed_password):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        current_user.hashed_password = get_password_hash(payload.new_password)

    if payload.email and payload.email != current_user.email:
        if db.query(Member).filter(Member.email == payload.email, Member.id != current_user.id).first():
            raise HTTPException(status_code=400, detail="A member with this email already exists")

    update_data = payload.model_dump(exclude_unset=True, exclude={"current_password", "new_password"})
    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user
