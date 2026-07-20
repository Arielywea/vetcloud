import { Drawer } from 'expo-router/drawer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import DrawerContent from '../../components/DrawerContent';
import { APP_COLORS } from '../../constants/colors';

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <Drawer
        drawerContent={(props) => <DrawerContent {...props} />}
        screenOptions={{
          headerStyle: { backgroundColor: APP_COLORS.primary },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '600' },
          drawerStyle: {
            backgroundColor: APP_COLORS.primaryDark,
            width: 280,
          },
          headerShown: true,
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            title: 'VetCloud',
            headerTitle: 'VetCloud - Inicio',
          }}
        />
        <Drawer.Screen
          name="diseases"
          options={{
            title: 'Enfermedades',
            headerTitle: 'Catálogo de Enfermedades',
          }}
        />
        <Drawer.Screen
          name="pacientes"
          options={{
            title: 'Pacientes',
            headerTitle: 'Mis Pacientes',
          }}
        />
        <Drawer.Screen
          name="add-paciente"
          options={{
            title: 'Nueva Mascota',
            headerTitle: 'Nueva Mascota',
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="search"
          options={{
            title: 'Buscar',
            headerTitle: 'Búsqueda',
          }}
        />
        <Drawer.Screen
          name="notes"
          options={{
            title: 'Notas',
            headerTitle: 'Mis Notas',
          }}
        />
        <Drawer.Screen
          name="agenda"
          options={{
            title: 'Agenda',
            headerTitle: 'Agenda Médica',
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
