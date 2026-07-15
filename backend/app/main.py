# Backend Application Entry Point
# pyrefly: ignore [missing-import]
from fastapi import FastAPI
from app.core.config import settings
from app.api.v1.router import api_router
from app.middleware.cors import setup_cors
from app.core.exceptions import setup_exception_handlers
# pyrefly: ignore [missing-import]
from loguru import logger

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)


# Setup CORS
setup_cors(app)

# Setup Global Exception Handlers
setup_exception_handlers(app)

# Include main router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["Health"])
def health_check():
    logger.info("Health check endpoint accessed")
    return {"status": "ok", "version": settings.VERSION}
