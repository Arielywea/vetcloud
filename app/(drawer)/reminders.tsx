import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, Button, Chip, Portal, Modal, TextInput, Dialog } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useReminders } from '../../hooks/useDirectus';
import { useTheme } from '../../contexts/ThemeContext';
import { usePets } from '../../hooks/useDirectus';
import { Reminder } from '../../services/directus';

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vacuna': return 'needle';
      case 'desparasitacion': return 'bug';
      case 'cita': return 'calendar-clock';
      case 'post_operatorio': return 'medical-bag';
      case 'control': return 'clipboard-check';
      default: return 'bell';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vacuna': return '#4CAF50';
      case 'desparasitacion': return '#FF9800';
      case 'cita': return '#2196F3';
      case 'post_operatorio': return '#F44336';
      case 'control': return '#9C27B0';
      default: return '#FF8F00';
    }
  };

  const handleCreate = async () => {
    if (!formPetId || !formTitle.trim() || !formMessage.trim()) {
      setErrorDialog('Complete todos los campos obligatorios');
      return;
    }
    const pet = pets.find(p => p.id === formPetId);
    if (!pet?.email) {
      setErrorDialog('El tutor no tiene email registrado');
      return;
    }
    setSaving(true);
    try {
      await addReminder({
        pet_id: formPetId,
        tutor_email: pet.email,
        reminder_type: formType,
        title: formTitle.trim(),
        message: formMessage.trim(),
        scheduled_for: new Date(formDate).toISOString(),
      });
      setShowCreateModal(false);
      setFormPetId('');
      setFormTitle('');
      setFormMessage('');
      setFormDate(new Date().toISOString().slice(0, 16));
    } catch (err) {
      setErrorDialog('No se pudo crear el recordatorio');
    } finally {
      setSaving(false);
    }
  };

  const handleAutoGenerate = async () => {
    if (!selectedPetId) return;
    setSaving(true);
    try {
      const result = await autoGenerate(selectedPetId);
      const count = Array.isArray(result) ? result.length : 0;
      setShowAutoModal(false);
      if (count === 0) {
        setErrorDialog('No se encontraron vacunas pendientes de refuerzo');
      }
    } catch (err: any) {
      setErrorDialog(err.message || 'No se pudieron generar recordatorios');
    } finally {
      setSaving(false);
    }
  };

  const handleSendPending = async () => {
    setSaving(true);
    try {
      const result = await sendPending();
      const sent = (result as any)?.sent || 0;
      if (sent === 0) {
        setErrorDialog('No hay recordatorios pendientes para enviar');
      }
    } catch (err) {
      setErrorDialog('No se pudieron enviar los recordatorios');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header actions */}
      <View style={styles.actions}>
        <Button mode="contained" onPress={() => setShowCreateModal(true)} icon="plus" style={styles.actionBtn}>
          Nuevo
        </Button>
        <Button mode="outlined" onPress={() => setShowAutoModal(true)} icon="auto-fix" style={styles.actionBtn}>
          Auto
        </Button>
        <Button mode="outlined" onPress={handleSendPending} icon="send" style={styles.actionBtn} loading={saving}>
          Enviar pendientes
        </Button>
      </View>

      {/* Filter chips */}
      <View style={styles.filters}>
        {(['all', 'pending', 'sent', 'cancelled'] as const).map((f) => (
          <Chip
            key={f}
            selected={filter === f}
            onPress={() => setFilter(f)}
            style={[styles.filterChip, filter === f && { backgroundColor: colors.primary + '20' }]}
            textStyle={filter === f ? { color: colors.primary } : {}}
            compact
          >
            {f === 'all' ? 'Todos' : f === 'pending' ? `Pendientes (${pendingCount})` : f === 'sent' ? 'Enviados' : 'Cancelados'}
          </Chip>
        ))}
      </View>

      {/* Reminders list */}
      {loading ? (
        <Text style={styles.loadingText}>Cargando...</Text>
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="bell-off" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No hay recordatorios</Text>
        </View>
      ) : (
        filtered.map((reminder) => (
          <Card key={reminder.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <View style={[styles.typeIcon, { backgroundColor: getTypeColor(reminder.reminder_type) + '20' }]}>
                  <MaterialCommunityIcons name={getTypeIcon(reminder.reminder_type) as any} size={20} color={getTypeColor(reminder.reminder_type)} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{reminder.title}</Text>
                  <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                    {reminder.pet_name} — {reminder.species === 'dog' ? 'Canino' : 'Felino'}
                  </Text>
                </View>
                <Chip
                  compact
                  style={[styles.statusChip, {
                    backgroundColor: reminder.status === 'pending' ? '#FFF3E0' : reminder.status === 'sent' ? '#E8F5E9' : '#FFEBEE',
                  }]}
                  textStyle={{
                    color: reminder.status === 'pending' ? '#E65100' : reminder.status === 'sent' ? '#2E7D32' : '#C62828',
                    fontSize: 11,
                  }}
                >
                  {reminder.status === 'pending' ? 'Pendiente' : reminder.status === 'sent' ? 'Enviado' : 'Cancelado'}
                </Chip>
              </View>
              <Text style={[styles.cardMessage, { color: colors.textSecondary }]} numberOfLines={2}>
                {reminder.message}
              </Text>
              <View style={styles.cardFooter}>
                <Text style={[styles.cardDate, { color: colors.textSecondary }]}>
                  📅 {new Date(reminder.scheduled_for).toLocaleDateString('es-CL')}
                </Text>
                <View style={styles.cardActions}>
                  {reminder.status === 'pending' && (
                    <>
                      <Button compact mode="text" onPress={() => updateReminder(reminder.id, { status: 'sent' })} icon="check" style={styles.miniBtn}>
                        Enviar
                      </Button>
                      <Button compact mode="text" onPress={() => updateReminder(reminder.id, { status: 'cancelled' })} icon="close" style={styles.miniBtn}>
                        Cancelar
                      </Button>
                    </>
                  )}
                  <Button compact mode="text" onPress={() => removeReminder(reminder.id)} icon="delete" style={styles.miniBtn}>
                    <Text style={{ color: '#F44336' }}>Eliminar</Text>
                  </Button>
                </View>
              </View>
            </Card.Content>
          </Card>
        ))
      )}

      {/* Create modal */}
      <Portal>
        <Modal visible={showCreateModal} onDismiss={() => setShowCreateModal(false)} contentContainerStyle={[styles.modal, { backgroundColor: colors.surface }]}>
          <ScrollView>
            <Text variant="titleMedium" style={[styles.modalTitle, { color: colors.text }]}>Nuevo Recordatorio</Text>
            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Mascota *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petSelector}>
              {pets.map((pet) => (
                <Chip
                  key={pet.id}
                  selected={formPetId === pet.id}
                  onPress={() => setFormPetId(pet.id)}
                  style={[styles.petChip, formPetId === pet.id && { backgroundColor: colors.primary + '20' }]}
                  icon={pet.species === 'dog' ? 'dog' : 'cat'}
                >
                  {pet.name}
                </Chip>
              ))}
            </ScrollView>
            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Tipo</Text>
            <View style={styles.typeRow}>
              {(['vacuna', 'desparasitacion', 'cita', 'post_operatorio', 'control'] as const).map((t) => (
                <Button key={t} mode={formType === t ? 'contained' : 'outlined'} compact onPress={() => setFormType(t)} style={styles.typeBtn}>
                  {t.replace('_', ' ')}
                </Button>
              ))}
            </View>
            <TextInput label="Título *" value={formTitle} onChangeText={setFormTitle} mode="outlined" style={styles.input} />
            <TextInput label="Mensaje *" value={formMessage} onChangeText={setFormMessage} mode="outlined" multiline numberOfLines={3} style={styles.input} />
            <TextInput label="Fecha" value={formDate} onChangeText={setFormDate} mode="outlined" style={styles.input} />
            <Button mode="contained" onPress={handleCreate} style={styles.saveButton} loading={saving} disabled={saving}>
              Guardar
            </Button>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Auto-generate modal */}
      <Portal>
        <Modal visible={showAutoModal} onDismiss={() => setShowAutoModal(false)} contentContainerStyle={[styles.modal, { backgroundColor: colors.surface }]}>
          <Text variant="titleMedium" style={[styles.modalTitle, { color: colors.text }]}>Auto-generar Recordatorios</Text>
          <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>
            Selecciona una mascota para generar recordatorios de refuerzo de vacunas basados en su historial clínico.
          </Text>
          <View style={styles.petList}>
            {pets.filter(p => (p as any).receive_reminders !== false && p.email).map((pet) => (
              <Card key={pet.id} style={[styles.petCard, { backgroundColor: colors.background, borderColor: selectedPetId === pet.id ? colors.primary : colors.border }]}
                onPress={() => setSelectedPetId(pet.id)}>
                <Card.Content style={styles.petCardContent}>
                  <MaterialCommunityIcons name={pet.species === 'dog' ? 'dog' : 'cat'} size={24} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontWeight: '600' }}>{pet.name}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{pet.breed || 'N/D'} — {pet.email}</Text>
                  </View>
                  {selectedPetId === pet.id && <MaterialCommunityIcons name="check-circle" size={20} color={colors.primary} />}
                </Card.Content>
              </Card>
            ))}
          </View>
          <Button mode="contained" onPress={handleAutoGenerate} style={styles.saveButton} loading={saving} disabled={!selectedPetId || saving}>
            Generar
          </Button>
        </Modal>
      </Portal>

      {/* Error dialog */}
      <Portal>
        <Dialog visible={!!errorDialog} onDismiss={() => setErrorDialog(null)}>
          <Dialog.Title>Alerta</Dialog.Title>
          <Dialog.Content><Text>{errorDialog}</Text></Dialog.Content>
          <Dialog.Actions><Button onPress={() => setErrorDialog(null)}>OK</Button></Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  actions: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  actionBtn: { flex: 1 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  filterChip: { marginBottom: 4 },
  loadingText: { textAlign: 'center', color: '#999', marginTop: 40 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#999', marginTop: 12, fontSize: 15 },
  card: { marginBottom: 12, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  typeIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardSubtitle: { fontSize: 12, marginTop: 2 },
  statusChip: { height: 26 },
  cardMessage: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDate: { fontSize: 12 },
  cardActions: { flexDirection: 'row' },
  miniBtn: { marginHorizontal: -4 },
  modal: { margin: 20, padding: 20, borderRadius: 16, maxHeight: '85%' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  modalDesc: { fontSize: 13, marginBottom: 16, lineHeight: 18 },
  modalLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 8 },
  petSelector: { marginBottom: 8 },
  petChip: { marginRight: 6 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  typeBtn: { marginBottom: 4 },
  input: { marginBottom: 12 },
  saveButton: { marginTop: 8 },
  petList: { gap: 8, marginBottom: 16 },
  petCard: { borderWidth: 1 },
  petCardContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
