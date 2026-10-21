import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView } from 'react-native';
import { HomeScreen } from './src/screens/HomeScreen';
import { ScanResultScreen } from './src/screens/ScanResultScreen';
import { ChildProfileScreen } from './src/screens/ChildProfileScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { InfoScreen } from './src/screens/InfoScreen';
import { Camera, Clock, User, Info } from 'lucide-react-native';
import { ScanAssessmentResponse } from './src/api/client';
import { AppIntroSplash } from './src/components/AppIntroSplash';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<'scan' | 'history' | 'profile' | 'info'>('scan');
  const [currentResult, setCurrentResult] = useState<{ result: ScanAssessmentResponse; imageUri?: string } | null>(null);

  const handleOpenResult = (res: ScanAssessmentResponse, imageUri?: string) => {
    setCurrentResult({ result: res, imageUri });
  };

  if (showSplash) {
    return <AppIntroSplash onFinish={() => setShowSplash(false)} />;
  }

  return (
    <View style={styles.container}>
      {/* Active Screen Content */}
      <View style={styles.content}>
        {currentResult ? (
          <ScanResultScreen
            result={currentResult.result}
            imageUri={currentResult.imageUri}
            onBack={() => setCurrentResult(null)}
          />
        ) : (
          <>
            {activeTab === 'scan' && (
              <HomeScreen
                onNavigateToResult={handleOpenResult}
                onNavigateToProfile={() => setActiveTab('profile')}
                onReplayIntro={() => setShowSplash(true)}
              />
            )}
            {activeTab === 'history' && (
              <HistoryScreen
                onSelectScan={(assessment) => handleOpenResult(assessment)}
              />
            )}
            {activeTab === 'profile' && (
              <ChildProfileScreen onBack={() => setActiveTab('scan')} />
            )}
            {activeTab === 'info' && (
              <InfoScreen onReplayIntro={() => setShowSplash(true)} />
            )}
          </>
        )}
      </View>

      {/* Bottom Navigation Bar */}
      {!currentResult && (
        <SafeAreaView style={styles.navBarContainer}>
          <View style={styles.navBar}>
            <TouchableOpacity
              style={styles.navTab}
              onPress={() => setActiveTab('scan')}
            >
              <Camera
                size={22}
                color={activeTab === 'scan' ? '#0d9488' : '#94a3b8'}
              />
              <Text
                style={[
                  styles.navLabel,
                  activeTab === 'scan' && styles.navLabelActive,
                ]}
              >
                Scan
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navTab}
              onPress={() => setActiveTab('history')}
            >
              <Clock
                size={22}
                color={activeTab === 'history' ? '#0d9488' : '#94a3b8'}
              />
              <Text
                style={[
                  styles.navLabel,
                  activeTab === 'history' && styles.navLabelActive,
                ]}
              >
                History
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navTab}
              onPress={() => setActiveTab('profile')}
            >
              <User
                size={22}
                color={activeTab === 'profile' ? '#0d9488' : '#94a3b8'}
              />
              <Text
                style={[
                  styles.navLabel,
                  activeTab === 'profile' && styles.navLabelActive,
                ]}
              >
                Profile
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navTab}
              onPress={() => setActiveTab('info')}
            >
              <Info
                size={22}
                color={activeTab === 'info' ? '#0d9488' : '#94a3b8'}
              />
              <Text
                style={[
                  styles.navLabel,
                  activeTab === 'info' && styles.navLabelActive,
                ]}
              >
                About
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
  },
  navBarContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  navBar: {
    flexDirection: 'row',
    height: 58,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  navTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    flex: 1,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 3,
  },
  navLabelActive: {
    color: '#0d9488',
    fontWeight: '700',
  },
});
