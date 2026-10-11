import json
import os
from itertools import combinations
from typing import List, Dict, Any, Optional, Tuple

class InteractionService:
    def __init__(self, dataset_path: Optional[str] = None):
        if dataset_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            dataset_path = os.path.join(base_dir, "data", "curated_interactions.json")
            
        self.dataset_path = dataset_path
        self.interactions_by_pair: Dict[Tuple[str, str], Dict[str, Any]] = {}
        self._load_dataset()

    def _load_dataset(self):
        if not os.path.exists(self.dataset_path):
            raise FileNotFoundError(f"Curated interaction dataset not found at {self.dataset_path}")

        with open(self.dataset_path, "r", encoding="utf-8") as f:
            records = json.load(f)

        for rec in records:
            code_a = rec["additive_a_code"].upper()
            code_b = rec["additive_b_code"].upper()
            # Store order-independent pair key
            pair_key = tuple(sorted([code_a, code_b]))
            self.interactions_by_pair[pair_key] = rec

    def evaluate_combinations(self, additive_codes: List[str]) -> List[Dict[str, Any]]:
        """
        Rule-Based Baseline:
        Checks all 2-combination pairs among detected additives against the curated benchmark dataset.
        Returns all matched interaction records.
        """
        detected_interactions = []
        normalized_codes = list(set([c.upper() for c in additive_codes]))

        # Check all unique pairs
        for code_a, code_b in combinations(normalized_codes, 2):
            pair_key = tuple(sorted([code_a, code_b]))
            if pair_key in self.interactions_by_pair:
                interaction = self.interactions_by_pair[pair_key]
                detected_interactions.append(interaction)

        return detected_interactions

    def get_max_interaction_multiplier(self, interactions: List[Dict[str, Any]]) -> float:
        """
        Returns the highest risk multiplier among detected interactions (default 1.0 if none).
        """
        if not interactions:
            return 1.0
        return max([item.get("risk_multiplier", 1.2) for item in interactions])
