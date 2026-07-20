import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import { Text, TextInput, Button, Menu, Checkbox } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { usePets } from '../../hooks/useDirectus';
import { useTheme } from '../../contexts/ThemeContext';
import { uploadPetPhoto } from '../../services/cloudinary';

const TEMPERAMENT_OPTIONS = ['Dócil', 'Inquieto', 'Agresivo', 'Nervioso'];
const HABITAT_OPTIONS = ['Casa', 'Depto', 'Finca', 'Exteriores'];
const REPRODUCTIVE_OPTIONS = [
  { value: 'intacto', label: 'Intacto/a' },
  { value: 'castrado', label: 'Castrado' },
  { value: 'esterilizado', label: 'Esterilizado/a' },
  { value: 'gestante', label: 'Gestante' },
];

export default function AddPacienteScreen() {
  const router = useRouter();
  const { addPet } = usePets();
  const { colors } = useTheme();

  // Photo
  const [photo, setPhoto] = useState<string | null>(null);

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

  // Identificación
  const [idNumber, setIdNumber] = useState('');

  // Temperamento
  const [temperament, setTemperament] = useState<string[]>([]);

  // Datos del Propietario
  const [tutorName, setTutorName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [clinicLocation, setClinicLocation] = useState('');

  // Historia Clínica
  const [anamnesis, setAnamnesis] = useState('');
  const [habitat, setHabitat] = useState('');
  const [habitatOther, setHabitatOther] = useState('');
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

  const toggleTemperament = (t: string) => {
    setTemperament(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tus fotos para agregar una imagen del paciente.');
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
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }
    try {
      let photoUrl = null;
      if (photo) {
        photoUrl = await uploadPetPhoto(photo);
      }
      await addPet({
        name: name.trim(),
        species,
        breed: breed.trim(),
        birth_date: birthDate,
        weight: parseFloat(weight) || 0,
        color: color.trim(),
        photo: photoUrl,
        allergies: [],
        notes: '',
        reproductive_status: reproductiveStatus,
        anamnesis: anamnesis.trim() || null,
        tutor_name: tutorName.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        address: address.trim() || null,
        clinic_location: clinicLocation.trim() || null,
        id_number: idNumber.trim() || null,
        sex,
        temperament,
        habitat: habitat || null,
        habitat_other: habitatOther.trim() || null,
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
      });
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo guardar el paciente');
    }
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <View style={styles.cardHeader}>
      <View style={[styles.accentLine, { backgroundColor: colors.primary }]} />
      <Text variant="titleSmall" style={[styles.sectionTitle, { color: colors.primary }]}>
        {title}
      </Text>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Photo Picker */}
      <TouchableOpacity onPress={pickImage} style={[styles.photoContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.photoPreview} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <MaterialCommunityIcons name="camera-plus" size={32} color={colors.textSecondary} />
            <Text style={[styles.photoText, { color: colors.textSecondary }]}>Agregar foto</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Especie */}
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

      {/* Reseña del Paciente */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <SectionHeader title="Reseña del Paciente" />
        <TextInput label="Nombre *" value={name} onChangeText={setName} mode="outlined" style={[styles.input, { backgroundColor: colors.surface }]} />
        <View style={styles.row}>
          <TextInput label="Raza" value={breed} onChangeText={setBreed} mode="outlined" style={[styles.input, styles.rowField, { backgroundColor: colors.surface }]} />
          <TextInput label="Color" value={color} onChangeText={setColor} mode="outlined" style={[styles.input, styles.rowField, { backgroundColor: colors.surface }]} />
        </View>
        <View style={styles.row}>
          <TextInput label="Fecha nacimiento (DD/MM/AAAA)" value={birthDate} onChangeText={setBirthDate} mode="outlined" style={[styles.input, styles.rowField, { backgroundColor: colors.surface }]} />
          <TextInput label="Peso (kg)" value={weight} onChangeText={setWeight} mode="outlined" keyboardType="numeric" style={[styles.input, styles.rowField, { backgroundColor: colors.surface }]} />
        </View>

        {/* Sexo */}
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Sexo</Text>
        <View style={styles.sexRow}>
          <Button
            mode={sex === 'macho' ? 'contained' : 'outlined'}
            onPress={() => setSex('macho')}
            style={[styles.sexPill, sex === 'macho' && { backgroundColor: colors.primary }]}
            labelStyle={sex === 'macho' ? { color: '#FFFFFF' } : { color: colors.primary }}
            icon={({ size }) => <MaterialCommunityIcons name="gender-male" size={size} color={sex === 'macho' ? '#FFFFFF' : colors.primary} />}
          >
            Macho
          </Button>
          <Button
            mode={sex === 'hembra' ? 'contained' : 'outlined'}
            onPress={() => setSex('hembra')}
            style={[styles.sexPill, sex === 'hembra' && { backgroundColor: colors.primary }]}
            labelStyle={sex === 'hembra' ? { color: '#FFFFFF' } : { color: colors.primary }}
            icon={({ size }) => <MaterialCommunityIcons name="gender-female" size={size} color={sex === 'hembra' ? '#FFFFFF' : colors.primary} />}
          >
            Hembra
          </Button>
        </View>

        {/* Estado Reproductivo */}
        <Menu
          visible={statusMenuVisible}
          onDismiss={() => setStatusMenuVisible(false)}
          anchor={
            <Button mode="outlined" onPress={() => setStatusMenuVisible(true)} style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border }]} labelStyle={{ color: colors.textSecondary }}>
              {REPRODUCTIVE_OPTIONS.find(o => o.value === reproductiveStatus)?.label || reproductiveStatus}
            </Button>
          }
        >
          {REPRODUCTIVE_OPTIONS.map(opt => (
            <Menu.Item key={opt.value} onPress={() => { setReproductiveStatus(opt.value); setStatusMenuVisible(false); }} title={opt.label} />
          ))}
        </Menu>
      </View>

      {/* Temperamento */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <SectionHeader title="Temperamento" />
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

      {/* Identificación */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <SectionHeader title="Identificación" />
        <TextInput label="Nº de identificación (microchip / registro)" value={idNumber} onChangeText={setIdNumber} mode="outlined" style={[styles.input, { backgroundColor: colors.surface }]} />
      </View>

      {/* Datos del Propietario */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <SectionHeader title="Datos del Propietario" />
        <TextInput label="Nombre Tutor *" value={tutorName} onChangeText={setTutorName} mode="outlined" style={[styles.input, { backgroundColor: colors.surface }]} />
        <View style={styles.row}>
          <TextInput label="Teléfono" value={phone} onChangeText={setPhone} mode="outlined" keyboardType="phone-pad" style={[styles.input, styles.rowField, { backgroundColor: colors.surface }]} />
          <TextInput label="Correo Electrónico" value={email} onChangeText={setEmail} mode="outlined" keyboardType="email-address" style={[styles.input, styles.rowField, { backgroundColor: colors.surface }]} />
        </View>
        <View style={styles.row}>
          <TextInput label="Dirección" value={address} onChangeText={setAddress} mode="outlined" style={[styles.input, styles.rowField, { backgroundColor: colors.surface }]} />
          <TextInput label="Clínica" value={clinicLocation} onChangeText={setClinicLocation} mode="outlined" style={[styles.input, styles.rowField, { backgroundColor: colors.surface }]} />
        </View>
      </View>

      {/* Historia Clínica */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <SectionHeader title="Historia Clínica" />

        <TextInput label="Motivo de consulta / Anamnesis" value={anamnesis} onChangeText={setAnamnesis} mode="outlined" multiline numberOfLines={4} style={[styles.input, { backgroundColor: colors.surface }]} />

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
        {habitat === 'Otros' && (
          <TextInput label="Especificar hábitat" value={habitatOther} onChangeText={setHabitatOther} mode="outlined" style={[styles.input, { backgroundColor: colors.surface }]} />
        )}

        <TextInput label="Alimento (tipo / marca)" value={food} onChangeText={setFood} mode="outlined" style={[styles.input, { backgroundColor: colors.surface }]} />
        <TextInput label="Frecuencia de alimentación" value={foodFrequency} onChangeText={setFoodFrequency} mode="outlined" style={[styles.input, { backgroundColor: colors.surface }]} />
        <TextInput label="Consumo de agua" value={waterConsumption} onChangeText={setWaterConsumption} mode="outlined" style={[styles.input, { backgroundColor: colors.surface }]} />
        <TextInput label="Micción" value={urination} onChangeText={setUrination} mode="outlined" style={[styles.input, { backgroundColor: colors.surface }]} />
        <TextInput label="Vive con otros animales" value={livesWithOtherAnimals} onChangeText={setLivesWithOtherAnimals} mode="outlined" style={[styles.input, { backgroundColor: colors.surface }]} />

        <TextInput label="Vacunas" value={vaccines} onChangeText={setVaccines} mode="outlined" multiline numberOfLines={2} style={[styles.input, { backgroundColor: colors.surface }]} />
        <TextInput label="Desparasitación" value={deworming} onChangeText={setDeworming} mode="outlined" style={[styles.input, { backgroundColor: colors.surface }]} />
        <TextInput label="Antipulgas" value={fleaTreatment} onChangeText={setFleaTreatment} mode="outlined" style={[styles.input, { backgroundColor: colors.surface }]} />

        {sex === 'hembra' && (
          <TextInput label="Último celo" value={lastHeat} onChangeText={setLastHeat} mode="outlined" style={[styles.input, { backgroundColor: colors.surface }]} />
        )}

        <TextInput label="Cirugías previas" value={surgeries} onChangeText={setSurgeries} mode="outlined" multiline numberOfLines={2} style={[styles.input, { backgroundColor: colors.surface }]} />
        <TextInput label="Otras enfermedades" value={otherDiseases} onChangeText={setOtherDiseases} mode="outlined" multiline numberOfLines={2} style={[styles.input, { backgroundColor: colors.surface }]} />
        <TextInput label="Medicamentos actuales" value={medications} onChangeText={setMedications} mode="outlined" multiline numberOfLines={2} style={[styles.input, { backgroundColor: colors.surface }]} />
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button mode="outlined" onPress={() => router.back()} style={[styles.cancelButton, { borderColor: colors.border }]} labelStyle={{ color: colors.text }}>
          Cancelar
        </Button>
        <Button mode="contained" onPress={handleSave} style={[styles.saveButton, { backgroundColor: colors.primary }]} labelStyle={{ color: '#FFFFFF' }}>
          Guardar Paciente
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 12, paddingBottom: 32, gap: 10 },
  photoContainer: {
    height: 140, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed',
    overflow: 'hidden', marginBottom: 4,
  },
  photoPreview: { width: '100%', height: '100%' },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  photoText: { fontSize: 13 },
  speciesRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  speciesPill: { flex: 1, borderRadius: 20, paddingVertical: 4, borderWidth: 1.5 },
  speciesPillLabel: { fontSize: 13, fontWeight: '600' },
  card: { borderRadius: 12, padding: 12, gap: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  accentLine: { width: 3, height: 18, borderRadius: 2 },
  sectionTitle: { fontWeight: '700', fontSize: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 4 },
  input: { marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8 },
  rowField: { flex: 1 },
  sexRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  sexPill: { flex: 1, borderRadius: 20, paddingVertical: 4, borderWidth: 1.5 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  tempChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1,
  },
  tempChipText: { fontSize: 13, fontWeight: '500' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4, gap: 12 },
  cancelButton: { borderWidth: 1.5, borderRadius: 20 },
  saveButton: { borderRadius: 20 },
});
