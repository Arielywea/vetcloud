import React, { useMemo, useEffect, useRef, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Image, ImageStyle, useWindowDimensions, Animated, Easing } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, CheckCircle, User, CalendarDays, ChevronRight, Users, AlertTriangle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { usePets, useAppointments, useClinicalRecords, useInventory, useRefreshOn } from '../../hooks/useDirectus';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, SHADOWS, TYPOGRAPHY, ANIMATION, alpha } from '../../constants/tokens';
import VetCloudIcon from '../../components/icons/VetCloudIcon';
import CrestStar from '../../components/icons/CrestStar';
import DisplayText from '../../components/ui/DisplayText';
import NextAppointmentCard from '../../components/dashboard/NextAppointmentCard';
import PatientList from '../../components/dashboard/PatientList';
import StatsChart, { WeeklyDay, WeeklySummary } from '../../components/dashboard/StatsChart';
import { api } from '../../services/directus';
import { isSameLocalDay } from '../../utils/date';

const APPOINTMENT_TYPE_LABELS: Record<string, string> = {
  consulta: 'Consulta', vacuna: 'Vacuna', examenes: 'Exámenes', cirugia: 'Cirugía',
  hospitalizacion: 'Hospitalización', control: 'Control', terreno: 'Terreno',
};
import QuickActions from '../../components/dashboard/QuickActions';
import InventoryBar from '../../components/dashboard/InventoryBar';
import ActivityFeed from '../../components/dashboard/ActivityFeed';

function calculateAge(birthDate: string): string {
  const birth = new Date(birthDate);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  if (years > 0) return `${years} año${years > 1 ? 's' : ''}`;
  if (months > 0) return `${months} mes${months > 1 ? 'es' : ''}`;
  return '< 1 mes';
}

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


