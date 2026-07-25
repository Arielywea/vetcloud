import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Search, Bell } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';

interface AgendaHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function AgendaHeader({ searchQuery, onSearchChange }: AgendaHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Left: Title section */}
      <View style={styles.left}>
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z"
            fill="#C9A227"
          />
        </Svg>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Agenda</Text>
          <Text style={styles.subtitle}>Gestiona y visualiza todas las citas programadas</Text>
        </View>
      </View>

      {/* Center: Search */}
      <View style={styles.center}>
        <View style={[styles.searchContainer, { borderColor: '#DDE3EC', backgroundColor: '#F7F8FB' }]}>
          <Search size={16} color="#5A6B80" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar paciente, tutor o cita..."
            placeholderTextColor="#5A6B80"
            value={searchQuery}
            onChangeText={onSearchChange}
          />
        </View>
      </View>

      {/* Right: Profile */}
      <View style={styles.right}>
        <Bell size={20} color={colors.text} />
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>VC</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>VetCloud</Text>
            <Text style={styles.profileRole}>Admin</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#DDE3EC',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  titleBlock: {
    gap: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#1A2332',
  },
  subtitle: {
    fontSize: 13,
    color: '#5A6B80',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    maxWidth: 320,
    gap: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#1A2332',
    paddingVertical: 4,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0B1D3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  profileInfo: {
    gap: 2,
  },
  profileName: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#1A2332',
  },
  profileRole: {
    fontSize: 11,
    color: '#5A6B80',
  },
});
