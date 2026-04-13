from pydantic import BaseModel
from typing import Optional

class EvaluationSchema(BaseModel):
    session_id: str
    score: float
    feedback: dict

    class Config:
        from_attributes = True