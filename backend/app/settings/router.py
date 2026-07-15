from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.auth import get_current_active_user
from app.models.org_settings import OrgSettings
from app.schemas.settings import OrgSettingsOut, OrgSettingsUpdate

router = APIRouter(dependencies=[Depends(get_current_active_user)])

def _get_or_create(db: Session) -> OrgSettings:
    settings_row = db.query(OrgSettings).first()
    if not settings_row:
        settings_row = OrgSettings()
        db.add(settings_row)
        db.commit()
        db.refresh(settings_row)
    return settings_row

@router.get("/", response_model=OrgSettingsOut)
def get_settings(db: Session = Depends(get_db)):
    return _get_or_create(db)

@router.put("/", response_model=OrgSettingsOut)
def update_settings(payload: OrgSettingsUpdate, db: Session = Depends(get_db)):
    settings_row = _get_or_create(db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(settings_row, field, value)
    db.add(settings_row)
    db.commit()
    db.refresh(settings_row)
    return settings_row
