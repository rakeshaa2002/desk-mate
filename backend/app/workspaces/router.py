from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.crud_base import CRUDBase
from app.db.database import get_db
from app.dependencies.auth import get_current_active_user
from app.models.workspace import Workspace
from app.schemas.workspace import WorkspaceCreate, WorkspaceOut, WorkspaceUpdate

router = APIRouter(dependencies=[Depends(get_current_active_user)])
crud = CRUDBase[Workspace, WorkspaceCreate, WorkspaceUpdate](Workspace)

_STATUS_CYCLE = ["Available", "Occupied", "Reserved", "Under Maintenance"]

@router.get("/", response_model=list[WorkspaceOut])
def list_workspaces(skip: int = 0, limit: int = 200, db: Session = Depends(get_db)):
    return crud.get_multi(db, skip, limit)

@router.get("/{workspace_id}", response_model=WorkspaceOut)
def get_workspace(workspace_id: int, db: Session = Depends(get_db)):
    workspace = crud.get(db, workspace_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return workspace

@router.post("/", response_model=WorkspaceOut, status_code=status.HTTP_201_CREATED)
def create_workspace(payload: WorkspaceCreate, db: Session = Depends(get_db)):
    return crud.create(db, payload)

@router.put("/{workspace_id}", response_model=WorkspaceOut)
def update_workspace(workspace_id: int, payload: WorkspaceUpdate, db: Session = Depends(get_db)):
    workspace = crud.get(db, workspace_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return crud.update(db, workspace, payload)

@router.patch("/{workspace_id}/cycle-status", response_model=WorkspaceOut)
def cycle_workspace_status(workspace_id: int, db: Session = Depends(get_db)):
    workspace = crud.get(db, workspace_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    current_index = _STATUS_CYCLE.index(workspace.status) if workspace.status in _STATUS_CYCLE else -1
    workspace.status = _STATUS_CYCLE[(current_index + 1) % len(_STATUS_CYCLE)]
    db.add(workspace)
    db.commit()
    db.refresh(workspace)
    return workspace

@router.delete("/{workspace_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workspace(workspace_id: int, db: Session = Depends(get_db)):
    workspace = crud.get(db, workspace_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    crud.remove(db, workspace)
