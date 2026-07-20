import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Text, Card, Badge, Button, Modal, Portal } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDisease, useFavorites } from '../../hooks/useDirectus';
import { DirectusDisease } from '../../services/directus';
import { DISEASE_CATEGORIES, SPECIES_INFO } from '../../constants/diseases';
import { CATEGORY_COLORS, SEVERITY_COLORS, SEVERITY_LABELS, PROGNOSIS_LABELS } from '../../constants/colors';
import { useTheme } from '../../contexts/ThemeContext';

export default function DiseaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { disease, loading, updateDisease } = useDisease(id || null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'signs' | 'diagnosis' | 'treatment' | 'prevention'>('signs');
  const [editVisible, setEditVisible] = useState(false);
  const [editData, setEditData] = useState<Partial<DirectusDisease>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (disease) {
      setEditData({
        name: disease.name,
        scientific_name: disease.scientific_name,
        species: disease.species,
        category: disease.category,
        severity: disease.severity,
        prognosis: disease.prognosis,
        description: disease.description,
        is_zoonotic: disease.is_zoonotic,
        key_signs: [...(disease.key_signs || [])],
        prevention: [...(disease.prevention || [])],
        references: [...(disease.references || [])],
        diagnosis: { ...(disease.diagnosis as any) || {} },
        treatment: { ...(disease.treatment as any) || {} },
      });
    }
  }, [disease]);

  const openEdit = () => setEditVisible(true);
  const closeEdit = () => setEditVisible(false);

  const handleSave = async () => {
    if (!editData.name?.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }
    setSaving(true);
    try {
      await updateDisease(editData);
      closeEdit();
      Alert.alert('Éxito', 'Enfermedad actualizada');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const updateEditField = (field: string, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const updateEditNested = (parent: string, field: string, value: any) => {
    setEditData(prev => ({
      ...prev,
      [parent]: { ...(prev[parent] as any || {}), [field]: value },
    }));
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingBottom: 32 },
    loadingText: { textAlign: 'center', marginTop: 40, color: colors.textSecondary },
    headerCard: { margin: 12, borderRadius: 12, backgroundColor: colors.surface },
    headerTop: { marginBottom: 8 },
    headerTitle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    editBtn: { padding: 4 },
    diseaseName: { fontWeight: '800', color: colors.text, flex: 1, marginRight: 8 },
    scientificName: { fontStyle: 'italic', color: colors.textSecondary, marginTop: 4 },
    badgeRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 6 },
    badge: { color: '#FFFFFF', fontSize: 11, paddingHorizontal: 8 },
    prognosisRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
    prognosisLabel: { color: colors.textSecondary, marginLeft: 4 },
    prognosisValue: { fontWeight: '600' },
    sectionCard: { marginHorizontal: 12, marginBottom: 12, borderRadius: 12, backgroundColor: colors.surface },
    sectionTitle: { fontWeight: '700', color: colors.text, marginBottom: 12, fontSize: 16 },
    description: { color: colors.text, lineHeight: 22 },
    tabBar: { flexDirection: 'row', marginHorizontal: 12, marginBottom: 12, backgroundColor: colors.surface, borderRadius: 12, padding: 4 },
    tab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8 },
    activeTab: { backgroundColor: colors.primaryContainer || '#E0F2F1' },
    tabLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 4 },
    activeTabLabel: { color: colors.primary, fontWeight: '600' },
    listItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 10 },
    listItemText: { flex: 1, color: colors.text, lineHeight: 20 },
    emergencyCard: { borderColor: colors.error, borderWidth: 1, backgroundColor: '#FFF5F5' },
    emergencyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
    emergencyTitle: { fontWeight: '700', color: colors.error },
    emergencyText: { color: colors.text, lineHeight: 20 },
    reference: { color: colors.textSecondary, fontSize: 12, marginBottom: 4, lineHeight: 18 },
    modalContent: { backgroundColor: colors.surface, margin: 16, borderRadius: 16, padding: 20, maxHeight: '90%' },
    modalTitle: { fontWeight: '700', color: colors.text, marginBottom: 16 },
    editField: { marginBottom: 12 },
    editLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
    editInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10, fontSize: 14 },
    editTextarea: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10, fontSize: 14, minHeight: 60, textAlignVertical: 'top' },
    editSection: { fontSize: 15, fontWeight: '700', color: colors.primary, marginTop: 16, marginBottom: 8, paddingBottom: 6, borderBottomWidth: 2, borderBottomColor: colors.primaryContainer || '#E0F2F1' },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border },
    cancelBtn: { borderColor: colors.border },
    saveBtn: { backgroundColor: colors.primary },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (!disease) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Enfermedad no encontrada</Text>
      </View>
    );
  }

  const favorite = isFavorite(disease.id);

  const tabs = [
    { key: 'signs', label: 'Signos', icon: 'stethoscope' },
    { key: 'diagnosis', label: 'Diagnóstico', icon: 'microscope' },
    { key: 'treatment', label: 'Tratamiento', icon: 'pill' },
    { key: 'prevention', label: 'Prevención', icon: 'shield-check' },
  ] as const;

  const diagnosis = disease.diagnosis as any || {};
  const treatment = disease.treatment as any || {};

  const ArrayEditField = ({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) => (
    <View style={styles.editField}>
      <Text style={styles.editLabel}>{label} (uno por línea)</Text>
      <TextInput
        style={styles.editTextarea}
        multiline
        value={(value || []).join('\n')}
        onChangeText={(t) => onChange(t.split('\n').map(s => s.trim()).filter(Boolean))}
        placeholderTextColor="#999"
      />
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerTop}>
            <View style={styles.headerTitle}>
              <Text variant="headlineSmall" style={styles.diseaseName}>{disease.name}</Text>
              <View style={styles.headerActions}>
                <TouchableOpacity onPress={openEdit} style={styles.editBtn}>
                  <MaterialCommunityIcons name="pencil" size={22} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleFavorite(disease.id)}>
                  <MaterialCommunityIcons
                    name={favorite ? 'heart' : 'heart-outline'}
                    size={28}
                    color={favorite ? colors.error : colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <Text variant="bodyMedium" style={styles.scientificName}>{disease.scientific_name}</Text>
          </View>

          <View style={styles.badgeRow}>
            <Badge style={[styles.badge, { backgroundColor: SPECIES_INFO[disease.species as keyof typeof SPECIES_INFO]?.color || colors.textSecondary }]}>
              {SPECIES_INFO[disease.species as keyof typeof SPECIES_INFO]?.label || disease.species}
            </Badge>
            <Badge style={[styles.badge, { backgroundColor: CATEGORY_COLORS[disease.category] || colors.textSecondary }]}>
              {DISEASE_CATEGORIES[disease.category as keyof typeof DISEASE_CATEGORIES]?.label || disease.category}
            </Badge>
            <Badge style={[styles.badge, { backgroundColor: SEVERITY_COLORS[disease.severity as keyof typeof SEVERITY_COLORS] || colors.textSecondary }]}>
              {SEVERITY_LABELS[disease.severity as keyof typeof SEVERITY_LABELS] || disease.severity}
            </Badge>
            {disease.is_zoonotic && (
              <Badge style={[styles.badge, { backgroundColor: colors.error }]}>
                Zoonótica
              </Badge>
            )}
          </View>

          <View style={styles.prognosisRow}>
            <MaterialCommunityIcons name="chart-line-variant" size={16} color={colors.textSecondary} />
            <Text style={styles.prognosisLabel}>Pronóstico: </Text>
            <Text style={[styles.prognosisValue, { color: colors.primary }]}>
              {PROGNOSIS_LABELS[disease.prognosis as keyof typeof PROGNOSIS_LABELS] || disease.prognosis}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Description */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text variant="titleSmall" style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>{disease.description}</Text>
        </Card.Content>
      </Card>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
          >
            <MaterialCommunityIcons
              name={tab.icon}
              size={20}
              color={activeTab === tab.key ? colors.primary : colors.textSecondary}
            />
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {activeTab === 'signs' && (
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleSmall" style={styles.sectionTitle}>Signos Clave</Text>
            {disease.key_signs && disease.key_signs.map((sign: string, index: number) => (
              <View key={index} style={styles.listItem}>
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={16}
                  color={SEVERITY_COLORS[disease.severity as keyof typeof SEVERITY_COLORS] || colors.textSecondary}
                />
                <Text style={styles.listItemText}>{sign}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {activeTab === 'diagnosis' && (
        <>
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Text variant="titleSmall" style={styles.sectionTitle}>Examen Clínico</Text>
              <Text style={styles.description}>{diagnosis.clinicalExam}</Text>
            </Card.Content>
          </Card>

          {diagnosis.labTests && diagnosis.labTests.length > 0 && (
            <Card style={styles.sectionCard}>
              <Card.Content>
                <Text variant="titleSmall" style={styles.sectionTitle}>Exámenes de Laboratorio</Text>
                {diagnosis.labTests.map((test: string, index: number) => (
                  <View key={index} style={styles.listItem}>
                    <MaterialCommunityIcons name="flask" size={16} color={colors.info} />
                    <Text style={styles.listItemText}>{test}</Text>
                  </View>
                ))}
              </Card.Content>
            </Card>
          )}

          {diagnosis.imaging && diagnosis.imaging.length > 0 && (
            <Card style={styles.sectionCard}>
              <Card.Content>
                <Text variant="titleSmall" style={styles.sectionTitle}>Imagenología</Text>
                {diagnosis.imaging.map((img: string, index: number) => (
                  <View key={index} style={styles.listItem}>
                    <MaterialCommunityIcons name="camera" size={16} color={colors.warning} />
                    <Text style={styles.listItemText}>{img}</Text>
                  </View>
                ))}
              </Card.Content>
            </Card>
          )}

          {diagnosis.differentialDiagnosis && diagnosis.differentialDiagnosis.length > 0 && (
            <Card style={styles.sectionCard}>
              <Card.Content>
                <Text variant="titleSmall" style={styles.sectionTitle}>Diagnóstico Diferencial</Text>
                {diagnosis.differentialDiagnosis.map((dd: string, index: number) => (
                  <View key={index} style={styles.listItem}>
                    <MaterialCommunityIcons name="help-circle-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.listItemText}>{dd}</Text>
                  </View>
                ))}
              </Card.Content>
            </Card>
          )}
        </>
      )}

      {activeTab === 'treatment' && (
        <>
          {treatment.firstLine && treatment.firstLine.length > 0 && (
            <Card style={styles.sectionCard}>
              <Card.Content>
                <Text variant="titleSmall" style={styles.sectionTitle}>Tratamiento Primera Línea</Text>
                {treatment.firstLine.map((tx: string, index: number) => (
                  <View key={index} style={styles.listItem}>
                    <MaterialCommunityIcons name="check-circle" size={16} color={colors.success} />
                    <Text style={styles.listItemText}>{tx}</Text>
                  </View>
                ))}
              </Card.Content>
            </Card>
          )}

          {treatment.secondLine && treatment.secondLine.length > 0 && (
            <Card style={styles.sectionCard}>
              <Card.Content>
                <Text variant="titleSmall" style={styles.sectionTitle}>Tratamiento Segunda Línea</Text>
                {treatment.secondLine.map((tx: string, index: number) => (
                  <View key={index} style={styles.listItem}>
                    <MaterialCommunityIcons name="circle-outline" size={16} color={colors.info} />
                    <Text style={styles.listItemText}>{tx}</Text>
                  </View>
                ))}
              </Card.Content>
            </Card>
          )}

          {treatment.emergency && (
            <Card style={[styles.sectionCard, styles.emergencyCard]}>
              <Card.Content>
                <View style={styles.emergencyHeader}>
                  <MaterialCommunityIcons name="alert" size={20} color={colors.error} />
                  <Text variant="titleSmall" style={styles.emergencyTitle}>Emergencia</Text>
                </View>
                <Text style={styles.emergencyText}>{treatment.emergency}</Text>
              </Card.Content>
            </Card>
          )}

          {treatment.duration && (
            <Card style={styles.sectionCard}>
              <Card.Content>
                <Text variant="titleSmall" style={styles.sectionTitle}>Duración del Tratamiento</Text>
                <Text style={styles.description}>{treatment.duration}</Text>
              </Card.Content>
            </Card>
          )}
        </>
      )}

      {activeTab === 'prevention' && disease.prevention && (
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleSmall" style={styles.sectionTitle}>Medidas Preventivas</Text>
            {disease.prevention.map((prev: string, index: number) => (
              <View key={index} style={styles.listItem}>
                <MaterialCommunityIcons name="shield-check" size={16} color={colors.success} />
                <Text style={styles.listItemText}>{prev}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* References */}
      {disease.references && disease.references.length > 0 && (
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleSmall" style={styles.sectionTitle}>Referencias</Text>
            {disease.references.map((ref: string, index: number) => (
              <Text key={index} style={styles.reference}>• {ref}</Text>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Edit Modal */}
      <Portal>
        <Modal visible={editVisible} onDismiss={closeEdit} contentContainerStyle={styles.modalContent}>
          <ScrollView>
            <Text variant="titleLarge" style={styles.modalTitle}>Editar Enfermedad</Text>

            <View style={styles.editField}>
              <Text style={styles.editLabel}>Nombre *</Text>
              <TextInput style={styles.editInput} value={editData.name || ''} onChangeText={(t) => updateEditField('name', t)} />
            </View>

            <View style={styles.editField}>
              <Text style={styles.editLabel}>Nombre Científico</Text>
              <TextInput style={styles.editInput} value={editData.scientific_name || ''} onChangeText={(t) => updateEditField('scientific_name', t)} />
            </View>

            <View style={styles.editField}>
              <Text style={styles.editLabel}>Descripción *</Text>
              <TextInput style={styles.editTextarea} multiline value={editData.description || ''} onChangeText={(t) => updateEditField('description', t)} />
            </View>

            <Text style={styles.editSection}>Signos Clave</Text>
            <ArrayEditField label="Signos" value={editData.key_signs || []} onChange={(v) => updateEditField('key_signs', v)} />

            <Text style={styles.editSection}>Diagnóstico</Text>
            <View style={styles.editField}>
              <Text style={styles.editLabel}>Examen Clínico</Text>
              <TextInput style={styles.editTextarea} multiline value={(editData.diagnosis as any)?.clinicalExam || ''} onChangeText={(t) => updateEditNested('diagnosis', 'clinicalExam', t)} />
            </View>
            <ArrayEditField label="Laboratorio" value={(editData.diagnosis as any)?.labTests || []} onChange={(v) => updateEditNested('diagnosis', 'labTests', v)} />
            <ArrayEditField label="Imagenología" value={(editData.diagnosis as any)?.imaging || []} onChange={(v) => updateEditNested('diagnosis', 'imaging', v)} />
            <ArrayEditField label="Diagnóstico Diferencial" value={(editData.diagnosis as any)?.differentialDiagnosis || []} onChange={(v) => updateEditNested('diagnosis', 'differentialDiagnosis', v)} />

            <Text style={styles.editSection}>Tratamiento</Text>
            <ArrayEditField label="Primera Línea" value={(editData.treatment as any)?.firstLine || []} onChange={(v) => updateEditNested('treatment', 'firstLine', v)} />
            <ArrayEditField label="Segunda Línea" value={(editData.treatment as any)?.secondLine || []} onChange={(v) => updateEditNested('treatment', 'secondLine', v)} />
            <View style={styles.editField}>
              <Text style={styles.editLabel}>Emergencia</Text>
              <TextInput style={styles.editTextarea} multiline value={(editData.treatment as any)?.emergency || ''} onChangeText={(t) => updateEditNested('treatment', 'emergency', t)} />
            </View>
            <View style={styles.editField}>
              <Text style={styles.editLabel}>Duración</Text>
              <TextInput style={styles.editInput} value={(editData.treatment as any)?.duration || ''} onChangeText={(t) => updateEditNested('treatment', 'duration', t)} />
            </View>

            <Text style={styles.editSection}>Prevención</Text>
            <ArrayEditField label="Medidas" value={editData.prevention || []} onChange={(v) => updateEditField('prevention', v)} />

            <Text style={styles.editSection}>Referencias</Text>
            <ArrayEditField label="Referencias" value={editData.references || []} onChange={(v) => updateEditField('references', v)} />

            <View style={styles.modalActions}>
              <Button mode="outlined" onPress={closeEdit} style={styles.cancelBtn}>Cancelar</Button>
              <Button mode="contained" onPress={handleSave} loading={saving} style={styles.saveBtn}>Guardar</Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    </ScrollView>
  );
}
