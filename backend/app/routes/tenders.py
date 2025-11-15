from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from typing import List, Optional
from app.database import get_db
from app.models.user import User, UserRole
from app.models.tender import Tender, TenderStatus
from app.models.application import Application
from app.schemas.tender import TenderCreate, TenderResponse
from app.schemas.application import ApplicationCreate, ApplicationResponse
from app.utils.auth import get_current_active_user
import hashlib
import json

router = APIRouter()


@router.post("/create", response_model=TenderResponse, status_code=status.HTTP_201_CREATED)
async def create_tender(
    tender_data: TenderCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new tender (Government only)"""
    if current_user.role != UserRole.GOVERNMENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only government users can create tenders"
        )
    
    # Create blockchain hash (simplified - in production, use actual blockchain)
    tender_json = json.dumps({
        "title": tender_data.title,
        "budget": str(tender_data.budget),
        "deadline": tender_data.deadline.isoformat(),
        "gov_id": current_user.id
    }, sort_keys=True)
    blockchain_hash = hashlib.sha256(tender_json.encode()).hexdigest()
    
    # Create tender
    tender_dict = tender_data.model_dump()
    new_tender = Tender(
        **tender_dict,
        gov_id=current_user.id,
        status=TenderStatus.ACTIVE,
        blockchain_hash=f"0x{blockchain_hash}"
    )
    
    db.add(new_tender)
    await db.commit()
    await db.refresh(new_tender)
    
    return new_tender


@router.get("/", response_model=List[TenderResponse])
async def list_tenders(
    status_filter: Optional[TenderStatus] = Query(None, alias="status"),
    category: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """List all tenders (public endpoint)"""
    query = select(Tender)
    
    if status_filter:
        query = query.where(Tender.status == status_filter)
    if category:
        query = query.where(Tender.category == category)
    
    query = query.offset(skip).limit(limit).order_by(Tender.created_at.desc())
    
    result = await db.execute(query)
    tenders = result.scalars().all()
    
    # Add applications count
    tender_responses = []
    for tender in tenders:
        app_count_result = await db.execute(
            select(func.count(Application.id)).where(Application.tender_id == tender.id)
        )
        app_count = app_count_result.scalar() or 0
        tender_dict = {
        "id": tender.id,
        "title": tender.title,
        "description": tender.description,
        "location": tender.location,
        "category": tender.category,
        "budget": tender.budget,
        "deadline": tender.deadline,
        "start_date": tender.start_date,
        "duration_months": tender.duration_months,
        "status": tender.status,
        "gov_id": tender.gov_id,
        "blockchain_hash": tender.blockchain_hash,
        "created_at": tender.created_at,
        "applications_count": app_count
    }
    tender_responses.append(TenderResponse(**tender_dict))
    
    return tender_responses


@router.get("/{tender_id}", response_model=TenderResponse)
async def get_tender(tender_id: int, db: AsyncSession = Depends(get_db)):
    """Get tender details"""
    result = await db.execute(select(Tender).where(Tender.id == tender_id))
    tender = result.scalar_one_or_none()
    
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tender not found"
        )
    
    # Get applications count
    app_count_result = await db.execute(
        select(func.count(Application.id)).where(Application.tender_id == tender.id)
    )
    app_count = app_count_result.scalar() or 0
    
    tender_dict = {
        "id": tender.id,
        "title": tender.title,
        "description": tender.description,
        "location": tender.location,
        "category": tender.category,
        "budget": tender.budget,
        "deadline": tender.deadline,
        "start_date": tender.start_date,
        "duration_months": tender.duration_months,
        "status": tender.status,
        "gov_id": tender.gov_id,
        "blockchain_hash": tender.blockchain_hash,
        "created_at": tender.created_at,
        "applications_count": app_count
    }
    return TenderResponse(**tender_dict)


@router.post("/{tender_id}/apply", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def apply_for_tender(
    tender_id: int,
    application_data: ApplicationCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Apply for a tender (Contractor only)"""
    if current_user.role != UserRole.CONTRACTOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only contractors can apply for tenders"
        )
    
    # Verify tender exists and is active
    result = await db.execute(select(Tender).where(Tender.id == tender_id))
    tender = result.scalar_one_or_none()
    
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tender not found"
        )
    
    if tender.status != TenderStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tender is not accepting applications"
        )
    
    # Check if already applied
    existing_app = await db.execute(
        select(Application).where(
            and_(
                Application.tender_id == tender_id,
                Application.contractor_id == current_user.id
            )
        )
    )
    if existing_app.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied for this tender"
        )
    
    # Create application
    app_dict = application_data.model_dump()
    new_application = Application(
        tender_id=tender_id,
        contractor_id=current_user.id,
        **app_dict
    )
    
    db.add(new_application)
    await db.commit()
    await db.refresh(new_application)
    
    return new_application


@router.post("/{tender_id}/select/{application_id}", response_model=ApplicationResponse)
async def select_contractor(
    tender_id: int,
    application_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Select a contractor for a tender (Government only)"""
    if current_user.role != UserRole.GOVERNMENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only government users can select contractors"
        )
    
    # Verify tender belongs to user
    tender_result = await db.execute(
        select(Tender).where(and_(Tender.id == tender_id, Tender.gov_id == current_user.id))
    )
    tender = tender_result.scalar_one_or_none()
    
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tender not found or you don't have permission"
        )
    
    # Get application
    app_result = await db.execute(
        select(Application).where(
            and_(
                Application.id == application_id,
                Application.tender_id == tender_id
            )
        )
    )
    application = app_result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Update application status
    from app.models.application import ApplicationStatus
    application.status = ApplicationStatus.ACCEPTED
    
    # Reject other applications
    await db.execute(
        select(Application).where(
            and_(
                Application.tender_id == tender_id,
                Application.id != application_id
            )
        )
    )
    other_apps_result = await db.execute(
        select(Application).where(
            and_(
                Application.tender_id == tender_id,
                Application.id != application_id
            )
        )
    )
    other_apps = other_apps_result.scalars().all()
    for app in other_apps:
        from app.models.application import ApplicationStatus
        app.status = ApplicationStatus.REJECTED
    
    # Update tender status
    tender.status = TenderStatus.CLOSED
    
    await db.commit()
    await db.refresh(application)
    
    return application

