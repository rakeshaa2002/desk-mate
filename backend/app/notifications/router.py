from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.auth import get_current_active_user
from app.models.notification import NotificationSetting
from app.schemas.notification import NotificationSettingOut, NotificationSettingUpdate

router = APIRouter(dependencies=[Depends(get_current_active_user)])

_DEFAULT_CHANNELS = [
    ("email", "Email"), ("sms", "SMS"), ("whatsapp", "WhatsApp"), ("push", "Push Notification"),
]
_DEFAULT_TRIGGERS = [
    ("membership_expiry", "Membership Expiry"),
    ("renewal_reminder", "Renewal Reminder"),
    ("successful_payment", "Successful Payment"),
    ("payment_failure", "Payment Failure"),
    ("biometric_failure", "Biometric Failure"),
    ("access_granted", "Access Granted"),
    ("access_denied", "Access Denied"),
]

def _ensure_seeded(db: Session) -> None:
    if db.query(NotificationSetting).count() > 0:
        return
    rows = [
        NotificationSetting(category="channel", key=key, label=label, enabled=True)
        for key, label in _DEFAULT_CHANNELS
    ] + [
        NotificationSetting(category="trigger", key=key, label=label, enabled=True)
        for key, label in _DEFAULT_TRIGGERS
    ]
    db.add_all(rows)
    db.commit()

@router.get("/", response_model=list[NotificationSettingOut])
def list_notification_settings(db: Session = Depends(get_db)):
    _ensure_seeded(db)
    return db.query(NotificationSetting).all()

@router.put("/{setting_id}", response_model=NotificationSettingOut)
def update_notification_setting(setting_id: int, payload: NotificationSettingUpdate, db: Session = Depends(get_db)):
    setting = db.query(NotificationSetting).filter(NotificationSetting.id == setting_id).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Notification setting not found")
    setting.enabled = payload.enabled
    db.add(setting)
    db.commit()
    db.refresh(setting)
    return setting
