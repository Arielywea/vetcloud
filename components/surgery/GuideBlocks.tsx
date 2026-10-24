// Reading blocks of a surgery guide (/surgery/[id]): one component per GuideBlock type.
// Panels are told apart by tone, never by border or shadow; only tables and the weight field carry a border.
import React, { useMemo, useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet, TextInput, Linking } from 'react-native';
import { Text } from 'react-native-paper';
import { Info, AlertTriangle, Lightbulb, BookOpen, ChevronDown, Play, Check } from 'lucide-react-native';
import { GuideBlock, SurgeryGuide } from '../../services/directus';
import { useTheme } from '../../contexts/ThemeContext';
import { getTextOnPrimary } from '../../constants/colors';
import { parseDose } from '../../utils/doseParser';
import { SPACING, RADIUS, TYPOGRAPHY, alpha } from '../../constants/tokens';
import { FIGURES } from './figures';

type Palette = ReturnType<typeof useTheme>['colors'];
export const PROSE = 16;

// ─── Steps ───────────────────────────────────────────────

/** Numbered steps. In operating-room mode each seal is a checkbox; `done` holds the keys already ticked */
export function StepList({ items, colors, startAt = 1, checkKey, done, onToggle }: {
  items: Extract<GuideBlock, { type: 'steps' }>['items']; colors: Palette; startAt?: number;
  checkKey?: string; done?: Set<string>; onToggle?: (key: string) => void;
}) {
  return (
    <View style={styles.steps}>
      {items.map((step, i) => {
        const key = checkKey ? `${checkKey}:${i}` : '';
        const checked = !!(checkKey && done?.has(key));
        const seal = (
          <View style={[
            styles.seal,
            { borderColor: colors.primary, backgroundColor: checked ? colors.primary : colors.surface },
          ]}>
            {checked
              ? <Check size={16} color={getTextOnPrimary(colors.primary).default} strokeWidth={2.5} />
              : <Text style={[styles.sealNumber, { color: colors.primary }]}>{startAt + i}</Text>}
          </View>
        );
        return (
          <View key={i} style={[styles.step, checked && { opacity: 0.6 }]}>
            {checkKey && onToggle ? (
              <Pressable
                onPress={() => onToggle(key)}
                accessibilityRole="checkbox"
                aria-checked={checked}
                accessibilityLabel={`Paso ${startAt + i} hecho`}
                hitSlop={8}
                style={({ pressed }) => pressed && { transform: [{ scale: 0.97 }] }}
              >
                {seal}
              </Pressable>
            ) : seal}
            <View style={styles.stepBody}>
              <Text style={[styles.prose, { color: colors.text }]}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                {step.body ? ` ${step.body}` : ''}
                {step.cite ? <Text style={[styles.cite, { color: colors.textSecondary }]}>{`  ${step.cite}`}</Text> : null}
              </Text>
              {step.bullets?.length ? <Bullets items={step.bullets} colors={colors} /> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

export function Bullets({ items, colors }: { items: string[]; colors: Palette }) {
  return (
    <View style={styles.bullets}>
      {items.map((b, i) => (
        <View key={i} style={styles.bullet}>
          <View style={[styles.lozenge, { backgroundColor: colors.textSecondary }]} />
          <Text style={[styles.prose, { color: colors.text, flex: 1 }]}>{b}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Notes ───────────────────────────────────────────────

const NOTE_LABEL = { why: 'Por qué', error: 'Ojo', tip: 'Truco', book: 'Lo que dice la literatura' } as const;

export function GuideNote({ block, colors }: { block: Extract<GuideBlock, { type: 'note' }>; colors: Palette }) {
  const tone = { why: colors.info, error: colors.error, tip: colors.warning, book: colors.primary }[block.kind];
  const Icon = { why: Info, error: AlertTriangle, tip: Lightbulb, book: BookOpen }[block.kind];
  return (
    <View style={[styles.note, { backgroundColor: alpha(tone, 0.08) }]}>
      <View style={styles.noteHead}>
        <Icon size={17} color={tone} />
        <Text style={[styles.noteTitle, { color: colors.text }]}>{block.title || NOTE_LABEL[block.kind]}</Text>
      </View>
      {block.text ? <Text style={[styles.prose, { color: colors.text }]}>{block.text}</Text> : null}
      {block.bullets?.length ? <Bullets items={block.bullets} colors={colors} /> : null}
    </View>
  );
}

// ─── Tables ──────────────────────────────────────────────

/** A real table: bordered, header on a tone, scrolls sideways on a phone instead of squeezing the columns */
export function GuideTable({ columns, rows, caption, colors, wide, firstColumnStrong }: {
  columns: string[]; rows: (string | React.ReactNode)[][]; caption?: string; colors: Palette; wide: boolean; firstColumnStrong?: boolean;
}) {
  const minWidth = wide ? undefined : Math.max(560, columns.length * 150);
  const table = (
    <View style={[styles.table, { borderColor: colors.border, minWidth }]} {...({ role: 'table' } as any)}>
      <View style={[styles.tr, { backgroundColor: colors.surfaceVariant }]} {...({ role: 'row' } as any)}>
        {columns.map((c, i) => (
          <Text key={i} style={[styles.th, { color: colors.textSecondary }]} {...({ role: 'columnheader' } as any)}>{c}</Text>
        ))}
      </View>
      {rows.map((row, r) => (
        <View key={r} style={[styles.tr, { borderTopColor: colors.border, borderTopWidth: 1 }]} {...({ role: 'row' } as any)}>
          {row.map((cell, c) => (typeof cell === 'string' || cell == null ? (
            <Text key={c} style={[styles.td, { color: colors.text }, firstColumnStrong && c === 0 && styles.tdStrong]} {...({ role: 'cell' } as any)}>{cell}</Text>
          ) : <View key={c} style={styles.tdView} {...({ role: 'cell' } as any)}>{cell}</View>))}
        </View>
      ))}
    </View>
  );
  return (
    <View style={styles.block}>
      {wide ? table : <ScrollView horizontal showsHorizontalScrollIndicator>{table}</ScrollView>}
      {caption ? <Text style={[styles.caption, { color: colors.textSecondary }]}>{caption}</Text> : null}
    </View>
  );
}

// ─── Definitions (the reference's cards, as tone panels) ─

export function DefList({ items, colors, wide }: { items: Extract<GuideBlock, { type: 'defs' }>['items']; colors: Palette; wide: boolean }) {
  return (
    <View style={[styles.defs, wide && styles.defsWide]}>
      {items.map((d, i) => (
        <View key={i} style={[styles.def, wide && styles.defWide, { backgroundColor: colors.surfaceVariant }]}>
          {d.tag ? <Text style={[styles.defTag, { color: colors.textSecondary }]}>{d.tag}</Text> : null}
          <Text style={[styles.defTitle, { color: colors.text }]}>{d.title}</Text>
          <Text style={[styles.defText, { color: colors.text }]}>{d.text}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Drugs, with the dose for this patient ───────────────

const fmt = (n: number) => (n >= 10 ? n.toFixed(0) : n >= 1 ? n.toFixed(1) : n.toFixed(2)).replace('.', ',');

export function DrugTable({ items, colors, wide, weight, onWeight }: {
  items: Extract<GuideBlock, { type: 'drugs' }>['items']; colors: Palette; wide: boolean; weight: string; onWeight: (v: string) => void;
}) {
  const kg = Number(weight.replace(',', '.'));
  const valid = Number.isFinite(kg) && kg > 0 && kg < 120;
  const rows = useMemo(() => items.map((d) => {
    let forPatient = '—';
    const p = parseDose(d.dose);
    if (valid && p) {
      // Amounts under 0.1 mg (dexmedetomidine) read better in µg; everything else in mg
      const lo = p.min * kg, hi = p.max * kg;
      const unit = p.unit === 'mcg' ? 'µg' : p.unit;
      forPatient = lo === hi ? `${fmt(lo)} ${unit}` : `${fmt(lo)}–${fmt(hi)} ${unit}`;
      if (unit === 'mg' && hi < 0.1) forPatient = lo === hi ? `${fmt(lo * 1000)} µg` : `${fmt(lo * 1000)}–${fmt(hi * 1000)} µg`;
      if (/m[aá]x/i.test(d.dose)) forPatient = `hasta ${fmt(hi)} ${unit}`;
    }
    const drug = (
      <View>
        <Text style={[styles.td, styles.tdStrong, { color: colors.text, padding: 0 }]}>{d.drug}</Text>
        {d.note ? <Text style={[styles.drugNote, { color: colors.textSecondary }]}>{d.note}</Text> : null}
      </View>
    );
    return valid ? [d.phase, drug, d.dose, d.route, forPatient] : [d.phase, drug, d.dose, d.route];
  }), [items, valid, kg, colors]);

  return (
    <View style={styles.block}>
      <View style={styles.weightRow}>
        <Text style={[styles.weightLabel, { color: colors.text }]}>Dosis para un paciente de</Text>
        <TextInput
          value={weight}
          onChangeText={(t) => onWeight(t.replace(/[^\d.,]/g, '').slice(0, 5))}
          keyboardType="decimal-pad"
          placeholder="—"
          placeholderTextColor={colors.textLight}
          accessibilityLabel="Peso del paciente en kg"
          style={[styles.weightInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
        />
        <Text style={[styles.weightLabel, { color: colors.text }]}>kg</Text>
      </View>
      <GuideTable
        colors={colors}
        wide={wide}
        columns={valid ? ['Fase', 'Fármaco', 'Dosis', 'Vía', `Para ${fmt(kg)} kg`] : ['Fase', 'Fármaco', 'Dosis', 'Vía']}
        rows={rows}
        caption="Referencia para un paciente sano. Ajusta al estado del paciente y al protocolo de tu clínica; los volúmenes dependen de la concentración que uses."
      />
    </View>
  );
}

// ─── Self-assessment ─────────────────────────────────────

export function QuizItem({ q, a, colors }: { q: string; a: string; colors: Palette }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={[styles.quiz, { backgroundColor: colors.surfaceVariant }]}>
      <Pressable onPress={() => setOpen(!open)} accessibilityRole="button" aria-expanded={open} style={styles.quizHead}>
        <View style={{ transform: [{ rotate: open ? '0deg' : '-90deg' }], marginTop: 3 }}>
          <ChevronDown size={18} color={colors.primary} />
        </View>
        <Text style={[styles.quizQ, { color: colors.text }]}>{q}</Text>
      </Pressable>
      {open ? <Text style={[styles.prose, styles.quizA, { color: colors.text }]}>{a}</Text> : null}
    </View>
  );
}

// ─── Videos ──────────────────────────────────────────────

export function VideoList({ videos, colors }: { videos: NonNullable<SurgeryGuide['videos']>; colors: Palette }) {
  return (
    <View style={styles.videos}>
      {videos.map((v, i) => (
        <Pressable
          key={i}
          onPress={() => Linking.openURL(v.url)}
          accessibilityRole="link"
          accessibilityLabel={`${v.title}, ${v.channel}, en ${v.lang}. Abre YouTube`}
          style={({ hovered, pressed }: any) => [
            styles.video,
            { backgroundColor: hovered ? alpha(colors.primary, 0.06) : colors.surfaceVariant },
            pressed && { transform: [{ scale: 0.97 }] },
          ]}
        >
          <View style={[styles.play, { backgroundColor: colors.error }]}>
            <Play size={14} color={getTextOnPrimary(colors.error).default} fill={getTextOnPrimary(colors.error).default} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.videoTitle, { color: colors.text }]}>{v.title}</Text>
            <Text style={[styles.videoMeta, { color: colors.textSecondary }]}>
              {[v.channel, v.lang, v.note].filter(Boolean).join(' · ')}
            </Text>
          </View>
          <Text style={[styles.videoGo, { color: colors.primary }]}>YouTube ↗</Text>
        </Pressable>
      ))}
    </View>
  );
}

// ─── Instrument table ────────────────────────────────────

/** "Mango n.º 3 con hoja 10, tijeras de Mayo y Metzenbaum, pinzas (Adson, Brown)" → one item per comma outside parentheses */
export function splitMaterials(text: string | null | undefined): string[] {
  const out: string[] = [];
  let depth = 0, cur = '';
  // A sentence break also separates items ("… gasas. Gato: hoja 15 …")
  for (const ch of (text || '').replace(/\.\s+(?=[A-ZÁÉÍÓÚÑ])/g, ';')) {
    if (ch === '(') depth++;
    if (ch === ')') depth = Math.max(0, depth - 1);
    if ((ch === ',' || ch === ';') && depth === 0) { out.push(cur); cur = ''; } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim().replace(/\.$/, '')).filter(Boolean).map((s) => s.charAt(0).toUpperCase() + s.slice(1));
}

/** Checklist to lay out the instrument table; ticks are kept with the guide's other ticks on this device */
export function TableChecklist({ items, colors, wide, done, onToggle }: {
  items: string[]; colors: Palette; wide: boolean; done: Set<string>; onToggle: (key: string) => void;
}) {
  return (
    <View style={[styles.mesa, wide && styles.mesaWide]}>
      {items.map((item, i) => {
        const key = `mesa:${i}`;
        const on = done.has(key);
        return (
          <Pressable
            key={key}
            onPress={() => onToggle(key)}
            accessibilityRole="checkbox"
            aria-checked={on}
            style={({ hovered, pressed }: any) => [
              styles.mesaItem, wide && styles.mesaItemWide,
              { backgroundColor: hovered ? alpha(colors.primary, 0.05) : 'transparent' },
              pressed && { transform: [{ scale: 0.97 }] },
            ]}
          >
            <View style={[styles.box, { borderColor: on ? colors.primary : colors.border, backgroundColor: on ? colors.primary : colors.surface }]}>
              {on ? <Check size={14} color={getTextOnPrimary(colors.primary).default} strokeWidth={2.5} /> : null}
            </View>
            <Text style={[styles.mesaText, { color: on ? colors.textSecondary : colors.text }, on && { textDecorationLine: 'line-through' }]}>{item}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── One block ───────────────────────────────────────────

export function Block({ block, colors, wide, weight, onWeight, checkKey, done, onToggle }: {
  block: GuideBlock; colors: Palette; wide: boolean; weight: string; onWeight: (v: string) => void;
  checkKey?: string; done?: Set<string>; onToggle?: (key: string) => void;
}) {
  switch (block.type) {
    case 'steps': return <StepList items={block.items} colors={colors} checkKey={checkKey} done={done} onToggle={onToggle} />;
    case 'note': return <GuideNote block={block} colors={colors} />;
    case 'table': return <GuideTable columns={block.columns} rows={block.rows} caption={block.caption} colors={colors} wide={wide} firstColumnStrong />;
    case 'list': return <View style={styles.block}><Bullets items={block.items} colors={colors} /></View>;
    case 'defs': return <DefList items={block.items} colors={colors} wide={wide} />;
    case 'drugs': return <DrugTable items={block.items} colors={colors} wide={wide} weight={weight} onWeight={onWeight} />;
    case 'figure': {
      const Figure = FIGURES[block.key];
      if (!Figure) return null;
      return (
        <View style={[styles.figure, { backgroundColor: colors.surfaceVariant }]}>
          <ScrollView horizontal={!wide} showsHorizontalScrollIndicator={false}>
            <Figure colors={colors} />
          </ScrollView>
          <Text style={[styles.caption, { color: colors.textSecondary }]}>{block.caption}</Text>
        </View>
      );
    }
    default: return null;
  }
}

export const styles = StyleSheet.create({
  prose: { fontSize: PROSE, lineHeight: 25, maxWidth: 680 },
  block: { marginTop: SPACING.lg },
  cite: { fontSize: TYPOGRAPHY.sizes.sm },

  steps: { gap: SPACING.lg, marginTop: SPACING.lg },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md },
  seal: { width: 30, height: 30, borderRadius: RADIUS.full, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  sealNumber: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold, fontVariant: ['tabular-nums'] },
  stepBody: { flex: 1, paddingTop: 2 },
  stepTitle: { fontWeight: TYPOGRAPHY.weights.semibold },
  bullets: { gap: SPACING.xs, marginTop: SPACING.sm },
  bullet: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm + 2 },
  lozenge: { width: 6, height: 6, transform: [{ rotate: '45deg' }], marginTop: 10 },

  note: { padding: SPACING.lg, marginTop: SPACING.xl, borderRadius: RADIUS.sm, gap: SPACING.sm, maxWidth: 720 },
  noteHead: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  noteTitle: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold },

  table: { borderWidth: 1, borderRadius: RADIUS.sm, overflow: 'hidden' },
  tr: { flexDirection: 'row' },
  th: { flex: 1, padding: SPACING.md, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
  td: { flex: 1, padding: SPACING.md, fontSize: TYPOGRAPHY.sizes.md, lineHeight: 21 },
  tdView: { flex: 1, padding: SPACING.md },
  tdStrong: { fontWeight: TYPOGRAPHY.weights.semibold },
  caption: { fontSize: TYPOGRAPHY.sizes.sm, lineHeight: 19, marginTop: SPACING.sm, maxWidth: 680 },

  defs: { gap: SPACING.md, marginTop: SPACING.lg },
  defsWide: { flexDirection: 'row', flexWrap: 'wrap' },
  def: { padding: SPACING.lg, borderRadius: RADIUS.sm, gap: SPACING.xs },
  defWide: { flexBasis: 300, flexGrow: 1 },
  defTag: { fontSize: TYPOGRAPHY.sizes.sm },
  defTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.semibold },
  defText: { fontSize: TYPOGRAPHY.sizes.base, lineHeight: 23 },

  weightRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md, flexWrap: 'wrap' },
  weightLabel: { fontSize: TYPOGRAPHY.sizes.base },
  weightInput: { width: 72, minHeight: 40, borderWidth: 1, borderRadius: RADIUS.sm, paddingHorizontal: SPACING.sm, fontSize: TYPOGRAPHY.sizes.base, fontVariant: ['tabular-nums'], textAlign: 'center' },
  drugNote: { fontSize: TYPOGRAPHY.sizes.sm, lineHeight: 18, marginTop: 2 },

  quiz: { borderRadius: RADIUS.sm, marginTop: SPACING.sm, maxWidth: 720 },
  quizHead: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, padding: SPACING.md, minHeight: 44 },
  quizQ: { flex: 1, fontSize: PROSE, lineHeight: 24, fontWeight: TYPOGRAPHY.weights.medium },
  quizA: { paddingHorizontal: SPACING.md, paddingLeft: SPACING.md + 26, paddingBottom: SPACING.md },

  videos: { gap: SPACING.sm, marginTop: SPACING.lg, maxWidth: 720 },
  video: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md, borderRadius: RADIUS.sm },
  play: { width: 34, height: 24, borderRadius: RADIUS.xl, alignItems: 'center', justifyContent: 'center' },
  videoTitle: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold, lineHeight: 21 },
  videoMeta: { fontSize: TYPOGRAPHY.sizes.sm, marginTop: 2 },
  videoGo: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.medium },

  figure: { padding: SPACING.lg, borderRadius: RADIUS.sm, marginTop: SPACING.xl },

  mesa: { marginTop: SPACING.lg, maxWidth: 720 },
  mesaWide: { flexDirection: 'row', flexWrap: 'wrap' },
  mesaItem: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.xs, minHeight: 44, borderRadius: RADIUS.sm },
  mesaItemWide: { width: '50%' },
  box: { width: 20, height: 20, borderWidth: 1.5, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  mesaText: { flex: 1, fontSize: TYPOGRAPHY.sizes.base, lineHeight: 23 },
});
