import { FilterMatchMode } from 'primereact/api';
import { createEntityTableHook } from './useEntityTable';
import { MultiTypesService } from '../services/MultiTypesService';

const multiTypesEntityService = {
  getAll: MultiTypesService.getAll,
  create: MultiTypesService.create,
  update: MultiTypesService.update,
  delete: MultiTypesService.delete,
};

const useBaseMultiTypes = createEntityTableHook({
  service: multiTypesEntityService,
  entityName: 'multitype',
  defaultFilters: {
    nom: { value: null, matchMode: FilterMatchMode.CONTAINS },
    type: { value: null, matchMode: FilterMatchMode.CONTAINS },
  },
});

export function useMultiTypes() {
  return useBaseMultiTypes();
}
