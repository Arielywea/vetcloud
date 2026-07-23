import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { X, Phone, Mail, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS, Z_INDEX } from '../../constants/tokens';
import { DirectusPet } from '../../services/directus';
import { isActive } from '../../utils/patientFilters';
import { calculateAge } from '../../utils/age';
import VAvatar from '../ui/Avatar';

interface PatientSidePanelProps {
  patient: DirectusPet | null;
  visible: boolean;
  onClose: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const PANEL_WIDTH = Math.min(360, SCREEN_WIDTH * 0.85);

export default function PatientSidePanel({ patient, visible, onClose }: PatientSidePanelProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(PANEL_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: PANEL_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible || !patient) return null;

  const active = isActive(patient);
  const age = patient.birth_date ? calculateAge(patient.birth_date) : 'N/D';

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Sin visitas';
    return new Date(dateStr).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.panel,
          {
            backgroundColor: colors.surface,
            width: PANEL_WIDTH,
            transform: [{ translateX: slideAnim }],
            ...SHADOWS.xl,
          },
        ]}
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <VAvatar name={patient.name} size={48} style={{ backgroundColor: colors.primaryContainer }} />
          <View style={styles.headerInfo}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
              {patient.name}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {patient.species === 'dog' ? 'Canino' : 'Felino'}
              {patient.breed ? ` · ${patient.breed}` : ''}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <X size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <View style={[styles.badgeRow, { backgroundColor: active ? '#E3F2FD' : '#FFF3E0' }]}>
            <Text style={[styles.badgeText, { color: active ? '#1565C0' : '#E65100' }]}>
              {active ? 'Activo' : 'Inactivo'}
            </Text>
          </View>

          <View style={[styles.statsRow, { backgroundColor: colors.surfaceVariant }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{age}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Edad</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {patient.weight ? `${patient.weight} kg` : 'N/D'}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Peso</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {patient.sex === 'macho' ? 'Macho' : patient.sex === 'hembra' ? 'Hembra' : 'N/D'}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Sexo</Text>
            </View>
          </View>

          {(patient.tutor_name || patient.phone || patient.email) && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Propietario</Text>
              {patient.tutor_name && (
                <Text style={[styles.ownerName, { color: colors.text }]}>{patient.tutor_name}</Text>
              )}
              {patient.phone && (
                <TouchableOpacity style={styles.contactRow} activeOpacity={0.7}>
                  <Phone size={16} color={colors.primary} />
                  <Text style={[styles.contactText, { color: colors.text }]}>{patient.phone}</Text>
                </TouchableOpacity>
              )}
              {patient.email && (
                <TouchableOpacity style={styles.contactRow} activeOpacity={0.7}>
                  <Mail size={16} color={colors.primary} />
                  <Text style={[styles.contactText, { color: colors.text }]} numberOfLines={1}>{patient.email}</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          <Divider style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.lastVisitRow}>
            <Text style={[styles.lastVisitLabel, { color: colors.textSecondary }]}>Última visita</Text>
            <Text style={[styles.lastVisitValue, { color: colors.text }]}>
              {formatDate(patient.last_visit)}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.viewFullBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              onClose();
              router.push(`/pet/${patient.id}`);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.viewFullText}>Ver ficha completa</Text>
            <ChevronRight size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: Z_INDEX.modal,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  panel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: RADIUS.lg,
    borderBottomLeftRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    gap: SPACING.md,
  },
  headerInfo: { flex: 1 },
  name: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold },
  subtitle: { fontSize: TYPOGRAPHY.sizes.sm, marginTop: 2 },
  closeBtn: { padding: SPACING.xs },
  body: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    gap: SPACING.lg,
  },
  badgeRow: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
  },
  badgeText: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
  statsRow: {
    flexDirection: 'row',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.semibold },
  statLabel: { fontSize: TYPOGRAPHY.sizes.xs, marginTop: 2 },
  statDivider: { width: 1, marginVertical: SPACING.xs },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ownerName: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.semibold },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  contactText: { fontSize: TYPOGRAPHY.sizes.sm },
  divider: { marginVertical: SPACING.xs },
  lastVisitRow: { gap: SPACING['2xs'] },
  lastVisitLabel: { fontSize: TYPOGRAPHY.sizes.xs },
  lastVisitValue: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.semibold },
  viewFullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  viewFullText: { color: '#FFFFFF', fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.semibold },
});
