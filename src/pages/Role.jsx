import { useCallback } from 'react';
import { Chip } from 'primereact/chip';
import { useTranslation } from 'react-i18next';
import { Badge } from 'primereact/badge';
import { Tag } from 'primereact/tag';
import { EntityTable } from '../components/EntityTable';
import { useRoles } from '../hooks/useRoles';

function Roles() {
  const { t } = useTranslation();
  const tOrDefault = (key, defaultValue) => t(key, { defaultValue });
  const permissionBodyTemplate = useCallback((rowData) => {
    if (!Array.isArray(rowData.permissions) || rowData.permissions.length === 0) {
      return <Tag value="No permissions" severity="info" rounded />;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {rowData.permissions.slice(0, 3).map((permission) => (
          <Chip key={permission.id} label={permission.nom} />
        ))}
        {rowData.permissions.length > 3 && (
          <Badge value={`+${rowData.permissions.length - 3}`} severity="info" />
        )}
      </div>
    );
  }, []);

  const columns = [
    {
      field: 'id',
      header: tOrDefault('table.id', 'ID'),
      sortable: true,
      style: { width: '5rem' },
    },
    {
      field: 'nom',
      header: tOrDefault('table.name', 'Name'),
      sortable: true,
      filter: true,
      filterPlaceholder: tOrDefault('table.searchByName', 'Search by name'),
      style: { minWidth: '12rem' },
    },
    {
      field: 'permissionsText',
      filterField: 'permissionsText',
      header: tOrDefault('table.permissions', 'Permissions'),
      body: permissionBodyTemplate,
      filter: true,
      filterPlaceholder: tOrDefault('table.searchByPermission', 'Search by permission'),
      style: { minWidth: '15rem' },
    },
  ];

  const dialogFields = ({ permissions }) => [
    {
      name: 'nom',
      label: 'Role Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., ADMIN, MANAGER, USER',
      autoFocus: true,
    },
    {
      name: 'permissionIds',
      label: 'Permissions',
      type: 'multiselect',
      placeholder: 'Select permissions...',
      options: permissions,
      optionLabel: 'nom',
      optionValue: 'id',
      maxSelectedLabels: 5,
      helpText: 'Select one or more permissions for this role.',
    },
  ];

  return (
    <EntityTable
      useHook={useRoles}
      title="Roles"
      entityName="role"
      columns={columns}
      dialogFields={dialogFields}
      globalFilterFields={['nom', 'permissionsText']}
    />
  );
}

export default Roles;
