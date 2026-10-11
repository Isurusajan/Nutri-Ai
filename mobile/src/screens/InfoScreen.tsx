import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { Info, ShieldCheck, Sparkles, AlertTriangle, BookOpen, Stethoscope } from 'lucide-react-native';

export function InfoScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>About NutriSafe AI</Text>
          <Text style={styles.subtitle}>Guide to pediatric food additive risk screening</Text>
        </View>

        {/* How It Works Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Sparkles size={20} color="#0d9488" />
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
  scrollContent: { padding: 20 },
  header: { marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  paragraph: { fontSize: 13, color: '#334155', lineHeight: 20, marginBottom: 8 },
  bold: { fontWeight: '700', color: '#0f172a' },
  riskRow: { flexDirection: 'row', gap: 10, marginTop: 10, alignItems: 'flex-start' },
  dot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  riskLabel: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  riskDesc: { fontSize: 12, color: '#64748b', marginTop: 2, lineHeight: 16 },
  disclaimerCard: { backgroundColor: '#f0f9ff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#bae6fd', flexDirection: 'row', gap: 12 },
  disclaimerTitle: { fontSize: 13, fontWeight: '700', color: '#0369a1', marginBottom: 4 },
  disclaimerText: { fontSize: 11, color: '#0c4a6e', lineHeight: 16 },
});
