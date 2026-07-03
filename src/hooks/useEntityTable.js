// hooks/useEntityTable.js
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FilterMatchMode } from 'primereact/api';

export function createEntityTableHook({ 
  service,              // The API service object
  entityName,           // 'permission', 'role', etc.
  defaultFilters = {}   // Optional custom filters
}) {
  const DEFAULT_FILTERS = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    ...defaultFilters
  };

  const createDefaultFilters = () => ({
    global: { ...DEFAULT_FILTERS.global },
    ...Object.keys(defaultFilters).reduce((acc, key) => ({
      ...acc,
      [key]: { ...defaultFilters[key] }
    }), {})
  });

  return function useEntityTable({ 
    initialState = {
      showDialog: false,
      editingItem: null
    }
  } = {}) {
    // Data state
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Filter state
    const [filters, setFilters] = useState(createDefaultFilters);
    const [globalFilterValue, setGlobalFilterValue] = useState('');

    // Form state
    const [showDialog, setShowDialog] = useState(initialState.showDialog);
    const [editingItem, setEditingItem] = useState(initialState.editingItem);
    const [formData, setFormData] = useState({});

    // Load data
    const loadItems = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await service.getAll();
        setItems(data);
      } catch (err) {
        setError(err.message);
        console.error(`Error loading ${entityName}s:`, err);
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(() => {
      loadItems();
    }, [loadItems]);

    // CRUD operations
    const createItem = useCallback(async (data) => {
      setSaving(true);
      try {
        const created = await service.create(data);
        setItems(prev => [...prev, created]);
        return { ok: true, data: created };
      } catch (err) {
        return { ok: false, error: err.message };
      } finally {
        setSaving(false);
      }
    }, []);

    const updateItem = useCallback(async (id, data) => {
      setSaving(true);
      try {
        const updated = await service.update(id, data);
        setItems(prev => prev.map(item => item.id === id ? updated : item));
        return { ok: true, data: updated };
      } catch (err) {
        return { ok: false, error: err.message };
      } finally {
        setSaving(false);
      }
    }, []);

    const deleteItem = useCallback(async (id) => {
      try {
        await service.delete(id);
        setItems(prev => prev.filter(item => item.id !== id));
        return { ok: true };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    }, []);

    // Form handlers
    const openCreateDialog = useCallback(() => {
      setEditingItem(null);
      setFormData({});
      setShowDialog(true);
    }, []);

    const openEditDialog = useCallback((item) => {
      setEditingItem(item);
      setFormData(item);
      setShowDialog(true);
    }, []);

    const closeDialog = useCallback(() => {
      setShowDialog(false);
      setEditingItem(null);
      setFormData({});
    }, []);

    const updateFormData = useCallback((field, value) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    // Filter handlers
    const onGlobalFilterChange = useCallback((e) => {
      const value = e.target.value;
      setFilters(prev => ({
        ...prev,
        global: { ...prev.global, value }
      }));
      setGlobalFilterValue(value);
    }, []);

    const clearFilters = useCallback(() => {
      setFilters(createDefaultFilters());
      setGlobalFilterValue('');
    }, []);

    const footer = useMemo(
      () => `Total: ${items.length} ${entityName}${items.length !== 1 ? 's' : ''}`,
      [items]
    );

    return {
      // Data
      items,
      loading,
      saving,
      error,
      
      // Filters
      filters,
      globalFilterValue,
      onGlobalFilterChange,
      clearFilters,
      footer,
      
      // Dialog
      showDialog,
      editingItem,
      formData,
      openCreateDialog,
      openEditDialog,
      closeDialog,
      updateFormData,
      
      // Actions
      loadItems,
      createItem,
      updateItem,
      deleteItem,
      
      // Utilities
      setFormData,
    };
  };
}