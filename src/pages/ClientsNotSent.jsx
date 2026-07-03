import { EntityTable } from '../components/EntityTable';
import { useClients } from '../hooks/useClients';
// pages/Users.jsx
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { MultiTypesService } from '../services/MultiTypesService';
import { useState, useEffect, useMemo, useRef } from 'react';
 import { Calendar } from 'primereact/calendar';
 import { classNames } from 'primereact/utils';
import { Toast } from 'primereact/toast';
import {
  generateNextClientIdCode,
  getSelectedProductYear,
  hasDuplicateIdCode,
  isValidIdCodeFormat,
  normalizeIdCode,
} from '../utils/clientIdCode';
import { formatDZD, parseAmount } from '../utils/currency';
import { useTranslation } from 'react-i18next';

const parseDateValue = (value) => {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return new Date(value.getTime());
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getDaysNumber = (mdays) => {
  if (typeof mdays === 'number') return mdays;
  const fromNom = mdays?.nom ?? mdays?.name ?? mdays;
  const extracted = Number.parseInt(String(fromNom ?? '').replace(/[^\d-]/g, ''), 10);
  return Number.isNaN(extracted) ? 0 : extracted;
};

const calculateRestDays = (rowData) => {
  const verifyDate = parseDateValue(rowData.tverify);
  if (!verifyDate) return null;

  const mdaysValue = getDaysNumber(rowData.mdaysT);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  verifyDate.setHours(0, 0, 0, 0);
  verifyDate.setDate(verifyDate.getDate() + mdaysValue);

  return Math.floor((verifyDate.getTime() - today.getTime()) / 86400000);
};

function useClientsWithRestDays() {
  const hook = useClients();
  const itemsWithRestDays = useMemo(() => {
    const mapped = hook.items.map((item) => ({ ...item, restDays: calculateRestDays(item) }));
    mapped.sort((a, b) => {
      if (a.datestart && !b.datestart) return 1;
      if (!a.datestart && b.datestart) return -1;
      return 0;
    });
    return mapped;
  }, [hook.items]);

  return {
    ...hook,
    rawItems: hook.items,
    items: itemsWithRestDays,
  };
}

export default function ClientNotSent() {

  const [carmarques, setCarmarques] = useState([]);
  const [batteltypes, setBatteltypes] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [days, setDays] = useState([]);
  const [cartypes, setCartypes] = useState([]);
  const [states, setStates] = useState([]);
  const [domiciles, setDomiciles] = useState([]);
  const [docs, setDocs] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedClients, setSelectedClients] = useState([]);
  const [showInsetDatesDialog, setShowInsetDatesDialog] = useState(false);
  const [showIQRDialog, setShowIQRDialog] = useState(false);
  const [qrMessageText, setQrMessageText] = useState('');
  const [currentQrPage, setCurrentQrPage] = useState(0);
  const QR_BATCH_SIZE = 20;
  const [rangeFrom, setRangeFrom] = useState('');
  const [rangeTo, setRangeTo] = useState('');
  const [selectionKey, setSelectionKey] = useState(0);
  const [productYear, setProductYear] = useState(getSelectedProductYear);

  const [insetDatesForm, setInsetDatesForm] = useState({ dateStart: '', dateEnd: '' });
  const { t } = useTranslation();
  const tOrDefault = (key, defaultValue) => t(key, { defaultValue });
  const clientHook = useClientsWithRestDays();
  const toast = useRef(null);

  useEffect(() => {
    MultiTypesService.getAllByType('MARQUE').then(data => setCarmarques(data || []));
    MultiTypesService.getAllByType('BATTELTYPE').then(data => setBatteltypes(data || []));
    MultiTypesService.getAllByType('SIZE').then(data => setSizes(data || []));
    MultiTypesService.getAllByType('DAYS').then(data => setDays(data || []));
    MultiTypesService.getAllByType('CARTYPE').then(data => setCartypes(data || []));
    MultiTypesService.getAllByType('STATE').then(data => setStates(data || []));
    MultiTypesService.getAllByType('DOMICILE').then(data => setDomiciles(data || []));
    MultiTypesService.getAllByType('DOC').then(data => setDocs(data || []));
  }, []);

  useEffect(() => {
    const handleProductYearChanged = (event) => {
      if (typeof event?.detail === 'number') {
        setProductYear(event.detail);
      } else {
        setProductYear(getSelectedProductYear());
      }
    };

    const handleStorage = (event) => {
      if (event.key === 'productYear') {
        setProductYear(getSelectedProductYear());
      }
    };

    window.addEventListener('productYearChanged', handleProductYearChanged);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('productYearChanged', handleProductYearChanged);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const formatYearMonth = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value.slice(0, 7);
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}`;
    }
    return '';
  };

  const moneyBodyTemplate = (rowData) => {
    const amount = parseAmount(rowData.moneyy);
    const moneyClassName = classNames('money-badge', {
      'money-badge-low': amount <= 0,
      'money-badge-medium': amount > 0 && amount < 1000,
      'money-badge-high': amount >= 1000,
    });

    return <span className={moneyClassName}>{formatDZD(amount)}</span>;
  };

  const restDaysBodyTemplate = (rowData) => {
    return rowData.restDays ?? '-';
  };

  const clientRowClassName = (rowData) => {
    if (rowData.datestart) return 'row-sent';
    if (rowData.restDays != null && rowData.restDays <= 0) return 'row-rest-days-expired';
    return '';
  };

  const columns = [
    { field: 'idcode', header: tOrDefault('table.idCode', 'ID Code'), sortable: true, filter: true, style: { width: '8rem' } },
    { field: 'id', header: tOrDefault('table.id', 'ID'), sortable: true, style: { width: '6rem' } },
    { field: 'name', header: tOrDefault('table.name', 'Name'), sortable: true, filter: true, style: { minWidth: '13rem' } },
    { field: 'phone', header: tOrDefault('table.phone', 'Phone'), sortable: true, filter: true },
    { field: 'tproduct', header: tOrDefault('table.tProduct', 'T Product'), sortable: true, body: (rowData) => formatYearMonth(rowData.tproduct) },
    { field: 'restDays', header: tOrDefault('table.restDays', 'Rest Days'), sortable: true, filter: true, body: restDaysBodyTemplate, style: { width: '8rem' } },
    { field: 'moneyy', header: tOrDefault('table.money', 'Money'), filtermenu: true, filter: true, body: moneyBodyTemplate, style: { maxWidth: '12rem' } },
    { field: 'datestart', header: tOrDefault('table.dateStart', 'Date Start'), filter: true },
    { field: 'dateend', header: tOrDefault('table.dateEnd', 'Date End'), filter: true },
  ];

  
  const renderUserDialog = ({ visible, onHide, saving, editingItem, formData, onFormChange, onSave }) => {
    const isEditing = !!editingItem;

    return (
      <Dialog
        header={isEditing ? 'Edit Client' : 'Create New Client'}
        visible={visible}
        style={{ width: '45rem' }}
        modal
        onHide={onHide}
      >
        <div className="p-fluid" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Basic Information Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', alignItems: 'center' }}>
            <label><strong>Full Name *</strong></label>
            <InputText value={formData.name || ''} onChange={(e) => onFormChange('name', e.target.value)} />

            <label><strong>ID Code</strong></label>
            <InputText
              value={formData.idcode || ''}
              onChange={(e) => onFormChange('idcode', e.target.value)}
              placeholder={`Auto: 1-${productYear}`}
            />
            
            <label><strong>Phone *</strong></label>
            <InputText value={formData.phone || ''} onChange={(e) => onFormChange('phone', e.target.value)} />
            
            <label><strong>Tiraz *</strong></label>
            <InputText value={formData.tiraz || ''} onChange={(e) => onFormChange('tiraz', e.target.value)} />
            
            <label><strong>Tasalaly *</strong></label>
            <InputText value={formData.tasalaly || ''} onChange={(e) => onFormChange('tasalaly', e.target.value)} />
            
            <label><strong>Car Number *</strong></label>
            <InputText value={formData.carnumb || ''} onChange={(e) => onFormChange('carnumb', e.target.value)} />
            
            <label><strong>Battle Number *</strong></label>
            <InputText value={formData.battlenumb || ''} onChange={(e) => onFormChange('battlenumb', e.target.value)} />
            
            <label><strong>Money *</strong></label>
            <InputText value={formData.moneyy || ''} onChange={(e) => onFormChange('moneyy', e.target.value)} />
            
            <label><strong>Tproduct *</strong></label>
            <Calendar value={formData.tproduct || ''} onChange={(e) => onFormChange('tproduct', e.value)} view="month" dateFormat="mm/yy" />
            
            <label><strong>Tverify *</strong></label>
            <InputText type="date" value={formData.tverify || ''} onChange={(e) => onFormChange('tverify', e.target.value)} />
          </div>

          <Divider />

          {/* Additional Information Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', alignItems: 'center' }}>
            <label><strong>Mark</strong></label>
            <Dropdown value={formData.mcarmarqueT || null} onChange={(e) => onFormChange('mcarmarqueT', e.value)} options={carmarques} optionLabel="nom" placeholder="Select Mark" />
            
            <label><strong>Battle Type</strong></label>
            <Dropdown value={formData.mbatteltypeT || null} onChange={(e) => onFormChange('mbatteltypeT', e.value)} options={batteltypes} optionLabel="nom" placeholder="Select Battle Type" />
            
            <label><strong>Days</strong></label>
            <Dropdown value={formData.mdaysT || null} onChange={(e) => onFormChange('mdaysT', e.value)} options={days} optionLabel="nom" placeholder="Select Days" />
            
            <label><strong>Bottle Size</strong></label>
            <Dropdown value={formData.msizeT || null} onChange={(e) => onFormChange('msizeT', e.value)} options={sizes} optionLabel="nom" placeholder="Select Size" />
            
            <label><strong>Car Type</strong></label>
            <Dropdown value={formData.mcartypeT || null} onChange={(e) => onFormChange('mcartypeT', e.value)} options={cartypes} optionLabel="nom" placeholder="Select Car Type" />
            
            <label><strong>State</strong></label>
            <Dropdown value={formData.mstateT || null} onChange={(e) => onFormChange('mstateT', e.value)} options={states} optionLabel="nom" placeholder="Select State" />
            
            <label><strong>Domicile</strong></label>
            <Dropdown value={formData.mdomicileT || null} onChange={(e) => onFormChange('mdomicileT', e.value)} options={domiciles} optionLabel="nom" placeholder="Select Domicile" />
            
            <label><strong>Doc</strong></label>
            <Dropdown value={formData.mdocT || null} onChange={(e) => onFormChange('mdocT', e.value)} options={docs} optionLabel="nom" placeholder="Select Doc" />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Button label="Cancel" icon="pi pi-times" onClick={onHide} className="p-button-outlined" />
            <Button 
              label={isEditing ? 'Update' : 'Create'} 
              icon={isEditing ? 'pi pi-check' : 'pi pi-plus'} 
              onClick={onSave} 
              disabled={saving} 
            />
          </div>
        </div>
      </Dialog>
    );
};

  const handleBeforeSave = (currentFormData, editingItem) => {
    const manualIdCode = normalizeIdCode(currentFormData.idcode);
    const idCodeSource = clientHook.rawItems || clientHook.items;
    const resolvedIdCode = manualIdCode || generateNextClientIdCode(idCodeSource, productYear);

    if (!isValidIdCodeFormat(resolvedIdCode)) {
      window.alert('ID Code must use this format: number-year (example: 1-2026).');
      return false;
    }

    if (hasDuplicateIdCode(idCodeSource, resolvedIdCode, editingItem?.id)) {
      window.alert('ID Code must be unique. This value already exists.');
      return false;
    }

    currentFormData.idcode = resolvedIdCode;
    if (currentFormData.idcode !== clientHook.formData.idcode) {
      clientHook.setFormData((prev) => ({ ...prev, idcode: resolvedIdCode }));
    }
    return true;
  };

  const handleInsetDatesSave = async () => {
    if (!selectedClient?.id) return;

    const { restDays: _restDays, ...baseClient } = selectedClient;
    const payload = {
      ...baseClient,
      datestart: insetDatesForm.dateStart || null,
      dateend: insetDatesForm.dateEnd || null,
    };

    const result = await clientHook.updateItem(selectedClient.id, payload);
    if (result?.ok) {
      setSelectedClient(result.data);
      setShowInsetDatesDialog(false);
    }
  };

  const RenderInsetDatesDialog = () => {
   return ( <Dialog
        header="Insert Dates"
        visible={showInsetDatesDialog}
        style={{ width: '28rem' }}
        modal
        onHide={() => setShowInsetDatesDialog(false)}
      >
        <div className="p-fluid" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <output style={{ fontStyle: 'italic', color: '#555' }}>
          selected client: {selectedClient ? `${selectedClient.name} (ID: ${selectedClient.id})` : 'None'}
           </output>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <label htmlFor="dateStart"><strong>Date Start</strong></label>
            <InputText
              id="dateStart"
              type="date"
              value={insetDatesForm.dateStart}
              onChange={(e) => setInsetDatesForm((prev) => ({ ...prev, dateStart: e.target.value }))}
            />
          </div>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <label htmlFor="dateEnd"><strong>Date End</strong></label>
            <InputText
              id="dateEnd"
              type="date"
              value={insetDatesForm.dateEnd}
              onChange={(e) => setInsetDatesForm((prev) => ({ ...prev, dateEnd: e.target.value }))}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Button label="Cancel" icon="pi pi-times" onClick={() => setShowInsetDatesDialog(false)} className="p-button-outlined" />
            <Button 
              label={'Update'} 
              icon={'pi pi-check' } 
              onClick={handleInsetDatesSave} 
              disabled={clientHook.saving || !selectedClient} 
            />
          </div>
        </div>
      </Dialog>);
  };

  const selectedClientPhones = useMemo(
    () => (selectedClients || []).map((c) => c?.phone).filter(Boolean),
    [selectedClients],
  );

  const qrTotalPages = useMemo(
    () => Math.ceil(selectedClientPhones.length / QR_BATCH_SIZE),
    [selectedClientPhones],
  );

  const currentQrBatch = useMemo(() => {
    const start = currentQrPage * QR_BATCH_SIZE;
    const end = Math.min(start + QR_BATCH_SIZE, selectedClientPhones.length);
    return selectedClientPhones.slice(start, end);
  }, [selectedClientPhones, currentQrPage]);

  const currentQrData = useMemo(() => {
    if (!currentQrBatch.length) return '';
    return `mmsto:${currentQrBatch.join(',')}?body=${qrMessageText}`;
  }, [currentQrBatch, qrMessageText]);

  const currentQrImageUrl = useMemo(
    () => (currentQrData ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(currentQrData)}` : ''),
    [currentQrData],
  );

  const openQrDialog = () => {
    if (selectedClientPhones.length === 0) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Warning',
        detail: 'الرجاء تحديد عميل واحد على الأقل',
        life: 3000,
      });
      return;
    }
    setCurrentQrPage(0);
    setShowIQRDialog(true);
  };

  const RenderQRDialog = () => {
    const total = selectedClientPhones.length;
    const start = currentQrPage * QR_BATCH_SIZE + 1;
    const end = Math.min((currentQrPage + 1) * QR_BATCH_SIZE, total);

    return (
      <Dialog
        header="امسح الرمز لارسال رسالة"
        visible={showIQRDialog}
        style={{ width: '32rem' }}
        modal
        onHide={() => setShowIQRDialog(false)}
      >
        <div dir="rtl" className="p-fluid" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <small style={{ color: '#666' }}>
            العملاء المحددين: {total}
          </small>

          <div style={{ display: 'grid', gap: '0.3rem' }}>
            <label htmlFor="qrMessage"><strong>نص الرسالة</strong></label>
            <InputText
              id="qrMessage"
              value={qrMessageText}
              onChange={(e) => setQrMessageText(e.target.value)}
              placeholder="اكتب نص الرسالة"
            />
          </div>

          {qrTotalPages > 1 && (
            <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'center', margin: '0.3rem 0' }}>
              {Array.from({ length: qrTotalPages }, (_, i) => {
                const bStart = i * QR_BATCH_SIZE + 1;
                const bEnd = Math.min((i + 1) * QR_BATCH_SIZE, total);
                return (
                  <Button
                    key={i}
                    type="button"
                    severity={i === currentQrPage ? 'info' : 'secondary'}
                    size="small"
                    outlined={i !== currentQrPage}
                    label={`${bStart}-${bEnd}`}
                    onClick={() => setCurrentQrPage(i)}
                    style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
                  />
                );
              })}
            </div>
          )}

          <small style={{ color: '#666', textAlign: 'center' }}>
            الأرقام {start}-{end} من إجمالي {total} ({currentQrBatch.length} شخص)
          </small>

          <div style={{ display: 'grid', placeItems: 'center', minHeight: '240px' }}>
            {currentQrImageUrl ? (
              <img src={currentQrImageUrl} alt="SMS QR Code" width={220} height={220} />
            ) : (
              <small>لا توجد بيانات لإنشاء رمز QR</small>
            )}
          </div>

          {qrTotalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                type="button"
                icon="pi pi-chevron-right"
                label="السابق"
                outlined
                disabled={currentQrPage === 0}
                onClick={() => setCurrentQrPage(prev => Math.max(0, prev - 1))}
              />
              <Button
                type="button"
                icon="pi pi-chevron-left"
                label="التالي"
                iconPos="right"
                outlined
                disabled={currentQrPage >= qrTotalPages - 1}
                onClick={() => setCurrentQrPage(prev => Math.min(qrTotalPages - 1, prev + 1))}
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button label="إغلاق" icon="pi pi-times" onClick={() => setShowIQRDialog(false)} outlined />
          </div>
        </div>
      </Dialog>
    );
  };
  const handleSelectRange = () => {
    const from = Number.parseInt(rangeFrom, 10);
    const to = Number.parseInt(rangeTo, 10);
    if (Number.isNaN(from) || Number.isNaN(to) || from < 1 || to < 1 || from > to) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Warning',
        detail: 'الرجاء إدخال أرقام صحيحة (من إلى)',
        life: 3000,
      });
      return;
    }
    const items = clientHook.items;
    if (from > items.length) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Warning',
        detail: `الرقم ${from} أكبر من إجمالي العملاء (${items.length})`,
        life: 3000,
      });
      return;
    }
    const fromIndex = Math.max(0, from - 1);
    const toIndex = Math.min(to, items.length) - 1;
    setSelectedClients(items.slice(fromIndex, toIndex + 1));
    setSelectionKey(prev => prev + 1);
    setRangeFrom('');
    setRangeTo('');
  };

  const handleConfirmSent = async () => {
    if (selectedClients.length === 0) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Warning',
        detail: 'الرجاء تحديد عميل واحد على الأقل',
        life: 3000,
      });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    toast.current?.show({
      severity: 'info',
      summary: 'جاري التحديث',
      detail: `تحديث ${selectedClients.length} عميل...`,
      life: 5000,
    });

    const results = await Promise.allSettled(
      selectedClients.map(async (client) => {
        const { restDays: _restDays, ...baseClient } = client;
        return clientHook.updateItem(client.id, {
          ...baseClient,
          datestart: today,
          dateend: today,
        });
      }),
    );

    const successCount = results.filter(r => r.status === 'fulfilled' && r.value?.ok).length;
    const failCount = results.filter(r => r.status === 'rejected' || !r.value?.ok).length;

    setSelectedClients([]);

    toast.current?.show({
      severity: failCount > 0 && successCount > 0 ? 'warn' : failCount > 0 ? 'error' : 'success',
      summary: failCount > 0 ? 'اكتمل مع أخطاء' : 'تم بنجاح',
      detail: `تم تأكيد إرسال ${successCount} عميل${failCount > 0 ? `، فشل ${failCount}` : ''}`,
      life: 5000,
    });
  };

  return (
    <>
      <Toast ref={toast} position="top-right" />
      {RenderInsetDatesDialog()}
      {RenderQRDialog()}
      <EntityTable
        useHook={() => clientHook}
        title="Clients"
        entityName="client"
        columns={columns}
        rowActions={[
         
          {
            key: 'Dates',
            label: 'Dates',
            icon: 'pi pi-calendar-plus',
            severity: 'info',
            onClick: (rowData) => {
              setSelectedClient(rowData);
              setInsetDatesForm({
                dateStart: rowData?.datestart || '',
                dateEnd: rowData?.dateend || '',
              });
              setShowInsetDatesDialog(true);
            },
          },
        ]}
        renderDialog={renderUserDialog}
        onBeforeSave={handleBeforeSave}
        selected={selectedClients}
        onSelectedChange={setSelectedClients}
        selectionMode="multiple"
        selectionKey={selectionKey}
        rowClassName={clientRowClassName}
        rightToolbarExtras={
          <>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0 0.5rem', fontWeight: 600, color: '#495057' }}>
              <i className="pi pi-users" style={{ fontSize: '1rem' }} />
              {selectedClients.length}
            </span>
            <InputText
              value={rangeFrom}
              onChange={(e) => setRangeFrom(e.target.value)}
              placeholder="من"
              style={{ width: '3.5rem' }}
            />
            <InputText
              value={rangeTo}
              onChange={(e) => setRangeTo(e.target.value)}
              placeholder="إلى"
              style={{ width: '3.5rem' }}
            />
            <Button
              type="button"
              severity="info"
              icon="pi pi-angle-double-down"
              label="تحديد"
              outlined
              onClick={handleSelectRange}
              disabled={!rangeFrom || !rangeTo}
            />
            <Button
              type="button"
              severity="help"
              icon="pi pi-check-square"
              label="Select All"
              onClick={() => setSelectedClients(clientHook.items)}
            />
            <Button
              type="button"
              severity="secondary"
              icon="pi pi-times"
              label="Clear Selection"
              outlined
              onClick={() => setSelectedClients([])}
            />
             <Button
               type="button"
               severity="secondary"
               icon="pi pi-qrcode"
               label="QR"
               outlined
               onClick={openQrDialog}
             />
             <Button
               type="button"
               severity="success"
               icon="pi pi-check"
               label="تأكيد الإرسال"
               onClick={handleConfirmSent}
               disabled={selectedClients.length === 0}
             />
          </>
        }
      />
    </>
  );
}
