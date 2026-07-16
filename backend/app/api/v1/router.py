from fastapi import APIRouter
from app.auth.router import router as auth_router
from app.dashboard.router import router as dashboard_router
from app.members.router import router as members_router
from app.tenants.router import router as tenants_router
from app.subscriptions.router import router as subscriptions_router
from app.workspaces.router import router as workspaces_router
from app.attendance.router import router as attendance_router
from app.billing.router import router as billing_router
from app.visitors.router import router as visitors_router
from app.reports.router import router as reports_router
from app.notifications.router import router as notifications_router
from app.biometric.router import router as biometric_router
from app.staff.router import router as staff_router
from app.roles.router import router as roles_router
from app.audit_logs.router import router as audit_logs_router
from app.settings.router import router as settings_router
from app.bookings.router import router as bookings_router
from app.webauthn.router import router as webauthn_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(members_router, prefix="/members", tags=["Members"])
api_router.include_router(tenants_router, prefix="/tenants", tags=["Tenants"])
api_router.include_router(subscriptions_router, prefix="/subscriptions", tags=["Subscriptions"])
api_router.include_router(workspaces_router, prefix="/workspaces", tags=["Workspaces"])
api_router.include_router(attendance_router, prefix="/attendance", tags=["Attendance"])
api_router.include_router(billing_router, prefix="/billing", tags=["Billing"])
api_router.include_router(visitors_router, prefix="/visitors", tags=["Visitors"])
api_router.include_router(reports_router, prefix="/reports", tags=["Reports"])
api_router.include_router(notifications_router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(biometric_router, prefix="/biometric", tags=["Biometric Integration"])
api_router.include_router(staff_router, prefix="/staff", tags=["Staff"])
api_router.include_router(roles_router, prefix="/roles", tags=["Roles"])
api_router.include_router(audit_logs_router, prefix="/audit-logs", tags=["Audit Logs"])
api_router.include_router(settings_router, prefix="/settings", tags=["Settings"])
api_router.include_router(bookings_router, prefix="/bookings", tags=["Bookings"])
api_router.include_router(webauthn_router, prefix="/webauthn", tags=["WebAuthn"])
