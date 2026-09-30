import React, { useState, useCallback, useMemo, Component, ReactNode } from 'react';
import { View, StyleSheet, Platform, Text, useWindowDimensions, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useResponsive } from '../../hooks/useResponsive';

// Components
import AgendaToolbar from '../../components/agenda/AgendaToolbar';
import WeekView, { EnrichedAppointment } from '../../components/agenda/WeekView';
import DayView from '../../components/agenda/DayView';
import MonthView from '../../components/agenda/MonthView';
import AgendaSidebar from '../../components/agenda/AgendaSidebar';
import DaySummary from '../../components/agenda/DaySummary';
import ContextMenu from '../../components/agenda/ContextMenu';

import AppointmentDetailModal, { AppointmentDetail } from '../../components/agenda/AppointmentDetailModal';
import AppointmentCreationModal from '../../components/agenda/AppointmentCreationModal';
import AppointmentEditSheet, { EditMode } from '../../components/agenda/AppointmentEditSheet';
import PaymentForm from '../../components/pet/PaymentForm';
import { exportAgenda, printAgenda } from '../../components/agenda/agendaExport';
import { useToast } from '../../components/ui/VToast';

// Hooks
import useAgendaData from '../../components/agenda/useAgendaData';
import useAgendaLayout from '../../components/agenda/useAgendaLayout';
import useQuickActions from '../../components/agenda/useQuickActions';
import useDragDrop from '../../components/agenda/useDragDrop';

// Theme
import { useTheme } from '../../contexts/ThemeContext';
import { APP_COLORS } from '../../constants/colors';

// API
import { api } from '../../services/directus';

type ViewMode = 'week' | 'day' | 'month';

