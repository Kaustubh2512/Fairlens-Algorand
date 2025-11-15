from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from contextlib import asynccontextmanager

from app.database import engine, Base
from app.routes import auth, tenders, contracts, milestones, payments, nft, wallet, admin
from app.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up FairLens backend...")
    # Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created/verified")
    yield
    # Shutdown
    logger.info("Shutting down FairLens backend...")


app = FastAPI(
    title="FairLens API",
    description="Blockchain-Based Transparent Tender Management System",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(tenders.router, prefix="/api/tenders", tags=["Tenders"])
app.include_router(contracts.router, prefix="/api/contracts", tags=["Contracts"])
app.include_router(milestones.router, prefix="/api/milestones", tags=["Milestones"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(nft.router, prefix="/api/nft", tags=["NFT"])
app.include_router(wallet.router, prefix="/api/wallet", tags=["Wallet"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])

# Import blockchain router
from app.routes import blockchain
app.include_router(blockchain.router, prefix="/api/blockchain", tags=["Blockchain"])


@app.get("/")
async def root():
    return {
        "message": "FairLens API - Blockchain-Based Tender Management System",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": "2025-01-01T00:00:00Z"
    }


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

