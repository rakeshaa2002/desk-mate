from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.crud_base import CRUDBase
from app.db.database import get_db
from app.dependencies.auth import get_current_active_user
from app.models.role import Role
from app.schemas.role import RoleCreate, RoleOut, RoleUpdate

router = APIRouter(dependencies=[Depends(get_current_active_user)])
crud = CRUDBase[Role, RoleCreate, RoleUpdate](Role)

_DEFAULT_ROLES = [
    ("Super Admin", ["All modules", "Billing", "Tenants", "Roles"]),
    ("Organization Admin", ["Members", "Workspaces", "Billing", "Reports"]),
    ("Receptionist", ["Visitors", "Check-in", "Attendance"]),
    ("Security", ["Biometric logs", "Access alerts"]),
    ("Accounts", ["Billing", "Payments", "Invoices"]),
    ("Support", ["Members read", "Tickets"]),
    ("Member", ["Own profile", "Own attendance", "Own invoices"]),
]

def _ensure_seeded(db: Session) -> None:
    if db.query(Role).count() > 0:
        return
    db.add_all(Role(name=name, permissions=permissions) for name, permissions in _DEFAULT_ROLES)
    db.commit()

@router.get("/", response_model=list[RoleOut])
def list_roles(db: Session = Depends(get_db)):
    _ensure_seeded(db)
    return crud.get_multi(db)

@router.get("/{role_id}", response_model=RoleOut)
def get_role(role_id: int, db: Session = Depends(get_db)):
    role = crud.get(db, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role

@router.post("/", response_model=RoleOut, status_code=status.HTTP_201_CREATED)
def create_role(payload: RoleCreate, db: Session = Depends(get_db)):
    return crud.create(db, payload)

@router.put("/{role_id}", response_model=RoleOut)
def update_role(role_id: int, payload: RoleUpdate, db: Session = Depends(get_db)):
    role = crud.get(db, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return crud.update(db, role, payload)

@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_role(role_id: int, db: Session = Depends(get_db)):
    role = crud.get(db, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    crud.remove(db, role)
