import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Button, FAB, Portal, Modal, TextInput, Menu, Dialog } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useInventory } from '../../hooks/useDirectus';
import { useTheme } from '../../contexts/ThemeContext';

const CATEGORY_OPTIONS = [
  { value: 'medicamento', label: 'Medicamento' },
  { value: 'insumo', label: 'Insumo' },
  { value: 'vacuna', label: 'Vacuna' },
  { value: 'material', label: 'Material quirúrgico' },
];

const UNIT_OPTIONS = [
  'unidades', 'ml', 'mg', 'cajas', 'frascos', 'ampollas', 'tubos',
];

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
    setItemName('');
    setItemCategory('insumo');
    setItemStock('');
    setItemMinStock('5');
    setItemUnit('unidades');
    setEditingItem(null);
  };

  const openEdit = (item: any) => {
    setEditingItem(item.id);
    setItemName(item.name);
    setItemCategory(item.category);
    setItemStock(String(item.current_stock));
    setItemMinStock(String(item.min_stock));
    setItemUnit(item.unit);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!itemName.trim()) {
      setErrorDialog('El nombre es obligatorio');
      return;
    }
    try {
      const data = {
        name: itemName.trim(),
        category: itemCategory,
        current_stock: parseInt(itemStock) || 0,
        min_stock: parseInt(itemMinStock) || 5,
        unit: itemUnit,
        last_restocked: new Date().toISOString(),
      };
      if (editingItem) {
        await updateItem(editingItem, data);
      } else {
        await addItem(data);
      }
      resetForm();
      setShowModal(false);
    } catch {
      setErrorDialog('No se pudo guardar el item');
    }
  };

  const handleDelete = (item: any) => {
    setConfirmDelete({ name: item.name, id: item.id });
  };

  const getStockColor = (current: number, min: number) => {
    if (current <= 0) return colors.error;
    if (current <= min) return colors.warning;
    return colors.success;
  };

  const renderCategoryIcon = (category: string) => {
    switch (category) {
      case 'medicamento': return 'pill';
      case 'vacuna': return 'needle';
      case 'material': return 'scissors-cutting';
      default: return 'package-variant';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {lowStockItems.length > 0 && (
        <Card style={[styles.alertCard, { backgroundColor: colors.error + '15', borderColor: colors.error }]}>
          <Card.Content style={styles.alertContent}>
            <MaterialCommunityIcons name="alert-circle" size={20} color={colors.error} />
            <Text style={[styles.alertText, { color: colors.error }]}>
              {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} con stock bajo
            </Text>
          </Card.Content>
        </Card>
      )}

      <ScrollView contentContainerStyle={styles.listContent}>
        {loading ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Cargando inventario...</Text>
        ) : items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="package-variant" size={48} color={colors.textLight} />
            <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>Sin items en inventario</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textLight }]}>Agrega medicamentos, insumos y más</Text>
          </View>
        ) : (
          items.map(item => {
            const stockColor = getStockColor(item.current_stock, item.min_stock);
            const stockPercent = item.min_stock > 0 ? Math.min((item.current_stock / item.min_stock) * 100, 100) : 100;
            return (
              <Card key={item.id} style={[styles.itemCard, { backgroundColor: colors.surface }]}>
                <Card.Content>
                  <View style={styles.itemRow}>
                    <View style={[styles.itemIcon, { backgroundColor: stockColor + '18' }]}>
                      <MaterialCommunityIcons name={renderCategoryIcon(item.category) as any} size={20} color={stockColor} />
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
                      <Button compact mode="text" onPress={() => openEdit(item)}>
                        <MaterialCommunityIcons name="pencil" size={18} color={colors.primary} />
                      </Button>
                      <Button compact mode="text" onPress={() => handleDelete(item)}>
                        <MaterialCommunityIcons name="delete" size={18} color={colors.error} />
                      </Button>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            );
          })
        )}
      </ScrollView>

      <FAB icon="plus" style={[styles.fab, { backgroundColor: colors.primary }]} color="#FFF" onPress={() => { resetForm(); setShowModal(true); }} />

      <Portal>
        <Modal visible={showModal} onDismiss={() => { setShowModal(false); resetForm(); }} contentContainerStyle={[styles.modal, { backgroundColor: colors.surface }]}>
          <ScrollView>
            <Text variant="titleMedium" style={[styles.modalTitle, { color: colors.text }]}>
              {editingItem ? 'Editar Item' : 'Nuevo Item'}
            </Text>
            <TextInput label="Nombre *" value={itemName} onChangeText={setItemName} mode="outlined" style={styles.input} />

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Categoría</Text>
            <Menu visible={categoryMenuVisible} onDismiss={() => setCategoryMenuVisible(false)} anchor={
              <Button mode="outlined" onPress={() => setCategoryMenuVisible(true)} style={styles.input}>
                {CATEGORY_OPTIONS.find(c => c.value === itemCategory)?.label || itemCategory}
              </Button>
            }>
              {CATEGORY_OPTIONS.map(opt => (
                <Menu.Item key={opt.value} onPress={() => { setItemCategory(opt.value); setCategoryMenuVisible(false); }} title={opt.label} />
              ))}
            </Menu>

            <View style={styles.row}>
              <TextInput label="Stock actual" value={itemStock} onChangeText={setItemStock} mode="outlined" keyboardType="numeric" style={[styles.input, styles.rowField]} />
              <TextInput label="Stock mínimo" value={itemMinStock} onChangeText={setItemMinStock} mode="outlined" keyboardType="numeric" style={[styles.input, styles.rowField]} />
            </View>

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Unidad</Text>
            <Menu visible={unitMenuVisible} onDismiss={() => setUnitMenuVisible(false)} anchor={
              <Button mode="outlined" onPress={() => setUnitMenuVisible(true)} style={styles.input}>
                {itemUnit}
              </Button>
            }>
              {UNIT_OPTIONS.map(u => (
                <Menu.Item key={u} onPress={() => { setItemUnit(u); setUnitMenuVisible(false); }} title={u} />
              ))}
            </Menu>

            <View style={styles.actions}>
              <Button mode="outlined" onPress={() => { setShowModal(false); resetForm(); }} style={{ borderColor: colors.border }}>Cancelar</Button>
              <Button mode="contained" onPress={handleSave} style={{ backgroundColor: colors.primary }}>Guardar</Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Error Dialog */}
      <Portal>
        <Dialog visible={!!errorDialog} onDismiss={() => setErrorDialog(null)}>
          <Dialog.Icon icon="alert-circle-outline" />
          <Dialog.Title style={{ textAlign: 'center' }}>Error</Dialog.Title>
          <Dialog.Content>
            <Text style={{ textAlign: 'center' }}>{errorDialog}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setErrorDialog(null)}>OK</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Confirm Delete Dialog */}
      <Portal>
        <Dialog visible={!!confirmDelete} onDismiss={() => setConfirmDelete(null)}>
          <Dialog.Icon icon="alert" />
          <Dialog.Title style={{ textAlign: 'center' }}>Eliminar item</Dialog.Title>
          <Dialog.Content>
            <Text style={{ textAlign: 'center' }}>¿Eliminar "{confirmDelete?.name}"?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmDelete(null)}>Cancelar</Button>
            <Button textColor={colors.error} onPress={() => { if (confirmDelete) removeItem(confirmDelete.id); setConfirmDelete(null); }}>Eliminar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  alertCard: { margin: 12, borderRadius: 10, borderWidth: 1 },
  alertContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  alertText: { fontWeight: '600', fontSize: 13 },
  listContent: { padding: 12, paddingBottom: 80 },
  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { marginTop: 12, fontSize: 16, fontWeight: '600' },
  emptySubtitle: { marginTop: 4, fontSize: 13 },
  emptyText: { textAlign: 'center', marginTop: 40 },
  itemCard: { marginBottom: 8, borderRadius: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center' },
  itemIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  itemInfo: { flex: 1, marginLeft: 10 },
  itemName: { fontWeight: '700' },
  itemCategory: { fontSize: 12, marginTop: 2 },
  stockSection: { alignItems: 'flex-end', minWidth: 70 },
  stockNumber: { fontSize: 16, fontWeight: '800' },
  stockUnit: { fontSize: 11, fontWeight: '400' },
  stockBar: { width: 60, height: 4, borderRadius: 2, marginTop: 4 },
  stockFill: { height: 4, borderRadius: 2 },
  minStock: { fontSize: 10, marginTop: 2 },
  itemActions: { flexDirection: 'row' },
  fab: { position: 'absolute', right: 16, bottom: 16, borderRadius: 16 },
  modal: { padding: 24, margin: 20, borderRadius: 12, maxHeight: '85%' },
  modalTitle: { fontWeight: '700', marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  input: { marginBottom: 12 },
  row: { flexDirection: 'row', gap: 8 },
  rowField: { flex: 1 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 },
});
