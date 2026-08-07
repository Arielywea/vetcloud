import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { Thermometer, Heart, Wind, Droplets, Activity, Plus, X } from 'lucide-react-native';
import { directus } from '../../services/directus';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';
import VInput from '../../components/ui/Input';
import VButton from '../../components/ui/Button';

interface VitalSignsProps {
  petId: string;
  visible: boolean;
  onClose: () => void;
}

interface VitalRecord {
  id: string;
  weight?: number;
  temperature?: number;
  heart_rate?: number;
  respiratory_rate?: number;
  blood_pressure?: string;
  spo2?: number;
  mucous_membranes?: string;
  hydration?: string;
  body_condition?: string;
  notes?: string;
  recorded_at: string;
}

export default function VitalSignsForm({ petId, visible, onClose }: VitalSignsProps) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<VitalRecord[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [weight, setWeight] = useState('');
  const [temperature, setTemperature] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [respRate, setRespRate] = useState('');
  const [bp, setBp] = useState('');
  const [spo2, setSpo2] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (visible) loadHistory();
  }, [visible]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await directus.vitals.list(petId);
      setHistory(res.data || []);
    } catch { /* */ }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data: any = { pet_id: petId };
      if (weight) data.weight = parseFloat(weight);
      if (temperature) data.temperature = parseFloat(temperature);
      if (heartRate) data.heart_rate = parseInt(heartRate);
      if (respRate) data.respiratory_rate = parseInt(respRate);
      if (bp) data.blood_pressure = bp;
      if (spo2) data.spo2 = parseInt(spo2);
      if (notes) data.notes = notes;

      await directus.vitals.create(data);
      setShowForm(false);
      setWeight(''); setTemperature(''); setHeartRate(''); setRespRate(''); setBp(''); setSpo2(''); setNotes('');
      await loadHistory();
    } catch { /* */ }
    setSaving(false);
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: '2-digit' }) + ' ' +
      d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  };

  const VitalCard = ({ label, value, unit, icon: Icon }: { label: string; value?: number | string; unit: string; icon: any }) => (
    <View style={[styles.vitalCard, { backgroundColor: colors.surface }, SHADOWS.sm]}>
      <Icon size={16} color={colors.primary} />
      <Text style={[styles.vitalLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.vitalValue, { color: value ? colors.text : colors.textLight }]}>
        {value != null ? `${value}${unit}` : '—'}
      </Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary, borderBottomColor: colors.border }]}>
          <Text style={styles.headerTitle}>Signos Vitales</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
        ) : (
          <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: colors.primaryContainer, borderColor: colors.primary }]}
              onPress={() => setShowForm(true)}
            >
              <Plus size={18} color={colors.primary} />
              <Text style={[styles.addBtnText, { color: colors.primary }]}>Registrar signos</Text>
            </TouchableOpacity>

            {showForm && (
              <View style={[styles.formCard, { backgroundColor: colors.surface }, SHADOWS.md]}>
                <Text style={[styles.formTitle, { color: colors.text }]}>Nueva medicion</Text>
                <View style={styles.vitalGrid}>
                  <View style={{ flex: 1 }}>
                    <VInput label="Peso (kg)" placeholder="0.0" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <VInput label="Temp (°C)" placeholder="38.5" value={temperature} onChangeText={setTemperature} keyboardType="decimal-pad" />
                  </View>
                </View>
                <View style={styles.vitalGrid}>
                  <View style={{ flex: 1 }}>
                    <VInput label="FC (lpm)" placeholder="120" value={heartRate} onChangeText={setHeartRate} keyboardType="number-pad" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <VInput label="FR (rpm)" placeholder="20" value={respRate} onChangeText={setRespRate} keyboardType="number-pad" />
                  </View>
                </View>
                <View style={styles.vitalGrid}>
                  <View style={{ flex: 1 }}>
                    <VInput label="PA" placeholder="120/80" value={bp} onChangeText={setBp} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <VInput label="SpO2 (%)" placeholder="98" value={spo2} onChangeText={setSpo2} keyboardType="number-pad" />
                  </View>
                </View>
                <VInput label="Notas" placeholder="Observaciones..." value={notes} onChangeText={setNotes} multiline />
                <View style={styles.formActions}>
                  <VButton onPress={() => setShowForm(false)} variant="outlined" style={{ flex: 1 }}>Cancelar</VButton>
                  <VButton onPress={handleSave} loading={saving} disabled={saving} style={{ flex: 1 }}>Guardar</VButton>
                </View>
              </View>
            )}

            {history.length === 0 ? (
              <View style={styles.emptyState}>
                <Activity size={40} color={colors.textLight} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Sin registros de signos vitales</Text>
              </View>
            ) : (
              history.map((record) => (
                <View key={record.id} style={[styles.recordCard, { backgroundColor: colors.surface }, SHADOWS.sm]}>
                  <Text style={[styles.recordDate, { color: colors.primary }]}>{formatDate(record.recorded_at)}</Text>
                  <View style={styles.vitalGrid}>
                    <VitalCard label="Peso" value={record.weight} unit=" kg" icon={Droplets} />
                    <VitalCard label="Temp" value={record.temperature} unit="°C" icon={Thermometer} />
                    <VitalCard label="FC" value={record.heart_rate} unit=" lpm" icon={Heart} />
                    <VitalCard label="FR" value={record.respiratory_rate} unit=" rpm" icon={Wind} />
                    <VitalCard label="PA" value={record.blood_pressure} unit="" icon={Activity} />
                    <VitalCard label="SpO2" value={record.spo2} unit="%" icon={Droplets} />
                  </View>
                  {record.notes ? <Text style={[styles.recordNotes, { color: colors.textSecondary }]}>{record.notes}</Text> : null}
                </View>
              ))
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: SPACING.md, paddingHorizontal: SPACING.lg },
  headerTitle: { color: '#fff', fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.bold },
  closeBtn: { padding: SPACING.xs },
  content: { flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1.5, marginBottom: SPACING.lg },
  addBtnText: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
  formCard: { padding: SPACING.lg, borderRadius: RADIUS.xl, marginBottom: SPACING.lg },
  formTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, marginBottom: SPACING.md },
  vitalGrid: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  formActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md },
  recordCard: { padding: SPACING.md, borderRadius: RADIUS.lg, marginBottom: SPACING.md },
  recordDate: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold, marginBottom: SPACING.sm },
  recordNotes: { fontSize: TYPOGRAPHY.sizes.xs, marginTop: SPACING.xs, fontStyle: 'italic' },
  vitalCard: { flex: 1, alignItems: 'center', padding: SPACING.sm, borderRadius: RADIUS.md, gap: 2 },
  vitalLabel: { fontSize: 10, fontWeight: TYPOGRAPHY.weights.semibold, textTransform: 'uppercase' },
  vitalValue: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.bold },
  emptyState: { alignItems: 'center', marginTop: 60, gap: SPACING.md },
  emptyText: { fontSize: TYPOGRAPHY.sizes.sm },
});
