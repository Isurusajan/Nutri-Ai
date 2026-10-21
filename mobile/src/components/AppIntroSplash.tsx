import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Image,
  Easing,
  Platform,
} from 'react-native';
import { ShieldCheck, Sparkles, ChevronRight, Zap, HeartHandshake, Eye } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface AppIntroSplashProps {
  onFinish: () => void;
}

export function AppIntroSplash({ onFinish }: AppIntroSplashProps) {
  // Animation Values
  const logoScale = useRef(new Animated.Value(0.4)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.9)).current;
  const ringOpacity = useRef(new Animated.Value(0.8)).current;

  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;

  const featuresOpacity = useRef(new Animated.Value(0)).current;
  const featuresTranslateY = useRef(new Animated.Value(20)).current;

  const bottomOpacity = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const screenOpacity = useRef(new Animated.Value(1)).current;

  // Status Ticker Message State
  const [tickerText, setTickerText] = useState('Initializing Computer Vision Models...');

  useEffect(() => {
    // 1. Looping Pulse Animation for Logo Ring
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(ringScale, {
            toValue: 1.45,
            duration: 1800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(ringScale, {
            toValue: 0.9,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(ringOpacity, {
            toValue: 0,
            duration: 1800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity, {
            toValue: 0.8,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // 2. Main Staggered Entrance Choreography
    Animated.sequence([
      // Logo Spring in
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),

      // Brand Title Slide & Fade
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 450,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),

      // Highlight Features
      Animated.parallel([
        Animated.timing(featuresOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(featuresTranslateY, {
          toValue: 0,
          duration: 450,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),

      // Bottom Progress & Ticker
      Animated.timing(bottomOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();

    // 3. Progress Bar Fill (2.6 seconds total)
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2600,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    // 4. Dynamic Ticker Text Updates
    const t1 = setTimeout(() => {
      setTickerText('Loading Pediatric Chemical Knowledge Graph...');
    }, 900);

    const t2 = setTimeout(() => {
      setTickerText('NutriSafe Pediatric Shield Active ✨');
    }, 1800);

    // 5. Automatic Smooth Dismiss at 2.9s
    const exitTimer = setTimeout(() => {
      handleExit();
    }, 2900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(exitTimer);
    };
  }, []);

  const handleExit = () => {
    Animated.timing(screenOpacity, {
      toValue: 0,
      duration: 320,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      onFinish();
    });
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <StatusBar barStyle="light-content" backgroundColor="#042f2e" />

      {/* Ambient Background Glowing Orbs */}
      <View style={styles.ambientGlowTop} />
      <View style={styles.ambientGlowBottom} />
      <View style={styles.ambientGlowCenter} />

      {/* Top Header / Skip Row */}
      <View style={styles.topBar}>
        <View style={styles.academicBadge}>
          <Text style={styles.academicBadgeText}>Pediatric Food Safety AI</Text>
        </View>

        <TouchableOpacity onPress={handleExit} style={styles.skipButton} activeOpacity={0.7}>
          <Text style={styles.skipButtonText}>Skip</Text>
          <ChevronRight size={14} color="#99f6e4" />
        </TouchableOpacity>
      </View>

      {/* Center Hero Logo & Typography */}
      <View style={styles.centerHero}>
        {/* Animated Radar Pulse Ring */}
        <Animated.View
          style={[
            styles.pulseRing,
            {
              transform: [{ scale: ringScale }],
              opacity: ringOpacity,
            },
          ]}
        />

        {/* Central Logo Emblem */}
        <Animated.View
          style={[
            styles.logoWrap,
            {
              transform: [{ scale: logoScale }],
              opacity: logoOpacity,
            },
          ]}
        >
          <View style={styles.logoCard}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* App Title & AI Tagline */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslateY }],
            },
          ]}
        >
          <View style={styles.brandRow}>
            <Text style={styles.brandNutri}>Nutri</Text>
            <Text style={styles.brandSafe}>Safe</Text>
            <View style={styles.aiPill}>
              <Text style={styles.aiPillText}>AI</Text>
            </View>
          </View>

          <Text style={styles.tagline}>
            Pediatric Food Safety & Additive Risk Intelligence
          </Text>
        </Animated.View>

        {/* 3 Core Value Pillars (Animated Badges) */}
        <Animated.View
          style={[
            styles.featuresContainer,
            {
              opacity: featuresOpacity,
              transform: [{ translateY: featuresTranslateY }],
            },
          ]}
        >
          <View style={styles.featurePill}>
            <Eye size={13} color="#2dd4bf" />
            <Text style={styles.featureText}>Smart OCR Scanner</Text>
          </View>

          <View style={styles.featurePill}>
            <Zap size={13} color="#fbbf24" />
            <Text style={styles.featureText}>Synergy Detection</Text>
          </View>

          <View style={styles.featurePill}>
            <HeartHandshake size={13} color="#f472b6" />
            <Text style={styles.featureText}>Child Health Profile</Text>
          </View>
        </Animated.View>
      </View>

      {/* Bottom Progress Bar & Get Started Button */}
      <Animated.View style={[styles.bottomSection, { opacity: bottomOpacity }]}>
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
          </View>
          <Text style={styles.tickerText}>{tickerText}</Text>
        </View>

        <TouchableOpacity
          style={styles.enterButton}
          onPress={handleExit}
          activeOpacity={0.85}
        >
          <Text style={styles.enterButtonText}>Get Started</Text>
          <ChevronRight size={18} color="#042f2e" />
        </TouchableOpacity>

        <Text style={styles.versionText}>v1.0.0 • Personalized Pediatric Defense</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#042f2e', // Deep rich medical teal midnight
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 12 : 54,
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
  },
  ambientGlowTop: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(20, 184, 166, 0.18)',
  },
  ambientGlowBottom: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
  },
  ambientGlowCenter: {
    position: 'absolute',
    top: height * 0.35,
    width: width * 0.9,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  academicBadge: {
    backgroundColor: 'rgba(13, 148, 136, 0.28)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.3)',
  },
  academicBadgeText: {
    fontSize: 11,
    color: '#99f6e4',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  skipButtonText: {
    fontSize: 12,
    color: '#99f6e4',
    fontWeight: '600',
  },
  centerHero: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 'auto',
  },
  pulseRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'rgba(45, 212, 191, 0.6)',
  },
  logoWrap: {
    marginBottom: 24,
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 12,
  },
  logoCard: {
    width: 108,
    height: 108,
    borderRadius: 28,
    backgroundColor: '#0f766e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(45, 212, 191, 0.65)',
    position: 'relative',
    overflow: 'visible',
  },
  logoImage: {
    width: 82,
    height: 82,
    borderRadius: 20,
  },
  sparkleBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#0d9488',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandNutri: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  brandSafe: {
    fontSize: 36,
    fontWeight: '900',
    color: '#2dd4bf', // Emerald/teal highlight
    letterSpacing: -0.5,
  },
  aiPill: {
    backgroundColor: '#10b981',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
  aiPillText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 13,
    color: '#ccfbf1',
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    maxWidth: 320,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 118, 110, 0.45)',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.25)',
  },
  featureText: {
    fontSize: 11,
    color: '#e2e8f0',
    fontWeight: '600',
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    gap: 14,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2dd4bf',
    borderRadius: 2,
  },
  tickerText: {
    fontSize: 11,
    color: '#99f6e4',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  enterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2dd4bf',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#2dd4bf',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  enterButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#042f2e',
    letterSpacing: 0.3,
  },
  versionText: {
    fontSize: 10,
    color: '#5eead4',
    opacity: 0.7,
    fontWeight: '500',
  },
});
