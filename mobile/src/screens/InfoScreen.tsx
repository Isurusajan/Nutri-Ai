import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, StatusBar, TouchableOpacity, TextInput } from 'react-native';
import { Info, ShieldCheck, Sparkles, AlertTriangle, BookOpen, Stethoscope, GraduationCap, Search, Filter, ShieldAlert } from 'lucide-react-native';
import { NutriSafeBrandHeader } from '../components/NutriSafeBrandHeader';
import { COMMON_ADDITIVES, AdditiveEntry } from '../data/additiveDictionary';

export function InfoScreen({ onReplayIntro }: { onReplayIntro?: () => void } = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<'All' | 'High Concern' | 'Moderate Concern' | 'Low Concern'>('All');
  const [expandedCode, setExpandedCode] = useState<string | null>(null);

  const filteredAdditives = COMMON_ADDITIVES.filter((item) => {
    const matchesSearch =
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterRisk === 'All' || item.riskLevel === filterRisk;
    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <NutriSafeBrandHeader subtitle="Academic Guide & Additive Library" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Academic Project Badge */}
        <View style={styles.academicBanner}>
          <GraduationCap size={22} color="#0d9488" />
          <View style={{ flex: 1 }}>
            <Text style={styles.academicTitle}>University of Moratuwa — BIT FYP</Text>
            <Text style={styles.academicSub}>ITE 3962 • Candidate: P.K.R. Abeysekara (E2529001)</Text>
          </View>
        </View>

        {/* Watch Intro Animation Button */}
        {onReplayIntro && (
          <TouchableOpacity
            style={styles.replayIntroBtn}
            onPress={onReplayIntro}
            activeOpacity={0.8}
          >
            <Sparkles size={16} color="#0d9488" />
            <Text style={styles.replayIntroText}>Watch NutriSafe AI Intro Animation ✨</Text>
          </TouchableOpacity>
        )}

        {/* Searchable Additives Encyclopedia Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <BookOpen size={18} color="#0d9488" />
            <Text style={styles.cardTitle}>Food Additives & E-Numbers Library</Text>
          </View>
          <Text style={styles.subParagraph}>
            Search regulatory hazard evaluations, Southampton trial synergy notes, and EFSA thresholds.
          </Text>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Search size={16} color="#64748b" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search E-number (e.g. E110, E211, E330)..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Filter Pills */}
          <View style={styles.filterRow}>
            {(['All', 'High Concern', 'Moderate Concern', 'Low Concern'] as const).map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[styles.filterPill, filterRisk === filter && styles.filterPillActive]}
                onPress={() => setFilterRisk(filter)}
              >
                <Text style={[styles.filterPillText, filterRisk === filter && styles.filterPillTextActive]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Additive List */}
          <View style={styles.additiveList}>
            {filteredAdditives.map((item) => {
              const isExpanded = expandedCode === item.code;
              const isHigh = item.riskLevel === 'High Concern';
              const isMod = item.riskLevel === 'Moderate Concern';
              const badgeBg = isHigh ? '#fee2e2' : isMod ? '#fef3c7' : '#dcfce7';
              const badgeText = isHigh ? '#b91c1c' : isMod ? '#b45309' : '#15803d';

              return (
                <TouchableOpacity
                  key={item.code}
                  style={styles.additiveItemCard}
                  onPress={() => setExpandedCode(isExpanded ? null : item.code)}
                  activeOpacity={0.7}
                >
                  <View style={styles.additiveItemHeader}>
                    <View style={[styles.additiveCodeBadge, { backgroundColor: badgeBg }]}>
                      <Text style={[styles.additiveCodeText, { color: badgeText }]}>{item.code}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.additiveName}>{item.name}</Text>
                      <Text style={styles.additiveCategory}>{item.category}</Text>
                    </View>
                    <View style={[styles.riskTag, { backgroundColor: badgeBg }]}>
                      <Text style={[styles.riskTagText, { color: badgeText }]}>{item.riskLevel}</Text>
                    </View>
                  </View>

                  {isExpanded && (
                    <View style={styles.additiveDetailsExpanded}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Common Uses:</Text>
                        <Text style={styles.detailValue}>{item.commonUses}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Pediatric Notes:</Text>
                        <Text style={styles.detailValueAlert}>{item.pediatricNotes}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>EFSA / Codex Status:</Text>
                        <Text style={styles.detailValue}>{item.efsaStatus}</Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* How It Works Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Sparkles size={18} color="#0d9488" />
            <Text style={styles.cardTitle}>How It Works</Text>
          </View>
          <Text style={styles.paragraph}>
            1. <Text style={styles.bold}>Capture or Lookup:</Text> Photograph a food package ingredient label or scan its barcode.
          </Text>
          <Text style={styles.paragraph}>
            2. <Text style={styles.bold}>Entity Resolution:</Text> Optical Character Recognition extracts E-Numbers and chemical synonyms against a standardized food additive dictionary.
          </Text>
          <Text style={styles.paragraph}>
            3. <Text style={styles.bold}>Interaction Screening:</Text> A chemical knowledge graph and relational AI model evaluate synergistic chemical interactions.
          </Text>
          <Text style={styles.paragraph}>
            4. <Text style={styles.bold}>Personalized Scoring:</Text> An XGBoost model evaluates the additives against your child's age, allergies, and exposure history with SHAP explainability.
          </Text>
        </View>

        {/* Risk Categories Meaning */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <ShieldCheck size={20} color="#0d9488" />
            <Text style={styles.cardTitle}>Understanding Risk Categories</Text>
          </View>
          <View style={styles.riskRow}>
            <View style={[styles.dot, { backgroundColor: '#10b981' }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.riskLabel}>Low Concern (0–39)</Text>
              <Text style={styles.riskDesc}>Natural extracts or well-tolerated additives with no interaction flags.</Text>
            </View>
          </View>

          <View style={styles.riskRow}>
            <View style={[styles.dot, { backgroundColor: '#f59e0b' }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.riskLabel}>Moderate Concern (40–69)</Text>
              <Text style={styles.riskDesc}>Contains additives with moderate sensitivity relevance or chemical formation notes.</Text>
            </View>
          </View>

          <View style={styles.riskRow}>
            <View style={[styles.dot, { backgroundColor: '#f43f5e' }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.riskLabel}>High Concern (70–100)</Text>
              <Text style={styles.riskDesc}>Matched known child allergies or peer-reviewed additive cocktails (e.g. Southampton hyperactivity mix).</Text>
            </View>
          </View>
        </View>

        {/* Clinical Disclaimer */}
        <View style={styles.disclaimerCard}>
          <Stethoscope size={20} color="#0284c7" />
          <View style={{ flex: 1 }}>
            <Text style={styles.disclaimerTitle}>Medical Screening Disclaimer</Text>
            <Text style={styles.disclaimerText}>
              NutriSafe AI is an informational screening and decision-support system. It does not measure biological chemical concentration in your child's body and is not a medical diagnosis. Always consult your qualified pediatrician for medical guidance.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 18, paddingTop: 14 },
  academicBanner: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccfbf1',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  academicTitle: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  academicSub: { fontSize: 11, color: '#0d9488', fontWeight: '600', marginTop: 2 },
  replayIntroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f0fdfa',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#99f6e4',
    marginBottom: 16,
  },
  replayIntroText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0d9488',
  },
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  paragraph: { fontSize: 13, color: '#334155', lineHeight: 20, marginBottom: 8 },
  bold: { fontWeight: '700', color: '#0f172a' },
  riskRow: { flexDirection: 'row', gap: 10, marginTop: 10, alignItems: 'flex-start' },
  dot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  riskLabel: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  disclaimerCard: { backgroundColor: '#f0f9ff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#bae6fd', flexDirection: 'row', gap: 12 },
  disclaimerTitle: { fontSize: 13, fontWeight: '700', color: '#0369a1', marginBottom: 4 },
  disclaimerText: { fontSize: 11, color: '#0c4a6e', lineHeight: 16 },
  subParagraph: { fontSize: 12, color: '#64748b', lineHeight: 17, marginBottom: 14 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f1f5f9', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12 },
  searchInput: { flex: 1, fontSize: 12, color: '#0f172a', padding: 0 },
  filterRow: { flexDirection: 'row', gap: 6, marginBottom: 14, flexWrap: 'wrap' },
  filterPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  filterPillActive: { backgroundColor: '#0d9488', borderColor: '#0d9488' },
  filterPillText: { fontSize: 11, fontWeight: '600', color: '#64748b' },
  filterPillTextActive: { color: '#ffffff' },
  additiveList: { gap: 8 },
  additiveItemCard: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  additiveItemHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  additiveCodeBadge: { width: 44, height: 28, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  additiveCodeText: { fontSize: 11, fontWeight: '800' },
  additiveName: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  additiveCategory: { fontSize: 10, color: '#64748b', marginTop: 1 },
  riskTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  riskTagText: { fontSize: 9, fontWeight: '700' },
  additiveDetailsExpanded: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#e2e8f0', gap: 6 },
  detailRow: { gap: 2 },
  detailLabel: { fontSize: 10, fontWeight: '700', color: '#64748b', textTransform: 'uppercase' },
  detailValue: { fontSize: 11, color: '#334155', lineHeight: 15 },
  detailValueAlert: { fontSize: 11, color: '#b91c1c', fontWeight: '500', lineHeight: 15 },
  riskDesc: { fontSize: 12, color: '#64748b', marginTop: 2, lineHeight: 16 },
});
