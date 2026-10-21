import React, { useMemo, useEffect, useRef, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Image, ImageStyle, useWindowDimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { Calendar, CheckCircle, User, CalendarDays, ChevronRight, Users, AlertTriangle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { usePets, useAppointments, useInventory, useRefreshOn } from '../../hooks/useDirectus';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, SHADOWS, TYPOGRAPHY, ANIMATION, BREAKPOINTS, alpha } from '../../constants/tokens';
import VetCloudIcon from '../../components/icons/VetCloudIcon';
import CrestStar from '../../components/icons/CrestStar';
import DisplayText from '../../components/ui/DisplayText';
import TodayTable from '../../components/dashboard/TodayTable';
import PatientList from '../../components/dashboard/PatientList';
import StatsChart, { WeeklyDay, WeeklySummary } from '../../components/dashboard/StatsChart';
import { api } from '../../services/directus';
import { isSameLocalDay } from '../../utils/date';

// "Dra. Ginebra Pendragon" → "Ginebra": skip honorifics so the greeting uses the name
const HONORIFICS = /^(dr|dra|doctor|doctora|mv|m\.v|sr|sra|srta)\.?$/i;
function firstName(name?: string | null) {
  const words = (name || '').trim().split(/\s+/).filter(Boolean);
  return words.find((w) => !HONORIFICS.test(w)) || words[0] || '';
}

import InventoryBar from '../../components/dashboard/InventoryBar';
import ActivityFeed from '../../components/dashboard/ActivityFeed';

function relativeTime(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);
  if (diffMin < 1) return 'Ahora mismo';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHrs < 24) return `Hace ${diffHrs}h`;
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}


// The crest artwork, whole (contain, not cropped), sitting in the chief like a charge on a shield
function BannerIllustration({ isMobile }: { isMobile: boolean }) {
  return (
    <Image
      source={require('../../assets/banner.png')}
      style={{ width: isMobile ? 160 : 340, height: isMobile ? 120 : 254, position: 'absolute', right: SPACING.lg, bottom: 0 } as ImageStyle}
      resizeMode="contain"
      accessibilityIgnoresInvertColors
    />
  );
}

