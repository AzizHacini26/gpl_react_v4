import { useMemo, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { useTranslation } from 'react-i18next';
import { EntityTable } from '../components/EntityTable';
import { useMultiTypes } from '../hooks/useMultiTypes';
import { hasPermission } from '../services/authApi';

const TYPE_OPTIONS = ['STATE', 'DOC', 'MARQUE', 'SIZE','SERVICE','DOMICILE','CARTYPE','BATTELTYPE','DAYS'];

export default function MultiTypes() {
  const { t } = useTranslation();
  const tOrDefault = (key, defaultValue) => t(key, { defaultValue });
  const canEditCompanyInfo = hasPermission('UPDATE_TYPES');
    const canDeleteCompanyInfo = hasPermission('DELETE_TYPES');
    const canCreateCompanyInfo = hasPermission('ADD_TYPES');
  
  const [selectedType, setSelectedType] = useState('MARQUE');

  const useFilteredMultiTypes = () => {
    const hook = useMultiTypes();

    const filteredItems = useMemo(() => {
      if (!selectedType) return hook.items;
      return hook.items.filter((item) => item?.type === selectedType);
    }, [hook.items, selectedType]);

    return {
      ...hook,
      items: filteredItems,
    };
  };

  const columns = [
    { field: 'id', header: tOrDefault('table.id', 'ID'), sortable: true, style: { width: '6rem' } },
    { field: 'nom', header: tOrDefault('table.name', 'Name'), sortable: true, filter: true, filterPlaceholder: tOrDefault('table.searchByName', 'Search by name') },
    { field: 'type', header: tOrDefault('table.type', 'Type'), sortable: true, filter: true, filterPlaceholder: tOrDefault('table.searchByType', 'Search by type') },
  ];

  const dialogFields = [
    {
      name: 'nom',
      label: 'Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., 30 or AMS',
      autoFocus: true,
    },
    {
      name: 'type',
      label: 'Type',
      required: true,
      render: ({ value, onChange }) => (
        <div className="field">
          <label htmlFor="type">
            Type <span className="text-red-500">*</span>
          </label>
          <Dropdown
            id="type"
            value={value || null}
            options={TYPE_OPTIONS}
            onChange={(e) => onChange(e.value)}
            placeholder="Select type"
          />
        </div>
      ),
    },
  ];

  return (
    <EntityTable
      useHook={useFilteredMultiTypes}
      title="Multi Types"
      entityName="multitype"
      columns={columns}
      dialogFields={dialogFields}
      frozenActions
      rightToolbarExtras={(
        <Dropdown //default filter by type STATE
          value={selectedType}
          options={TYPE_OPTIONS}
          onChange={(e) => setSelectedType(e.value)}
          placeholder="Filter by type"
          showClear
          style={{ minWidth: '12rem' }}
        />
      )}
        showEditAction={canEditCompanyInfo}
      showDeleteAction={canDeleteCompanyInfo}
      showCreateAction={canCreateCompanyInfo}
    />
  );
}
 