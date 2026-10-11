import uuid
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.models.schemas import ScanAssessmentResponse, ChildProfileBase
from app.services.entity_resolution import ChemicalEntityResolver
from app.services.interaction_service import InteractionService
from app.services.risk_scoring import PersonalizedRiskEngine
from app.services.explainer import SHAPExplainerService

router = APIRouter(prefix="/scan", tags=["Food Additive Scanning & Assessment"])

# Initialize singletons
entity_resolver = ChemicalEntityResolver()
interaction_service = InteractionService()
risk_engine = PersonalizedRiskEngine(dictionary_lookup=entity_resolver.additives_by_code)
explainer_service = SHAPExplainerService()

class TextScanRequest(BaseModel):
    product_name: Optional[str] = Field(default="Packaged Food Item", example="Fizzy Orange Nectar")
    raw_ingredients_text: str = Field(
        ...,
        example="Carbonated Water, Sugar, Citric Acid (E330), Preservative (Sodium Benzoate E211), Artificial Color (Sunset Yellow FCF E110)."
    )
    child_profile: Optional[Dict[str, Any]] = Field(
        default={
            "name": "Senudi Perera",
            "age_years": 4.2,
            "allergies": ["Tartrazine (E102)"],
            "sensitivities": ["Artificial Colorants"],
            "conditions": ["Mild Asthma", "ADHD/Hyperactivity Concern"]
        }
    )
    cumulative_exposure_index: Optional[float] = Field(default=25.0, ge=0, le=100)

class BarcodeScanRequest(BaseModel):
    barcode: str = Field(..., example="793573188548")
    child_profile: Optional[Dict[str, Any]] = None

@router.post("/text", response_model=ScanAssessmentResponse)
def scan_ingredients_text(req: TextScanRequest):
    """
    Evaluates raw ingredient label text (e.g., extracted from OCR or typed):
    1. Resolves E-Numbers and chemical synonyms
    2. Screens for synergistic chemical interactions (Rule baseline & Knowledge Graph)
    3. Calculates 0-100 personalized risk score (Low / Moderate / High Concern)
    4. Attributes score contributions using SHAP explainability
    """
    if not req.raw_ingredients_text.strip():
        raise HTTPException(status_code=400, detail="Ingredients text cannot be empty.")

    # 1. Chemical Entity Resolution
    detected_additives = entity_resolver.resolve_from_text(req.raw_ingredients_text)

    # 2. Additive Interaction Screening
    additive_codes = [add.code for add in detected_additives]
    interactions = interaction_service.evaluate_combinations(additive_codes)

    # 3. Personalized Risk Scoring
    risk_score, risk_category, contributions = risk_engine.compute_risk(
        detected_additives=detected_additives,
        interactions=interactions,
        child_profile=req.child_profile,
        cumulative_exposure_index=req.cumulative_exposure_index or 20.0
    )

    # 4. SHAP Feature Attribution
    shap_factors = explainer_service.generate_explanations(
        final_score=risk_score,
        contributions=contributions,
        interactions=interactions,
        child_profile=req.child_profile
    )

    has_interaction = len(interactions) > 0
    primary_evidence = interactions[0].get("evidence_source") if has_interaction else None

    return ScanAssessmentResponse(
        scan_id=f"SCN-{uuid.uuid4().hex[:8].upper()}",
        child_id=req.child_profile.get("id") if req.child_profile else None,
        product_name=req.product_name,
        input_type="label_ocr",
        detected_additives=detected_additives,
        interaction_detected=has_interaction,
        interaction_evidence_source=primary_evidence,
        risk_score=risk_score,
        risk_category=risk_category,
        contributing_factors=shap_factors
    )

@router.post("/barcode", response_model=ScanAssessmentResponse)
def scan_barcode(req: BarcodeScanRequest):
    """
    Scans a product barcode and retrieves ingredient details from Open Food Facts,
    falling back to physical label OCR if ingredients are missing.
    """
    # Demo database of packaged products for testing
    demo_barcode_db = {
        "793573188548": {
            "name": "Fizzy Orange Nectar (250ml)",
            "ingredients": "Carbonated Water, Sugar, Citric Acid (E330), Preservative (Sodium Benzoate E211), Sunset Yellow FCF (E110)."
        },
        "890103038411": {
            "name": "Savory Cheese Rings",
            "ingredients": "Corn Flour, Palm Oil, Monosodium Glutamate (E621), Tartrazine (E102), Salt."
        },
        "761303512345": {
            "name": "Pure Strawberry Natural Yogurt",
            "ingredients": "Whole Milk, Strawberry Puree, Pectin (E440), Natural Beetroot Red (E162)."
        }
    }

    product = demo_barcode_db.get(req.barcode)
    if not product:
        raise HTTPException(
            status_code=404,
            detail="Barcode not found in database. Please photograph the physical ingredient label instead (SRS REQ-1.7)."
        )

    # Delegate to text evaluation
    text_req = TextScanRequest(
        product_name=product["name"],
        raw_ingredients_text=product["ingredients"],
        child_profile=req.child_profile,
    )
    result = scan_ingredients_text(text_req)
    result.input_type = "barcode_lookup"
    return result
