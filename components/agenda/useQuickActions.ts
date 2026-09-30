import { useRouter } from 'expo-router';
import { api } from '../../services/directus';
import { useConfirm } from '../ui/ConfirmDialog';
import { useToast } from '../ui/VToast';
import type { EditMode } from './AppointmentEditSheet';

interface QuickAppointment {
  id: string;
  patient_name: string;
  pet_id?: string | null;
  appointment_type?: string | null;
  status?: string | null;
}

interface UseQuickActionsOptions {
  /** Opens the edit/reschedule/follow-up sheet */
  onOpenEditor?: (appointment: any, mode: EditMode) => void;
  /** Opens the payment form for the appointment */
  onOpenPayment?: (appointment: any) => void;
}

// Real actions for the agenda context menu (they used to be Alert.alert stubs,
// which do nothing on the web and never called the API).
export default function useQuickActions({ onOpenEditor, onOpenPayment }: UseQuickActionsOptions = {}) {
  const router = useRouter();
  const { confirm, notify } = useConfirm();
  const toast = useToast();

  const needsPatient = async (appointment: QuickAppointment) => {
    if (appointment.pet_id) return false;
    const register = await confirm({
      title: 'Cita sin paciente registrado',
      message: `${appointment.patient_name} no tiene ficha. ¿Quieres registrarlo ahora?`,
      confirmLabel: 'Registrar paciente',
    });
    if (register) router.push({ pathname: '/(drawer)/add-paciente', params: { prefillName: appointment.patient_name } } as any);
    return true;
  };

  const openChart = async (appointment: QuickAppointment) => {
    if (await needsPatient(appointment)) return;
    router.push(`/pet/${appointment.pet_id}` as any);
  };

  const registerConsultation = openChart;

  const hospitalize = async (appointment: QuickAppointment) => {
    if (await needsPatient(appointment)) return;
    const ok = await confirm({ title: 'Hospitalizar', message: `¿Internar a ${appointment.patient_name}?`, confirmLabel: 'Internar' });
    if (!ok) return;
    try {
      await api.hospitalizations.create({
        pet_id: appointment.pet_id,
        reason: `Ingreso desde la agenda (${appointment.appointment_type || 'consulta'})`,
        status: 'internado',
      });
      toast.success(`${appointment.patient_name} quedó internado`);
    } catch (e: any) {
      toast.error(e?.message || 'No se pudo hospitalizar');
    }
  };

  const scheduleFollowup = (appointment: QuickAppointment) => onOpenEditor?.(appointment, 'followup');
  const edit = (appointment: QuickAppointment) => onOpenEditor?.(appointment, 'edit');
  const reschedule = (appointment: QuickAppointment) => onOpenEditor?.(appointment, 'reschedule');

  const charge = (appointment: QuickAppointment) => {
    if (onOpenPayment) onOpenPayment(appointment);
    else notify('Cobrar', 'El formulario de cobro no está disponible aquí.');
  };

  const cancel = async (appointment: QuickAppointment) => {
    const ok = await confirm({
      title: 'Cancelar cita',
      message: `¿Cancelar la cita de ${appointment.patient_name}? Podrás reprogramarla después.`,
      confirmLabel: 'Cancelar cita',
      cancelLabel: 'Volver',
      destructive: true,
    });
    if (!ok) return;
    try {
      await api.appointments.update(appointment.id, { status: 'cancelada' });
      toast.success('Cita cancelada');
    } catch (e: any) {
      // e.g. "Transición inválida: completada -> cancelada"
      toast.error(e?.message || 'No se pudo cancelar la cita');
    }
  };

  const remove = async (appointment: QuickAppointment) => {
    const ok = await confirm({
      title: 'Eliminar cita',
      message: `Se eliminará definitivamente la cita de ${appointment.patient_name}. Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      cancelLabel: 'Volver',
      destructive: true,
    });
    if (!ok) return;
    try {
      await api.appointments.delete(appointment.id);
      toast.success('Cita eliminada');
    } catch (e: any) {
      toast.error(e?.message || 'No se pudo eliminar la cita');
    }
  };

  return { openChart, registerConsultation, hospitalize, scheduleFollowup, charge, edit, reschedule, cancel, remove };
}
