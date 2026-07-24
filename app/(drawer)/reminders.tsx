import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, TextInput as RNTextInput } from 'react-native';
import { Text, Modal, Portal } from 'react-native-paper';
import { Bell, BellOff, Syringe, Bug, CalendarClock, BriefcaseMedical, ClipboardCheck, Plus, Wand2, Send, Check, X, Trash2, Dog, Cat, CheckCircle, AlertTriangle } from 'lucide-react-native';
import { useReminders } from '../../hooks/useDirectus';
import { useTheme } from '../../contexts/ThemeContext';
import { usePets } from '../../hooks/useDirectus';
import { Reminder } from '../../services/directus';
import { SPACING, RADIUS, SHADOWS } from '../../constants/tokens';
import VCard from '../../components/ui/Card';
import VButton from '../../components/ui/Button';
import VBadge from '../../components/ui/Badge';
import VEmptyState from '../../components/ui/EmptyState';

const TYPE_ICONS: Record<string, typeof Syringe> = { vacuna: Syringe, desparasitacion: Bug, cita: CalendarClock, post_operatorio: BriefcaseMedical, control: ClipboardCheck };

export default function RemindersScreen() {
  const { colors } = useTheme();
  const { reminders, loading, addReminder, autoGenerate, updateReminder, removeReminder, sendPending, refresh } = useReminders();
  const { pets } = usePets();
  const [filter, setFilter] = useState<'all' | 'pending' | 'sent' | 'cancelled'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [errorDialog, setErrorDialog] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formPetId, setFormPetId] = useState('');
  const [formType, setFormType] = useState<Reminder['reminder_type']>('cita');
  const [formTitle, setFormTitle] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 16));

  const filtered = useMemo(() => {
    if (filter === 'all') return reminders;
    return reminders.filter(r => r.status === filter);
  }, [reminders, filter]);

  const pendingCount = reminders.filter(r => r.status === 'pending').length;

  const handleCreate = async () => {
    if (!formPetId || !formTitle.trim() || !formMessage.trim()) { setErrorDialog('Complete todos los campos obligatorios'); return; }
    const pet = pets.find(p => p.id === formPetId);
    if (!pet?.email) { setErrorDialog('El tutor no tiene email registrado'); return; }
    setSaving(true);
    try {
      await addReminder({ pet_id: formPetId, tutor_email: pet.email, reminder_type: formType, title: formTitle.trim(), message: formMessage.trim(), scheduled_for: new Date(formDate).toISOString() });
      setShowCreateModal(false); setFormPetId(''); setFormTitle(''); setFormMessage(''); setFormDate(new Date().toISOString().slice(0, 16));
    } catch { setErrorDialog('No se pudo crear el recordatorio'); } finally { setSaving(false); }
  };

  const handleAutoGenerate = async () => {
    if (!selectedPetId) return;
    setSaving(true);
    try {
      const result = await autoGenerate(selectedPetId);
      const count = Array.isArray(result) ? result.length : 0;
      setShowAutoModal(false);
      if (count === 0) setErrorDialog('No se encontraron vacunas pendientes de refuerzo');
    } catch (err: any) { setErrorDialog(err.message || 'No se pudieron generar recordatorios'); } finally { setSaving(false); }
  };

  const handleSendPending = async () => {
    setSaving(true);
    try { const result = await sendPending(); const sent = (result as any)?.sent || 0; if (sent === 0) setErrorDialog('No hay recordatorios pendientes para enviar'); } catch { setErrorDialog('No se pudieron enviar los recordatorios'); } finally { setSaving(false); }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.actions}>
        <VButton variant="primary" onPress={() => setShowCreateModal(true)} icon={<Plus size={16} color="#fff" />}>Nuevo</VButton>
        <VButton variant="accent" onPress={() => setShowAutoModal(true)} icon={<Wand2 size={16} />}>Auto</VButton>
        <VButton variant="secondary" onPress={handleSendPending} icon={<Send size={16} />} loading={saving}>Enviar</VButton>
      </View>

      <View style={styles.filters}>
        {(['all', 'pending', 'sent', 'cancelled'] as const).map((f) => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.filterChip, { backgroundColor: colors.surface, borderColor: colors.border }, filter === f && { backgroundColor: colors.primaryContainer, borderColor: colors.primary }]}>
            <Text style={{ color: filter === f ? colors.primary : colors.textSecondary, fontSize: 13 }}>
              {f === 'all' ? 'Todos' : f === 'pending' ? `Pendientes (${pendingCount})` : f === 'sent' ? 'Enviados' : 'Cancelados'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Cargando...</Text>
      ) : filtered.length === 0 ? (
        <VEmptyState icon={<BellOff size={32} color={colors.textLight} />} title="No hay recordatorios" description="Crea recordatorios para tus pacientes" />
      ) : (
        filtered.map((reminder) => {
          const TypeIcon = TYPE_ICONS[reminder.reminder_type] || Bell;
          return (
            <VCard key={reminder.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.typeIcon, { backgroundColor: colors.primaryContainer }]}>
                  <TypeIcon size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{reminder.title}</Text>
                  <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                    {reminder.pet_name} — {reminder.species === 'dog' ? 'Canino' : 'Felino'}
                  </Text>
                </View>
                <VBadge variant={reminder.status === 'pending' ? 'warning' : reminder.status === 'sent' ? 'success' : 'danger'}>
                  {reminder.status === 'pending' ? 'Pendiente' : reminder.status === 'sent' ? 'Enviado' : 'Cancelado'}
                </VBadge>
              </View>
              <Text style={[styles.cardMessage, { color: colors.textSecondary }]} numberOfLines={2}>{reminder.message}</Text>
              <View style={styles.cardFooter}>
                <Text style={[styles.cardDate, { color: colors.textSecondary }]}>
                  {new Date(reminder.scheduled_for).toLocaleDateString('es-CL')}
                </Text>
                <View style={styles.cardActions}>
                  {reminder.status === 'pending' && (
                    <>
                      <TouchableOpacity onPress={() => updateReminder(reminder.id, { status: 'sent' })}><Check size={16} color={colors.success} /></TouchableOpacity>
                      <TouchableOpacity onPress={() => updateReminder(reminder.id, { status: 'cancelled' })}><X size={16} color={colors.warning} /></TouchableOpacity>
                    </>
                  )}
                  <TouchableOpacity onPress={() => removeReminder(reminder.id)}><Trash2 size={16} color={colors.error} /></TouchableOpacity>
                </View>
              </View>
            </VCard>
          );
        })
      )}

      <Portal>
        <Modal visible={showCreateModal} onDismiss={() => setShowCreateModal(false)} contentContainerStyle={[styles.modal, { backgroundColor: colors.surface }]}>
          <ScrollView>
            <Text variant="titleMedium" style={[styles.modalTitle, { color: colors.text }]}>Nuevo Recordatorio</Text>
            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Mascota *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petSelector}>
              {pets.map((pet) => (
                <TouchableOpacity key={pet.id} onPress={() => setFormPetId(pet.id)} style={[styles.petChip, { backgroundColor: colors.surface, borderColor: colors.border }, formPetId === pet.id && { backgroundColor: colors.primaryContainer, borderColor: colors.primary }]}>
                  {pet.species === 'dog' ? <Dog size={14} color={colors.primary} /> : <Cat size={14} color={colors.primary} />}
                  <Text style={{ color: formPetId === pet.id ? colors.primary : colors.text, fontSize: 13 }}>{pet.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Tipo</Text>
            <View style={styles.typeRow}>
              {(['vacuna', 'desparasitacion', 'cita', 'post_operatorio', 'control'] as const).map((t) => (
                <TouchableOpacity key={t} onPress={() => setFormType(t)} style={[styles.typeBtn, { backgroundColor: colors.surface, borderColor: colors.border }, formType === t && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                  <Text style={{ color: formType === t ? '#fff' : colors.text, fontSize: 12 }}>{t.replace('_', ' ')}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Título *</Text>
            <RNTextInput style={[styles.input, { borderColor: colors.border, color: colors.text }]} value={formTitle} onChangeText={setFormTitle} placeholder="Título" placeholderTextColor={colors.textLight} />
            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Mensaje *</Text>
            <RNTextInput style={[styles.input, { borderColor: colors.border, color: colors.text, minHeight: 80, textAlignVertical: 'top' }]} value={formMessage} onChangeText={setFormMessage} multiline numberOfLines={3} placeholder="Mensaje" placeholderTextColor={colors.textLight} />
            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Fecha</Text>
            <RNTextInput style={[styles.input, { borderColor: colors.border, color: colors.text }]} value={formDate} onChangeText={setFormDate} placeholder="AAAA-MM-DD HH:MM" placeholderTextColor={colors.textLight} />
            <VButton variant="primary" fullWidth onPress={handleCreate} loading={saving} disabled={saving}>Guardar</VButton>
          </ScrollView>
        </Modal>
      </Portal>

      <Portal>
        <Modal visible={showAutoModal} onDismiss={() => setShowAutoModal(false)} contentContainerStyle={[styles.modal, { backgroundColor: colors.surface }]}>
          <Text variant="titleMedium" style={[styles.modalTitle, { color: colors.text }]}>Auto-generar Recordatorios</Text>
          <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>Selecciona una mascota para generar recordatorios de refuerzo de vacunas.</Text>
          <View style={styles.petList}>
            {pets.filter(p => (p as any).receive_reminders !== false && p.email).map((pet) => (
              <TouchableOpacity key={pet.id} onPress={() => setSelectedPetId(pet.id)} style={[styles.petCard, { backgroundColor: colors.background, borderColor: selectedPetId === pet.id ? colors.primary : colors.border }]}>
                {pet.species === 'dog' ? <Dog size={24} color={colors.primary} /> : <Cat size={24} color={colors.primary} />}
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: '600' }}>{pet.name}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{pet.breed || 'N/D'} — {pet.email}</Text>
                </View>
                {selectedPetId === pet.id && <CheckCircle size={20} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
          <VButton variant="primary" fullWidth onPress={handleAutoGenerate} loading={saving} disabled={!selectedPetId || saving}>Generar</VButton>
        </Modal>
      </Portal>

      <Portal>
        <Modal visible={!!errorDialog} onDismiss={() => setErrorDialog(null)} contentContainerStyle={[styles.modal, { backgroundColor: colors.surface }]}>
          <AlertTriangle size={32} color={colors.warning} style={{ alignSelf: 'center', marginBottom: 8 }} />
          <Text variant="titleMedium" style={{ textAlign: 'center', color: colors.text }}>Alerta</Text>
          <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 4 }}>{errorDialog}</Text>
          <VButton variant="primary" fullWidth onPress={() => setErrorDialog(null)} style={{ marginTop: 16 }}>OK</VButton>
        </Modal>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: SPACING.lg },
  actions: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: SPACING.lg },
  filterChip: { paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1 },
  loadingText: { textAlign: 'center', marginTop: 40 },
  card: { marginBottom: SPACING.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.sm },
  typeIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardSubtitle: { fontSize: 12, marginTop: 2 },
  cardMessage: { fontSize: 13, lineHeight: 18, marginBottom: SPACING.sm },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDate: { fontSize: 12 },
  cardActions: { flexDirection: 'row', gap: SPACING.md },
  modal: { margin: 20, padding: 20, borderRadius: RADIUS.lg, maxHeight: '85%' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: SPACING.lg },
  modalDesc: { fontSize: 13, marginBottom: SPACING.lg, lineHeight: 18 },
  modalLabel: { fontSize: 13, fontWeight: '600', marginBottom: SPACING.xs, marginTop: SPACING.sm },
  petSelector: { marginBottom: SPACING.sm },
  petChip: { flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 6, paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: SPACING.sm },
  typeBtn: { paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1 },
  input: { borderWidth: 1, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, fontSize: 14 },
  petList: { gap: 8, marginBottom: SPACING.lg },
  petCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1 },
});
