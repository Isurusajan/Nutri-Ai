from typing import List, Dict, Any, Optional, Tuple
from app.models.schemas import RiskCategory, AdditiveDetail

class PersonalizedRiskEngine:
    def __init__(self, dictionary_lookup=None):
        self.dictionary_lookup = dictionary_lookup

    def compute_risk(
        self,
        detected_additives: List[AdditiveDetail],
        interactions: List[Dict[str, Any]],
        child_profile: Optional[Dict[str, Any]] = None,
        cumulative_exposure_index: float = 20.0
    ) -> Tuple[float, RiskCategory, Dict[str, float]]:
        """
        Computes calibrated 0-100 personalized risk score and returns:
        (risk_score, risk_category, feature_weight_contributions)
        """
        if not detected_additives:
            return 5.0, RiskCategory.LOW_CONCERN, {"base_additives": 5.0}

        # 1. Base Additive Hazard Weight
        # Each additive has an inherent hazard weight (0.0 to 1.0)
        base_hazard_sum = 0.0
        for add in detected_additives:
            hazard = 0.50 # default
            if self.dictionary_lookup:
                meta = self.dictionary_lookup.get(add.code.upper())
                if meta:
                    hazard = meta.get("hazard_weight", 0.50)
            base_hazard_sum += hazard

        # Normalized base additive component (scale to max 35 points)
        base_score = min(35.0, base_hazard_sum * 18.0)

        # 2. Chemical Interaction Effect
        interaction_score = 0.0
        if interactions:
            # Check maximum severity
            has_high_severity = any(i.get("severity_level") == "High Concern" for i in interactions)
            max_multiplier = max([i.get("risk_multiplier", 1.2) for i in interactions])
            
            if has_high_severity:
                # Southampton benchmark or high synergy
                interaction_score = 30.0 * (max_multiplier / 1.5)
            else:
                interaction_score = 18.0 * (max_multiplier / 1.3)
            interaction_score = min(35.0, interaction_score)

        # 3. Child Personalization Component
        allergy_score = 0.0
        condition_score = 0.0
        age_score = 0.0

        if child_profile:
            allergies = [a.lower() for a in child_profile.get("allergies", [])]
            sensitivities = [s.lower() for s in child_profile.get("sensitivities", [])]
            conditions = [c.lower() for c in child_profile.get("conditions", [])]
            age_years = child_profile.get("age_years", 5.0)

            # A. Direct Allergy Match Check (Critical Safety Override)
            for add in detected_additives:
                add_code = add.code.lower()
                add_name = add.name.lower()
                # Check if code or name is mentioned in child allergies
                for allergy in allergies:
                    if add_code in allergy or add_name in allergy:
                        allergy_score += 45.0 # Strong individual penalty

            # B. Sensitivity & Condition Relevance Check
            for add in detected_additives:
                tags = [t.lower() for t in add.matched_sensitivities]
                
                # Asthmatic child + respiratory sensitivity tags
                if any("asthma" in c for c in conditions) and any("asthma" in t or "bronchospasm" in t for t in tags):
                    condition_score += 15.0

                # Hyperactivity / ADHD concern + hyperactivity interaction tags
                if any("adhd" in c or "hyperactiv" in c for c in conditions) and any("hyperactiv" in t for t in tags):
                    condition_score += 18.0

                # Food sensitivities match
                if any("color" in s for s in sensitivities) and "color" in add.category.lower():
                    condition_score += 10.0

            # C. Age Vulnerability Factor (Toddlers < 5 have higher vulnerability)
            if age_years < 3.0:
                age_score = 8.0
            elif age_years < 6.0:
                age_score = 4.0

        allergy_score = min(50.0, allergy_score)
        condition_score = min(25.0, condition_score)

        # 4. Cumulative Dietary Exposure Index (0-100 scale, contributes up to 15 points)
        exposure_contribution = (cumulative_exposure_index / 100.0) * 15.0

        # Total Aggregated Raw Score
        raw_score = base_score + interaction_score + allergy_score + condition_score + age_score + exposure_contribution

        # Calibrate final continuous score to 0 - 100
        final_score = round(min(100.0, max(5.0, raw_score)), 1)

        # Classify into standard concern categories
        if final_score >= 70.0 or allergy_score >= 40.0:
            category = RiskCategory.HIGH_CONCERN
        elif final_score >= 40.0:
            category = RiskCategory.MODERATE_CONCERN
        else:
            category = RiskCategory.LOW_CONCERN

        # Breakdown of component weights for explainability
        contributions = {
            "base_additives": round(base_score, 1),
            "interactions": round(interaction_score, 1),
            "allergy_match": round(allergy_score, 1),
            "condition_relevance": round(condition_score, 1),
            "age_vulnerability": round(age_score, 1),
            "cumulative_exposure": round(exposure_contribution, 1),
        }

        return final_score, category, contributions
