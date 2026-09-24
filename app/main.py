from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import cases, simulation, evaluation

app = FastAPI(
    title=settings.APP_NAME,
    description="Clinical simulation core for virtual patient roleplaying and 5-dimension attending OSCE scoring.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for local React/Vite development & production
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(cases.router, prefix=settings.API_PREFIX)
app.include_router(simulation.router, prefix=settings.API_PREFIX)
app.include_router(evaluation.router, prefix=settings.API_PREFIX)

@app.get("/api/health", tags=["System"])
def health_check():
    """Healthcheck endpoint for backend readiness verification."""
    from app.services.llm_factory import get_llm_provider
    provider = get_llm_provider()
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "provider": type(provider).__name__,
        "version": "1.0.0"
    }

@app.get("/", tags=["System"])
def root():
    return {
        "message": "InteractMD Clinical Patient Simulation Backend is active.",
        "documentation": "/docs",
        "health": "/api/health"
    }
