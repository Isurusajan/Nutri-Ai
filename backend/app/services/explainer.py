from typing import List, Dict, Any
from app.models.schemas import SHAPExplanationFactor

class SHAPExplainerService:
    def generate_explanations(
        self,
        final_score: float,
        contributions: Dict[str, float],
        interactions: List[Dict[str, Any]],
        child_profile: Dict[str, Any] = None
    ) -> List[SHAPExplanationFactor]:
        """
        Decomposes the model score into ranked SHAP-style attribution factors
        with human-readable plain language summaries.
        """
        factors: List[SHAPExplanationFactor] = []
        total_positive = sum([v for v in contributions.values() if v > 0]) or 1.0

        # 1. Additive Interaction Factor
        int_weight = contributions.get("interactions", 0.0)
        if int_weight > 0 and interactions:
            pct = round((int_weight / total_positive) * 100, 1)
            # Find primary interaction note
            primary_int = interactions[0]
            pair_name = f"{primary_int['additive_a_code']} + {primary_int['additive_b_code']}"
            evidence = primary_int.get("evidence_source", "Published clinical trials")
            factors.append(
                SHAPExplanationFactor(
                    factor_name=f"Synergistic Additive Interaction ({pair_name})",
                    impact_direction="increases_risk",
                    relative_weight=pct,
                    plain_text_explanation=(
                        f"Detected combination {pair_name} ({primary_int['additive_a_name']} and {primary_int['additive_b_name']}) "
                        f"contributes +{pct}% to the risk score. Evidence: {evidence}."
                    )
                )
            )

        # 2. Allergy Match Factor
        allergy_weight = contributions.get("allergy_match", 0.0)
        if allergy_weight > 0:
            pct = round((allergy_weight / total_positive) * 100, 1)
            factors.append(
                SHAPExplanationFactor(
                    factor_name="Direct Child Allergy Match",
                    impact_direction="increases_risk",
                    relative_weight=pct,
                    plain_text_explanation=(
                        f"One or more detected additives match diagnosed allergies in the child's profile, "
                        f"contributing +{pct}% to the concern level."
                    )
                )
            )

        # 3. Health Condition / Sensitivity Relevance
        cond_weight = contributions.get("condition_relevance", 0.0)
        if cond_weight > 0 and child_profile:
            pct = round((cond_weight / total_positive) * 100, 1)
            cond_names = ", ".join(child_profile.get("conditions", []) + child_profile.get("sensitivities", []))
            factors.append(
                SHAPExplanationFactor(
                    factor_name="Child Condition & Sensitivity Relevance",
                    impact_direction="increases_risk",
                    relative_weight=pct,
                    plain_text_explanation=(
                        f"Identified additives correlate with recorded child vulnerabilities ({cond_names}), "
                        f"accounting for +{pct}% of the final score."
                    )
                )
            )

        # 4. Cumulative Dietary Exposure Factor
        exp_weight = contributions.get("cumulative_exposure", 0.0)
        if exp_weight > 0:
            pct = round((exp_weight / total_positive) * 100, 1)
            factors.append(
                SHAPExplanationFactor(
                    factor_name="7-Day Cumulative Dietary Exposure",
                    impact_direction="increases_risk",
                    relative_weight=pct,
                    plain_text_explanation=(
                        f"Prior dietary intake across recorded products over the past 7 days "
                        f"elevates estimated cumulative additive load by +{pct}%."
                    )
                )
            )

        # 5. Base Additive Inherent Hazards
        base_weight = contributions.get("base_additives", 0.0)
        if base_weight > 0:
            pct = round((base_weight / total_positive) * 100, 1)
            factors.append(
                SHAPExplanationFactor(
                    factor_name="Inherent Chemical Additive Load",
                    impact_direction="increases_risk",
                    relative_weight=pct,
                    plain_text_explanation=(
                        f"Baseline regulatory hazard weights of individual detected additives "
                        f"account for +{pct}% of the score."
                    )
                )
            )

        # Sort factors by relative weight descending
        factors.sort(key=lambda x: x.relative_weight, reverse=True)
        return factors
