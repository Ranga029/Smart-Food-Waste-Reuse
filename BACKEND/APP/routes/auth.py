from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from APP.database import get_db
from APP.models.user import User
from APP.schemas.user_schema import UserCreate, UserResponse, LoginRequest

router = APIRouter(prefix="/auth", tags=["Authentication & Profiles"])

@router.post("/register", response_model=UserResponse)
def register_user(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.phone == payload.phone, User.role == payload.role).first()
    if existing:
        raise HTTPException(status_code=400, detail="Phone number is already registered for this role")

    email_value = payload.email or f"{payload.phone.replace('+', '')}@local.app"
    user = User(
        name=payload.name,
        email=email_value,
        role=payload.role,
        phone=payload.phone,
        latitude=payload.latitude,
        longitude=payload.longitude,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=UserResponse)
def login_user(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == payload.phone, User.role == payload.role).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account found for this phone number and role")
    return user

@router.get("/users", response_model=list[UserResponse])
def get_all_users(db: Session = Depends(get_db)):
    return db.query(User).all()