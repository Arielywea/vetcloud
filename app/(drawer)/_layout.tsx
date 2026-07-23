import { Drawer } from 'expo-router/drawer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View } from 'react-native';
import DrawerContent from '../../components/DrawerContent';
import BeagleLogo from '../../components/BeagleLogo';
import { useTheme } from '../../contexts/ThemeContext';

export default function DrawerLayout() {
  const { colors, isDark } = useTheme();

  return (
    <GestureHandlerRootView style={styles.container}>
      <Drawer
        drawerContent={(props) => <DrawerContent {...props} />}
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: isDark ? '#000000' : '#FFFFFF',
          headerTitleStyle: { fontWeight: '600' },
          drawerStyle: {
            backgroundColor: isDark ? '#0A0A14' : colors.primaryDark,
            width: 280,
          },
          headerShown: true,
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            title: 'VetCloud',
            headerTitle: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <BeagleLogo size={24} variant={isDark ? 'dark' : 'light'} />
                <span style={{ color: isDark ? '#000000' : '#FFFFFF', fontSize: 18, fontWeight: '600' }}>VetCloud</span>
              </View>
            ),
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
            title: 'Nuevo Paciente',
            headerTitle: 'Nuevo Paciente',
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="add-disease"
          options={{
            title: 'Nueva Enfermedad',
            headerTitle: 'Nueva Enfermedad',
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
        <Drawer.Screen
          name="inventario"
          options={{
            title: 'Inventario',
            headerTitle: 'Inventario de Insumos',
          }}
        />
        <Drawer.Screen
          name="profile"
          options={{
            title: 'Mi Perfil',
            headerTitle: 'Mi Perfil',
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
