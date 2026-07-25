import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import { Modal, Portal } from 'react-native-paper';
import { AlertTriangle } from 'lucide-react-native';
import { useAppointments } from '../../hooks/useDirectus';
import { api, Appointment } from '../../services/directus';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, SHADOWS } from '../../constants/tokens';
import { APPOINTMENT_TYPE_COLORS } from '../../constants/colors';
import AgendaHeader from '../../components/agenda/AgendaHeader';
import AgendaToolbar from '../../components/agenda/AgendaToolbar';
import WeekGrid from '../../components/agenda/WeekGrid';
import DayGrid from '../../components/agenda/DayGrid';
import AgendaSidebar from '../../components/agenda/AgendaSidebar';
import { useAgendaLayout } from '../../components/agenda/useAgendaLayout';
import { useAgendaData } from '../../components/agenda/useAgendaData';

export default function AgendaScreen() {
  const today = new Date().toISOString().slice(0, 10);
  const { colors } = useTheme();
  const { appointments, addAppointment, removeAppointment } = useAppointments();

  const [pets, setPets] = useState<any[]>([]);
  React.useEffect(() => {
    api.pets.list().then((data: any) => setPets(data || [])).catch(() => {});
  }, []);

  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState(today);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vetFilter, setVetFilter] = useState('all');

  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ name: string; id: string } | null>(null);
  const [errorDialog, setErrorDialog] = useState<string | null>(null);

  const [apptName, setApptName] = useState('');
  const [apptPhone, setApptPhone] = useState('');
  const [apptType, setApptType] = useState<Appointment['appointment_type']>('consulta');
  const [apptDate, setApptDate] = useState(today);
  const [apptTime, setApptTime] = useState('09:00');
  const [apptDuration, setApptDuration] = useState('45');
  const [apptDescription, setApptDescription] = useState('');
  const [apptVet, setApptVet] = useState('');

  const screenWidth = Dimensions.get('window').width;
  const isMobile = screenWidth < 1024;

  const { filtered, uniqueVets, daySummary } = useAgendaData(
    appointments,
    pets,
    selectedDate,
    searchQuery,
    typeFilter,
    statusFilter,
    vetFilter
  );

  const {
    hours,
    hourHeight,
    dayAppointments,
    weekAppointments,
    monthDots,
  } = useAgendaLayout(filtered, selectedDate, view, isMobile);

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

  const handleMonthChange = useCallback(
    (dir: -1 | 1) => {
      const d = new Date(selectedDate + 'T12:00:00');
      d.setMonth(d.getMonth() + dir);
      setSelectedDate(d.toISOString().slice(0, 10));
    },
    [selectedDate]
  );

  const handleSlotPress = useCallback(
    (date: string, hour: number) => {
      setApptDate(date);
      setApptTime(`${String(hour).padStart(2, '0')}:00`);
      setShowModal(true);
    },
    []
  );

  const handleNewAppointment = () => {
    setApptDate(selectedDate);
    setApptTime('09:00');
    setShowModal(true);
  };

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
        veterinarian: apptVet.trim() || null,
        status: 'programada',
      });
      setApptName('');
      setApptPhone('');
      setApptDescription('');
      setApptVet('');
      setShowModal(false);
    } catch {
      setErrorDialog('No se pudo guardar la cita');
    }
  };

  const handleDelete = (id: string) => {
    removeAppointment(id);
    setConfirmDelete(null);
  };

  const handleClearFilters = () => {
    setTypeFilter('all');
    setStatusFilter('all');
    setVetFilter('all');
    setSearchQuery('');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AgendaHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <AgendaToolbar
        view={view}
        selectedDate={selectedDate}
        onViewChange={setView}
        onNavigate={handleNavigate}
        onToday={handleToday}
        onNewAppointment={handleNewAppointment}
      />

      <View style={styles.content}>
        <View style={styles.mainArea}>
          {view === 'week' && (
            <WeekGrid
              hours={hours}
              hourHeight={hourHeight}
              weekAppointments={weekAppointments}
              selectedDate={selectedDate}
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
                daySummary={daySummary}
                typeFilter={typeFilter}
                statusFilter={statusFilter}
                vetFilter={vetFilter}
                uniqueVets={uniqueVets}
                onDayPress={(date) => {
                  setSelectedDate(date);
                  setView('day');
                }}
                onTypeFilterChange={setTypeFilter}
                onStatusFilterChange={setStatusFilter}
                onVetFilterChange={setVetFilter}
                onClearFilters={handleClearFilters}
                onMonthChange={handleMonthChange}
              />
            </View>
          )}
        </View>

        {!isMobile && view !== 'month' && (
          <AgendaSidebar
            selectedDate={selectedDate}
            monthDots={monthDots}
            daySummary={daySummary}
            typeFilter={typeFilter}
            statusFilter={statusFilter}
            vetFilter={vetFilter}
            uniqueVets={uniqueVets}
            onDayPress={(date) => {
              setSelectedDate(date);
              setView('day');
            }}
            onTypeFilterChange={setTypeFilter}
            onStatusFilterChange={setStatusFilter}
            onVetFilterChange={setVetFilter}
            onClearFilters={handleClearFilters}
            onMonthChange={handleMonthChange}
          />
        )}
      </View>

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

      {isMobile && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary, ...SHADOWS.lg }]}
          onPress={handleNewAppointment}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}

      <Portal>
        <Modal visible={showModal} onDismiss={() => setShowModal(false)} contentContainerStyle={[styles.modal, { backgroundColor: colors.surface }]}>
          <View style={styles.modalScroll}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Nueva Cita</Text>

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Paciente *</Text>
            <View style={[styles.input, { borderColor: colors.border }]}>
              <Text style={{ color: colors.text }}>{apptName || 'Nombre del paciente'}</Text>
            </View>

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Fecha y hora</Text>
            <Text style={[styles.fieldValue, { color: colors.text }]}>
              {new Date(`${apptDate}T${apptTime}:00`).toLocaleDateString('es-CL', {
                weekday: 'long', day: 'numeric', month: 'long',
              })} • {apptTime}
            </Text>

            <View style={{ flexDirection: 'row', gap: 8, marginTop: SPACING.md }}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.surfaceVariant }]} onPress={() => setShowModal(false)}>
                <Text style={{ color: colors.textSecondary }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
                <Text style={{ color: '#FFF' }}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </Portal>

      <Portal>
        <Modal visible={!!errorDialog} onDismiss={() => setErrorDialog(null)} contentContainerStyle={[styles.dialogModal, { backgroundColor: colors.surface }]}>
          <AlertTriangle size={32} color={colors.warning} style={{ alignSelf: 'center', marginBottom: 8 }} />
          <Text style={{ textAlign: 'center', color: colors.text, fontWeight: '700' }}>Error</Text>
          <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 4 }}>{errorDialog}</Text>
          <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.primary, marginTop: 16 }]} onPress={() => setErrorDialog(null)}>
            <Text style={{ color: '#FFF', textAlign: 'center' }}>OK</Text>
          </TouchableOpacity>
        </Modal>
      </Portal>

      <Portal>
        <Modal visible={!!confirmDelete} onDismiss={() => setConfirmDelete(null)} contentContainerStyle={[styles.dialogModal, { backgroundColor: colors.surface }]}>
          <AlertTriangle size={32} color={colors.error} style={{ alignSelf: 'center', marginBottom: 8 }} />
          <Text style={{ textAlign: 'center', color: colors.text, fontWeight: '700' }}>Eliminar cita</Text>
          <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 4 }}>
            ¿Eliminar cita de {confirmDelete?.name}?
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.surfaceVariant, flex: 1 }]} onPress={() => setConfirmDelete(null)}>
              <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.error, flex: 1 }]} onPress={() => { if (confirmDelete) handleDelete(confirmDelete.id); }}>
              <Text style={{ color: '#FFF', textAlign: 'center' }}>Eliminar</Text>
            </TouchableOpacity>
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
  monthContainer: { flex: 1, margin: SPACING.lg, borderRadius: RADIUS.lg, maxWidth: 320, alignSelf: 'center' },
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
  legendLabel: { fontSize: 11 },
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
  modalScroll: {},
  modalTitle: { fontWeight: '700', fontSize: 17, marginBottom: SPACING.lg },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: SPACING.xs, marginTop: SPACING.sm },
  fieldValue: { fontSize: 14, marginBottom: SPACING.sm },
  input: { borderWidth: 1, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, fontSize: 15 },
  modalBtn: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, alignItems: 'center' },
});
