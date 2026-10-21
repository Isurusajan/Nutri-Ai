# NutriSafe AI 🛡️
### A Multi-Modal Explainable AI System for Personalized Pediatric Food Additive Risk and Chemical Interaction Assessment

**ITE 3962 – Final Year Project**  
**Faculty of Information Technology, University of Moratuwa**  
**Student:** P.K.R. Abeysekara (`E2529001`)

---

## 🏛️ System Architecture

NutriSafe AI provides an evidence-aware decision-support workflow that extracts packaging ingredients, resolves them to standardized chemical entities, screens for synergistic chemical interactions, and calculates a personalized pediatric risk score with SHAP explainability.

```
Bit project/
├── .agents/skills/              # UI/UX Pro Max Design Intelligence Suite
├── backend/                     # Python + FastAPI Backend & AI Pipeline
│   ├── app/
│   │   ├── api/v1/scan.py       # Endpoints: /scan/text, /scan/barcode
│   │   ├── core/config.py       # Settings & environment variables
│   │   ├── models/schemas.py    # Pydantic schemas (Risk, Additive, SHAP)
│   │   ├── services/            # Entity Resolution, Interaction, Risk, SHAP
│   │   └── main.py              # FastAPI app with Swagger UI (/docs)
│   ├── data/
│   │   ├── chemical_dictionary.json   # Standardized E-numbers & synonyms
│   │   └── curated_interactions.json  # Peer-reviewed benchmark interactions
│   └── requirements.txt
├── web/                         # React.js + Tailwind CSS + shadcn/ui
│   ├── src/pages/
│   │   ├── PediatricianPortal.tsx   # Longitudinal exposure chart & scan inspector
│   │   └── RegulatoryDashboard.tsx  # De-identified market statistics & charts
│   └── package.json
└── mobile/                      # React Native (Expo) Parent Consumer App
    ├── src/screens/
    │   ├── HomeScreen.tsx           # Label OCR camera viewfinder & Barcode toggle
    │   ├── ScanResultScreen.tsx     # 0-100 Risk dial, SHAP bars & alternative suggestion
    │   ├── ChildProfileScreen.tsx   # Allergy tags, asthma/ADHD badges & linked doctor
    │   ├── HistoryScreen.tsx        # 7-day cumulative exposure index trend
    │   └── InfoScreen.tsx           # Medical screening disclaimer & how it works
    └── package.json
```

---

## 🚀 Quick Start Guide

### 1. Run the FastAPI Backend (AI Pipeline & Swagger Docs)
```powershell
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
* **Interactive Swagger UI:** Open [http://localhost:8000/docs](http://localhost:8000/docs) in your browser.
* **Health Check:** [http://localhost:8000/health](http://localhost:8000/health)

---

### 2. Run the Web Dashboards (Pediatrician & Regulatory)
```powershell
cd web
npm run dev
```
* **Web Suite URL:** Open [http://localhost:5173](http://localhost:5173) in your browser to view the Pediatrician Decision Support Portal and Regulatory Dashboard.

---

### 3. Run the Parent Mobile App (Expo React Native)
```powershell
cd mobile
npx expo start
```
* Open the **Expo Go** app on your Android/iOS smartphone and scan the terminal QR code to preview the mobile application live.

---

## 🔬 Core Evaluation Benchmark (McCann et al., Lancet 2007)
* **Tested Input:** `Sodium Benzoate (E211)` + `Sunset Yellow FCF (E110)` on an asthmatic child profile with hyperactivity concerns.
* **Result:** **High Concern (95.9 / 100)**
  - Synergistic Interaction (+36.5% relative weight with statutory EU warning citation)
  - Inherent Additive Load (+28.6%)
  - Child Sensitivity & Condition Relevance (+26.1%)
  - 7-Day Cumulative Exposure (+4.7%)
