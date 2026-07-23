import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';

interface PatientPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function PatientPagination({
  currentPage, totalPages, totalItems, itemsPerPage, onPageChange,
}: PatientPaginationProps) {
  const { colors } = useTheme();
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.info, { color: colors.textSecondary }]}>
        Mostrando {start}-{end} de {totalItems} pacientes
      </Text>
      <View style={styles.pages}>
        <TouchableOpacity
          onPress={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={[styles.pageBtn, currentPage === 1 && { opacity: 0.4 }]}
          activeOpacity={0.7}
        >
          <ChevronLeft size={16} color={colors.text} />
        </TouchableOpacity>
        {pages.map((page, idx) => {
          if (page === '...') {
            return <Text key={`dots-${idx}`} style={[styles.dots, { color: colors.textLight }]}>...</Text>;
          }
          const isActive = page === currentPage;
          return (
            <TouchableOpacity
              key={page}
              onPress={() => onPageChange(page)}
              style={[styles.pageBtn, isActive && { backgroundColor: colors.primary }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.pageNum, { color: isActive ? '#FFFFFF' : colors.text }]}>{page}</Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          onPress={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={[styles.pageBtn, currentPage === totalPages && { opacity: 0.4 }]}
          activeOpacity={0.7}
        >
          <ChevronRight size={16} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.md, paddingHorizontal: SPACING.md },
  info: { fontSize: TYPOGRAPHY.sizes.sm },
  pages: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  pageBtn: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  pageNum: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.medium },
  dots: { fontSize: TYPOGRAPHY.sizes.sm, paddingHorizontal: 4 },
});
