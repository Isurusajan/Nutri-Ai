import React, { useMemo } from 'react';
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
  imageUri?: string;
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
  addScanRecord: (assessment: ScanAssessmentResponse, imageUri?: string) => void;
  removeScanRecord: (id: string) => void;
  clearHistory: () => void;
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
    id: 'SL-01',
    childId: 'CHD-9021',
    productName: 'Munchee Super Cream Cracker',
    date: 'Today, 18:15',
    timestamp: new Date().toISOString(),
    category: 'Low Concern',
    score: 14,
    color: '#10b981',
    flag: 'Safe traditional leavening (E500, E503) • Zero synthetic dyes',
    imageUri: 'https://cdn.shopify.com/s/files/1/0703/5574/6981/files/3000293-01.jpg?v=1748382637',
    fullAssessment: {
      scan_id: 'SCN-LK-0101',
      product_name: 'Munchee Super Cream Cracker',
      input_type: 'label_ocr',
      detected_additives: [
        { code: 'E500', name: 'Sodium Bicarbonate', category: 'Raising Agent', matched_sensitivities: [] },
        { code: 'E503', name: 'Ammonium Bicarbonate', category: 'Raising Agent', matched_sensitivities: [] },
        { code: 'E322', name: 'Plant Soya Lecithin', category: 'Emulsifier', matched_sensitivities: [] },
      ],
      interaction_detected: false,
      risk_score: 14.0,
      risk_category: 'Low Concern',
      contributing_factors: [
        { factor_name: 'Standard Leavening Agents', impact_direction: 'decreases_risk', relative_weight: 14.0, plain_text_explanation: 'Baking soda (E500) and ammonium carbonates (E503) are safe standard bakery salts.' }
      ],
      disclaimer: 'Screening result for decision support only.',
      timestamp: new Date().toISOString(),
    },
  },
  {
    id: 'SL-02',
    childId: 'CHD-9021',
    productName: 'Kottu Mee Hot & Spicy (80g)',
    date: 'Today, 14:20',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    category: 'High Concern',
    score: 89,
    color: '#f43f5e',
    flag: 'E621 (MSG) + E102 (Tartrazine) + E627/E631 Synergistic Load',
    imageUri: 'https://primakottumee.com/wp-content/uploads/2023/07/prima-kottumee-hot-spicy.png',
    fullAssessment: {
      scan_id: 'SCN-LK-0102',
      product_name: 'Kottu Mee Hot & Spicy (80g)',
      input_type: 'label_ocr',
      detected_additives: [
        { code: 'E102', name: 'Tartrazine', category: 'Artificial Colorant (Azo Dye)', matched_sensitivities: ['asthma_sensitivity', 'allergy_match'] },
        { code: 'E621', name: 'Monosodium Glutamate', category: 'Flavour Enhancer', matched_sensitivities: ['asthma_sensitivity'] },
        { code: 'E627', name: 'Disodium Guanylate', category: 'Flavour Enhancer', matched_sensitivities: [] },
        { code: 'E631', name: 'Disodium Inosinate', category: 'Flavour Enhancer', matched_sensitivities: [] },
        { code: 'E150d', name: 'Caramel IV (Sulfite Ammonia)', category: 'Colorant', matched_sensitivities: [] },
      ],
      interaction_detected: true,
      interaction_evidence_source: 'McCann et al., Lancet 2007 (doi: 10.1016/S0140-6736(07)61306-3) & EFSA MSG Exposure Benchmark',
      risk_score: 89.0,
      risk_category: 'High Concern',
      contributing_factors: [
        { factor_name: 'Direct Child Allergy Match (E102 Tartrazine)', impact_direction: 'increases_risk', relative_weight: 44.0, plain_text_explanation: 'Tartrazine matches active allergy profile for Senudi.' },
        { factor_name: 'MSG + Nucleotide Flavor Synergy (E621 + E627 + E631)', impact_direction: 'increases_risk', relative_weight: 31.0, plain_text_explanation: 'High cumulative glutamate load exacerbates pediatric asthma and bronchospasm risks.' },
        { factor_name: 'Artificial Azo Dye Exposure', impact_direction: 'increases_risk', relative_weight: 14.0, plain_text_explanation: 'Southampton azo dye linked to pediatric hyper-reactivity.' }
      ],
      disclaimer: 'Screening result for decision support only. Does not measure biological toxicity or replace medical diagnosis.',
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
  },
  {
    id: 'SL-03',
    childId: 'CHD-9021',
    productName: 'Munchee Lemon Puff (100g)',
    date: 'Yesterday, 16:10',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    category: 'High Concern',
    score: 76,
    color: '#f43f5e',
    flag: 'Direct Child Allergy Match: Tartrazine (E102)',
    imageUri: 'https://cdn.shopify.com/s/files/1/0703/5574/6981/files/3014367-2_1.jpg?v=1748383252',
    fullAssessment: {
      scan_id: 'SCN-LK-0103',
      product_name: 'Munchee Lemon Puff (100g)',
      input_type: 'barcode_lookup',
      detected_additives: [
        { code: 'E102', name: 'Tartrazine', category: 'Artificial Colorant (Azo Dye)', matched_sensitivities: ['asthma_sensitivity', 'allergy_match'] },
        { code: 'E330', name: 'Citric Acid', category: 'Acidity Regulator', matched_sensitivities: [] },
        { code: 'E500', name: 'Sodium Carbonates', category: 'Raising Agent', matched_sensitivities: [] },
        { code: 'E322', name: 'Plant Lecithin', category: 'Emulsifier', matched_sensitivities: [] },
      ],
      interaction_detected: false,
      risk_score: 76.0,
      risk_category: 'High Concern',
      contributing_factors: [
        { factor_name: 'Direct Child Allergy Match (E102 Tartrazine)', impact_direction: 'increases_risk', relative_weight: 56.0, plain_text_explanation: 'Yellow azo dye Tartrazine matches Senudi\'s known allergy profile.' }
      ],
      disclaimer: 'Screening result for decision support only.',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    },
  },
  {
    id: 'SL-04',
    childId: 'CHD-9021',
    productName: 'Munchee Chocolate Biscuit',
    date: 'Yesterday, 11:30',
    timestamp: new Date(Date.now() - 92000000).toISOString(),
    category: 'Moderate Concern',
    score: 38,
    color: '#f59e0b',
    flag: 'Cocoa powder • Emulsifier (E322, E471) • Raising agent (E500)',
    imageUri: 'https://cdn.shopify.com/s/files/1/0703/5574/6981/files/3000075-1.jpg?v=1748382602',
    fullAssessment: {
      scan_id: 'SCN-LK-0104',
      product_name: 'Munchee Chocolate Biscuit',
      input_type: 'label_ocr',
      detected_additives: [
        { code: 'E322', name: 'Soy Lecithin', category: 'Emulsifier', matched_sensitivities: [] },
        { code: 'E471', name: 'Mono- and Diglycerides of Fatty Acids', category: 'Emulsifier', matched_sensitivities: [] },
        { code: 'E500', name: 'Sodium Bicarbonate', category: 'Raising Agent', matched_sensitivities: [] },
      ],
      interaction_detected: false,
      risk_score: 38.0,
      risk_category: 'Moderate Concern',
      contributing_factors: [
        { factor_name: 'Standard Bakery Additive Load', impact_direction: 'increases_risk', relative_weight: 24.0, plain_text_explanation: 'Cocoa solids and food-grade bakery emulsifiers; safe under standard daily intake.' }
      ],
      disclaimer: 'Screening result for decision support only.',
      timestamp: new Date(Date.now() - 92000000).toISOString(),
    },
  },
  {
    id: 'SL-05',
    childId: 'CHD-9021',
    productName: 'Anchor Full Cream Milk Powder',
    date: '20 Oct, 08:30',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    category: 'Low Concern',
    score: 8,
    color: '#10b981',
    flag: '100% Pure Dairy • Natural Soy Lecithin (E322) • Fortified',
    imageUri: 'https://cdn.shopify.com/s/files/1/0703/5574/6981/files/Anchor-Full-Cream-Carton-400g-Relaunch-Stage-01-_FOP_-_CMYK_-DSK__Croped.png?v=1756959499',
    fullAssessment: {
      scan_id: 'SCN-LK-0105',
      product_name: 'Anchor Full Cream Milk Powder',
      input_type: 'barcode_lookup',
      detected_additives: [
        { code: 'E322', name: 'Soy Lecithin', category: 'Natural Emulsifier', matched_sensitivities: [] },
      ],
      interaction_detected: false,
      risk_score: 8.0,
      risk_category: 'Low Concern',
      contributing_factors: [],
      disclaimer: 'Screening result for decision support only.',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
    },
  },
  {
    id: 'SL-06',
    childId: 'CHD-9021',
    productName: 'Elephant House Cream Soda (400ml)',
    date: '19 Oct, 17:00',
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    category: 'High Concern',
    score: 82,
    color: '#f43f5e',
    flag: 'Tartrazine (E102) Allergy Match + Sodium Benzoate (E211)',
    imageUri: 'https://cdn.shopify.com/s/files/1/0703/5574/6981/files/3002486-1.jpg?v=1748382798',
    fullAssessment: {
      scan_id: 'SCN-LK-0106',
      product_name: 'Elephant House Cream Soda (400ml)',
      input_type: 'label_ocr',
      detected_additives: [
        { code: 'E102', name: 'Tartrazine', category: 'Artificial Colorant (Azo Dye)', matched_sensitivities: ['allergy_match', 'asthma_sensitivity'] },
        { code: 'E211', name: 'Sodium Benzoate', category: 'Preservative', matched_sensitivities: ['asthma_sensitivity'] },
        { code: 'E330', name: 'Citric Acid', category: 'Acidity Regulator', matched_sensitivities: [] },
      ],
      interaction_detected: true,
      interaction_evidence_source: 'Southampton Randomized Trial (Lancet 2007) & SLSI Guidelines',
      risk_score: 82.0,
      risk_category: 'High Concern',
      contributing_factors: [
        { factor_name: 'Child Allergy Match (E102)', impact_direction: 'increases_risk', relative_weight: 48.0, plain_text_explanation: 'Direct sensitivity match for Senudi.' }
      ],
      disclaimer: 'Screening result for decision support only.',
      timestamp: new Date(Date.now() - 259200000).toISOString(),
    },
  },
  {
    id: 'SL-07',
    childId: 'CHD-9021',
    productName: 'Maliban Gold Marie',
    date: '18 Oct, 09:15',
    timestamp: new Date(Date.now() - 345600000).toISOString(),
    category: 'Low Concern',
    score: 16,
    color: '#10b981',
    flag: 'Wheat flour, milk solids, raising agents (E500, E503) • Safe',
    imageUri: 'https://cdn.shopify.com/s/files/1/0703/5574/6981/files/3000957-1.jpg?v=1748382693',
    fullAssessment: {
      scan_id: 'SCN-LK-0107',
      product_name: 'Maliban Gold Marie',
      input_type: 'label_ocr',
      detected_additives: [
        { code: 'E500', name: 'Sodium Bicarbonate', category: 'Raising Agent', matched_sensitivities: [] },
        { code: 'E503', name: 'Ammonium Bicarbonate', category: 'Raising Agent', matched_sensitivities: [] },
        { code: 'E322', name: 'Lecithin', category: 'Emulsifier', matched_sensitivities: [] },
      ],
      interaction_detected: false,
      risk_score: 16.0,
      risk_category: 'Low Concern',
      contributing_factors: [],
      disclaimer: 'Screening result for decision support only.',
      timestamp: new Date(Date.now() - 345600000).toISOString(),
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

  addScanRecord: (assessment: ScanAssessmentResponse, imageUri?: string) => {
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

    const resolvedImage =
      imageUri ||
      (assessment as any).product_image_url ||
      getFoodItemImageUri(assessment.product_name || '');

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
      imageUri: resolvedImage,
      fullAssessment: assessment,
    };

    set((state) => ({
      history: [newItem, ...state.history],
    }));
  },

  removeScanRecord: (id: string) => {
    set((state) => ({
      history: state.history.filter((h) => h.id !== id),
    }));
  },

  clearHistory: () => {
    set({ history: [] });
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
    name: 'nutrisafe_app_storage_v4',
    storage: createJSONStorage(() => AsyncStorage),
    partialize: (state) => ({
      activeChildId: state.activeChildId,
      children: state.children,
      history: state.history,
    }),
  }
));

