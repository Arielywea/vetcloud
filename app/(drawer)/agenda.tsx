import React, { useState, useCallback, useMemo, Component, ReactNode } from 'react';
import { View, StyleSheet, Platform, Text, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

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
  const day = start.getDay();
  start.setDate(start.getDate() - day + 1);
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
  const { width: screenWidth } = useWindowDimensions();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, appointment: null as EnrichedAppointment | null });
  
  const [filters, setFilters] = useState({ veterinarian: '', species: '', appointmentType: '', status: '' });
  const [detailModal, setDetailModal] = useState({ visible: false, appointment: null as AppointmentDetail | null });
  const [creationModal, setCreationModal] = useState({ visible: false, initialDate: new Date(), initialHour: 9 });

  const { appointments, loading, summary, refetch } = useAgendaData({
    selectedDate,
    searchQuery,
    filters,
  });

  const { nextAppointment, delayedAppointments, totalGridHeight } = useAgendaLayout({
    appointments,
    selectedDate,
  });

  const handleAppointmentPress = useCallback((apt: any) => {
    setDetailModal({ visible: true, appointment: apt });
  }, []);

  const quickActions = useQuickActions({ onRefresh: refetch });

  const { dragState, onDragStart, onDragMove, onDragEnd, ghostStyle } = useDragDrop({
    onMove: async (id, newStart, newEnd) => {
      try {
        await api.appointments.update(id, {
          start_time: newStart.toISOString(),
          end_time: newEnd.toISOString(),
        });
        refetch();
      } catch (err) {
        console.error('Failed to move appointment:', err);
        refetch();
      }
    },
  });

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

  const handleSlotPress = useCallback((date: Date, hour: number) => {
    setCreationModal({ visible: true, initialDate: date, initialHour: hour });
  }, []);

  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const isMobile = screenWidth < 768;
  const isDesktop = screenWidth > 1200;
  const sidebarWidth = isDesktop ? 320 : 0;
  const showSidebar = isDesktop;
  const mainContentWidth = showSidebar ? screenWidth - sidebarWidth : screenWidth;

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
        onPrint={() => {}}
        onExport={() => {}}
        isMobile={isMobile}
      />
      <View style={styles.contentArea}>
        <View style={[styles.mainContent, { width: mainContentWidth }]}>
          {viewMode === 'week' && (
            <WeekView
              weekDays={weekDays}
              appointments={appointments}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              onAppointmentPress={handleAppointmentPress}
              onAppointmentContextMenu={handleContextMenu}
              onSlotPress={handleSlotPress}
              onDragStart={onDragStart}
              onDragMove={onDragMove}
              onDragEnd={onDragEnd}
              dragState={dragState}
              loading={loading}
            />
          )}
          {viewMode === 'day' && (
            <DayView
              date={selectedDate}
              appointments={appointments}
              onAppointmentPress={handleAppointmentPress}
              onAppointmentContextMenu={handleContextMenu}
              onSlotPress={handleSlotPress}
              onDragStart={onDragStart}
              onDragMove={onDragMove}
              onDragEnd={onDragEnd}
              dragState={dragState}
              loading={loading}
              columnWidth={mainContentWidth - 44}
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
              veterinarians={[]}
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
          <View style={styles.sidebarOverlayBg} onTouchEnd={() => setMobileSidebarVisible(false)} />
          <View style={[styles.mobileSidebar, { backgroundColor: colors.surface }]}>
            <AgendaSidebar
              selectedDate={selectedDate}
              onDateSelect={(date) => {
                setSelectedDate(date);
                setMobileSidebarVisible(false);
              }}
              filters={filters}
              onFilterChange={setFilters}
              veterinarians={[]}
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
    borderLeftColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
});
