import { FilterMatchMode } from 'primereact/api';
import { createEntityTableHook } from './useEntityTable';
import { UsersService } from '../services/UsersService';

const usersEntityService = {
  getAll: UsersService.getAll,
  create: UsersService.create,
  update: UsersService.update,
  delete: UsersService.delete,
};

const useBaseUsers = createEntityTableHook({
  service: usersEntityService,
  entityName: 'user',
  defaultFilters: {
    nom: { value: null, matchMode: FilterMatchMode.CONTAINS },
  },
});

export function useUsers() {
  return useBaseUsers();
}