/**
 * React Hooks providing memoized selectors to prevent infinite re-render loops (REQ / React 18+ snapshot cache)
 */
export function useActiveChild(): ChildProfile {
  const children = useAppStore((state) => state.children);
  const activeChildId = useAppStore((state) => state.activeChildId);
  return useMemo(() => {
    return (
      children.find((c) => c.id === activeChildId) ||
      children[0] ||
      INITIAL_CHILDREN[0]
    );
  }, [children, activeChildId]);
}

export function useActiveChildHistory(): ScanHistoryItem[] {
  const history = useAppStore((state) => state.history);
  const activeChildId = useAppStore((state) => state.activeChildId);
  return useMemo(() => {
    return history.filter((h) => h.childId === activeChildId);
  }, [history, activeChildId]);
}

export function use7DayExposureIndex(): number {
  const activeHistory = useActiveChildHistory();
  return useMemo(() => {
    if (activeHistory.length === 0) return 15;

    const totalScore = activeHistory.reduce((acc, item) => acc + item.score, 0);
    const avgScore = totalScore / activeHistory.length;
    const countLoad = Math.min(activeHistory.length * 4, 30);
    const index = Math.min(Math.round(avgScore * 0.7 + countLoad), 100);
    return Math.max(index, 10);
  }, [activeHistory]);
}

