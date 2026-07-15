from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.security import get_password_hash
from app.db.crud_base import CRUDBase
from app.db.database import get_db
from app.dependencies.auth import get_current_active_user
from app.models.member import Member
from app.schemas.member import MemberCreate, MemberOut, MemberUpdate

router = APIRouter(dependencies=[Depends(get_current_active_user)])
crud = CRUDBase[Member, MemberCreate, MemberUpdate](Member)

@router.get("/", response_model=list[MemberOut])
def list_members(skip: int = 0, limit: int = 200, db: Session = Depends(get_db)):
    return crud.get_multi(db, skip, limit)

@router.get("/{member_id}", response_model=MemberOut)
def get_member(member_id: int, db: Session = Depends(get_db)):
    member = crud.get(db, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return member

@router.post("/", response_model=MemberOut, status_code=status.HTTP_201_CREATED)
def create_member(payload: MemberCreate, db: Session = Depends(get_db)):
    if db.query(Member).filter(Member.email == payload.email).first():
        raise HTTPException(status_code=400, detail="A member with this email already exists")
    data = payload.model_dump(exclude={"password"})
    member = Member(**data, hashed_password=get_password_hash(payload.password))
    db.add(member)
    db.commit()
    db.refresh(member)
    return member

@router.put("/{member_id}", response_model=MemberOut)
def update_member(member_id: int, payload: MemberUpdate, db: Session = Depends(get_db)):
    member = crud.get(db, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    update_data = payload.model_dump(exclude_unset=True, exclude={"password"})
    for field, value in update_data.items():
        setattr(member, field, value)
    if payload.password:
        member.hashed_password = get_password_hash(payload.password)
    db.add(member)
    db.commit()
    db.refresh(member)
    return member

@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_member(member_id: int, db: Session = Depends(get_db)):
    member = crud.get(db, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    crud.remove(db, member)
