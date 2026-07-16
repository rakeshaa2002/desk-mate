import base64
import time
from datetime import date, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
import webauthn
from webauthn.helpers.structs import (
    AuthenticatorSelectionCriteria,
    AuthenticatorAttachment,
    PublicKeyCredentialDescriptor,
    UserVerificationRequirement,
)

from app.core.config import settings
from app.db.database import get_db
from app.dependencies.auth import get_current_active_user
from app.models.attendance import Attendance
from app.models.biometric import AccessLog, EnrolledMember
from app.models.member import Member
from app.models.webauthn_credential import WebAuthnCredential
from app.schemas.webauthn import (
    WebAuthnAuthVerifyRequest,
    WebAuthnRegisterOptionsRequest,
    WebAuthnRegisterVerifyRequest,
)

router = APIRouter(dependencies=[Depends(get_current_active_user)])

# NOTE: challenges are short-lived (~2 min) and only need to survive the round trip
# between "options" and "verify". An in-memory store is fine for a single-process
# dev server; for a multi-worker/production deployment, move this to Redis
# (already configured via REDIS_URL) or a DB table with a TTL.
_CHALLENGE_TTL_SECONDS = 120
_challenges: dict[str, tuple[bytes, float]] = {}

def _store_challenge(key: str, challenge: bytes) -> None:
    _challenges[key] = (challenge, time.time())

def _pop_challenge(key: str) -> bytes:
    entry = _challenges.pop(key, None)
    if entry is None:
        raise HTTPException(status_code=400, detail="No pending challenge found; please retry")
    challenge, created_at = entry
    if time.time() - created_at > _CHALLENGE_TTL_SECONDS:
        raise HTTPException(status_code=400, detail="Challenge expired; please retry")
    return challenge

@router.get("/status")
def enrollment_status(
    current_user: Member = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    enrolled = db.query(EnrolledMember).filter(EnrolledMember.member_id == current_user.id).first()
    return {
        "enrolled": bool(enrolled and enrolled.methods),
        "methods": enrolled.methods if enrolled else [],
    }

@router.post("/register/options")
def register_options(
    payload: WebAuthnRegisterOptionsRequest,
    current_user: Member = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    existing = db.query(WebAuthnCredential).filter(WebAuthnCredential.member_id == current_user.id).all()
    exclude_credentials = [
        PublicKeyCredentialDescriptor(id=webauthn.base64url_to_bytes(c.credential_id)) for c in existing
    ]

    options = webauthn.generate_registration_options(
        rp_id=settings.WEBAUTHN_RP_ID,
        rp_name=settings.WEBAUTHN_RP_NAME,
        user_id=str(current_user.id).encode(),
        user_name=current_user.email,
        user_display_name=f"{current_user.first_name} {current_user.last_name}".strip(),
        exclude_credentials=exclude_credentials,
        authenticator_selection=AuthenticatorSelectionCriteria(
            authenticator_attachment=AuthenticatorAttachment.PLATFORM,
            user_verification=UserVerificationRequirement.REQUIRED,
        ),
    )
    _store_challenge(f"reg:{current_user.id}", options.challenge)
    return Response(content=webauthn.options_to_json(options), media_type="application/json")

@router.post("/register/verify")
def register_verify(
    payload: WebAuthnRegisterVerifyRequest,
    current_user: Member = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    challenge = _pop_challenge(f"reg:{current_user.id}")

    try:
        verification = webauthn.verify_registration_response(
            credential=payload.credential,
            expected_challenge=challenge,
            expected_rp_id=settings.WEBAUTHN_RP_ID,
            expected_origin=settings.WEBAUTHN_ORIGINS,
            require_user_verification=True,
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not verify registration: {exc}")

    credential = WebAuthnCredential(
        member_id=current_user.id,
        credential_id=webauthn.helpers.bytes_to_base64url(verification.credential_id),
        public_key=base64.b64encode(verification.credential_public_key).decode(),
        sign_count=verification.sign_count,
        method=payload.method,
        device_type=verification.credential_device_type,
    )
    db.add(credential)

    enrolled = db.query(EnrolledMember).filter(EnrolledMember.member_id == current_user.id).first()
    if enrolled:
        methods = set(enrolled.methods or [])
        methods.add(payload.method)
        enrolled.methods = list(methods)
        enrolled.status = "active"
        db.add(enrolled)
    else:
        db.add(EnrolledMember(member_id=current_user.id, methods=[payload.method], status="active"))

    db.commit()
    return {"enrolled": True, "method": payload.method}

@router.post("/checkin/options")
def checkin_options(
    current_user: Member = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    credentials = db.query(WebAuthnCredential).filter(WebAuthnCredential.member_id == current_user.id).all()
    if not credentials:
        raise HTTPException(status_code=400, detail="No biometric credential enrolled yet")

    allow_credentials = [
        PublicKeyCredentialDescriptor(id=webauthn.base64url_to_bytes(c.credential_id)) for c in credentials
    ]
    options = webauthn.generate_authentication_options(
        rp_id=settings.WEBAUTHN_RP_ID,
        allow_credentials=allow_credentials,
        user_verification=UserVerificationRequirement.REQUIRED,
    )
    _store_challenge(f"auth:{current_user.id}", options.challenge)
    return Response(content=webauthn.options_to_json(options), media_type="application/json")

@router.post("/checkin/verify")
def checkin_verify(
    payload: WebAuthnAuthVerifyRequest,
    current_user: Member = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    challenge = _pop_challenge(f"auth:{current_user.id}")

    credential_id = payload.credential.get("id")
    stored = (
        db.query(WebAuthnCredential)
        .filter(WebAuthnCredential.member_id == current_user.id, WebAuthnCredential.credential_id == credential_id)
        .first()
    )
    if not stored:
        raise HTTPException(status_code=400, detail="Unrecognized credential")

    try:
        verification = webauthn.verify_authentication_response(
            credential=payload.credential,
            expected_challenge=challenge,
            expected_rp_id=settings.WEBAUTHN_RP_ID,
            expected_origin=settings.WEBAUTHN_ORIGINS,
            credential_public_key=base64.b64decode(stored.public_key),
            credential_current_sign_count=stored.sign_count,
            require_user_verification=True,
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not verify check-in: {exc}")

    stored.sign_count = verification.new_sign_count
    db.add(stored)

    db.add(AccessLog(
        member_id=current_user.id,
        method=stored.method,
        door="Member Portal (mobile)",
        member_status=current_user.status,
        result="Granted",
    ))

    today = date.today()
    open_attendance = (
        db.query(Attendance)
        .filter(Attendance.member_id == current_user.id, Attendance.date == today, Attendance.check_out.is_(None))
        .first()
    )
    if open_attendance:
        open_attendance.check_out = datetime.now(timezone.utc)
        db.add(open_attendance)
        action = "check-out"
    else:
        db.add(Attendance(
            member_id=current_user.id,
            workspace_id=current_user.workspace_id,
            date=today,
            check_in=datetime.now(timezone.utc),
            flag="On time",
        ))
        action = "check-in"

    db.commit()
    return {"action": action, "time": datetime.now(timezone.utc).isoformat()}
