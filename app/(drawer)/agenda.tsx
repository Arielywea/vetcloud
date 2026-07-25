import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Components
import AgendaHeader from '../../components/agenda/AgendaHeader';
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
  start.setDate(start.getDate() - day + 1); // Monday
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

export default function AgendaScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get('window').width;

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, appointment: null as EnrichedAppointment | null });
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, appointment: null as EnrichedAppointment | null });
  const [filters, setFilters] = useState({ veterinarian: '', species: '', appointmentType: '', status: '' });

  // Data
  const { appointments, loading, summary, refetch } = useAgendaData({
    selectedDate,
    searchQuery,
    filters,
  });

  // Layout
  const { nextAppointment, delayedAppointments, totalGridHeight } = useAgendaLayout({
    appointments,
    selectedDate,
  });

  // Quick actions
  const quickActions = useQuickActions({ onRefresh: refetch });

  // Drag and drop
  const { dragState, onDragStart, onDragMove, onDragEnd, ghostStyle } = useDragDrop({
    onMove: (id, newStart, newEnd) => {
      // TODO: call API to update appointment time
      console.log('Move appointment', id, newStart, newEnd);
      refetch();
    },
  });

  // Week days
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

  // Context menu handler
  const handleContextMenu = useCallback((appointment: EnrichedAppointment, x: number, y: number) => {
    setContextMenu({ visible: true, x, y, appointment });
  }, []);

  // Context menu action handler
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

  // Close context menu
  const closeContextMenu = useCallback(() => {
    setContextMenu({ visible: false, x: 0, y: 0, appointment: null });
  }, []);

  // Close tooltip
  const closeTooltip = useCallback(() => {
    setTooltip({ visible: false, x: 0, y: 0, appointment: null });
  }, []);

  // Sidebar width
  const sidebarWidth = screenWidth > 1200 ? 280 : 0;
  const showSidebar = screenWidth > 1200;
  const mainContentWidth = showSidebar ? screenWidth - sidebarWidth : screenWidth;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <AgendaHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        vetName="Dr. Veterinario"
        clinicOpen={true}
      />

      {/* Toolbar */}
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

      {/* Main content area */}
      <View style={styles.contentArea}>
        {/* Calendar view */}
        <View style={[styles.mainContent, { width: mainContentWidth }]}>
          {viewMode === 'week' && (
            <WeekView
              weekDays={weekDays}
              appointments={appointments}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              onAppointmentPress={(apt) => console.log('Press', apt)}
              onAppointmentContextMenu={handleContextMenu}
              loading={loading}
            />
          )}
          {viewMode === 'day' && (
            <DayView
              date={selectedDate}
              appointments={appointments}
              onAppointmentPress={(apt) => console.log('Press', apt)}
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
              onAppointmentPress={(apt) => console.log('Press', apt)}
              loading={loading}
            />
          )}
        </View>

        {/* Sidebar (desktop only) */}
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

      {/* Context Menu */}
      <ContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        onAction={handleContextAction}
        onClose={closeContextMenu}
      />

      {/* Tooltip */}
      <AppointmentTooltip
        appointment={tooltip.appointment!}
        visible={tooltip.visible}
        x={tooltip.x}
        y={tooltip.y}
      />
    </View>
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
