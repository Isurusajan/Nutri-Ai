import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Image,
} from 'react-native';
import {
  Settings,
  User,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Search,
  Filter,
  Trash2,
  RotateCcw,
  Sliders,
  Check,
  ChevronRight,
  Eye,
  Zap,
  Info,
  Server,
  Heart,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { NutriSafeBrandHeader } from '../components/NutriSafeBrandHeader';
import { COMMON_ADDITIVES, AdditiveEntry } from '../data/additiveDictionary';
import { useAppStore, useActiveChild } from '../store/useAppStore';

export function SettingsScreen({
  onReplayIntro,
  onNavigateToProfile,
}: {
  onReplayIntro?: () => void;
  onNavigateToProfile?: () => void;
} = {}) {
  const activeChild = useActiveChild();
  const allChildren = useAppStore((state) => state.children);
  const setActiveChild = useAppStore((state) => state.setActiveChild);
  const clearHistory = useAppStore((state) => state.clearHistory);
  const resetToDemoData = useAppStore((state) => state.resetToDemoData);

  // Preference Toggles
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [autoTorch, setAutoTorch] = useState(false);
  const [highPrecisionOCR, setHighPrecisionOCR] = useState(true);
  const [strictPediatricMode, setStrictPediatricMode] = useState(true);

  // Additives Dictionary Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<'All' | 'High Concern' | 'Moderate Concern' | 'Low Concern'>('All');
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const [showDictionary, setShowDictionary] = useState(false);

  const filteredAdditives = COMMON_ADDITIVES.filter((item) => {
    const matchesSearch =
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterRisk === 'All' || item.riskLevel === filterRisk;
    return matchesSearch && matchesFilter;
  });

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Scan Journal',
      `Are you sure you want to clear all recorded dietary scans for ${activeChild.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All Scans',
          style: 'destructive',
          onPress: () => {
            clearHistory();
            Alert.alert('Scans Cleared', 'Dietary scan history has been successfully reset.');
          },
        },
      ]
    );
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Demo Data',
      'This will restore demo child profiles (Leo, Maya) and default clinical test scans.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset to Factory Demo',
          style: 'destructive',
          onPress: () => {
            resetToDemoData();
            Alert.alert('Reset Complete', 'App data has been reset to default clinical demo state.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <NutriSafeBrandHeader subtitle="Settings & Dietary Intelligence" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Active Child Profile Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <User size={18} color="#0d9488" />
            <Text style={styles.sectionTitle}>Active Child Profile</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Dietary risk models and additive sensitivity triggers are customized for:
          </Text>

          <View style={styles.childHeroRow}>
            <View style={styles.childAvatarWrap}>
              {activeChild.avatarUri ? (
                <Image source={{ uri: activeChild.avatarUri }} style={styles.childAvatar} />
              ) : (
                <View style={styles.childAvatarFallback}>
                  <Text style={styles.childAvatarInitial}>{activeChild.name[0] || 'C'}</Text>
                </View>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.childHeroName}>{activeChild.name}</Text>
              <Text style={styles.childHeroSub}>
                {activeChild.ageYears} years old • {activeChild.allergies.length} Allergies • {activeChild.conditions.length} Conditions
              </Text>
              <Text style={styles.childPediatrician} numberOfLines={1}>
                Pediatrician: {activeChild.linkedPediatrician}
              </Text>
            </View>
          </View>

          {/* Quick Child Profile Switcher */}
          {allChildren.length > 1 && (
            <View style={styles.childSwitcherWrap}>
              <Text style={styles.switcherLabel}>Switch Active Child:</Text>
              <View style={styles.switcherPills}>
                {allChildren.map((c) => {
                  const isActive = c.id === activeChild.id;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.switcherPill, isActive && styles.switcherPillActive]}
                      onPress={() => setActiveChild(c.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.switcherPillText, isActive && styles.switcherPillTextActive]}>
                        {c.name}
                      </Text>
                      {isActive && <Check size={12} color="#ffffff" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {onNavigateToProfile && (
            <TouchableOpacity
              style={styles.manageProfileBtn}
              onPress={onNavigateToProfile}
              activeOpacity={0.7}
            >
              <Text style={styles.manageProfileBtnText}>Edit Profile, Allergies & Clinical Records</Text>
              <ChevronRight size={16} color="#0d9488" />
            </TouchableOpacity>
          )}
        </View>

        {/* Scan & Detection Preferences */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Sliders size={18} color="#0d9488" />
            <Text style={styles.sectionTitle}>Scan & AI Preferences</Text>
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Strict Pediatric Safety Mode</Text>
              <Text style={styles.toggleDesc}>
                Flags Southampton 6 synthetic dyes & synergistic preservative combos as high concern.
              </Text>
            </View>
            <Switch
              value={strictPediatricMode}
              onValueChange={setStrictPediatricMode}
              trackColor={{ false: '#cbd5e1', true: '#99f6e4' }}
              thumbColor={strictPediatricMode ? '#0d9488' : '#f1f5f9'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>High-Precision Multi-Additive OCR</Text>
              <Text style={styles.toggleDesc}>
                Enhance image preprocessing to capture faint or small ingredient prints.
              </Text>
            </View>
            <Switch
              value={highPrecisionOCR}
              onValueChange={setHighPrecisionOCR}
              trackColor={{ false: '#cbd5e1', true: '#99f6e4' }}
              thumbColor={highPrecisionOCR ? '#0d9488' : '#f1f5f9'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Haptic Feedback on Scan</Text>
              <Text style={styles.toggleDesc}>Vibrate device when camera detects food additive labels.</Text>
            </View>
            <Switch
              value={hapticFeedback}
              onValueChange={setHapticFeedback}
              trackColor={{ false: '#cbd5e1', true: '#99f6e4' }}
              thumbColor={hapticFeedback ? '#0d9488' : '#f1f5f9'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Auto-Flash in Low Light</Text>
              <Text style={styles.toggleDesc}>Enable camera LED torch automatically for dimly lit packaging.</Text>
            </View>
            <Switch
              value={autoTorch}
              onValueChange={setAutoTorch}
              trackColor={{ false: '#cbd5e1', true: '#99f6e4' }}
              thumbColor={autoTorch ? '#0d9488' : '#f1f5f9'}
            />
          </View>
        </View>

        {/* Searchable Food Additives & E-Numbers Library */}
        <View style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => setShowDictionary(!showDictionary)}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <BookOpen size={18} color="#0d9488" />
              <View>
                <Text style={styles.sectionTitle}>Food Additives & E-Numbers Library</Text>
                <Text style={styles.sectionSubtitle}>
                  {showDictionary ? 'Tap to collapse lookup' : `Browse ${COMMON_ADDITIVES.length}+ regulatory evaluated additives`}
                </Text>
              </View>
            </View>
            {showDictionary ? <ChevronUp size={20} color="#64748b" /> : <ChevronDown size={20} color="#64748b" />}
          </TouchableOpacity>

          {showDictionary && (
            <View style={{ marginTop: 14 }}>
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

              {/* Additives List */}
              <View style={styles.additiveList}>
                {filteredAdditives.slice(0, 15).map((item) => {
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
          )}
        </View>

        {/* Data & Storage Management */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Trash2 size={18} color="#0d9488" />
            <Text style={styles.sectionTitle}>Data & Experience</Text>
          </View>

          {/* Watch Welcome Animation */}
          {onReplayIntro && (
            <TouchableOpacity
              style={styles.actionRow}
              onPress={onReplayIntro}
              activeOpacity={0.7}
            >
              <View style={styles.actionRowLeft}>
                <Sparkles size={18} color="#0d9488" />
                <View>
                  <Text style={styles.actionRowTitle}>Replay Welcome Animation</Text>
                  <Text style={styles.actionRowSubtitle}>View introductory 3D presentation & guide</Text>
                </View>
              </View>
              <ChevronRight size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}

          <View style={styles.divider} />

          {/* Clear Scan History */}
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleClearHistory}
            activeOpacity={0.7}
          >
            <View style={styles.actionRowLeft}>
              <Trash2 size={18} color="#f43f5e" />
              <View>
                <Text style={[styles.actionRowTitle, { color: '#f43f5e' }]}>Clear Scan History</Text>
                <Text style={styles.actionRowSubtitle}>Delete all saved dietary food logs for this child</Text>
              </View>
            </View>
            <ChevronRight size={18} color="#94a3b8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Reset All App Data */}
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleResetData}
            activeOpacity={0.7}
          >
            <View style={styles.actionRowLeft}>
              <RotateCcw size={18} color="#64748b" />
              <View>
                <Text style={styles.actionRowTitle}>Reset All Demo Data</Text>
                <Text style={styles.actionRowSubtitle}>Restore default child profiles and clinical test scans</Text>
              </View>
            </View>
            <ChevronRight size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Enterprise & Regulatory Standards Card */}
        <View style={styles.infoFooterCard}>
          <View style={styles.infoFooterHeader}>
            <ShieldCheck size={20} color="#0d9488" />
            <Text style={styles.infoFooterTitle}>NutriSafe AI • Enterprise Edition</Text>
          </View>
          <Text style={styles.infoFooterText}>
            Personalized pediatric additive safety & chemical interaction intelligence powered by multi-modal vision and explainable toxicological reasoning.
          </Text>
          
          <View style={styles.metaBadgeGrid}>
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeLabel}>App Version</Text>
              <Text style={styles.metaBadgeValue}>v1.2.0 (Stable)</Text>
            </View>
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeLabel}>AI Vision Engine</Text>
              <Text style={styles.metaBadgeValue}>Gemini 1.5 Multi-Modal</Text>
            </View>
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeLabel}>Safety Standard</Text>
              <Text style={styles.metaBadgeValue}>WHO / EFSA / Codex</Text>
            </View>
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeLabel}>Clinical Link</Text>
              <Text style={styles.metaBadgeValue}>Pediatric Portal Synced</Text>
            </View>
          </View>

          <Text style={styles.copyrightText}>
            © 2026 NutriSafe AI Systems Ltd. All clinical rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 18, paddingTop: 14, paddingBottom: 40 },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  sectionSubtitle: { fontSize: 12, color: '#64748b', marginBottom: 12 },
  childHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  childAvatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  childAvatar: { width: '100%', height: '100%' },
  childAvatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ccfbf1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  childAvatarInitial: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0d9488',
  },
  childHeroName: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  childHeroSub: { fontSize: 12, color: '#475569', marginTop: 2 },
  childPediatrician: { fontSize: 11, color: '#0d9488', marginTop: 2, fontWeight: '600' },
  childSwitcherWrap: { marginTop: 6, marginBottom: 12 },
  switcherLabel: { fontSize: 11, fontWeight: '600', color: '#64748b', marginBottom: 6 },
  switcherPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  switcherPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  switcherPillActive: {
    backgroundColor: '#0d9488',
    borderColor: '#0d9488',
  },
  switcherPillText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  switcherPillTextActive: { color: '#ffffff' },
  manageProfileBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#f0fdfa',
    borderWidth: 1,
    borderColor: '#ccfbf1',
  },
  manageProfileBtnText: { fontSize: 12, fontWeight: '700', color: '#0d9488' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  toggleInfo: { flex: 1, paddingRight: 14 },
  toggleTitle: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  toggleDesc: { fontSize: 11, color: '#64748b', marginTop: 2, lineHeight: 15 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 2 },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 13, color: '#0f172a', padding: 0 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  filterPillActive: { backgroundColor: '#0d9488' },
  filterPillText: { fontSize: 11, fontWeight: '600', color: '#64748b' },
  filterPillTextActive: { color: '#ffffff' },
  additiveList: { gap: 8 },
  additiveItemCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  additiveItemHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  additiveCodeBadge: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 6 },
  additiveCodeText: { fontSize: 12, fontWeight: '800' },
  additiveName: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  additiveCategory: { fontSize: 11, color: '#64748b' },
  riskTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  riskTagText: { fontSize: 10, fontWeight: '700' },
  additiveDetailsExpanded: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 6,
  },
  detailRow: { flexDirection: 'column', gap: 2 },
  detailLabel: { fontSize: 11, fontWeight: '700', color: '#475569' },
  detailValue: { fontSize: 11, color: '#334155', lineHeight: 16 },
  detailValueAlert: { fontSize: 11, color: '#b91c1c', lineHeight: 16, fontWeight: '500' },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  actionRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  actionRowTitle: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  actionRowSubtitle: { fontSize: 11, color: '#64748b', marginTop: 1 },
  infoFooterCard: {
    backgroundColor: '#f0fdfa',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccfbf1',
    alignItems: 'center',
  },
  infoFooterHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  infoFooterTitle: { fontSize: 14, fontWeight: '800', color: '#0f172a' },
  infoFooterText: { fontSize: 11, color: '#475569', textAlign: 'center', lineHeight: 16, marginBottom: 14 },
  metaBadgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 12 },
  metaBadge: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  metaBadgeLabel: { fontSize: 9, color: '#64748b', textTransform: 'uppercase', fontWeight: '600' },
  metaBadgeValue: { fontSize: 11, fontWeight: '700', color: '#0f172a', marginTop: 1 },
  copyrightText: { fontSize: 10, color: '#94a3b8', textAlign: 'center' },
});
