from sqlalchemy import Column, String, Float, JSON, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.db import Base
import uuid

class Session(Base):
    __tablename__ = "sessions"

    id         = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, server_default=func.now())

class Evaluation(Base):
    __tablename__ = "evaluations"

    id         = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("sessions.id"))
    score      = Column(Float)
    feedback   = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())