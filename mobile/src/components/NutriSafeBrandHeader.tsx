import React from 'react';
import { View, Text, StyleSheet, Platform, StatusBar, TouchableOpacity, Image } from 'react-native';
import { Sparkles, Activity } from 'lucide-react-native';

interface BrandHeaderProps {
  subtitle?: string;
  showStatusBadge?: boolean;
  onPressLogo?: () => void;
}

export function NutriSafeBrandHeader({
  subtitle = 'Pediatric Additive Risk Screening',
  showStatusBadge = true,
  onPressLogo,
}: BrandHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        {/* App Logo & Title Cluster */}
        <TouchableOpacity
          disabled={!onPressLogo}
          onPress={onPressLogo}
          activeOpacity={0.75}
          style={styles.brandCluster}
        >
          <View style={styles.logoBadge}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>
          <View style={styles.titleWrap}>
            <View style={styles.nameRow}>
              <Text style={styles.appName}>NutriSafe</Text>
              <Text style={styles.appNameAi}>AI</Text>
            </View>
            <Text style={styles.tagline}>{subtitle}</Text>
          </View>
        </TouchableOpacity>

        {/* Status / Model Ready Badge */}
        {showStatusBadge && (
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>AI Active</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 10 : 12,
    paddingBottom: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#0d9488',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'visible',
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  logoImage: {
    width: 44,
    height: 44,
    borderRadius: 13,
  },
  logoSparkleDot: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#0f766e',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  titleWrap: {
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  appName: {
    fontSize: 21,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.4,
  },
  appNameAi: {
    fontSize: 21,
    fontWeight: '900',
    color: '#0d9488',
    letterSpacing: -0.4,
  },
  tagline: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#16a34a',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803d',
  },
});
