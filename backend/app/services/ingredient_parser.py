import re
from typing import List, Optional, Tuple, Dict, Any
from app.models.schemas import ParsedIngredientItem, AdditiveDetail
from app.services.entity_resolution import ChemicalEntityResolver

class IngredientParserService:
    """
    Intelligent food packaging ingredient tokenizer and pediatric health classifier.
    Parses complex packaging texts (e.g. nested parentheses, percentages, e-numbers)
    into itemized ingredient breakdown with safe/caution/concerning status and pediatric health notes.
    """

    def __init__(self, resolver: Optional[ChemicalEntityResolver] = None):
        self.resolver = resolver or ChemicalEntityResolver()

    def tokenize_ingredients(self, raw_text: str) -> List[str]:
        """
        Splits ingredient text on commas/semicolons/bullets while respecting parenthetical nesting:
        e.g. 'Protein Blend (30%) (Textured Soy Protein, Pea Protein Isolate), Jaggery'
        will NOT split the commas inside '(Textured Soy Protein, Pea Protein Isolate)'.
        """
        if not raw_text or not raw_text.strip():
            return []

        # 1. Clean prefixes like 'Ingredients:', 'Contents:', etc.
        cleaned = raw_text.strip()
        cleaned = re.sub(r'^(?:ingredients|contents|ingredients\s*list)\s*[:\-]\s*', '', cleaned, flags=re.IGNORECASE)

        # Normalize special bullet characters, linebreaks, and em-dashes
        cleaned = cleaned.replace('\n', ' ').replace('\r', ' ')
        cleaned = cleaned.replace('•', ',').replace('▪', ',').replace('·', ',')

        items = []
        cur = []
        depth = 0

        for char in cleaned:
            if char in '([{':
                depth += 1
                cur.append(char)
            elif char in ')]}':
                depth = max(0, depth - 1)
                cur.append(char)
            elif (char == ',' or char == ';') and depth == 0:
                token = "".join(cur).strip()
                if token:
                    items.append(token)
                cur = []
            else:
                cur.append(char)

        if cur:
            token = "".join(cur).strip()
            if token:
                items.append(token)

        # 2. Filter out allergen disclaimers or manufacturer notes that appear as comma items
        final_items = []
        disclaimer_prefixes = (
            "contains:", "contains ", "allergen", "may contain", "manufactured in",
            "manufactured on", "storage:", "store in", "keep in", "product of",
            "country of origin", "batch", "best before", "expiry"
        )
        for item in items:
            clean_item = item.strip(" .,;:-*")
            if not clean_item or len(clean_item) < 2:
                continue
            lower_item = clean_item.lower()
            if any(lower_item.startswith(p) for p in disclaimer_prefixes):
                continue
            if not any(c.isalpha() for c in clean_item):
                continue
            final_items.append(clean_item)

        return final_items

    def classify_ingredient(self, raw_name: str, detected_additives: List[AdditiveDetail]) -> ParsedIngredientItem:
        """
        Classifies an individual ingredient into:
        - status: 'safe' (🟢), 'caution' (🟡), 'concerning' (🔴)
        - category: 'Whole Grain', 'Plant Protein', 'Natural Sweetener', 'Chemical Additive', etc.
        - health_note: Clear, evidence-based pediatric explanation
        """
        lower = raw_name.lower()

        # 1. Check if matches any detected additive from ChemicalEntityResolver
        matched_code = None
        matched_detail = None
        for detail in detected_additives:
            code_no_prefix = detail.code.replace("E", "")
            if (detail.code.lower() in lower or 
                f"ins {code_no_prefix}".lower() in lower or
                f"ins{code_no_prefix}".lower() in lower or
                detail.name.lower() in lower):
                matched_code = detail.code
                matched_detail = detail
                break

        # Check inline regex for E-number / INS-number if not in detected_additives
        if not matched_code:
            e_match = re.search(r'\b(?:e|ins)[-\s]?(\d{3,4}[a-z]?)\b', lower)
            if e_match:
                code_cand = f"E{e_match.group(1).upper()}"
                meta = self.resolver.get_additive_metadata(code_cand)
                if meta:
                    matched_code = code_cand
                    matched_detail = AdditiveDetail(
                        code=meta["code"],
                        name=meta["name"],
                        category=meta.get("category", "Additive"),
                        matched_sensitivities=meta.get("pediatric_concern_tags", [])
                    )

        if matched_detail:
            meta = self.resolver.get_additive_metadata(matched_detail.code)
            hazard = meta.get("hazard_weight", 0.5) if meta else 0.5
            tags = meta.get("pediatric_concern_tags", []) if meta else []

            if hazard >= 0.65 or "hyperactivity_interaction" in tags or "allergic_hypersensitivity" in tags:
                return ParsedIngredientItem(
                    name=raw_name,
                    category=matched_detail.category,
                    status="concerning",
                    health_note=f"High-concern chemical additive ({matched_detail.name} {matched_detail.code}). Linked to pediatric hypersensitivity and hyperactivity.",
                    e_code=matched_detail.code
                )
            elif hazard >= 0.35:
                return ParsedIngredientItem(
                    name=raw_name,
                    category=matched_detail.category,
                    status="caution",
                    health_note=f"Moderate-caution additive ({matched_detail.name} {matched_detail.code}). Limit daily frequency in young children.",
                    e_code=matched_detail.code
                )
            else:
                return ParsedIngredientItem(
                    name=raw_name,
                    category=matched_detail.category,
                    status="safe",
                    health_note=f"Mild food additive ({matched_detail.name} {matched_detail.code}). Generally recognized as safe in standard pediatric serving sizes.",
                    e_code=matched_detail.code
                )

        # 2. Rule-based Pediatric Categorization
        # Artificial Sweeteners (🔴 High concern)
        if any(w in lower for w in ["aspartame", "sucralose", "acesulfame", "saccharin", "neotame", "cyclamate"]):
            return ParsedIngredientItem(
                name=raw_name,
                category="Artificial Sweetener",
                status="concerning",
                health_note="Intense non-nutritive chemical sweetener; not recommended for young children by pediatric health guidelines."
            )

        # High Fructose Corn Syrup / Hydrogenated Fats (🔴 High concern)
        if any(w in lower for w in ["high fructose corn syrup", "hfcs", "partially hydrogenated", "hydrogenated vegetable", "shortening"]):
            return ParsedIngredientItem(
                name=raw_name,
                category="Trans Fat / High Glycemic",
                status="concerning",
                health_note="Contains industrially modified fats or high-fructose syrup linked to metabolic stress; best avoided in childhood diets."
            )

        # Artificial Flavorings (🟡 Caution)
        if any(w in lower for w in ["artificial flavour", "artificial flavor", "nature identical flavour", "nature-identical flavour", "synthetic flavour"]):
            return ParsedIngredientItem(
                name=raw_name,
                category="Synthetic Flavoring",
                status="caution",
                health_note="Synthesized aromatic compound; safe in micro-doses but whole-food natural alternatives are preferable for growing children."
            )

        # Monosodium Glutamate / Flavor Enhancers (🟡 Caution)
        if any(w in lower for w in ["msg", "glutamate", "flavour enhancer", "flavor enhancer", "yeast extract", "hydrolyzed soy protein"]):
            return ParsedIngredientItem(
                name=raw_name,
                category="Flavor Enhancer",
                status="caution",
                health_note="Umami/glutamate enhancer; can induce transient hypersensitivity or overeating triggers in sensitive children."
            )

        # Sugars and Syrups (🟡 Caution)
        if any(w in lower for w in [
            "sugar", "jaggery", "cane sugar", "brown sugar", "glucose", "fructose", "corn syrup",
            "maltodextrin", "dextrose", "invert sugar", "caramel syrup", "molasses"
        ]):
            return ParsedIngredientItem(
                name=raw_name,
                category="Added Sweetener",
                status="caution",
                health_note="Added caloric sweetener; moderate intake advised to prevent dental caries and glycemic spikes in toddlers."
            )

        # Palm Oil / Vegetable Oils (🟡 Caution / Safe)
        if "palm oil" in lower or "palm olein" in lower or "palm kernel" in lower:
            return ParsedIngredientItem(
                name=raw_name,
                category="Vegetable Oil (Palm)",
                status="caution",
                health_note="Higher in saturated palmitic acid; acceptable in balanced amounts, but monitor cumulative daily saturated fat."
            )

        # Healthy Oils (🟢 Safe)
        if any(w in lower for w in ["sunflower oil", "olive oil", "canola oil", "coconut oil", "mustard oil", "soybean oil", "sesame oil"]):
            return ParsedIngredientItem(
                name=raw_name,
                category="Dietary Healthy Fat",
                status="safe",
                health_note="Plant-derived dietary lipid providing essential fatty acids supporting cellular growth and brain development."
            )

        # Whole Grains & Cereals (🟢 Safe)
        if any(w in lower for w in [
            "oat", "oats", "rolled oats", "wheat", "brown rice", "rice crisps", "corn flour",
            "barley", "quinoa", "millet", "ragi", "whole wheat", "multigrain"
        ]):
            return ParsedIngredientItem(
                name=raw_name,
                category="Whole Grain / Cereal",
                status="safe",
                health_note="Wholesome complex carbohydrate providing sustained energy, dietary fibre, and essential B-vitamins for active children."
            )

        # Protein Sources (🟢 Safe)
        if any(w in lower for w in [
            "protein blend", "soy protein", "pea protein", "whey protein", "milk protein",
            "egg", "lentil", "chickpea", "almond protein"
        ]):
            return ParsedIngredientItem(
                name=raw_name,
                category="Protein Source",
                status="safe",
                health_note="Essential amino acid source supporting muscle repair, bone density, and healthy childhood growth."
            )

        # Dietary Fibres & Prebiotics (🟢 Safe)
        if any(w in lower for w in ["fibre", "fiber", "inulin", "chicory root", "psyllium", "resistant starch", "oligofructose"]):
            return ParsedIngredientItem(
                name=raw_name,
                category="Dietary Prebiotic Fibre",
                status="safe",
                health_note="Beneficial prebiotic fibre that promotes healthy digestion and nourishes the child's gut microbiome."
            )

        # Seeds and Nuts (🟢 Safe)
        if any(w in lower for w in ["flax seed", "flaxseed", "chia", "pumpkin seed", "almond", "walnut", "cashew", "peanut", "sunflower seed"]):
            return ParsedIngredientItem(
                name=raw_name,
                category="Nutritious Seeds & Nuts",
                status="safe",
                health_note="Nutrient-dense superfood containing Omega-3 fatty acids, zinc, and magnesium for child neurological health. (Check if allergy-prone)."
            )

        # Cocoa / Dark Chocolate (🟡 / 🟢 Safe/Caution)
        if any(w in lower for w in ["chocolate", "cocoa", "cacao"]):
            return ParsedIngredientItem(
                name=raw_name,
                category="Cocoa / Antioxidant",
                status="safe" if "cocoa powder" in lower else "caution",
                health_note="Rich in polyphenols and antioxidants; dark chocolate drops contain modest added sugar and mild natural theobromine."
            )

        # Dairy & Milk (🟢 Safe)
        if any(w in lower for w in ["milk", "curd", "yogurt", "cheese", "dairy", "paneer"]):
            return ParsedIngredientItem(
                name=raw_name,
                category="Dairy Nutrition",
                status="safe",
                health_note="Excellent source of dietary calcium, vitamin D, and bioavailable protein for growing bones."
            )

        # Natural Sweeteners (Stevia / Monk fruit) (🟢 Safe)
        if any(w in lower for w in ["stevia", "steviol", "monk fruit"]):
            return ParsedIngredientItem(
                name=raw_name,
                category="Plant Sweetener",
                status="safe",
                health_note="Natural plant-derived glycoside; wholesome alternative to intensive synthetic artificial sweeteners."
            )

        # Dried Fruits & Natural Fruit Powders (🟢 Safe)
        if any(w in lower for w in ["raisin", "raisins", "date", "dates", "fig", "prune", "apricot", "sultana", "currant"]):
            return ParsedIngredientItem(
                name=raw_name,
                category="Dried Fruit / Whole Food",
                status="safe",
                health_note="Concentrated natural dried fruit providing dietary fibre, potassium, and plant iron."
            )

        # Probiotics & Beneficial Cultures (🟢 Safe)
        if any(w in lower for w in ["probiotic", "bacillus", "lactobacillus", "bifidobacterium", "culture"]):
            return ParsedIngredientItem(
                name=raw_name,
                category="Probiotic Culture",
                status="safe",
                health_note="Beneficial live microbial strains that promote healthy digestion and gut microbiome diversity in children."
            )

        # Salt & Mineral Salts (🟡 Caution)
        if any(w in lower for w in ["salt", "pink salt", "sea salt", "sodium chloride"]):
            return ParsedIngredientItem(
                name=raw_name,
                category="Culinary Mineral (Sodium)",
                status="caution",
                health_note="Essential culinary mineral; safe in modest amounts, but observe recommended pediatric daily sodium allowances."
            )

        # Natural Botanical Antioxidants (🟢 Safe)
        if any(w in lower for w in ["rosemary", "tocopherol", "mixed tocopherols", "green tea extract"]):
            return ParsedIngredientItem(
                name=raw_name,
                category="Natural Plant Antioxidant",
                status="safe",
                health_note="Plant-derived botanical antioxidant preserving product freshness safely without synthetic preservatives."
            )

        # Fruits & Vegetables (🟢 Safe)
        if any(w in lower for w in ["apple", "strawberry", "banana", "mango", "berry", "fruit", "carrot", "beetroot", "tomato"]):
            return ParsedIngredientItem(
                name=raw_name,
                category="Natural Fruit / Vegetable",
                status="safe",
                health_note="Natural whole food offering essential micronutrients, vitamins A & C, and plant phytochemicals."
            )

        # Natural Flavours & Spices (🟢 Safe)
        if any(w in lower for w in ["natural flavour", "natural flavor", "vanilla", "cinnamon", "cardamom", "ginger"]):
            return ParsedIngredientItem(
                name=raw_name,
                category="Natural Flavouring",
                status="safe",
                health_note="Botanical natural essence providing gentle aromatic flavor without synthetic chemicals."
            )

        # Emulsifiers & Thickeners (🟢 / 🟡 Safe)
        if any(w in lower for w in ["lecithin", "soy lecithin", "pectin", "gum", "agar", "starch"]):
            return ParsedIngredientItem(
                name=raw_name,
                category="Plant Emulsifier / Stabilizer",
                status="safe",
                health_note="Plant-derived natural stabilizer that ensures smooth product texture; safe for children."
            )

        # Default fallback
        return ParsedIngredientItem(
            name=raw_name,
            category="Food Ingredient",
            status="safe",
            health_note="Standard culinary food ingredient; no significant pediatric contraindications identified."
        )

    def parse_and_classify_list(
        self,
        raw_text: str,
        detected_additives: List[AdditiveDetail]
    ) -> List[ParsedIngredientItem]:
        """
        Tokenizes the ingredient string and runs full pediatric classification.
        """
        tokens = self.tokenize_ingredients(raw_text)
        results: List[ParsedIngredientItem] = []

        for token in tokens:
            classified = self.classify_ingredient(token, detected_additives)
            results.append(classified)

        return results

ingredient_parser_service = IngredientParserService()
