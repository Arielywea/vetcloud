import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { DollarSign, CreditCard, X, Banknote, ArrowRightLeft, Smartphone } from 'lucide-react-native';
import { directus } from '../../services/directus';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';
import VInput from '../../components/ui/Input';
import VButton from '../../components/ui/Button';

interface PaymentFormProps {
  visible: boolean;
  onClose: () => void;
  onPaid?: () => void;
  appointmentId?: string;
  petId?: string;
  suggestedAmount?: number;
}

const METHODS = [
  { key: 'efectivo', label: 'Efectivo', icon: Banknote },
  { key: 'debito', label: 'Debito', icon: CreditCard },
  { key: 'credito', label: 'Credito', icon: CreditCard },
  { key: 'transferencia', label: 'Transferencia', icon: ArrowRightLeft },
  { key: 'otro', label: 'Otro', icon: Smartphone },
];

export default function PaymentForm({ visible, onClose, onPaid, appointmentId, petId, suggestedAmount }: PaymentFormProps) {
  const { colors } = useTheme();
  const [amount, setAmount] = useState(suggestedAmount?.toString() || '');
  const [method, setMethod] = useState('efectivo');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!amount || isNaN(parseFloat(amount))) return;
    setSaving(true);
    try {
      await directus.payments.create({
        appointment_id: appointmentId || undefined,
        pet_id: petId || undefined,
        amount: parseFloat(amount),
        method,
        description: description || undefined,
      });
      onPaid?.();
      onClose();
      setAmount(''); setMethod('efectivo'); setDescription('');
    } catch { /* */ }
    setSaving(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>Registrar cobro</Text>
            <TouchableOpacity onPress={onClose}><X size={20} color={colors.textSecondary} /></TouchableOpacity>
          </View>

          <VInput label="Monto ($)" placeholder="0" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" leftIcon={<DollarSign size={18} color={colors.primary} />} />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Metodo de pago</Text>
          <View style={styles.methodRow}>
            {METHODS.map((m) => (
              <TouchableOpacity
                key={m.key}
                style={[styles.methodBtn, { borderColor: method === m.key ? colors.primary : colors.border, backgroundColor: method === m.key ? colors.primaryContainer : 'transparent' }]}
                onPress={() => setMethod(m.key)}
              >
                <m.icon size={16} color={method === m.key ? colors.primary : colors.textSecondary} />
                <Text style={[styles.methodLabel, { color: method === m.key ? colors.primary : colors.textSecondary }]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <VInput label="Descripcion (opcional)" placeholder="Consulta, vacuna, etc." value={description} onChangeText={setDescription} />

          <View style={styles.actions}>
            <VButton onPress={onClose} variant="outlined" style={{ flex: 1 }}>Cancelar</VButton>
            <VButton onPress={handleSave} loading={saving} disabled={saving} style={{ flex: 1 }}>Cobrar</VButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: RADIUS['2xl'], borderTopRightRadius: RADIUS['2xl'], padding: SPACING.xl, paddingBottom: 40 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  sheetTitle: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.bold },
  label: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold, marginTop: SPACING.md, marginBottom: SPACING.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  methodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  methodBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, borderWidth: 1.5 },
  methodLabel: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold },
  actions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xl },
});
