import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScanAssessmentResponse, AdditiveDetail, SHAPExplanationFactor } from '../api/client';

export interface ChildProfile {
  id: string;
  name: string;
  birthDate: string;
  ageYears: number;
  avatarUri?: string;
  allergies: string[];
  sensitivities: string[];
  conditions: string[];
  linkedPediatrician: string;
}

export interface ScanHistoryItem {
  id: string;
  childId: string;
  productName: string;
  date: string;
  timestamp: string;
  category: 'Low Concern' | 'Moderate Concern' | 'High Concern';
  score: number;
  color: string;
  flag: string;
  fullAssessment: ScanAssessmentResponse;
}

interface AppState {
  // Child Profiles
  activeChildId: string;
  children: ChildProfile[];
  
  // History
  history: ScanHistoryItem[];

  // Actions
  getActiveChild: () => ChildProfile;
  setActiveChild: (id: string) => void;
  updateActiveChild: (updates: Partial<ChildProfile>) => void;
  addChild: (newChild: Omit<ChildProfile, 'id'>) => string;
  removeChild: (id: string) => void;
  addAllergy: (allergy: string) => void;
  removeAllergy: (allergy: string) => void;
  addCondition: (condition: string) => void;
  removeCondition: (condition: string) => void;

  // History Actions
  addScanRecord: (assessment: ScanAssessmentResponse) => void;
  getHistoryForActiveChild: () => ScanHistoryItem[];
  get7DayExposureIndex: () => number;
  resetToDemoData: () => void;
}

// Initial Seed Data (SRS Pediatric Prototype)
const INITIAL_CHILDREN: ChildProfile[] = [
  {
    id: 'CHD-9021',
    name: 'Senudi Perera',
    birthDate: '2022-08-15',
    ageYears: 4.2,
    allergies: ['Tartrazine (E102)', 'Peanuts'],
    sensitivities: ['Artificial Colorants', 'Benzoate Preservatives'],
    conditions: ['Mild Asthma', 'ADHD / Hyperactivity'],
    linkedPediatrician: 'Dr. K. Jayasuriya (Lady Ridgeway Hospital)',
  },
  {
    id: 'CHD-9022',
    name: 'Kasun Perera',
    birthDate: '2024-01-10',
    ageYears: 2.8,
    allergies: ['Cow Milk Protein', 'Soy'],
    sensitivities: ['Sulfites (E220-E228)'],
    conditions: ['Atopic Dermatitis (Eczema)'],
    linkedPediatrician: 'Dr. K. Jayasuriya (Lady Ridgeway Hospital)',
  },
];

