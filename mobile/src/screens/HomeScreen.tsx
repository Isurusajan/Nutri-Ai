import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, ActivityIndicator, Modal, TextInput, Alert, Image } from 'react-native';
import { Camera, Barcode, ShieldAlert, User, Sparkles, Check, X, Edit3, ArrowRight, ChevronRight, Zap, ZapOff, SwitchCamera } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { scanIngredientsAPI, scanBarcodeAPI, scanImageAPI, ScanAssessmentResponse } from '../api/client';
import { NutriSafeBrandHeader } from '../components/NutriSafeBrandHeader';
import { useAppStore } from '../store/useAppStore';

export function HomeScreen({
  onNavigateToResult,
  onNavigateToProfile,
  onReplayIntro,
}: {
  onNavigateToResult: (result: ScanAssessmentResponse, imageUri?: string) => void;
  onNavigateToProfile: () => void;
  onReplayIntro?: () => void;
}) {
  const activeChild = useAppStore((state) => state.getActiveChild());
  const addScanRecord = useAppStore((state) => state.addScanRecord);
  const exposureIndex = useAppStore((state) => state.get7DayExposureIndex());

  const [scanMode, setScanMode] = useState<'label' | 'barcode'>('label');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [torch, setTorch] = useState(false);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const [customText, setCustomText] = useState(
    'Carbonated Water, Sugar, Citric Acid (E330), Preservative (Sodium Benzoate E211), Artificial Color (Sunset Yellow FCF E110).'
  );
  const [productName, setProductName] = useState('Fizzy Orange Nectar');

  const executeScan = async (name: string, text: string) => {
    setLoading(true);
    try {
      const response = await scanIngredientsAPI({
        product_name: name,
        raw_ingredients_text: text,
        child_profile: {
          name: activeChild.name,
          age_years: activeChild.ageYears,
          allergies: activeChild.allergies,
          sensitivities: activeChild.sensitivities,
          conditions: activeChild.conditions,
        },
        cumulative_exposure_index: exposureIndex,
      });
      addScanRecord(response);
      setLoading(false);
      setModalVisible(false);
      onNavigateToResult(response);
    } catch (e) {
      setLoading(false);
    }
  };

  const handleCapturePhoto = async () => {
    if (loading) return;
    try {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
      setLoading(true);

      // Snap picture with live camera if available
      let photoUri: string | null = null;
      if (cameraRef.current) {
        try {
          const photo = await cameraRef.current.takePictureAsync({
            quality: 0.6,
            skipProcessing: true,
          });
          if (photo?.uri) {
            photoUri = photo.uri;
          }
        } catch (camErr) {
          console.warn('Camera takePictureAsync error:', camErr);
        }
      }

      if (!photoUri) {
        setLoading(false);
        Alert.alert(
          'Camera Warning',
          'Could not capture photo. Please hold camera steady at the ingredients list and try again.'
        );
        return;
      }

      const response = await scanImageAPI(
        photoUri,
        {
          name: activeChild.name,
          age_years: activeChild.ageYears,
          allergies: activeChild.allergies,
          sensitivities: activeChild.sensitivities,
          conditions: activeChild.conditions,
        },
        'Captured Food Package'
      );

      addScanRecord(response);
      setLoading(false);
      onNavigateToResult(response, photoUri);
    } catch (e) {
      setLoading(false);
      Alert.alert('Scan Error', 'Unable to process image. Please try again.');
    }
  };

  const handleBarcodeScanned = async (result: { type: string; data: string }) => {
    if (loading || scannedBarcode === result.data) return;
    setScannedBarcode(result.data);
    try {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      setLoading(true);

      const response = await scanBarcodeAPI(result.data, {
        name: activeChild.name,
        age_years: activeChild.ageYears,
        allergies: activeChild.allergies,
        sensitivities: activeChild.sensitivities,
        conditions: activeChild.conditions,
      });

      addScanRecord(response);
      setLoading(false);
      setScannedBarcode(null);
      onNavigateToResult(response);
    } catch (e) {
      setLoading(false);
      setScannedBarcode(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* NutriSafe AI Top Brand App Bar */}
      <NutriSafeBrandHeader
        subtitle="Pediatric Additive Risk Screening"
        onPressLogo={onReplayIntro}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Active Child Profile Banner Card */}
        <TouchableOpacity
          style={styles.childCard}
          onPress={onNavigateToProfile}
          activeOpacity={0.85}
        >
          <View style={styles.childCardLeft}>
            <View style={styles.avatarCircle}>
              {activeChild.avatarUri ? (
                <Image source={{ uri: activeChild.avatarUri }} style={styles.avatarImageSmall} />
              ) : (
                <User size={20} color="#0d9488" />
              )}
            </View>
            <View style={styles.childInfo}>
              <Text style={styles.childCardLabel}>ACTIVE SCREENING PROFILE</Text>
              <Text style={styles.childName}>
                {activeChild.name} <Text style={styles.childAge}>({activeChild.ageYears} yrs)</Text>
              </Text>
              <View style={styles.tagRow}>
                {activeChild.conditions.slice(0, 1).map((cond, i) => (
                  <View key={`c-${i}`} style={styles.tagAsthma}>
                    <Text style={styles.tagAsthmaText}>{cond}</Text>
                  </View>
                ))}
                {activeChild.allergies.slice(0, 2).map((all, i) => (
                  <View key={`a-${i}`} style={styles.tagAllergy}>
                    <Text style={styles.tagAllergyText}>{all}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
          <View style={styles.switchButton}>
            <Text style={styles.switchButtonText}>Profile</Text>
            <ChevronRight size={14} color="#0d9488" />
          </View>
        </TouchableOpacity>

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

        {/* Camera Viewfinder Area */}
        <View style={styles.viewfinderCard}>
          <View style={styles.viewfinderTarget}>
            {/* Live Camera Feed if permission granted */}
            {permission?.granted ? (
              <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                facing={facing}
                enableTorch={torch}
                barcodeScannerSettings={
                  scanMode === 'barcode'
                    ? { barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'qr', 'code128'] }
                    : undefined
                }
                onBarcodeScanned={scanMode === 'barcode' ? handleBarcodeScanned : undefined}
              />
            ) : (
              <View style={styles.permissionBox}>
                <Camera size={36} color="#0d9488" />
                <Text style={styles.permissionTitle}>Camera Access Required</Text>
                <Text style={styles.permissionSub}>
                  Allow camera access to view and scan food packages in real-time
                </Text>
                <TouchableOpacity style={styles.grantBtn} onPress={requestPermission}>
                  <Text style={styles.grantBtnText}>Enable Camera</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Corner Reticles */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {/* In-Camera Floating Controls (Torch & Switch Camera) */}
            {permission?.granted && (
              <View style={styles.cameraToolsRow}>
                <TouchableOpacity
                  style={[styles.cameraToolBtn, torch && styles.cameraToolBtnActive]}
                  onPress={() => setTorch(!torch)}
                >
                  {torch ? <Zap size={16} color="#0d9488" /> : <ZapOff size={16} color="#ffffff" />}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cameraToolBtn}
                  onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
                >
                  <SwitchCamera size={16} color="#ffffff" />
                </TouchableOpacity>
              </View>
            )}

            {/* In-Camera Guidance HUD Pill */}
            {permission?.granted && !loading && (
              <View style={styles.hudPill}>
                <Text style={styles.hudPillText}>
                  {scanMode === 'label'
                    ? 'Align ingredient list within frame'
                    : 'Point at product barcode (Auto-scans)'}
                </Text>
              </View>
            )}

            {/* Scanning / Analysis Overlay */}
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#ffffff" />
                <Text style={styles.loadingOverlayText}>
                  {scanMode === 'label'
                    ? 'Analyzing Additives & SHAP Decomposition...'
                    : 'Looking up Barcode & Additives...'}
                </Text>
              </View>
            )}
          </View>

          {/* Trigger Scan Button */}
          <TouchableOpacity
            style={styles.captureButton}
            disabled={loading}
            onPress={
              scanMode === 'label'
                ? handleCapturePhoto
                : () => {
                    Alert.alert(
                      'Barcode Scanning',
                      'Align the food packaging barcode within the camera viewfinder to scan automatically.'
                    );
                  }
            }
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Sparkles size={20} color="#ffffff" />
                <Text style={styles.captureButtonText}>
                  {scanMode === 'label' ? 'Capture & Assess Additives' : 'Scan / Lookup Barcode'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Custom Text / Test Input Trigger */}
          <TouchableOpacity
            style={styles.customTextLink}
            onPress={() => setModalVisible(true)}
          >
            <Edit3 size={14} color="#0d9488" />
            <Text style={styles.customTextLinkText}>Test with custom ingredients or sample foods</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Test Samples */}
        <Text style={styles.sectionTitle}>Try Pre-Loaded Food Samples</Text>
        <View style={styles.presetGrid}>
          <TouchableOpacity
            style={styles.presetCard}
            onPress={() =>
              executeScan(
                'Fizzy Orange Nectar (250ml)',
                'Carbonated Water, Sugar, Citric Acid (E330), Preservative (Sodium Benzoate E211), Sunset Yellow FCF (E110).'
              )
            }
          >
            <Text style={styles.presetBadgeHigh}>High Concern</Text>
            <Text style={styles.presetName}>Fizzy Orange Drink</Text>
            <Text style={styles.presetSub}>E211 + E110 Southampton mix</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.presetCard}
            onPress={() =>
              executeScan(
                'Organic Strawberry Yogurt',
                'Whole Milk, Strawberry Puree, Pectin (E440), Beetroot Red (E162).'
              )
            }
          >
            <Text style={styles.presetBadgeLow}>Low Concern</Text>
            <Text style={styles.presetName}>Natural Yogurt</Text>
            <Text style={styles.presetSub}>E440 + E162 natural extracts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.presetCard}
            onPress={() =>
              executeScan(
                'Savory Cheese Rings',
                'Corn Flour, Palm Oil, Monosodium Glutamate (E621), Tartrazine (E102), Salt.'
              )
            }
          >
            <Text style={styles.presetBadgeMod}>Allergy Match</Text>
            <Text style={styles.presetName}>Savory Chips</Text>
            <Text style={styles.presetSub}>Matches child allergy (E102)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Custom Test Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Custom Ingredients Test</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Product Name</Text>
            <TextInput
              style={styles.textInput}
              value={productName}
              onChangeText={setProductName}
              placeholder="e.g. Tropical Juice"
            />

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Ingredient Text (Paste or Type)</Text>
            <TextInput
              style={[styles.textInput, { height: 90, textAlignVertical: 'top' }]}
              value={customText}
              onChangeText={setCustomText}
              multiline
              placeholder="e.g. Water, Sugar, E211, E102..."
            />

            <TouchableOpacity
              style={styles.runAssessBtn}
              onPress={() => executeScan(productName, customText)}
            >
              <Text style={styles.runAssessBtnText}>Run AI Assessment</Text>
              <ArrowRight size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 18, paddingTop: 14 },
  childCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  childCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccfbf1',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImageSmall: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  childInfo: {
    flex: 1,
  },
  childCardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0d9488',
    letterSpacing: 0.5,
  },
  childName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 1,
  },
  childAge: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  tagAsthma: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  tagAsthmaText: {
    fontSize: 10,
    color: '#1d4ed8',
    fontWeight: '600',
  },
  tagAllergy: {
    backgroundColor: '#fff1f2',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fecdd3',
  },
  tagAllergyText: {
    fontSize: 10,
    color: '#e11d48',
    fontWeight: '600',
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#f0fdfa',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccfbf1',
    marginLeft: 8,
  },
  switchButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0d9488',
  },
  toggleContainer: { flexDirection: 'row', backgroundColor: '#e2e8f0', borderRadius: 12, padding: 4, marginBottom: 20 },
  toggleBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingVertical: 10, borderRadius: 8 },
  toggleBtnActive: { backgroundColor: '#0d9488', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  toggleText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  toggleTextActive: { color: '#ffffff' },
  viewfinderCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, marginBottom: 20 },
  viewfinderTarget: {
    height: 250,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionBox: {
    alignItems: 'center',
    padding: 20,
    gap: 8,
  },
  permissionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  permissionSub: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    maxWidth: 220,
  },
  grantBtn: {
    backgroundColor: '#0d9488',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  grantBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  cameraToolsRow: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
    zIndex: 10,
  },
  cameraToolBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraToolBtnActive: {
    backgroundColor: '#ffffff',
  },
  hudPill: {
    position: 'absolute',
    bottom: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  hudPillText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    zIndex: 20,
  },
  loadingOverlayText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  corner: { position: 'absolute', width: 24, height: 24, borderColor: '#0d9488', borderWidth: 3 },
  cornerTL: { top: 12, left: 12, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 12, right: 12, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL: { bottom: 12, left: 12, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: 12, right: 12, borderLeftWidth: 0, borderTopWidth: 0 },
  captureButton: { backgroundColor: '#0d9488', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, marginTop: 16 },
  captureButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  customTextLink: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 12, paddingVertical: 4 },
  customTextLinkText: { fontSize: 12, color: '#0d9488', fontWeight: '600' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  presetGrid: { gap: 10, marginBottom: 16 },
  presetCard: { backgroundColor: '#ffffff', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  presetName: { fontSize: 14, fontWeight: '700', color: '#0f172a', marginTop: 4 },
  presetSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  presetBadgeHigh: { alignSelf: 'flex-start', fontSize: 10, fontWeight: '700', color: '#be123c', backgroundColor: '#ffe4e6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  presetBadgeLow: { alignSelf: 'flex-start', fontSize: 10, fontWeight: '700', color: '#15803d', backgroundColor: '#dcfce7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  presetBadgeMod: { alignSelf: 'flex-start', fontSize: 10, fontWeight: '700', color: '#b45309', backgroundColor: '#fef3c7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#0f172a' },
  inputLabel: { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 6 },
  textInput: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#0f172a' },
  runAssessBtn: { backgroundColor: '#0d9488', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, marginTop: 18 },
  runAssessBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
});
