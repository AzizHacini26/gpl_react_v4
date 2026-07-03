import { EntityTable } from '../components/EntityTable';
import { hasPermission } from '../services/authApi';
import { useTranslation } from 'react-i18next';
import { useCompanyInfo } from './../hooks/useCompanyInfo';
 
export default function CompanyInfo() {
  const { t } = useTranslation();
  const tOrDefault = (key, defaultValue) => t(key, { defaultValue });
  const canEditCompanyInfo = hasPermission('UPDATE_COMPANYINFO');
  const canDeleteCompanyInfo = hasPermission('DELETE_COMPANYINFO');
  const canCreateCompanyInfo = hasPermission('ADD_COMPANYINFO');

  const columns = [
    { field: 'id', header: tOrDefault('table.id', 'ID'), sortable: true, style: { width: '6rem' } },
    { field: 'companyName', header: tOrDefault('table.companyName', 'Name'), sortable: true, filter: true, filterPlaceholder: tOrDefault('table.searchByName', 'Search by name') },
    { field: 'adminName', header: tOrDefault('table.adminName', 'Admin Name'), sortable: true, filter: true, filterPlaceholder: tOrDefault('table.searchByAdminName', 'Search by admin name') },
    { field: 'agrement', header: tOrDefault('table.agreement', 'Agrement'), sortable: true, filter: true, filterPlaceholder: tOrDefault('table.searchByAgreement', 'Search by agreement') },
    { field: 'adresse', header: tOrDefault('table.address', 'Adresse'), sortable: true, filter: true, filterPlaceholder: tOrDefault('table.searchByAddress', 'Search by address') },
    { field: 'wilaya', header: tOrDefault('table.wilaya', 'Wilaya'), sortable: true, filter: true, filterPlaceholder: tOrDefault('table.searchByWilaya', 'Search by wilaya') },
    { field: 'subwilaya', header: tOrDefault('table.subWilaya', 'Sub Wilaya'), sortable: true, filter: true, filterPlaceholder: tOrDefault('table.searchBySubWilaya', 'Search by sub wilaya') },
    { field: 'wilayaArabic', header: tOrDefault('table.wilayaArabic', 'Wilaya Arabic'), sortable: true, filter: true, filterPlaceholder: tOrDefault('table.searchByArabicWilaya', 'Search by Arabic wilaya') },
    { field: 'phone1', header: tOrDefault('table.phone1', 'Phone 1'), sortable: true, filter: true, filterPlaceholder: tOrDefault('table.searchByPhone1', 'Search by phone 1') },
    { field: 'phone2', header: tOrDefault('table.phone2', 'Phone 2'), sortable: true, filter: true, filterPlaceholder: tOrDefault('table.searchByPhone2', 'Search by phone 2') },
    { field: 'email', header: tOrDefault('table.email', 'Email'), sortable: true, filter: true, filterPlaceholder: tOrDefault('table.searchByEmail', 'Search by email') },
    { field: 'phonesEmail', header: tOrDefault('table.phonesEmail', 'Phones / Email'), sortable: true, filter: true, filterPlaceholder: tOrDefault('table.searchByPhonesEmail', 'Search by phones/email') },
    { field: 'cardAgriment', header: tOrDefault('table.cardAgreement', 'Card Agriment'), sortable: true, filter: true, filterPlaceholder: tOrDefault('table.searchByCardAgreement', 'Search by card agriment') },
    { field: 'cardAnnee', header: tOrDefault('table.cardYear', 'Card Annee'), sortable: true, filter: true, filterPlaceholder: tOrDefault('table.searchByCardYear', 'Search by card annee') },
    { field: 'logoContentType', header: tOrDefault('table.logoContentType', 'Type'), sortable: true, filter: true, filterPlaceholder: tOrDefault('table.searchByType', 'Search by type') },
  ];

  const dialogFields = [
    {
      name: 'companyName',
      label: 'Company Name',
      type: 'text',
      required: true,
      placeholder: ' ',
      autoFocus: true,
    },
    {
      name: 'adminName',
      label: 'Admin Name',
      type: 'text',
      required: true,
      placeholder: ' ',
    },
    {
      name: 'agrement',
      label: 'Agrement',
      type: 'text',
      required: true,
      placeholder: ' ',
    },
    {
      name: 'adresse',
      label: 'Adresse',
      type: 'text',
      required: true,
      placeholder: ' ',
    },
    {
      name: 'wilaya',
      label: 'Wilaya',
      type: 'text',
      placeholder: ' ',
    },
    {
      name: 'subwilaya',
      label: 'Sub Wilaya',
      type: 'text',
      placeholder: ' ',
    },
    {
      name: 'wilayaArabic',
      label: 'Wilaya Arabic',
      type: 'text',
      placeholder: ' ',
    },
    {
      name: 'phone1',
      label: 'Phone 1',
      type: 'text',
      required: true,
      placeholder: ' ',
    },
    {
      name: 'phone2',
      label: 'Phone 2',
      type: 'text',
      required: true,
      placeholder: ' ',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'text',
      required: true,
      placeholder: ' ',
    },
    {
      name: 'phonesEmail',
      label: 'Phones / Email',
      type: 'text',
      placeholder: ' ',
    },
    {
      name: 'cardAgriment',
      label: 'Card Agriment',
      type: 'text',
      placeholder: ' ',
    },
    {
      name: 'cardAnnee',
      label: 'Card Annee',
      type: 'text',
      placeholder: ' ',
    },
    {
      name: 'logoContentType',
      label: 'Logo Content Type',
      type: 'text',
      placeholder: ' ',
    },
  ];

  return (
    <EntityTable
      useHook={useCompanyInfo}
      title="Company Info"
      entityName="companyInfo"
      columns={columns}
      dialogFields={dialogFields}
      showEditAction={canEditCompanyInfo}
      showDeleteAction={canDeleteCompanyInfo}
      showCreateAction={canCreateCompanyInfo}
    />
  );
}
