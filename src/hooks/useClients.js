import { FilterMatchMode } from 'primereact/api';
import { createEntityTableHook } from './useEntityTable';
import { ClientService } from '../services/ClientService';

const clientsEntityService = {
  getAll: ClientService.getAll,
  create: ClientService.create,
  update: ClientService.update,
  delete: ClientService.delete,
};

const useBaseClients = createEntityTableHook({
  service: clientsEntityService,
  entityName: 'client',
  defaultFilters: {
    idcode: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: { value: null, matchMode: FilterMatchMode.CONTAINS },
    phone: { value: null, matchMode: FilterMatchMode.CONTAINS },
    tasalaly: { value: null, matchMode: FilterMatchMode.CONTAINS },
    number: { value: null, matchMode: FilterMatchMode.CONTAINS },
    carnumb: { value: null, matchMode: FilterMatchMode.CONTAINS },
    battlenumb: { value: null, matchMode: FilterMatchMode.CONTAINS },
      tiraz: { value: null, matchMode: FilterMatchMode.CONTAINS },
      tproduct: { value: null, matchMode: FilterMatchMode.CONTAINS },
      tverify: { value: null, matchMode: FilterMatchMode.CONTAINS },
      lastTanjime: { value: null, matchMode: FilterMatchMode.CONTAINS },
      lastTanjime5: { value: null, matchMode: FilterMatchMode.CONTAINS },
      moneyy: { value: null, matchMode: FilterMatchMode.CONTAINS },
    'mcarmarqueT.nom': { value: null, matchMode: FilterMatchMode.CONTAINS },
  'msizeT.nom': { value: null, matchMode: FilterMatchMode.CONTAINS },
  'mdaysT.nom': { value: null, matchMode: FilterMatchMode.CONTAINS },
'mstateT.nom': { value: null, matchMode: FilterMatchMode.CONTAINS} ,
'restDays': { value: null, matchMode: FilterMatchMode.CONTAINS },
'dateend': { value: null, matchMode: FilterMatchMode.CONTAINS },
'datestart': { value: null, matchMode: FilterMatchMode.CONTAINS },
},
});

export function useClients() {
  return useBaseClients();
}
