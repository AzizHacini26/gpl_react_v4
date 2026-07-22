import { useState, useMemo, useRef, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Divider } from 'primereact/divider';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { useTranslation } from 'react-i18next';
import { useDebts } from '../hooks/useDebts';
import { useClients } from '../hooks/useClients';
import { ClientService } from '../services/ClientService';
import { hasPermission } from '../services/authApi';
import { formatDZD, parseAmount } from '../utils/currency';
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
  const canDelete = hasPermission('DELETE_DEBT');
  const canCreate = hasPermission('ADD_DEBT');

  const debtsHook = useDebts();
  const clientHook = useClients();

  const {
    items: allDebts,
    loading: debtsLoading,
    error: debtsError,
    loadItems: loadDebts,
    deleteItem,
    createItem,
  } = debtsHook;

  const { items: allClients, loading: clientsLoading } = clientHook;

  const [selectedClient, setSelectedClient] = useState(null);
  const [showQuickAddDialog, setShowQuickAddDialog] = useState(false);
  const [quickAddMode, setQuickAddMode] = useState('debt');
  const [quickAddForm, setQuickAddForm] = useState({ clientId: null, amount: '', purpose: '' });
  const [quickAddClient, setQuickAddClient] = useState(null);
  const [clientSearch, setClientSearch] = useState('');

  const clientDebtSummary = useMemo(() => {
    const map = {};
    for (const debt of allDebts) {
      const cid = debt.clientId;
      if (!map[cid]) {
        map[cid] = { clientId: cid, clientName: debt.clientName || '', phone: debt.phone || '', totalDebt: 0, totalPaid: 0, operations: 0 };
      }
      const amt = parseAmount(debt.amount);
      map[cid].operations++;
      if (debt.status === 'دين') map[cid].totalDebt += amt;
      else if (debt.status === 'تسديد') map[cid].totalPaid += amt;
    }
    return Object.values(map);
  }, [allDebts]);

  const filteredClientList = useMemo(() => {
    const q = clientSearch.trim().toLowerCase();
    let list = clientDebtSummary;
    if (q) {
      list = list.filter((c) =>
        c.clientName.toLowerCase().includes(q) ||
        c.phone.includes(q)
      );
    }
    return list.sort((a, b) => (b.totalDebt - b.totalPaid) - (a.totalDebt - a.totalPaid));
  }, [clientDebtSummary, clientSearch]);

  const selectedClientDebts = useMemo(() => {
    if (!selectedClient) return [];
    return allDebts
      .filter((d) => d.clientId === selectedClient.clientId)
      .sort((a, b) => {
        const da = parseDateValue(a.dateInsert);
        const db = parseDateValue(b.dateInsert);
        if (da && db) return db.getTime() - da.getTime();
        if (da) return -1;
        if (db) return 1;
        return 0;
      });
  }, [allDebts, selectedClient]);

  const stats = useMemo(() => {
    let totalDebt = 0;
    let totalPaid = 0;
    for (const d of allDebts) {
      const amt = parseAmount(d.amount);
      if (d.status === 'دين') totalDebt += amt;
      else if (d.status === 'تسديد') totalPaid += amt;
    }
    const indebtedClients = clientDebtSummary.filter((c) => c.totalDebt > c.totalPaid).length;
    return { totalDebt, totalPaid, indebtedClients };
  }, [allDebts, clientDebtSummary]);

  const clientDropdownOptions = useMemo(() =>
    allClients.map((c) => ({ label: `${c.name} - ${c.phone}`, value: c.id, phone: c.phone, name: c.name })),
    [allClients]
  );

  const showToast = useCallback((severity, summary, detail) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  }, []);

  const handleDeleteDebt = useCallback((debt) => {
    confirmDialog({
      message: t('debts.confirmDeleteMessage', { name: debt.clientName }),
      header: t('debts.confirmDelete'),
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        const result = await deleteItem(debt.id);
        if (result.ok) {
          await Promise.all([loadDebts(), clientHook.loadItems()]);
          showToast('success', t('debts.deleted'), t('debts.deletedSuccess'));
        } else {
          showToast('error', t('debts.deleteFailed'), result.error || t('debts.saveFailed'));
        }
      },
    });
  }, [deleteItem, showToast, t]);

  const handleQuickAdd = useCallback(async () => {
    const { clientId, amount, purpose } = quickAddForm;
    const effectiveClientId = clientId || quickAddClient?.clientId;
    if (!effectiveClientId || !amount) {
      showToast('warn', t('common.error'), t('debts.amountPlaceholder'));
      return;
    }
    const client = allClients.find((c) => c.id === effectiveClientId) || quickAddClient;
    const numAmount = parseFloat(parseAmount(amount));
    if (quickAddMode === 'payment' && effectiveClientId) {
      const summary = clientDebtSummary.find((c) => c.clientId === effectiveClientId);
      const balance = summary ? summary.totalDebt - summary.totalPaid : 0;
      if (numAmount > balance) {
        showToast('warn', t('common.error'), t('debts.paymentExceedsBalance'));
        return;
      }
    }
    const payload = {
      clientId: effectiveClientId,
      clientName: client?.clientName || client?.name || '',
      phone: client?.phone || '',
      amount,
      status: quickAddMode === 'debt' ? 'دين' : 'تسديد',
      dateInsert: new Date().toISOString().split('T')[0],
      prod: purpose || '',
    };
    const result = await createItem(payload);
    if (result.ok) {
      await Promise.all([loadDebts(), clientHook.loadItems()]);
      showToast('success', t('debts.created'), t('debts.createdSuccess'));
      setShowQuickAddDialog(false);
      setQuickAddForm({ clientId: null, amount: '', purpose: '' });
      setQuickAddClient(null);
    } else {
      showToast('error', t('debts.saveFailed'), result.error || t('debts.saveFailed'));
    }
  }, [quickAddForm, quickAddMode, quickAddClient, createItem, allClients, showToast, t, clientDebtSummary]);

  const openQuickAdd = useCallback((mode, client = null) => {
    setQuickAddMode(mode);
    setQuickAddClient(client);
    setQuickAddForm({ clientId: null, amount: '', purpose: '' });
    setShowQuickAddDialog(true);
  }, []);

  if (debtsError) {
    return (
      <div className="page-container">
        <StatePanel variant="error" title={t('debts.loadError')} message={debtsError} icon="pi pi-exclamation-triangle" onRetry={loadDebts} retryLabel={t('common.retry')} />
      </div>
    );
  }

  const loading = debtsLoading || clientsLoading;

  const clientRowClass = (rowData) => {
    const balance = rowData.totalDebt - rowData.totalPaid;
    if (balance > 0) return 'debt-client-row--positive';
    if (balance < 0) return 'debt-client-row--negative';
    return '';
  };

  const clientAmountTemplate = (rowData) => {
    const balance = rowData.totalDebt - rowData.totalPaid;
    return (
      <div className="debt-client-amounts">
        <span className="debt-client-debt">{formatDZD(rowData.totalDebt)}</span>
        {rowData.totalPaid > 0 && <span className="debt-client-paid">- {formatDZD(rowData.totalPaid)}</span>}
      </div>
    );
  };

  const clientActionsTemplate = (rowData) => (
    <div className="entity-table-actions">
      <Button icon="pi pi-plus-circle" text rounded severity="danger" tooltip={t('debts.add')} onClick={(e) => { e.stopPropagation(); setSelectedClient(rowData); openQuickAdd('debt', rowData); }} />
      <Button icon="pi pi-minus-circle" text rounded severity="success" tooltip={t('debts.totalPaid')} onClick={(e) => { e.stopPropagation(); setSelectedClient(rowData); openQuickAdd('payment', rowData); }} />
    </div>
  );

  const debtStatusTemplate = (rowData) => (
    <span className={`debt-badge ${rowData.status === 'دين' ? 'debt-badge--pending' : 'debt-badge--paid'}`}>
      <i className={`pi ${rowData.status === 'دين' ? 'pi-exclamation-triangle' : 'pi-check-circle'}`} />
      {rowData.status}
    </span>
  );

  const debtAmountTemplate = (rowData) => (
    <span className="debt-amount">{formatDZD(rowData.amount)}</span>
  );

  const debtDateTemplate = (rowData) => {
    if (!rowData.dateInsert) return <span className="debt-date-empty">-</span>;
    const d = parseDateValue(rowData.dateInsert);
    if (!d) return <span>{rowData.dateInsert}</span>;
    return <span className="debt-date">{dateFormatFR(rowData.dateInsert)}</span>;
  };

  const debtActionsTemplate = (rowData) => (
    <div className="entity-table-actions">
      {canDelete && <Button icon="pi pi-trash" severity="danger" text rounded tooltip={t('debts.deleteTooltip')} onClick={() => handleDeleteDebt(rowData)} />}
    </div>
  );

  const selectedBalance = selectedClient ? selectedClient.totalDebt - selectedClient.totalPaid : 0;

  return (
    <div className="page-container">
      <Toast ref={toast} position="top-right" />
      <ConfirmDialog />

      <PageHeader
        title={t('debts.title')}
        subtitle={t('debts.subtitle')}
        actions={<Button icon="pi pi-refresh" onClick={loadDebts} outlined />}
      />

      <div className="stats-grid debts-summary">
        <StatCard label={t('debts.totalDebt')} value={formatDZD(stats.totalDebt)} icon="pi pi-exclamation-circle" variant="danger" />
        <StatCard label={t('debts.totalPaid')} value={formatDZD(stats.totalPaid)} icon="pi pi-check-circle" variant="success" />
        <StatCard label={t('debts.totalCount')} value={stats.indebtedClients} meta={t('debts.allOperations')} icon="pi pi-users" variant="info" />
      </div>

      <div className="debt-layout">
        <Card className="debt-layout__clients">
          <Toolbar
            left={() => (
              <div className="entity-toolbar-group">
                <IconField iconPosition="left">
                  <InputIcon className="pi pi-search" />
                  <InputText value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} placeholder={t('debts.search')} />
                </IconField>
                {canCreate && (
                  <>
                    <Button severity="danger" icon="pi pi-plus" label={t('debts.add')} onClick={() => openQuickAdd('debt')} />
                    <Button severity="success" icon="pi pi-minus" label={t('debts.totalPaid')} onClick={() => openQuickAdd('payment')} />
                  </>
                )}
              </div>
            )}
            className="mb-3"
          />
          <DataTable
            className="entity-data-table"
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            value={filteredClientList}
            loading={loading}
            dataKey="clientId"
            selectionMode="single"
            selection={selectedClient}
            onSelectionChange={(e) => setSelectedClient(e.value)}
            rowClassName={clientRowClass}
            sortField="totalDebt"
            sortOrder={-1}
            showGridlines
            removableSort
            emptyMessage={t('debts.empty')}
            scrollable
            scrollHeight="flex"
            size="small"
          >
            <Column field="clientName" header={t('debts.client')} sortable style={{ minWidth: '10rem' }} />
            <Column field="phone" header={t('debts.phone')} sortable style={{ width: '8rem' }} />
            <Column header={t('debts.amount')} body={clientAmountTemplate} style={{ width: '10rem' }} />
            <Column header={t('debts.actions')} body={clientActionsTemplate} style={{ width: '6rem' }} />
          </DataTable>
        </Card>

        <Card className="debt-layout__details">
          <div className="debt-details-header">
            <h3 className="debt-details-title">
              {selectedClient ? `${selectedClient.clientName}` : t('debts.allOperations')}
            </h3>
            {selectedClient && (
              <div className="debt-details-balance">
                <span className="debt-details-balance__label">{t('debts.balance')}:</span>
                <span className={`debt-details-balance__value ${selectedBalance > 0 ? 'debt-balance--positive' : selectedBalance < 0 ? 'debt-balance--negative' : ''}`}>
                  {formatDZD(selectedBalance)}
                </span>
              </div>
            )}
          </div>
          {!selectedClient && (
            <p className="debt-details-empty">{t('select_client_to_view_history')}</p>
          )}
          {selectedClient && (
            <DataTable
              className="entity-data-table"
              paginator
              rows={10}
              rowsPerPageOptions={[5, 10, 25]}
              value={selectedClientDebts}
              dataKey="id"
              sortField="dateInsert"
              sortOrder={-1}
              showGridlines
              removableSort
              emptyMessage={t('debts.empty')}
              scrollable
              scrollHeight="flex"
              size="small"
            >
              <Column field="amount" header={t('debts.amount')} body={debtAmountTemplate} sortable style={{ width: '8rem' }} />
              <Column field="prod" header={t('debts.purpose')} body={(r) => r.prod || '-'} style={{ minWidth: '8rem' }} />
              <Column field="dateInsert" header={t('debts.date')} body={debtDateTemplate} sortable style={{ width: '9rem' }} />
              <Column field="status" header={t('debts.status')} body={debtStatusTemplate} sortable style={{ width: '7rem' }} />
              {canDelete && <Column header={t('debts.actions')} body={debtActionsTemplate} style={{ width: '4rem' }} />}
            </DataTable>
          )}
        </Card>
      </div>

      <Dialog
        header={quickAddMode === 'debt' ? t('debts.add') : t('debts.totalPaid')}
        visible={showQuickAddDialog}
        style={{ width: '30rem', maxWidth: 'calc(100vw - 1rem)' }}
        modal
        onHide={() => setShowQuickAddDialog(false)}
      >
        <div className="debt-dialog-form">
          {quickAddClient ? (
            <div className="field">
              <label>{t('debts.client')}</label>
              <InputText value={`${quickAddClient.clientName} - ${quickAddClient.phone}`} disabled />
              {quickAddMode === 'payment' && (
                <small className="debt-client-balance-hint">
                  {t('debts.balance')}: <strong>{formatDZD(quickAddClient.totalDebt - quickAddClient.totalPaid)}</strong>
                </small>
              )}
            </div>
          ) : (
            <div className="field">
              <label>{t('debts.client')} *</label>
              <Dropdown
                value={quickAddForm.clientId}
                options={clientDropdownOptions}
                onChange={(e) => setQuickAddForm((prev) => ({ ...prev, clientId: e.value }))}
                placeholder={t('debts.clientPlaceholder')}
                filter
                showClear
              />
            </div>
          )}
          <div className="field">
            <label>{t('debts.amount')} *</label>
            <div className="debt-amount-input-row">
              <InputText
                value={quickAddForm.amount}
                onChange={(e) => setQuickAddForm((prev) => ({ ...prev, amount: e.target.value }))}
                placeholder={t('debts.amountPlaceholder')}
                inputMode="numeric"
              />
              {quickAddForm.amount && (
                <span className="debt-amount-preview">{formatDZD(quickAddForm.amount)}</span>
              )}
            </div>
          </div>
          <div className="field">
            <label>{t('debts.purpose')}</label>
            <InputText
              value={quickAddForm.purpose}
              onChange={(e) => setQuickAddForm((prev) => ({ ...prev, purpose: e.target.value }))}
              placeholder={t('debts.purpose')}
            />
          </div>
          <Divider />
          <div className="debt-dialog-actions">
            <Button label={t('debts.cancel')} icon="pi pi-times" outlined onClick={() => setShowQuickAddDialog(false)} />
            <Button
              label={quickAddMode === 'debt' ? t('debts.add') : t('debts.totalPaid')}
              icon={quickAddMode === 'debt' ? 'pi pi-plus' : 'pi pi-check'}
              onClick={handleQuickAdd}
              severity={quickAddMode === 'debt' ? 'danger' : 'success'}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
