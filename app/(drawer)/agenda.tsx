import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, TextInput as RNTextInput, TouchableOpacity, Platform } from 'react-native';
import { Text, Modal, Portal, Menu } from 'react-native-paper';
import { Calendar, DateData } from 'react-native-calendars';
import { CalendarBlank, Stethoscope, Syringe, Scissors, ClipboardCheck, Tractor, Phone, Trash2, Plus, AlertTriangle, X, CalendarX } from 'lucide-react-native';
import { useAppointments } from '../../hooks/useDirectus';
import { Appointment } from '../../services/directus';
import { useTheme } from '../../contexts/ThemeContext';
import { APPOINTMENT_TYPE_COLORS } from '../../constants/colors';
import { SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/tokens';
import VCard from '../../components/ui/Card';
import VButton from '../../components/ui/Button';
import VEmptyState from '../../components/ui/EmptyState';
import AnimatedIcon from '../../components/icons/AnimatedIcon';

const TYPE_CONFIG: Record<string, { icon: typeof Stethoscope; color: string }> = {
  consulta: { icon: Stethoscope, color: APPOINTMENT_TYPE_COLORS.consulta },
  vacuna: { icon: Syringe, color: APPOINTMENT_TYPE_COLORS.vacuna },
  cirugia: { icon: Scissors, color: APPOINTMENT_TYPE_COLORS.cirugia },
  control: { icon: ClipboardCheck, color: APPOINTMENT_TYPE_COLORS.control },
  terreno: { icon: Tractor, color: APPOINTMENT_TYPE_COLORS.terreno },
};

function formatTime(dateStr: string): string {
  try { return new Date(dateStr).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
}

export default function AgendaScreen() {
  const today = new Date().toISOString().slice(0, 10);
  const { colors } = useTheme();
  const [selectedDate, setSelectedDate] = useState(today);
  const [showModal, setShowModal] = useState(false);
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);

  const [apptName, setApptName] = useState('');
  const [apptPhone, setApptPhone] = useState('');
  const [apptType, setApptType] = useState<Appointment['appointment_type']>('consulta');
  const [apptDate, setApptDate] = useState(today);
  const [apptTime, setApptTime] = useState('09:00');
  const [apptDescription, setApptDescription] = useState('');

  const { appointments, loading, addAppointment, removeAppointment } = useAppointments();
  const [errorDialog, setErrorDialog] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ name: string; id: string } | null>(null);

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    appointments.forEach((appt) => {
      const dateKey = appt.start_time.slice(0, 10);
      const config = TYPE_CONFIG[appt.appointment_type] || TYPE_CONFIG.consulta;
      if (!marks[dateKey]) marks[dateKey] = { dots: [] };
      marks[dateKey].dots.push({ color: config.color });
    });
    marks[selectedDate] = { ...(marks[selectedDate] || {}), selected: true, selectedColor: colors.primary };
    return marks;
  }, [appointments, selectedDate, colors.primary]);

  const dayAppointments = useMemo(() => {
    return appointments
      .filter((a) => a.start_time.slice(0, 10) === selectedDate)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }, [appointments, selectedDate]);

  const handleSave = async () => {
    if (!apptName.trim()) { setErrorDialog('El nombre del paciente es obligatorio'); return; }
    try {
      await addAppointment({
        patient_name: apptName.trim(), tutor_phone: apptPhone.trim() || null,
        start_time: new Date(`${apptDate}T${apptTime}`).toISOString(), end_time: null,
        appointment_type: apptType, description: apptDescription.trim() || null,
      });
      setApptName(''); setApptPhone(''); setApptDescription(''); setShowModal(false);
    } catch { setErrorDialog('No se pudo guardar la cita'); }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Calendar
        markingType="multi-dot"
        markedDates={markedDates}
        onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
        theme={{ todayTextColor: colors.primary, selectedDayBackgroundColor: colors.primary, arrowColor: colors.primary, textDayFontWeight: '500', textMonthFontWeight: '700', textDayHeaderFontWeight: '500' }}
        style={[styles.calendar, { borderBottomColor: colors.border }]}
      />
      <View style={styles.dayHeader}>
        <Text variant="titleMedium" style={[styles.dayTitle, { color: colors.text }]}>
          {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>
        <Text style={[styles.dayCount, { color: colors.textSecondary }]}>{dayAppointments.length} cita{dayAppointments.length !== 1 ? 's' : ''}</Text>
      </View>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {loading ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Cargando...</Text>
        ) : dayAppointments.length === 0 ? (
          <VEmptyState
            icon={<CalendarX size={32} color={colors.textLight} />}
            title="Sin citas este día"
            description="Selecciona otro día o crea una nueva cita"
          />
        ) : (
          dayAppointments.map((appt) => {
            const config = TYPE_CONFIG[appt.appointment_type] || TYPE_CONFIG.consulta;
            const IconComponent = config.icon;
            return (
              <VCard key={appt.id} style={[styles.apptCard, { borderLeftColor: config.color, borderLeftWidth: 4 }]}>
                <View style={styles.apptHeader}>
                  <View style={[styles.apptIcon, { backgroundColor: config.color + '18' }]}>
                    <IconComponent size={18} color={config.color} />
                  </View>
                  <View style={styles.apptInfo}>
                    <Text variant="titleSmall" style={[styles.apptName, { color: colors.text }]}>{appt.patient_name}</Text>
                    <Text style={[styles.apptTime, { color: colors.textSecondary }]}>{formatTime(appt.start_time)}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setConfirmDelete({ name: appt.patient_name, id: appt.id })}>
                    <Trash2 size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
                {appt.tutor_phone && (
                  <View style={styles.apptDetail}>
                    <Phone size={12} color={colors.textSecondary} />
                    <Text style={[styles.apptDetailText, { color: colors.textSecondary }]}>{appt.tutor_phone}</Text>
                  </View>
                )}
                {appt.description && <Text style={[styles.apptDesc, { color: colors.text }]} numberOfLines={2}>{appt.description}</Text>}
              </VCard>
            );
          })
        )}
      </ScrollView>
      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary, ...SHADOWS.lg }]} onPress={() => setShowModal(true)}>
        <Plus size={24} color="#FFF" />
      </TouchableOpacity>
      <Portal>
        <Modal visible={showModal} onDismiss={() => setShowModal(false)} contentContainerStyle={[styles.modal, { backgroundColor: colors.surface }]}>
          <ScrollView>
            <Text variant="titleMedium" style={[styles.modalTitle, { color: colors.text }]}>Nueva Cita</Text>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Nombre del paciente *</Text>
            <RNTextInput style={[styles.input, { borderColor: colors.border, color: colors.text }]} value={apptName} onChangeText={setApptName} placeholder="Nombre del paciente" placeholderTextColor={colors.textLight} />
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Teléfono del tutor</Text>
            <RNTextInput style={[styles.input, { borderColor: colors.border, color: colors.text }]} value={apptPhone} onChangeText={setApptPhone} keyboardType="phone-pad" placeholder="Teléfono" placeholderTextColor={colors.textLight} />
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Tipo de cita</Text>
            <Menu visible={typeMenuVisible} onDismiss={() => setTypeMenuVisible(false)} anchor={
              <TouchableOpacity style={[styles.input, styles.menuAnchor, { borderColor: colors.border }]} onPress={() => setTypeMenuVisible(true)}>
                <Text style={{ color: colors.text }}>{apptType.charAt(0).toUpperCase() + apptType.slice(1)}</Text>
              </TouchableOpacity>
            }>
              <Menu.Item onPress={() => { setApptType('consulta'); setTypeMenuVisible(false); }} title="Consulta" />
              <Menu.Item onPress={() => { setApptType('vacuna'); setTypeMenuVisible(false); }} title="Vacuna" />
              <Menu.Item onPress={() => { setApptType('cirugia'); setTypeMenuVisible(false); }} title="Cirugía" />
              <Menu.Item onPress={() => { setApptType('control'); setTypeMenuVisible(false); }} title="Control" />
              <Menu.Item onPress={() => { setApptType('terreno'); setTypeMenuVisible(false); }} title="Terreno" />
            </Menu>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Fecha</Text>
            <RNTextInput style={[styles.input, { borderColor: colors.border, color: colors.text }]} value={apptDate} onChangeText={setApptDate} placeholder="AAAA-MM-DD" placeholderTextColor={colors.textLight} />
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Hora</Text>
            <RNTextInput style={[styles.input, { borderColor: colors.border, color: colors.text }]} value={apptTime} onChangeText={setApptTime} placeholder="HH:MM" placeholderTextColor={colors.textLight} />
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Descripción</Text>
            <RNTextInput style={[styles.input, styles.textArea, { borderColor: colors.border, color: colors.text }]} value={apptDescription} onChangeText={setApptDescription} multiline numberOfLines={3} placeholder="Descripción (opcional)" placeholderTextColor={colors.textLight} />
            <VButton variant="primary" fullWidth onPress={handleSave}>Guardar Cita</VButton>
          </ScrollView>
        </Modal>
      </Portal>

      <Portal>
        <Modal visible={!!errorDialog} onDismiss={() => setErrorDialog(null)} contentContainerStyle={[styles.dialogModal, { backgroundColor: colors.surface }]}>
          <AlertTriangle size={32} color={colors.warning} style={{ alignSelf: 'center', marginBottom: 8 }} />
          <Text variant="titleMedium" style={{ textAlign: 'center', color: colors.text }}>Error</Text>
          <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 4 }}>{errorDialog}</Text>
          <VButton variant="primary" fullWidth onPress={() => setErrorDialog(null)} style={{ marginTop: 16 }}>OK</VButton>
        </Modal>
      </Portal>

      <Portal>
        <Modal visible={!!confirmDelete} onDismiss={() => setConfirmDelete(null)} contentContainerStyle={[styles.dialogModal, { backgroundColor: colors.surface }]}>
          <AlertTriangle size={32} color={colors.error} style={{ alignSelf: 'center', marginBottom: 8 }} />
          <Text variant="titleMedium" style={{ textAlign: 'center', color: colors.text }}>Eliminar cita</Text>
          <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 4 }}>¿Eliminar cita de {confirmDelete?.name}?</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
            <VButton variant="secondary" onPress={() => setConfirmDelete(null)} style={{ flex: 1 }}>Cancelar</VButton>
            <VButton variant="danger" onPress={() => { if (confirmDelete) removeAppointment(confirmDelete.id); setConfirmDelete(null); }} style={{ flex: 1 }}>Eliminar</VButton>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  calendar: { borderBottomWidth: 1 },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg },
  dayTitle: { fontWeight: '700', textTransform: 'capitalize' },
  dayCount: { fontSize: 13 },
  list: { flex: 1 },
  listContent: { padding: SPACING.lg, paddingBottom: 80 },
  emptyText: { textAlign: 'center', marginTop: 20 },
  apptCard: { marginBottom: SPACING.md, borderRadius: RADIUS.lg },
  apptHeader: { flexDirection: 'row', alignItems: 'center' },
  apptIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  apptInfo: { flex: 1, marginLeft: SPACING.md },
  apptName: { fontWeight: '700' },
  apptTime: { fontSize: 13, marginTop: 2 },
  apptDetail: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm, gap: 4 },
  apptDetailText: { fontSize: 12 },
  apptDesc: { fontSize: 12, marginTop: SPACING.sm, lineHeight: 18 },
  fab: { position: 'absolute', right: 16, bottom: 16, width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  modal: { padding: 24, margin: 20, borderRadius: RADIUS.lg, maxHeight: '85%' },
  dialogModal: { padding: 24, margin: 20, borderRadius: RADIUS.lg },
  modalTitle: { fontWeight: '700', marginBottom: SPACING.lg },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: SPACING.xs },
  input: { borderWidth: 1, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, fontSize: 15 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  menuAnchor: { justifyContent: 'center', minHeight: 48 },
});
