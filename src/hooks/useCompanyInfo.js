import { FilterMatchMode } from 'primereact/api';
import { createEntityTableHook } from './useEntityTable';
 import { CompanyInfoService } from './../services/CompanyInfoService';

const companyInfoEntityService = {
  getAll: CompanyInfoService.getAll,
  create: CompanyInfoService.create,
  update: CompanyInfoService.update,
  delete: CompanyInfoService.delete,
};

const useBaseCompanyInfo = createEntityTableHook({
  service: companyInfoEntityService,
  entityName: 'companyInfo',
  defaultFilters: {
    name: { value: null, matchMode: FilterMatchMode.CONTAINS },
    phone: { value: null, matchMode: FilterMatchMode.CONTAINS },
    tasalaly: { value: null, matchMode: FilterMatchMode.CONTAINS },
    number: { value: null, matchMode: FilterMatchMode.CONTAINS },
    carnumb: { value: null, matchMode: FilterMatchMode.CONTAINS },
    battlenumb: { value: null, matchMode: FilterMatchMode.CONTAINS },
      tiraz: { value: null, matchMode: FilterMatchMode.CONTAINS },
      tproduct: { value: null, matchMode: FilterMatchMode.CONTAINS },
      tverify: { value: null, matchMode: FilterMatchMode.CONTAINS },
      moneyy: { value: null, matchMode: FilterMatchMode.CONTAINS },
     
},
});

export function useCompanyInfo() {
  return useBaseCompanyInfo();
}
