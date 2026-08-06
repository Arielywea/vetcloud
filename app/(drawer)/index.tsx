import React, { useMemo, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Image, ImageStyle, useWindowDimensions, Animated, Easing } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, CheckCircle, User, Sparkles, CalendarDays, ChevronRight, Users } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { usePets, useAppointments, useClinicalRecords, useInventory } from '../../hooks/useDirectus';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, SHADOWS, TYPOGRAPHY, ANIMATION } from '../../constants/tokens';
import { TEXT_ON_PRIMARY } from '../../constants/colors';
import VetCloudIcon from '../../components/icons/VetCloudIcon';
import NextAppointmentCard from '../../components/dashboard/NextAppointmentCard';
import PatientList from '../../components/dashboard/PatientList';
import StatsChart from '../../components/dashboard/StatsChart';
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

// Animated number display — renders Animated.Value as integer text
function AnimatedText({ value, style }: { value: Animated.Value; style?: any }) {
  const [display, setDisplay] = React.useState('0');
  React.useEffect(() => {
    const id = value.addListener(({ value: v }) => {
      setDisplay(String(Math.round(v)));
    });
    return () => value.removeListener(id);
  }, [value]);
  return <Text style={style}>{display}</Text>;
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
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const { pets, loading: loadingPets } = usePets();
  const { appointments, loading: loadingAppointments } = useAppointments();
  const { records: clinicalRecords, loading: loadingRecords } = useClinicalRecords();
  const { items: inventoryItems, lowStockItems, loading: loadingInventory } = useInventory();

  const isLoading = loadingPets || loadingAppointments || loadingRecords || loadingInventory;

  // ─── Entrance Animations ──────────────────────────────
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroY = useRef(new Animated.Value(16)).current;
  const statCardAnims = useRef(
    Array.from({ length: 4 }, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(16),
    }))
  ).current;
  const row3Opacity = useRef(new Animated.Value(0)).current;
  const row3Y = useRef(new Animated.Value(16)).current;
  const row4Opacity = useRef(new Animated.Value(0)).current;
  const row4Y = useRef(new Animated.Value(16)).current;

  // Count-up values for stat cards
  const petCountVal = useRef(new Animated.Value(0)).current;
  const aptCountVal = useRef(new Animated.Value(0)).current;
  const recordCountVal = useRef(new Animated.Value(0)).current;
  const alertCountVal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLoading) return;

    // Hero entrance
    Animated.parallel([
      Animated.timing(heroOpacity, { toValue: 1, duration: ANIMATION.slower, useNativeDriver: true }),
      Animated.timing(heroY, { toValue: 0, duration: ANIMATION.slower, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    // Stat cards stagger
    const statAnims = statCardAnims.map((anim, i) =>
      Animated.sequence([
        Animated.delay(150 + i * 80),
        Animated.parallel([
          Animated.timing(anim.opacity, { toValue: 1, duration: ANIMATION.slower, useNativeDriver: true }),
          Animated.timing(anim.translateY, { toValue: 0, duration: ANIMATION.slower, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]),
      ])
    );

    // Count-up animations (JS driver needed for numbers)
    const countDuration = 600;
    const countDelay = 200;
    const countAnims = Animated.parallel([
      Animated.sequence([Animated.delay(countDelay), Animated.timing(petCountVal, { toValue: pets.length, duration: countDuration, easing: Easing.out(Easing.cubic), useNativeDriver: false })]),
      Animated.sequence([Animated.delay(countDelay + 80), Animated.timing(aptCountVal, { toValue: appointments.length, duration: countDuration, easing: Easing.out(Easing.cubic), useNativeDriver: false })]),
      Animated.sequence([Animated.delay(countDelay + 160), Animated.timing(recordCountVal, { toValue: clinicalRecords.length, duration: countDuration, easing: Easing.out(Easing.cubic), useNativeDriver: false })]),
      Animated.sequence([Animated.delay(countDelay + 240), Animated.timing(alertCountVal, { toValue: lowStockItems.length, duration: countDuration, easing: Easing.out(Easing.cubic), useNativeDriver: false })]),
    ]);

    // Row 3 & 4 entrance
    const rowAnims = Animated.parallel([
      Animated.sequence([
        Animated.delay(500),
        Animated.parallel([
          Animated.timing(row3Opacity, { toValue: 1, duration: ANIMATION.slower, useNativeDriver: true }),
          Animated.timing(row3Y, { toValue: 0, duration: ANIMATION.slower, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]),
      ]),
      Animated.sequence([
        Animated.delay(650),
        Animated.parallel([
          Animated.timing(row4Opacity, { toValue: 1, duration: ANIMATION.slower, useNativeDriver: true }),
          Animated.timing(row4Y, { toValue: 0, duration: ANIMATION.slower, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]),
      ]),
    ]);

    Animated.parallel([...statAnims, countAnims, rowAnims]).start();
  }, [isLoading, pets.length, appointments.length, clinicalRecords.length, lowStockItems.length]);

  const todayStr = new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });

  const todayAppointments = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return appointments.filter(a => a.start_time?.slice(0, 10) === today);
  }, [appointments]);

  const nextAppointment = useMemo(() => {
    if (todayAppointments.length > 0) {
      const apt = todayAppointments[0];
      const matchedPet = pets.find(p => p.name === apt.patient_name);
      return {
        hasAppointment: true,
        petName: apt.patient_name || 'Sin nombre',
        petBreed: matchedPet?.breed || '',
        petAge: matchedPet?.birth_date ? calculateAge(matchedPet.birth_date) : '',
        time: apt.start_time ? new Date(apt.start_time).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : '--:--',
        type: apt.appointment_type || 'Consulta general',
      };
    }
    return { hasAppointment: false, petName: '', petBreed: '', petAge: '', time: '', type: '' };
  }, [todayAppointments, pets]);

  const recentPatients = useMemo(() => {
    return [...pets]
      .sort((a, b) => {
        const aLastRecord = clinicalRecords
          .filter(r => r.pet_id === a.id)
          .sort((x, y) => new Date(y.date).getTime() - new Date(x.date).getTime())[0];
        const bLastRecord = clinicalRecords
          .filter(r => r.pet_id === b.id)
          .sort((x, y) => new Date(y.date).getTime() - new Date(x.date).getTime())[0];
        const aDate = aLastRecord?.date || a.created_at || '';
        const bDate = bLastRecord?.date || b.created_at || '';
        return new Date(bDate).getTime() - new Date(aDate).getTime();
      })
      .slice(0, 4)
      .map(p => {
        const lastRecord = clinicalRecords
          .filter(r => r.pet_id === p.id)
          .sort((x, y) => new Date(y.date).getTime() - new Date(x.date).getTime())[0];
        return {
          id: p.id,
          name: p.name,
          species: p.species === 'dog' ? 'Canino' : p.species === 'cat' ? 'Felino' : (p.species || 'Canino'),
          breed: p.breed || 'Mestizo',
          lastVisit: lastRecord?.date
            ? new Date(lastRecord.date).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
            : 'Sin visitas',
        };
      });
  }, [pets, clinicalRecords]);

  const statsData = useMemo(() => {
    const thisMonth = new Date().toISOString().slice(0, 7);
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    const lastMonth = lastMonthDate.toISOString().slice(0, 7);

    const thisMonthRecords = clinicalRecords.filter(r => r.date?.startsWith(thisMonth));
    const lastMonthRecords = clinicalRecords.filter(r => r.date?.startsWith(lastMonth));

    const thisMonthConsultas = thisMonthRecords.filter(r => r.record_type === 'consulta').length;
    const lastMonthConsultas = lastMonthRecords.filter(r => r.record_type === 'consulta').length;
    const consultasChange = lastMonthConsultas > 0
      ? Math.round(((thisMonthConsultas - lastMonthConsultas) / lastMonthConsultas) * 100)
      : 0;

    const thisMonthPets = pets.filter(p => p.created_at?.startsWith(thisMonth)).length;
    const lastMonthPets = pets.filter(p => p.created_at?.startsWith(lastMonth)).length;
    const pacientesChange = lastMonthPets > 0
      ? Math.round(((thisMonthPets - lastMonthPets) / lastMonthPets) * 100)
      : 0;

    const thisMonthVacunas = thisMonthRecords.filter(r => r.record_type === 'vacuna').length;
    const lastMonthVacunas = lastMonthRecords.filter(r => r.record_type === 'vacuna').length;
    const vacunasChange = lastMonthVacunas > 0
      ? Math.round(((thisMonthVacunas - lastMonthVacunas) / lastMonthVacunas) * 100)
      : 0;

    return {
      totalConsultas: thisMonthConsultas,
      consultasChange,
      pacientesNuevos: thisMonthPets,
      pacientesChange,
      vacunas: thisMonthVacunas,
      vacunasChange,
      hospitalizaciones: 0,
      hospitalizacionesChange: 0,
    };
  }, [clinicalRecords, pets]);

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

    clinicalRecords.slice(0, 3).forEach(record => {
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

    appointments.slice(0, 2).forEach(apt => {
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
      {/* Row 1: Hero + Próxima Cita */}
      <Animated.View style={[styles.topRow, isMobile && styles.topRowMobile, { opacity: heroOpacity, transform: [{ translateY: heroY }] }]}>
        <LinearGradient
          colors={[colors.primaryDark, colors.primary, colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, isMobile && styles.heroMobile]}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroGreetingRow}>
              <Sparkles size={14} color={TEXT_ON_PRIMARY.light.muted} />
              <Text style={[styles.heroGreeting, { color: TEXT_ON_PRIMARY.light.muted }]}>{getGreeting()}</Text>
            </View>
            <Text style={[styles.heroName, { color: TEXT_ON_PRIMARY.light.default }, isMobile && styles.heroNameMobile]}>
              Hola, {user?.name?.split(' ')[0] || 'Usuario'}
            </Text>
            <View style={styles.heroStatsRow}>
              <View style={styles.heroStatBadge}>
                <CalendarDays size={12} color={TEXT_ON_PRIMARY.light.default} />
                <Text style={[styles.heroStatText, { color: TEXT_ON_PRIMARY.light.default }]}>{todayAppointments.length} citas hoy</Text>
              </View>
              <View style={styles.heroStatBadge}>
                <Users size={12} color={TEXT_ON_PRIMARY.light.default} />
                <Text style={[styles.heroStatText, { color: TEXT_ON_PRIMARY.light.default }]}>{pets.length} pacientes</Text>
              </View>
            </View>
            <Pressable
              onPress={() => router.push('/(drawer)/agenda')}
              style={[styles.heroButton, { backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.25)' }, isMobile && styles.heroButtonMobile]}
            >
              <CalendarDays size={14} color={TEXT_ON_PRIMARY.light.default} />
              <Text style={[styles.heroButtonText, { color: TEXT_ON_PRIMARY.light.default }]}>Ver agenda del día</Text>
              <ChevronRight size={14} color={TEXT_ON_PRIMARY.light.muted} />
            </Pressable>
          </View>
          <BannerIllustration isMobile={isMobile} />
        </LinearGradient>
        <NextAppointmentCard {...nextAppointment} />
      </Animated.View>

      {/* Row 2: Stats Cards */}
      <View style={[styles.statsRow, isMobile && styles.statsRowMobile]}>
        {[{ icon: 'pacientes' as const, color: colors.primary, bg: colors.primaryContainer, value: pets.length, label: 'Pacientes', anim: statCardAnims[0], countVal: petCountVal },
          { icon: 'agenda' as const, color: colors.info, bg: colors.info + '18', value: todayAppointments.length, label: 'Citas Hoy', anim: statCardAnims[1], countVal: aptCountVal },
          { icon: 'laboratorio' as const, color: colors.success, bg: colors.success + '18', value: clinicalRecords.length, label: 'Fichas Clínicas', anim: statCardAnims[2], countVal: recordCountVal },
          { icon: 'inventario' as const, color: colors.warning, bg: colors.warning + '18', value: lowStockItems.length, label: 'Alertas Stock', anim: statCardAnims[3], countVal: alertCountVal }
        ].map((stat, i) => (
          <Animated.View key={i} style={[styles.statCard, { backgroundColor: colors.surface }, SHADOWS.xs, isMobile && styles.statCardMobile, { opacity: stat.anim.opacity, transform: [{ translateY: stat.anim.translateY }] }]}>
            <View style={[styles.statIcon, { backgroundColor: stat.bg }]}>
              <VetCloudIcon name={stat.icon} size={24} color={stat.color} />
            </View>
            <Animated.View>
              <AnimatedText value={stat.countVal} style={[styles.statValue, { color: colors.text }]} />
            </Animated.View>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
          </Animated.View>
        ))}
      </View>

      {/* Row 3: Pacientes + Estadísticas + Acciones */}
      <Animated.View style={[styles.threeColRow, isMobile && styles.threeColRowMobile, { opacity: row3Opacity, transform: [{ translateY: row3Y }] }]}>
        <View style={[styles.colLeft, isMobile && styles.colMobile]}>
          <PatientList patients={recentPatients} />
        </View>
        <View style={[styles.colCenter, isMobile && styles.colMobile]}>
          <StatsChart
            totalConsultas={statsData.totalConsultas}
            consultasChange={statsData.consultasChange}
            pacientesNuevos={statsData.pacientesNuevos}
            pacientesChange={statsData.pacientesChange}
            vacunas={statsData.vacunas}
            vacunasChange={statsData.vacunasChange}
            hospitalizaciones={statsData.hospitalizaciones}
            hospitalizacionesChange={statsData.hospitalizacionesChange}
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
  heroName: { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.bold },
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
