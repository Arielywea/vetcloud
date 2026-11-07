import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';
import VInput from '../ui/Input';
import Segmented from '../ui/Segmented';
import { SPACING, TYPOGRAPHY } from '../../constants/tokens';
import {
  ExamForm, NodeKey, NODE_LABEL, NODE_OPTIONS, MUCOSAS, PLIEGUE, DESHID, ESTADO, BCS, ESTRES, PELAJE, ANIMO, APETITO, AGUA,
} from '../../utils/physicalExam';

interface Props { exam: ExamForm; onChange: (e: ExamForm) => void }

// Tapping the chosen option again clears it: every field is optional
function Pick({ label, options, value, onChange }: { label: string; options: ReadonlyArray<{ value: string; label: string }>; value: string | null; onChange: (v: string | null) => void }) {
  const { colors } = useTheme();
  return (
    <View style={styles.group}>
      <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Segmented label={label} size="sm" options={options} value={value} onChange={(v) => onChange(v === value ? null : v)} />
    </View>
  );
}

export function VitalsAndExam({ exam, onChange }: Props) {
  const set = <K extends keyof ExamForm>(k: K, v: ExamForm[K]) => onChange({ ...exam, [k]: v });
  const unit = (label: string, key: 'fc' | 'fr' | 'temp' | 'tllc', suffix: string, ph: string) => (
    <VInput containerStyle={styles.cell} label={`${label} (${suffix})`} value={exam[key]} onChangeText={(v) => set(key, v)} placeholder={ph} keyboardType="decimal-pad" />
  );
  return (
    <View>
      <View style={styles.cells}>
        {unit('FC', 'fc', 'lpm', '100')}
        {unit('FR', 'fr', 'rpm', '30')}
        {unit('T°', 'temp', '°C', '38,5')}
        {unit('TLLC', 'tllc', 's', '2')}
      </View>
      <Pick label="Estado" options={ESTADO} value={exam.estado} onChange={(v) => set('estado', v)} />
      <Pick label="Condición corporal (1–9)" options={BCS} value={exam.bcs} onChange={(v) => set('bcs', v)} />
      <Pick label="Miedo, ansiedad y estrés (0–5)" options={ESTRES} value={exam.estres} onChange={(v) => set('estres', v)} />
      <Pick label="Pelaje" options={PELAJE} value={exam.pelaje} onChange={(v) => set('pelaje', v)} />
      <Pick label="Mucosas" options={MUCOSAS} value={exam.mucosas} onChange={(v) => set('mucosas', v)} />
      <Pick label="Pliegue cutáneo" options={PLIEGUE} value={exam.pliegue} onChange={(v) => set('pliegue', v)} />
      <Pick label="Grado de deshidratación" options={DESHID} value={exam.deshidratacion} onChange={(v) => set('deshidratacion', v)} />
      {(Object.keys(NODE_LABEL) as NodeKey[]).map((k) => (
        <Pick key={k} label={`Linfonodos ${NODE_LABEL[k].toLowerCase()}`} options={NODE_OPTIONS} value={exam.nodes[k]}
          onChange={(v) => onChange({ ...exam, nodes: { ...exam.nodes, [k]: v } })} />
      ))}
      <VInput label="Postura" value={exam.postura} onChangeText={(v) => set('postura', v)} />
      <VInput label="Cavidad oral y ojos" value={exam.oral} onChangeText={(v) => set('oral', v)} />
      <VInput label="Auscultación cardiopulmonar" value={exam.ausc} onChangeText={(v) => set('ausc', v)} />
      <VInput label="Palpación abdominal" value={exam.abdomen} onChangeText={(v) => set('abdomen', v)} />
    </View>
  );
}

export function NextAnamnesis({ exam, onChange }: Props) {
  const n = exam.next;
  const set = <K extends keyof ExamForm['next']>(k: K, v: ExamForm['next'][K]) => onChange({ ...exam, next: { ...n, [k]: v } });
  const short = (label: string, k: 'vomito' | 'diarrea' | 'heces' | 'orina' | 'tos') => (
    <VInput containerStyle={styles.half} label={label} value={n[k]} onChangeText={(v) => set(k, v)} />
  );
  return (
    <View>
      <VInput label="Evolución" value={n.evolucion} onChangeText={(v) => set('evolucion', v)} placeholder="Hace cuánto comenzaron los primeros síntomas" />
      <Pick label="Estado de ánimo" options={ANIMO} value={n.animo} onChange={(v) => set('animo', v)} />
      <Pick label="Apetito" options={APETITO} value={n.apetito} onChange={(v) => set('apetito', v)} />
      <Pick label="Consumo de agua" options={AGUA} value={n.agua} onChange={(v) => set('agua', v)} />
      <View style={styles.cells}>
        {short('Vómito o regurgitación', 'vomito')}
        {short('Diarrea', 'diarrea')}
        {short('Características de las heces', 'heces')}
        {short('Orina', 'orina')}
        {short('Tos o estornudos', 'tos')}
      </View>
      <VInput label="Fármacos recibidos" value={n.farmacos} onChangeText={(v) => set('farmacos', v)} placeholder="Qué se le ha dado y desde cuándo" />
    </View>
  );
}

const styles = StyleSheet.create({
  cells: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginBottom: SPACING.sm },
  cell: { flexGrow: 1, flexBasis: 120, minWidth: 110 },
  half: { flexGrow: 1, flexBasis: 200 },
  group: { marginBottom: SPACING.md },
  groupLabel: { fontSize: TYPOGRAPHY.sizes.sm, marginBottom: SPACING.xs },
});
