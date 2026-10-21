import uuid
from fastapi import APIRouter, HTTPException, Query, File, UploadFile, Form
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import json
from app.models.schemas import ScanAssessmentResponse, ChildProfileBase
from app.services.entity_resolution import ChemicalEntityResolver
from app.services.interaction_service import InteractionService
from app.services.risk_scoring import PersonalizedRiskEngine
from app.services.explainer import SHAPExplainerService
from app.services.ocr_service import FoodLabelOCRService
from app.services.ingredient_parser import ingredient_parser_service

router = APIRouter(prefix="/scan", tags=["Food Additive Scanning & Assessment"])

# Initialize singletons
entity_resolver = ChemicalEntityResolver()
interaction_service = InteractionService()
risk_engine = PersonalizedRiskEngine(dictionary_lookup=entity_resolver.additives_by_code)
explainer_service = SHAPExplainerService()
ocr_service = FoodLabelOCRService()

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

class Base64ScanRequest(BaseModel):
    image_base64: str
    product_name: Optional[str] = "Captured Food Package"
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

    # 5. Itemized Ingredient Breakdown & Pediatric Classification
    parsed_ingredients = ingredient_parser_service.parse_and_classify_list(
        req.raw_ingredients_text,
        detected_additives
    )

    has_interaction = len(interactions) > 0
    primary_evidence = interactions[0].get("evidence_source") if has_interaction else None

    return ScanAssessmentResponse(
        scan_id=f"SCN-{uuid.uuid4().hex[:8].upper()}",
        child_id=req.child_profile.get("id") if req.child_profile else None,
        product_name=req.product_name,
        input_type="label_ocr",
        detected_additives=detected_additives,
        parsed_ingredients=parsed_ingredients,
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
    result.extracted_text = product["ingredients"]
    return result

@router.post("/image", response_model=ScanAssessmentResponse)
async def scan_label_image(
    image: UploadFile = File(...),
    child_profile_json: Optional[str] = Form(None),
    product_name: Optional[str] = Form("Captured Food Package")
):
    """
    Receives food packaging image uploaded from mobile camera / gallery:
    1. Preprocesses image using OpenCV (glare reduction, thresholding, contour extraction)
    2. Performs OCR entity extraction for ingredient lines
    3. Runs chemical entity resolution, interaction screening, and risk scoring
    """
    contents = await image.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded image is empty.")

    try:
        extracted_text, metrics = await ocr_service.extract_ingredients_text(contents)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Image processing failed: {str(e)}")

    child_profile = None
    if child_profile_json:
        try:
            child_profile = json.loads(child_profile_json)
        except Exception:
            child_profile = None

    # Handle blank paper or image with no detected ingredient text
    if not extracted_text or not extracted_text.strip():
        from app.models.schemas import RiskCategory
        return ScanAssessmentResponse(
            scan_id=f"SCN-BLANK-{uuid.uuid4().hex[:6].upper()}",
            child_id=child_profile.get("id") if child_profile else None,
            product_name="No Ingredient Label Detected",
            input_type="label_ocr",
            detected_additives=[],
            interaction_detected=False,
            interaction_evidence_source=None,
            risk_score=0.0,
            risk_category=RiskCategory.LOW_CONCERN,
            contributing_factors=[],
            extracted_text="No readable ingredient text or E-numbers detected on this surface. Please aim the camera at a printed ingredients list.",
            ocr_metrics=metrics,
            disclaimer="No food additives detected. Please align the printed ingredients section inside the camera viewfinder."
        )

    text_req = TextScanRequest(
        product_name=product_name,
        raw_ingredients_text=extracted_text,
        child_profile=child_profile
    )
    result = scan_ingredients_text(text_req)
    result.input_type = "label_ocr"
    result.extracted_text = extracted_text
    result.ocr_metrics = metrics
    return result

@router.post("/image-base64", response_model=ScanAssessmentResponse)
async def scan_label_image_base64(req: Base64ScanRequest):
    """
    Receives base64-encoded food package photo from mobile app.
    Decodes image bytes, processes via OpenCV + Windows Native OCR,
    and returns pediatric additive risk assessment.
    """
    import base64
    raw_b64 = req.image_base64
    if "," in raw_b64:
        raw_b64 = raw_b64.split(",", 1)[1]
    
    try:
        contents = base64.b64decode(raw_b64)
    except Exception as b64_err:
        raise HTTPException(status_code=400, detail=f"Invalid base64 encoding: {str(b64_err)}")

    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded image data is empty.")

    try:
        extracted_text, metrics = await ocr_service.extract_ingredients_text(contents)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Image processing failed: {str(e)}")

    # Blank paper or surface with no readable ingredients
    if not extracted_text or not extracted_text.strip():
        from app.models.schemas import RiskCategory
        return ScanAssessmentResponse(
            scan_id=f"SCN-BLANK-{uuid.uuid4().hex[:6].upper()}",
            child_id=req.child_profile.get("id") if req.child_profile else None,
            product_name="No Ingredient Label Detected",
            input_type="label_ocr",
            detected_additives=[],
            interaction_detected=False,
            interaction_evidence_source=None,
            risk_score=0.0,
            risk_category=RiskCategory.LOW_CONCERN,
            contributing_factors=[],
            extracted_text="No readable ingredient text or E-numbers detected on this surface. Please aim the camera at a printed ingredients list.",
            ocr_metrics=metrics,
            disclaimer="No food additives detected. Please align the printed ingredients section inside the camera viewfinder."
        )

    text_req = TextScanRequest(
        product_name=req.product_name,
        raw_ingredients_text=extracted_text,
        child_profile=req.child_profile
    )
    result = scan_ingredients_text(text_req)
    result.input_type = "label_ocr"
    result.extracted_text = extracted_text
    result.ocr_metrics = metrics
    return result

