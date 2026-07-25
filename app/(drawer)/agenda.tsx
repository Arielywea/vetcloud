import React, { useState, useCallback, useMemo, Component, ReactNode } from 'react';
import { View, StyleSheet, Dimensions, Platform, Text } from 'react-native';
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
import AppointmentTooltip from '../../components/agenda/AppointmentTooltip';

// Hooks
import useAgendaData from '../../components/agenda/useAgendaData';
import useAgendaLayout from '../../components/agenda/useAgendaLayout';
import useQuickActions from '../../components/agenda/useQuickActions';
import useDragDrop from '../../components/agenda/useDragDrop';

// Theme
import { useTheme } from '../../contexts/ThemeContext';

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
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#EF4444', marginBottom: 8 }}>Error en Agenda</Text>
          <Text style={{ fontSize: 14, color: '#1A2332', textAlign: 'center' }}>{this.state.error.message}</Text>
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
  const screenWidth = Dimensions.get('window').width;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, appointment: null as EnrichedAppointment | null });
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, appointment: null as EnrichedAppointment | null });
  const [filters, setFilters] = useState({ veterinarian: '', species: '', appointmentType: '', status: '' });

  const { appointments, loading, summary, refetch } = useAgendaData({
    selectedDate,
    searchQuery,
    filters,
  });

  const { nextAppointment, delayedAppointments, totalGridHeight } = useAgendaLayout({
    appointments,
    selectedDate,
  });

  const quickActions = useQuickActions({ onRefresh: refetch });

  const { dragState, onDragStart, onDragMove, onDragEnd, ghostStyle } = useDragDrop({
    onMove: (id, newStart, newEnd) => {
      console.log('Move appointment', id, newStart, newEnd);
      refetch();
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

  const sidebarWidth = screenWidth > 1200 ? 280 : 0;
  const showSidebar = screenWidth > 1200;
  const mainContentWidth = showSidebar ? screenWidth - sidebarWidth : screenWidth;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <AgendaToolbar
        selectedDate={selectedDate}
        viewMode={viewMode}
        onDateChange={setSelectedDate}
        onViewChange={setViewMode}
        onNewAppointment={() => console.log('New appointment')}
        onNewPatient={() => console.log('New patient')}
        onPrint={() => console.log('Print')}
        onExport={() => console.log('Export')}
      />
      <View style={styles.contentArea}>
        <View style={[styles.mainContent, { width: mainContentWidth }]}>
          {viewMode === 'week' && (
            <WeekView
              weekDays={weekDays}
              appointments={appointments}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              onAppointmentPress={(apt) => { if (apt.pet_id) router.push(`/pet/${apt.pet_id}`); }}
              onAppointmentContextMenu={handleContextMenu}
              loading={loading}
            />
          )}
          {viewMode === 'day' && (
            <DayView
              date={selectedDate}
              appointments={appointments}
              onAppointmentPress={(apt) => { if (apt.pet_id) router.push(`/pet/${apt.pet_id}`); }}
              onAppointmentContextMenu={handleContextMenu}
              loading={loading}
              columnWidth={mainContentWidth - 44}
            />
          )}
          {viewMode === 'month' && (
            <MonthView
              selectedDate={selectedDate}
              appointments={appointments}
              onDateSelect={setSelectedDate}
              onAppointmentPress={(apt) => { if (apt.pet_id) router.push(`/pet/${apt.pet_id}`); }}
              loading={loading}
            />
          )}
        </View>
        {showSidebar && (
          <View style={[styles.sidebar, { width: sidebarWidth }]}>
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
      <AppointmentTooltip
        appointment={tooltip.appointment!}
        visible={tooltip.visible}
        x={tooltip.x}
        y={tooltip.y}
      />
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
    borderLeftColor: '#E5E9F0',
  },
  summaryContainer: {
    padding: 12,
  },
});
