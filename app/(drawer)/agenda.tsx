import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Card, Button, FAB, Portal, Modal, TextInput, Menu } from 'react-native-paper';
import { Calendar, DateData } from 'react-native-calendars';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppointments } from '../../hooks/useDirectus';
import { Appointment } from '../../services/directus';
import { APP_COLORS } from '../../constants/colors';

const TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  consulta: { icon: 'stethoscope', color: '#1976D2', bg: '#E3F2FD' },
  vacuna: { icon: 'needle', color: '#43A047', bg: '#E8F5E9' },
  cirugia: { icon: 'scissors-cutting', color: '#E53935', bg: '#FCE4EC' },
  control: { icon: 'clipboard-check', color: '#F57C00', bg: '#FFF3E0' },
};

function formatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default function AgendaScreen() {
  const today = new Date().toISOString().slice(0, 10);
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

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    appointments.forEach((appt) => {
      const dateKey = appt.start_time.slice(0, 10);
      const config = TYPE_CONFIG[appt.appointment_type] || TYPE_CONFIG.consulta;
      if (!marks[dateKey]) {
        marks[dateKey] = { dots: [] };
      }
      marks[dateKey].dots.push({ color: config.color });
    });
    marks[selectedDate] = {
      ...(marks[selectedDate] || {}),
      selected: true,
      selectedColor: APP_COLORS.primary,
    };
    return marks;
  }, [appointments, selectedDate]);

  const dayAppointments = useMemo(() => {
    return appointments
      .filter((a) => a.start_time.slice(0, 10) === selectedDate)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }, [appointments, selectedDate]);

  const handleSave = async () => {
    if (!apptName.trim()) {
      Alert.alert('Error', 'El nombre del paciente es obligatorio');
      return;
    }
    try {
      await addAppointment({
        patient_name: apptName.trim(),
        tutor_phone: apptPhone.trim() || null,
        start_time: new Date(`${apptDate}T${apptTime}`).toISOString(),
        end_time: null,
        appointment_type: apptType,
        description: apptDescription.trim() || null,
      });
      setApptName('');
      setApptPhone('');
      setApptDescription('');
      setShowModal(false);
    } catch {
      Alert.alert('Error', 'No se pudo guardar la cita');
    }
  };

  const handleDelete = (appt: Appointment) => {
    Alert.alert('Eliminar cita', `¿Eliminar cita de ${appt.patient_name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => removeAppointment(appt.id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <Calendar
        markingType="multi-dot"
        markedDates={markedDates}
        onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
        theme={{
          todayTextColor: APP_COLORS.primary,
          selectedDayBackgroundColor: APP_COLORS.primary,
          arrowColor: APP_COLORS.primary,
          textDayFontWeight: '500',
          textMonthFontWeight: '700',
          textDayHeaderFontWeight: '500',
        }}
        style={styles.calendar}
      />

      <View style={styles.dayHeader}>
        <Text variant="titleMedium" style={styles.dayTitle}>
          {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-CL', {
            weekday: 'long', day: 'numeric', month: 'long',
          })}
        </Text>
        <Text style={styles.dayCount}>{dayAppointments.length} cita{dayAppointments.length !== 1 ? 's' : ''}</Text>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {loading ? (
          <Text style={styles.emptyText}>Cargando...</Text>
        ) : dayAppointments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="calendar-blank" size={48} color={APP_COLORS.textLight} />
            <Text style={styles.emptyTitle}>Sin citas este día</Text>
          </View>
        ) : (
          dayAppointments.map((appt) => {
            const config = TYPE_CONFIG[appt.appointment_type] || TYPE_CONFIG.consulta;
            return (
              <Card key={appt.id} style={[styles.apptCard, { borderLeftColor: config.color, borderLeftWidth: 4 }]}>
                <Card.Content>
                  <View style={styles.apptHeader}>
                    <View style={[styles.apptIcon, { backgroundColor: config.bg }]}>
                      <MaterialCommunityIcons name={config.icon as any} size={18} color={config.color} />
                    </View>
                    <View style={styles.apptInfo}>
                      <Text variant="titleSmall" style={styles.apptName}>{appt.patient_name}</Text>
                      <Text style={styles.apptTime}>{formatTime(appt.start_time)}</Text>
                    </View>
                    <Button compact mode="text" onPress={() => handleDelete(appt)}>
                      <MaterialCommunityIcons name="delete" size={18} color={APP_COLORS.error} />
                    </Button>
                  </View>
                  {appt.tutor_phone && (
                    <View style={styles.apptDetail}>
                      <MaterialCommunityIcons name="phone" size={12} color={APP_COLORS.textSecondary} />
                      <Text style={styles.apptDetailText}>{appt.tutor_phone}</Text>
                    </View>
                  )}
                  {appt.description && (
                    <Text style={styles.apptDesc} numberOfLines={2}>{appt.description}</Text>
                  )}
                </Card.Content>
              </Card>
            );
          })
        )}
      </ScrollView>

      <FAB icon="plus" style={styles.fab} color="#FFF" onPress={() => setShowModal(true)} />

      <Portal>
        <Modal visible={showModal} onDismiss={() => setShowModal(false)} contentContainerStyle={styles.modal}>
          <ScrollView>
            <Text variant="titleMedium" style={styles.modalTitle}>Nueva Cita</Text>
            <TextInput label="Nombre del paciente *" value={apptName} onChangeText={setApptName} mode="outlined" style={styles.input} />
            <TextInput label="Teléfono del tutor" value={apptPhone} onChangeText={setApptPhone} mode="outlined" style={styles.input} keyboardType="phone-pad" />

            <Text style={styles.fieldLabel}>Tipo de cita</Text>
            <Menu
              visible={typeMenuVisible}
              onDismiss={() => setTypeMenuVisible(false)}
              anchor={
                <Button mode="outlined" onPress={() => setTypeMenuVisible(true)} style={styles.input}>
                  {apptType.charAt(0).toUpperCase() + apptType.slice(1)}
                </Button>
              }
            >
              <Menu.Item onPress={() => { setApptType('consulta'); setTypeMenuVisible(false); }} title="Consulta" />
              <Menu.Item onPress={() => { setApptType('vacuna'); setTypeMenuVisible(false); }} title="Vacuna" />
              <Menu.Item onPress={() => { setApptType('cirugia'); setTypeMenuVisible(false); }} title="Cirugía" />
              <Menu.Item onPress={() => { setApptType('control'); setTypeMenuVisible(false); }} title="Control" />
            </Menu>

            <TextInput label="Fecha (AAAA-MM-DD)" value={apptDate} onChangeText={setApptDate} mode="outlined" style={styles.input} />
            <TextInput label="Hora (HH:MM)" value={apptTime} onChangeText={setApptTime} mode="outlined" style={styles.input} />
            <TextInput label="Descripción" value={apptDescription} onChangeText={setApptDescription} mode="outlined" multiline numberOfLines={3} style={styles.input} />

            <Button mode="contained" onPress={handleSave} style={styles.saveButton}>Guardar Cita</Button>
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_COLORS.background },
  calendar: { borderBottomWidth: 1, borderBottomColor: APP_COLORS.border },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
  dayTitle: { fontWeight: '700', color: APP_COLORS.text, textTransform: 'capitalize' },
  dayCount: { fontSize: 13, color: APP_COLORS.textSecondary },
  list: { flex: 1 },
  listContent: { padding: 12, paddingBottom: 80 },
  emptyContainer: { alignItems: 'center', paddingTop: 40 },
  emptyTitle: { marginTop: 8, color: APP_COLORS.textSecondary },
  emptyText: { color: APP_COLORS.textSecondary, textAlign: 'center', marginTop: 20 },
  apptCard: { marginBottom: 10, borderRadius: 10, backgroundColor: APP_COLORS.surface },
  apptHeader: { flexDirection: 'row', alignItems: 'center' },
  apptIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  apptInfo: { flex: 1, marginLeft: 10 },
  apptName: { fontWeight: '700', color: APP_COLORS.text },
  apptTime: { fontSize: 13, color: APP_COLORS.textSecondary, marginTop: 2 },
  apptDetail: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 },
  apptDetailText: { fontSize: 12, color: APP_COLORS.textSecondary },
  apptDesc: { fontSize: 12, color: APP_COLORS.text, marginTop: 6, lineHeight: 18 },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: APP_COLORS.primary, borderRadius: 16 },
  modal: { backgroundColor: 'white', padding: 24, margin: 20, borderRadius: 12, maxHeight: '85%' },
  modalTitle: { fontWeight: '700', marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: APP_COLORS.textSecondary, marginBottom: 4 },
  input: { marginBottom: 12 },
  saveButton: { marginTop: 8 },
});
