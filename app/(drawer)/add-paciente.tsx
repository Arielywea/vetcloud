import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, Menu } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePets } from '../../hooks/useDirectus';
import { useTheme } from '../../contexts/ThemeContext';

export default function AddPacienteScreen() {
  const router = useRouter();
  const { addPet } = usePets();
  const { colors } = useTheme();

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
      Alert.alert('Error', 'No se pudo guardar el paciente');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.speciesRow}>
        <Button
          mode={species === 'dog' ? 'contained' : 'outlined'}
          onPress={() => setSpecies('dog')}
          style={[
            styles.speciesPill,
            species === 'dog' && { backgroundColor: colors.primary },
          ]}
          labelStyle={[
            styles.speciesPillLabel,
            species === 'dog' ? { color: '#FFFFFF' } : { color: colors.primary },
          ]}
          icon={({ size }) => (
            <MaterialCommunityIcons
              name="dog"
              size={size}
              color={species === 'dog' ? '#FFFFFF' : colors.primary}
            />
          )}
        >
          Perro
        </Button>
        <Button
          mode={species === 'cat' ? 'contained' : 'outlined'}
          onPress={() => setSpecies('cat')}
          style={[
            styles.speciesPill,
            species === 'cat' && { backgroundColor: colors.primary },
          ]}
          labelStyle={[
            styles.speciesPillLabel,
            species === 'cat' ? { color: '#FFFFFF' } : { color: colors.primary },
          ]}
          icon={({ size }) => (
            <MaterialCommunityIcons
              name="cat"
              size={size}
              color={species === 'cat' ? '#FFFFFF' : colors.primary}
            />
          )}
        >
          Gato
        </Button>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.accentLine, { backgroundColor: colors.primary }]} />
          <Text variant="titleSmall" style={[styles.sectionTitle, { color: colors.primary }]}>
            Reseña del Paciente
          </Text>
        </View>

        <TextInput
          label="Nombre *"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={[styles.input, { backgroundColor: colors.surface }]}
        />

        <View style={styles.row}>
          <TextInput
            label="Raza"
            value={breed}
            onChangeText={setBreed}
            mode="outlined"
            style={[styles.input, styles.rowField, { backgroundColor: colors.surface }]}
          />
          <TextInput
            label="Color"
            value={color}
            onChangeText={setColor}
            mode="outlined"
            style={[styles.input, styles.rowField, { backgroundColor: colors.surface }]}
          />
        </View>

        <View style={styles.row}>
          <TextInput
            label="Fecha de nacimiento (DD/MM/AAAA)"
            value={birthDate}
            onChangeText={setBirthDate}
            mode="outlined"
            style={[styles.input, styles.rowField, { backgroundColor: colors.surface }]}
          />
          <TextInput
            label="Peso (kg)"
            value={weight}
            onChangeText={setWeight}
            mode="outlined"
            keyboardType="numeric"
            style={[styles.input, styles.rowField, { backgroundColor: colors.surface }]}
          />
        </View>

        <Menu
          visible={statusMenuVisible}
          onDismiss={() => setStatusMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setStatusMenuVisible(true)}
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border }]}
              labelStyle={{ color: colors.textSecondary }}
            >
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

        <TextInput
          label="Anamnesis"
          value={anamnesis}
          onChangeText={setAnamnesis}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={[styles.input, { backgroundColor: colors.surface }]}
        />
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.accentLine, { backgroundColor: colors.primary }]} />
          <Text variant="titleSmall" style={[styles.sectionTitle, { color: colors.primary }]}>
            Datos del Propietario
          </Text>
        </View>

        <TextInput
          label="Nombre Tutor"
          value={tutorName}
          onChangeText={setTutorName}
          mode="outlined"
          style={[styles.input, { backgroundColor: colors.surface }]}
        />

        <View style={styles.row}>
          <TextInput
            label="Teléfono"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            keyboardType="phone-pad"
            style={[styles.input, styles.rowField, { backgroundColor: colors.surface }]}
          />
          <TextInput
            label="Correo Electrónico"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            style={[styles.input, styles.rowField, { backgroundColor: colors.surface }]}
          />
        </View>

        <View style={styles.row}>
          <TextInput
            label="Dirección"
            value={address}
            onChangeText={setAddress}
            mode="outlined"
            style={[styles.input, styles.rowField, { backgroundColor: colors.surface }]}
          />
          <TextInput
            label="Clínica"
            value={clinicLocation}
            onChangeText={setClinicLocation}
            mode="outlined"
            style={[styles.input, styles.rowField, { backgroundColor: colors.surface }]}
          />
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          mode="outlined"
          onPress={() => router.back()}
          style={[styles.cancelButton, { borderColor: colors.border }]}
          labelStyle={{ color: colors.text }}
        >
          Cancelar
        </Button>
        <Button
          mode="contained"
          onPress={handleSave}
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          labelStyle={{ color: '#FFFFFF' }}
        >
          Guardar Paciente
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 12, paddingBottom: 32, gap: 10 },
  speciesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  speciesPill: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 4,
    borderWidth: 1.5,
  },
  speciesPillLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    borderRadius: 12,
    padding: 12,
    gap: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  accentLine: {
    width: 3,
    height: 18,
    borderRadius: 2,
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 14,
  },
  input: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  rowField: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 12,
  },
  cancelButton: {
    borderWidth: 1.5,
    borderRadius: 20,
  },
  saveButton: {
    borderRadius: 20,
  },
});
