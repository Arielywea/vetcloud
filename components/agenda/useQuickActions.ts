import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

interface QuickAppointment {
  id: string;
  patient_name: string;
  pet_id?: string | null;
}

interface UseQuickActionsOptions {
  onRefresh?: () => void;
}

interface UseQuickActionsReturn {
  openChart: (appointment: QuickAppointment) => void;
  registerConsultation: (appointment: QuickAppointment) => void;
  hospitalize: (appointment: QuickAppointment) => void;
  scheduleFollowup: (appointment: QuickAppointment) => void;
  charge: (appointment: QuickAppointment) => void;
  edit: (appointment: QuickAppointment) => void;
  reschedule: (appointment: QuickAppointment) => void;
  cancel: (appointment: QuickAppointment) => void;
  remove: (appointment: QuickAppointment) => void;
}

export default function useQuickActions({ onRefresh }: UseQuickActionsOptions = {}): UseQuickActionsReturn {
  const router = useRouter();

  const openChart = (appointment: QuickAppointment) => {
    if (appointment.pet_id) {
      router.push(`/(drawer)/pet/${appointment.pet_id}`);
    } else {
      Alert.alert('Sin expediente', 'Esta cita no tiene paciente asociado');
    }
  };

  const registerConsultation = (appointment: QuickAppointment) => {
    if (appointment.pet_id) {
      router.push(`/(drawer)/pet/${appointment.pet_id}`);
    } else {
      Alert.alert('Sin paciente', 'Primero asocia un paciente a esta cita');
    }
  };

  const hospitalize = (appointment: QuickAppointment) => {
    Alert.alert('Hospitalizar', `¿Hospitalizar a ${appointment.patient_name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Hospitalizar', onPress: () => onRefresh?.() },
    ]);
  };

  const scheduleFollowup = (appointment: QuickAppointment) => {
    Alert.alert('Agendar control', `Programar control para ${appointment.patient_name}`);
  };

  const charge = (appointment: QuickAppointment) => {
    Alert.alert('Cobrar', `Cobrar cita de ${appointment.patient_name}`);
  };

  const edit = (appointment: QuickAppointment) => {
    Alert.alert('Editar', `Editar cita de ${appointment.patient_name}`);
  };

  const reschedule = (appointment: QuickAppointment) => {
    Alert.alert('Reprogramar', `Reprogramar cita de ${appointment.patient_name}`);
  };

  const cancel = (appointment: QuickAppointment) => {
    Alert.alert(
      'Cancelar cita',
      `¿Cancelar la cita de ${appointment.patient_name}?`,
      [
        { text: 'No', style: 'cancel' },
        { text: 'Sí, cancelar', style: 'destructive', onPress: () => onRefresh?.() },
      ]
    );
  };

  const remove = (appointment: QuickAppointment) => {
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
