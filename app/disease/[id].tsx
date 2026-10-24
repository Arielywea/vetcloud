import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, ScrollView, StyleSheet, TextInput, Image, Pressable, Animated, useWindowDimensions,
  NativeSyntheticEvent, NativeScrollEvent, LayoutChangeEvent,
} from 'react-native';
import { Text, Modal, Portal } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { Pencil, Heart, AlertTriangle, ChevronDown, MapPin, Info } from 'lucide-react-native';
import { useDisease, useFavorites, useDiagnosisStats } from '../../hooks/useDirectus';
import { useAuth } from '../../hooks/useAuth';
import { DirectusDisease } from '../../services/directus';
import { DISEASE_CATEGORIES, DiseaseCategoryKey, PROGNOSIS_LABELS, LIFE_STAGE_LABELS, SPECIES_LABELS, categoryLabel } from '../../constants/diseaseMeta';
import { SEVERITY_LABELS, SEVERITY_TONE } from '../../constants/colors';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../components/ui/VToast';
import { SkeletonCard } from '../../components/ui/Skeleton';
import VBadge from '../../components/ui/Badge';
import VButton from '../../components/ui/Button';
import VIconButton from '../../components/ui/IconButton';
import DisplayText from '../../components/ui/DisplayText';
import { SPACING, RADIUS, TYPOGRAPHY, alpha } from '../../constants/tokens';
import { EASE_OUT, useReducedMotion } from '../../hooks/useReducedMotion';

// ─── Content helpers ─────────────────────────────────────

/** "Vómitos proyectivos: detalle…" → ["Vómitos proyectivos", "detalle…"] */
function splitItem(text: string): [string, string] {
  const i = text.indexOf(':');
  if (i > 0 && i < 80) return [text.slice(0, i).trim(), text.slice(i + 1).trim()];
  return [text, ''];
}

/** The catalog stores emergencies as "PRESENTACIÓN: …\nPROTOCOLO:\n  - paso", one block per emergency */
type EmergencyBlock = { presentation: string; steps: string[]; rest: string };
function parseEmergency(text: string): EmergencyBlock[] {
  return text.split(/(?=PRESENTACI[ÓO]N:)/i).map(s => s.trim()).filter(Boolean).map((block) => {
    const presentation = block.match(/PRESENTACI[ÓO]N:\s*([\s\S]*?)(?:\n\s*PROTOCOLO:|$)/i)?.[1]?.trim() || '';
    const protocol = block.match(/PROTOCOLO:\s*([\s\S]*)$/i)?.[1] || '';
    const steps = protocol.split('\n').map(l => l.replace(/^\s*[-•]\s*/, '').trim()).filter(Boolean);
    return presentation || steps.length ? { presentation, steps, rest: '' } : { presentation: '', steps: [], rest: block };
  });
}

// Doses and intervals are what a clinician scans for: "0,25-0,3 mg/kg", "2,5 µg/kg/min", "cada 8-12 h"
// (?<![\^\d.,]) keeps exponents such as "peso^0,75 mL/día" out of it
const DOSE_RE = /((?<![\^\d.,])\d+(?:[.,]\d+)?(?:\s*[-–]\s*\d+(?:[.,]\d+)?)?\s*(?:mg|µg|mcg|g|mL|ml|U|UI|mEq|mmol)\s*\/\s*(?:kg|m²|m2|gato|perro|día|h|min)(?:\s*\/\s*(?:h|min|día))?|cada\s+\d+(?:[.,]\d+)?(?:\s*[-–]\s*\d+)?\s*(?:h|horas|días)\b|\bq\s?\d+(?:\s*[-–]\s*\d+)?\s?h\b)/gi;
const DRAFT_RE = /^Borrador pendiente de revisión veterinaria \([^)]*\): verifica dosis y protocolos antes de usarlos\.\s*/i;

/** Text with doses set in tabular figures on a faint tone, so they can be found at a glance */
function Rich({ text, style, doseStyle }: { text: string; style: any; doseStyle: any }) {
  const parts = text.split(DOSE_RE);
  return (
    <Text style={style}>
      {/* A dose never breaks across lines: no-break spaces and hyphens inside it */}
      {parts.map((part, i) => (i % 2 === 1 ? <Text key={i} style={doseStyle}>{part.replace(/ /g, '\u00A0').replace(/-/g, '\u2011')}</Text> : part))}
    </Text>
  );
}

