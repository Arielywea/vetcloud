import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native';
import { Text, Modal, Portal } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import {
  Pencil, Heart, Stethoscope, Microscope, Pill, ShieldCheck, FlaskConical, ScanLine, GitCompare,
  CheckCircle2, Circle, AlertTriangle, Dna, BookOpen, TrendingUp, Clock, MapPin, Info, Dog, Cat, PawPrint,
} from 'lucide-react-native';
import { useDisease, useFavorites } from '../../hooks/useDirectus';
import { useAuth } from '../../hooks/useAuth';
import { DirectusDisease } from '../../services/directus';
import { DISEASE_CATEGORIES, DiseaseCategoryKey, PROGNOSIS_LABELS, LIFE_STAGE_LABELS, SPECIES_LABELS, categoryLabel } from '../../constants/diseaseMeta';
import { SEVERITY_LABELS, SEVERITY_TONE } from '../../constants/colors';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../components/ui/VToast';
import { SkeletonCard } from '../../components/ui/Skeleton';
import VCard from '../../components/ui/Card';
import VBadge from '../../components/ui/Badge';
import VButton from '../../components/ui/Button';
import DisplayText from '../../components/ui/DisplayText';
import { SPACING, RADIUS, TYPOGRAPHY, alpha } from '../../constants/tokens';

type TabKey = 'signs' | 'diagnosis' | 'treatment' | 'prevention';
const TABS: { key: TabKey; label: string; Icon: typeof Pill }[] = [
  { key: 'signs', label: 'Signos', Icon: Stethoscope },
  { key: 'diagnosis', label: 'Diagnóstico', Icon: Microscope },
  { key: 'treatment', label: 'Tratamiento', Icon: Pill },
  { key: 'prevention', label: 'Prevención', Icon: ShieldCheck },
];

/** "Vómitos proyectivos: detalle…" → ["Vómitos proyectivos", "detalle…"] */
function splitItem(text: string): [string, string] {
  const i = text.indexOf(':');
  if (i > 0 && i < 80) return [text.slice(0, i).trim(), text.slice(i + 1).trim()];
  return [text, ''];
}

/** The seed stores emergencies as "PRESENTACIÓN: …\nPROTOCOLO:\n  - paso" */
type EmergencyBlock = { presentation: string; steps: string[]; rest: string };
// An entry may describe several emergencies, each as "PRESENTACIÓN: …\nPROTOCOLO:\n  - step"
function parseEmergency(text: string): EmergencyBlock[] {
  return text.split(/(?=PRESENTACI[ÓO]N:)/i).map(s => s.trim()).filter(Boolean).map((block) => {
    const presentation = block.match(/PRESENTACI[ÓO]N:\s*([\s\S]*?)(?:\n\s*PROTOCOLO:|$)/i)?.[1]?.trim() || '';
    const protocol = block.match(/PROTOCOLO:\s*([\s\S]*)$/i)?.[1] || '';
    const steps = protocol.split('\n').map(l => l.replace(/^\s*[-•]\s*/, '').trim()).filter(Boolean);
    return presentation || steps.length ? { presentation, steps, rest: '' } : { presentation: '', steps: [], rest: block };
  });
}

// Defined at module scope: components created inside render remount their TextInput on every
// keystroke, which dropped focus after each letter in the edit form.
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

