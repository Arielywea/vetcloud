import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TextInput as RNTextInput, TouchableOpacity } from 'react-native';
import { Text, Modal, Portal, Menu } from 'react-native-paper';
import { Package, Pill, Syringe, Scissors, AlertTriangle, Pencil, Trash2, Plus, X } from 'lucide-react-native';
import { useInventory } from '../../hooks/useDirectus';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, SHADOWS } from '../../constants/tokens';
import VCard from '../../components/ui/Card';
import VButton from '../../components/ui/Button';
import VEmptyState from '../../components/ui/EmptyState';

const CATEGORY_OPTIONS = [
  { value: 'medicamento', label: 'Medicamento' },
  { value: 'insumo', label: 'Insumo' },
  { value: 'vacuna', label: 'Vacuna' },
  { value: 'material', label: 'Material quirúrgico' },
];

const UNIT_OPTIONS = ['unidades', 'ml', 'mg', 'cajas', 'frascos', 'ampollas', 'tubos'];

const CATEGORY_ICONS: Record<string, typeof Pill> = {
  medicamento: Pill,
  vacuna: Syringe,
  material: Scissors,
  insumo: Package,
};

export default function InventarioScreen() {
  const { colors } = useTheme();
  const { items, lowStockItems, loading, addItem, updateItem, removeItem } = useInventory();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [unitMenuVisible, setUnitMenuVisible] = useState(false);

  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('insumo');
  const [itemStock, setItemStock] = useState('');
  const [itemMinStock, setItemMinStock] = useState('5');
  const [itemUnit, setItemUnit] = useState('unidades');
  const [errorDialog, setErrorDialog] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ name: string; id: string } | null>(null);

  const resetForm = () => {
    setItemName(''); setItemCategory('insumo'); setItemStock(''); setItemMinStock('5'); setItemUnit('unidades'); setEditingItem(null);
  };

  const openEdit = (item: any) => {
    setEditingItem(item.id); setItemName(item.name); setItemCategory(item.category);
    setItemStock(String(item.current_stock)); setItemMinStock(String(item.min_stock)); setItemUnit(item.unit); setShowModal(true);
  };

  const handleSave = async () => {
    if (!itemName.trim()) { setErrorDialog('El nombre es obligatorio'); return; }
    try {
      const data = { name: itemName.trim(), category: itemCategory, current_stock: parseInt(itemStock) || 0, min_stock: parseInt(itemMinStock) || 5, unit: itemUnit, last_restocked: new Date().toISOString() };
      if (editingItem) { await updateItem(editingItem, data); } else { await addItem(data); }
      resetForm(); setShowModal(false);
    } catch { setErrorDialog('No se pudo guardar el item'); }
  };

  const getStockColor = (current: number, min: number) => {
    if (current <= 0) return colors.error;
    if (current <= min) return colors.warning;
    return colors.success;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {lowStockItems.length > 0 && (
        <View style={[styles.alertCard, { backgroundColor: colors.error + '15', borderColor: colors.error }]}>
          <AlertTriangle size={20} color={colors.error} />
          <Text style={[styles.alertText, { color: colors.error }]}>
            {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} con stock bajo
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.listContent}>
        {loading ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Cargando inventario...</Text>
        ) : items.length === 0 ? (
          <VEmptyState
            icon={<Package size={32} color={colors.textLight} />}
            title="Sin items en inventario"
            description="Agrega medicamentos, insumos y más"
          />
        ) : (
          items.map(item => {
            const stockColor = getStockColor(item.current_stock, item.min_stock);
            const stockPercent = item.min_stock > 0 ? Math.min((item.current_stock / item.min_stock) * 100, 100) : 100;
            const CategoryIcon = CATEGORY_ICONS[item.category] || Package;
            return (
              <VCard key={item.id} style={styles.itemCard}>
                <View style={styles.itemRow}>
                  <View style={[styles.itemIcon, { backgroundColor: stockColor + '18' }]}>
                    <CategoryIcon size={20} color={stockColor} />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text variant="titleSmall" style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.itemCategory, { color: colors.textSecondary }]}>
                      {CATEGORY_OPTIONS.find(c => c.value === item.category)?.label || item.category}
                    </Text>
                  </View>
                  <View style={styles.stockSection}>
                    <Text style={[styles.stockNumber, { color: stockColor }]}>
                      {item.current_stock} <Text style={[styles.stockUnit, { color: colors.textSecondary }]}>{item.unit}</Text>
                    </Text>
                    <View style={[styles.stockBar, { backgroundColor: colors.border }]}>
                      <View style={[styles.stockFill, { width: `${stockPercent}%`, backgroundColor: stockColor }]} />
                    </View>
                    <Text style={[styles.minStock, { color: colors.textLight }]}>Mín: {item.min_stock}</Text>
                  </View>
                  <View style={styles.itemActions}>
                    <TouchableOpacity onPress={() => openEdit(item)}><Pencil size={18} color={colors.primary} /></TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item)}><Trash2 size={18} color={colors.error} /></TouchableOpacity>
                  </View>
                </View>
              </VCard>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary, ...SHADOWS.lg }]} onPress={() => { resetForm(); setShowModal(true); }}>
        <Plus size={24} color="#FFF" />
      </TouchableOpacity>

      <Portal>
        <Modal visible={showModal} onDismiss={() => { setShowModal(false); resetForm(); }} contentContainerStyle={[styles.modal, { backgroundColor: colors.surface }]}>
          <ScrollView>
            <Text variant="titleMedium" style={[styles.modalTitle, { color: colors.text }]}>{editingItem ? 'Editar Item' : 'Nuevo Item'}</Text>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Nombre *</Text>
            <RNTextInput style={[styles.input, { borderColor: colors.border, color: colors.text }]} value={itemName} onChangeText={setItemName} placeholder="Nombre del item" placeholderTextColor={colors.textLight} />
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Categoría</Text>
            <Menu visible={categoryMenuVisible} onDismiss={() => setCategoryMenuVisible(false)} anchor={
              <TouchableOpacity style={[styles.input, styles.menuAnchor, { borderColor: colors.border }]} onPress={() => setCategoryMenuVisible(true)}>
                <Text style={{ color: colors.text }}>{CATEGORY_OPTIONS.find(c => c.value === itemCategory)?.label || itemCategory}</Text>
              </TouchableOpacity>
            }>
              {CATEGORY_OPTIONS.map(opt => (
                <Menu.Item key={opt.value} onPress={() => { setItemCategory(opt.value); setCategoryMenuVisible(false); }} title={opt.label} />
              ))}
            </Menu>
            <View style={styles.row}>
              <View style={styles.rowField}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Stock actual</Text>
                <RNTextInput style={[styles.input, { borderColor: colors.border, color: colors.text }]} value={itemStock} onChangeText={setItemStock} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.textLight} />
              </View>
              <View style={styles.rowField}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Stock mínimo</Text>
                <RNTextInput style={[styles.input, { borderColor: colors.border, color: colors.text }]} value={itemMinStock} onChangeText={setItemMinStock} keyboardType="numeric" placeholder="5" placeholderTextColor={colors.textLight} />
              </View>
            </View>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Unidad</Text>
            <Menu visible={unitMenuVisible} onDismiss={() => setUnitMenuVisible(false)} anchor={
              <TouchableOpacity style={[styles.input, styles.menuAnchor, { borderColor: colors.border }]} onPress={() => setUnitMenuVisible(true)}>
                <Text style={{ color: colors.text }}>{itemUnit}</Text>
              </TouchableOpacity>
            }>
              {UNIT_OPTIONS.map(u => (
                <Menu.Item key={u} onPress={() => { setItemUnit(u); setUnitMenuVisible(false); }} title={u} />
              ))}
            </Menu>
            <View style={styles.actions}>
              <VButton variant="secondary" onPress={() => { setShowModal(false); resetForm(); }}>Cancelar</VButton>
              <VButton variant="primary" onPress={handleSave}>Guardar</VButton>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      <Portal>
        <Modal visible={!!errorDialog} onDismiss={() => setErrorDialog(null)} contentContainerStyle={[styles.dialogModal, { backgroundColor: colors.surface }]}>
          <AlertTriangle size={32} color={colors.warning} style={{ alignSelf: 'center', marginBottom: 8 }} />
          <Text variant="titleMedium" style={{ textAlign: 'center', color: colors.text }}>Error</Text>
          <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 4 }}>{errorDialog}</Text>
          <VButton variant="primary" fullWidth onPress={() => setErrorDialog(null)} style={{ marginTop: 16 }}>OK</VButton>
        </Modal>
      </Portal>

      <Portal>
        <Modal visible={!!confirmDelete} onDismiss={() => setConfirmDelete(null)} contentContainerStyle={[styles.dialogModal, { backgroundColor: colors.surface }]}>
          <AlertTriangle size={32} color={colors.error} style={{ alignSelf: 'center', marginBottom: 8 }} />
          <Text variant="titleMedium" style={{ textAlign: 'center', color: colors.text }}>Eliminar item</Text>
          <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 4 }}>¿Eliminar "{confirmDelete?.name}"?</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
            <VButton variant="secondary" onPress={() => setConfirmDelete(null)} style={{ flex: 1 }}>Cancelar</VButton>
            <VButton variant="danger" onPress={() => { if (confirmDelete) removeItem(confirmDelete.id); setConfirmDelete(null); }} style={{ flex: 1 }}>Eliminar</VButton>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  alertCard: { flexDirection: 'row', alignItems: 'center', gap: 8, margin: SPACING.lg, padding: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1 },
  alertText: { fontWeight: '600', fontSize: 13 },
  listContent: { padding: SPACING.lg, paddingBottom: 80 },
  emptyText: { textAlign: 'center', marginTop: 40 },
  itemCard: { marginBottom: SPACING.md, borderRadius: RADIUS.lg },
  itemRow: { flexDirection: 'row', alignItems: 'center' },
  itemIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  itemInfo: { flex: 1, marginLeft: SPACING.md },
  itemName: { fontWeight: '700' },
  itemCategory: { fontSize: 12, marginTop: 2 },
  stockSection: { alignItems: 'flex-end', minWidth: 70 },
  stockNumber: { fontSize: 16, fontWeight: '800' },
  stockUnit: { fontSize: 11, fontWeight: '400' },
  stockBar: { width: 60, height: 4, borderRadius: 2, marginTop: 4 },
  stockFill: { height: 4, borderRadius: 2 },
  minStock: { fontSize: 10, marginTop: 2 },
  itemActions: { flexDirection: 'row', gap: SPACING.md },
  fab: { position: 'absolute', right: 16, bottom: 16, width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  modal: { padding: 24, margin: 20, borderRadius: RADIUS.lg, maxHeight: '85%' },
  dialogModal: { padding: 24, margin: 20, borderRadius: RADIUS.lg },
  modalTitle: { fontWeight: '700', marginBottom: SPACING.lg },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: SPACING.xs },
  input: { borderWidth: 1, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, fontSize: 15 },
  row: { flexDirection: 'row', gap: SPACING.md },
  rowField: { flex: 1 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.md, marginTop: SPACING.sm },
  menuAnchor: { justifyContent: 'center', minHeight: 48 },
});
