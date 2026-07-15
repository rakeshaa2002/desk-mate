from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.crud_base import CRUDBase
from app.db.database import get_db
from app.dependencies.auth import get_current_active_user
from app.models.tenant import Tenant
from app.schemas.tenant import TenantCreate, TenantOut, TenantUpdate

router = APIRouter(dependencies=[Depends(get_current_active_user)])
crud = CRUDBase[Tenant, TenantCreate, TenantUpdate](Tenant)

def _to_out(tenant: Tenant) -> TenantOut:
    out = TenantOut.model_validate(tenant)
    out.members_count = len(tenant.members)
    out.workspaces_assigned = len(tenant.workspaces)
    return out

@router.get("/", response_model=list[TenantOut])
def list_tenants(skip: int = 0, limit: int = 200, db: Session = Depends(get_db)):
    return [_to_out(t) for t in crud.get_multi(db, skip, limit)]

@router.get("/{tenant_id}", response_model=TenantOut)
def get_tenant(tenant_id: int, db: Session = Depends(get_db)):
    tenant = crud.get(db, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return _to_out(tenant)

@router.post("/", response_model=TenantOut, status_code=status.HTTP_201_CREATED)
def create_tenant(payload: TenantCreate, db: Session = Depends(get_db)):
    return _to_out(crud.create(db, payload))

@router.put("/{tenant_id}", response_model=TenantOut)
def update_tenant(tenant_id: int, payload: TenantUpdate, db: Session = Depends(get_db)):
    tenant = crud.get(db, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return _to_out(crud.update(db, tenant, payload))

@router.delete("/{tenant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tenant(tenant_id: int, db: Session = Depends(get_db)):
    tenant = crud.get(db, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    crud.remove(db, tenant)
