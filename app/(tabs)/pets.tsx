import React, { useState } from 'react';
import { View, FlatList, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Button, Chip, FAB, Portal, Modal, TextInput, SegmentedButtons, Menu } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePets } from '../../hooks/useDirectus';
import { DirectusPet } from '../../services/directus';
import { APP_COLORS } from '../../constants/colors';

function generateId(): string {
  return `pet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default function PetsScreen() {
  const router = useRouter();
  const { pets, loading, addPet, removePet } = usePets();
  const [showModal, setShowModal] = useState(false);

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

  const resetForm = () => {
    setName('');
    setSpecies('dog');
    setBreed('');
    setBirthDate('');
    setWeight('');
    setColor('');
    setReproductiveStatus('intacto');
    setAnamnesis('');
    setTutorName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setClinicLocation('');
  };

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
        clinical_history: [],
        tutor_name: tutorName.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        address: address.trim() || null,
        clinic_location: clinicLocation.trim() || null,
      });
      resetForm();
      setShowModal(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la mascota');
    }
  };

  const handleDelete = (pet: DirectusPet) => {
    Alert.alert(
      'Eliminar mascota',
      `¿Estás seguro de eliminar a ${pet.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => removePet(pet.id) },
      ]
    );
  };

  const calculateAge = (birthDate: string): string => {
    if (!birthDate) return '';
    try {
      const parts = birthDate.split('/');
      if (parts.length !== 3) return '';
      const birth = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      const now = new Date();
      const years = Math.floor((now.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      return years >= 0 ? `${years} año${years !== 1 ? 's' : ''}` : '';
    } catch {
      return '';
    }
  };

  const renderPetCard = ({ item }: { item: DirectusPet }) => {
    const age = item.birth_date ? calculateAge(item.birth_date) : '';

    return (
      <TouchableOpacity onPress={() => router.push(`/pet/${item.id}`)}>
        <Card style={styles.petCard}>
          <Card.Content>
            <View style={styles.petHeader}>
              <View style={styles.petAvatar}>
                <MaterialCommunityIcons
                  name={item.species === 'dog' ? 'dog' : 'cat'}
                  size={32}
                  color={APP_COLORS.primary}
                />
              </View>
              <View style={styles.petInfo}>
                <Text variant="titleMedium" style={styles.petName}>{item.name}</Text>
                <Text variant="bodySmall" style={styles.petBreed}>
                  {item.breed || 'Sin raza especificada'}{age ? ` · ${age}` : ''}
                </Text>
                {item.weight > 0 && (
                  <Text variant="bodySmall" style={styles.petWeight}>{item.weight} kg</Text>
                )}
              </View>
              <View style={styles.petActions}>
                <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionButton}>
                  <MaterialCommunityIcons name="delete" size={18} color={APP_COLORS.error} />
                </TouchableOpacity>
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={pets}
        renderItem={renderPetCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="dog" size={64} color={APP_COLORS.textLight} />
            <Text style={styles.emptyTitle}>No tienes mascotas registradas</Text>
            <Text style={styles.emptySubtitle}>
              Registra a tu mascota para llevar un seguimiento de su historial médico
            </Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          resetForm();
          setShowModal(true);
        }}
        color="#FFFFFF"
      />

      <Portal>
        <Modal
          visible={showModal}
          onDismiss={() => {
            setShowModal(false);
            resetForm();
          }}
          contentContainerStyle={styles.modalContent}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>Nueva Mascota</Text>
          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>

          <SegmentedButtons
            value={species}
            onValueChange={(val) => setSpecies(val as 'dog' | 'cat')}
            buttons={[
              { value: 'dog', label: 'Perro', icon: 'dog' },
              { value: 'cat', label: 'Gato', icon: 'cat' },
            ]}
            style={styles.speciesSelector}
          />

          <TextInput
            label="Nombre *"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Raza"
            value={breed}
            onChangeText={setBreed}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Fecha de nacimiento (DD/MM/AAAA)"
            value={birthDate}
            onChangeText={setBirthDate}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Peso (kg)"
            value={weight}
            onChangeText={setWeight}
            mode="outlined"
            style={styles.input}
            keyboardType="numeric"
          />

          <TextInput
            label="Color"
            value={color}
            onChangeText={setColor}
            mode="outlined"
            style={styles.input}
          />

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

          <TextInput
            label="Anamnesis"
            value={anamnesis}
            onChangeText={setAnamnesis}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
          />

          <Text variant="titleSmall" style={styles.sectionDivider}>Datos del Tutor</Text>

          <TextInput
            label="Nombre del Tutor"
            value={tutorName}
            onChangeText={setTutorName}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Teléfono"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            style={styles.input}
            keyboardType="phone-pad"
          />

          <TextInput
            label="Correo Electrónico"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
          />

          <TextInput
            label="Dirección"
            value={address}
            onChangeText={setAddress}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Lugar de Atención (Clínica)"
            value={clinicLocation}
            onChangeText={setClinicLocation}
            mode="outlined"
            style={styles.input}
          />

          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => {
                setShowModal(false);
                resetForm();
              }}
              style={styles.cancelButton}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.saveButton}
            >
              Registrar
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
  },
  listContent: {
    padding: 12,
    paddingBottom: 80,
  },
  petCard: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: APP_COLORS.surface,
    elevation: 1,
  },
  petHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: APP_COLORS.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petInfo: {
    flex: 1,
    marginLeft: 12,
  },
  petName: {
    fontWeight: '700',
    color: APP_COLORS.text,
  },
  petBreed: {
    color: APP_COLORS.textSecondary,
    marginTop: 2,
  },
  petWeight: {
    color: APP_COLORS.textSecondary,
    marginTop: 2,
  },
  petActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: APP_COLORS.text,
    textAlign: 'center',
  },
  emptySubtitle: {
    marginTop: 8,
    color: APP_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: APP_COLORS.primary,
    borderRadius: 16,
  },
  modalContent: {
    backgroundColor: APP_COLORS.surface,
    padding: 20,
    margin: 20,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalTitle: {
    fontWeight: '700',
    color: APP_COLORS.text,
    marginBottom: 16,
  },
  modalScroll: {
    maxHeight: 400,
  },
  sectionDivider: {
    fontWeight: '700',
    color: APP_COLORS.primary,
    marginTop: 8,
    marginBottom: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: APP_COLORS.textSecondary,
    marginBottom: 4,
  },
  speciesSelector: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
    backgroundColor: APP_COLORS.surface,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 12,
  },
  cancelButton: {
    borderColor: APP_COLORS.border,
  },
  saveButton: {
    backgroundColor: APP_COLORS.primary,
  },
});
