import { createEntityTableHook } from './useEntityTable';
import { DebtsService } from '../services/DebtsService';

const debtsEntityService = {
  getAll: DebtsService.getAll,
  create: DebtsService.create,
  update: DebtsService.update,
  delete: DebtsService.delete,
};

const useBaseDebts = createEntityTableHook({
  service: debtsEntityService,
  entityName: 'debt',
});

export function useDebts() {
  return useBaseDebts();
}
