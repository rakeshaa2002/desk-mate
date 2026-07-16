import base64
import secrets
import time
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
from app.models.biometric import EnrolledMember
from app.models.member import Member
from app.models.webauthn_credential import WebAuthnCredential
from app.schemas.enroll_link import EnrollmentLinkInfo
from app.schemas.webauthn import WebAuthnRegisterOptionsRequest, WebAuthnRegisterVerifyRequest

# Public router: a person scanning this link on their own phone is not
# logged in, so none of these endpoints require auth. Access is instead
# gated by possession of the one-time token itself.
router = APIRouter()

_LINK_TTL_SECONDS = 600  # 10 minutes, one-time use
_CHALLENGE_TTL_SECONDS = 120

_links: dict[str, dict] = {}
_challenges: dict[str, tuple[bytes, float]] = {}

def create_enrollment_link(member_id: int) -> str:
    token = secrets.token_urlsafe(24)
    _links[token] = {"member_id": member_id, "created_at": time.time(), "used": False}
    return token

def _get_valid_link(token: str) -> dict:
    link = _links.get(token)
    if not link:
        raise HTTPException(status_code=404, detail="Invalid or expired enrollment link")
    if link["used"]:
        raise HTTPException(status_code=410, detail="This enrollment link has already been used")
    if time.time() - link["created_at"] > _LINK_TTL_SECONDS:
        raise HTTPException(status_code=410, detail="This enrollment link has expired")
    return link

@router.get("/{token}", response_model=EnrollmentLinkInfo)
def get_link_info(token: str, db: Session = Depends(get_db)):
    link = _get_valid_link(token)
    member = db.query(Member).filter(Member.id == link["member_id"]).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return EnrollmentLinkInfo(member_name=f"{member.first_name} {member.last_name}".strip(), member_email=member.email)

@router.post("/{token}/options")
def register_options(token: str, payload: WebAuthnRegisterOptionsRequest, db: Session = Depends(get_db)):
    link = _get_valid_link(token)
    member = db.query(Member).filter(Member.id == link["member_id"]).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    existing = db.query(WebAuthnCredential).filter(WebAuthnCredential.member_id == member.id).all()
    exclude_credentials = [
        PublicKeyCredentialDescriptor(id=webauthn.base64url_to_bytes(c.credential_id)) for c in existing
    ]

    options = webauthn.generate_registration_options(
        rp_id=settings.WEBAUTHN_RP_ID,
        rp_name=settings.WEBAUTHN_RP_NAME,
        user_id=str(member.id).encode(),
        user_name=member.email,
        user_display_name=f"{member.first_name} {member.last_name}".strip(),
        exclude_credentials=exclude_credentials,
        authenticator_selection=AuthenticatorSelectionCriteria(
            authenticator_attachment=AuthenticatorAttachment.PLATFORM,
            user_verification=UserVerificationRequirement.REQUIRED,
        ),
    )
    _challenges[token] = (options.challenge, time.time())
    return Response(content=webauthn.options_to_json(options), media_type="application/json")

@router.post("/{token}/verify")
def register_verify(token: str, payload: WebAuthnRegisterVerifyRequest, db: Session = Depends(get_db)):
    link = _get_valid_link(token)
    challenge_entry = _challenges.pop(token, None)
    if not challenge_entry:
        raise HTTPException(status_code=400, detail="No pending challenge found; please retry")
    challenge, created_at = challenge_entry
    if time.time() - created_at > _CHALLENGE_TTL_SECONDS:
        raise HTTPException(status_code=400, detail="Challenge expired; please retry")

    member = db.query(Member).filter(Member.id == link["member_id"]).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

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
        member_id=member.id,
        credential_id=webauthn.helpers.bytes_to_base64url(verification.credential_id),
        public_key=base64.b64encode(verification.credential_public_key).decode(),
        sign_count=verification.sign_count,
        method=payload.method,
        device_type=verification.credential_device_type,
    )
    db.add(credential)

    enrolled = db.query(EnrolledMember).filter(EnrolledMember.member_id == member.id).first()
    if enrolled:
        methods = set(enrolled.methods or [])
        methods.add(payload.method)
        enrolled.methods = list(methods)
        enrolled.status = "active"
        db.add(enrolled)
    else:
        db.add(EnrolledMember(member_id=member.id, methods=[payload.method], status="active"))

    link["used"] = True
    db.commit()
    return {"enrolled": True, "method": payload.method, "member_name": f"{member.first_name} {member.last_name}".strip()}