type RecentRecord = { id: string; pet_id: string; record_type: string; date: string; created_at: string };
type DashboardStats = {
  totalRecords: number;
  activeHospitalizations: number;
  lastVisitByPet: Record<string, string>;
  recentRecords: RecentRecord[];
};
const EMPTY_DASHBOARD: DashboardStats = { totalRecords: 0, activeHospitalizations: 0, lastVisitByPet: {}, recentRecords: [] };

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, isDark, onChromeText } = useTheme();
  const gold = isDark ? colors.primary : colors.accent;
  const { width } = useWindowDimensions();
  const isMobile = width < BREAKPOINTS.sm;
  const { pets, loading: loadingPets, error: petsError, refresh: refreshPets } = usePets();
  const { appointments, loading: loadingAppointments, error: appointmentsError, refresh: refreshAppointments } = useAppointments();
  const { items: inventoryItems, lowStockItems, loading: loadingInventory, error: inventoryError, refresh: refreshInventory } = useInventory();

  // Server-side stats (local-time days, real week-over-week trend, active hospitalizations, and the
  // record counts/recency the dashboard needs, so it no longer downloads every clinical record)
  const [weekly, setWeekly] = useState<{ days: WeeklyDay[]; summary: WeeklySummary | null }>({ days: [], summary: null });
  const [dash, setDash] = useState<DashboardStats>(EMPTY_DASHBOARD);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const isLoading = loadingPets || loadingAppointments || loadingInventory || statsLoading;
  const loadErrors = [petsError, appointmentsError, statsError, inventoryError].filter(Boolean);
  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);
  const loadStats = useCallback(() => {
    Promise.all([api.stats.weekly(), api.stats.dashboard()])
      .then(([w, d]: any[]) => {
        if (!mountedRef.current) return;
        setWeekly({ days: w?.days || [], summary: w?.summary || null });
        setDash({
          totalRecords: d?.totalRecords || 0,
          activeHospitalizations: d?.activeHospitalizations || 0,
          lastVisitByPet: d?.lastVisitByPet || {},
          recentRecords: d?.recentRecords || [],
        });
        setStatsError(null);
      })
      .catch((e: any) => { if (mountedRef.current) setStatsError(e?.message || 'estadísticas'); })
      .finally(() => { if (mountedRef.current) setStatsLoading(false); });
  }, []);
  useEffect(() => { loadStats(); }, [loadStats]);
  useRefreshOn(['appointments', 'clinical_records', 'pets', 'hospitalizations'], loadStats);


  const todayStr = new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });


  // Every appointment of the day, cancelled ones included (they sit faint at the table)
  const todayAll = useMemo(() => appointments.filter(a => a.start_time && isSameLocalDay(a.start_time)), [appointments]);

  const lastRecordByPet = useMemo(() => new Map(Object.entries(dash.lastVisitByPet)), [dash.lastVisitByPet]);

  const recentPatients = useMemo(() => {
    const activity = (p: typeof pets[number]) => new Date(lastRecordByPet.get(p.id) || p.created_at || 0).getTime();
    return [...pets]
      .sort((a, b) => activity(b) - activity(a))
      .slice(0, 4)
      .map(p => {
        const last = lastRecordByPet.get(p.id);
        return {
          id: p.id,
          name: p.name,
          species: p.species === 'dog' ? 'Canino' : p.species === 'cat' ? 'Felino' : 'Otro',
          breed: p.breed || 'Mestizo',
          lastVisit: last
            ? new Date(last).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
            : 'Sin visitas',
        };
      });
  }, [pets, lastRecordByPet]);

  const newPetsThisMonth = useMemo(() => {
    const now = new Date();
    return pets.filter(p => {
      if (!p.created_at) return false;
      const d = new Date(p.created_at);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
  }, [pets]);

  const groupedInventory = useMemo(() => {
    const CATEGORY_MAP: Record<string, { label: string; iconName: string }> = {
      medicamento: { label: 'Medicamentos', iconName: 'pill' },
      vacuna: { label: 'Vacunas', iconName: 'syringe' },
      insumo: { label: 'Insumos', iconName: 'package' },
      material: { label: 'Material', iconName: 'scissors' },
    };

    const grouped = inventoryItems.reduce((acc, item) => {
      const cat = item.category || 'insumo';
      if (!acc[cat]) acc[cat] = { current: 0, min: 0 };
      acc[cat].current += item.current_stock;
      acc[cat].min += item.min_stock;
      return acc;
    }, {} as Record<string, { current: number; min: number }>);

    return Object.entries(grouped).map(([cat, data]) => ({
      label: CATEGORY_MAP[cat]?.label || cat,
      iconName: CATEGORY_MAP[cat]?.iconName || 'package',
      percentage: Math.min(100, Math.round((data.current / Math.max(data.min, 1)) * 100)),
    }));
  }, [inventoryItems]);

  const activityItems = useMemo(() => {
    const items: Array<{ id: string; icon: React.ReactNode; iconColor: string; iconBg: string; text: string; time: string; sortDate: string }> = [];

    dash.recentRecords.forEach(record => {
      const pet = pets.find(p => p.id === record.pet_id);
      const type = record.record_type || 'consulta';
      const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
      items.push({
        id: `cr-${record.id}`,
        icon: <CheckCircle size={14} color={colors.success} />,
        iconColor: colors.success,
        iconBg: colors.success + '18',
        text: `${typeLabel} realizada para "${pet?.name || 'Mascota'}"`,
        time: relativeTime(record.date || record.created_at),
        sortDate: record.date || record.created_at,
      });
    });

    // Most recently scheduled appointments (the unsorted list gave the two oldest)
    [...appointments].sort((a, b) => new Date(b.created_at || b.start_time).getTime() - new Date(a.created_at || a.start_time).getTime()).slice(0, 2).forEach(apt => {
      items.push({
        id: `apt-${apt.id}`,
        icon: <Calendar size={14} color={colors.info} />,
        iconColor: colors.info,
        iconBg: colors.info + '18',
        text: `Cita programada para "${apt.patient_name}"`,
        time: relativeTime(apt.start_time),
        sortDate: apt.start_time,
      });
    });

    if (pets.length > 0) {
      const newest = [...pets].sort((a, b) =>
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      )[0];
      items.push({
        id: `pet-${newest.id}`,
        icon: <User size={14} color={colors.accent} />,
        iconColor: colors.accent,
        iconBg: colors.accent + '18',
        text: `Nuevo paciente registrado: "${newest.name}"`,
        time: relativeTime(newest.created_at),
        sortDate: newest.created_at,
      });
    }

    return items
      .sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime())
      .slice(0, 5)
      .map(({ sortDate, ...rest }) => rest);
  }, [dash.recentRecords, appointments, pets, colors]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {loadErrors.length > 0 && !isLoading && (
        <View accessibilityRole="alert" style={[styles.errorBanner, { backgroundColor: alpha(colors.error, 0.08), borderColor: alpha(colors.error, 0.3) }]}>
          <AlertTriangle size={16} color={colors.error} />
          <Text style={{ color: colors.text, flex: 1 }}>
            Parte de la información no se pudo cargar ({loadErrors[0]}). Las cifras pueden estar incompletas.
          </Text>
          <Pressable
            onPress={() => { refreshPets(); refreshAppointments(); loadStats(); refreshInventory(); }}
            accessibilityRole="button"
            style={[styles.retryBtn, { borderColor: colors.border }]}
          >
            <Text style={{ color: colors.primary, fontWeight: '600' }}>Reintentar</Text>
          </Pressable>
        </View>
      )}

      {/* The chief: a flat navy band, as on a shield, with the day and the clinic's ledger */}
      <View style={[styles.chief, { backgroundColor: colors.chrome }, isMobile && styles.chiefMobile]}>
        <View style={styles.chiefText}>
          <Text style={[styles.greeting, { color: onChromeText.muted }]}>{getGreeting()},</Text>
          <DisplayText style={[styles.name, { color: onChromeText.default }, isMobile && styles.nameMobile]} numberOfLines={1}>
            {firstName(user?.name) || 'bienvenida'}
          </DisplayText>
          <Text style={[styles.date, { color: onChromeText.muted }]}>{todayStr.charAt(0).toUpperCase() + todayStr.slice(1)}</Text>

          {/* Ledger: the clinic's figures in Cormorant numerals, each one opening its book */}
          <View style={styles.ledger}>
            {[
              { value: pets.length, label: 'Pacientes', route: '/(drawer)/pacientes' },
              { value: dash.totalRecords, label: 'Fichas clínicas', route: '/(drawer)/pacientes' },
              { value: dash.activeHospitalizations, label: 'Hospitalizados', route: '/(drawer)/hospitalizacion' },
              { value: lowStockItems.length, label: 'Stock bajo', route: '/(drawer)/inventario', alert: lowStockItems.length > 0 },
            ].map((item) => (
              <Pressable
                key={item.label}
                onPress={() => router.push(item.route as any)}
                accessibilityRole="link"
                accessibilityLabel={`${item.value} ${item.label}`}
                style={({ pressed }) => [styles.ledgerItem, isMobile && styles.ledgerItemMobile, { opacity: pressed ? 0.75 : 1 }]}
              >
                <DisplayText accessibilityRole="text" style={[styles.ledgerValue, { color: item.alert ? colors.warning : gold }]}>
                  {statsLoading && item.label !== 'Pacientes' && item.label !== 'Stock bajo' ? '—' : String(item.value)}
                </DisplayText>
                <Text style={[styles.ledgerLabel, { color: onChromeText.muted }]}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        {!isMobile ? <BannerIllustration isMobile={false} /> : null}
      </View>

      {/* The day as the Round Table */}
      <View style={[styles.section, isMobile && styles.sectionMobile]}>
        <TodayTable appointments={todayAll as any} />
      </View>

      <View style={[styles.split, isMobile && styles.splitMobile]}>
        <View style={styles.splitCol}>
          <PatientList
            patients={recentPatients}
            onViewAll={() => router.push('/(drawer)/pacientes')}
            onPatientPress={(id: string) => router.push(`/pet/${id}` as any)}
          />
        </View>
        <View style={styles.splitCol}>
          <StatsChart
            days={weekly.days}
            summary={weekly.summary}
            pacientesNuevos={newPetsThisMonth}
            hospitalizados={dash.activeHospitalizations}
            loading={statsLoading}
          />
        </View>
      </View>

      <View style={[styles.split, isMobile && styles.splitMobile]}>
        <View style={styles.splitCol}>
          <InventoryBar items={groupedInventory} />
        </View>
        <View style={styles.splitCol}>
          <ActivityFeed items={activityItems} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: SPACING['4xl'] },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginHorizontal: SPACING.xl, marginTop: SPACING.lg, padding: SPACING.md, borderRadius: 2, borderWidth: 1 },
  retryBtn: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 2, borderRadius: RADIUS.md, borderWidth: 1 },

  chief: {
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING['2xl'],
    paddingTop: SPACING['2xl'],
    paddingBottom: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'flex-end',
    overflow: 'hidden',
    minHeight: 280,
  },
  chiefMobile: { marginHorizontal: 0, marginTop: 0, paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl, minHeight: 0 },
  chiefText: { flex: 1, zIndex: 1 },
  greeting: { fontSize: TYPOGRAPHY.sizes.base },
  name: { fontSize: 56, lineHeight: 60, fontWeight: '600', letterSpacing: -0.5 },
  nameMobile: { fontSize: 40, lineHeight: 44 },
  date: { fontSize: TYPOGRAPHY.sizes.base, marginTop: SPACING.xs },
  ledger: { flexDirection: 'row', flexWrap: 'wrap', columnGap: SPACING['2xl'], rowGap: SPACING.md, marginTop: SPACING['2xl'] },
  ledgerItem: { minWidth: 96, paddingVertical: SPACING.xs },
  // Phones: a 2 × 2 ledger instead of 3 + 1
  ledgerItemMobile: { width: '42%', minWidth: 0 },
  ledgerValue: { fontSize: 40, lineHeight: 44, fontWeight: '600' },
  ledgerLabel: { fontSize: TYPOGRAPHY.sizes.sm, marginTop: 2 },

  section: { marginHorizontal: SPACING.xl, marginTop: SPACING.xl },
  sectionMobile: { marginHorizontal: 0, marginTop: SPACING.sm },
  split: { flexDirection: 'row', gap: SPACING.xl, marginHorizontal: SPACING.xl, marginTop: SPACING.xl },
  splitMobile: { flexDirection: 'column', gap: SPACING.sm, marginHorizontal: 0, marginTop: SPACING.sm },
  splitCol: { flex: 1, minWidth: 0 },
});
