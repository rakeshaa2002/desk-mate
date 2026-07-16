from typing import Any, Dict, Literal
from pydantic import BaseModel

class WebAuthnRegisterOptionsRequest(BaseModel):
    method: Literal["Fingerprint", "Face"]

class WebAuthnRegisterVerifyRequest(BaseModel):
    method: Literal["Fingerprint", "Face"]
    credential: Dict[str, Any]

class WebAuthnAuthVerifyRequest(BaseModel):
    credential: Dict[str, Any]
