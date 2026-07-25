import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform, TextInput as RNTextInput, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Modal, Portal, Menu } from 'react-native-paper';
import { AlertTriangle, Trash2 } from 'lucide-react-native';
import { useAppointments } from '../../hooks/useDirectus';
import { Appointment } from '../../services/directus';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/tokens';
import { APPOINTMENT_TYPE_COLORS } from '../../constants/colors';
import VButton from '../../components/ui/Button';
import AgendaHeader from '../../components/agenda/AgendaHeader';
import WeekGrid from '../../components/agenda/WeekGrid';
import DayGrid from '../../components/agenda/DayGrid';
import AgendaSidebar from '../../components/agenda/AgendaSidebar';
import { useAgendaLayout } from '../../components/agenda/useAgendaLayout';

export default function AgendaScreen() {
  const today = new Date().toISOString().slice(0, 10);
  const { colors } = useTheme();
  const { appointments, loading, addAppointment, removeAppointment } = useAppointments();

  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState(today);
  const [typeFilter, setTypeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ name: string; id: string } | null>(null);

  // New appointment form state
  const [apptName, setApptName] = useState('');
  const [apptPhone, setApptPhone] = useState('');
  const [apptType, setApptType] = useState<Appointment['appointment_type']>('consulta');
  const [apptDate, setApptDate] = useState(today);
  const [apptTime, setApptTime] = useState('09:00');
  const [apptDuration, setApptDuration] = useState('45');
  const [apptDescription, setApptDescription] = useState('');
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);
  const [durationMenuVisible, setDurationMenuVisible] = useState(false);
  const [errorDialog, setErrorDialog] = useState<string | null>(null);

  const screenWidth = Dimensions.get('window').width;
  const isMobile = screenWidth < 1024;

  const filteredAppointments = useMemo(() => {
    if (typeFilter === 'all') return appointments;
    return appointments.filter((a) => a.appointment_type === typeFilter);
  }, [appointments, typeFilter]);

  const {
    hours,
    hourHeight,
    dayAppointments,
    weekAppointments,
    monthDots,
    daySummary,
  } = useAgendaLayout(filteredAppointments, selectedDate, view, isMobile);

  const handleNavigate = useCallback(
    (dir: -1 | 1) => {
      const d = new Date(selectedDate + 'T12:00:00');
      if (view === 'day') d.setDate(d.getDate() + dir);
      else if (view === 'week') d.setDate(d.getDate() + dir * 7);
      else d.setMonth(d.getMonth() + dir);
      setSelectedDate(d.toISOString().slice(0, 10));
    },
    [selectedDate, view]
  );

  const handleToday = useCallback(() => {
    setSelectedDate(today);
  }, [today]);

  const handleSlotPress = useCallback(
    (date: string, hour: number) => {
      setApptDate(date);
      setApptTime(`${String(hour).padStart(2, '0')}:00`);
      setShowModal(true);
    },
    []
  );

  const handleSave = async () => {
    if (!apptName.trim()) {
      setErrorDialog('El nombre del paciente es obligatorio');
      return;
    }
    try {
      const durationMin = parseInt(apptDuration, 10) || 45;
      const startDate = new Date(`${apptDate}T${apptTime}:00`);
      const endDate = new Date(startDate.getTime() + durationMin * 60000);
      await addAppointment({
        patient_name: apptName.trim(),
        tutor_phone: apptPhone.trim() || null,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        appointment_type: apptType,
        description: apptDescription.trim() || null,
      });
      setApptName('');
      setApptPhone('');
      setApptDescription('');
      setShowModal(false);
    } catch {
      setErrorDialog('No se pudo guardar la cita');
    }
  };

  const handleDelete = (id: string) => {
    removeAppointment(id);
    setConfirmDelete(null);
  };

  const handleNewAppointment = () => {
    setApptDate(selectedDate);
    setApptTime('09:00');
    setShowModal(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <AgendaHeader
        view={view}
        selectedDate={selectedDate}
        onViewChange={setView}
        onNavigate={handleNavigate}
        onToday={handleToday}
        onNewAppointment={handleNewAppointment}
      />

      {/* Main content */}
      <View style={styles.content}>
        <View style={styles.mainArea}>
          {view === 'week' && (
            <WeekGrid
              hours={hours}
              hourHeight={hourHeight}
              weekAppointments={weekAppointments}
              onSlotPress={handleSlotPress}
              onAppointmentPress={(appt) => {
                setConfirmDelete({ name: appt.patient_name, id: appt.id });
              }}
            />
          )}
          {view === 'day' && (
            <DayGrid
              hours={hours}
              hourHeight={hourHeight}
              dayAppointments={dayAppointments}
              selectedDate={selectedDate}
              onSlotPress={handleSlotPress}
              onAppointmentPress={(appt) => {
                setConfirmDelete({ name: appt.patient_name, id: appt.id });
              }}
            />
          )}
          {view === 'month' && (
            <View style={[styles.monthContainer, { backgroundColor: colors.surface }]}>
              <AgendaSidebar
                selectedDate={selectedDate}
                monthDots={monthDots}
                dayAppointments={dayAppointments}
                typeFilter={typeFilter}
                onDayPress={(date) => {
                  setSelectedDate(date);
                  setView('day');
                }}
                onTypeFilterChange={setTypeFilter}
              />
            </View>
          )}
        </View>

        {/* Sidebar (web only, non-month view) */}
        {!isMobile && view !== 'month' && (
          <AgendaSidebar
            selectedDate={selectedDate}
            monthDots={monthDots}
            dayAppointments={dayAppointments}
            typeFilter={typeFilter}
            onDayPress={(date) => {
              setSelectedDate(date);
              setView('day');
            }}
            onTypeFilterChange={setTypeFilter}
          />
        )}
      </View>

      {/* Legend */}
      <View style={[styles.legend, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        {Object.entries(APPOINTMENT_TYPE_COLORS).map(([type, color]) => (
          <View key={type} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </View>
        ))}
      </View>

      {/* Mobile FAB */}
      {isMobile && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary, ...SHADOWS.lg }]}
          onPress={handleNewAppointment}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}

      {/* New Appointment Modal */}
      <Portal>
        <Modal visible={showModal} onDismiss={() => setShowModal(false)} contentContainerStyle={[styles.modal, { backgroundColor: colors.surface }]}>
          <ScrollView>
            <Text variant="titleMedium" style={[styles.modalTitle, { color: colors.text }]}>Nueva Cita</Text>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Fecha y hora</Text>
            <Text style={[styles.fieldValue, { color: colors.text }]}>
              {new Date(`${apptDate}T${apptTime}:00`).toLocaleDateString('es-CL', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })} • {apptTime}
            </Text>

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Paciente *</Text>
            <RNTextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              value={apptName}
              onChangeText={setApptName}
              placeholder="Nombre del paciente"
              placeholderTextColor={colors.textLight}
            />

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Teléfono</Text>
            <RNTextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              value={apptPhone}
              onChangeText={setApptPhone}
              keyboardType="phone-pad"
              placeholder="Teléfono"
              placeholderTextColor={colors.textLight}
            />

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Tipo de Cita</Text>
            <Menu visible={typeMenuVisible} onDismiss={() => setTypeMenuVisible(false)} anchor={
              <TouchableOpacity style={[styles.input, styles.menuAnchor, { borderColor: colors.border }]} onPress={() => setTypeMenuVisible(true)}>
                <Text style={{ color: colors.text }}>{apptType.charAt(0).toUpperCase() + apptType.slice(1)}</Text>
              </TouchableOpacity>
            }>
              {['consulta', 'vacuna', 'cirugia', 'control', 'terreno'].map((t) => (
                <Menu.Item key={t} onPress={() => { setApptType(t as any); setTypeMenuVisible(false); }} title={t.charAt(0).toUpperCase() + t.slice(1)} />
              ))}
            </Menu>

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Duración</Text>
            <Menu visible={durationMenuVisible} onDismiss={() => setDurationMenuVisible(false)} anchor={
              <TouchableOpacity style={[styles.input, styles.menuAnchor, { borderColor: colors.border }]} onPress={() => setDurationMenuVisible(true)}>
                <Text style={{ color: colors.text }}>{apptDuration} min</Text>
              </TouchableOpacity>
            }>
              {['15', '30', '45', '60', '90', '120'].map((d) => (
                <Menu.Item key={d} onPress={() => { setApptDuration(d); setDurationMenuVisible(false); }} title={`${d} min`} />
              ))}
            </Menu>

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Descripción</Text>
            <RNTextInput
              style={[styles.input, styles.textArea, { borderColor: colors.border, color: colors.text }]}
              value={apptDescription}
              onChangeText={setApptDescription}
              multiline
              numberOfLines={3}
              placeholder="Descripción (opcional)"
              placeholderTextColor={colors.textLight}
            />

            <View style={{ flexDirection: 'row', gap: 8, marginTop: SPACING.md }}>
              <VButton variant="secondary" onPress={() => setShowModal(false)} style={{ flex: 1 }}>Cancelar</VButton>
              <VButton variant="primary" onPress={handleSave} style={{ flex: 1 }}>Guardar</VButton>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Error Dialog */}
      <Portal>
        <Modal visible={!!errorDialog} onDismiss={() => setErrorDialog(null)} contentContainerStyle={[styles.dialogModal, { backgroundColor: colors.surface }]}>
          <AlertTriangle size={32} color={colors.warning} style={{ alignSelf: 'center', marginBottom: 8 }} />
          <Text variant="titleMedium" style={{ textAlign: 'center', color: colors.text }}>Error</Text>
          <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 4 }}>{errorDialog}</Text>
          <VButton variant="primary" onPress={() => setErrorDialog(null)} style={{ marginTop: 16 }}>OK</VButton>
        </Modal>
      </Portal>

      {/* Delete Confirm */}
      <Portal>
        <Modal visible={!!confirmDelete} onDismiss={() => setConfirmDelete(null)} contentContainerStyle={[styles.dialogModal, { backgroundColor: colors.surface }]}>
          <AlertTriangle size={32} color={colors.error} style={{ alignSelf: 'center', marginBottom: 8 }} />
          <Text variant="titleMedium" style={{ textAlign: 'center', color: colors.text }}>Eliminar cita</Text>
          <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 4 }}>
            ¿Eliminar cita de {confirmDelete?.name}?
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
            <VButton variant="secondary" onPress={() => setConfirmDelete(null)} style={{ flex: 1 }}>Cancelar</VButton>
            <VButton variant="danger" onPress={() => { if (confirmDelete) handleDelete(confirmDelete.id); }} style={{ flex: 1 }}>Eliminar</VButton>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, flexDirection: 'row' },
  mainArea: { flex: 1 },
  monthContainer: { flex: 1, margin: SPACING.lg, borderRadius: RADIUS.lg },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderTopWidth: 1,
    gap: SPACING.lg,
    flexWrap: 'wrap',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: TYPOGRAPHY.sizes.xs },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: { color: '#FFF', fontSize: 24, fontWeight: '700' },
  modal: { padding: 24, margin: 20, borderRadius: RADIUS.lg, maxHeight: '85%' },
  dialogModal: { padding: 24, margin: 20, borderRadius: RADIUS.lg },
  modalTitle: { fontWeight: '700', marginBottom: SPACING.lg },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: SPACING.xs, marginTop: SPACING.sm },
  fieldValue: { fontSize: 14, marginBottom: SPACING.sm },
  input: { borderWidth: 1, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, fontSize: 15 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  menuAnchor: { justifyContent: 'center', minHeight: 48 },
});
