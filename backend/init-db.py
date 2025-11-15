import asyncio
import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.database import engine, Base
from app.models.user import User
from app.models.tender import Tender
from app.models.application import Application
from app.models.contract import Contract
from app.models.milestone import Milestone
from app.models.transaction import Transaction

async def init_db():
    """Initialize the database tables"""
    async with engine.begin() as conn:
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
        print("Database tables created successfully!")

if __name__ == "__main__":
    asyncio.run(init_db())