import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Text, TextInput, Button, Menu, Dialog, Portal } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Check } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { usePets } from '../../hooks/useDirectus';
import { useTheme } from '../../contexts/ThemeContext';
import { uploadPetPhoto } from '../../services/cloudinary';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';
import VoiceNotes from '../../components/VoiceNotes';

const TEMPERAMENT_OPTIONS = ['Dócil', 'Inquieto', 'Agresivo', 'Nervioso'];
const HABITAT_OPTIONS = ['Casa', 'Depto', 'Finca', 'Exteriores'];
const REPRODUCTIVE_OPTIONS = [
  { value: 'intacto', label: 'Intacto/a' },
  { value: 'castrado', label: 'Castrado' },
  { value: 'esterilizado', label: 'Esterilizado/a' },
  { value: 'gestante', label: 'Gestante' },
];
const REPRODUCTIVE_MACHO = ['intacto', 'castrado'];
const REPRODUCTIVE_HEMBRA = ['intacto', 'castrado', 'esterilizado', 'gestante'];

const STEP_LABELS = ['Información básica', 'Propietario', 'Información médica', 'Revisión'];

export default function AddPacienteScreen() {
  const router = useRouter();
  const { addPet } = usePets();
  const { colors } = useTheme();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [habitatExpanded, setHabitatExpanded] = useState(true);
  const [historialExpanded, setHistorialExpanded] = useState(false);
  const [examenExpanded, setExamenExpanded] = useState(false);

  // Photo
  const [photo, setPhoto] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reseña del Paciente
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<'dog' | 'cat'>('dog');
  const [sex, setSex] = useState<'macho' | 'hembra' | null>(null);
  const [breed, setBreed] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [weight, setWeight] = useState('');
  const [color, setColor] = useState('');
  const [reproductiveStatus, setReproductiveStatus] = useState('intacto');
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [petStatus] = useState<'alive' | 'deceased'>('alive');

  // Identificación
  const [idNumber, setIdNumber] = useState('');

  // Temperamento
  const [temperament, setTemperament] = useState<string[]>([]);

  // Datos del Propietario
  const [tutorName, setTutorName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  // Historia Clínica
  const [motivoConsulta, setMotivoConsulta] = useState('');
  const [anamnesis, setAnamnesis] = useState('');
  const [habitat, setHabitat] = useState('');
  const [entorno, setEntorno] = useState('');
  const [areneros, setAreneros] = useState('');
  const [food, setFood] = useState('');
  const [foodFrequency, setFoodFrequency] = useState('');
  const [waterConsumption, setWaterConsumption] = useState('');
  const [urination, setUrination] = useState('');
  const [livesWithOtherAnimals, setLivesWithOtherAnimals] = useState('');
  const [vaccines, setVaccines] = useState('');
  const [deworming, setDeworming] = useState('');
  const [fleaTreatment, setFleaTreatment] = useState('');
  const [lastHeat, setLastHeat] = useState('');
  const [surgeries, setSurgeries] = useState('');
  const [otherDiseases, setOtherDiseases] = useState('');
  const [medications, setMedications] = useState('');

  // Constantes fisiológicas
  const [vitalTemp, setVitalTemp] = useState('');
  const [vitalFC, setVitalFC] = useState('');
  const [vitalFR, setVitalFR] = useState('');
  const [vitalPA, setVitalPA] = useState('');
  const [vitalSpO2, setVitalSpO2] = useState('');
  const [vitalMucosas, setVitalMucosas] = useState('');
  const [vitalHidratacion, setVitalHidratacion] = useState('');
  const [vitalCondicionCorporal, setVitalCondicionCorporal] = useState('');

  // Hallazgos examen físico
  const [hallazgosExamenFisico, setHallazgosExamenFisico] = useState('');

  const toggleTemperament = (t: string) => {
    setTemperament(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Necesitamos acceso a tus fotos para agregar una imagen del paciente.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setErrorMsg('El nombre es obligatorio');
      return;
    }
    setSaving(true);
    setErrorMsg(null);
    try {
      let photoUrl = null;
      if (photo) {
        try {
          photoUrl = await uploadPetPhoto(photo);
        } catch (e: any) {
          console.warn('Photo upload failed, saving without photo:', e.message);
        }
      }

      let isoDate = null;
      if (birthDate.trim()) {
        const parts = birthDate.split('/');
        if (parts.length === 3) {
          isoDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        } else {
          isoDate = birthDate.trim();
        }
      }

      await addPet({
        name: name.trim(),
        species,
        breed: breed.trim(),
        birth_date: isoDate,
        weight: parseFloat(weight) || 0,
        color: color.trim(),
        photo: photoUrl,
        allergies: [],
        notes: '',
        reproductive_status: reproductiveStatus,
        status: petStatus,
        motivo_consulta: motivoConsulta.trim() || null,
        anamnesis: anamnesis.trim() || null,
        tutor_name: tutorName.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        address: address.trim() || null,
        clinic_location: null,
        id_number: idNumber.trim() || null,
        sex,
        temperament,
        habitat: habitat || null,
        habitat_other: null,
        entorno: entorno.trim() || null,
        areneros: areneros.trim() || null,
        food: food.trim() || null,
        food_frequency: foodFrequency.trim() || null,
        water_consumption: waterConsumption.trim() || null,
        urination: urination.trim() || null,
        lives_with_other_animals: livesWithOtherAnimals.trim() || null,
        vaccines: vaccines.trim() || null,
        deworming: deworming.trim() || null,
        flea_treatment: fleaTreatment.trim() || null,
        last_heat: lastHeat.trim() || null,
        surgeries: surgeries.trim() || null,
        other_diseases: otherDiseases.trim() || null,
        medications: medications.trim() || null,
        hallazgos_examen_fisico: hallazgosExamenFisico.trim() || null,
        vital_signs: (vitalTemp || vitalFC || vitalFR || vitalPA || vitalSpO2 || vitalMucosas || vitalHidratacion || vitalCondicionCorporal) ? {
          temperature: vitalTemp ? parseFloat(vitalTemp) : undefined,
          heart_rate: vitalFC ? parseInt(vitalFC) : undefined,
          respiratory_rate: vitalFR ? parseInt(vitalFR) : undefined,
          blood_pressure: vitalPA.trim() || undefined,
          spo2: vitalSpO2 ? parseInt(vitalSpO2) : undefined,
          mucous_membranes: vitalMucosas.trim() || undefined,
          hydration: vitalHidratacion.trim() || undefined,
          body_condition: vitalCondicionCorporal.trim() || undefined,
        } : null,
      });
      router.back();
    } catch (error: any) {
      console.error('Save patient error:', error);
      setErrorMsg(error.message || 'No se pudo guardar el paciente');
    } finally {
      setSaving(false);
    }
  };

  const canAdvance = () => {
    if (currentStep === 1) return name.trim().length > 0;
    if (currentStep === 2) return tutorName.trim().length > 0;
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && !name.trim()) {
      Alert.alert('Campo requerido', 'El nombre del paciente es obligatorio');
      return;
    }
    if (currentStep === 2 && !tutorName.trim()) {
      Alert.alert('Campo requerido', 'El nombre del propietario es obligatorio');
      return;
    }
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // ─── Progress Bar ───────────────────────────────────────────
  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {STEP_LABELS.map((label, idx) => {
        const step = idx + 1;
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;
        const isLast = idx === STEP_LABELS.length - 1;

        return (
          <React.Fragment key={step}>
            <View style={styles.progressStep}>
              <View style={[
                styles.progressCircle,
                {
                  backgroundColor: isCompleted || isCurrent ? colors.primary : 'transparent',
                  borderColor: isCompleted || isCurrent ? colors.primary : colors.border,
                },
              ]}>
                {isCompleted ? (
                  <Check size={14} color="#FFFFFF" strokeWidth={3} />
                ) : (
                  <Text style={[styles.progressNumber, { color: isCurrent ? '#FFFFFF' : colors.textSecondary }]}>
                    {step}
                  </Text>
                )}
              </View>
              <Text style={[
                styles.progressLabel,
                { color: isCurrent ? colors.primary : isCompleted ? colors.primary : colors.textSecondary },
                isCurrent && styles.progressLabelActive,
              ]}>
                {label}
              </Text>
            </View>
            {!isLast && (
              <View style={[
                styles.progressLine,
                {
                  backgroundColor: step < currentStep ? colors.primary : colors.border,
                  opacity: step < currentStep ? 1 : 0.4,
                },
              ]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );

  // ─── Step 1: Información básica ─────────────────────────────
  const renderStep1 = () => (
    <View style={styles.stepContent}>
      {/* Información básica card — 3-column grid */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.cardTitleRow}>
          <View style={[styles.cardIcon, { backgroundColor: colors.primaryContainer }]}>
            <MaterialCommunityIcons name="patient" size={18} color={colors.primary} />
          </View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Información básica</Text>
        </View>

        {/* Row 1: Nombre, Especie, Raza */}
        <View style={styles.grid3}>
          <View style={styles.gridField}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Nombre del paciente *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              mode="outlined"
              placeholder="Ej: Max"
              style={[styles.input, { backgroundColor: colors.surface }]}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
            />
          </View>
          <View style={styles.gridField}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Especie *</Text>
            <View style={styles.speciesRow}>
              <Button
                mode={species === 'dog' ? 'contained' : 'outlined'}
                onPress={() => setSpecies('dog')}
                style={[styles.speciesPill, species === 'dog' && { backgroundColor: colors.primary }]}
                labelStyle={[styles.speciesPillLabel, species === 'dog' ? { color: '#FFFFFF' } : { color: colors.primary }]}
                icon={({ size }) => (
                  <MaterialCommunityIcons name="dog" size={size} color={species === 'dog' ? '#FFFFFF' : colors.primary} />
                )}
              >
                Perro
              </Button>
              <Button
                mode={species === 'cat' ? 'contained' : 'outlined'}
                onPress={() => setSpecies('cat')}
                style={[styles.speciesPill, species === 'cat' && { backgroundColor: colors.primary }]}
                labelStyle={[styles.speciesPillLabel, species === 'cat' ? { color: '#FFFFFF' } : { color: colors.primary }]}
                icon={({ size }) => (
                  <MaterialCommunityIcons name="cat" size={size} color={species === 'cat' ? '#FFFFFF' : colors.primary} />
                )}
              >
                Gato
              </Button>
            </View>
          </View>
          <View style={styles.gridField}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Raza</Text>
            <TextInput
              value={breed}
              onChangeText={setBreed}
              mode="outlined"
              placeholder="Ej: Golden Retriever"
              style={[styles.input, { backgroundColor: colors.surface }]}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
            />
          </View>
        </View>

        {/* Row 2: Fecha nacimiento, Sexo, Estado reproductivo */}
        <View style={styles.grid3}>
          <View style={styles.gridField}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Fecha de nacimiento</Text>
            <TextInput
              value={birthDate}
              onChangeText={setBirthDate}
              mode="outlined"
              placeholder="DD/MM/AAAA"
              style={[styles.input, { backgroundColor: colors.surface }]}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
            />
          </View>
          <View style={styles.gridField}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Sexo *</Text>
            <View style={styles.sexRow}>
              <Button
                mode={sex === 'macho' ? 'contained' : 'outlined'}
                onPress={() => { setSex('macho'); if (!REPRODUCTIVE_MACHO.includes(reproductiveStatus)) setReproductiveStatus('intacto'); }}
                style={[styles.sexPill, sex === 'macho' && { backgroundColor: colors.primary }]}
                labelStyle={sex === 'macho' ? { color: '#FFFFFF' } : { color: colors.primary }}
                icon={({ size }) => <MaterialCommunityIcons name="gender-male" size={size} color={sex === 'macho' ? '#FFFFFF' : colors.primary} />}
              >
                Macho
              </Button>
              <Button
                mode={sex === 'hembra' ? 'contained' : 'outlined'}
                onPress={() => { setSex('hembra'); if (!REPRODUCTIVE_HEMBRA.includes(reproductiveStatus)) setReproductiveStatus('intacto'); }}
                style={[styles.sexPill, sex === 'hembra' && { backgroundColor: colors.primary }]}
                labelStyle={sex === 'hembra' ? { color: '#FFFFFF' } : { color: colors.primary }}
                icon={({ size }) => <MaterialCommunityIcons name="gender-female" size={size} color={sex === 'hembra' ? '#FFFFFF' : colors.primary} />}
              >
                Hembra
              </Button>
            </View>
          </View>
          <View style={styles.gridField}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Estado reproductivo</Text>
            <Menu
              visible={statusMenuVisible}
              onDismiss={() => setStatusMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setStatusMenuVisible(true)}
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, justifyContent: 'flex-start' }]}
                  labelStyle={{ color: colors.textSecondary, fontSize: TYPOGRAPHY.sizes.sm }}
                  contentStyle={{ justifyContent: 'flex-start' }}
                >
                  {REPRODUCTIVE_OPTIONS.find(o => o.value === reproductiveStatus)?.label || reproductiveStatus}
                </Button>
              }
            >
              {REPRODUCTIVE_OPTIONS
                .filter(opt => {
                  if (sex === 'macho') return REPRODUCTIVE_MACHO.includes(opt.value);
                  if (sex === 'hembra') return REPRODUCTIVE_HEMBRA.includes(opt.value);
                  return true;
                })
                .map(opt => (
                  <Menu.Item key={opt.value} onPress={() => { setReproductiveStatus(opt.value); setStatusMenuVisible(false); }} title={opt.label} />
                ))}
            </Menu>
          </View>
        </View>

        {/* Row 3: Color/Pelaje, Peso, Microchip */}
        <View style={styles.grid3}>
          <View style={styles.gridField}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Color / Pelaje</Text>
            <TextInput
              value={color}
              onChangeText={setColor}
              mode="outlined"
              placeholder="Ej: Dorado"
              style={[styles.input, { backgroundColor: colors.surface }]}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
            />
          </View>
          <View style={styles.gridField}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Peso (kg)</Text>
            <TextInput
              value={weight}
              onChangeText={setWeight}
              mode="outlined"
              keyboardType="numeric"
              placeholder="Ej: 25.4"
              style={[styles.input, { backgroundColor: colors.surface }]}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
            />
          </View>
          <View style={styles.gridField}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Microchip / ID</Text>
            <TextInput
              value={idNumber}
              onChangeText={setIdNumber}
              mode="outlined"
              placeholder="Ej: 981020000456789"
              style={[styles.input, { backgroundColor: colors.surface }]}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
            />
          </View>
        </View>
      </View>

      {/* Foto del paciente card */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.cardTitleRow}>
          <View style={[styles.cardIcon, { backgroundColor: colors.primaryContainer }]}>
            <MaterialCommunityIcons name="camera" size={18} color={colors.primary} />
          </View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Foto del paciente</Text>
        </View>
        <TouchableOpacity onPress={pickImage} style={[styles.photoUpload, { borderColor: colors.border }]}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.photoPreview} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <View style={[styles.photoIconWrap, { backgroundColor: colors.primaryContainer }]}>
                <MaterialCommunityIcons name="camera-plus" size={28} color={colors.primary} />
              </View>
              <Text style={[styles.photoTitle, { color: colors.text }]}>Subir foto del paciente</Text>
              <Text style={[styles.photoSubtitle, { color: colors.textSecondary }]}>JPG, PNG o WEBP. Máx. 5MB</Text>
              <Button
                mode="outlined"
                onPress={pickImage}
                style={[styles.photoBtn, { borderColor: colors.primary }]}
                labelStyle={{ color: colors.primary, fontSize: 13 }}
              >
                Seleccionar archivo
              </Button>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Características adicionales card */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.cardTitleRow}>
          <View style={[styles.cardIcon, { backgroundColor: colors.primaryContainer }]}>
            <MaterialCommunityIcons name="notebook-edit-outline" size={18} color={colors.primary} />
          </View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Características adicionales</Text>
        </View>

        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Temperamento</Text>
        <View style={styles.chipRow}>
          {TEMPERAMENT_OPTIONS.map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => toggleTemperament(t)}
              style={[styles.tempChip, { borderColor: colors.border, backgroundColor: temperament.includes(t) ? colors.primaryContainer : colors.surface }]}
            >
              <MaterialCommunityIcons
                name={temperament.includes(t) ? 'checkbox-marked' : 'checkbox-blank-outline'}
                size={18}
                color={temperament.includes(t) ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.tempChipText, { color: temperament.includes(t) ? colors.primary : colors.text }]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  // ─── Step 2: Propietario ────────────────────────────────────
  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Datos del propietario</Text>

        <TextInput
          label="Nombre del propietario *"
          value={tutorName}
          onChangeText={setTutorName}
          mode="outlined"
          style={[styles.input, { backgroundColor: colors.surface }]}
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
        />
        <TextInput
          label="RUT"
          value={idNumber}
          onChangeText={setIdNumber}
          mode="outlined"
          placeholder="Ej: 12.345.678-9"
          style={[styles.input, { backgroundColor: colors.surface }]}
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
        />
        <View style={styles.row}>
          <TextInput
            label="Teléfono"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            keyboardType="phone-pad"
            style={[styles.input, styles.rowField, { backgroundColor: colors.surface }]}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
          />
          <TextInput
            label="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            style={[styles.input, styles.rowField, { backgroundColor: colors.surface }]}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
          />
        </View>
        <TextInput
          label="Dirección"
          value={address}
          onChangeText={setAddress}
          mode="outlined"
          style={[styles.input, { backgroundColor: colors.surface }]}
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
        />
      </View>
    </View>
  );

  // ─── Step 3: Información médica ─────────────────────────────
  const renderStep3 = () => (
    <View style={styles.stepContent}>
      {/* Section A — Motivo de consulta */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Motivo de consulta</Text>
        <VoiceNotes
          onTranscription={(text) => setMotivoConsulta(prev => prev ? prev + ' ' + text : text)}
        />
        <TextInput
          label="Motivo de consulta"
          value={motivoConsulta}
          onChangeText={setMotivoConsulta}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={[styles.input, { backgroundColor: colors.surface }]}
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
        />
      </View>

      {/* Section B — Hábitat y entorno */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => setHabitatExpanded(!habitatExpanded)} style={styles.collapsibleHeader}>
          <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 0 }]}>Hábitat y entorno</Text>
          <MaterialCommunityIcons
            name={habitatExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
        {habitatExpanded && (
          <View style={styles.collapsibleContent}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Hábitat</Text>
            <View style={styles.chipRow}>
              {HABITAT_OPTIONS.map(h => (
                <TouchableOpacity
                  key={h}
                  onPress={() => setHabitat(habitat === h ? '' : h)}
                  style={[styles.tempChip, { borderColor: colors.border, backgroundColor: habitat === h ? colors.primaryContainer : colors.surface }]}
                >
                  <MaterialCommunityIcons
                    name={habitat === h ? 'radiobox-marked' : 'radiobox-blank'}
                    size={18}
                    color={habitat === h ? colors.primary : colors.textSecondary}
                  />
                  <Text style={[styles.tempChipText, { color: habitat === h ? colors.primary : colors.text }]}>{h}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput label="Alimento (tipo / marca)" value={food} onChangeText={setFood} mode="outlined" style={[styles.input, { backgroundColor: colors.surface }]} outlineColor={colors.border} activeOutlineColor={colors.primary} />
            <TextInput label="Frecuencia de alimentación" value={foodFrequency} onChangeText={setFoodFrequency} mode="outlined" style={[styles.input, { backgroundColor: colors.surface }]} outlineColor={colors.border} activeOutlineColor={colors.primary} />
            <TextInput label="Consumo de agua" value={waterConsumption} onChangeText={setWaterConsumption} mode="outlined" style={[styles.input, { backgroundColor: colors.surface }]} outlineColor={colors.border} activeOutlineColor={colors.primary} />
            <TextInput label="Micción" value={urination} onChangeText={setUrination} mode="outlined" style={[styles.input, { backgroundColor: colors.surface }]} outlineColor={colors.border} activeOutlineColor={colors.primary} />
            <TextInput label="Vive con otros animales" value={livesWithOtherAnimals} onChangeText={setLivesWithOtherAnimals} mode="outlined" style={[styles.input, { backgroundColor: colors.surface }]} outlineColor={colors.border} activeOutlineColor={colors.primary} />

            {species === 'cat' && (
              <>
                <TextInput label="Entorno (interior/exterior/mixto)" value={entorno} onChangeText={setEntorno} mode="outlined" style={[styles.input, { backgroundColor: colors.surface }]} outlineColor={colors.border} activeOutlineColor={colors.primary} />
                <TextInput label="Areneros (cantidad y detalle)" value={areneros} onChangeText={setAreneros} mode="outlined" style={[styles.input, { backgroundColor: colors.surface }]} outlineColor={colors.border} activeOutlineColor={colors.primary} />
              </>
            )}
          </View>
        )}
      </View>

      {/* Section C — Historial sanitario */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => setHistorialExpanded(!historialExpanded)} style={styles.collapsibleHeader}>
          <View style={styles.collapsibleTitleRow}>
            <MaterialCommunityIcons name="shield-check-outline" size={18} color={colors.success} />
            <Text style={[styles.cardTitle, { color: colors.success, marginBottom: 0 }]}>Historial sanitario</Text>
          </View>
          <MaterialCommunityIcons
            name={historialExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
        {historialExpanded && (
          <View style={styles.collapsibleContent}>
            <TextInput label="Vacunas" value={vaccines} onChangeText={setVaccines} mode="outlined" multiline numberOfLines={2} style={[styles.input, { backgroundColor: colors.surface }]} outlineColor={colors.border} activeOutlineColor={colors.primary} />
            <TextInput label="Desparasitación" value={deworming} onChangeText={setDeworming} mode="outlined" style={[styles.input, { backgroundColor: colors.surface }]} outlineColor={colors.border} activeOutlineColor={colors.primary} />
            <TextInput label="Antipulgas" value={fleaTreatment} onChangeText={setFleaTreatment} mode="outlined" style={[styles.input, { backgroundColor: colors.surface }]} outlineColor={colors.border} activeOutlineColor={colors.primary} />
            {sex === 'hembra' && (
              <TextInput label="Último celo" value={lastHeat} onChangeText={setLastHeat} mode="outlined" style={[styles.input, { backgroundColor: colors.surface }]} outlineColor={colors.border} activeOutlineColor={colors.primary} />
            )}
            <TextInput label="Cirugías previas" value={surgeries} onChangeText={setSurgeries} mode="outlined" multiline numberOfLines={2} style={[styles.input, { backgroundColor: colors.surface }]} outlineColor={colors.border} activeOutlineColor={colors.primary} />
            <TextInput label="Otras enfermedades" value={otherDiseases} onChangeText={setOtherDiseases} mode="outlined" multiline numberOfLines={2} style={[styles.input, { backgroundColor: colors.surface }]} outlineColor={colors.border} activeOutlineColor={colors.primary} />
            <TextInput label="Medicamentos actuales" value={medications} onChangeText={setMedications} mode="outlined" multiline numberOfLines={2} style={[styles.input, { backgroundColor: colors.surface }]} outlineColor={colors.border} activeOutlineColor={colors.primary} />
          </View>
        )}
      </View>

      {/* Section D — Anamnesis */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Anamnesis</Text>
        <TextInput
          label="Anamnesis"
          value={anamnesis}
          onChangeText={setAnamnesis}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={[styles.input, { backgroundColor: colors.surface }]}
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
        />
      </View>

      {/* Section E — Examen físico */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => setExamenExpanded(!examenExpanded)} style={styles.collapsibleHeader}>
          <View style={styles.collapsibleTitleRow}>
            <MaterialCommunityIcons name="stethoscope" size={18} color={colors.warning} />
            <Text style={[styles.cardTitle, { color: colors.warning, marginBottom: 0 }]}>Examen físico</Text>
          </View>
          <MaterialCommunityIcons
            name={examenExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
        {examenExpanded && (
          <View style={styles.collapsibleContent}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Constantes fisiológicas</Text>
            <View style={styles.row}>
              <TextInput label="Temp (°C)" value={vitalTemp} onChangeText={setVitalTemp} mode="outlined" keyboardType="numeric" style={[styles.input, styles.rowField, { backgroundColor: colors.surface }]} outlineColor={colors.border} activeOutlineColor={colors.primary} />
              <TextInput label="FC (lpm)" value={vitalFC} onChangeText={setVitalFC} mode="outlined" keyboardType="numeric" style={[styles.input, styles.rowField, { backgroundColor: colors.surface }]} outlineColor={colors.border} activeOutlineColor={colors.primary} />
            </View>
            <View style={styles.row}>
              <TextInput label="FR (rpm)" value={vitalFR} onChangeText={setVitalFR} mode="outlined" keyboardType="numeric" style={[styles.input, styles.rowField, { backgroundColor: colors.surface }]} outlineColor={colors.border} activeOutlineColor={colors.primary} />
              <TextInput label="PA (mmHg)" value={vitalPA} onChangeText={setVitalPA} mode="outlined" style={[styles.input, styles.rowField, { backgroundColor: colors.surface }]} outlineColor={colors.border} activeOutlineColor={colors.primary} />
            </View>
            <View style={styles.row}>
              <TextInput label="SpO₂ (%)" value={vitalSpO2} onChangeText={setVitalSpO2} mode="outlined" keyboardType="numeric" style={[styles.input, styles.rowField, { backgroundColor: colors.surface }]} outlineColor={colors.border} activeOutlineColor={colors.primary} />
              <TextInput label="Mucosas" value={vitalMucosas} onChangeText={setVitalMucosas} mode="outlined" style={[styles.input, styles.rowField, { backgroundColor: colors.surface }]} outlineColor={colors.border} activeOutlineColor={colors.primary} />
            </View>
            <View style={styles.row}>
              <TextInput label="Hidratación" value={vitalHidratacion} onChangeText={setVitalHidratacion} mode="outlined" style={[styles.input, styles.rowField, { backgroundColor: colors.surface }]} outlineColor={colors.border} activeOutlineColor={colors.primary} />
              <TextInput label="Condición corporal" value={vitalCondicionCorporal} onChangeText={setVitalCondicionCorporal} mode="outlined" style={[styles.input, styles.rowField, { backgroundColor: colors.surface }]} outlineColor={colors.border} activeOutlineColor={colors.primary} />
            </View>

            <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 4 }]}>Hallazgos examen físico</Text>
            <TextInput
              label="Hallazgos examen físico"
              value={hallazgosExamenFisico}
              onChangeText={setHallazgosExamenFisico}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={[styles.input, { backgroundColor: colors.surface }]}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
            />
          </View>
        )}
      </View>
    </View>
  );

  // ─── Step 4: Resumen ────────────────────────────────────────
  const renderStep4 = () => {
    const speciesLabel = species === 'dog' ? 'Canino' : 'Felino';
    const sexLabel = sex === 'macho' ? 'Macho' : sex === 'hembra' ? 'Hembra' : 'No especificado';
    const reproLabel = REPRODUCTIVE_OPTIONS.find(o => o.value === reproductiveStatus)?.label || reproductiveStatus;

    return (
      <View style={styles.stepContent}>
        {/* Card — Paciente */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.summaryHeader}>
            <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 0 }]}>Paciente</Text>
            <TouchableOpacity onPress={() => setCurrentStep(1)}>
              <Text style={{ color: colors.primary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold }}>Editar</Text>
            </TouchableOpacity>
          </View>
          {photo && <Image source={{ uri: photo }} style={styles.summaryPhoto} />}
          <View style={styles.summaryGrid}>
            <SummaryItem label="Nombre" value={name || '-'} colors={colors} />
            <SummaryItem label="Especie" value={speciesLabel} colors={colors} />
            <SummaryItem label="Raza" value={breed || '-'} colors={colors} />
            <SummaryItem label="Sexo" value={sexLabel} colors={colors} />
            <SummaryItem label="Estado reproductivo" value={reproLabel} colors={colors} />
            <SummaryItem label="Fecha de nacimiento" value={birthDate || '-'} colors={colors} />
            <SummaryItem label="Peso" value={weight ? `${weight} kg` : '-'} colors={colors} />
            <SummaryItem label="Color" value={color || '-'} colors={colors} />
            <SummaryItem label="Temperamento" value={temperament.length > 0 ? temperament.join(', ') : '-'} colors={colors} />
            <SummaryItem label="Microchip" value={idNumber || '-'} colors={colors} />
          </View>
        </View>

        {/* Card — Propietario */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.summaryHeader}>
            <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 0 }]}>Propietario</Text>
            <TouchableOpacity onPress={() => setCurrentStep(2)}>
              <Text style={{ color: colors.primary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold }}>Editar</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.summaryGrid}>
            <SummaryItem label="Nombre" value={tutorName || '-'} colors={colors} />
            <SummaryItem label="RUT" value={idNumber || '-'} colors={colors} />
            <SummaryItem label="Teléfono" value={phone || '-'} colors={colors} />
            <SummaryItem label="Correo" value={email || '-'} colors={colors} />
            <SummaryItem label="Dirección" value={address || '-'} colors={colors} />
          </View>
        </View>

        {/* Card — Información clínica */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.summaryHeader}>
            <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 0 }]}>Información clínica</Text>
            <TouchableOpacity onPress={() => setCurrentStep(3)}>
              <Text style={{ color: colors.primary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold }}>Editar</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.summaryGrid}>
            <SummaryItem label="Motivo de consulta" value={motivoConsulta || '-'} colors={colors} />
            <SummaryItem label="Hábitat" value={habitat || '-'} colors={colors} />
            <SummaryItem label="Alimento" value={food || '-'} colors={colors} />
            <SummaryItem label="Frecuencia" value={foodFrequency || '-'} colors={colors} />
            <SummaryItem label="Agua" value={waterConsumption || '-'} colors={colors} />
            <SummaryItem label="Micción" value={urination || '-'} colors={colors} />
            {species === 'cat' && <SummaryItem label="Entorno" value={entorno || '-'} colors={colors} />}
            {species === 'cat' && <SummaryItem label="Areneros" value={areneros || '-'} colors={colors} />}
            {vaccines ? <SummaryItem label="Vacunas" value={vaccines} colors={colors} /> : null}
            {deworming ? <SummaryItem label="Desparasitación" value={deworming} colors={colors} /> : null}
            {surgeries ? <SummaryItem label="Cirugías" value={surgeries} colors={colors} /> : null}
            {medications ? <SummaryItem label="Medicamentos" value={medications} colors={colors} /> : null}
            <SummaryItem label="Anamnesis" value={anamnesis || '-'} colors={colors} />
            {hallazgosExamenFisico ? <SummaryItem label="Examen físico" value={hallazgosExamenFisico} colors={colors} /> : null}
          </View>
        </View>
      </View>
    );
  };

  // ─── Summary Item ───────────────────────────────────────────
  const SummaryItem = ({ label, value, colors }: { label: string; value: string; colors: any }) => (
    <View style={styles.summaryItem}>
      <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.summaryValue, { color: colors.text }]}>{value}</Text>
    </View>
  );

  // ─── Main Render ────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header + Progress Bar */}
      <View style={styles.header}>
        <View style={styles.breadcrumb}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.breadcrumbLink, { color: colors.primary }]}>← Pacientes</Text>
          </TouchableOpacity>
          <Text style={[styles.breadcrumbSeparator, { color: colors.textSecondary }]}>›</Text>
          <Text style={[styles.breadcrumbCurrent, { color: colors.text }]}>Nuevo Paciente</Text>
        </View>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={[styles.title, { color: colors.text }]}>Nuevo Paciente</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Completa la información para registrar un nuevo paciente en el sistema.
            </Text>
          </View>
          <View style={styles.headerRight}>
            {renderProgressBar()}
          </View>
        </View>
      </View>

      {/* Step Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </ScrollView>

      {/* Navigation Bar */}
      <View style={[styles.navBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <Button
          mode="outlined"
          onPress={currentStep === 1 ? () => router.back() : handlePrev}
          style={[styles.navBtn, { borderColor: colors.border }]}
          labelStyle={{ color: colors.text }}
        >
          {currentStep === 1 ? 'Cancelar' : '← Volver'}
        </Button>
        <Button
          mode="contained"
          onPress={currentStep === 4 ? handleSave : handleNext}
          style={[styles.navBtnPrimary, { backgroundColor: colors.primary }]}
          labelStyle={{ color: '#FFFFFF' }}
          loading={saving}
          disabled={saving}
        >
          {currentStep === 4 ? '✓ Guardar Paciente' : 'Siguiente →'}
        </Button>
      </View>

      {/* Error Dialog */}
      <Portal>
        <Dialog visible={!!errorMsg} onDismiss={() => setErrorMsg(null)}>
          <Dialog.Icon icon="alert-circle-outline" />
          <Dialog.Title style={{ textAlign: 'center' }}>Error</Dialog.Title>
          <Dialog.Content>
            <Text style={{ textAlign: 'center' }}>{errorMsg}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setErrorMsg(null)}>OK</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.xl, paddingBottom: SPACING.md },
  breadcrumb: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.md },
  breadcrumbLink: { fontSize: TYPOGRAPHY.sizes.sm },
  breadcrumbSeparator: { fontSize: TYPOGRAPHY.sizes.sm },
  breadcrumbCurrent: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
  title: { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.bold },
  subtitle: { fontSize: TYPOGRAPHY.sizes.md, marginTop: SPACING.xs },

  // Progress bar
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    gap: 0,
  },
  progressStep: { alignItems: 'center', width: 100 },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressNumber: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.bold },
  progressLabel: { fontSize: 11, marginTop: SPACING.xs, textAlign: 'center' },
  progressLabelActive: { fontWeight: TYPOGRAPHY.weights.semibold },
  progressLine: { flex: 1, height: 2, marginTop: 15, marginHorizontal: -4 },

  // Scroll
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING['3xl'] },

  // Steps
  stepContent: { gap: SPACING.md },
  step1Row: { flexDirection: 'row', gap: SPACING.md },
  step1Left: { flex: 2, gap: SPACING.xs },
  step1Right: { flex: 1 },
  stepSectionTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, marginBottom: SPACING.xs },

  // Cards
  card: { borderRadius: RADIUS.lg, padding: SPACING.lg, gap: SPACING.xs },
  cardTitle: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.bold, marginBottom: SPACING.xs },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  cardIcon: { width: 32, height: 32, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center' },

  // 3-column grid
  grid3: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.xs },
  gridField: { flex: 1 },

  // Form
  fieldLabel: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold, marginTop: SPACING.xs, marginBottom: SPACING.xs },
  input: { marginBottom: SPACING.xs },
  row: { flexDirection: 'row', gap: SPACING.sm },
  rowField: { flex: 1 },

  // Species / Sex pills
  speciesRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.xs },
  speciesPill: { flex: 1, borderRadius: RADIUS.full, paddingVertical: SPACING.xs, borderWidth: 1.5 },
  speciesPillLabel: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
  sexRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.xs },
  sexPill: { flex: 1, borderRadius: RADIUS.full, paddingVertical: SPACING.xs, borderWidth: 1.5 },

  // Chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.xs },
  tempChip: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full, borderWidth: 1,
  },
  tempChipText: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.medium },

  // Photo
  photoUpload: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    minHeight: 200,
    overflow: 'hidden',
  },
  photoPreview: { width: '100%', height: 200, borderRadius: RADIUS.lg },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.lg, gap: SPACING.sm },
  photoIconWrap: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  photoTitle: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.semibold, textAlign: 'center' },
  photoSubtitle: { fontSize: TYPOGRAPHY.sizes.sm, textAlign: 'center' },
  photoBtn: { marginTop: SPACING.xs },

  // Collapsible
  collapsibleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  collapsibleTitleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  collapsibleContent: { marginTop: SPACING.md, gap: SPACING.xs },

  // Summary
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  summaryPhoto: { width: 80, height: 80, borderRadius: RADIUS.lg, marginBottom: SPACING.sm },
  summaryGrid: { gap: SPACING.sm },
  summaryItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.xs, borderBottomWidth: 1, borderBottomColor: '#00000008' },
  summaryLabel: { fontSize: TYPOGRAPHY.sizes.sm },
  summaryValue: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold, flex: 1, textAlign: 'right', marginLeft: SPACING.md },

  // Nav bar
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
  },
  navBtn: { borderRadius: RADIUS.md },
  navBtnPrimary: { borderRadius: RADIUS.md },
});
