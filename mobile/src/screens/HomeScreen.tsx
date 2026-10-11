import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { Camera, Barcode, ShieldAlert, User, Clock, ChevronRight, AlertCircle, Sparkles } from 'lucide-react-native';

export function HomeScreen({ onNavigateToResult, onNavigateToProfile }: { onNavigateToResult: () => void, onNavigateToProfile: () => void }) {
  const [scanMode, setScanMode] = useState<'label' | 'barcode'>('label');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with Active Child Selector */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Screening for</Text>
            <TouchableOpacity style={styles.childSelector} onPress={onNavigateToProfile}>
              <Text style={styles.childName}>Senudi Perera</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>4 yrs • Asthma / E102</Text>
              </View>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={onNavigateToProfile}>
            <User size={22} color="#0d9488" />
          </TouchableOpacity>
        </View>

        {/* Scan Mode Toggle (SRS Section 3.1 & 4.1) */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, scanMode === 'label' && styles.toggleBtnActive]}
            onPress={() => setScanMode('label')}
          >
            <Camera size={18} color={scanMode === 'label' ? '#ffffff' : '#64748b'} />
            <Text style={[styles.toggleText, scanMode === 'label' && styles.toggleTextActive]}>
              Scan Food Label
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, scanMode === 'barcode' && styles.toggleBtnActive]}
            onPress={() => setScanMode('barcode')}
          >
            <Barcode size={18} color={scanMode === 'barcode' ? '#ffffff' : '#64748b'} />
            <Text style={[styles.toggleText, scanMode === 'barcode' && styles.toggleTextActive]}>
              Scan Barcode
            </Text>
          </TouchableOpacity>
        </View>

        {/* Camera Viewfinder Mock Area */}
        <View style={styles.viewfinderCard}>
          <View style={styles.viewfinderTarget}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
            
            <View style={styles.scannerCenter}>
              {scanMode === 'label' ? (
                <>
                  <Camera size={44} color="#0d9488" />
                  <Text style={styles.scannerInstruction}>
                    Align food ingredient label inside the frame
                  </Text>
                  <Text style={styles.scannerHint}>
                    OCR extracts E-Numbers and chemical names automatically
                  </Text>
                </>
              ) : (
                <>
                  <Barcode size={44} color="#0d9488" />
                  <Text style={styles.scannerInstruction}>
                    Align package barcode or QR code
                  </Text>
                  <Text style={styles.scannerHint}>
                    Queries Open Food Facts with label OCR fallback
                  </Text>
                </>
              )}
            </View>
          </View>

          {/* Trigger Scan Button */}
          <TouchableOpacity style={styles.captureButton} onPress={onNavigateToResult}>
            <Sparkles size={20} color="#ffffff" />
            <Text style={styles.captureButtonText}>
              {scanMode === 'label' ? 'Capture & Assess Additives' : 'Lookup Product Barcode'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Recent Banner */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Scans</Text>
          <TouchableOpacity style={styles.recentCard} onPress={onNavigateToResult}>
            <View style={styles.recentIconWrap}>
              <ShieldAlert size={20} color="#f43f5e" />
            </View>
            <View style={styles.recentTextWrap}>
              <Text style={styles.recentProduct}>Fizzy Orange Nectar (250ml)</Text>
              <Text style={styles.recentMeta}>High Concern • 84/100 • E211 + E110 mix</Text>
            </View>
            <ChevronRight size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  childSelector: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  childName: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  badge: { backgroundColor: '#ccfbf1', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  badgeText: { fontSize: 11, color: '#0f766e', fontWeight: '600' },
  profileButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f0fdfa', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#ccfbf1' },
  toggleContainer: { flexDirection: 'row', backgroundColor: '#e2e8f0', borderRadius: 12, padding: 4, marginBottom: 20 },
  toggleBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingVertical: 10, borderRadius: 8 },
  toggleBtnActive: { backgroundColor: '#0d9488', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  toggleText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  toggleTextActive: { color: '#ffffff' },
  viewfinderCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, marginBottom: 24 },
  viewfinderTarget: { height: 260, backgroundColor: '#f1f5f9', borderRadius: 16, position: 'relative', justifyContent: 'center', alignItems: 'center', padding: 20 },
  scannerCenter: { alignItems: 'center', gap: 8 },
  scannerInstruction: { fontSize: 14, fontWeight: '600', color: '#1e293b', textAlign: 'center' },
  scannerHint: { fontSize: 11, color: '#64748b', textAlign: 'center', maxWidth: 220 },
  corner: { position: 'absolute', width: 24, height: 24, borderColor: '#0d9488', borderWidth: 3 },
  cornerTL: { top: 12, left: 12, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 12, right: 12, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL: { bottom: 12, left: 12, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: 12, right: 12, borderLeftWidth: 0, borderTopWidth: 0 },
  captureButton: { backgroundColor: '#0d9488', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, marginTop: 16 },
  captureButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  recentSection: { marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  recentCard: { backgroundColor: '#ffffff', flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0', gap: 12 },
  recentIconWrap: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#ffe4e6', justifyContent: 'center', alignItems: 'center' },
  recentTextWrap: { flex: 1 },
  recentProduct: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  recentMeta: { fontSize: 12, color: '#f43f5e', marginTop: 2, fontWeight: '500' },
});
