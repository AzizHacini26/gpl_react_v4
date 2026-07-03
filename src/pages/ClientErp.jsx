import { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Toolbar } from 'primereact/toolbar';
import { Card } from 'primereact/card';
import { useTranslation } from 'react-i18next';
import PageHeader from '../components/ui/PageHeader';
import StatePanel from '../components/ui/StatePanel';
import { ClientErpService } from '../services/ClientErpService';

export default function ClientErp() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [globalFilter, setGlobalFilter] = useState('');

  const loadItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ClientErpService.getAll();
      setItems(data || []);
    } catch {
      setError('Failed to load ERP clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const formatYearMonth = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value.slice(0, 7);
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return `${value.getFullYear()}/${String(value.getMonth() + 1).padStart(2, '0')}`;
    }
    return '';
  };

  const tproductBodyTemplate = (rowData) => formatYearMonth(rowData.tproduct);

  const onGlobalFilterChange = (e) => {
    setGlobalFilter(e.target.value);
  };

  const leftToolbar = (
    <IconField iconPosition="left">
      <InputIcon className="pi pi-search" />
      <InputText
        value={globalFilter}
        onChange={onGlobalFilterChange}
        placeholder={t('entityTable.searchGeneric', { entity: 'ERP' })}
      />
    </IconField>
  );

  return (
    <>
      <PageHeader title={t('clientErp.title')} subtitle={t('clientErp.subtitle')} />
      <Card>
        <Toolbar left={leftToolbar} />
        {loading ? (
          <StatePanel
            variant="loading"
            title={t('common.loading')}
            message={t('common.loadingData')}
          />
        ) : error ? (
          <StatePanel
            variant="error"
            title={t('common.error')}
            message={error}
            icon="pi pi-exclamation-triangle"
            onRetry={loadItems}
            retryLabel={t('common.retry')}
          />
        ) : (
          <DataTable
            value={items}
            loading={loading}
            globalFilter={globalFilter}
            paginator
            rows={25}
            rowsPerPageOptions={[10, 25, 50]}
            emptyMessage={t('entityTable.emptyGeneric', { entity: 'ERP' })}
            sortMode="multiple"
            stripedRows
            size="small"
          >
            <Column field="name" header={t('client.name')} sortable filter />
            <Column field="phone" header={t('client.phone')} sortable filter />
            <Column field="carnumb" header={t('clientErp.carnumb')} sortable filter />
            <Column field="battlenumb" header={t('client.battlenumb')} sortable filter />
            <Column field="tiraz" header={t('clientErp.tiraz')} sortable filter />
            <Column field="tasalaly" header={t('clientErp.tasalaly')} sortable filter />
            <Column field="tproduct" header={t('client.tproduct')} body={tproductBodyTemplate} sortable filter />
            <Column field="mcarmarqueT.nom" header={t('client.marque')} sortable filter />
            <Column field="mbatteltypeT.nom" header="Battel Type" sortable filter />
            <Column field="msizeT.nom" header="Size" sortable filter />
            <Column field="mcartypeT.nom" header="Car Type" sortable filter />
            <Column field="mdomicileT.nom" header="Domicile" sortable filter />
            <Column field="mdocT.nom" header="Doc Type" sortable filter />
          </DataTable>
        )}
      </Card>
    </>
  );
}
