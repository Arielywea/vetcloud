import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, TextInput, SegmentedButtons } from 'react-native-paper';
import { AlertTriangle, CheckCircle, Calculator } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';

type Species = 'perro' | 'gato';
type Size = 'pequeño' | 'mediano' | 'grande';
type Losses = 'ninguna' | 'vomitos' | 'diarrea' | 'ambas';
type Infusion = 'microgota' | 'macrogota';

interface FluidResult {
  mantencion: number;
  deshidratacion: number;
  perdidas: number;
  total: number;
  mlHora: number;
  mlSegundo: number;
  gotasSegundo: number;
  gotasCadaSegundos: number | null;
  alertaSobrehidratacion: boolean;
}

const FLUID_RATES: Record<Species, Record<Size, number>> = {
  perro: { pequeño: 60, mediano: 50, grande: 40 },
  gato: { pequeño: 60, mediano: 60, grande: 60 },
};

const LOSS_RATES: Record<Losses, number> = {
  ninguna: 0,
  vomitos: 20,
  diarrea: 30,
  ambas: 40,
};

const INFUSION_DROPS: Record<Infusion, number> = {
  microgota: 60,
  macrogota: 20,
};

export default function FluidTherapyCalculator({ initialWeight, initialSpecies }: { initialWeight?: number; initialSpecies?: Species }) {
  const { colors } = useTheme();
  const [peso, setPeso] = useState(initialWeight?.toString() || '');
  const [especie, setEspecie] = useState<Species>(initialSpecies || 'perro');
  const [tamano, setTamano] = useState<Size>('mediano');
  const [deshidratacion, setDeshidratacion] = useState('');
  const [perdidas, setPerdidas] = useState<Losses>('ninguna');
  const [infusion, setInfusion] = useState<Infusion>('microgota');

  const result = useMemo<FluidResult | null>(() => {
    const pesoNum = parseFloat(peso);
    const dhNum = parseFloat(deshidratacion) || 0;
    if (isNaN(pesoNum) || pesoNum <= 0) return null;

    const mantencion = FLUID_RATES[especie][tamano] * pesoNum;
    const dhVolumen = (dhNum / 100) * pesoNum * 1000;
    const perdidasVolumen = LOSS_RATES[perdidas] * pesoNum;
    const total = mantencion + dhVolumen + perdidasVolumen;
    const mlHora = total / 24;
    const mlSegundo = mlHora / 3600;
    const dropsPerMl = INFUSION_DROPS[infusion];
    const gotasSegundo = mlSegundo * dropsPerMl;

    let gotasCadaSegundos: number | null = null;
    if (gotasSegundo < 1 && gotasSegundo > 0) {
      gotasCadaSegundos = Math.round(1 / gotasSegundo);
    }

    const alertaSobrehidratacion = mlHora / pesoNum > 10;

    return { mantencion, deshidratacion: dhVolumen, perdidas: perdidasVolumen, total, mlHora, mlSegundo, gotasSegundo, gotasCadaSegundos, alertaSobrehidratacion };
  }, [peso, especie, tamano, deshidratacion, perdidas, infusion]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>Calculadora de Fluidoterapia</Text>

      {/* Inputs */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Peso (kg)</Text>
        <TextInput
          value={peso}
          onChangeText={setPeso}
          keyboardType="numeric"
          mode="outlined"
          placeholder="Ej: 5"
          style={styles.input}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Especie</Text>
        <SegmentedButtons
          value={especie}
          onValueChange={(v) => setEspecie(v as Species)}
          buttons={[
            { value: 'perro', label: 'Perro' },
            { value: 'gato', label: 'Gato' },
          ]}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Tamaño</Text>
        <SegmentedButtons
          value={tamano}
          onValueChange={(v) => setTamano(v as Size)}
          buttons={[
            { value: 'pequeño', label: 'Pequeño' },
            { value: 'mediano', label: 'Mediano' },
            { value: 'grande', label: 'Grande' },
          ]}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>% Deshidratación</Text>
        <TextInput
          value={deshidratacion}
          onChangeText={setDeshidratacion}
          keyboardType="numeric"
          mode="outlined"
          placeholder="Ej: 5"
          style={styles.input}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Pérdidas</Text>
        <SegmentedButtons
          value={perdidas}
          onValueChange={(v) => setPerdidas(v as Losses)}
          buttons={[
            { value: 'ninguna', label: 'Ninguna' },
            { value: 'vomitos', label: 'Vómitos' },
            { value: 'diarrea', label: 'Diarrea' },
            { value: 'ambas', label: 'Ambas' },
          ]}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Sistema de infusión</Text>
        <SegmentedButtons
          value={infusion}
          onValueChange={(v) => setInfusion(v as Infusion)}
          buttons={[
            { value: 'microgota', label: 'Microgota (60)' },
            { value: 'macrogota', label: 'Macrogota (20)' },
          ]}
        />
      </View>

      {/* Resultados */}
      {result && (
        <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.resultHeader}>
            <Calculator size={20} color={colors.primary} />
            <Text style={[styles.resultTitle, { color: colors.text }]}>Resultado</Text>
          </View>

          {result.alertaSobrehidratacion && (
            <View style={[styles.alertCard, { backgroundColor: '#FF980015', borderColor: '#FF980040' }]}>
              <AlertTriangle size={16} color="#FF9800" />
              <Text style={[styles.alertText, { color: '#E65100' }]}>Posible sobrehidratación: &gt;10 ml/kg/hora</Text>
            </View>
          )}

          <View style={styles.resultRow}>
            <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Mantención</Text>
            <Text style={[styles.resultValue, { color: colors.text }]}>{result.mantencion.toFixed(0)} ml/día</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Deshidratación</Text>
            <Text style={[styles.resultValue, { color: colors.text }]}>{result.deshidratacion.toFixed(0)} ml/día</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Pérdidas</Text>
            <Text style={[styles.resultValue, { color: colors.text }]}>{result.perdidas.toFixed(0)} ml/día</Text>
          </View>

          <View style={[styles.resultRow, styles.totalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.resultLabel, { color: colors.text, fontWeight: 'bold' }]}>Total</Text>
            <Text style={[styles.resultValue, { color: colors.primary, fontWeight: 'bold' }]}>{result.total.toFixed(0)} ml/día</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Por hora</Text>
            <Text style={[styles.resultValue, { color: colors.text }]}>{result.mlHora.toFixed(1)} ml/h</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Gotas/segundo</Text>
            <Text style={[styles.resultValue, { color: colors.text }]}>
              {result.gotasCadaSegundos
                ? `1 gota cada ${result.gotasCadaSegundos} seg`
                : `${result.gotasSegundo.toFixed(2)} gotas/seg`}
            </Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Sistema</Text>
            <Text style={[styles.resultValue, { color: colors.text }]}>
              {infusion === 'microgota' ? 'Microgota (60 gotas/ml)' : 'Macrogota (20 gotas/ml)'}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.xl,
    paddingBottom: SPACING.xl * 2,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.xl,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: 'transparent',
  },
  resultCard: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  resultTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  alertText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  totalRow: {
    borderTopWidth: 1,
    marginTop: SPACING.sm,
    paddingTop: SPACING.md,
  },
  resultLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  resultValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
