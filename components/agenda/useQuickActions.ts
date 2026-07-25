import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { EnrichedAppointment } from './WeekView';

interface UseQuickActionsOptions {
  onRefresh?: () => void;
}

interface UseQuickActionsReturn {
  openChart: (appointment: EnrichedAppointment) => void;
  registerConsultation: (appointment: EnrichedAppointment) => void;
  hospitalize: (appointment: EnrichedAppointment) => void;
  scheduleFollowup: (appointment: EnrichedAppointment) => void;
  charge: (appointment: EnrichedAppointment) => void;
  edit: (appointment: EnrichedAppointment) => void;
  reschedule: (appointment: EnrichedAppointment) => void;
  cancel: (appointment: EnrichedAppointment) => void;
  remove: (appointment: EnrichedAppointment) => void;
}

export default function useQuickActions({ onRefresh }: UseQuickActionsOptions = {}): UseQuickActionsReturn {
  const router = useRouter();

  const openChart = (appointment: EnrichedAppointment) => {
    if (appointment.pet_id) {
      router.push(`/(drawer)/ficha-clinica/${appointment.pet_id}`);
    } else {
      Alert.alert('Sin expediente', 'Esta cita no tiene paciente asociado');
    }
  };

  const registerConsultation = (appointment: EnrichedAppointment) => {
    if (appointment.pet_id) {
      router.push(`/(drawer)/ficha-clinica/${appointment.pet_id}`);
    } else {
      Alert.alert('Sin paciente', 'Primero asocia un paciente a esta cita');
    }
  };

  const hospitalize = (appointment: EnrichedAppointment) => {
    Alert.alert('Hospitalizar', `¿Hospitalizar a ${appointment.patient_name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Hospitalizar', onPress: () => onRefresh?.() },
    ]);
  };

  const scheduleFollowup = (appointment: EnrichedAppointment) => {
    Alert.alert('Agendar control', `Programar control para ${appointment.patient_name}`);
  };

  const charge = (appointment: EnrichedAppointment) => {
    Alert.alert('Cobrar', `Cobrar cita de ${appointment.patient_name}`);
  };

  const edit = (appointment: EnrichedAppointment) => {
    Alert.alert('Editar', `Editar cita de ${appointment.patient_name}`);
  };

  const reschedule = (appointment: EnrichedAppointment) => {
    Alert.alert('Reprogramar', `Reprogramar cita de ${appointment.patient_name}`);
  };

  const cancel = (appointment: EnrichedAppointment) => {
    Alert.alert(
      'Cancelar cita',
      `¿Cancelar la cita de ${appointment.patient_name}?`,
      [
        { text: 'No', style: 'cancel' },
        { text: 'Sí, cancelar', style: 'destructive', onPress: () => onRefresh?.() },
      ]
    );
  };

  const remove = (appointment: EnrichedAppointment) => {
    Alert.alert(
      'Eliminar cita',
      `¿Eliminar permanentemente la cita de ${appointment.patient_name}?`,
      [
        { text: 'No', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => onRefresh?.() },
      ]
    );
  };

  return {
    openChart,
    registerConsultation,
    hospitalize,
    scheduleFollowup,
    charge,
    edit,
    reschedule,
    cancel,
    remove,
  };
}
