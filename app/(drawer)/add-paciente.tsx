import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, Menu } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePets } from '../../hooks/useDirectus';
import { APP_COLORS } from '../../constants/colors';

export default function AddPacienteScreen() {
  const router = useRouter();
  const { addPet } = usePets();

  const [name, setName] = useState('');
  const [species, setSpecies] = useState<'dog' | 'cat'>('dog');
  const [breed, setBreed] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [weight, setWeight] = useState('');
  const [color, setColor] = useState('');
  const [reproductiveStatus, setReproductiveStatus] = useState('intacto');
  const [anamnesis, setAnamnesis] = useState('');
  const [tutorName, setTutorName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [clinicLocation, setClinicLocation] = useState('');
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }
    try {
      await addPet({
        name: name.trim(),
        species,
        breed: breed.trim(),
        birth_date: birthDate,
        weight: parseFloat(weight) || 0,
        color: color.trim(),
        photo: null,
        allergies: [],
        notes: '',
        reproductive_status: reproductiveStatus,
        anamnesis: anamnesis.trim(),
        tutor_name: tutorName.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        address: address.trim() || null,
        clinic_location: clinicLocation.trim() || null,
      });
      router.back();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la mascota');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SegmentedButtons
        value={species}
        onValueChange={(val) => setSpecies(val as 'dog' | 'cat')}
        buttons={[
          { value: 'dog', label: 'Perro', icon: 'dog' },
          { value: 'cat', label: 'Gato', icon: 'cat' },
        ]}
        style={styles.speciesSelector}
      />

      <Text variant="titleSmall" style={styles.sectionTitle}>Datos de la Mascota</Text>

      <TextInput label="Nombre *" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
      <TextInput label="Raza" value={breed} onChangeText={setBreed} mode="outlined" style={styles.input} />
      <TextInput label="Fecha de nacimiento (DD/MM/AAAA)" value={birthDate} onChangeText={setBirthDate} mode="outlined" style={styles.input} />
      <TextInput label="Peso (kg)" value={weight} onChangeText={setWeight} mode="outlined" style={styles.input} keyboardType="numeric" />
      <TextInput label="Color" value={color} onChangeText={setColor} mode="outlined" style={styles.input} />

      <Text style={styles.fieldLabel}>Estado Reproductivo</Text>
      <Menu
        visible={statusMenuVisible}
        onDismiss={() => setStatusMenuVisible(false)}
        anchor={
          <Button mode="outlined" onPress={() => setStatusMenuVisible(true)} style={styles.input}>
            {reproductiveStatus === 'intacto' ? 'Intacto/a' :
             reproductiveStatus === 'castrado' ? 'Castrado' :
             reproductiveStatus === 'esterilizado' ? 'Esterilizado/a' :
             reproductiveStatus === 'gestante' ? 'Gestante' : reproductiveStatus}
          </Button>
        }
      >
        <Menu.Item onPress={() => { setReproductiveStatus('intacto'); setStatusMenuVisible(false); }} title="Intacto/a" />
        <Menu.Item onPress={() => { setReproductiveStatus('castrado'); setStatusMenuVisible(false); }} title="Castrado" />
        <Menu.Item onPress={() => { setReproductiveStatus('esterilizado'); setStatusMenuVisible(false); }} title="Esterilizado/a" />
        <Menu.Item onPress={() => { setReproductiveStatus('gestante'); setStatusMenuVisible(false); }} title="Gestante" />
      </Menu>

      <TextInput label="Anamnesis" value={anamnesis} onChangeText={setAnamnesis} mode="outlined" multiline numberOfLines={4} style={styles.input} />

      <Text variant="titleSmall" style={styles.sectionTitle}>Datos del Tutor</Text>

      <TextInput label="Nombre del Tutor" value={tutorName} onChangeText={setTutorName} mode="outlined" style={styles.input} />
      <TextInput label="Teléfono" value={phone} onChangeText={setPhone} mode="outlined" style={styles.input} keyboardType="phone-pad" />
      <TextInput label="Correo Electrónico" value={email} onChangeText={setEmail} mode="outlined" style={styles.input} keyboardType="email-address" />
      <TextInput label="Dirección" value={address} onChangeText={setAddress} mode="outlined" style={styles.input} />
      <TextInput label="Lugar de Atención (Clínica)" value={clinicLocation} onChangeText={setClinicLocation} mode="outlined" style={styles.input} />

      <View style={styles.actions}>
        <Button mode="outlined" onPress={() => router.back()} style={styles.cancelButton}>Cancelar</Button>
        <Button mode="contained" onPress={handleSave} style={styles.saveButton}>Guardar Mascota</Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  speciesSelector: { marginBottom: 20 },
  sectionTitle: { fontWeight: '700', color: APP_COLORS.primary, marginBottom: 12, marginTop: 8 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: APP_COLORS.textSecondary, marginBottom: 4 },
  input: { marginBottom: 12, backgroundColor: APP_COLORS.surface },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, gap: 12 },
  cancelButton: { borderColor: APP_COLORS.border },
  saveButton: { backgroundColor: APP_COLORS.primary },
});
