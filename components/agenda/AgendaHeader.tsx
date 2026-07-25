import React from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { Search, Bell, Menu } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';

interface AgendaHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onMenuPress?: () => void;
  vetName?: string;
  clinicOpen?: boolean;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function AgendaHeader({
  searchQuery,
  onSearchChange,
  onMenuPress,
  vetName = 'Dr. Veterinario',
  clinicOpen = true,
}: AgendaHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      {/* Top row: greeting + actions */}
      <View style={styles.topRow}>
        <View style={styles.greetingSection}>
          <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn}>
            <Menu size={20} color={colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>{getGreeting()}</Text>
            <Text style={[styles.vetName, { color: colors.text }]}>{vetName}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <View style={[styles.statusBadge, { backgroundColor: clinicOpen ? '#10B981' + '18' : '#EF4444' + '18' }]}>
            <View style={[styles.statusDot, { backgroundColor: clinicOpen ? '#10B981' : '#EF4444' }]} />
            <Text style={[styles.statusText, { color: clinicOpen ? '#10B981' : '#EF4444' }]}>
              {clinicOpen ? 'Abierta' : 'Cerrada'}
            </Text>
          </View>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.background }]}>
            <Bell size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {vetName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Search bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.background, borderRadius: RADIUS.md }]}>
        <Search size={16} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Buscar mascota, tutor, expediente..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={onSearchChange}
          returnKeyType="search"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  greetingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  menuBtn: {
    padding: SPACING.xs,
  },
  greeting: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '500',
  },
  vetName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    marginTop: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    padding: 0,
  },
});
