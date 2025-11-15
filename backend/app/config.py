from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://user:password@localhost/fairlens"
    )
    
    # JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    
    # Algorand
    ALGOD_API_URL: str = os.getenv(
        "ALGOD_API_URL",
        "https://testnet-api.algonode.network"
    )
    ALGOD_API_KEY: str = os.getenv("ALGOD_API_KEY", "")
    ALGOD_INDEXER_URL: str = os.getenv(
        "ALGOD_INDEXER_URL",
        "https://testnet-idx.algonode.network"
    )
    ALGOD_INDEXER_KEY: str = os.getenv("ALGOD_INDEXER_KEY", "")
    PRIVATE_KEY_MNEMONIC: str = os.getenv("PRIVATE_KEY_MNEMONIC", "")
    
    # Test Wallets
    MAHARASHTRA_GOV_MNEMONIC: str = os.getenv("MAHARASHTRA_GOV_MNEMONIC", "")
    CONTRACTOR_1_MNEMONIC: str = os.getenv("CONTRACTOR_1_MNEMONIC", "")
    CONTRACTOR_2_MNEMONIC: str = os.getenv("CONTRACTOR_2_MNEMONIC", "")
    
    # IPFS (for NFT metadata)
    IPFS_API_URL: str = os.getenv("IPFS_API_URL", "https://ipfs.infura.io:5001")
    IPFS_PROJECT_ID: str = os.getenv("IPFS_PROJECT_ID", "")
    IPFS_PROJECT_SECRET: str = os.getenv("IPFS_PROJECT_SECRET", "")
    IPFS_GATEWAY: str = os.getenv("IPFS_GATEWAY", "https://ipfs.io/ipfs/")
    
    # Network (testnet/mainnet)
    ALGORAND_NETWORK: str = os.getenv("ALGORAND_NETWORK", "testnet")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    
    # Application
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()