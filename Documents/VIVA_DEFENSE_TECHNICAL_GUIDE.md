# NutriSafe AI — Comprehensive Viva Defense Technical Guide & Cheat Sheet
**University of Moratuwa • Faculty of Information Technology**  
**Course Code:** ITE 3962 — Final Year Project (FYP)  
**Candidate:** P.K.R. Abeysekara (Reg: E2529001)  
**Project Title:** NutriSafe AI: A Multi-Modal Explainable AI System for Personalized Pediatric Food Additive Risk and Chemical Interaction Assessment

---

## 🏛️ 1. Project High-Level Pitch (30-Second Elevator Summary)
> "NutriSafe AI is a personalized pediatric clinical decision-support system. While traditional food scanner applications rely on brittle 1-to-1 barcode lookup tables that completely fail on uncatalogued products, NutriSafe AI combines **OpenCV computer vision preprocessing**, a **Relational Graph Convolutional Network (R-GCN) link prediction model**, and **SHAP explainability** to detect synergistic chemical hazards (such as the Southampton hyperactivity cocktail E211 + E110) tailored specifically to a child's age, allergies, and 7-day cumulative exposure load."

---

## 🔬 2. Top 10 High-Frequency Viva Questions & Technical Answers

### Q1. Why did you use a Relational Graph Convolutional Network (R-GCN) instead of a Standard GCN or GAT?
**Answer:**
- Standard GCNs assume homogeneous, single-relation edges between nodes (`A — B`).
- However, chemical additive interactions are **multi-relational** and **heterogeneous**. Additives can share metabolic pathways (`[:SHARES_PATHWAY]`), belong to chemical functional classes (`[:BELONGS_TO]`, e.g., Azo Dyes, Benzoic Acid derivatives), or exhibit direct synergistic exacerbation (`[:SYNERGISTIC_WITH]`).
- R-GCN introduces relation-specific weight matrices ($W_r$) that allow the neural network to propagate information across distinct biochemical relationship types without conflating functional categories with antagonistic reactions.

### Q2. Why DistMult bilinear decoder for link prediction?
**Answer:**
- Chemical interactions between co-ingested food additives are **symmetric**: if Additive A synergizes with Additive B in gastric acid, Additive B equally synergizes with Additive A.
- DistMult uses a diagonal relational matrix ($W_r$) with the score function:
  $$\text{Score}(u, v) = e_u^T \cdot \text{diag}(W_r) \cdot e_v$$
- Because the score is symmetric ($\text{Score}(u, v) = \text{Score}(v, u)$), DistMult mathematically enforces the symmetric commutative property of chemical mixtures, whereas directed models like TransE introduce artificial directional bias ($e_u + r \approx e_v$).

### Q3. In your Chapter 5 benchmark, why did the Rule-Based Baseline get 0.000 Recall?
**Answer:**
- A rule-based baseline is an exact lookup table. It only knows combinations that were explicitly present in its training dataset.
- In cross-validation, when presented with **unseen additive pairs in the test set**, a lookup table has zero mechanism to infer relationships, predicting negative (0) for every novel pair. Hence:
  $$\text{Recall} = \frac{TP}{TP + FN} = \frac{0}{3 + 0} = 0.000$$
- In contrast, the R-GCN embeds chemical functional categories (e.g., Azo Dye structures). Even if a specific pair was never logged before, its proximity in latent functional space enables the model to predict the link, achieving **+33.3% recall**, which is critical for proactive consumer safety.

### Q4. Why did you choose SHAP (Shapley Additive Explanations) over LIME?
**Answer:**
- **Mathematical Consistency:** SHAP is rooted in cooperative game theory and uniquely guarantees four axiomatic properties: *Efficiency, Symmetry, Dummy (Null player), and Additivity*.
- **Local Accuracy:** LIME builds a local surrogate linear model that can fluctuate between runs due to random perturbation sampling. SHAP provides deterministic, mathematically exact feature attribution where the sum of SHAP values plus the base expected value equals the final prediction score:
  $$f(x) = \phi_0 + \sum_{i=1}^M \phi_i$$
- This allows NutriSafe AI to provide pediatricians and parents with exact, reproducible percentage risk breakdowns (e.g., +38.2% from Synergistic Interaction, +28.1% from Child Asthma/Allergy relevance).

### Q5. What is the clinical relevance of the "Southampton Study" (McCann et al., Lancet 2007)?
**Answer:**
- Published in *The Lancet* (370:1560–67), the Southampton randomized, double-blind, placebo-controlled trial tested 297 children (ages 3 and 8/9).
- It conclusively established that mixtures of artificial food colors (Tartrazine E102, Sunset Yellow E110, Carmoisine E122, Allura Red E129) combined with the sodium benzoate preservative (E211) caused a statistically significant increase in hyperactive behavior across both age groups.
- This scientific trial directly prompted **European Parliament Regulation (EC) No 1333/2008**, mandating the warning label: *"May have an adverse effect on activity and attention in children"*.