/**
 * Returns authentic Sri Lankan food packaging photo or resolved imageUri for a given item
 */
export function getFoodItemImageUri(productName: string, imageUri?: string): string {
  // If an imageUri is already provided and not an old generic unsplash placeholder, keep it
  if (imageUri && imageUri.trim() && !imageUri.includes('images.unsplash.com')) {
    return imageUri;
  }
  const name = productName.toLowerCase();
  if (name.includes('kottu') || name.includes('mee') || name.includes('noodle') || name.includes('prima')) {
    return 'https://primakottumee.com/wp-content/uploads/2023/07/prima-kottumee-hot-spicy.png';
  }
  if (name.includes('lemon puff') || name.includes('lemon')) {
    return 'https://cdn.shopify.com/s/files/1/0703/5574/6981/files/3014367-2_1.jpg?v=1748383252';
  }
  if (name.includes('cream cracker') || name.includes('cracker')) {
    return 'https://cdn.shopify.com/s/files/1/0703/5574/6981/files/3000293-01.jpg?v=1748382637';
  }
  if (name.includes('marie') || name.includes('gold marie')) {
    return 'https://cdn.shopify.com/s/files/1/0703/5574/6981/files/3000957-1.jpg?v=1748382693';
  }
  if (name.includes('chocolate') || name.includes('chocklate') || name.includes('biscuit') || name.includes('puff')) {
    return 'https://cdn.shopify.com/s/files/1/0703/5574/6981/files/3000075-1.jpg?v=1748382602';
  }
  if (name.includes('anchor') || name.includes('kiri') || name.includes('milk') || name.includes('piti')) {
    return 'https://cdn.shopify.com/s/files/1/0703/5574/6981/files/Anchor-Full-Cream-Carton-400g-Relaunch-Stage-01-_FOP_-_CMYK_-DSK__Croped.png?v=1756959499';
  }
  if (name.includes('cream soda') || name.includes('soda') || name.includes('fizzy') || name.includes('drink') || name.includes('beverage') || name.includes('elephant')) {
    return 'https://cdn.shopify.com/s/files/1/0703/5574/6981/files/3002486-1.jpg?v=1748382798';
  }
  // Default to CBL Super Cream Cracker pack
  return 'https://cdn.shopify.com/s/files/1/0703/5574/6981/files/3000293-01.jpg?v=1748382637';
}
