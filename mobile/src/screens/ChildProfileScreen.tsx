import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, TextInput } from 'react-native';
import { ArrowLeft, User, Plus, X, Heart, Shield, Check, Stethoscope } from 'lucide-react-native';

export function ChildProfileScreen({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState('Senudi Perera');
  const [dob, setDob] = useState('2022-08-15');
  const [allergies, setAllergies] = useState(['Tartrazine (E102)', 'Peanuts']);
  const [conditions, setConditions] = useState(['Mild Asthma', 'ADHD / Hyperactivity']);
  const [sensitivities, setSensitivities] = useState(['Artificial Azo Dyes', 'Benzoate Preservatives']);

  const removeAllergy = (item: string) => {
    setAllergies(allergies.filter(a => a !== item));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Nav Header */}
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <ArrowLeft size={20} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Child Health Profile</Text>
          <TouchableOpacity style={styles.saveButton} onPress={onBack}>
            <Check size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Profile Avatar Card */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarCircle}>
            <User size={36} color="#0d9488" />
          </View>
          <Text style={styles.avatarName}>{name}</Text>
          <Text style={styles.avatarAge}>4 Years, 2 Months Old • ID: CHD-9021</Text>
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
            {allergies.map((item, idx) => (
              <View key={idx} style={styles.allergyTag}>
                <Text style={styles.allergyTagText}>{item}</Text>
                <TouchableOpacity onPress={() => removeAllergy(item)}>
                  <X size={14} color="#991b1b" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Diagnosed Conditions */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeader}>Health Conditions</Text>
            <Heart size={16} color="#0d9488" />
          </View>
          <View style={styles.tagWrap}>
            {conditions.map((item, idx) => (
              <View key={idx} style={styles.conditionTag}>
                <Text style={styles.conditionTagText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Food Sensitivities */}
        <View style={styles.formSection}>
          <Text style={styles.sectionHeader}>Food Sensitivities</Text>
          <View style={styles.tagWrap}>
            {sensitivities.map((item, idx) => (
              <View key={idx} style={styles.sensitivityTag}>
                <Text style={styles.sensitivityTagText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Linked Pediatrician Status (SRS REQ-7.1) */}
        <View style={styles.pediatricianCard}>
          <Stethoscope size={20} color="#0d9488" />
          <View style={{ flex: 1 }}>
            <Text style={styles.pedTitle}>Linked Pediatrician</Text>
            <Text style={styles.pedSub}>Dr. K. Jayasuriya (Lady Ridgeway Hospital)</Text>
          </View>
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>Linked</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 20 },
  navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  saveButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0d9488', justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  avatarCard: { alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
  avatarCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#ccfbf1', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarName: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  avatarAge: { fontSize: 12, color: '#64748b', marginTop: 2 },
  formSection: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionHeader: { fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 12, color: '#64748b', fontWeight: '500', marginBottom: 6 },
  textInput: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#0f172a' },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  allergyTag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fee2e2', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  allergyTagText: { fontSize: 12, color: '#991b1b', fontWeight: '600' },
  conditionTag: { backgroundColor: '#e0f2fe', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  conditionTagText: { fontSize: 12, color: '#0369a1', fontWeight: '600' },
  sensitivityTag: { backgroundColor: '#fef3c7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  sensitivityTagText: { fontSize: 12, color: '#b45309', fontWeight: '600' },
  pediatricianCard: { backgroundColor: '#f0fdfa', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#ccfbf1', flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  pedTitle: { fontSize: 13, fontWeight: '700', color: '#0f766e' },
  pedSub: { fontSize: 11, color: '#115e59', marginTop: 1 },
  activeBadge: { backgroundColor: '#ccfbf1', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  activeBadgeText: { fontSize: 10, fontWeight: '700', color: '#0f766e' },
});
