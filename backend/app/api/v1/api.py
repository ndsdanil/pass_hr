from fastapi import APIRouter
from app.api.v1 import auth, resume, billing, users

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(resume.router, prefix="/resume", tags=["resume"])
api_router.include_router(billing.router, prefix="/billing", tags=["billing"])
api_router.include_router(users.router, prefix="/users", tags=["users"]) 