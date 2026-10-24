// Surgery guide: the step-by-step flow of a surgical study guide (numbered sections, numbered steps,
// notes, layer-by-layer closure, self-assessment, sources). Without a guide yet, the old text fields.
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, ScrollView, StyleSheet, Pressable, Platform, useWindowDimensions,
  NativeSyntheticEvent, NativeScrollEvent, LayoutChangeEvent,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { AlertTriangle, ClipboardCheck, RotateCcw } from 'lucide-react-native';
import { useSurgery } from '../../hooks/useDirectus';
import { Surgery, SurgeryGuide, GuideSection } from '../../services/directus';
import { useTheme } from '../../contexts/ThemeContext';
import { SkeletonCard } from '../../components/ui/Skeleton';
import VButton from '../../components/ui/Button';
import DisplayText from '../../components/ui/DisplayText';
import { Block, Bullets, GuideTable, QuizItem, VideoList, PROSE } from '../../components/surgery/GuideBlocks';
import { CONTAMINATION_LABELS, SPECIES_SHORT, surgeryCategoryLabel, pushRecentSurgery } from '../../constants/surgeryMeta';
import { SPACING, RADIUS, TYPOGRAPHY, alpha } from '../../constants/tokens';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type Palette = ReturnType<typeof useTheme>['colors'];
type IndexEntry = { id: string; label: string; number?: string; sub?: { id: string; label: string }[] };

const pad = (n: number) => String(n).padStart(2, '0');

// The old free-text fields, shown in the same frame while a surgery has no guide
const LEGACY_SECTIONS: { key: keyof Surgery; label: string }[] = [
  { key: 'indicaciones', label: 'Indicaciones' },
  { key: 'tecnica_quirurgica', label: 'Técnica quirúrgica' },
  { key: 'material_quirurgico', label: 'Instrumental y material' },
  { key: 'tipo_sutura', label: 'Suturas' },
  { key: 'manejo_anestesico_sugerido', label: 'Anestesia y analgesia' },
  { key: 'complicaciones_frecuentes', label: 'Complicaciones' },
  { key: 'consideraciones_por_raza', label: 'Consideraciones por raza' },
  { key: 'consideraciones_comorbilidades', label: 'Comorbilidades' },
];

/** Operating-room mode: ticked steps per surgery, kept on this device only */
function useDoneSteps(id: string | undefined) {
  const key = `vetcloud_surgery_done_${id}`;
  const [done, setDone] = useState<Set<string>>(new Set());
  useEffect(() => {
    try { setDone(new Set(JSON.parse(globalThis.localStorage?.getItem(key) || '[]'))); } catch { setDone(new Set()); }
  }, [key]);
  const save = (next: Set<string>) => {
    setDone(next);
    try { globalThis.localStorage?.setItem(key, JSON.stringify([...next])); } catch { /* storage blocked */ }
  };
  const toggle = (k: string) => { const next = new Set(done); next.has(k) ? next.delete(k) : next.add(k); save(next); };
  return { done, toggle, reset: () => save(new Set()) };
}

/** Keeps the screen on while operating-room mode is on (web Wake Lock; ignored where unsupported) */
function useWakeLock(on: boolean) {
  useEffect(() => {
    if (!on || Platform.OS !== 'web') return;
    let lock: any = null;
    const nav: any = globalThis.navigator;
    nav?.wakeLock?.request?.('screen').then((l: any) => { lock = l; }).catch(() => { /* denied or unsupported */ });
    return () => { lock?.release?.().catch(() => {}); };
  }, [on]);
}