function getWeekDays(date: Date): Date[] {
  const start = new Date(date);
  // Monday-based week; on Sundays (getDay() === 0) the old formula jumped to the next week
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

class AgendaErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <View style={{ flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: APP_COLORS.error, marginBottom: 8 }}>Error en Agenda</Text>
          <Text style={{ fontSize: 14, color: APP_COLORS.text, textAlign: 'center' }}>{this.state.error.message}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function AgendaContent() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isMobile, isDesktop, width: screenWidth } = useResponsive();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, appointment: null as EnrichedAppointment | null });
  
  const [filters, setFilters] = useState({ veterinarian: '', species: '', appointmentType: '', status: '' });
  const [detailModal, setDetailModal] = useState({ visible: false, appointment: null as AppointmentDetail | null });
  const [creationModal, setCreationModal] = useState({ visible: false, initialDate: new Date(), initialHour: 9 });

  const { appointments, allAppointments, loading, error: loadError, summary, veterinarians, refetch } = useAgendaData({
    selectedDate,
    searchQuery,
    filters,
  });
  const toast = useToast();
  const [editor, setEditor] = useState<{ visible: boolean; mode: EditMode; appointment: any }>({ visible: false, mode: 'edit', appointment: null });
  const [payment, setPayment] = useState<{ visible: boolean; appointment: any }>({ visible: false, appointment: null });
  // Measured width of the calendar area (screen width minus app sidebar and agenda sidebar)
  const [mainWidth, setMainWidth] = useState<number | undefined>(undefined);

  const { nextAppointment, delayedAppointments, totalGridHeight } = useAgendaLayout({
    appointments,
    selectedDate,
  });

  const handleAppointmentPress = useCallback((apt: any) => {
    setDetailModal({ visible: true, appointment: apt });
  }, []);

  const quickActions = useQuickActions({
    onOpenEditor: (appointment, mode) => setEditor({ visible: true, mode, appointment }),
    onOpenPayment: (appointment) => setPayment({ visible: true, appointment }),
  });

  const { dragState, onDragStart, onDragMove, onDragEnd } = useDragDrop({
    onMove: async (id, newStart, newEnd) => {
      try {
        await api.appointments.update(id, {
          start_time: newStart.toISOString(),
          end_time: newEnd.toISOString(),
        });
        toast.success('Cita reprogramada');
      } catch (err: any) {
        toast.error(err?.message || 'No se pudo mover la cita');
      }
      // A successful move refreshes through the data-change bus; a failed one never left the data
    },
  });

  const handlePrint = useCallback(() => {
    if (!printAgenda(allAppointments, viewMode, selectedDate)) {
      toast.error('No se pudo abrir la vista de impresión (revisa el bloqueador de ventanas emergentes)');
    }
  }, [allAppointments, viewMode, selectedDate, toast]);

  const handleExport = useCallback(async () => {
    try {
      const n = await exportAgenda(allAppointments, viewMode, selectedDate);
      toast.success(`${n} cita${n === 1 ? '' : 's'} exportada${n === 1 ? '' : 's'}`);
    } catch (e: any) {
      toast.error(e?.message || 'No se pudo exportar la agenda');
    }
  }, [allAppointments, viewMode, selectedDate, toast]);

  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

  const handleContextMenu = useCallback((appointment: EnrichedAppointment, x: number, y: number) => {
    setContextMenu({ visible: true, x, y, appointment });
  }, []);

  const handleContextAction = useCallback((key: string) => {
    if (!contextMenu.appointment) return;
    const apt = contextMenu.appointment;
    switch (key) {
      case 'detail': setDetailModal({ visible: true, appointment: apt }); break;
      case 'open_chart': quickActions.openChart(apt); break;
      case 'register': quickActions.registerConsultation(apt); break;
      case 'hospitalize': quickActions.hospitalize(apt); break;
      case 'followup': quickActions.scheduleFollowup(apt); break;
      case 'charge': quickActions.charge(apt); break;
      case 'edit': quickActions.edit(apt); break;
      case 'reschedule': quickActions.reschedule(apt); break;
      case 'cancel': quickActions.cancel(apt); break;
      case 'delete': quickActions.remove(apt); break;
    }
    setContextMenu({ visible: false, x: 0, y: 0, appointment: null });
  }, [contextMenu.appointment, quickActions]);

  const closeContextMenu = useCallback(() => {
    setContextMenu({ visible: false, x: 0, y: 0, appointment: null });
  }, []);

  const handleStatusChange = useCallback(async (appointmentId: string, newStatus: string) => {
    try {
      await api.appointments.update(appointmentId, { status: newStatus });
      setDetailModal(prev => prev.appointment?.id === appointmentId
        ? { ...prev, appointment: { ...prev.appointment, status: newStatus } }
        : prev
      );
    } catch (err: any) {
      // e.g. "Transición inválida: completada -> en_espera" from the server
      toast.error(err?.message || 'No se pudo cambiar el estado');
    }
  }, [refetch, toast]);

  const handleSlotPress = useCallback((date: Date, hour: number) => {
    setCreationModal({ visible: true, initialDate: date, initialHour: hour });
  }, []);

  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const sidebarWidth = isDesktop ? 320 : 0;
  const showSidebar = isDesktop;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <AgendaToolbar
        selectedDate={selectedDate}
        viewMode={viewMode}
        onDateChange={setSelectedDate}
        onViewChange={setViewMode}
        onNewAppointment={() => {
          const now = new Date();
          const nextHour = Math.min(now.getHours() + 1, 19);
          setCreationModal({ visible: true, initialDate: now, initialHour: nextHour });
        }}
        onNewPatient={() => router.push('/(drawer)/add-paciente')}
        onFilterPress={isMobile ? () => setMobileSidebarVisible(true) : undefined}
        onPrint={handlePrint}
        onExport={handleExport}
        isMobile={isMobile}
      />
      {loadError ? (
        <View accessibilityRole="alert" style={[styles.errorBanner, { backgroundColor: colors.error + '14', borderColor: colors.error + '55' }]}>
          <Text style={{ color: colors.text, flex: 1 }}>No se pudo cargar la agenda: {loadError}</Text>
          <Text onPress={() => refetch()} accessibilityRole="button" style={{ color: colors.primary, fontWeight: '600' }}>Reintentar</Text>
        </View>
      ) : null}
      <View style={styles.contentArea}>
        <View
          style={[styles.mainContent, showSidebar && { flex: 1 }]}
          onLayout={(e) => setMainWidth(e.nativeEvent.layout.width)}
        >
          {viewMode === 'week' && (
            <WeekView
              weekDays={weekDays}
              appointments={appointments}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              onAppointmentPress={handleAppointmentPress}
              onAppointmentContextMenu={handleContextMenu}
              onStatusChange={handleStatusChange}
              onSlotPress={handleSlotPress}
              onDragStart={onDragStart}
              onDragMove={onDragMove}
              onDragEnd={onDragEnd}
              dragState={dragState}
              loading={loading}
              availableWidth={mainWidth}
            />
          )}
          {viewMode === 'day' && (
            <DayView
              date={selectedDate}
              appointments={appointments}
              onAppointmentPress={handleAppointmentPress}
              onAppointmentContextMenu={handleContextMenu}
              onStatusChange={handleStatusChange}
              onSlotPress={handleSlotPress}
              onDragStart={onDragStart}
              onDragMove={onDragMove}
              onDragEnd={onDragEnd}
              dragState={dragState}
              loading={loading}
              columnWidth={Math.max(200, (mainWidth ?? (showSidebar ? screenWidth - sidebarWidth : screenWidth)) - 44)}
            />
          )}
          {viewMode === 'month' && (
            <MonthView
              selectedDate={selectedDate}
              appointments={appointments}
              onDateSelect={setSelectedDate}
              onAppointmentPress={handleAppointmentPress}
              loading={loading}
            />
          )}
        </View>
        {showSidebar && (
          <View style={[styles.sidebar, { width: sidebarWidth, borderLeftColor: colors.border }]}>
            <AgendaSidebar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              filters={filters}
              onFilterChange={setFilters}
              veterinarians={veterinarians}
              appointmentTypes={['consulta', 'vacuna', 'cirugia', 'control', 'terreno', 'examenes', 'hospitalizacion']}
              statuses={['programada', 'confirmada', 'en_espera', 'en_consulta', 'completada', 'cancelada', 'ausente']}
            />
            {summary && (
              <View style={styles.summaryContainer}>
                <DaySummary summary={summary} />
              </View>
            )}
          </View>
        )}
      </View>
      <AppointmentEditSheet
        visible={editor.visible}
        mode={editor.mode}
        appointment={editor.appointment}
        onClose={() => setEditor(prev => ({ ...prev, visible: false }))}
        onSaved={() => {
          toast.success(editor.mode === 'followup' ? 'Control agendado' : editor.mode === 'reschedule' ? 'Cita reprogramada' : 'Cita actualizada');
        }}
      />
      <PaymentForm
        visible={payment.visible}
        onClose={() => setPayment({ visible: false, appointment: null })}
        onPaid={() => toast.success('Cobro registrado')}
        appointmentId={payment.appointment?.id}
        petId={payment.appointment?.pet_id || undefined}
      />
      <ContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        onAction={handleContextAction}
        onClose={closeContextMenu}
      />

