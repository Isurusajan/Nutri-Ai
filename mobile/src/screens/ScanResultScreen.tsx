import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Share,
  Image,
  Dimensions,
} from 'react-native';
import {
  ArrowLeft,
  Share2,
  Bookmark,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Check,
  Atom,
  Wheat,
  Fish,
  Apple,
  Candy,
  Flame,
  Zap,
  Droplet,
  Cookie,
  Smile,
  Baby,
  Cpu,
  Eye,
  Info,
  ListFilter,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { ScanAssessmentResponse, ParsedIngredientItem } from '../api/client';
import { useAppStore } from '../store/useAppStore';

const { width } = Dimensions.get('window');

interface ScanResultScreenProps {
  result: ScanAssessmentResponse;
  onBack: () => void;
  imageUri?: string;
}

export function ScanResultScreen({ result, onBack, imageUri }: ScanResultScreenProps) {
  const activeChild = useAppStore((state) => state.getActiveChild());

  const [savedBookmark, setSavedBookmark] = useState(false);
  const [showAllText, setShowAllText] = useState(false);
  const [showClinicalData, setShowClinicalData] = useState(false);
  const [ingredientFilter, setIngredientFilter] = useState<'all' | 'safe' | 'caution' | 'concerning'>('all');
  const [expandedIngredient, setExpandedIngredient] = useState<number | null>(null);

  // Health Score (0-100 where 100 is best, like Yuka & Bear Food Scanner)
  const healthScore = Math.max(0, Math.min(100, Math.round(100 - result.risk_score)));
  const isGreat = healthScore >= 75;
  const isModerate = healthScore >= 45 && healthScore < 75;
  const isBad = healthScore < 45;

  const scoreColor = isGreat ? '#10b981' : isModerate ? '#f59e0b' : '#ef4444';
  const scoreRating = isGreat ? 'GREAT' : isModerate ? 'MODERATE' : 'POOR';

  const handleShare = async () => {
    try {
      const additivesList = result.detected_additives.map((a) => `${a.code} (${a.name})`).join(', ');
      const message = `NutriSafe AI Assessment Result:\n\nProduct: ${result.product_name || 'Food Item'}\nHealth Rating: ${healthScore}/100 (${scoreRating})\nFor: ${activeChild.name} (${activeChild.ageYears} yrs)\n${result.detected_additives.length > 0 ? `Additives: ${additivesList}\n` : '100% Clean Additive Profile\n'}${result.interaction_detected ? `Chemical Synergy Flag: Mixture interaction detected\n` : ''}\nScreened with NutriSafe AI.`;
      await Share.share({
        message,
        title: `NutriSafe AI Assessment: ${result.product_name || 'Food Item'}`,
      });
    } catch (err) {
      console.log('Share error:', err);
    }
  };

  // Build Negatives & Positives items for the Yuka-style breakdown
  const negatives: Array<{
    icon: any;
    title: string;
    subtitle: string;
    metric: string;
    dotColor: string;
  }> = [];

  const positives: Array<{
    icon: any;
    title: string;
    subtitle: string;
    metric: string;
    dotColor: string;
  }> = [];

  // 1. Process Negatives
  if (result.detected_additives && result.detected_additives.length > 0) {
    negatives.push({
      icon: Atom,
      title: 'Additives',
      subtitle: `Contains ${result.detected_additives.length} additive(s) to avoid (${result.detected_additives.map((a) => a.code).join(', ')})`,
      metric: `${result.detected_additives.length}`,
      dotColor: '#ef4444',
    });
  }

  if (result.interaction_detected) {
    negatives.push({
      icon: Zap,
      title: 'Cocktail Effect',
      subtitle: 'Combined additive synergy accelerates pediatric sensitivity',
      metric: 'Synergy',
      dotColor: '#ef4444',
    });
  }

  // Parse cautions from ingredient list
  const parsedItems = result.parsed_ingredients || [];
  parsedItems.forEach((item) => {
    const lower = item.name.toLowerCase();
    if (item.status === 'caution' || item.status === 'concerning') {
      if (lower.includes('sugar') || lower.includes('jaggery') || lower.includes('sweetener')) {
        negatives.push({
          icon: Candy,
          title: item.name,
          subtitle: 'Added caloric sweetener; consume in moderation',
          metric: 'Sweetener',
          dotColor: '#f97316',
        });
      } else if (lower.includes('salt') || lower.includes('sodium')) {
        negatives.push({
          icon: Flame,
          title: item.name,
          subtitle: 'Culinary salt; monitor daily pediatric sodium',
          metric: 'Sodium',
          dotColor: '#f97316',
        });
      } else if (lower.includes('palm')) {
        negatives.push({
          icon: Droplet,
          title: item.name,
          subtitle: 'Vegetable oil high in saturated palmitic acid',
          metric: 'Saturated Fat',
          dotColor: '#f97316',
        });
      } else if (lower.includes('cocoa') || lower.includes('chocolate')) {
        negatives.push({
          icon: Cookie,
          title: item.name,
          subtitle: 'Contains cocoa solids and modest added sugar',
          metric: 'Cocoa',
          dotColor: '#f97316',
        });
      } else {
        negatives.push({
          icon: AlertCircle,
          title: item.name,
          subtitle: item.health_note,
          metric: 'Caution',
          dotColor: '#f97316',
        });
      }
    } else {
      // Safe / Positives
      if (lower.includes('oat') || lower.includes('rice') || lower.includes('wheat') || lower.includes('grain')) {
        positives.push({
          icon: Wheat,
          title: item.name,
          subtitle: 'Complex carbs and wholesome dietary fiber',
          metric: 'Whole Grain',
          dotColor: '#10b981',
        });
      } else if (lower.includes('protein')) {
        positives.push({
          icon: Fish,
          title: item.name,
          subtitle: 'High-quality amino acids supporting child growth',
          metric: 'Protein',
          dotColor: '#10b981',
        });
      } else if (lower.includes('raisin') || lower.includes('date') || lower.includes('fruit')) {
        positives.push({
          icon: Apple,
          title: item.name,
          subtitle: 'Real dried fruit providing natural potassium & iron',
          metric: 'Real Food',
          dotColor: '#10b981',
        });
      } else if (lower.includes('probiotic') || lower.includes('bacillus')) {
        positives.push({
          icon: ShieldCheck,
          title: item.name,
          subtitle: 'Live beneficial cultures for healthy gut flora',
          metric: 'Probiotic',
          dotColor: '#10b981',
        });
      } else if (lower.includes('rosemary') || lower.includes('antioxidant')) {
        positives.push({
          icon: Sparkles,
          title: item.name,
          subtitle: 'Plant-derived botanical antioxidant (no synthetic BHA)',
          metric: 'Natural',
          dotColor: '#10b981',
        });
      } else {
        positives.push({
          icon: CheckCircle,
          title: item.name,
          subtitle: item.health_note,
          metric: 'Clean',
          dotColor: '#10b981',
        });
      }
    }
  });

  // If no additives detected, ensure a positive callout
  if (result.detected_additives.length === 0 && positives.length === 0) {
    positives.push({
      icon: CheckCircle,
      title: 'Clean Additive Profile',
      subtitle: 'Zero artificial azo dyes or toxic chemical preservatives',
      metric: '0 E-Numbers',
      dotColor: '#10b981',
    });
  }

  // Filtered list for the itemized ingredient breakdown
  const filteredIngredients = parsedItems.filter((item) => {
    if (ingredientFilter === 'all') return true;
    return item.status === ingredientFilter;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Top Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navButton} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#0f172a" />
        </TouchableOpacity>

        <View style={styles.navTitleCenter}>
          <Text style={styles.navSuperTitle}>NUTRISAFE AI</Text>
          <Text style={styles.navTitleText}>Product Rating</Text>
        </View>

        <View style={styles.navRightActions}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setSavedBookmark(!savedBookmark)}
            activeOpacity={0.7}
          >
            <Bookmark
              size={18}
              color={savedBookmark ? '#0d9488' : '#0f172a'}
              fill={savedBookmark ? '#0d9488' : 'none'}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} onPress={handleShare} activeOpacity={0.7}>
            <Share2 size={18} color="#0f172a" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* HERO PRODUCT HEADER CARD (Yuka + Bear Scanner Style) */}
        <View style={styles.heroCard}>
          <View style={styles.heroRow}>
            {/* Packaging Image Thumbnail */}
            <View style={styles.productThumbWrap}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.productThumb} resizeMode="cover" />
              ) : (
                <View style={styles.productThumbPlaceholder}>
                  <Cookie size={36} color="#0d9488" />
                  <Text style={styles.thumbPlaceholderText}>Package</Text>
                </View>
              )}
            </View>

            {/* Product Details & Score */}
            <View style={styles.productDetails}>
              <Text style={styles.productTitle} numberOfLines={2}>
                {result.product_name || 'Captured Food Package'}
              </Text>
              <Text style={styles.productSubtitle} numberOfLines={1}>
                Screened for {activeChild.name} • {activeChild.ageYears} yrs
              </Text>

              {/* Big Score & Rating Badge */}
              <View style={styles.scoreRow}>
                <View style={[styles.scoreDot, { backgroundColor: scoreColor }]} />
                <Text style={styles.scoreNumber}>{healthScore}/100</Text>
                <View style={[styles.ratingBadge, { backgroundColor: scoreColor + '18' }]}>
                  <Text style={[styles.ratingBadgeText, { color: scoreColor }]}>{scoreRating}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Friendly Speech Bubble (Bear Food Scanner Style) */}
          <View style={styles.bubbleContainer}>
            <View style={styles.bubbleArrow} />
            <View style={[styles.speechBubble, { borderColor: scoreColor + '30' }]}>
              <Text style={styles.speechBubbleText}>
                {isGreat
                  ? 'Are a great snack! 100% wholesome real foods. 🌿'
                  : isModerate
                  ? 'Acceptable snack in moderation. Watch total sugars. 🟡'
                  : 'Contains high-concern additives! Better to limit. ⚠️'}
              </Text>
            </View>
          </View>
        </View>

        {/* "WHAT'S ACTUALLY IN THIS" CARD (Bear Food Scanner Style) */}
        <View style={styles.actuallyCard}>
          <View style={styles.actuallyHeaderRow}>
            <Text style={styles.actuallyLabel}>WHAT'S ACTUALLY IN THIS</Text>
            <TouchableOpacity onPress={handleShare}>
              <Share2 size={16} color="#78716c" />
            </TouchableOpacity>
          </View>

          <Text style={styles.actuallyHeadline}>
            {isGreat
              ? 'Excellent Food. 100% clean whole ingredients. Nice find! 🔍'
              : isModerate
              ? 'Moderate Choice. Contains added sweetener or salt. ⚖️'
              : 'Concerning Additives. High-hazard E-numbers flagged for toddlers. 🚨'}
          </Text>

          {/* Clean Progress Bar */}
          <View style={styles.actuallyTrack}>
            <View
              style={[
                styles.actuallyFill,
                {
                  width: `${Math.max(15, healthScore)}%`,
                  backgroundColor: scoreColor,
                },
              ]}
            />
          </View>

          <View style={styles.actuallySubRow}>
            <View style={[styles.tinyDot, { backgroundColor: scoreColor }]} />
            <Text style={styles.actuallySubText}>
              {isGreat
                ? 'Real whole-food ingredients 100%'
                : isModerate
                ? 'Mostly wholesome with items to consume in moderation'
                : 'Flagged synthetic chemicals detected'}
            </Text>
          </View>
        </View>

        {/* NEGATIVES SECTION (Yuka Style) */}
        {negatives.length > 0 && (
          <View style={styles.groupSection}>
            <Text style={styles.groupHeading}>Negatives</Text>
            <View style={styles.groupCard}>
              {negatives.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <View
                    key={idx}
                    style={[
                      styles.itemRow,
                      idx < negatives.length - 1 && styles.itemRowBorder,
                    ]}
                  >
                    <View style={styles.itemIconWrap}>
                      <IconComponent size={20} color="#64748b" />
                    </View>
                    <View style={styles.itemContent}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                    </View>
                    <View style={styles.itemRightWrap}>
                      <Text style={styles.itemMetricText}>{item.metric}</Text>
                      <View style={[styles.itemDot, { backgroundColor: item.dotColor }]} />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* POSITIVES SECTION (Yuka Style) */}
        {positives.length > 0 && (
          <View style={styles.groupSection}>
            <Text style={styles.groupHeading}>Positives</Text>
            <View style={styles.groupCard}>
              {positives.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <View
                    key={idx}
                    style={[
                      styles.itemRow,
                      idx < positives.length - 1 && styles.itemRowBorder,
                    ]}
                  >
                    <View style={styles.itemIconWrap}>
                      <IconComponent size={20} color="#64748b" />
                    </View>
                    <View style={styles.itemContent}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                    </View>
                    <View style={styles.itemRightWrap}>
                      <Text style={styles.itemMetricText}>{item.metric}</Text>
                      <View style={[styles.itemDot, { backgroundColor: item.dotColor }]} />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* "SAFE FOR YOUR CHILDREN" PASTEL BOTTOM PILL (Bear Food Scanner Style) */}
        <View
          style={[
            styles.childSafetyPill,
            {
              backgroundColor: isGreat ? '#dcfce7' : isModerate ? '#fef3c7' : '#fee2e2',
            },
          ]}
        >
          {isGreat ? (
            <Smile size={20} color="#166534" />
          ) : isModerate ? (
            <Baby size={20} color="#92400e" />
          ) : (
            <AlertTriangle size={20} color="#991b1b" />
          )}
          <Text
            style={[
              styles.childSafetyPillText,
              { color: isGreat ? '#166534' : isModerate ? '#92400e' : '#991b1b' },
            ]}
          >
            {isGreat
              ? 'Safe for your children 👶'
              : isModerate
              ? 'Moderate for sensitive toddlers ⚠️'
              : 'Not recommended for young children 🚫'}
          </Text>
        </View>

        {/* ALL INGREDIENTS BREAKDOWN LIST */}
        {parsedItems.length > 0 && (
          <View style={styles.groupSection}>
            <View style={styles.ingredientsHeaderRow}>
              <Text style={styles.groupHeading}>All Ingredients ({parsedItems.length})</Text>
              <Text style={styles.tapToInspectHint}>Tap to view health note</Text>
            </View>

            {/* Filter Chips */}
            <View style={styles.filterChipsRow}>
              <TouchableOpacity
                onPress={() => setIngredientFilter('all')}
                style={[
                  styles.filterChip,
                  ingredientFilter === 'all' && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    ingredientFilter === 'all' && styles.filterChipTextActive,
                  ]}
                >
                  All ({parsedItems.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIngredientFilter('safe')}
                style={[
                  styles.filterChip,
                  ingredientFilter === 'safe' && styles.filterChipActiveSafe,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    ingredientFilter === 'safe' && styles.filterChipTextActiveSafe,
                  ]}
                >
                  🟢 Safe ({parsedItems.filter((i) => i.status === 'safe').length})
                </Text>
              </TouchableOpacity>

              {parsedItems.some((i) => i.status === 'caution') && (
                <TouchableOpacity
                  onPress={() => setIngredientFilter('caution')}
                  style={[
                    styles.filterChip,
                    ingredientFilter === 'caution' && styles.filterChipActiveCaution,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      ingredientFilter === 'caution' && styles.filterChipTextActiveCaution,
                    ]}
                  >
                    🟡 Caution ({parsedItems.filter((i) => i.status === 'caution').length})
                  </Text>
                </TouchableOpacity>
              )}

              {parsedItems.some((i) => i.status === 'concerning') && (
                <TouchableOpacity
                  onPress={() => setIngredientFilter('concerning')}
                  style={[
                    styles.filterChip,
                    ingredientFilter === 'concerning' && styles.filterChipActiveConcern,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      ingredientFilter === 'concerning' && styles.filterChipTextActiveConcern,
                    ]}
                  >
                    🔴 Concern ({parsedItems.filter((i) => i.status === 'concerning').length})
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Ingredient Cards */}
            <View style={styles.groupCard}>
              {filteredIngredients.map((item, idx) => {
                const isItemSafe = item.status === 'safe';
                const isItemCaution = item.status === 'caution';
                const itemDot = isItemSafe ? '#10b981' : isItemCaution ? '#f59e0b' : '#ef4444';
                const isExpanded = expandedIngredient === idx;

                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setExpandedIngredient(isExpanded ? null : idx)}
                    activeOpacity={0.7}
                    style={[
                      styles.ingredientRow,
                      idx < filteredIngredients.length - 1 && styles.itemRowBorder,
                    ]}
                  >
                    <View style={styles.ingredientTop}>
                      <View style={[styles.itemDot, { backgroundColor: itemDot, marginTop: 4 }]} />
                      <View style={{ flex: 1 }}>
                        <View style={styles.ingredientNameRow}>
                          <Text style={styles.ingredientName}>{item.name}</Text>
                          {item.e_code && (
                            <View style={styles.eCodePill}>
                              <Text style={styles.eCodePillText}>{item.e_code}</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.ingredientCategory}>{item.category}</Text>
                      </View>
                      {isExpanded ? (
                        <ChevronUp size={16} color="#94a3b8" />
                      ) : (
                        <ChevronDown size={16} color="#94a3b8" />
                      )}
                    </View>

                    {isExpanded && (
                      <View style={styles.ingredientExpandedNote}>
                        <Text style={styles.ingredientHealthNote}>{item.health_note}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* SAFER ALTERNATIVE RECOMMENDATION (If Bad / High Concern) */}
        {isBad && (
          <View style={styles.altCard}>
            <Text style={styles.altHeading}>Safer Alternative Suggestion</Text>
            <View style={styles.altItem}>
              <CheckCircle size={20} color="#10b981" />
              <View style={{ flex: 1 }}>
                <Text style={styles.altTitle}>100% Organic Fruit Purée (No Additives)</Text>
                <Text style={styles.altSub}>Score: 98/100 • 100% Whole fruit • E-Number Free</Text>
              </View>
            </View>
          </View>
        )}

        {/* COLLAPSIBLE CLINICAL AI & EXPLAINABILITY DRAWER */}
        <View style={styles.clinicalDrawerWrap}>
          <TouchableOpacity
            style={styles.clinicalDrawerHeader}
            onPress={() => setShowClinicalData(!showClinicalData)}
            activeOpacity={0.75}
          >
            <View style={styles.drawerHeaderLeft}>
              <Cpu size={18} color="#0d9488" />
              <Text style={styles.drawerHeaderText}>
                Clinical AI & Explainability Data (SHAP)
              </Text>
            </View>
            {showClinicalData ? (
              <ChevronUp size={18} color="#0d9488" />
            ) : (
              <ChevronDown size={18} color="#0d9488" />
            )}
          </TouchableOpacity>

          {showClinicalData && (
            <View style={styles.clinicalDrawerContent}>
              {/* SHAP Attribution Bars */}
              {result.contributing_factors && result.contributing_factors.length > 0 && (
                <View style={styles.shapBox}>
                  <Text style={styles.drawerSubHeading}>Risk Feature Attributions (SHAP):</Text>
                  {result.contributing_factors.map((factor, idx) => (
                    <View key={idx} style={styles.shapRow}>
                      <View style={styles.shapLabels}>
                        <Text style={styles.shapFactorName}>{factor.factor_name}</Text>
                        <Text style={styles.shapWeight}>+{factor.relative_weight}%</Text>
                      </View>
                      <View style={styles.shapTrack}>
                        <View
                          style={[
                            styles.shapFill,
                            {
                              width: `${Math.min(100, factor.relative_weight * 2)}%`,
                              backgroundColor:
                                factor.relative_weight > 30 ? '#ef4444' : '#0d9488',
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.shapExplain}>{factor.plain_text_explanation}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Extracted Text */}
              {result.extracted_text && (
                <View style={styles.extractedBox}>
                  <View style={styles.extractedHeader}>
                    <Text style={styles.drawerSubHeading}>OCR Extracted Label Text:</Text>
                    {result.extracted_text.length > 100 && (
                      <TouchableOpacity onPress={() => setShowAllText(!showAllText)}>
                        <Text style={styles.toggleText}>
                          {showAllText ? 'Show Less' : 'Show All'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text
                    style={styles.extractedContent}
                    numberOfLines={showAllText ? undefined : 3}
                  >
                    "{result.extracted_text}"
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Screening Disclaimer */}
        <View style={styles.disclaimerBox}>
          <Info size={15} color="#94a3b8" />
          <Text style={styles.disclaimerText}>{result.disclaimer}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 36,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  navButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  navTitleCenter: {
    alignItems: 'center',
  },
  navSuperTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0d9488',
    letterSpacing: 0.8,
  },
  navTitleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  navRightActions: {
    flexDirection: 'row',
    gap: 8,
  },

  // HERO PRODUCT CARD
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginTop: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  heroRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  productThumbWrap: {
    width: 76,
    height: 94,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  productThumb: {
    width: '100%',
    height: '100%',
  },
  productThumbPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0fdfa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbPlaceholderText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0d9488',
    marginTop: 4,
  },
  productDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  productTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 22,
    marginBottom: 3,
  },
  productSubtitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 10,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  scoreNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
  },
  ratingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ratingBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  // Friendly Speech Bubble (Bear Food Scanner Style)
  bubbleContainer: {
    marginTop: 12,
    alignItems: 'flex-start',
  },
  bubbleArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#f8fafc',
    marginLeft: 24,
  },
  speechBubble: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    width: '100%',
  },
  speechBubbleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },

  // "WHAT'S ACTUALLY IN THIS" CARD (Bear Food Scanner Style)
  actuallyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  actuallyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  actuallyLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#78716c',
    letterSpacing: 1,
  },
  actuallyHeadline: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1c1917',
    lineHeight: 20,
    marginBottom: 12,
  },
  actuallyTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#f5f5f4',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  actuallyFill: {
    height: '100%',
    borderRadius: 3,
  },
  actuallySubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tinyDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  actuallySubText: {
    fontSize: 11,
    color: '#57534e',
    fontWeight: '500',
  },

  // SECTION HEADINGS & CARDS
  groupSection: {
    marginBottom: 16,
  },
  groupHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 10,
    marginLeft: 2,
  },
  groupCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  itemRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  itemIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 15,
  },
  itemRightWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemMetricText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  itemDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  // "SAFE FOR YOUR CHILDREN" PASTEL BOTTOM PILL
  childSafetyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 18,
  },
  childSafetyPillText: {
    fontSize: 14,
    fontWeight: '800',
  },

  // INGREDIENTS BREAKDOWN LIST
  ingredientsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tapToInspectHint: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  filterChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterChipActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  filterChipActiveSafe: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  filterChipActiveCaution: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  filterChipActiveConcern: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  filterChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  filterChipTextActiveSafe: {
    color: '#ffffff',
    fontWeight: '700',
  },
  filterChipTextActiveCaution: {
    color: '#ffffff',
    fontWeight: '700',
  },
  filterChipTextActiveConcern: {
    color: '#ffffff',
    fontWeight: '700',
  },
  ingredientRow: {
    paddingVertical: 12,
  },
  ingredientTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  ingredientNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  ingredientName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  eCodePill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  eCodePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#475569',
  },
  ingredientCategory: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  ingredientExpandedNote: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    marginLeft: 22,
    borderLeftWidth: 3,
    borderLeftColor: '#0d9488',
  },
  ingredientHealthNote: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 16,
  },

  // SAFER ALTERNATIVE
  altCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 16,
  },
  altHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#166534',
    marginBottom: 8,
  },
  altItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  altTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803d',
  },
  altSub: {
    fontSize: 11,
    color: '#166534',
    marginTop: 1,
  },

  // CLINICAL AI ACCORDION DRAWER
  clinicalDrawerWrap: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    marginBottom: 16,
  },
  clinicalDrawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#f0fdfa',
  },
  drawerHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  drawerHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f766e',
  },
  clinicalDrawerContent: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 14,
  },
  drawerSubHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  shapBox: {
    gap: 8,
  },
  shapRow: {
    marginBottom: 6,
  },
  shapLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  shapFactorName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  shapWeight: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
  },
  shapTrack: {
    height: 5,
    backgroundColor: '#f1f5f9',
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  shapFill: {
    height: '100%',
    borderRadius: 2.5,
  },
  shapExplain: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  extractedBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
  },
  extractedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0d9488',
  },
  extractedContent: {
    fontSize: 11,
    color: '#334155',
    fontStyle: 'italic',
    lineHeight: 16,
    marginTop: 4,
  },

  // DISCLAIMER
  disclaimerBox: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  disclaimerText: {
    fontSize: 10,
    color: '#64748b',
    lineHeight: 15,
    flex: 1,
  },
});
