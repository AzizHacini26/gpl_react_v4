import { useMemo, useRef, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Divider } from 'primereact/divider';
import { useTranslation } from 'react-i18next';
import { useDebts } from '../hooks/useDebts';
import { useClients } from '../hooks/useClients';
import { hasPermission } from '../services/authApi';
import { formatDZD } from '../utils/currency';
import { parseDateValue, dateFormatFR } from '../utils/helpers';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import StatePanel from '../components/ui/StatePanel';

const STATUS_OPTIONS = [
  { label: 'دين', value: 'دين' },
  { label: 'تسديد', value: 'تسديد' },
];

export default function Debts() {
  const { t } = useTranslation();
  const toast = useRef(null);
  const canEdit = hasPermission('UPDATE_DEBT');
  const canDelete = hasPermission('DELETE_DEBT');
  const canCreate = hasPermission('ADD_DEBT');

  const hook = useDebts();
  const clientHook = useClients();
  const {
    items, loading, saving, error, globalFilterValue,
    showDialog, editingItem, formData,
    loadItems, deleteItem, createItem, updateItem,
    openCreateDialog, openEditDialog, closeDialog, updateFormData,
    onGlobalFilterChange, clearFilters, footer,
  } = hook;

  const clientOptions = useMemo(() => clientHook.items.map((client) => ({
    label: client.name,
    value: client.id,
    phone: client.phone,
  })), [clientHook.items]);

  const summary = useMemo(() => {
    const totalDebt = items
      .filter((d) => d.status === 'دين')
      .reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
    const totalPaid = items
      .filter((d) => d.status === 'تسديد')
      .reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
    return { totalDebt, totalPaid, balance: totalPaid - totalDebt, count: items.length };
  }, [items]);

  const showToast = useCallback((severity, summary, detail) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  }, []);

  const handleDelete = useCallback((item) => {
    confirmDialog({
      message: t('debts.confirmDeleteMessage', { name: item.clientName }),
      header: t('debts.confirmDelete'),
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        const result = await deleteItem(item.id);
        if (result.ok) {
          showToast('success', t('debts.deleted'), t('debts.deletedSuccess'));
        } else {
          showToast('error', t('debts.deleteFailed'), result.error || t('debts.saveFailed'));
        }
      },
    });
  }, [deleteItem, showToast, t]);

  const handleSave = useCallback(async () => {
    let result;
    if (editingItem) {
      result = await updateItem(editingItem.id, formData);
    } else {
      result = await createItem(formData);
    }
    if (result.ok) {
      showToast(
        'success',
        editingItem ? t('debts.updated') : t('debts.created'),
        editingItem ? t('debts.updatedSuccess') : t('debts.createdSuccess'),
      );
      closeDialog();
    } else {
      showToast('error', t('debts.saveFailed'), result.error || t('debts.saveFailed'));
    }
  }, [closeDialog, createItem, editingItem, formData, showToast, updateItem, t]);

  const actionsTemplate = useCallback((rowData) => (
    <div className="entity-table-actions">
      {canEdit && <Button icon="pi pi-pencil" onClick={() => openEditDialog(rowData)} text rounded tooltip={t('debts.editTooltip')} />}
      {canDelete && <Button icon="pi pi-trash" severity="danger" onClick={() => handleDelete(rowData)} text rounded tooltip={t('debts.deleteTooltip')} />}
    </div>
  ), [canEdit, canDelete, handleDelete, openEditDialog, t]);

  const statusBodyTemplate = useCallback((rowData) => (
    <span className={`debt-badge ${rowData.status === 'دين' ? 'debt-badge--pending' : 'debt-badge--paid'}`}>
      <i className={`pi ${rowData.status === 'دين' ? 'pi-exclamation-triangle' : 'pi-check-circle'}`} />
      {rowData.status}
    </span>
  ), []);

  const amountBodyTemplate = useCallback((rowData) => (
    <span className="debt-amount">{formatDZD(rowData.amount)}</span>
  ), []);

  const dateBodyTemplate = useCallback((rowData) => {
    if (!rowData.dateInsert) return <span className="debt-date-empty">-</span>;
    const d = parseDateValue(rowData.dateInsert);
    if (!d) return <span>{rowData.dateInsert}</span>;
    return <span className="debt-date">{dateFormatFR(rowData.dateInsert)}</span>;
  }, []);

  if (error) {
    return (
      <div className="page-container">
        <StatePanel
          variant="error"
          title={t('debts.loadError')}
          message={error}
          icon="pi pi-exclamation-triangle"
          onRetry={loadItems}
          retryLabel={t('common.retry')}
        />
      </div>
    );
  }

  const debtCount = items.filter((d) => d.status === 'دين').length;
  const paidCount = items.filter((d) => d.status === 'تسديد').length;

  return (
    <div className="page-container">
      <Toast ref={toast} position="top-right" />
      <ConfirmDialog />

      <PageHeader
        title={t('debts.title')}
        subtitle={t('debts.subtitle')}
        actions={(
          <Button icon="pi pi-refresh" onClick={loadItems} outlined />
        )}
      />

      <div className="stats-grid debts-summary">
        <StatCard
          label={t('debts.totalDebt')}
          value={formatDZD(summary.totalDebt)}
          meta={`${debtCount} ${t('debts.status')}`}
          icon="pi pi-exclamation-circle"
          variant="danger"
        />
        <StatCard
          label={t('debts.totalPaid')}
          value={formatDZD(summary.totalPaid)}
          meta={`${paidCount} ${t('debts.totalPaid')}`}
          icon="pi pi-check-circle"
          variant="success"
        />
        <StatCard
          label={t('debts.balance')}
          value={formatDZD(summary.balance)}
          meta={summary.balance >= 0 ? t('debts.positiveBalance') : t('debts.negativeBalance')}
          icon="pi pi-wallet"
          variant={summary.balance >= 0 ? 'info' : 'danger'}
        />
        <StatCard
          label={t('debts.totalCount')}
          value={summary.count}
          meta={t('debts.allOperations')}
          icon="pi pi-calculator"
          variant="info"
        />
      </div>

      <Card className="entity-card">
        <Toolbar
          left={() => (
            <div className="entity-toolbar-group">
              <Button severity="secondary" icon="pi pi-refresh" outlined onClick={loadItems} />
              {canCreate && (
                <Button severity="success" icon="pi pi-plus" label={t('debts.add')} onClick={openCreateDialog} />
              )}
            </div>
          )}
          right={() => (
            <div className="entity-toolbar-group entity-toolbar-group-right">
              <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder={t('debts.search')} />
              </IconField>
              <Button severity="contrast" icon="pi pi-filter-slash" outlined onClick={clearFilters} tooltip={t('common.retry')} />
            </div>
          )}
          className="mb-3"
        />

        <DataTable
          className="entity-data-table"
          paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]}
          value={items} loading={loading} dataKey="id"
          globalFilterFields={['clientName', 'phone', 'amount', 'status']}
          sortField="id" sortOrder={-1} showGridlines removableSort
          footer={footer}
          emptyMessage={t('debts.empty')}
          scrollable scrollHeight="calc(100vh - 35rem)" size="small"
        >
          <Column field="clientName" header={t('debts.client')} sortable style={{ minWidth: '12rem' }} />
          <Column field="phone" header={t('debts.phone')} sortable style={{ width: '10rem' }} />
          <Column field="amount" header={t('debts.amount')} sortable body={amountBodyTemplate} style={{ width: '10rem' }} />
          <Column field="status" header={t('debts.status')} sortable body={statusBodyTemplate} style={{ width: '8rem' }} />
          <Column field="dateInsert" header={t('debts.date')} sortable body={dateBodyTemplate} style={{ width: '10rem' }} />
          <Column header={t('debts.actions')} body={actionsTemplate} style={{ width: '8rem' }} />
        </DataTable>
      </Card>

      <Dialog
        header={editingItem ? t('debts.headerEdit') : t('debts.headerCreate')}
        visible={showDialog}
        style={{ width: '35rem', maxWidth: 'calc(100vw - 1rem)' }}
        modal
        onHide={closeDialog}
      >
        <div className="debt-dialog-form">
          <div className="field">
            <label htmlFor="clientSelect">{t('debts.client')} <span className="text-red-500">*</span></label>
            <Dropdown
              id="clientSelect"
              value={formData.clientId || null}
              options={clientOptions}
              onChange={(e) => {
                updateFormData('clientId', e.value);
                const selected = clientOptions.find((o) => o.value === e.value);
                if (selected) updateFormData('phone', selected.phone || '');
              }}
              placeholder={t('debts.clientPlaceholder')}
              showClear
            />
          </div>

          <div className="debt-dialog-row">
            <div className="field">
              <label htmlFor="phoneInput">{t('debts.phone')} <span className="text-red-500">*</span></label>
              <InputText
                id="phoneInput"
                value={formData.phone || ''}
                onChange={(e) => updateFormData('phone', e.target.value)}
                placeholder={t('debts.phonePlaceholder')}
                inputMode="tel"
              />
            </div>
            <div className="field">
              <label htmlFor="amountInput">{t('debts.amount')} <span className="text-red-500">*</span></label>
              <InputText
                id="amountInput"
                value={formData.amount || ''}
                onChange={(e) => updateFormData('amount', e.target.value)}
                placeholder={t('debts.amountPlaceholder')}
                inputMode="numeric"
              />
            </div>
          </div>

          <div className="debt-dialog-row">
            <div className="field">
              <label htmlFor="statusSelect">{t('debts.status')} <span className="text-red-500">*</span></label>
              <Dropdown
                id="statusSelect"
                value={formData.status || null}
                options={STATUS_OPTIONS}
                onChange={(e) => updateFormData('status', e.value)}
                placeholder={t('debts.statusPlaceholder')}
              />
            </div>
            <div className="field">
              <label htmlFor="dateCalendar">{t('debts.date')}</label>
              <Calendar
                id="dateCalendar"
                value={formData.dateInsert ? parseDateValue(formData.dateInsert) : null}
                onChange={(e) => updateFormData('dateInsert', e.value ? e.value.toISOString().split('T')[0] : '')}
                dateFormat="dd/mm/yy"
                showIcon
                placeholder={t('debts.datePlaceholder')}
              />
            </div>
          </div>

          <Divider />

          <div className="debt-dialog-actions">
            <Button label={t('debts.cancel')} icon="pi pi-times" outlined onClick={closeDialog} disabled={saving} />
            <Button
              label={saving ? t('debts.saving') : editingItem ? t('debts.update') : t('debts.save')}
              icon={saving ? 'pi pi-spin pi-spinner' : editingItem ? 'pi pi-check' : 'pi pi-save'}
              onClick={handleSave}
              loading={saving}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
