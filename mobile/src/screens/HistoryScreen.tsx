import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { Clock, ShieldAlert, CheckCircle, AlertTriangle, ChevronRight, TrendingUp, Calendar } from 'lucide-react-native';

const mockHistory = [
  {
    id: '1',
    product: 'Fizzy Orange Nectar (250ml)',
    date: 'Today, 16:45',
    category: 'High Concern',
    score: 84,
    color: '#f43f5e',
    flag: 'E211 + E110 Synergistic Interaction',
  },
  {
    id: '2',
    product: 'Savory Cheese Flavored Rings',
    date: 'Yesterday, 11:20',
    category: 'Moderate Concern',
    score: 62,
    color: '#f59e0b',
    flag: 'Tartrazine (E102) Allergy Match',
  },
  {
    id: '3',
    product: 'Organic Whole Milk Strawberry Yogurt',
    date: '08 Oct, 08:30',
    category: 'Low Concern',
    score: 18,
    color: '#10b981',
    flag: 'Safe natural extracts (E162, E440)',
  },
  {
    id: '4',
    product: 'Artificially Colored Chewy Candies',
    date: '06 Oct, 14:15',
    category: 'High Concern',
    score: 88,
    color: '#f43f5e',
    flag: 'Allura Red (E129) + Tartrazine (E102)',
  },
];

export function HistoryScreen({ onSelectScan }: { onSelectScan: (item: any) => void }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.title}>Scan History</Text>
          <Text style={styles.subtitle}>Recorded food products for Senudi Perera</Text>
        </View>

        {/* 7-Day Exposure Trend Card (SRS Section 4.5 / REQ-5.3) */}
        <View style={styles.exposureCard}>
          <View style={styles.exposureHeader}>
            <TrendingUp size={18} color="#0d9488" />
            <Text style={styles.exposureTitle}>7-Day Estimated Dietary Exposure</Text>
          </View>
          <Text style={styles.exposureScoreText}>
            Index: <Text style={styles.boldScore}>48 / 100</Text>
          </Text>
          <Text style={styles.exposureDesc}>
            Derived from 4 logged items this week. Moderate exposure index; below conservative safety threshold (50).
          </Text>
          <View style={styles.barVisualWrap}>
            <View style={[styles.barFill, { width: '48%', backgroundColor: '#0d9488' }]} />
          </View>
        </View>

        {/* List of Recent Scans */}
        <Text style={styles.listHeading}>Logged Products</Text>
        {mockHistory.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => onSelectScan(item)}
          >
            <View style={[styles.badgeStrip, { backgroundColor: item.color }]} />
            <View style={styles.cardContent}>
              <View style={styles.rowTop}>
                <Text style={styles.productName}>{item.product}</Text>
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
        ))}
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
  exposureCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 22, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  exposureHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  exposureTitle: { fontSize: 14, fontWeight: '700', color: '#0d9488' },
  exposureScoreText: { fontSize: 14, color: '#334155' },
  boldScore: { fontWeight: '800', color: '#0d9488', fontSize: 16 },
  exposureDesc: { fontSize: 12, color: '#64748b', marginTop: 4, lineHeight: 17 },
  barVisualWrap: { height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, marginTop: 12, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  listHeading: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  card: { backgroundColor: '#ffffff', borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0', flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 10, overflow: 'hidden' },
  badgeStrip: { width: 4, height: '100%', position: 'absolute', left: 0, top: 0, bottom: 0 },
  cardContent: { flex: 1, marginLeft: 8 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productName: { fontSize: 14, fontWeight: '700', color: '#0f172a', flex: 1, marginRight: 8 },
  scoreBadge: { fontSize: 13, fontWeight: '800' },
  dateText: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  rowBottom: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 },
  categoryText: { fontSize: 11, fontWeight: '700' },
  flagText: { fontSize: 11, color: '#64748b', flex: 1 },
});
