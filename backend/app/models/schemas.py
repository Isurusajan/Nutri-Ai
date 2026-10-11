from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class RiskCategory(str, Enum):
    LOW_CONCERN = "Low Concern"
    MODERATE_CONCERN = "Moderate Concern"
    HIGH_CONCERN = "High Concern"

class ChildProfileBase(BaseModel):
    name: str = Field(..., example="Senudi Perera")
    dob: str = Field(..., example="2022-08-15")
    allergies: List[str] = Field(default=[], example=["Tartrazine (E102)", "Peanuts"])
    sensitivities: List[str] = Field(default=[], example=["Artificial Colorants"])
    conditions: List[str] = Field(default=[], example=["Mild Asthma", "ADHD/Hyperactivity Concern"])

class ChildProfileCreate(ChildProfileBase):
    pass

class ChildProfileResponse(ChildProfileBase):
    id: str
    parent_id: str
    age_formatted: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AdditiveDetail(BaseModel):
    code: str = Field(..., example="E211")
    name: str = Field(..., example="Sodium Benzoate")
    category: str = Field(..., example="Preservative")
    matched_sensitivities: List[str] = []

class SHAPExplanationFactor(BaseModel):
    factor_name: str
    impact_direction: str # "increases_risk" or "decreases_risk"
    relative_weight: float # e.g. 0.42
    plain_text_explanation: str

class ScanAssessmentResponse(BaseModel):
    scan_id: str
    child_id: Optional[str]
    product_name: Optional[str]
    input_type: str # "label_ocr" or "barcode_lookup"
    detected_additives: List[AdditiveDetail]
    interaction_detected: bool
    interaction_evidence_source: Optional[str]
    risk_score: float = Field(..., ge=0, le=100, description="Personalized risk score 0-100")
    risk_category: RiskCategory
    contributing_factors: List[SHAPExplanationFactor]
    disclaimer: str = (
        "Screening result for decision support only. Does not measure biological toxicity "
        "or replace professional pediatric medical diagnosis."
    )
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class BarcodeLookupRequest(BaseModel):
    barcode: str = Field(..., example="793573188548")
    child_id: Optional[str] = None