// ─── Edit form fields (module scope: a component created during render remounts its input on every keystroke) ───
type FieldStyle = { inputStyle: any; labelColor: string };
function TextEditField({ label, value, onChange, multiline, inputStyle, labelColor }: FieldStyle & { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  return (
    <View style={styles.editField}>
      <Text style={[styles.editLabel, { color: labelColor }]}>{label}</Text>
      <TextInput style={[inputStyle, multiline && styles.editTextarea]} multiline={multiline} value={value} onChangeText={onChange} accessibilityLabel={label} />
    </View>
  );
}
function ArrayEditField({ label, value, onChange, inputStyle, labelColor }: FieldStyle & { label: string; value: string[]; onChange: (v: string[]) => void }) {
  // Keep the raw text while typing so blank lines and trailing spaces aren't stripped mid-edit
  const [text, setText] = useState((value || []).join('\n'));
  return (
    <View style={styles.editField}>
      <Text style={[styles.editLabel, { color: labelColor }]}>{label} (uno por línea)</Text>
      <TextInput
        style={[inputStyle, styles.editTextarea]}
        multiline
        value={text}
        onChangeText={(t) => { setText(t); onChange(t.split('\n').map(s => s.trim()).filter(Boolean)); }}
        accessibilityLabel={label}
      />
    </View>
  );
}

// ─── Reading blocks ──────────────────────────────────────

type Palette = ReturnType<typeof useTheme>['colors'];

/** Title + detail. Side by side on a wide sheet (the titles form a scannable column), stacked on a phone */
function Entries({ items, colors, wide, marker, doseStyle }: { items: string[]; colors: Palette; wide: boolean; marker?: string; doseStyle: any }) {
  return (
    <View style={styles.entries}>
      {items.map((raw, i) => {
        const [title, detail] = splitItem(raw);
        if (!detail) {
          return (
            <View key={i} style={styles.plainItem}>
              <View style={[styles.lozenge, { backgroundColor: marker || colors.textSecondary }]} />
              <Rich text={title} style={[styles.prose, { color: colors.text, flex: 1 }]} doseStyle={doseStyle} />
            </View>
          );
        }
        return (
          <View key={i} style={[styles.entry, wide && styles.entryWide]}>
            <View style={[styles.entryTitleWrap, wide && styles.entryTitleWide]}>
              <View style={[styles.lozenge, { backgroundColor: marker || colors.textSecondary }]} />
              <Text style={[styles.entryTitle, { color: colors.text }]}>{title}</Text>
            </View>
            <Rich text={detail} style={[styles.prose, styles.entryDetail, { color: colors.text }, !wide && { paddingLeft: 17 }]} doseStyle={doseStyle} />
          </View>
        );
      })}
    </View>
  );
}

function SubHeading({ children, colors }: { children: string; colors: Palette }) {
  return <Text accessibilityRole="header" style={[styles.subHeading, { color: colors.textSecondary }]}>{children}</Text>;
}

/** One emergency presentation: the line that names it, and its numbered protocol, folded on demand */
function EmergencyItem({ block, colors, doseStyle, reduced }: { block: EmergencyBlock; colors: Palette; doseStyle: any; reduced: boolean }) {
  const [open, setOpen] = useState(true);
  const turn = useRef(new Animated.Value(1)).current;
  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (reduced) { turn.setValue(next ? 1 : 0); return; }
    Animated.timing(turn, { toValue: next ? 1 : 0, duration: 180, easing: EASE_OUT, useNativeDriver: true }).start();
  };
  const rotate = turn.interpolate({ inputRange: [0, 1], outputRange: ['-90deg', '0deg'] });
  if (block.rest) return <Rich text={block.rest} style={[styles.prose, { color: colors.text }]} doseStyle={doseStyle} />;
  return (
    <View style={styles.emergencyItem}>
      <Pressable onPress={toggle} accessibilityRole="button" aria-expanded={open} style={styles.emergencyHead}>
        <Animated.View style={{ transform: [{ rotate }], marginTop: 3 }}>
          <ChevronDown size={18} color={colors.error} />
        </Animated.View>
        <Text style={[styles.emergencyPresentation, { color: colors.text }]}>{block.presentation || 'Protocolo'}</Text>
      </Pressable>
      {open && block.steps.map((step, i) => (
        <View key={i} style={styles.step}>
          <Text style={[styles.stepNumber, { color: colors.error }]}>{i + 1}</Text>
          <Rich text={step} style={[styles.prose, { color: colors.text, flex: 1 }]} doseStyle={doseStyle} />
        </View>
      ))}
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────

type SectionKey = 'summary' | 'emergency' | 'signs' | 'diagnosis' | 'treatment' | 'prevention' | 'references';
const CHILE_FREQUENCY: Record<string, string> = { muy_frecuente: 'Muy frecuente', frecuente: 'Frecuente', ocasional: 'Ocasional', rara: 'Rara' };
const SECTION_LABELS: Record<SectionKey, string> = {
  summary: 'Resumen',
  emergency: 'Urgencia',
  signs: 'Signos',
  diagnosis: 'Diagnóstico',
  treatment: 'Tratamiento',
  prevention: 'Prevención',
  references: 'Referencias',
};

export default function DiseaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const seen = useDiagnosisStats();
  const { disease, loading, updateDisease } = useDisease(id || null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const toast = useToast();
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const { width } = useWindowDimensions();
  const wide = width >= 1024;
  const [editVisible, setEditVisible] = useState(false);
  const [editData, setEditData] = useState<Partial<DirectusDisease>>({});
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Section index: positions measured on layout, the active one follows the scroll
  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<Partial<Record<SectionKey, number>>>({});
  const [active, setActive] = useState<SectionKey>('summary');

  useEffect(() => {
    if (disease) {
      setEditData({
        name: disease.name,
        scientific_name: disease.scientific_name,
        english_name: disease.english_name,
        description: disease.description,
        pathophysiology: disease.pathophysiology,
        key_signs: [...(disease.key_signs || [])],
        prevention: [...(disease.prevention || [])],
        references: [...(disease.references || [])],
        diagnosis: { ...(disease.diagnosis as any || {}) },
        treatment: { ...(disease.treatment as any || {}) },
      });
    }
  }, [disease]);

  const handleSave = async () => {
    setEditError(null);
    if (!editData.name?.trim()) { setEditError('El nombre es obligatorio'); return; }
    if (!editData.description?.trim()) { setEditError('La descripción es obligatoria'); return; }
    setSaving(true);
    try {
      await updateDisease({ ...editData, scientific_name: editData.scientific_name?.trim() || null, english_name: editData.english_name?.trim() || null });
      setEditVisible(false);
      toast.success('Enfermedad actualizada');
    } catch (e: any) {
      setEditError(e?.message || 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const setField = (field: string, value: any) => setEditData(prev => ({ ...prev, [field]: value }));
  const setNested = (parent: 'diagnosis' | 'treatment', field: string, value: any) =>
    setEditData(prev => ({ ...prev, [parent]: { ...((prev as any)[parent] || {}), [field]: value } }));

  const measure = useCallback((key: SectionKey) => (e: LayoutChangeEvent) => {
    sectionY.current[key] = e.nativeEvent.layout.y;
  }, []);

  const sections = useMemo<SectionKey[]>(() => {
    if (!disease) return [];
    const t = (disease.treatment as any) || {};
    const d = (disease.diagnosis as any) || {};
    const list: SectionKey[] = ['summary'];
    if (t.emergency) list.push('emergency');
    if (disease.key_signs?.length) list.push('signs');
    if (d.clinicalExam || d.labTests?.length || d.imaging?.length || d.differentialDiagnosis?.length) list.push('diagnosis');
    if (t.firstLine?.length || t.secondLine?.length || t.duration || t.notes) list.push('treatment');
    if (disease.prevention?.length) list.push('prevention');
    if (disease.references?.length) list.push('references');
    return list;
  }, [disease]);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    const atEnd = contentOffset.y + layoutMeasurement.height >= contentSize.height - 8;
    const probe = contentOffset.y + 140;
    let current: SectionKey = sections[0] || 'summary';
    for (const key of sections) {
      const y = sectionY.current[key];
      if (y != null && y <= probe) current = key;
    }
    // The last short sections can never reach the probe line; at the bottom, the last one is current
    if (atEnd && sections.length) current = sections[sections.length - 1];
    setActive(prev => (prev === current ? prev : current));
  }, [sections]);

  const jumpTo = (key: SectionKey) => {
    const y = sectionY.current[key];
    if (y == null) return;
    setActive(key);
    scrollRef.current?.scrollTo({ y: Math.max(0, y - SPACING.lg), animated: !reduced });
  };

  if (loading) {
    return <View style={[styles.container, { backgroundColor: colors.background }]}><SkeletonCard style={{ margin: SPACING.lg }} /></View>;
  }
  if (!disease) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ textAlign: 'center', marginTop: 40, color: colors.textSecondary }}>Enfermedad no encontrada</Text>
      </View>
    );
  }

  const favorite = isFavorite(disease.id);
  // Global catalog entries (organization_id null) are admin-only on the server
  const canEdit = user?.role === 'admin' || disease.organization_id != null;
  const diagnosis = (disease.diagnosis as any) || {};
  const treatment = (disease.treatment as any) || {};
  const category = DISEASE_CATEGORIES[disease.category as DiseaseCategoryKey];
  const emergency = treatment.emergency ? parseEmergency(treatment.emergency) : null;

  // Notes: the draft marker becomes a strip at the top; a "Chile:" / "En Chile:" note gets its own title
  const rawNotes: string = treatment.notes || '';
  const isDraft = DRAFT_RE.test(rawNotes) || /^Borrador pendiente de revisión/i.test(rawNotes);
  const notesBody = rawNotes.replace(DRAFT_RE, '').trim();
  const notesIsChile = /^(En )?Chile:/i.test(notesBody);
  const notes = notesBody.replace(/^(En )?Chile:\s*/i, '');

  // Description: the first paragraph leads; an "En Chile:" paragraph becomes its own note
  const paragraphs = (disease.description || '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const chileParagraph = paragraphs.find(p => /^En Chile:/i.test(p));
  const body = paragraphs.filter(p => p !== chileParagraph);
  // The lead is set large, so it is one or two sentences; the rest of a long first paragraph follows at reading size
  let [lead, ...restParagraphs] = body;
  if (lead && lead.length > 260) {
    const sentences = lead.match(/[^.!?]+[.!?]+(\s|$)/g) || [lead];
    let cut = sentences[0];
    if (cut.length < 120 && sentences[1]) cut += sentences[1];
    restParagraphs = [lead.slice(cut.length).trim(), ...restParagraphs].filter(Boolean);
    lead = cut.trim();
  }

  const doseStyle = [styles.dose, { color: colors.text, backgroundColor: alpha(colors.primary, 0.09) }];
  const inputStyle = [styles.editInput, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }];
  const severityLabel = (SEVERITY_LABELS as Record<string, string>)[disease.severity] || disease.severity;
  const facts = [
    SPECIES_LABELS[disease.species] || disease.species,
    categoryLabel(disease.category),
    disease.life_stage && disease.life_stage !== 'all' ? (LIFE_STAGE_LABELS[disease.life_stage] || disease.life_stage) : null,
    disease.chile_frequency ? `${CHILE_FREQUENCY[disease.chile_frequency]} en Chile` : null,
    seen[disease.id] ? `${seen[disease.id]} ${seen[disease.id] === 1 ? 'diagnóstico' : 'diagnósticos'} en tu clínica este año` : null,
  ].filter(Boolean).join(' · ');

  const sectionTitle = (key: SectionKey, tone?: string) => (
    <DisplayText style={[styles.sectionTitle, { color: tone || colors.text }]}>{SECTION_LABELS[key]}</DisplayText>
  );

  const index = (
    <View style={wide ? styles.sideIndex : [styles.topIndex, { backgroundColor: colors.background }]} {...({ role: 'navigation', 'aria-label': 'Secciones de la ficha' } as any)}>
      <ScrollView horizontal={!wide} showsHorizontalScrollIndicator={false} contentContainerStyle={wide ? undefined : styles.topIndexRow}>
        {sections.map((key) => {
          const on = key === active;
          const tone = key === 'emergency' ? colors.error : colors.primary;
          return (
            <Pressable
              key={key}
              onPress={() => jumpTo(key)}
              accessibilityRole="link"
              aria-current={on ? 'location' : undefined}
              style={({ hovered }: any) => [
                wide ? styles.sideItem : styles.topItem,
                !wide && on && { backgroundColor: colors.surface },
                hovered && !on && { backgroundColor: alpha(colors.primary, 0.05) },
              ]}
            >
              {wide && <View style={[styles.sideMarker, { backgroundColor: on ? tone : 'transparent' }]} />}
              <Text style={[styles.indexLabel, { color: on ? (key === 'emergency' ? colors.error : colors.text) : colors.textSecondary }, on && { fontWeight: TYPOGRAPHY.weights.semibold }]}>
                {SECTION_LABELS[key]}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {!wide && index}
      <View style={styles.frame}>
        {wide && index}
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={[styles.sheet, { backgroundColor: colors.surface }, !wide && styles.sheetPhone]}
          onScroll={onScroll}
          scrollEventThrottle={32}
        >
          {/* Header */}
          <View onLayout={measure('summary')}>
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <DisplayText style={[styles.diseaseName, !wide && styles.diseaseNamePhone, { color: colors.text }]}>{disease.name}</DisplayText>
                {disease.scientific_name ? (
                  <Text style={[styles.scientificName, { color: colors.textSecondary }]}>{disease.scientific_name}</Text>
                ) : null}
                {disease.english_name ? (
                  <Text style={[styles.englishName, { color: colors.textSecondary }]}>En inglés: {disease.english_name}</Text>
                ) : null}
              </View>
              <View style={styles.headerActions}>
                {canEdit && (
                  <VIconButton label="Editar enfermedad" onPress={() => setEditVisible(true)} icon={<Pencil size={19} color={colors.primary} />} />
                )}
                <VIconButton
                  label={favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                  onPress={() => toggleFavorite(disease.id)}
                  icon={<Heart size={20} color={favorite ? colors.error : colors.textSecondary} fill={favorite ? colors.error : 'transparent'} />}
                />
              </View>
            </View>

            <View style={styles.factRow}>
              <View style={[styles.categoryMark, { backgroundColor: category?.color || colors.textLight }]} />
              <Text style={[styles.facts, { color: colors.text }]}>{facts}</Text>
              {disease.is_zoonotic ? <Text style={[styles.facts, { color: colors.error, fontWeight: TYPOGRAPHY.weights.semibold }]}>· Zoonótica</Text> : null}
            </View>

            <View style={styles.ledger}>
              <View style={styles.ledgerItem}>
                <Text style={[styles.ledgerLabel, { color: colors.textSecondary }]}>Gravedad</Text>
                <VBadge variant={SEVERITY_TONE[disease.severity] || 'neutral'}>{severityLabel}</VBadge>
              </View>
              {disease.prognosis ? (
                <View style={styles.ledgerItem}>
                  <Text style={[styles.ledgerLabel, { color: colors.textSecondary }]}>Pronóstico</Text>
                  <Text style={[styles.ledgerValue, { color: colors.text }]}>{PROGNOSIS_LABELS[disease.prognosis] || disease.prognosis}</Text>
                </View>
              ) : null}
            </View>

            {isDraft ? (
              <View accessibilityRole="alert" style={[styles.draft, { backgroundColor: alpha(colors.warning, 0.1) }]}>
                <AlertTriangle size={16} color={colors.warning} style={{ marginTop: 2 }} />
                <Text style={[styles.draftText, { color: colors.text }]}>
                  Ficha en borrador: un veterinario aún no revisa sus dosis y protocolos. Verifícalos antes de indicar.
                </Text>
              </View>
            ) : null}

            {disease.photo_url ? (
              <Image source={{ uri: disease.photo_url }} style={styles.diseasePhoto} resizeMode="cover" accessibilityLabel={`Imagen de ${disease.name}`} />
            ) : null}

            {lead ? <Text style={[styles.lead, { color: colors.text }]}>{lead}</Text> : null}
            {restParagraphs.map((p, i) => <Text key={i} style={[styles.prose, styles.paragraph, { color: colors.text }]}>{p}</Text>)}

            {chileParagraph ? (
              <View style={[styles.note, { backgroundColor: colors.surfaceVariant }]}>
                <View style={styles.noteHead}>
                  <MapPin size={16} color={colors.primary} />
                  <Text style={[styles.noteTitle, { color: colors.text }]}>En Chile</Text>
                </View>
                <Text style={[styles.prose, { color: colors.text }]}>{chileParagraph.replace(/^En Chile:\s*/i, '')}</Text>
              </View>
            ) : null}

            {disease.pathophysiology ? (
              <View style={styles.subBlock}>
                <SubHeading colors={colors}>Fisiopatología</SubHeading>
                <Text style={[styles.prose, { color: colors.text }]}>{disease.pathophysiology}</Text>
              </View>
            ) : null}
          </View>

          {emergency ? (
            <View onLayout={measure('emergency')} style={[styles.emergency, { backgroundColor: alpha(colors.error, 0.07) }]}>
              <View style={styles.emergencyTitleRow}>
                <AlertTriangle size={22} color={colors.error} />
                {sectionTitle('emergency', colors.error)}
              </View>
              {emergency.map((block, b) => (
                <EmergencyItem key={b} block={block} colors={colors} doseStyle={doseStyle} reduced={reduced} />
              ))}
            </View>
          ) : null}

          {disease.key_signs?.length ? (
            <View onLayout={measure('signs')} style={styles.section}>
              {sectionTitle('signs')}
              <Entries items={disease.key_signs} colors={colors} wide={wide} doseStyle={doseStyle} />
            </View>
          ) : null}

          {sections.includes('diagnosis') ? (
            <View onLayout={measure('diagnosis')} style={styles.section}>
              {sectionTitle('diagnosis')}
              {diagnosis.clinicalExam ? (
                <View style={styles.subBlock}>
                  <SubHeading colors={colors}>Examen clínico</SubHeading>
                  <Rich text={diagnosis.clinicalExam} style={[styles.prose, { color: colors.text }]} doseStyle={doseStyle} />
                </View>
              ) : null}
              {diagnosis.labTests?.length ? (
                <View style={styles.subBlock}>
                  <SubHeading colors={colors}>Laboratorio</SubHeading>
                  <Entries items={diagnosis.labTests} colors={colors} wide={wide} doseStyle={doseStyle} />
                </View>
              ) : null}
              {diagnosis.imaging?.length ? (
                <View style={styles.subBlock}>
                  <SubHeading colors={colors}>Imagenología</SubHeading>
                  <Entries items={diagnosis.imaging} colors={colors} wide={wide} doseStyle={doseStyle} />
                </View>
              ) : null}
              {diagnosis.differentialDiagnosis?.length ? (
                <View style={styles.subBlock}>
                  <SubHeading colors={colors}>Diagnóstico diferencial</SubHeading>
                  <Entries items={diagnosis.differentialDiagnosis} colors={colors} wide={wide} doseStyle={doseStyle} />
                </View>
              ) : null}
            </View>
          ) : null}

          {sections.includes('treatment') ? (
            <View onLayout={measure('treatment')} style={styles.section}>
              {sectionTitle('treatment')}
              <View style={[styles.caution, { backgroundColor: colors.surfaceVariant }]}>
                <Info size={15} color={colors.textSecondary} style={{ marginTop: 2 }} />
                <Text style={[styles.cautionText, { color: colors.textSecondary }]}>
                  Contenido de referencia. Ajusta dosis, vías y contraindicaciones al paciente antes de indicar.
                </Text>
              </View>
              {treatment.firstLine?.length ? (
                <View style={styles.subBlock}>
                  <SubHeading colors={colors}>Primera línea</SubHeading>
                  <Entries items={treatment.firstLine} colors={colors} wide={wide} marker={colors.success} doseStyle={doseStyle} />
                </View>
              ) : null}
              {treatment.secondLine?.length ? (
                <View style={styles.subBlock}>
                  <SubHeading colors={colors}>Segunda línea y apoyo</SubHeading>
                  <Entries items={treatment.secondLine} colors={colors} wide={wide} doseStyle={doseStyle} />
                </View>
              ) : null}
              {treatment.duration ? (
                <View style={styles.subBlock}>
                  <SubHeading colors={colors}>Duración y controles</SubHeading>
                  <Rich text={treatment.duration} style={[styles.prose, { color: colors.text }]} doseStyle={doseStyle} />
                </View>
              ) : null}
              {notes ? (
                <View style={[styles.note, { backgroundColor: colors.surfaceVariant }]}>
                  <View style={styles.noteHead}>
                    <MapPin size={16} color={colors.primary} />
                    <Text style={[styles.noteTitle, { color: colors.text }]}>{notesIsChile ? 'Disponibilidad en Chile' : 'Notas'}</Text>
                  </View>
                  <Rich text={notes} style={[styles.prose, { color: colors.text }]} doseStyle={doseStyle} />
                </View>
              ) : null}
            </View>
          ) : null}

          {disease.prevention?.length ? (
            <View onLayout={measure('prevention')} style={styles.section}>
              {sectionTitle('prevention')}
              <Entries items={disease.prevention} colors={colors} wide={wide} marker={colors.success} doseStyle={doseStyle} />
            </View>
          ) : null}

          {disease.references?.length ? (
            <View onLayout={measure('references')} style={styles.section}>
              {sectionTitle('references')}
              {disease.references.map((ref: string, i: number) => (
                <View key={i} style={styles.reference}>
                  <Text style={[styles.referenceNumber, { color: colors.textSecondary }]}>{i + 1}</Text>
                  <Text style={[styles.referenceText, { color: colors.textSecondary }]}>{ref}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </ScrollView>
      </View>

      {/* Edit (only clinic-owned entries, or admins for the global catalog) */}
      <Portal>
        <Modal visible={editVisible} onDismiss={() => setEditVisible(false)} contentContainerStyle={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <ScrollView>
            <Text accessibilityRole="header" style={[styles.modalTitle, { color: colors.text }]}>Editar enfermedad</Text>
            <TextEditField inputStyle={inputStyle} labelColor={colors.textSecondary} label="Nombre *" value={editData.name || ''} onChange={(t) => setField('name', t)} />
            <TextEditField inputStyle={inputStyle} labelColor={colors.textSecondary} label="Agente o nombre científico (latín)" value={editData.scientific_name || ''} onChange={(t) => setField('scientific_name', t)} />
            <TextEditField inputStyle={inputStyle} labelColor={colors.textSecondary} label="Nombre en inglés" value={editData.english_name || ''} onChange={(t) => setField('english_name', t)} />
            <TextEditField inputStyle={inputStyle} labelColor={colors.textSecondary} label="Descripción *" value={editData.description || ''} onChange={(t) => setField('description', t)} multiline />
            <TextEditField inputStyle={inputStyle} labelColor={colors.textSecondary} label="Fisiopatología" value={editData.pathophysiology || ''} onChange={(t) => setField('pathophysiology', t)} multiline />

            <Text style={[styles.editSection, { color: colors.primary }]}>Signos clave</Text>
            <ArrayEditField inputStyle={inputStyle} labelColor={colors.textSecondary} label="Signos" value={editData.key_signs || []} onChange={(v) => setField('key_signs', v)} />

            <Text style={[styles.editSection, { color: colors.primary }]}>Diagnóstico</Text>
            <TextEditField inputStyle={inputStyle} labelColor={colors.textSecondary} label="Examen clínico" value={(editData.diagnosis as any)?.clinicalExam || ''} onChange={(t) => setNested('diagnosis', 'clinicalExam', t)} multiline />
            <ArrayEditField inputStyle={inputStyle} labelColor={colors.textSecondary} label="Laboratorio" value={(editData.diagnosis as any)?.labTests || []} onChange={(v) => setNested('diagnosis', 'labTests', v)} />
            <ArrayEditField inputStyle={inputStyle} labelColor={colors.textSecondary} label="Imagenología" value={(editData.diagnosis as any)?.imaging || []} onChange={(v) => setNested('diagnosis', 'imaging', v)} />
            <ArrayEditField inputStyle={inputStyle} labelColor={colors.textSecondary} label="Diagnóstico diferencial" value={(editData.diagnosis as any)?.differentialDiagnosis || []} onChange={(v) => setNested('diagnosis', 'differentialDiagnosis', v)} />

            <Text style={[styles.editSection, { color: colors.primary }]}>Tratamiento</Text>
            <ArrayEditField inputStyle={inputStyle} labelColor={colors.textSecondary} label="Primera línea" value={(editData.treatment as any)?.firstLine || []} onChange={(v) => setNested('treatment', 'firstLine', v)} />
            <ArrayEditField inputStyle={inputStyle} labelColor={colors.textSecondary} label="Segunda línea" value={(editData.treatment as any)?.secondLine || []} onChange={(v) => setNested('treatment', 'secondLine', v)} />
            <TextEditField inputStyle={inputStyle} labelColor={colors.textSecondary} label="Emergencia" value={(editData.treatment as any)?.emergency || ''} onChange={(t) => setNested('treatment', 'emergency', t)} multiline />
            <TextEditField inputStyle={inputStyle} labelColor={colors.textSecondary} label="Duración" value={(editData.treatment as any)?.duration || ''} onChange={(t) => setNested('treatment', 'duration', t)} />
            <TextEditField inputStyle={inputStyle} labelColor={colors.textSecondary} label="Notas (disponibilidad en Chile)" value={(editData.treatment as any)?.notes || ''} onChange={(t) => setNested('treatment', 'notes', t)} multiline />

            <Text style={[styles.editSection, { color: colors.primary }]}>Prevención</Text>
            <ArrayEditField inputStyle={inputStyle} labelColor={colors.textSecondary} label="Medidas" value={editData.prevention || []} onChange={(v) => setField('prevention', v)} />

            <Text style={[styles.editSection, { color: colors.primary }]}>Referencias</Text>
            <ArrayEditField inputStyle={inputStyle} labelColor={colors.textSecondary} label="Referencias" value={editData.references || []} onChange={(v) => setField('references', v)} />

            {editError ? (
              <View accessibilityRole="alert" style={[styles.caution, { backgroundColor: colors.surfaceVariant }]}>
                <AlertTriangle size={16} color={colors.error} />
                <Text style={[styles.cautionText, { color: colors.error }]}>{editError}</Text>
              </View>
            ) : null}
            <View style={styles.modalActions}>
              <VButton variant="secondary" onPress={() => setEditVisible(false)}>Cancelar</VButton>
              <VButton variant="primary" onPress={handleSave} loading={saving} disabled={saving}>Guardar</VButton>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
}

const PROSE = 16;
const styles = StyleSheet.create({
  container: { flex: 1 },
  frame: { flex: 1, flexDirection: 'row', justifyContent: 'center', width: '100%', maxWidth: 1120, alignSelf: 'center' },
  scroll: { flex: 1 },
  // One continuous leaf of vellum instead of a stack of cards; sections part by space
  sheet: { paddingHorizontal: SPACING['5xl'], paddingTop: SPACING['4xl'], paddingBottom: 120, marginVertical: SPACING['2xl'], marginRight: SPACING['2xl'], maxWidth: 820 },
  sheetPhone: { paddingHorizontal: SPACING.lg, paddingTop: SPACING['2xl'], marginVertical: 0, marginRight: 0 },

  // Index
  sideIndex: { width: 200, paddingTop: SPACING['4xl'], paddingLeft: SPACING['2xl'], paddingRight: SPACING.lg },
  sideItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, minHeight: 36, paddingHorizontal: SPACING.sm },
  sideMarker: { width: 7, height: 7, transform: [{ rotate: '45deg' }] },
  topIndex: { paddingVertical: SPACING.xs },
  topIndexRow: { paddingHorizontal: SPACING.sm, gap: SPACING.xs },
  topItem: { minHeight: 40, paddingHorizontal: SPACING.md, justifyContent: 'center', borderRadius: RADIUS.sm },
  indexLabel: { fontSize: TYPOGRAPHY.sizes.md },

  // Header
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  diseaseName: { fontSize: 36, lineHeight: 40 },
  diseaseNamePhone: { fontSize: 28, lineHeight: 32 },
  scientificName: { fontStyle: 'italic', marginTop: SPACING.sm, fontSize: TYPOGRAPHY.sizes.base },
  englishName: { marginTop: 2, fontSize: TYPOGRAPHY.sizes.sm },
  factRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.lg },
  categoryMark: { width: 8, height: 8, transform: [{ rotate: '45deg' }] },
  facts: { fontSize: TYPOGRAPHY.sizes.base },
  ledger: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING['3xl'], marginTop: SPACING.xl },
  ledgerItem: { gap: SPACING.xs },
  ledgerLabel: { fontSize: TYPOGRAPHY.sizes.sm },
  ledgerValue: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold, paddingVertical: 4 },
  draft: { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.md, marginTop: SPACING.xl, borderRadius: RADIUS.sm },
  draftText: { flex: 1, fontSize: TYPOGRAPHY.sizes.md, lineHeight: 20 },
  diseasePhoto: { width: '100%', height: 260, borderRadius: RADIUS.sm, marginTop: SPACING.xl },
  lead: { fontSize: 18, lineHeight: 29, marginTop: SPACING['3xl'], maxWidth: 680 },
  paragraph: { marginTop: SPACING.lg },

  // Sections
  section: { marginTop: 72 },
  sectionTitle: { fontWeight: '600', fontSize: 26, marginBottom: SPACING.xl },
  subBlock: { marginTop: SPACING['2xl'] },
  subHeading: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold, marginBottom: SPACING.md },
  prose: { fontSize: PROSE, lineHeight: 25, maxWidth: 680 },
  dose: { fontWeight: TYPOGRAPHY.weights.semibold, fontVariant: ['tabular-nums'], paddingHorizontal: 3, borderRadius: RADIUS.sm },

  entries: { gap: SPACING.lg },
  entry: { gap: SPACING.xs },
  entryWide: { flexDirection: 'row', gap: SPACING['2xl'] },
  entryTitleWrap: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm + 2 },
  entryTitleWide: { width: 220, flexShrink: 0 },
  entryTitle: { flex: 1, fontSize: PROSE, lineHeight: 25, fontWeight: TYPOGRAPHY.weights.semibold },
  entryDetail: { flex: 1 },
  plainItem: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm + 2 },
  lozenge: { width: 7, height: 7, transform: [{ rotate: '45deg' }], marginTop: 9 },

  note: { padding: SPACING.lg, marginTop: SPACING['2xl'], borderRadius: RADIUS.sm, gap: SPACING.sm },
  noteHead: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  noteTitle: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold },
  caution: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, padding: SPACING.md, borderRadius: RADIUS.sm },
  cautionText: { flex: 1, fontSize: TYPOGRAPHY.sizes.sm, lineHeight: 19 },

  // Emergency: a field of its own colour, early in the sheet
  emergency: { marginTop: SPACING['4xl'], padding: SPACING['2xl'], borderRadius: RADIUS.sm },
  emergencyTitleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  emergencyItem: { marginTop: SPACING.sm },
  emergencyHead: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, minHeight: 40, paddingVertical: SPACING.xs },
  emergencyPresentation: { flex: 1, fontSize: PROSE, lineHeight: 25, fontWeight: TYPOGRAPHY.weights.semibold },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md, marginTop: SPACING.sm, paddingLeft: 26 },
  stepNumber: { width: 18, fontSize: PROSE, lineHeight: 25, fontWeight: TYPOGRAPHY.weights.bold, fontVariant: ['tabular-nums'] },

  reference: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.sm, maxWidth: 680 },
  referenceNumber: { width: 18, fontSize: TYPOGRAPHY.sizes.sm, lineHeight: 20, fontVariant: ['tabular-nums'] },
  referenceText: { flex: 1, fontSize: TYPOGRAPHY.sizes.sm, lineHeight: 20 },

  // Edit modal
  modalContent: { margin: SPACING.lg, borderRadius: RADIUS.lg, padding: SPACING.xl, maxHeight: '90%', maxWidth: 720, width: '100%', alignSelf: 'center' },
  modalTitle: { fontWeight: TYPOGRAPHY.weights.bold, fontSize: TYPOGRAPHY.sizes.xl, marginBottom: SPACING.lg },
  editField: { marginBottom: SPACING.md },
  editLabel: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold, marginBottom: 6 },
  editInput: { borderWidth: 1, borderRadius: RADIUS.md, padding: SPACING.sm + 2, fontSize: TYPOGRAPHY.sizes.md },
  editTextarea: { minHeight: 80, textAlignVertical: 'top' },
  editSection: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.bold, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.md, marginTop: SPACING.xl },
});
