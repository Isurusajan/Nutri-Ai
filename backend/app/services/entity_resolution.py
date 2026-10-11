import re
import json
import os
from typing import List, Dict, Any, Optional
from app.models.schemas import AdditiveDetail

class ChemicalEntityResolver:
    def __init__(self, dictionary_path: Optional[str] = None):
        if dictionary_path is None:
            # Default to backend/data/chemical_dictionary.json
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            dictionary_path = os.path.join(base_dir, "data", "chemical_dictionary.json")
            
        self.dictionary_path = dictionary_path
        self.additives_by_code: Dict[str, Dict[str, Any]] = {}
        self.synonym_lookup: Dict[str, str] = {}
        self._load_dictionary()

    def _load_dictionary(self):
        if not os.path.exists(self.dictionary_path):
            raise FileNotFoundError(f"Chemical reference dictionary not found at {self.dictionary_path}")

        with open(self.dictionary_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        for item in data:
            code = item["code"].upper()
            self.additives_by_code[code] = item

            # Index primary name
            primary_name = item["name"].strip().lower()
            self.synonym_lookup[primary_name] = code

            # Index synonyms
            for syn in item.get("synonyms", []):
                cleaned_syn = syn.strip().lower()
                self.synonym_lookup[cleaned_syn] = code

    def resolve_from_text(self, text: str) -> List[AdditiveDetail]:
        """
        Parses raw ingredient text (e.g., from OCR or API) and extracts
        normalized AdditiveDetail entities.
        """
        if not text:
            return []

        resolved_codes = set()
        clean_text = text.lower()

        # 1. Regex Pattern for E-Numbers and INS-Numbers
        # Matches: E211, E 211, E-211, INS 211, INS211, e102
        e_number_pattern = re.compile(r'\b(?:e|ins)[-\s]?(\d{3,4}[a-z]?)\b', re.IGNORECASE)
        for match in e_number_pattern.finditer(text):
            numeric_part = match.group(1).upper()
            standard_code = f"E{numeric_part}"
            if standard_code in self.additives_by_code:
                resolved_codes.add(standard_code)

        # 2. Match known chemical names & synonyms
        # Sort synonyms by length descending so longer compound names match before substrings
        sorted_synonyms = sorted(self.synonym_lookup.keys(), key=len, reverse=True)
        for syn in sorted_synonyms:
            # Word boundary search for synonym
            pattern = r'\b' + re.escape(syn) + r'\b'
            if re.search(pattern, clean_text):
                resolved_codes.add(self.synonym_lookup[syn])

        # 3. Construct structured AdditiveDetail objects
        results: List[AdditiveDetail] = []
        for code in sorted(resolved_codes):
            meta = self.additives_by_code[code]
            results.append(
                AdditiveDetail(
                    code=meta["code"],
                    name=meta["name"],
                    category=meta["category"],
                    matched_sensitivities=meta.get("pediatric_concern_tags", [])
                )
            )

        return results

    def get_additive_metadata(self, code: str) -> Optional[Dict[str, Any]]:
        return self.additives_by_code.get(code.upper())