export default function DiseaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { disease, loading, updateDisease } = useDisease(id || null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const toast = useToast();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<TabKey>('signs');
  const [editVisible, setEditVisible] = useState(false);
  const [editData, setEditData] = useState<Partial<DirectusDisease>>({});
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    if (disease) {
      setEditData({
        name: disease.name,
        scientific_name: disease.scientific_name,
        english_name: disease.english_name,
        description: disease.description,
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
  const SpeciesIcon = disease.species === 'dog' ? Dog : disease.species === 'cat' ? Cat : PawPrint;
  const emergency = treatment.emergency ? parseEmergency(treatment.emergency) : null;
  const rawNotes: string = treatment.notes || '';
  const notesTitle = /^Chile:/i.test(rawNotes) ? 'Disponibilidad en Chile' : 'Notas';
  const notes = rawNotes.replace(/^Chile:\s*/i, '');
  // Entries added from scripts/add-diseases-2026-10.js start their notes with this marker until a vet reviews them
  const isDraft = /^Borrador pendiente de revisión/i.test(rawNotes);

  const inputStyle = [styles.editInput, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }];

  const ItemList = ({ items, Icon, iconColor }: { items: string[]; Icon: typeof Pill; iconColor: string }) => (
    <>
      {items.map((raw, i) => {
        const [title, detail] = splitItem(raw);
        return (
          <View key={i} style={styles.listItem}>
            {/* Plain items get a small lozenge: hollow circles read as unchecked radio buttons */}
            {Icon === Circle
              ? <View style={[styles.lozenge, { backgroundColor: iconColor }]} />
              : <Icon size={16} color={iconColor} style={{ marginTop: 2 }} />}
            <Text style={[styles.listItemText, { color: colors.text }]}>
              {detail ? <Text style={{ fontWeight: TYPOGRAPHY.weights.semibold }}>{title}: </Text> : null}
              {detail || title}
            </Text>
          </View>
        );
      })}
    </>
  );

  const Section = ({ title, Icon, children, tone }: { title: string; Icon?: typeof Pill; children: React.ReactNode; tone?: string }) => (
    <VCard style={[styles.sectionCard, tone ? { backgroundColor: alpha(tone, 0.06) } : null] as any} padding={SPACING.lg}>
      <View style={styles.sectionHeader}>
        {/* Titles read as chapter headings; only the emergency keeps its warning icon */}
        {Icon && tone ? <Icon size={20} color={tone} /> : null}
        <DisplayText style={[styles.sectionTitle, { color: tone || colors.text }]}>{title}</DisplayText>
      </View>
      {children}
    </VCard>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Header */}
      <VCard style={styles.sectionCard} padding={SPACING.xl}>
        <View style={styles.headerTitle}>
          <View style={{ flex: 1 }}>
            <DisplayText style={[styles.diseaseName, { color: colors.text }]}>{disease.name}</DisplayText>
            {disease.scientific_name ? (
              <Text style={[styles.scientificName, { color: colors.textSecondary }]}>{disease.scientific_name}</Text>
            ) : null}
            {disease.english_name ? (
              <Text style={[styles.englishName, { color: colors.textSecondary }]}>En inglés: {disease.english_name}</Text>
            ) : null}
          </View>
          <View style={styles.headerActions}>
            {canEdit && (
              <TouchableOpacity onPress={() => setEditVisible(true)} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Editar enfermedad">
                <Pencil size={20} color={colors.primary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => toggleFavorite(disease.id)}
              style={styles.iconBtn}
              accessibilityRole="button"
              aria-selected={favorite}
              accessibilityLabel={favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              <Heart size={22} color={favorite ? colors.error : colors.textSecondary} fill={favorite ? colors.error : 'transparent'} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.badgeRow}>
          <View style={[styles.metaPill, { borderColor: colors.border }]}>
            <SpeciesIcon size={14} color={colors.textSecondary} />
            <Text style={[styles.metaPillText, { color: colors.text }]}>{SPECIES_LABELS[disease.species] || disease.species}</Text>
          </View>
          <View style={[styles.metaPill, { borderColor: colors.border }]}>
            <View style={[styles.categoryDot, { backgroundColor: category?.color || colors.textLight }]} />
            <Text style={[styles.metaPillText, { color: colors.text }]}>{categoryLabel(disease.category)}</Text>
          </View>
          {disease.life_stage && disease.life_stage !== 'all' ? (
            <View style={[styles.metaPill, { borderColor: colors.border }]}>
              <Text style={[styles.metaPillText, { color: colors.text }]}>{LIFE_STAGE_LABELS[disease.life_stage] || disease.life_stage}</Text>
            </View>
          ) : null}
          <VBadge variant={SEVERITY_TONE[disease.severity] || 'neutral'}>
            {`Severidad: ${(SEVERITY_LABELS as Record<string, string>)[disease.severity] || disease.severity}`}
          </VBadge>
          {disease.is_zoonotic && <VBadge variant="danger">Zoonótica</VBadge>}
          {isDraft && <VBadge variant="warning">Borrador sin revisar</VBadge>}
        </View>

        {disease.prognosis ? (
          <View style={styles.prognosisRow}>
            <TrendingUp size={16} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary }}>Pronóstico:</Text>
            <Text style={{ color: colors.text, fontWeight: TYPOGRAPHY.weights.semibold }}>
              {PROGNOSIS_LABELS[disease.prognosis] || disease.prognosis}
            </Text>
          </View>
        ) : null}

        {disease.photo_url ? (
          <Image source={{ uri: disease.photo_url }} style={styles.diseasePhoto} resizeMode="cover" accessibilityLabel={`Imagen de ${disease.name}`} />
        ) : null}
      </VCard>

      <Section title="Descripción">
        <Text style={[styles.body, { color: colors.text }]}>{disease.description}</Text>
      </Section>

      {disease.pathophysiology ? (
        <Section title="Fisiopatología" Icon={Dna}>
          <Text style={[styles.body, { color: colors.text }]}>{disease.pathophysiology}</Text>
        </Section>
      ) : null}

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderColor: colors.border }]} accessibilityRole="tablist">
        {TABS.map(({ key, label, Icon }) => {
          const active = activeTab === key;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => setActiveTab(key)}
              style={[styles.tab, active && { backgroundColor: colors.primaryContainer }]}
              accessibilityRole="tab"
              aria-selected={active}
            >
              <Icon size={18} color={active ? colors.primary : colors.textSecondary} />
              <Text style={[styles.tabLabel, { color: active ? colors.primary : colors.textSecondary }, active && { fontWeight: TYPOGRAPHY.weights.semibold }]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {activeTab === 'signs' && (
        <Section title="Signos clave" Icon={Stethoscope}>
          {disease.key_signs?.length
            ? <ItemList items={disease.key_signs} Icon={Circle} iconColor={colors.textSecondary} />
            : <Text style={{ color: colors.textSecondary }}>Sin signos registrados.</Text>}
        </Section>
      )}

      {activeTab === 'diagnosis' && (
        <>
          {diagnosis.clinicalExam ? (
            <Section title="Examen clínico" Icon={Stethoscope}>
              <Text style={[styles.body, { color: colors.text }]}>{diagnosis.clinicalExam}</Text>
            </Section>
          ) : null}
          {diagnosis.labTests?.length ? (
            <Section title="Exámenes de laboratorio" Icon={FlaskConical}>
              <ItemList items={diagnosis.labTests} Icon={Circle} iconColor={colors.textSecondary} />
            </Section>
          ) : null}
          {diagnosis.imaging?.length ? (
            <Section title="Imagenología" Icon={ScanLine}>
              <ItemList items={diagnosis.imaging} Icon={Circle} iconColor={colors.textSecondary} />
            </Section>
          ) : null}
          {diagnosis.differentialDiagnosis?.length ? (
            <Section title="Diagnóstico diferencial" Icon={GitCompare}>
              <ItemList items={diagnosis.differentialDiagnosis} Icon={Circle} iconColor={colors.textSecondary} />
            </Section>
          ) : null}
        </>
      )}

      {activeTab === 'treatment' && (
        <>
          <View style={[styles.disclaimer, { backgroundColor: colors.surfaceVariant }]}>
            <Info size={16} color={colors.textSecondary} />
            <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
              Contenido de referencia. Verifica dosis, vías y contraindicaciones según el paciente antes de indicar.
            </Text>
          </View>

          {emergency && (
            <Section title="Emergencia" Icon={AlertTriangle} tone={colors.error}>
              {emergency.map((block, b) => (
                <View key={b} style={b > 0 ? { marginTop: SPACING.md } : null}>
                  {block.presentation ? (
                    <Text style={[styles.body, { color: colors.text, marginBottom: block.steps.length ? SPACING.sm : 0 }]}>
                      <Text style={{ fontWeight: TYPOGRAPHY.weights.semibold }}>Presentación: </Text>{block.presentation}
                    </Text>
                  ) : null}
                  {block.steps.map((step, i) => (
                    <View key={i} style={styles.listItem}>
                      <Text style={[styles.stepNumber, { color: colors.error }]}>{i + 1}.</Text>
                      <Text style={[styles.listItemText, { color: colors.text }]}>{step}</Text>
                    </View>
                  ))}
                  {block.rest ? <Text style={[styles.body, { color: colors.text }]}>{block.rest}</Text> : null}
                </View>
              ))}
            </Section>
          )}

          {treatment.firstLine?.length ? (
            <Section title="Primera línea" Icon={CheckCircle2}>
              <ItemList items={treatment.firstLine} Icon={CheckCircle2} iconColor={colors.success} />
            </Section>
          ) : null}
          {treatment.secondLine?.length ? (
            <Section title="Segunda línea" Icon={Circle}>
              <ItemList items={treatment.secondLine} Icon={Circle} iconColor={colors.textSecondary} />
            </Section>
          ) : null}
          {treatment.duration ? (
            <Section title="Duración" Icon={Clock}>
              <Text style={[styles.body, { color: colors.text }]}>{treatment.duration}</Text>
            </Section>
          ) : null}
          {notes ? (
            <Section title={notesTitle} Icon={MapPin}>
              <Text style={[styles.body, { color: colors.text }]}>{notes}</Text>
            </Section>
          ) : null}
        </>
      )}

      {activeTab === 'prevention' && (
        <Section title="Medidas preventivas" Icon={ShieldCheck}>
          {disease.prevention?.length
            ? <ItemList items={disease.prevention} Icon={ShieldCheck} iconColor={colors.success} />
            : <Text style={{ color: colors.textSecondary }}>Sin medidas registradas.</Text>}
        </Section>
      )}

      {disease.references?.length ? (
        <Section title="Referencias" Icon={BookOpen}>
          {disease.references.map((ref: string, index: number) => (
            <Text key={index} style={[styles.reference, { color: colors.textSecondary }]}>• {ref}</Text>
          ))}
        </Section>
      ) : null}

      {/* Edit (only clinic-owned entries, or admins for the global catalog) */}
      <Portal>
        <Modal visible={editVisible} onDismiss={() => setEditVisible(false)} contentContainerStyle={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <ScrollView>
            <Text accessibilityRole="header" style={[styles.modalTitle, { color: colors.text }]}>Editar enfermedad</Text>
            <TextEditField inputStyle={inputStyle} labelColor={colors.textSecondary} label="Nombre *" value={editData.name || ''} onChange={(t) => setField('name', t)} />
            <TextEditField inputStyle={inputStyle} labelColor={colors.textSecondary} label="Agente o nombre científico (latín)" value={editData.scientific_name || ''} onChange={(t) => setField('scientific_name', t)} />
            <TextEditField inputStyle={inputStyle} labelColor={colors.textSecondary} label="Nombre en inglés" value={editData.english_name || ''} onChange={(t) => setField('english_name', t)} />
            <TextEditField inputStyle={inputStyle} labelColor={colors.textSecondary} label="Descripción *" value={editData.description || ''} onChange={(t) => setField('description', t)} multiline />

            <Text style={[styles.editSection, { color: colors.primary, borderBottomColor: colors.border }]}>Signos clave</Text>
            <ArrayEditField inputStyle={inputStyle} labelColor={colors.textSecondary} label="Signos" value={editData.key_signs || []} onChange={(v) => setField('key_signs', v)} />

            <Text style={[styles.editSection, { color: colors.primary, borderBottomColor: colors.border }]}>Diagnóstico</Text>
            <TextEditField inputStyle={inputStyle} labelColor={colors.textSecondary} label="Examen clínico" value={(editData.diagnosis as any)?.clinicalExam || ''} onChange={(t) => setNested('diagnosis', 'clinicalExam', t)} multiline />
            <ArrayEditField inputStyle={inputStyle} labelColor={colors.textSecondary} label="Laboratorio" value={(editData.diagnosis as any)?.labTests || []} onChange={(v) => setNested('diagnosis', 'labTests', v)} />
            <ArrayEditField inputStyle={inputStyle} labelColor={colors.textSecondary} label="Imagenología" value={(editData.diagnosis as any)?.imaging || []} onChange={(v) => setNested('diagnosis', 'imaging', v)} />
            <ArrayEditField inputStyle={inputStyle} labelColor={colors.textSecondary} label="Diagnóstico diferencial" value={(editData.diagnosis as any)?.differentialDiagnosis || []} onChange={(v) => setNested('diagnosis', 'differentialDiagnosis', v)} />

            <Text style={[styles.editSection, { color: colors.primary, borderBottomColor: colors.border }]}>Tratamiento</Text>
            <ArrayEditField inputStyle={inputStyle} labelColor={colors.textSecondary} label="Primera línea" value={(editData.treatment as any)?.firstLine || []} onChange={(v) => setNested('treatment', 'firstLine', v)} />
            <ArrayEditField inputStyle={inputStyle} labelColor={colors.textSecondary} label="Segunda línea" value={(editData.treatment as any)?.secondLine || []} onChange={(v) => setNested('treatment', 'secondLine', v)} />
            <TextEditField inputStyle={inputStyle} labelColor={colors.textSecondary} label="Emergencia" value={(editData.treatment as any)?.emergency || ''} onChange={(t) => setNested('treatment', 'emergency', t)} multiline />
            <TextEditField inputStyle={inputStyle} labelColor={colors.textSecondary} label="Duración" value={(editData.treatment as any)?.duration || ''} onChange={(t) => setNested('treatment', 'duration', t)} />
            <TextEditField inputStyle={inputStyle} labelColor={colors.textSecondary} label="Notas (disponibilidad en Chile)" value={(editData.treatment as any)?.notes || ''} onChange={(t) => setNested('treatment', 'notes', t)} multiline />

            <Text style={[styles.editSection, { color: colors.primary, borderBottomColor: colors.border }]}>Prevención</Text>
            <ArrayEditField inputStyle={inputStyle} labelColor={colors.textSecondary} label="Medidas" value={editData.prevention || []} onChange={(v) => setField('prevention', v)} />

            <Text style={[styles.editSection, { color: colors.primary, borderBottomColor: colors.border }]}>Referencias</Text>
            <ArrayEditField inputStyle={inputStyle} labelColor={colors.textSecondary} label="Referencias" value={editData.references || []} onChange={(v) => setField('references', v)} />

            {editError ? (
              <View accessibilityRole="alert" style={[styles.disclaimer, { backgroundColor: colors.surfaceVariant }]}>
                <AlertTriangle size={16} color={colors.error} />
                <Text style={[styles.disclaimerText, { color: colors.error }]}>{editError}</Text>
              </View>
            ) : null}
            <View style={[styles.modalActions, { borderTopColor: colors.border }]}>
              <VButton variant="secondary" onPress={() => setEditVisible(false)}>Cancelar</VButton>
              <VButton variant="primary" onPress={handleSave} loading={saving} disabled={saving}>Guardar</VButton>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.lg, paddingBottom: SPACING['4xl'], maxWidth: 900, width: '100%', alignSelf: 'center' },
  sectionCard: { marginBottom: SPACING.md },
  headerTitle: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  diseaseName: { fontSize: TYPOGRAPHY.sizes['2xl'] },
  scientificName: { fontStyle: 'italic', marginTop: SPACING.xs, fontSize: TYPOGRAPHY.sizes.md },
  englishName: { marginTop: 2, fontSize: TYPOGRAPHY.sizes.sm },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: SPACING.md, gap: SPACING.sm },
  metaPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.full, borderWidth: 1 },
  metaPillText: { fontSize: TYPOGRAPHY.sizes.sm },
  categoryDot: { width: 8, height: 8, borderRadius: 4 },
  prognosisRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: SPACING.lg },
  diseasePhoto: { width: '100%', height: 220, borderRadius: RADIUS.md, marginTop: SPACING.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  sectionTitle: { fontWeight: '600', fontSize: 22 },
  lozenge: { width: 6, height: 6, transform: [{ rotate: '45deg' }], marginTop: 8, marginHorizontal: 5 },
  body: { lineHeight: 22, fontSize: TYPOGRAPHY.sizes.md },
  tabBar: { flexDirection: 'row', marginBottom: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1, padding: 4 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: SPACING.sm, borderRadius: RADIUS.md, gap: 4, minHeight: 52, justifyContent: 'center' },
  tabLabel: { fontSize: TYPOGRAPHY.sizes.xs },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm, gap: SPACING.sm },
  listItemText: { flex: 1, lineHeight: 21, fontSize: TYPOGRAPHY.sizes.md },
  stepNumber: { fontWeight: TYPOGRAPHY.weights.bold, minWidth: 18 },
  disclaimer: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, padding: SPACING.md, borderRadius: RADIUS.md, marginBottom: SPACING.md },
  disclaimerText: { flex: 1, fontSize: TYPOGRAPHY.sizes.sm, lineHeight: 19 },
  reference: { fontSize: TYPOGRAPHY.sizes.sm, marginBottom: 4, lineHeight: 19 },
  modalContent: { margin: SPACING.lg, borderRadius: RADIUS.lg, padding: SPACING.xl, maxHeight: '90%', maxWidth: 720, width: '100%', alignSelf: 'center' },
  modalTitle: { fontWeight: TYPOGRAPHY.weights.bold, fontSize: TYPOGRAPHY.sizes.xl, marginBottom: SPACING.lg },
  editField: { marginBottom: SPACING.md },
  editLabel: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold, marginBottom: 6 },
  editInput: { borderWidth: 1, borderRadius: RADIUS.md, padding: SPACING.sm + 2, fontSize: TYPOGRAPHY.sizes.md },
  editTextarea: { minHeight: 80, textAlignVertical: 'top' },
  editSection: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.bold, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.md, marginTop: SPACING.xl },
});
