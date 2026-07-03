import { useCallback, useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useTranslation } from 'react-i18next';
import PageHeader from '../components/ui/PageHeader';
import StatePanel from '../components/ui/StatePanel';
import { AuditService } from '../services/AuditService';

function formatChangedAt(value) {
  if (!value) return '-';
  const d = new Date(value);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

const ACTION_STYLES = {
  CREATE: { background: '#e8f5e9', color: '#2e7d32', label: 'CREATE' },
  UPDATE: { background: '#e3f2fd', color: '#1565c0', label: 'UPDATE' },
  DELETE: { background: '#fbe9e7', color: '#c62828', label: 'DELETE' },
};

function actionBodyTemplate(rowData) {
  const style = ACTION_STYLES[rowData.action] || { background: '#f5f5f5', color: '#616161', label: rowData.action };
  return (
    <span
      style={{
        background: style.background,
        color: style.color,
        padding: '3px 10px',
        borderRadius: 'var(--radius-full)',
        fontWeight: 700,
        fontSize: '0.78rem',
        display: 'inline-block',
      }}
    >
      {style.label}
    </span>
  );
}

function entityTypeBodyTemplate(rowData) {
  return (
    <span style={{ textTransform: 'capitalize' }}>
      {rowData.entityType?.replace('_', ' ') || '-'}
    </span>
  );
}

function descriptionBodyTemplate(rowData) {
  return (
    <span style={{ fontSize: '0.85rem' }}>
      {rowData.description || '-'}
    </span>
  );
}

export default function AuditLog() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await AuditService.getMyLogs();
      setLogs(data);
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  if (loading) {
    return (
      <div className="page-container">
        <PageHeader title="Audit Logs" />
        <StatePanel variant="loading" title={t('common.loading')} message={t('common.loadingData')} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <PageHeader title="Audit Logs" />
        <StatePanel variant="error" title={t('common.error')} message={error} icon="pi pi-exclamation-triangle" onRetry={loadLogs} retryLabel={t('common.retry')} />
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader title="Audit Logs" subtitle={t('auditLog.subtitle')} />

      {logs.length === 0 ? (
        <StatePanel variant="empty" title={t('auditLog.emptyTitle')} message={t('auditLog.emptyMessage')} icon="pi pi-history" />
      ) : (
        <DataTable
          value={logs}
          paginator
          rows={20}
          rowsPerPageOptions={[10, 20, 50]}
          sortField="changedAt"
          sortOrder={-1}
          emptyMessage={t('entityTable.emptyGeneric', { entity: '' })}
          size="small"
          stripedRows
          showGridlines
          className="p-datatable-sm"
        >
          <Column field="changedAt" header={t('auditLog.date')} body={(r) => formatChangedAt(r.changedAt)} sortable style={{ width: '150px', fontSize: '0.8rem' }} />
          <Column field="action" header={t('auditLog.action')} body={actionBodyTemplate} sortable style={{ width: '100px' }} />
          <Column field="entityType" header={t('auditLog.entityType')} body={entityTypeBodyTemplate} sortable style={{ width: '130px', fontSize: '0.85rem' }} />
          <Column field="entityId" header={t('auditLog.entityId')} sortable style={{ width: '90px', textAlign: 'center', fontSize: '0.85rem' }} />
          <Column field="description" header={t('auditLog.description')} body={descriptionBodyTemplate} style={{ minWidth: '250px' }} />
        </DataTable>
      )}
    </div>
  );
}
