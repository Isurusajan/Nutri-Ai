import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { ArrowLeft, AlertTriangle, ShieldAlert, Sparkles, CheckCircle, Info, ChevronRight, Share2 } from 'lucide-react-native';

export function ScanResultScreen({ onBack }: { onBack: () => void }) {
  const [showShapModal, setShowShapModal] = useState(false);

  const riskScore = 84;
  const riskCategory = "High Concern"; // Emerald / Amber / Rose

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <ArrowLeft size={20} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Assessment Result</Text>
          <TouchableOpacity style={styles.shareButton}>
            <Share2 size={20} color="#0f172a" />
          </TouchableOpacity>
        </View>

        {/* Product Card */}
        <View style={styles.productBanner}>
          <Text style={styles.productName}>Fizzy Orange Nectar (250ml)</Text>
          <Text style={styles.scannedTime}>Scanned Today at 16:45 • For Senudi (4 yrs)</Text>
        </View>

        {/* Score Dial & Category Card (SRS Figure 4) */}
        <View style={styles.scoreCard}>
          <View style={styles.dialWrap}>
            <View style={styles.dialInner}>
              <Text style={styles.dialScore}>{riskScore}</Text>
              <Text style={styles.dialMax}>/ 100</Text>
            </View>
          </View>
          <View style={styles.badgeWrap}>
            <View style={styles.riskBadge}>
              <ShieldAlert size={16} color="#ffffff" />
              <Text style={styles.riskBadgeText}>{riskCategory}</Text>
            </View>
          </View>
          <Text style={styles.scoreSubtitle}>
            Significant pediatric additive interaction detected for this child profile.
          </Text>
        </View>

        {/* Chemical Interaction Highlight (SRS REQ-3.1 to 3.5) */}
        <View style={styles.interactionBox}>
          <View style={styles.interactionHeader}>
            <AlertTriangle size={18} color="#e11d48" />
            <Text style={styles.interactionTitle}>Synergistic Additive Interaction</Text>
          </View>
          <Text style={styles.interactionText}>
            Combination of <Text style={styles.boldText}>Sodium Benzoate (E211)</Text> + <Text style={styles.boldText}>Sunset Yellow FCF (E110)</Text> is associated with increased hyperactive behavior in young children.
          </Text>
          <Text style={styles.citationText}>
            Evidence: McCann et al., Lancet 2007 (Randomized Controlled Trial)
          </Text>
        </View>

        {/* Detected Additives Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Detected Additives (3)</Text>
          
          <View style={styles.additiveItem}>
            <View style={styles.additiveCode}>
              <Text style={styles.additiveCodeText}>E211</Text>
            </View>
            <View style={styles.additiveDetails}>
              <Text style={styles.additiveName}>Sodium Benzoate</Text>
              <Text style={styles.additiveCat}>Preservative • Flagged in Interaction</Text>
            </View>
          </View>

          <View style={styles.additiveItem}>
            <View style={styles.additiveCode}>
              <Text style={styles.additiveCodeText}>E110</Text>
            </View>
            <View style={styles.additiveDetails}>
              <Text style={styles.additiveName}>Sunset Yellow FCF</Text>
              <Text style={styles.additiveCat}>Artificial Azo Colorant • Flagged in Interaction</Text>
            </View>
          </View>

          <View style={styles.additiveItem}>
            <View style={[styles.additiveCode, { backgroundColor: '#dcfce7' }]}>
              <Text style={[styles.additiveCodeText, { color: '#166534' }]}>E330</Text>
            </View>
            <View style={styles.additiveDetails}>
              <Text style={styles.additiveName}>Citric Acid</Text>
              <Text style={styles.additiveCat}>Acidity Regulator • Low Concern</Text>
            </View>
          </View>
        </View>

        {/* SHAP Explainability Section (SRS Figure 5) */}
        <View style={styles.shapCard}>
          <View style={styles.shapHeader}>
            <Sparkles size={18} color="#0d9488" />
            <Text style={styles.shapTitle}>Why this score? (SHAP Feature Attribution)</Text>
          </View>

          <View style={styles.shapBarRow}>
            <View style={styles.shapLabelRow}>
              <Text style={styles.shapFactorName}>E211 + E110 Synergistic Interaction</Text>
              <Text style={styles.shapWeight}>+42%</Text>
            </View>
            <View style={styles.shapTrack}>
              <View style={[styles.shapFill, { width: '84%', backgroundColor: '#f43f5e' }]} />
            </View>
          </View>

          <View style={styles.shapBarRow}>
            <View style={styles.shapLabelRow}>
              <Text style={styles.shapFactorName}>Child Asthma / Sensitivity Relevance</Text>
              <Text style={styles.shapWeight}>+26%</Text>
            </View>
            <View style={styles.shapTrack}>
              <View style={[styles.shapFill, { width: '52%', backgroundColor: '#f59e0b' }]} />
            </View>
          </View>

          <View style={styles.shapBarRow}>
            <View style={styles.shapLabelRow}>
              <Text style={styles.shapFactorName}>7-Day Cumulative Dietary Exposure</Text>
              <Text style={styles.shapWeight}>+16%</Text>
            </View>
            <View style={styles.shapTrack}>
              <View style={[styles.shapFill, { width: '32%', backgroundColor: '#f59e0b' }]} />
            </View>
          </View>
        </View>

        {/* Safer Alternative Recommendation (SRS REQ-6.1) */}
        <View style={styles.altCard}>
          <Text style={styles.altHeading}>Safer Alternative Suggestion</Text>
          <View style={styles.altItem}>
            <CheckCircle size={18} color="#10b981" />
            <View style={{ flex: 1 }}>
              <Text style={styles.altTitle}>100% Cold-Pressed Orange Juice (No Additives)</Text>
              <Text style={styles.altSub}>Risk: Low Concern (Score: 12) • Natural Antioxidants</Text>
            </View>
          </View>
        </View>

        {/* Screening Disclaimer (SRS Section 5.2) */}
        <View style={styles.disclaimer}>
          <Info size={16} color="#64748b" />
          <Text style={styles.disclaimerText}>
            NutriSafe AI is a food-safety screening tool. It does not measure biological chemical concentration in the body and does not replace medical advice. If concerned, consult your pediatrician.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 20 },
  navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  shareButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  navTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  productBanner: { marginBottom: 16 },
  productName: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  scannedTime: { fontSize: 12, color: '#64748b', marginTop: 2 },
  scoreCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, marginBottom: 18 },
  dialWrap: { width: 110, height: 110, borderRadius: 55, borderWidth: 8, borderColor: '#f43f5e', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  dialInner: { alignItems: 'center' },
  dialScore: { fontSize: 36, fontWeight: '900', color: '#f43f5e', lineHeight: 38 },
  dialMax: { fontSize: 11, color: '#94a3b8', fontWeight: '600' },
  badgeWrap: { marginBottom: 8 },
  riskBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f43f5e', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  riskBadgeText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  scoreSubtitle: { fontSize: 12, color: '#64748b', textAlign: 'center', maxWidth: 260 },
  interactionBox: { backgroundColor: '#fff1f2', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#fecdd3', marginBottom: 20 },
  interactionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  interactionTitle: { fontSize: 14, fontWeight: '700', color: '#be123c' },
  interactionText: { fontSize: 13, color: '#9f1239', lineHeight: 18 },
  boldText: { fontWeight: '700' },
  citationText: { fontSize: 11, color: '#be123c', fontStyle: 'italic', marginTop: 6 },
  section: { marginBottom: 20 },
  sectionHeading: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  additiveItem: { backgroundColor: '#ffffff', flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 8, gap: 12 },
  additiveCode: { width: 44, height: 32, borderRadius: 8, backgroundColor: '#fee2e2', justifyContent: 'center', alignItems: 'center' },
  additiveCodeText: { fontSize: 12, fontWeight: '700', color: '#991b1b' },
  additiveDetails: { flex: 1 },
  additiveName: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  additiveCat: { fontSize: 11, color: '#64748b', marginTop: 1 },
  shapCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
  shapHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  shapTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  shapBarRow: { marginBottom: 12 },
  shapLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  shapFactorName: { fontSize: 12, color: '#334155', fontWeight: '500' },
  shapWeight: { fontSize: 12, fontWeight: '700', color: '#0f172a' },
  shapTrack: { height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' },
  shapFill: { height: '100%', borderRadius: 3 },
  altCard: { backgroundColor: '#f0fdf4', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#bbf7d0', marginBottom: 20 },
  altHeading: { fontSize: 13, fontWeight: '700', color: '#166534', marginBottom: 8 },
  altItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  altTitle: { fontSize: 13, fontWeight: '700', color: '#15803d' },
  altSub: { fontSize: 11, color: '#166534', marginTop: 1 },
  disclaimer: { flexDirection: 'row', gap: 8, padding: 12, backgroundColor: '#f1f5f9', borderRadius: 12 },
  disclaimerText: { fontSize: 11, color: '#64748b', lineHeight: 16, flex: 1 },
});
