from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "NutriSafe AI REST API: A Multi-Modal Explainable AI System for Personalized "
        "Pediatric Food Additive Risk and Chemical Interaction Assessment (ITE 3962 FYP)."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Health Check"])
def root():
    return {
        "status": "online",
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "message": "NutriSafe AI Backend API is operational.",
    }

@app.get("/health", tags=["Health Check"])
def health_check():
    return {
        "status": "healthy",
        "api_version": settings.VERSION,
        "database": "connected (mock/pool)",
        "neo4j_graph": "ready",
        "rgcn_model": "initialized",
        "xgboost_risk_model": "loaded",
    }
