import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Image } from 'react-native';
import { Clock, ShieldAlert, CheckCircle, AlertTriangle, ChevronRight, TrendingUp, Calendar, Sparkles } from 'lucide-react-native';
import { NutriSafeBrandHeader } from '../components/NutriSafeBrandHeader';
import { useActiveChild, useActiveChildHistory, use7DayExposureIndex, getFoodItemImageUri } from '../store/useAppStore';

export function HistoryScreen({ onSelectScan }: { onSelectScan: (item: any, imageUri?: string) => void }) {
  const activeChild = useActiveChild();
  const history = useActiveChildHistory();
  const exposureIndex = use7DayExposureIndex();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <NutriSafeBrandHeader subtitle="Dietary Exposure Journal" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.title}>Scan History</Text>
          <Text style={styles.subtitle}>Recorded food products for {activeChild.name}</Text>
        </View>

        {/* 7-Day Exposure Trend Card (SRS Section 4.5 / REQ-5.3) */}
        <View style={styles.exposureCard}>
          <View style={styles.exposureHeader}>
            <TrendingUp size={18} color="#0d9488" />
            <Text style={styles.exposureTitle}>7-Day Estimated Dietary Exposure</Text>
          </View>
          <Text style={styles.exposureScoreText}>
            Index: <Text style={styles.boldScore}>{exposureIndex} / 100</Text>
          </Text>
          <Text style={styles.exposureDesc}>
            Derived from {history.length} logged items this week for {activeChild.name}.{' '}
            {exposureIndex >= 60
              ? 'Elevated exposure index; consider low-additive alternatives.'
              : 'Within safe cumulative exposure threshold (< 50).'}
          </Text>
          <View style={styles.barVisualWrap}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${Math.min(exposureIndex, 100)}%`,
                  backgroundColor: exposureIndex >= 60 ? '#f43f5e' : '#0d9488',
                },
              ]}
            />
          </View>
        </View>

        {/* List of Recent Scans */}
        <Text style={styles.listHeading}>Logged Products ({history.length})</Text>

        {history.length === 0 ? (
          <View style={styles.emptyCard}>
            <Sparkles size={28} color="#94a3b8" />
            <Text style={styles.emptyTitle}>No Scans Logged Yet</Text>
            <Text style={styles.emptySub}>
              Scan an ingredient label with your camera to evaluate risk factors and log dietary history.
            </Text>
          </View>
        ) : (
          history.map((item) => {
            const itemImg = getFoodItemImageUri(item.productName, item.imageUri);
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => onSelectScan(item.fullAssessment, item.imageUri || itemImg)}
                activeOpacity={0.7}
              >
                <View style={[styles.badgeStrip, { backgroundColor: item.color }]} />

                {/* Product Image Thumbnail */}
                <View style={styles.recentThumbWrap}>
                  <Image
                    source={{ uri: itemImg }}
                    style={styles.recentThumbImage}
                    resizeMode="contain"
                  />
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.rowTop}>
                    <Text style={styles.productName} numberOfLines={1}>{item.productName}</Text>
                    <Text style={[styles.scoreBadge, { color: item.color }]}>{item.score}/100</Text>
                  </View>

                  <Text style={styles.dateText}>{item.date}</Text>

                  <View style={styles.rowBottom}>
                    <Text style={[styles.categoryText, { color: item.color }]}>
                      {item.category}
                    </Text>
                    <Text style={styles.flagText} numberOfLines={1}>• {item.flag}</Text>
                  </View>
                </View>
                <ChevronRight size={18} color="#94a3b8" />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 18, paddingTop: 14 },
  header: { marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  exposureCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 22, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  exposureHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  exposureTitle: { fontSize: 14, fontWeight: '700', color: '#0d9488' },
  exposureScoreText: { fontSize: 14, color: '#334155' },
  boldScore: { fontWeight: '800', color: '#0d9488', fontSize: 16 },
  exposureDesc: { fontSize: 12, color: '#64748b', marginTop: 4, lineHeight: 17 },
  barVisualWrap: { height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, marginTop: 12, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  listHeading: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  card: { backgroundColor: '#ffffff', borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0', flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 10, overflow: 'hidden' },
  badgeStrip: { width: 4, height: '100%', position: 'absolute', left: 0, top: 0, bottom: 0 },
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
  cardContent: { flex: 1, marginLeft: 10 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productName: { fontSize: 14, fontWeight: '700', color: '#0f172a', flex: 1, marginRight: 8 },
  scoreBadge: { fontSize: 13, fontWeight: '800' },
  dateText: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  rowBottom: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 },
  categoryText: { fontSize: 11, fontWeight: '700' },
  flagText: { fontSize: 11, color: '#64748b', flex: 1 },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
    marginTop: 10,
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  emptySub: { fontSize: 12, color: '#64748b', textAlign: 'center', lineHeight: 18 },
});
