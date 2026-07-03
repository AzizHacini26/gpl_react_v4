import { useMemo, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { EntityTable } from '../components/EntityTable';
import { usePermissions } from '../hooks/usePermissions';
import { useTranslation } from 'react-i18next';

export default function Permissions() {
  const { t } = useTranslation();

  const [bulkInput, setBulkInput] = useState('');
  const [bulkItems, setBulkItems] = useState([]);
  const [bulkError, setBulkError] = useState('');

  const columns = useMemo(() => {
    const td = (key, def) => t(key, { defaultValue: def });
    return [
      { field: 'id', header: td('table.id', 'ID'), sortable: true, style: { width: '6rem' } },
      { field: 'nom', header: td('table.name', 'Name'), sortable: true, filter: true, filterPlaceholder: td('table.searchByName', 'Search by name') },
    ];
  }, [t]);

  const addBulkItem = () => {
    const value = bulkInput.trim();
    if (!value) {
      return;
    }

    const exists = bulkItems.some((item) => item.toLowerCase() === value.toLowerCase());
    if (exists) {
      setBulkError('Permission already in the list.');
      return;
    }

    setBulkItems((prev) => [...prev, value]);
    setBulkInput('');
    setBulkError('');
  };

  const removeBulkItem = (name) => {
    setBulkItems((prev) => prev.filter((item) => item !== name));
  };

  const resetBulkState = () => {
    setBulkInput('');
    setBulkItems([]);
    setBulkError('');
  };

  const renderDialog = ({ visible, onHide, saving, editingItem, formData, onFormChange, onSave, hook }) => {
    const isEditing = !!editingItem;

    const handleCreateMany = async () => {
      const values = bulkItems.length > 0
        ? bulkItems
        : (bulkInput.trim() ? [bulkInput.trim()] : []);

      if (values.length === 0) {
        setBulkError('Add at least one permission.');
        return;
      }

      setBulkError('');
      const failures = [];

      for (const nom of values) {
        const result = await hook.createItem({ nom });
        if (!result.ok) {
          failures.push(`${nom}: ${result.error || 'Failed to create'}`);
        }
      }

      await hook.loadItems();

      if (failures.length > 0) {
        setBulkError(failures.join(' | '));
        return;
      }

      resetBulkState();
      onHide();
    };

    const handleHide = () => {
      resetBulkState();
      onHide();
    };

    return (
      <Dialog
        header={isEditing ? 'Edit Permission' : 'Create New Permissions'}
        visible={visible}
        style={{ width: '45rem' }}
        modal
        onHide={handleHide}
      >
        {isEditing ? (
          <div className="flex flex-column gap-3">
            <div>
              <label htmlFor="permission-name">Name</label>
              <InputText
                id="permission-name"
                value={formData.nom || ''}
                onChange={(e) => onFormChange('nom', e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <Button label="Cancel" icon="pi pi-times" onClick={handleHide} className="p-button-outlined" />
              <Button
                label="Update"
                icon="pi pi-check"
                onClick={onSave}
                disabled={saving}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-column gap-3">
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <InputText
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder="Permission name (ex: CLIENT_READ)"
                style={{ flex: 1 }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addBulkItem();
                  }
                }}
              />
              <Button type="button" label="Add" icon="pi pi-plus" onClick={addBulkItem} />
            </div>

            <div>
              {bulkItems.length === 0 ? (
                <small>No permissions in the list yet.</small>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {bulkItems.map((name) => (
                    <Button
                      key={name}
                      type="button"
                      label={name}
                      icon="pi pi-times"
                      severity="secondary"
                      outlined
                      onClick={() => removeBulkItem(name)}
                    />
                  ))}
                </div>
              )}
            </div>

            {bulkError ? <small className="p-error">{bulkError}</small> : null}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <Button label="Cancel" icon="pi pi-times" onClick={handleHide} className="p-button-outlined" />
              <Button
                label={saving ? 'Creating...' : 'Create'}
                icon="pi pi-check"
                onClick={handleCreateMany}
                disabled={saving}
              />
            </div>
          </div>
        )}
      </Dialog>
    );
  };

  return (
    <EntityTable
      useHook={usePermissions}
      title="Permissions"
      entityName="permission"
      columns={columns}
      renderDialog={renderDialog}
    />
  );
}