### Q6. How does your OpenCV Computer Vision pipeline handle real-world retail packaging challenges?
**Answer:**
- Food packages frequently suffer from curved cylindrical geometry (bottles, cans) and specular glare from plastic cellophane.
- The pipeline applies:
  1. **Bilateral Filtering (`cv2.bilateralFilter`)**: Unlike Gaussian blur which softens all edges, bilateral filtering suppresses high-frequency specular reflections while preserving sharp character contours.
  2. **Adaptive Gaussian Thresholding (`cv2.adaptiveThreshold`)**: Calculates dynamic thresholds locally across window patches, handling harsh shadows and uneven supermarket lighting.
  3. **Morphological Gradient Contour Localization**: Groups isolated character strokes into coherent horizontal bounding rectangles representing ingredient lines.

### Q7. How is the 0–100 Personalized Pediatric Risk Score calculated?
**Answer:**
- The score is formulated as a bounded composite multi-factorial index:
  $$\text{RiskScore} = \min\left(100, S_{\text{inherent}} + S_{\text{interaction}} + S_{\text{pediatric}} + S_{\text{exposure}}\right)$$
  - $S_{\text{inherent}}$ (10–30 pts): Baseline regulatory hazard weight from EFSA/Codex ADI ratings.
  - $S_{\text{interaction}}$ (30–40 pts): Synergistic chemical cocktail alert flag.
  - $S_{\text{pediatric}}$ (20–35 pts): Child vulnerability penalty based on matched allergies, asthma, hyperactivity flags, and an age penalty for children under 6 years.
  - $S_{\text{exposure}}$ (5–15 pts): 7-Day cumulative dietary exposure index from recent logged scans.
- Categorized into:
  - **Low Concern (0–39):** Safe, natural extracts (e.g. E162 Beetroot Red, E440 Pectin).
  - **Moderate Concern (40–69):** Common synthetic additives with moderate sensitivity.
  - **High Concern (70–100):** Synergistic cocktails or matched child allergens.

### Q8. How does the system handle patient data privacy?
**Answer:**
- The mobile application uses an **offline-first local reactive store (Zustand)**: child health profiles (allergies, names) remain on the client device.
- For the web portals, data sent to the **Regulatory Dashboard** is completely **anonymized and de-identified**: names and IDs are stripped, transmitting only product barcodes, detected additive codes, and coarse geographic regions (e.g. Western Province) to comply with HIPAA, GDPR, and medical ethics requirements.

### Q9. What are the limitations of NutriSafe AI?
**Answer:**
1. **Biological Concentration:** NutriSafe AI is an informational screening decision-support tool. It measures chemical presence and dietary hazard weights, but cannot biologically quantify serum chemical metabolite concentrations in vivo.
2. **Extreme Package Distortion:** Highly crumpled packaging or multilingual overlapping text requires clean user re-framing.
3. **Additive Quantities:** Food manufacturers are legally required to list ingredients in descending order of weight, but rarely state exact milligram quantities per serving, requiring hazard weighting based on rank order and concentration ceilings.

### Q10. What is the future roadmap for regulatory adoption in Sri Lanka?
**Answer:**
- In Sri Lanka, the Food Advisory Committee of the Ministry of Health and the National Medicines Regulatory Authority (NMRA) enforce the Food Act No. 26 of 1980.
- NutriSafe AI's Regulatory Dashboard can serve as a surveillance portal for municipal public health inspectors (PHIs) to monitor the prevalence of unapproved imported synthetic colorants in local retail markets.

---

## 📊 3. Summary of Core Technologies Used
| Tier | Technology Stack | Purpose |
| :--- | :--- | :--- |
| **Mobile Client** | React Native, Expo, Lucide, Zustand, TypeScript | Cross-platform parent scanner application |
| **Backend API** | FastAPI, Uvicorn, Python 3.14, Pydantic | High-performance asynchronous REST microservice |
| **Computer Vision** | OpenCV (`cv2`), NumPy | Bilateral glare filtering & adaptive text segmentation |
| **Machine Learning** | PyTorch Geometric / R-GCN, DistMult | Relational graph link prediction for chemical synergies |
| **Explainable AI** | SHAP (Shapley Additive Explanations) | Local feature attribution for clinical transparency |
| **Web Suite** | Vite, React.js, Tailwind CSS, shadcn/ui, Chart.js | Pediatrician Clinical Portal & Regulatory Surveillance |

---
*Created for University of Moratuwa BIT FYP (ITE 3962) Final Examination Preparation.*
