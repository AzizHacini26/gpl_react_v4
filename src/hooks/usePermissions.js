import { FilterMatchMode } from 'primereact/api';
import { createEntityTableHook } from './useEntityTable';
import { PermissionService } from '../services/PermissionService';

const permissionEntityService = {
  getAll: PermissionService.getAll,
  create: PermissionService.create,
  update: PermissionService.update,
  delete: PermissionService.delete,
};

const useBasePermissions = createEntityTableHook({
  service: permissionEntityService,
  entityName: 'permission',
  defaultFilters: {
    nom: { value: null, matchMode: FilterMatchMode.CONTAINS },
  },
});

export function usePermissions() {
  return useBasePermissions();
}
