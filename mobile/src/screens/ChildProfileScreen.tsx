import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, TextInput, Alert, Image } from 'react-native';
import { ArrowLeft, User, Plus, X, Heart, Shield, Check, Stethoscope, Sparkles, UserPlus, Camera as CameraIcon, Trash2, RotateCcw } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '../store/useAppStore';

export function ChildProfileScreen({ onBack }: { onBack: () => void }) {
  const activeChild = useAppStore((state) => state.getActiveChild());
  const allChildren = useAppStore((state) => state.children);
  const setActiveChild = useAppStore((state) => state.setActiveChild);
  const updateActiveChild = useAppStore((state) => state.updateActiveChild);
  const addChild = useAppStore((state) => state.addChild);
  const removeChild = useAppStore((state) => state.removeChild);
  const resetToDemoData = useAppStore((state) => state.resetToDemoData);
  const addAllergy = useAppStore((state) => state.addAllergy);
  const removeAllergy = useAppStore((state) => state.removeAllergy);
  const addCondition = useAppStore((state) => state.addCondition);
  const removeCondition = useAppStore((state) => state.removeCondition);

  const [name, setName] = useState(activeChild.name);
  const [dob, setDob] = useState(activeChild.birthDate);
  const [pediatrician, setPediatrician] = useState(activeChild.linkedPediatrician);
  const [newAllergyInput, setNewAllergyInput] = useState('');
  const [newConditionInput, setNewConditionInput] = useState('');

  const handlePickAvatar = () => {
    Alert.alert(
      'Profile Photo',
      'Select an option to update profile picture',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            try {
              const { status } = await ImagePicker.requestCameraPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Camera access is required to take a profile photo.');
                return;
              }
              const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });
              if (!result.canceled && result.assets && result.assets.length > 0) {
                updateActiveChild({ avatarUri: result.assets[0].uri });
              }
            } catch (err) {
              console.warn('Camera picker error:', err);
            }
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            try {
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Photo library permission is required to choose a profile photo.');
                return;
              }
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });
              if (!result.canceled && result.assets && result.assets.length > 0) {
                updateActiveChild({ avatarUri: result.assets[0].uri });
              }
            } catch (err) {
              console.warn('Library picker error:', err);
            }
          },
        },
        ...(activeChild.avatarUri
          ? [
              {
                text: 'Remove Photo',
                style: 'destructive' as const,
                onPress: () => updateActiveChild({ avatarUri: undefined }),
              },
            ]
          : []),
        {
          text: 'Cancel',
          style: 'cancel' as const,
        },
      ]
    );
  };

  // Sync fields when active child changes
  useEffect(() => {
    setName(activeChild.name);
    setDob(activeChild.birthDate);
    setPediatrician(activeChild.linkedPediatrician);
  }, [activeChild.id]);

  const handleSave = () => {
    const finalName = name.trim() || activeChild.name;
    const finalDob = dob.trim() || activeChild.birthDate;
    const finalPediatrician = pediatrician.trim() || activeChild.linkedPediatrician;

    updateActiveChild({
      name: finalName,
      birthDate: finalDob,
      linkedPediatrician: finalPediatrician,
    });

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    Alert.alert(
      'Profile Saved ✅',
      `"${finalName}" profile details have been saved permanently.`,
      [{ text: 'OK', onPress: onBack }]
    );
  };

  const handleBack = () => {
    const isDirty =
      name.trim() !== activeChild.name ||
      dob.trim() !== activeChild.birthDate ||
      pediatrician.trim() !== activeChild.linkedPediatrician;

    if (isDirty) {
      Alert.alert(
        'Save Changes?',
        `You have unsaved changes to ${activeChild.name}'s profile. Do you want to save them before leaving?`,
        [
          { text: 'Discard', style: 'destructive', onPress: onBack },
          { text: 'Save & Exit', onPress: handleSave },
        ]
      );
    } else {
      onBack();
    }
  };

  const handleDeleteCurrentChild = () => {
    if (allChildren.length <= 1) {
      Alert.alert('Cannot Delete', 'At least one active child profile is required.');
      return;
    }
    Alert.alert(
      'Delete Profile',
      `Are you sure you want to delete "${activeChild.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            removeChild(activeChild.id);
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            } catch {}
          },
        },
      ]
    );
  };

  const handleResetToDemo = () => {
    Alert.alert(
      'Reset Demo Profiles',
      'Do you want to reset and restore the default research profiles (Senudi & Kasun Perera)?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore Demo',
          style: 'destructive',
          onPress: () => {
            resetToDemoData();
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            } catch {}
            Alert.alert('Restored', 'Default demo profiles restored.');
          },
        },
      ]
    );
  };

  const handleAddAllergy = () => {
    if (newAllergyInput.trim()) {
      addAllergy(newAllergyInput.trim());
      setNewAllergyInput('');
    }
  };

  const handleAddCondition = () => {
    if (newConditionInput.trim()) {
      addCondition(newConditionInput.trim());
      setNewConditionInput('');
    }
  };

  const handleAddNewChild = () => {
    const id = addChild({
      name: 'Baby Perera',
      birthDate: '2025-01-01',
      ageYears: 1.2,
      allergies: [],
      sensitivities: [],
      conditions: [],
      linkedPediatrician: 'Dr. K. Jayasuriya (Lady Ridgeway Hospital)',
    });
    setActiveChild(id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Nav Header */}
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={20} color="#0f172a" />
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.navBrandTag}>NUTRISAFE AI</Text>
            <Text style={styles.navTitle}>Child Health Profile</Text>
          </View>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Check size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Multi-Child Selector Tabs */}
        <View style={styles.childTabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.childTabsScroll}>
            {allChildren.map((child) => {
              const isActive = child.id === activeChild.id;
              return (
                <TouchableOpacity
                  key={child.id}
                  style={[styles.childTabPill, isActive && styles.childTabPillActive]}
                  onPress={() => setActiveChild(child.id)}
                >
                  <User size={14} color={isActive ? '#ffffff' : '#0d9488'} />
                  <Text style={[styles.childTabText, isActive && styles.childTabTextActive]}>
                    {child.name}
                  </Text>
                  {isActive && <View style={styles.activeDot} />}
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity style={styles.addChildPill} onPress={handleAddNewChild}>
              <UserPlus size={14} color="#0d9488" />
              <Text style={styles.addChildText}>+ Add Child</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Profile Avatar Card */}
        <View style={styles.avatarCard}>
          <TouchableOpacity
            style={styles.avatarTouchable}
            onPress={handlePickAvatar}
            activeOpacity={0.8}
          >
            <View style={styles.avatarCircle}>
              {activeChild.avatarUri ? (
                <Image source={{ uri: activeChild.avatarUri }} style={styles.avatarImage} />
              ) : (
                <User size={36} color="#0d9488" />
              )}
            </View>
            <View style={styles.avatarBadge}>
              <CameraIcon size={14} color="#ffffff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarName}>{name}</Text>
          <Text style={styles.avatarAge}>
            {activeChild.ageYears} Years Old • ID: {activeChild.id}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <TouchableOpacity onPress={handlePickAvatar} style={styles.changePhotoBtn}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
            {allChildren.length > 1 && (
              <TouchableOpacity onPress={handleDeleteCurrentChild} style={styles.deleteProfileBtn}>
                <Trash2 size={12} color="#ef4444" />
                <Text style={styles.deleteProfileText}>Delete Profile</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Basic Info Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionHeader}>Child Details</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Child's display name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date of Birth (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.textInput}
              value={dob}
              onChangeText={setDob}
              placeholder="e.g. 2022-08-15"
            />
          </View>
        </View>

        {/* Known Allergies (SRS REQ-2.4) */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeader}>Known Food & Additive Allergies</Text>
            <Shield size={16} color="#f43f5e" />
          </View>

          <View style={styles.tagWrap}>
            {activeChild.allergies.length === 0 ? (
              <Text style={styles.emptyTagText}>No known allergies logged.</Text>
            ) : (
              activeChild.allergies.map((item, idx) => (
                <View key={idx} style={styles.allergyTag}>
                  <Text style={styles.allergyTagText}>{item}</Text>
                  <TouchableOpacity onPress={() => removeAllergy(item)}>
                    <X size={14} color="#991b1b" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

          {/* Inline Add Allergy Input */}
          <View style={styles.addInlineRow}>
            <TextInput
              style={styles.inlineInput}
              value={newAllergyInput}
              onChangeText={setNewAllergyInput}
              placeholder="Add allergy (e.g. Tartrazine E102, Soy)"
              placeholderTextColor="#94a3b8"
            />
            <TouchableOpacity style={styles.inlineAddBtn} onPress={handleAddAllergy}>
              <Plus size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Diagnosed Conditions */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeader}>Health Conditions</Text>
            <Heart size={16} color="#0d9488" />
          </View>

          <View style={styles.tagWrap}>
            {activeChild.conditions.length === 0 ? (
              <Text style={styles.emptyTagText}>No health conditions logged.</Text>
            ) : (
              activeChild.conditions.map((item, idx) => (
                <View key={idx} style={styles.conditionTag}>
                  <Text style={styles.conditionTagText}>{item}</Text>
                  <TouchableOpacity onPress={() => removeCondition(item)}>
                    <X size={14} color="#0369a1" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

          {/* Inline Add Condition Input */}
          <View style={styles.addInlineRow}>
            <TextInput
              style={styles.inlineInput}
              value={newConditionInput}
              onChangeText={setNewConditionInput}
              placeholder="Add condition (e.g. Mild Asthma, ADHD)"
              placeholderTextColor="#94a3b8"
            />
            <TouchableOpacity style={styles.inlineAddBtn} onPress={handleAddCondition}>
              <Plus size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Linked Pediatrician Status (SRS REQ-7.1) */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeader}>Linked Pediatrician</Text>
            <Stethoscope size={16} color="#0d9488" />
          </View>
          <TextInput
            style={styles.textInput}
            value={pediatrician}
            onChangeText={setPediatrician}
            placeholder="e.g. Dr. K. Jayasuriya (Lady Ridgeway Hospital)"
          />
        </View>

        {/* Bottom Save Action Button */}
        <TouchableOpacity style={styles.bottomSaveBtn} onPress={handleSave}>
          <Check size={18} color="#ffffff" />
          <Text style={styles.bottomSaveBtnText}>Save Profile Changes</Text>
        </TouchableOpacity>

        {/* Restore Demo Defaults */}
        <TouchableOpacity style={styles.resetDemoBtn} onPress={handleResetToDemo}>
          <RotateCcw size={14} color="#64748b" />
          <Text style={styles.resetDemoBtnText}>Restore Default Research Profiles</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 18, paddingTop: 14, paddingBottom: 36 },
  navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  saveButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0d9488', justifyContent: 'center', alignItems: 'center' },
  navBrandTag: { fontSize: 10, fontWeight: '800', color: '#0d9488', letterSpacing: 0.8 },
  navTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  childTabsContainer: { marginBottom: 16 },
  childTabsScroll: { gap: 8, paddingVertical: 4 },
  childTabPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#ccfbf1', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  childTabPillActive: { backgroundColor: '#0d9488', borderColor: '#0d9488' },
  childTabText: { fontSize: 13, fontWeight: '600', color: '#0f766e' },
  childTabTextActive: { color: '#ffffff' },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fef08a' },
  addChildPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f0fdfa', borderWidth: 1, borderStyle: 'dashed', borderColor: '#0d9488', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  addChildText: { fontSize: 12, fontWeight: '700', color: '#0d9488' },
  avatarCard: { alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 18 },
  avatarTouchable: { position: 'relative', marginBottom: 10 },
  avatarCircle: { width: 84, height: 84, borderRadius: 42, backgroundColor: '#ccfbf1', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%', borderRadius: 42 },
  avatarBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#0d9488', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#ffffff' },
  avatarName: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  avatarAge: { fontSize: 12, color: '#64748b', marginTop: 2 },
  changePhotoBtn: { marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, backgroundColor: '#f0fdfa', borderRadius: 12, borderWidth: 1, borderColor: '#99f6e4' },
  changePhotoText: { fontSize: 11, fontWeight: '700', color: '#0d9488' },
  formSection: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionHeader: { fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 12, color: '#64748b', fontWeight: '500', marginBottom: 6 },
  textInput: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#0f172a' },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  emptyTagText: { fontSize: 12, color: '#94a3b8', fontStyle: 'italic' },
  allergyTag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fee2e2', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  allergyTagText: { fontSize: 12, color: '#991b1b', fontWeight: '600' },
  conditionTag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#e0f2fe', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  conditionTagText: { fontSize: 12, color: '#0369a1', fontWeight: '600' },
  addInlineRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  inlineInput: { flex: 1, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: '#0f172a' },
  inlineAddBtn: { backgroundColor: '#0d9488', width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  bottomSaveBtn: { backgroundColor: '#0d9488', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, marginTop: 4 },
  bottomSaveBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  deleteProfileBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#fef2f2', borderRadius: 12, borderWidth: 1, borderColor: '#fecaca' },
  deleteProfileText: { fontSize: 11, fontWeight: '700', color: '#ef4444' },
  resetDemoBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingVertical: 12, marginTop: 8 },
  resetDemoBtnText: { color: '#64748b', fontSize: 13, fontWeight: '600' },
});
