import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, Menu, Switch, Dialog, Portal } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../services/directus';
import { DISEASE_CATEGORIES, SPECIES_INFO } from '../../constants/diseases';
import { DiseaseCategory } from '../../types';

const SEVERITY_OPTIONS = [
  { value: 'mild', label: 'Leve' },
  { value: 'moderate', label: 'Moderado' },
  { value: 'severe', label: 'Severo' },
  { value: 'critical', label: 'Crítico' },
];

const PROGNOSIS_OPTIONS = [
  { value: 'excellent', label: 'Excelente' },
  { value: 'good', label: 'Bueno' },
  { value: 'guarded', label: 'Reservado' },
  { value: 'poor', label: 'Malo' },
  { value: 'grave', label: 'Grave' },
];

const CATEGORY_KEYS = Object.keys(DISEASE_CATEGORIES) as DiseaseCategory[];

export default function AddDiseaseScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [name, setName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [species, setSpecies] = useState<'dog' | 'cat' | 'both'>('both');
  const [category, setCategory] = useState<DiseaseCategory>('infectious');
  const [severity, setSeverity] = useState('moderate');
  const [prognosis, setPrognosis] = useState('good');
  const [isZoonotic, setIsZoonotic] = useState(false);
  const [keySigns, setKeySigns] = useState('');
  const [clinicalExam, setClinicalExam] = useState('');
  const [labTests, setLabTests] = useState('');
  const [imaging, setImaging] = useState('');
  const [differentialDiagnosis, setDifferentialDiagnosis] = useState('');
  const [firstLine, setFirstLine] = useState('');
  const [secondLine, setSecondLine] = useState('');
  const [emergency, setEmergency] = useState('');
  const [duration, setDuration] = useState('');
  const [prevention, setPrevention] = useState('');
  const [references, setReferences] = useState('');

  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [severityMenuVisible, setSeverityMenuVisible] = useState(false);
  const [prognosisMenuVisible, setPrognosisMenuVisible] = useState(false);
  const [errorDialog, setErrorDialog] = useState<string | null>(null);

  const splitLines = (text: string) => text.split('\n').map((l) => l.trim()).filter(Boolean);

  const handleSave = async () => {
    if (!name.trim()) {
      setErrorDialog('El nombre de la enfermedad es obligatorio');
      return;
    }

    try {
      await api.diseases.create({
        name: name.trim(),
        scientific_name: scientificName.trim(),
        species,
        category,
        severity,
        prognosis,
        is_zoonotic: isZoonotic,
        description: '',
        key_signs: splitLines(keySigns),
        diagnosis: {
          clinicalExam: clinicalExam.trim(),
          labTests: splitLines(labTests),
          imaging: splitLines(imaging),
          differentialDiagnosis: splitLines(differentialDiagnosis),
        },
        treatment: {
          firstLine: splitLines(firstLine),
          secondLine: splitLines(secondLine),
          emergency: emergency.trim(),
          duration: duration.trim(),
        },
        prevention: splitLines(prevention),
        references: splitLines(references),
      });
      router.back();
    } catch (error) {
      setErrorDialog('No se pudo guardar la enfermedad');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* ── Section: Datos Generales ── */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Datos Generales</Text>

        <TextInput
          label="Nombre de la enfermedad *"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={[styles.input, { backgroundColor: colors.surface }]}
        />
        <TextInput
          label="Nombre científico"
          value={scientificName}
          onChangeText={setScientificName}
          mode="outlined"
          style={[styles.input, { backgroundColor: colors.surface }]}
        />

        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Especie</Text>
        <SegmentedButtons
          value={species}
          onValueChange={(val) => setSpecies(val as 'dog' | 'cat' | 'both')}
          buttons={Object.entries(SPECIES_INFO).map(([key, info]) => ({
            value: key,
            label: info.label,
            icon: info.icon as any,
          }))}
          style={styles.segmented}
        />

        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Categoría</Text>
        <Menu
          visible={categoryMenuVisible}
          onDismiss={() => setCategoryMenuVisible(false)}
          anchor={
            <Button mode="outlined" onPress={() => setCategoryMenuVisible(true)} style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {DISEASE_CATEGORIES[category].label}
            </Button>
          }
        >
          {CATEGORY_KEYS.map((key) => (
            <Menu.Item
              key={key}
              onPress={() => { setCategory(key); setCategoryMenuVisible(false); }}
              title={DISEASE_CATEGORIES[key].label}
              leadingIcon={DISEASE_CATEGORIES[key].icon as any}
            />
          ))}
        </Menu>

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Severidad</Text>
            <Menu
              visible={severityMenuVisible}
              onDismiss={() => setSeverityMenuVisible(false)}
              anchor={
                <Button mode="outlined" onPress={() => setSeverityMenuVisible(true)} style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  {SEVERITY_OPTIONS.find((s) => s.value === severity)?.label}
                </Button>
              }
            >
              {SEVERITY_OPTIONS.map((opt) => (
                <Menu.Item key={opt.value} onPress={() => { setSeverity(opt.value); setSeverityMenuVisible(false); }} title={opt.label} />
              ))}
            </Menu>
          </View>
          <View style={styles.half}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Pronóstico</Text>
            <Menu
              visible={prognosisMenuVisible}
              onDismiss={() => setPrognosisMenuVisible(false)}
              anchor={
                <Button mode="outlined" onPress={() => setPrognosisMenuVisible(true)} style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  {PROGNOSIS_OPTIONS.find((p) => p.value === prognosis)?.label}
                </Button>
              }
            >
              {PROGNOSIS_OPTIONS.map((opt) => (
                <Menu.Item key={opt.value} onPress={() => { setPrognosis(opt.value); setPrognosisMenuVisible(false); }} title={opt.label} />
              ))}
            </Menu>
          </View>
        </View>

        <View style={styles.switchRow}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginBottom: 0 }]}>¿Es zoonótica?</Text>
          <Switch value={isZoonotic} onValueChange={setIsZoonotic} color={colors.primary} />
        </View>
      </View>

      {/* ── Section: Signos Clave ── */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Signos Clave</Text>
        <TextInput
          label="Signos (uno por línea)"
          value={keySigns}
          onChangeText={setKeySigns}
          mode="outlined"
          multiline
          numberOfLines={4}
          placeholder="Fiebre&#10;Vómitos&#10;Diarrea"
          style={[styles.input, { backgroundColor: colors.surface }]}
        />
      </View>

      {/* ── Section: Diagnóstico ── */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Diagnóstico</Text>
        <TextInput
          label="Examen Clínico"
          value={clinicalExam}
          onChangeText={setClinicalExam}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={[styles.input, { backgroundColor: colors.surface }]}
        />
        <TextInput
          label="Exámenes de Laboratorio (uno por línea)"
          value={labTests}
          onChangeText={setLabTests}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={[styles.input, { backgroundColor: colors.surface }]}
        />
        <TextInput
          label="Imagenología (uno por línea)"
          value={imaging}
          onChangeText={setImaging}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={[styles.input, { backgroundColor: colors.surface }]}
        />
        <TextInput
          label="Diagnóstico Diferencial (uno por línea)"
          value={differentialDiagnosis}
          onChangeText={setDifferentialDiagnosis}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={[styles.input, { backgroundColor: colors.surface }]}
        />
      </View>

      {/* ── Section: Tratamiento ── */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Tratamiento</Text>
        <TextInput
          label="Primera Línea (uno por línea)"
          value={firstLine}
          onChangeText={setFirstLine}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={[styles.input, { backgroundColor: colors.surface }]}
        />
        <TextInput
          label="Segunda Línea (uno por línea)"
          value={secondLine}
          onChangeText={setSecondLine}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={[styles.input, { backgroundColor: colors.surface }]}
        />
        <TextInput
          label="Emergencia"
          value={emergency}
          onChangeText={setEmergency}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={[styles.input, { backgroundColor: colors.surface }]}
        />
        <TextInput
          label="Duración"
          value={duration}
          onChangeText={setDuration}
          mode="outlined"
          style={[styles.input, { backgroundColor: colors.surface }]}
        />
      </View>

      {/* ── Section: Prevención ── */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Prevención</Text>
        <TextInput
          label="Medidas (uno por línea)"
          value={prevention}
          onChangeText={setPrevention}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={[styles.input, { backgroundColor: colors.surface }]}
        />
      </View>

      {/* ── Section: Referencias ── */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Referencias</Text>
        <TextInput
          label="Referencias (uno por línea)"
          value={references}
          onChangeText={setReferences}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={[styles.input, { backgroundColor: colors.surface }]}
        />
      </View>

      {/* ── Actions ── */}
      <View style={styles.actions}>
        <Button mode="outlined" onPress={() => router.back()} style={[styles.cancelButton, { borderColor: colors.border }]}>
          Cancelar
        </Button>
        <Button mode="contained" onPress={handleSave} style={[styles.saveButton, { backgroundColor: colors.primary }]}>
          Guardar Enfermedad
        </Button>
      </View>

      {/* Error Dialog */}
      <Portal>
        <Dialog visible={!!errorDialog} onDismiss={() => setErrorDialog(null)}>
          <Dialog.Icon icon="alert-circle-outline" />
          <Dialog.Title style={{ textAlign: 'center' }}>Error</Dialog.Title>
          <Dialog.Content>
            <Text style={{ textAlign: 'center' }}>{errorDialog}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setErrorDialog(null)}>OK</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  card: {
    borderRadius: 12,
    borderLeftWidth: 3,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 12,
  },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  input: { marginBottom: 8 },
  segmented: { marginBottom: 12 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 12,
  },
  cancelButton: {},
  saveButton: {},
});
