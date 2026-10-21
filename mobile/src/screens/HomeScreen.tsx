import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import {
  Camera,
  Barcode,
  ShieldAlert,
  User,
  Sparkles,
  Check,
  X,
  Edit3,
  ArrowRight,
  ChevronRight,
  Zap,
  ZapOff,
  SwitchCamera,
  Maximize2,
  Minimize2,
  Image as ImageIcon,
} from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { scanIngredientsAPI, scanBarcodeAPI, scanImageAPI, ScanAssessmentResponse } from '../api/client';
import { NutriSafeBrandHeader } from '../components/NutriSafeBrandHeader';
import {
  useAppStore,
  useActiveChild,
  useActiveChildHistory,
  use7DayExposureIndex,
  getFoodItemImageUri,
} from '../store/useAppStore';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export function HomeScreen({
  onNavigateToResult,
  onNavigateToProfile,
  onReplayIntro,
}: {
  onNavigateToResult: (result: ScanAssessmentResponse, imageUri?: string) => void;
  onNavigateToProfile: () => void;
  onReplayIntro?: () => void;
}) {
  const activeChild = useActiveChild();
  const history = useActiveChildHistory();
  const exposureIndex = use7DayExposureIndex();
  const addScanRecord = useAppStore((state) => state.addScanRecord);

  const [scanMode, setScanMode] = useState<'label' | 'barcode'>('label');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [fullscreenCamera, setFullscreenCamera] = useState(false);
  const [torch, setTorch] = useState(false);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const fullscreenCameraRef = useRef<CameraView>(null);

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
      const resolvedImage = getFoodItemImageUri(name);
      addScanRecord(response, resolvedImage);
      setLoading(false);
      setModalVisible(false);
      onNavigateToResult(response, resolvedImage);
    } catch (e) {
      setLoading(false);
      Alert.alert('Scan Error', 'Unable to analyze ingredients. Please check network connection.');
    }
  };

  const handleCapturePhoto = async () => {
    if (loading) return;
    try {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
      setLoading(true);

      let photoUri: string | null = null;
      if (cameraRef.current) {
        try {
          const photo = await cameraRef.current.takePictureAsync({
            quality: 0.7,
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

      addScanRecord(response, photoUri);
      setLoading(false);
      onNavigateToResult(response, photoUri);
    } catch (e) {
      setLoading(false);
      Alert.alert('Scan Error', 'Unable to process image. Please try again.');
    }
  };

  const handleCapturePhotoFromFullscreen = async () => {
    if (loading) return;
    try {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
      setLoading(true);

      let photoUri: string | null = null;
      const cam = fullscreenCameraRef.current || cameraRef.current;
      if (cam) {
        try {
          const photo = await cam.takePictureAsync({
            quality: 0.7,
            skipProcessing: true,
          });
          if (photo?.uri) {
            photoUri = photo.uri;
          }
        } catch (camErr) {
          console.warn('Fullscreen camera takePictureAsync error:', camErr);
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

      addScanRecord(response, photoUri);
      setLoading(false);
      setFullscreenCamera(false);
      onNavigateToResult(response, photoUri);
    } catch (e) {
      setLoading(false);
      Alert.alert('Scan Error', 'Unable to process image. Please try again.');
    }
  };

  const handlePickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Photo library permission is required to select food package images.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photoUri = result.assets[0].uri;
        setLoading(true);
        const response = await scanImageAPI(
          photoUri,
          {
            name: activeChild.name,
            age_years: activeChild.ageYears,
            allergies: activeChild.allergies,
            sensitivities: activeChild.sensitivities,
            conditions: activeChild.conditions,
          },
          'Uploaded Food Package'
        );
        addScanRecord(response, photoUri);
        setLoading(false);
        setFullscreenCamera(false);
        onNavigateToResult(response, photoUri);
      }
    } catch (err) {
      setLoading(false);
      console.warn('Gallery pick error:', err);
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

      const img = (response as any).product_image_url || getFoodItemImageUri(response.product_name || '');
      addScanRecord(response, img);
      setLoading(false);
      setScannedBarcode(null);
      setFullscreenCamera(false);
      onNavigateToResult(response, img);
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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
            <View style={styles.childMeta}>
              <Text style={styles.childGreeting}>ACTIVE CHILD PROFILE</Text>
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

        {/* Scan Mode Toggle */}
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

            {/* In-Camera Floating Controls (Torch, Switch Camera, Maximize to Fullscreen) */}
            {permission?.granted && (
              <View style={styles.cameraToolsRow}>
                <TouchableOpacity
                  style={[styles.cameraToolBtn, torch && styles.cameraToolBtnActive]}
                  onPress={() => setTorch(!torch)}
                  accessibilityLabel="Toggle Torch"
                >
                  {torch ? <Zap size={16} color="#0d9488" /> : <ZapOff size={16} color="#ffffff" />}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cameraToolBtn}
                  onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
                  accessibilityLabel="Switch Camera"
                >
                  <SwitchCamera size={16} color="#ffffff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.cameraToolBtn, styles.cameraToolBtnHighlight]}
                  onPress={() => setFullscreenCamera(true)}
                  accessibilityLabel="Fullscreen Camera"
                >
                  <Maximize2 size={16} color="#ffffff" />
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

          {/* Fullscreen Camera Quick Expand Banner */}
          <TouchableOpacity
            style={styles.expandCameraBanner}
            onPress={() => setFullscreenCamera(true)}
            activeOpacity={0.8}
          >
            <Maximize2 size={14} color="#0d9488" />
            <Text style={styles.expandCameraBannerText}>Open Fullscreen Camera Scanner</Text>
          </TouchableOpacity>

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


        </View>

        {/* Recently Scanned Food Items (Live User Scan History) */}
        <View style={styles.recentSectionHeader}>
          <Text style={styles.sectionTitle}>Recently Scanned Products</Text>
          {history.length > 0 && (
            <Text style={styles.recentCountBadge}>{history.length} logged</Text>
          )}
        </View>

        {history.length === 0 ? (
          <View style={styles.emptyRecentCard}>
            <Sparkles size={24} color="#0d9488" />
            <Text style={styles.emptyRecentTitle}>No Scans Logged Yet</Text>
            <Text style={styles.emptyRecentSub}>
              Point your camera at any food nutrition label or barcode above to run a pediatric additive safety scan for {activeChild.name}.
            </Text>
          </View>
        ) : (
          <View style={styles.recentScansList}>
            {history.slice(0, 10).map((item) => {
              const itemImg = getFoodItemImageUri(item.productName, item.imageUri);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.recentCard}
                  onPress={() => onNavigateToResult(item.fullAssessment, item.imageUri || itemImg)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.recentCardStrip, { backgroundColor: item.color }]} />

                  {/* Product Image Thumbnail */}
                  <View style={styles.recentThumbWrap}>
                    <Image
                      source={{ uri: itemImg }}
                      style={styles.recentThumbImage}
                      resizeMode="contain"
                    />
                  </View>

                  <View style={styles.recentCardContent}>
                    <View style={styles.recentCardTop}>
                      <Text style={styles.recentProductName} numberOfLines={1}>
                        {item.productName}
                      </Text>
                      <View style={[styles.recentScoreBadge, { backgroundColor: `${item.color}15` }]}>
                        <Text style={[styles.recentScoreText, { color: item.color }]}>
                          {item.score}/100
                        </Text>
                      </View>
                    </View>

                    <View style={styles.recentCardMeta}>
                      <Text style={[styles.recentCategory, { color: item.color }]}>
                        {item.category}
                      </Text>
                      <Text style={styles.recentDate}>• {item.date}</Text>
                    </View>

                    <Text style={styles.recentFlagText} numberOfLines={1}>
                      {item.flag}
                    </Text>
                  </View>
                  <ChevronRight size={18} color="#94a3b8" />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Fullscreen Live Camera Modal */}
      <Modal
        visible={fullscreenCamera}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setFullscreenCamera(false)}
      >
        <View style={styles.fullscreenContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#000000" />

          {permission?.granted ? (
            <CameraView
              ref={fullscreenCameraRef}
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
            <View style={styles.fsPermissionBox}>
              <Camera size={44} color="#2dd4bf" />
              <Text style={styles.fsPermTitle}>Camera Permission Required</Text>
              <Text style={styles.fsPermSub}>Please allow camera access to scan food items in fullscreen.</Text>
              <TouchableOpacity style={styles.grantBtn} onPress={requestPermission}>
                <Text style={styles.grantBtnText}>Enable Camera</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Top Overlay Controls Bar */}
          <SafeAreaView style={styles.fsTopBar}>
            <TouchableOpacity
              style={styles.fsCircleBtn}
              onPress={() => setFullscreenCamera(false)}
              activeOpacity={0.7}
            >
              <X size={22} color="#ffffff" />
            </TouchableOpacity>

            {/* Mode Switcher Pill */}
            <View style={styles.fsModePill}>
              <TouchableOpacity
                style={[styles.fsModeTab, scanMode === 'label' && styles.fsModeTabActive]}
                onPress={() => setScanMode('label')}
                activeOpacity={0.8}
              >
                <Camera size={14} color={scanMode === 'label' ? '#0d9488' : '#cbd5e1'} />
                <Text style={[styles.fsModeTabText, scanMode === 'label' && styles.fsModeTabTextActive]}>
                  Label OCR
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.fsModeTab, scanMode === 'barcode' && styles.fsModeTabActive]}
                onPress={() => setScanMode('barcode')}
                activeOpacity={0.8}
              >
                <Barcode size={14} color={scanMode === 'barcode' ? '#0d9488' : '#cbd5e1'} />
                <Text style={[styles.fsModeTabText, scanMode === 'barcode' && styles.fsModeTabTextActive]}>
                  Barcode
                </Text>
              </TouchableOpacity>
            </View>

            {/* Torch & Flip Camera Tools */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                style={[styles.fsCircleBtn, torch && { backgroundColor: '#ffffff' }]}
                onPress={() => setTorch(!torch)}
                activeOpacity={0.7}
              >
                {torch ? <Zap size={18} color="#0d9488" /> : <ZapOff size={18} color="#ffffff" />}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.fsCircleBtn}
                onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
                activeOpacity={0.7}
              >
                <SwitchCamera size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Center Targeting Reticle Box */}
          <View style={styles.fsCenterReticleWrap} pointerEvents="none">
            <View style={[styles.fsReticleBox, scanMode === 'barcode' && styles.fsReticleBoxBarcode]}>
              <View style={[styles.fsCorner, styles.fsCornerTL]} />
              <View style={[styles.fsCorner, styles.fsCornerTR]} />
              <View style={[styles.fsCorner, styles.fsCornerBL]} />
              <View style={[styles.fsCorner, styles.fsCornerBR]} />
              <View style={styles.fsScanLaser} />
            </View>

            <View style={styles.fsReticleGuidancePill}>
              <Sparkles size={14} color="#5eead4" />
              <Text style={styles.fsReticleGuidanceText}>
                {scanMode === 'label'
                  ? 'Fit ingredients list or nutritional facts in frame'
                  : 'Align food package barcode in box'}
              </Text>
            </View>
          </View>

          {/* Bottom Action Shutter Bar */}
          <SafeAreaView style={styles.fsBottomBar}>
            <View style={styles.fsBottomRow}>
              {/* Pick Image From Gallery */}
              <TouchableOpacity
                style={styles.fsAuxButton}
                onPress={handlePickFromGallery}
                activeOpacity={0.7}
              >
                <View style={styles.fsAuxIconCircle}>
                  <ImageIcon size={20} color="#ffffff" />
                </View>
                <Text style={styles.fsAuxButtonLabel}>Gallery</Text>
              </TouchableOpacity>

              {/* Central Shutter Capture Button */}
              <TouchableOpacity
                style={styles.fsShutterOuterRing}
                onPress={handleCapturePhotoFromFullscreen}
                disabled={loading}
                activeOpacity={0.85}
              >
                <View style={styles.fsShutterInnerCore}>
                  {loading ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Camera size={28} color="#ffffff" />
                  )}
                </View>
              </TouchableOpacity>

              {/* Manual Ingredients Dialog */}
              <TouchableOpacity
                style={styles.fsAuxButton}
                onPress={() => {
                  setFullscreenCamera(false);
                  setModalVisible(true);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.fsAuxIconCircle}>
                  <Edit3 size={20} color="#ffffff" />
                </View>
                <Text style={styles.fsAuxButtonLabel}>Manual</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Fullscreen Loading & Analysis Overlay */}
          {loading && (
            <View style={styles.fsLoadingOverlay}>
              <ActivityIndicator size="large" color="#2dd4bf" />
              <Text style={styles.fsLoadingOverlayTitle}>
                {scanMode === 'label'
                  ? 'Analyzing Additives & Toxicological Synergies...'
                  : 'Querying Global Product Additive Database...'}
              </Text>
              <Text style={styles.fsLoadingOverlaySub}>
                Evaluating E-numbers against {activeChild.name}'s sensitivities
              </Text>
            </View>
          )}
        </View>
      </Modal>

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
  },
  childMeta: { flex: 1 },
  childGreeting: { fontSize: 10, fontWeight: '700', color: '#0d9488', letterSpacing: 0.5 },
  childName: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  childAge: { fontSize: 13, fontWeight: '400', color: '#64748b' },
  tagRow: { flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  tagAsthma: { backgroundColor: '#e0f2fe', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  tagAsthmaText: { fontSize: 10, color: '#0369a1', fontWeight: '600' },
  tagAllergy: { backgroundColor: '#fee2e2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  tagAllergyText: { fontSize: 10, color: '#b91c1c', fontWeight: '600' },
  switchButton: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingLeft: 8 },
  switchButtonText: { fontSize: 12, color: '#0d9488', fontWeight: '600' },
  toggleContainer: { flexDirection: 'row', backgroundColor: '#e2e8f0', borderRadius: 12, padding: 4, marginBottom: 16 },
  toggleBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 10, borderRadius: 10 },
  toggleBtnActive: { backgroundColor: '#0d9488', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  toggleText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  toggleTextActive: { color: '#ffffff' },
  viewfinderCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
  viewfinderTarget: { height: 230, backgroundColor: '#0f172a', borderRadius: 14, overflow: 'hidden', position: 'relative', justifyContent: 'center', alignItems: 'center' },
  permissionBox: { alignItems: 'center', padding: 20, gap: 8 },
  permissionTitle: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  permissionSub: { color: '#94a3b8', fontSize: 12, textAlign: 'center', lineHeight: 18 },
  grantBtn: { backgroundColor: '#0d9488', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginTop: 6 },
  grantBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
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
  cameraToolBtnHighlight: {
    backgroundColor: 'rgba(13, 148, 136, 0.85)',
  },
  expandCameraBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#f0fdfa',
    borderRadius: 10,
    paddingVertical: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ccfbf1',
  },
  expandCameraBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0d9488',
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
  captureButton: { backgroundColor: '#0d9488', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, marginTop: 12 },
  captureButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  customTextLink: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 12, paddingVertical: 4 },
  customTextLinkText: { fontSize: 12, color: '#0d9488', fontWeight: '600' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  recentSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentCountBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0d9488',
    backgroundColor: '#ccfbf1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  emptyRecentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
    marginBottom: 16,
  },
  emptyRecentTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  emptyRecentSub: { fontSize: 12, color: '#64748b', textAlign: 'center', lineHeight: 18 },
  recentScansList: { gap: 10, marginBottom: 16 },
  recentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  recentCardStrip: {
    width: 4,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  recentThumbWrap: {
    width: 50,
    height: 50,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentThumbImage: {
    width: '100%',
    height: '100%',
  },
  recentCardContent: { flex: 1, marginLeft: 10 },
  recentCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentProductName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    marginRight: 8,
  },
  recentScoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  recentScoreText: { fontSize: 12, fontWeight: '800' },
  recentCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  recentCategory: { fontSize: 11, fontWeight: '700' },
  recentDate: { fontSize: 11, color: '#94a3b8' },
  recentFlagText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#0f172a' },
  inputLabel: { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 6 },
  textInput: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#0f172a' },
  runAssessBtn: { backgroundColor: '#0d9488', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, marginTop: 18 },
  runAssessBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },

  // Fullscreen Camera Modal Styles
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
  },
  fsPermissionBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    gap: 12,
  },
  fsPermTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  fsPermSub: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
  },
  fsTopBar: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 30,
  },
  fsCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  fsModePill: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 24,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  fsModeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  fsModeTabActive: {
    backgroundColor: '#ffffff',
  },
  fsModeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  fsModeTabTextActive: {
    color: '#0d9488',
    fontWeight: '700',
  },
  fsCenterReticleWrap: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  fsReticleBox: {
    width: screenWidth * 0.82,
    height: screenWidth * 0.82,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.35)',
    borderRadius: 20,
  },
  fsReticleBoxBarcode: {
    height: screenWidth * 0.45,
  },
  fsCorner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#2dd4bf',
    borderWidth: 3.5,
  },
  fsCornerTL: { top: -2, left: -2, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 16 },
  fsCornerTR: { top: -2, right: -2, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 16 },
  fsCornerBL: { bottom: -2, left: -2, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 16 },
  fsCornerBR: { bottom: -2, right: -2, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 16 },
  fsScanLaser: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: '50%',
    height: 2,
    backgroundColor: '#2dd4bf',
    shadowColor: '#2dd4bf',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  fsReticleGuidancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.3)',
  },
  fsReticleGuidanceText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  fsBottomBar: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    zIndex: 30,
  },
  fsBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  fsAuxButton: {
    alignItems: 'center',
    gap: 4,
    width: 60,
  },
  fsAuxIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  fsAuxButtonLabel: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  fsShutterOuterRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  fsShutterInnerCore: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0d9488',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fsLoadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    gap: 12,
    zIndex: 50,
  },
  fsLoadingOverlayTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  fsLoadingOverlaySub: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
  },
});