const INITIAL_HISTORY: ScanHistoryItem[] = [
  {
    id: '1',
    childId: 'CHD-9021',
    productName: 'Fizzy Orange Nectar (250ml)',
    date: 'Today, 16:45',
    timestamp: new Date().toISOString(),
    category: 'High Concern',
    score: 84,
    color: '#f43f5e',
    flag: 'E211 + E110 Synergistic Interaction',
    fullAssessment: {
      scan_id: 'SCN-HST-8411',
      product_name: 'Fizzy Orange Nectar (250ml)',
      input_type: 'label_ocr',
      detected_additives: [
        { code: 'E110', name: 'Sunset Yellow FCF', category: 'Artificial Colorant (Azo Dye)', matched_sensitivities: ['hyperactivity_interaction', 'asthma_sensitivity'] },
        { code: 'E211', name: 'Sodium Benzoate', category: 'Preservative', matched_sensitivities: ['hyperactivity_interaction', 'asthma_sensitivity'] },
        { code: 'E330', name: 'Citric Acid', category: 'Acidity Regulator', matched_sensitivities: [] },
      ],
      interaction_detected: true,
      interaction_evidence_source: 'McCann et al., Lancet 2007 (doi: 10.1016/S0140-6736(07)61306-3)',
      risk_score: 84.0,
      risk_category: 'High Concern',
      contributing_factors: [
        { factor_name: 'Synergistic Additive Interaction (E211 + E110)', impact_direction: 'increases_risk', relative_weight: 36.5, plain_text_explanation: 'Detected combination E211 + E110 contributes +36.5% to the risk score.' },
        { factor_name: 'Inherent Chemical Additive Load', impact_direction: 'increases_risk', relative_weight: 28.6, plain_text_explanation: 'Regulatory hazard weights account for +28.6% of the score.' },
        { factor_name: 'Child Condition & Sensitivity Relevance', impact_direction: 'increases_risk', relative_weight: 26.1, plain_text_explanation: 'Correlates with child vulnerabilities (Asthma, ADHD), accounting for +26.1%.' },
      ],
      disclaimer: 'Screening result for decision support only. Does not measure biological toxicity or replace medical diagnosis.',
      timestamp: new Date().toISOString(),
    },
  },
  {
    id: '2',
    childId: 'CHD-9021',
    productName: 'Savory Cheese Flavored Rings',
    date: 'Yesterday, 11:20',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    category: 'Moderate Concern',
    score: 62,
    color: '#f59e0b',
    flag: 'Tartrazine (E102) Allergy Match',
    fullAssessment: {
      scan_id: 'SCN-HST-8412',
      product_name: 'Savory Cheese Flavored Rings',
      input_type: 'barcode_lookup',
      detected_additives: [
        { code: 'E102', name: 'Tartrazine', category: 'Artificial Colorant (Azo Dye)', matched_sensitivities: ['asthma_sensitivity', 'allergy_match'] },
        { code: 'E621', name: 'Monosodium Glutamate', category: 'Flavour Enhancer', matched_sensitivities: [] },
      ],
      interaction_detected: false,
      risk_score: 62.0,
      risk_category: 'Moderate Concern',
      contributing_factors: [
        { factor_name: 'Direct Child Allergy Match (E102)', impact_direction: 'increases_risk', relative_weight: 48.0, plain_text_explanation: 'Tartrazine matches active allergy profile for child.' },
      ],
      disclaimer: 'Screening result for decision support only.',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    },
  },
  {
    id: '3',
    childId: 'CHD-9021',
    productName: 'Organic Strawberry Yogurt',
    date: '08 Oct, 08:30',
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    category: 'Low Concern',
    score: 18,
    color: '#10b981',
    flag: 'Safe natural extracts (E162, E440)',
    fullAssessment: {
      scan_id: 'SCN-HST-8413',
      product_name: 'Organic Strawberry Yogurt',
      input_type: 'label_ocr',
      detected_additives: [
        { code: 'E162', name: 'Beetroot Red', category: 'Natural Colorant', matched_sensitivities: [] },
        { code: 'E440', name: 'Pectins', category: 'Gelling Agent', matched_sensitivities: [] },
      ],
      interaction_detected: false,
      risk_score: 18.0,
      risk_category: 'Low Concern',
      contributing_factors: [],
      disclaimer: 'Screening result for decision support only.',
      timestamp: new Date(Date.now() - 259200000).toISOString(),
    },
  },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeChildId: 'CHD-9021',
      children: INITIAL_CHILDREN,
      history: INITIAL_HISTORY,

      getActiveChild: () => {
        const { children, activeChildId } = get();
        return (
          children.find((c) => c.id === activeChildId) ||
          children[0] ||
          INITIAL_CHILDREN[0]
        );
      },

      setActiveChild: (id: string) => {
        set({ activeChildId: id });
      },

      updateActiveChild: (updates: Partial<ChildProfile>) => {
        set((state) => ({
          children: state.children.map((c) => {
            if (c.id === state.activeChildId) {
              const updated = { ...c, ...updates };
              if (updates.birthDate && updates.ageYears === undefined) {
                const birth = new Date(updates.birthDate);
                if (!isNaN(birth.getTime())) {
                  const diffMs = Date.now() - birth.getTime();
                  const age = diffMs / (1000 * 60 * 60 * 24 * 365.25);
                  updated.ageYears = Math.max(0.1, Math.round(age * 10) / 10);
                }
              }
              return updated;
            }
            return c;
          }),
        }));
      },

      addChild: (newChildData) => {
        const id = `CHD-${Math.floor(1000 + Math.random() * 9000)}`;
        const newChild: ChildProfile = {
          ...newChildData,
          id,
        };
        set((state) => ({
          children: [...state.children, newChild],
          activeChildId: id,
        }));
        return id;
      },

      removeChild: (id: string) => {
        set((state) => {
          const remaining = state.children.filter((c) => c.id !== id);
          if (remaining.length === 0) return state;
          return {
            children: remaining,
            activeChildId: state.activeChildId === id ? remaining[0].id : state.activeChildId,
          };
        });
      },

  addAllergy: (allergy: string) => {
    if (!allergy.trim()) return;
    set((state) => ({
      children: state.children.map((c) => {
        if (c.id === state.activeChildId && !c.allergies.includes(allergy.trim())) {
          return { ...c, allergies: [...c.allergies, allergy.trim()] };
        }
        return c;
      }),
    }));
  },

  removeAllergy: (allergy: string) => {
    set((state) => ({
      children: state.children.map((c) => {
        if (c.id === state.activeChildId) {
          return { ...c, allergies: c.allergies.filter((a) => a !== allergy) };
        }
        return c;
      }),
    }));
  },

  addCondition: (condition: string) => {
    if (!condition.trim()) return;
    set((state) => ({
      children: state.children.map((c) => {
        if (c.id === state.activeChildId && !c.conditions.includes(condition.trim())) {
          return { ...c, conditions: [...c.conditions, condition.trim()] };
        }
        return c;
      }),
    }));
  },

  removeCondition: (condition: string) => {
    set((state) => ({
      children: state.children.map((c) => {
        if (c.id === state.activeChildId) {
          return { ...c, conditions: c.conditions.filter((cond) => cond !== condition) };
        }
        return c;
      }),
    }));
  },

  addScanRecord: (assessment: ScanAssessmentResponse) => {
    const activeChild = get().getActiveChild();
    const isHigh = assessment.risk_category === 'High Concern';
    const isMod = assessment.risk_category === 'Moderate Concern';
    const color = isHigh ? '#f43f5e' : isMod ? '#f59e0b' : '#10b981';

    let flag = 'Natural / Low risk additives';
    if (assessment.interaction_detected) {
      flag = 'Synergistic Chemical Interaction Detected';
    } else if (isHigh) {
      flag = 'High Chemical Additive Load';
    } else if (isMod) {
      flag = 'Potential Sensitivity Match';
    }

    const newItem: ScanHistoryItem = {
      id: assessment.scan_id || `SCN-${Date.now()}`,
      childId: activeChild.id,
      productName: assessment.product_name || 'Assessed Food Item',
      date: 'Just now',
      timestamp: new Date().toISOString(),
      category: assessment.risk_category,
      score: Math.round(assessment.risk_score),
      color,
      flag,
      fullAssessment: assessment,
    };

    set((state) => ({
      history: [newItem, ...state.history],
    }));
  },

  getHistoryForActiveChild: () => {
    const { history, activeChildId } = get();
    return history.filter((h) => h.childId === activeChildId);
  },

  get7DayExposureIndex: () => {
    const activeHistory = get().getHistoryForActiveChild();
    if (activeHistory.length === 0) return 15.0;

    // Sum scores of recent items normalized to 0-100 index
    const totalScore = activeHistory.reduce((acc, item) => acc + item.score, 0);
    const avgScore = totalScore / activeHistory.length;
    // Exposure index formula incorporates scan count load
    const countLoad = Math.min(activeHistory.length * 4, 30);
    const index = Math.min(Math.round(avgScore * 0.7 + countLoad), 100);
    return Math.max(index, 10);
  },

  resetToDemoData: () => {
    set({
      activeChildId: 'CHD-9021',
      children: INITIAL_CHILDREN,
      history: INITIAL_HISTORY,
    });
  },
}),
  {
    name: 'nutrisafe_app_storage_v1',
    storage: createJSONStorage(() => AsyncStorage),
    partialize: (state) => ({
      activeChildId: state.activeChildId,
      children: state.children,
      history: state.history,
    }),
  }
));