function BannerIllustration({ isMobile }: { isMobile: boolean }) {
  return (
    <Image
      source={require('../../assets/banner.png')}
      style={{ width: isMobile ? 140 : 280, height: isMobile ? 140 : 280, position: 'absolute', right: 0, bottom: 0 } as ImageStyle}
      resizeMode="cover"
    />
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, isDark, onChromeText } = useTheme();
  const iconTint = colors.primary;
  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const { pets, loading: loadingPets, error: petsError, refresh: refreshPets } = usePets();
  const { appointments, loading: loadingAppointments, error: appointmentsError, refresh: refreshAppointments } = useAppointments();
  const { records: clinicalRecords, loading: loadingRecords, error: recordsError, refresh: refreshRecords } = useClinicalRecords();
  const { items: inventoryItems, lowStockItems, loading: loadingInventory, error: inventoryError, refresh: refreshInventory } = useInventory();

  const isLoading = loadingPets || loadingAppointments || loadingRecords || loadingInventory;
  const loadErrors = [petsError, appointmentsError, recordsError, inventoryError].filter(Boolean);

  // Server-side stats (local-time days, real week-over-week trend, active hospitalizations)
  const [weekly, setWeekly] = useState<{ days: WeeklyDay[]; summary: WeeklySummary | null }>({ days: [], summary: null });
  const [activeHospitalizations, setActiveHospitalizations] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);
  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);
  const loadStats = useCallback(() => {
    Promise.all([api.stats.weekly(), api.stats.dashboard()])
      .then(([w, d]: any[]) => {
        if (!mountedRef.current) return;
        setWeekly({ days: w?.days || [], summary: w?.summary || null });
        setActiveHospitalizations(d?.activeHospitalizations || 0);
      })
      .catch(() => { /* the cards show "—"; the error banner covers the main data */ })
      .finally(() => { if (mountedRef.current) setStatsLoading(false); });
  }, []);
  useEffect(() => { loadStats(); }, [loadStats]);
  useRefreshOn(['appointments', 'clinical_records', 'pets', 'hospitalizations'], loadStats);

  // ─── Entrance Animations ──────────────────────────────
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const heroOpacity = contentOpacity;
  const heroY = useRef(new Animated.Value(0)).current;
  const statCardAnims = useRef(
    Array.from({ length: 4 }, () => ({
      opacity: contentOpacity,
      translateY: new Animated.Value(0),
    }))
  ).current;
  const row3Opacity = contentOpacity;
  const row3Y = useRef(new Animated.Value(0)).current;
  const row4Opacity = contentOpacity;
  const row4Y = useRef(new Animated.Value(0)).current;


  useEffect(() => {
    if (isLoading) return;
    // One quiet fade when data arrives. This screen opens many times a day,
    // so no staggered choreography and no count-up numbers.
    Animated.timing(contentOpacity, { toValue: 1, duration: 180, easing: Easing.bezier(0.23, 1, 0.32, 1), useNativeDriver: true }).start();
  }, [isLoading]);

  const todayStr = new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });

  // "Today" in local time (toISOString is UTC: after ~20:00 in Chile it was already tomorrow)
  const todayAppointments = useMemo(
    () => appointments.filter(a => a.start_time && isSameLocalDay(a.start_time) && !['cancelada', 'ausente'].includes(a.status as string)),
    [appointments],
  );

  // Next appointment = the earliest one today that hasn't finished yet
  const nextAppointment = useMemo(() => {
    const cutoff = Date.now() - 30 * 60 * 1000;
    const upcoming = todayAppointments
      .filter(a => !['completada'].includes(a.status as string) && new Date(a.start_time).getTime() >= cutoff)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    const apt = upcoming[0];
    if (!apt) return { hasAppointment: false, petName: '', petBreed: '', petAge: '', time: '', type: '', petId: null as string | null };
    const matchedPet = apt.pet_id ? pets.find(p => p.id === apt.pet_id) : null;
    return {
      hasAppointment: true,
      petName: apt.patient_name || 'Sin nombre',
      petBreed: matchedPet?.breed || '',
      petAge: matchedPet?.birth_date ? calculateAge(matchedPet.birth_date) : '',
      time: new Date(apt.start_time).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
      type: APPOINTMENT_TYPE_LABELS[apt.appointment_type as string] || 'Consulta',
      petId: (apt.pet_id as string) || null,
    };
  }, [todayAppointments, pets]);

  // Latest record per pet computed once (the old sort re-filtered all records inside the comparator)
  const lastRecordByPet = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of clinicalRecords) {
      const prev = map.get(r.pet_id);
      if (!prev || new Date(r.date) > new Date(prev)) map.set(r.pet_id, r.date);
    }
    return map;
  }, [clinicalRecords]);

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

    [...clinicalRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3).forEach(record => {
      const pet = pets.find(p => p.id === record.pet_id);
      const typeLabel = record.record_type.charAt(0).toUpperCase() + record.record_type.slice(1);
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
  }, [clinicalRecords, appointments, pets, colors]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {loadErrors.length > 0 && !isLoading && (
        <View accessibilityRole="alert" style={[styles.errorBanner, { backgroundColor: alpha(colors.error, 0.08), borderColor: alpha(colors.error, 0.3) }]}>
          <AlertTriangle size={16} color={colors.error} />
          <Text style={{ color: colors.text, flex: 1 }}>
            Parte de la información no se pudo cargar ({loadErrors[0]}). Las cifras pueden estar incompletas.
          </Text>
          <Pressable
            onPress={() => { refreshPets(); refreshAppointments(); refreshRecords(); refreshInventory(); }}
            accessibilityRole="button"
            style={[styles.retryBtn, { borderColor: colors.border }]}
          >
            <Text style={{ color: colors.primary, fontWeight: '600' }}>Reintentar</Text>
          </Pressable>
        </View>
      )}

      {/* Row 1: Hero + Próxima Cita */}
      <Animated.View style={[styles.topRow, isMobile && styles.topRowMobile, { opacity: heroOpacity, transform: [{ translateY: heroY }] }]}>
        <LinearGradient
          colors={[colors.chrome, colors.chromeSoft]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, isMobile && styles.heroMobile]}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroGreetingRow}>
              <CrestStar size={12} color={isDark ? colors.primary : colors.accent} />
              <Text style={[styles.heroGreeting, { color: onChromeText.muted }]}>{getGreeting()}</Text>
            </View>
            <DisplayText style={[styles.heroName, { color: onChromeText.default }, isMobile && styles.heroNameMobile]}>
              Hola, {user?.name?.split(' ')[0] || 'Usuario'}
            </DisplayText>
            <View style={styles.heroStatsRow}>
              <View style={styles.heroStatBadge}>
                <CalendarDays size={12} color={onChromeText.default} />
                <Text style={[styles.heroStatText, { color: onChromeText.default }]}>{todayAppointments.length} citas hoy</Text>
              </View>
              <View style={styles.heroStatBadge}>
                <Users size={12} color={onChromeText.default} />
                <Text style={[styles.heroStatText, { color: onChromeText.default }]}>{pets.length} pacientes</Text>
              </View>
            </View>
            <Pressable
              onPress={() => router.push('/(drawer)/agenda')}
              style={[styles.heroButton, { backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.25)' }, isMobile && styles.heroButtonMobile]}
            >
              <CalendarDays size={14} color={onChromeText.default} />
              <Text style={[styles.heroButtonText, { color: onChromeText.default }]}>Ver agenda del día</Text>
              <ChevronRight size={14} color={onChromeText.muted} />
            </Pressable>
          </View>
          <BannerIllustration isMobile={isMobile} />
        </LinearGradient>
        <NextAppointmentCard
          {...nextAppointment}
          onViewDetails={() => router.push('/(drawer)/agenda')}
          onStartConsult={() => nextAppointment.petId ? router.push(`/pet/${nextAppointment.petId}` as any) : router.push('/(drawer)/agenda')}
        />
      </Animated.View>

      {/* Row 2: Stats Cards */}
      <View style={[styles.statsRow, isMobile && styles.statsRowMobile]}>
        {[{ icon: 'pacientes' as const, color: iconTint, bg: colors.primaryContainer, value: pets.length, label: 'Pacientes', anim: statCardAnims[0] },
          { icon: 'agenda' as const, color: iconTint, bg: colors.primaryContainer, value: todayAppointments.length, label: 'Citas Hoy', anim: statCardAnims[1] },
          { icon: 'fichas' as const, color: iconTint, bg: colors.primaryContainer, value: clinicalRecords.length, label: 'Fichas Clínicas', anim: statCardAnims[2] },
          { icon: 'inventario' as const, color: lowStockItems.length ? colors.warning : iconTint, bg: lowStockItems.length ? colors.warning + '18' : colors.primaryContainer, value: lowStockItems.length, label: 'Alertas Stock', anim: statCardAnims[3] }
        ].map((stat, i) => (
          <Animated.View key={i} style={[styles.statCard, { backgroundColor: colors.surface }, SHADOWS.xs, isMobile && styles.statCardMobile, { opacity: stat.anim.opacity, transform: [{ translateY: stat.anim.translateY }] }]}>
            <View style={[styles.statIcon, { backgroundColor: stat.bg }]}>
              <VetCloudIcon name={stat.icon} size={24} color={stat.color} />
            </View>
            <Text {...({ dataSet: { numeric: "tabular" } } as any)} style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
          </Animated.View>
        ))}
      </View>

      {/* Row 3: Pacientes + Estadísticas + Acciones */}
      <Animated.View style={[styles.threeColRow, isMobile && styles.threeColRowMobile, { opacity: row3Opacity, transform: [{ translateY: row3Y }] }]}>
        <View style={[styles.colLeft, isMobile && styles.colMobile]}>
          <PatientList
            patients={recentPatients}
            onViewAll={() => router.push('/(drawer)/pacientes')}
            onPatientPress={(id: string) => router.push(`/pet/${id}` as any)}
          />
        </View>
        <View style={[styles.colCenter, isMobile && styles.colMobile]}>
          <StatsChart
            days={weekly.days}
            summary={weekly.summary}
            pacientesNuevos={newPetsThisMonth}
            hospitalizados={activeHospitalizations}
            loading={statsLoading}
          />
        </View>
        <View style={[styles.colRight, isMobile && styles.colMobile]}>
          <QuickActions />
        </View>
      </Animated.View>

      {/* Row 4: Inventario + Actividad */}
      <Animated.View style={[styles.twoColRow, isMobile && styles.twoColRowMobile, { opacity: row4Opacity, transform: [{ translateY: row4Y }] }]}>
        <View style={[styles.colHalf, isMobile && styles.colMobile]}>
          <InventoryBar items={groupedInventory} />
        </View>
        <View style={[styles.colHalf, isMobile && styles.colMobile]}>
          <ActivityFeed items={activityItems} />
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: SPACING['4xl'] },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginHorizontal: SPACING.xl, marginTop: SPACING.lg, padding: SPACING.md, borderRadius: 10, borderWidth: 1 },
  retryBtn: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 2, borderRadius: RADIUS.md, borderWidth: 1 },

  topRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
    gap: SPACING.lg,
  },
  topRowMobile: {
    flexDirection: 'column',
    paddingHorizontal: SPACING.md,
  },
  hero: {
    flex: 1.5,
    borderRadius: RADIUS.xl,
    padding: SPACING['2xl'],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    overflow: 'hidden',
    position: 'relative',
  },
  heroMobile: {
    padding: SPACING.lg,
    minHeight: 200,
  },
  heroContent: {
    flex: 1,
    gap: SPACING.sm,
  },
  heroGreetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  heroGreeting: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.regular,
  },
  heroName: { fontSize: 28, fontWeight: '600' },
  heroNameMobile: { fontSize: TYPOGRAPHY.sizes.xl },
  heroStatsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  heroStatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 1,
    borderRadius: RADIUS.full,
  },
  heroStatText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  heroButtonMobile: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  heroButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
    gap: SPACING.lg,
  },
  statsRowMobile: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  statCardMobile: {
    flexBasis: '48%',
    padding: SPACING.md,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  statValue: { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.bold },
  statLabel: { fontSize: TYPOGRAPHY.sizes.xs, marginTop: SPACING.xs, fontWeight: TYPOGRAPHY.weights.semibold },

  threeColRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
    gap: SPACING.lg,
  },
  threeColRowMobile: {
    flexDirection: 'column',
    paddingHorizontal: SPACING.md,
  },
  colLeft: { flex: 1 },
  colCenter: { flex: 1 },
  colRight: { flex: 1 },
  colMobile: { flex: undefined },

  twoColRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
    gap: SPACING.lg,
  },
  twoColRowMobile: {
    flexDirection: 'column',
    paddingHorizontal: SPACING.md,
  },
  colHalf: { flex: 1 },
});