<AppointmentDetailModal
          visible={detailModal.visible}
          appointment={detailModal.appointment}
          onClose={() => setDetailModal({ visible: false, appointment: null })}
          onGoToPatient={() => {
            if (detailModal.appointment?.pet_id) {
              router.push(`/pet/${detailModal.appointment.pet_id}`);
            }
            setDetailModal({ visible: false, appointment: null });
          }}
          onRegisterPatient={() => {
            router.push({ pathname: '/(drawer)/add-paciente', params: { prefillName: detailModal.appointment?.patient_name || '' } });
            setDetailModal({ visible: false, appointment: null });
          }}
          onStatusChange={handleStatusChange}
        />

      <AppointmentCreationModal
        visible={creationModal.visible}
        initialDate={creationModal.initialDate}
        initialHour={creationModal.initialHour}
        onClose={() => setCreationModal({ visible: false, initialDate: new Date(), initialHour: 9 })}
        onCreated={refetch}
      />

      {/* Mobile Sidebar Overlay */}
      {isMobile && mobileSidebarVisible && (
        <View style={styles.sidebarOverlay}>
          <Pressable style={styles.sidebarOverlayBg} onPress={() => setMobileSidebarVisible(false)} accessibilityLabel="Cerrar filtros" />
          <View style={[styles.mobileSidebar, { backgroundColor: colors.surface, borderLeftColor: colors.border }]}>
            <AgendaSidebar
              selectedDate={selectedDate}
              onDateSelect={(date) => {
                setSelectedDate(date);
                setMobileSidebarVisible(false);
              }}
              filters={filters}
              onFilterChange={setFilters}
              veterinarians={veterinarians}
              appointmentTypes={['consulta', 'vacuna', 'cirugia', 'control', 'terreno', 'examenes', 'hospitalizacion']}
              statuses={['programada', 'confirmada', 'en_espera', 'en_consulta', 'completada', 'cancelada', 'ausente']}
            />
            {summary && (
              <View style={styles.summaryContainer}>
                <DaySummary summary={summary} />
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

export default function AgendaScreen() {
  return (
    <AgendaErrorBoundary>
      <AgendaContent />
    </AgendaErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentArea: {
    flex: 1,
    flexDirection: 'row',
  },
  mainContent: {
    flex: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  sidebar: {
    borderLeftWidth: 1,
  },
  summaryContainer: {
    padding: 12,
  },
  sidebarOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  sidebarOverlayBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  mobileSidebar: {
    width: 320,
    height: '100%',
    borderLeftWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
});
