import { useCallback, useEffect, useMemo, useState } from 'react';
import { FilterMatchMode } from 'primereact/api';
import { createEntityTableHook } from './useEntityTable';
import { RoleService } from '../services/RoleService';
import { PermissionService } from '../services/PermissionService';

const roleEntityService = {
  getAll: RoleService.getAll,
  create: RoleService.create,
  update: RoleService.update,
  delete: RoleService.delete,
};

const useBaseRoles = createEntityTableHook({
  service: roleEntityService,
  entityName: 'role',
  defaultFilters: {
    nom: { value: null, matchMode: FilterMatchMode.CONTAINS },
    permissionsText: { value: null, matchMode: FilterMatchMode.CONTAINS },
  },
});

const toPermissionIds = (permissions) => (
  Array.isArray(permissions) ? permissions.map((permission) => permission.id) : []
);

const toRolePayload = (data) => ({
  nom: data?.nom ?? '',
  permissions: Array.isArray(data?.permissionIds)
    ? data.permissionIds.map((id) => ({ id }))
    : [],
});

export function useRoles() {
  const base = useBaseRoles();
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    let mounted = true;
    PermissionService.getAll()
      .then((data) => {
        if (mounted) {
          setPermissions(data);
        }
      })
      .catch((error) => {
        console.error('Error loading permissions:', error);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const items = useMemo(
    () => base.items.map((role) => ({
      ...role,
      permissionsText: Array.isArray(role.permissions)
        ? role.permissions.map((permission) => permission.nom).join(', ')
        : '',
    })),
    [base.items],
  );

  const openCreateDialog = useCallback(() => {
    base.openCreateDialog();
    base.setFormData({ nom: '', permissionIds: [] });
  }, [base]);

  const openEditDialog = useCallback((item) => {
    base.openEditDialog(item);
    base.setFormData({
      ...item,
      permissionIds: toPermissionIds(item.permissions),
    });
  }, [base]);

  const createItem = useCallback(
    (data) => base.createItem(toRolePayload(data)),
    [base],
  );

  const updateItem = useCallback(
    (id, data) => base.updateItem(id, toRolePayload(data)),
    [base],
  );

  return {
    ...base,
    items,
    permissions,
    openCreateDialog,
    openEditDialog,
    createItem,
    updateItem,
  };
}