export default function SurgeryGuideScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, onPrimaryText } = useTheme();
  const { width } = useWindowDimensions();
  const wide = width >= 1000;
  const reduced = useReducedMotion();
  const { surgery, loading } = useSurgery(id || null);
  const [weight, setWeight] = useState('');
  const [orMode, setOrMode] = useState(false);
  const { done, toggle, reset } = useDoneSteps(id);
  useWakeLock(orMode);

  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<Record<string, number>>({});
  const subY = useRef<Record<string, { parent: string; y: number }>>({});
  const [active, setActive] = useState('inicio');

  useEffect(() => { if (surgery) pushRecentSurgery(surgery.id); }, [surgery]);

  const guide: SurgeryGuide | null = surgery?.guide || null;

  const index = useMemo<IndexEntry[]>(() => {
    if (!surgery) return [];
    const list: IndexEntry[] = [{ id: 'inicio', label: guide ? 'Antes de entrar a pabellón' : 'Resumen' }];
    if (!guide) {
      LEGACY_SECTIONS.forEach((s, i) => { if (surgery[s.key]) list.push({ id: String(s.key), label: s.label, number: pad(i + 1) }); });
      if (surgery.fuente) list.push({ id: 'fuentes', label: 'Fuente' });
      return list;
    }
    let n = 0;
    if (guide.indications?.length) list.push({ id: 'indicaciones', label: 'Indicaciones', number: pad(++n) });
    guide.sections.forEach((s) => list.push({
      id: s.id, label: s.title, number: pad(++n),
      sub: s.subsections?.map((x) => ({ id: x.id, label: x.title.replace(/^[A-Z]\.\s*/, '') })),
    }));
    if (guide.closure?.length) list.push({ id: 'capas', label: 'Resumen capa por capa', number: pad(++n) });
    if (guide.complications?.length) list.push({ id: 'complicaciones', label: 'Complicaciones', number: pad(++n) });
    if (guide.videos?.length) list.push({ id: 'videos', label: 'Videos', number: pad(++n) });
    if (guide.quiz?.length) list.push({ id: 'autoevaluacion', label: 'Autoevaluación', number: pad(++n) });
    if (guide.sources?.length) list.push({ id: 'fuentes', label: 'Fuentes' });
    return list;
  }, [surgery, guide]);

  const measure = useCallback((key: string) => (e: LayoutChangeEvent) => {
    sectionY.current[key] = e.nativeEvent.layout.y;
  }, []);
  const measureSub = useCallback((parent: string, key: string) => (e: LayoutChangeEvent) => {
    subY.current[key] = { parent, y: e.nativeEvent.layout.y };
  }, []);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    const probe = contentOffset.y + 140;
    let current = index[0]?.id || 'inicio';
    for (const entry of index) {
      const y = sectionY.current[entry.id];
      if (y != null && y <= probe) current = entry.id;
    }
    // The last short sections never reach the probe line; at the bottom, the last one is current
    if (contentOffset.y + layoutMeasurement.height >= contentSize.height - 8 && index.length) current = index[index.length - 1].id;
    setActive((prev) => (prev === current ? prev : current));
  }, [index]);

  const jumpTo = (key: string) => {
    const sub = subY.current[key];
    const y = sub ? (sectionY.current[sub.parent] ?? 0) + sub.y : sectionY.current[key];
    if (y == null) return;
    setActive(sub ? sub.parent : key);
    scrollRef.current?.scrollTo({ y: Math.max(0, y - SPACING.lg), animated: !reduced });
  };

  if (loading) {
    return <View style={[styles.container, { backgroundColor: colors.background }]}><SkeletonCard style={{ margin: SPACING.lg }} /></View>;
  }
  if (!surgery) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ textAlign: 'center', marginTop: 40, color: colors.textSecondary }}>Cirugía no encontrada</Text>
      </View>
    );
  }

  const numberOf = (key: string) => index.find((e) => e.id === key)?.number;
  const sectionHead = (key: string, title: string) => (
    <View style={styles.sectionHead}>
      {numberOf(key) ? <Text style={[styles.sectionNumber, { color: colors.primary }]}>{numberOf(key)}</Text> : null}
      <DisplayText style={[styles.sectionTitle, !wide && styles.sectionTitlePhone, { color: colors.text }]}>{title}</DisplayText>
    </View>
  );
  const blockProps = { colors, wide, weight, onWeight: setWeight, done, onToggle: orMode ? toggle : undefined };

  const renderSection = (s: GuideSection) => (
    <View key={s.id} onLayout={measure(s.id)} style={styles.section}>
      {sectionHead(s.id, s.title)}
      {s.intro ? <Text style={[styles.intro, { color: colors.textSecondary }]}>{s.intro}</Text> : null}
      {s.blocks.map((b, i) => <Block key={i} block={b} {...blockProps} checkKey={orMode ? `${s.id}.${i}` : undefined} />)}
      {s.subsections?.map((sub) => (
        <View key={sub.id} onLayout={measureSub(s.id, sub.id)} style={styles.subsection}>
          <DisplayText style={[styles.subTitle, { color: colors.text }]}>{sub.title}</DisplayText>
          {sub.intro ? <Text style={[styles.intro, { color: colors.textSecondary }]}>{sub.intro}</Text> : null}
          {sub.blocks.map((b, i) => <Block key={i} block={b} {...blockProps} checkKey={orMode ? `${sub.id}.${i}` : undefined} />)}
        </View>
      ))}
    </View>
  );

  const indexView = (
    <View style={wide ? styles.sideIndex : [styles.topIndex, { backgroundColor: colors.background }]} {...({ role: 'navigation', 'aria-label': 'Contenido de la guía' } as any)}>
      {wide ? <Text style={[styles.indexHeading, { color: colors.textSecondary }]}>Contenido</Text> : null}
      <ScrollView horizontal={!wide} showsHorizontalScrollIndicator={false} contentContainerStyle={wide ? undefined : styles.topIndexRow}>
        {index.map((entry) => {
          const on = entry.id === active;
          return (
            <View key={entry.id}>
              <Pressable
                onPress={() => jumpTo(entry.id)}
                accessibilityRole="link"
                aria-current={on ? 'location' : undefined}
                style={({ hovered }: any) => [
                  wide ? styles.sideItem : styles.topItem,
                  !wide && on && { backgroundColor: colors.surface },
                  hovered && !on && { backgroundColor: alpha(colors.primary, 0.05) },
                ]}
              >
                {wide ? <View style={[styles.sideMarker, { backgroundColor: on ? colors.primary : 'transparent' }]} /> : null}
                {entry.number && wide ? <Text style={[styles.indexNumber, { color: colors.textSecondary }]}>{entry.number}</Text> : null}
                <Text style={[styles.indexLabel, { color: on ? colors.text : colors.textSecondary }, on && { fontWeight: TYPOGRAPHY.weights.semibold }]} numberOfLines={wide ? 2 : 1}>
                  {entry.label}
                </Text>
              </Pressable>
              {/* Subsections only for the section being read, so the index stays short */}
              {wide && on && entry.sub?.map((sub) => (
                <Pressable
                  key={sub.id}
                  onPress={() => jumpTo(sub.id)}
                  accessibilityRole="link"
                  style={({ hovered }: any) => [styles.subItem, hovered && { backgroundColor: alpha(colors.primary, 0.05) }]}
                >
                  <Text style={[styles.subLabel, { color: colors.textSecondary }]} numberOfLines={2}>{sub.label}</Text>
                </Pressable>
              ))}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );

  const meta = guide?.meta;
  const ledger = meta ? [
    ['Duración', meta.duration],
    ['Dificultad', meta.difficulty.charAt(0).toUpperCase() + meta.difficulty.slice(1)],
    ['Herida', CONTAMINATION_LABELS[meta.contamination] || meta.contamination],
  ] : [];
  const eyebrow = [surgeryCategoryLabel(surgery.category), meta?.species.map((s) => SPECIES_SHORT[s] || s).join(' y ')].filter(Boolean).join(' · ');
  const stepCount = guide ? countSteps(guide) : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {!wide && indexView}
      <View style={styles.frame}>
        {wide && indexView}
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={[styles.sheet, { backgroundColor: colors.surface }, !wide && styles.sheetPhone]}
          onScroll={onScroll}
          scrollEventThrottle={32}
        >
          {/* Header */}
          <View onLayout={measure('inicio')}>
            <Text style={[styles.eyebrow, { color: colors.textSecondary }]}>{eyebrow}</Text>
            <DisplayText style={[styles.name, !wide && styles.namePhone, { color: colors.text }]}>{surgery.nombre_cirugia}</DisplayText>
            {guide?.lede ? <Text style={[styles.lede, { color: colors.text }]}>{guide.lede}</Text> : null}

            {ledger.length ? (
              <View style={styles.ledger}>
                {ledger.map(([label, value]) => (
                  <View key={label} style={styles.ledgerItem}>
                    <Text style={[styles.ledgerLabel, { color: colors.textSecondary }]}>{label}</Text>
                    <Text style={[styles.ledgerValue, { color: colors.text }]}>{value}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {guide?.draft ? (
              <View accessibilityRole="alert" style={[styles.draft, { backgroundColor: alpha(colors.warning, 0.1) }]}>
                <AlertTriangle size={16} color={colors.warning} style={{ marginTop: 2 }} />
                <Text style={[styles.draftText, { color: colors.text }]}>
                  Guía en borrador: un veterinario aún no revisa su técnica y sus dosis. Verifícalas antes de operar.
                </Text>
              </View>
            ) : null}

            {guide ? (
              <View style={styles.orRow}>
                <VButton
                  variant={orMode ? 'filled' : 'secondary'}
                  size="sm"
                  onPress={() => setOrMode(!orMode)}
                  icon={<ClipboardCheck size={16} color={orMode ? onPrimaryText.default : colors.primary} />}
                >
                  {orMode ? 'Modo pabellón activo' : 'Modo pabellón'}
                </VButton>
                {orMode ? (
                  <>
                    <Text style={[styles.orHint, { color: colors.textSecondary }]}>
                      {`Toca cada número al terminar el paso · ${done.size} de ${stepCount}`}
                    </Text>
                    {done.size ? (
                      <VButton variant="ghost" size="sm" onPress={reset} icon={<RotateCcw size={15} color={colors.primary} />}>Reiniciar</VButton>
                    ) : null}
                  </>
                ) : null}
              </View>
            ) : null}

            {guide?.before_you_start?.length ? (
              <View style={[styles.start, { backgroundColor: alpha(colors.primary, 0.06) }]}>
                <Text style={[styles.startTitle, { color: colors.text }]}>Antes de entrar a pabellón</Text>
                <View style={styles.startList}>
                  {guide.before_you_start.map((t, i) => (
                    <View key={i} style={styles.startItem}>
                      <Text style={[styles.startNumber, { color: colors.primary }]}>{i + 1}</Text>
                      <Text style={[styles.prose, { color: colors.text, flex: 1 }]}>{t}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </View>

          {guide ? (
            <>
              {guide.indications?.length ? (
                <View onLayout={measure('indicaciones')} style={styles.section}>
                  {sectionHead('indicaciones', 'Indicaciones')}
                  <Bullets items={guide.indications} colors={colors} />
                </View>
              ) : null}

              {guide.sections.map(renderSection)}

              {guide.closure?.length ? (
                <View onLayout={measure('capas')} style={styles.section}>
                  {sectionHead('capas', 'Resumen capa por capa')}
                  <GuideTable
                    colors={colors}
                    wide={wide}
                    firstColumnStrong
                    columns={['Capa', 'Hilo', 'Calibre', 'Patrón', 'Por qué']}
                    rows={guide.closure.map((c) => [c.layer, c.suture, c.gauge, c.pattern, c.why])}
                  />
                </View>
              ) : null}

              {guide.complications?.length ? (
                <View onLayout={measure('complicaciones')} style={styles.section}>
                  {sectionHead('complicaciones', 'Complicaciones')}
                  <GuideTable
                    colors={colors}
                    wide={wide}
                    firstColumnStrong
                    columns={['Complicación', 'Cómo prevenirla', 'Qué hacer']}
                    rows={guide.complications.map((c) => [c.name, c.prevent, c.manage])}
                  />
                </View>
              ) : null}

              {guide.videos?.length ? (
                <View onLayout={measure('videos')} style={styles.section}>
                  {sectionHead('videos', 'Videos')}
                  <Text style={[styles.intro, { color: colors.textSecondary }]}>
                    Mira primero un video completo sin pausar, luego vuelve a los pasos. Si un video hace algo distinto a esta guía, la guía sigue la literatura citada.
                  </Text>
                  <VideoList videos={guide.videos} colors={colors} />
                </View>
              ) : null}

              {guide.quiz?.length ? (
                <View onLayout={measure('autoevaluacion')} style={styles.section}>
                  {sectionHead('autoevaluacion', 'Autoevaluación')}
                  {guide.quiz.map((q, i) => <QuizItem key={i} q={q.q} a={q.a} colors={colors} />)}
                </View>
              ) : null}

              {guide.sources?.length ? (
                <View onLayout={measure('fuentes')} style={styles.section}>
                  {sectionHead('fuentes', 'Fuentes')}
                  {guide.sources.map((s, i) => (
                    <View key={i} style={styles.reference}>
                      <Text style={[styles.referenceNumber, { color: colors.textSecondary }]}>{i + 1}</Text>
                      <Text style={[styles.referenceText, { color: colors.textSecondary }]}>
                        {s.text}
                        <Text style={{ color: s.kind === 'libro' ? colors.primary : colors.info }}>{s.kind === 'libro' ? '  Libro' : '  Complemento'}</Text>
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </>
          ) : (
            <LegacyGuide surgery={surgery} colors={colors} measure={measure} sectionHead={sectionHead} />
          )}
        </ScrollView>
      </View>
    </View>
  );
}

function countSteps(guide: SurgeryGuide) {
  let n = 0;
  const walk = (s: GuideSection) => {
    s.blocks.forEach((b) => { if (b.type === 'steps') n += b.items.length; });
    s.subsections?.forEach(walk);
  };
  guide.sections.forEach(walk);
  return n;
}

function LegacyGuide({ surgery, colors, measure, sectionHead }: {
  surgery: Surgery; colors: Palette; measure: (k: string) => (e: LayoutChangeEvent) => void; sectionHead: (k: string, t: string) => React.ReactNode;
}) {
  return (
    <>
      {LEGACY_SECTIONS.map((s) => {
        const text = surgery[s.key] as string | null;
        if (!text) return null;
        return (
          <View key={String(s.key)} onLayout={measure(String(s.key))} style={styles.section}>
            {sectionHead(String(s.key), s.label)}
            <Text style={[styles.prose, { color: colors.text }]}>{text}</Text>
          </View>
        );
      })}
      {surgery.fuente ? (
        <View onLayout={measure('fuentes')} style={styles.section}>
          {sectionHead('fuentes', 'Fuente')}
          <Text style={[styles.referenceText, { color: colors.textSecondary }]}>{surgery.fuente}</Text>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  frame: { flex: 1, flexDirection: 'row', justifyContent: 'center', width: '100%', maxWidth: 1180, alignSelf: 'center' },
  scroll: { flex: 1 },
  sheet: { paddingHorizontal: SPACING['5xl'], paddingTop: SPACING['4xl'], paddingBottom: 120, marginVertical: SPACING['2xl'], marginRight: SPACING['2xl'], maxWidth: 880 },
  sheetPhone: { paddingHorizontal: SPACING.lg, paddingTop: SPACING['2xl'], marginVertical: 0, marginRight: 0 },

  // Index
  sideIndex: { width: 240, paddingTop: SPACING['4xl'], paddingLeft: SPACING['2xl'], paddingRight: SPACING.lg },
  indexHeading: { fontSize: TYPOGRAPHY.sizes.sm, marginBottom: SPACING.sm, paddingHorizontal: SPACING.sm },
  sideItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, minHeight: 36, paddingHorizontal: SPACING.sm, paddingVertical: 4 },
  sideMarker: { width: 7, height: 7, transform: [{ rotate: '45deg' }] },
  indexNumber: { fontSize: TYPOGRAPHY.sizes.xs, fontVariant: ['tabular-nums'], width: 18 },
  indexLabel: { fontSize: TYPOGRAPHY.sizes.md, flexShrink: 1 },
  subItem: { paddingLeft: 49, paddingRight: SPACING.sm, paddingVertical: 5, minHeight: 30, justifyContent: 'center' },
  subLabel: { fontSize: TYPOGRAPHY.sizes.sm, lineHeight: 18 },
  topIndex: { paddingVertical: SPACING.xs },
  topIndexRow: { paddingHorizontal: SPACING.sm, gap: SPACING.xs },
  topItem: { minHeight: 40, paddingHorizontal: SPACING.md, justifyContent: 'center', borderRadius: RADIUS.sm },

  // Header
  eyebrow: { fontSize: TYPOGRAPHY.sizes.base },
  name: { fontSize: 40, lineHeight: 44, marginTop: SPACING.sm },
  namePhone: { fontSize: 30, lineHeight: 34 },
  lede: { fontSize: 18, lineHeight: 29, marginTop: SPACING.xl, maxWidth: 680 },
  ledger: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING['3xl'], marginTop: SPACING.xl },
  ledgerItem: { gap: 2 },
  ledgerLabel: { fontSize: TYPOGRAPHY.sizes.sm },
  ledgerValue: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold },
  draft: { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.md, marginTop: SPACING.xl, borderRadius: RADIUS.sm, maxWidth: 720 },
  draftText: { flex: 1, fontSize: TYPOGRAPHY.sizes.md, lineHeight: 20 },
  orRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: SPACING.md, marginTop: SPACING.xl },
  orHint: { fontSize: TYPOGRAPHY.sizes.sm },
  start: { padding: SPACING.xl, marginTop: SPACING['2xl'], borderRadius: RADIUS.sm, maxWidth: 720 },
  startTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.semibold },
  startList: { gap: SPACING.md, marginTop: SPACING.md },
  startItem: { flexDirection: 'row', gap: SPACING.md },
  startNumber: { width: 14, fontSize: PROSE, lineHeight: 25, fontWeight: TYPOGRAPHY.weights.bold, fontVariant: ['tabular-nums'] },

  // Sections
  section: { marginTop: 72 },
  sectionHead: { marginBottom: SPACING.sm },
  sectionNumber: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.semibold, fontVariant: ['tabular-nums'], marginBottom: 2 },
  sectionTitle: { fontWeight: '600', fontSize: 30, lineHeight: 34 },
  sectionTitlePhone: { fontSize: 26, lineHeight: 30 },
  subsection: { marginTop: SPACING['4xl'] },
  subTitle: { fontWeight: '600', fontSize: 22, lineHeight: 27 },
  intro: { fontSize: PROSE, lineHeight: 25, marginTop: SPACING.sm, maxWidth: 680 },
  prose: { fontSize: PROSE, lineHeight: 25, maxWidth: 680 },

  reference: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.sm, maxWidth: 720 },
  referenceNumber: { width: 18, fontSize: TYPOGRAPHY.sizes.sm, lineHeight: 20, fontVariant: ['tabular-nums'] },
  referenceText: { flex: 1, fontSize: TYPOGRAPHY.sizes.sm, lineHeight: 20 },
});
