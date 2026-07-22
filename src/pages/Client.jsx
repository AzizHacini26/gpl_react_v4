import { EntityTable } from '../components/EntityTable';
import { useClients } from '../hooks/useClients';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { AutoComplete } from 'primereact/autocomplete';
import { MultiTypesService } from '../services/MultiTypesService';
import { ClientErpService } from '../services/ClientErpService';
import { useState, useEffect, useMemo } from 'react';
import { InputSwitch } from 'primereact/inputswitch';
import { InputMask } from 'primereact/inputmask';
import { Calendar } from 'primereact/calendar';
import { ReportService } from '../services/ReportService';
import { classNames } from 'primereact/utils';
import { getDaysNumber, dateAu, dateFormatFR, parseDateValue , dateFormatFRMY, idFormatConvert } from '../utils/helpers.js';
import { UsersService } from '../services/UsersService';
import {
  generateNextClientIdCode,
  getSelectedProductYear,
  hasDuplicateIdCode,
  isValidIdCodeFormat,
  normalizeIdCode,
} from '../utils/clientIdCode';
import { formatDZD, parseAmount } from '../utils/currency';
import { useTranslation } from 'react-i18next';
import { getClientDefaultFormValues } from '../utils/clientDefaults';


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
  const itemsWithRestDays = useMemo(
    () => hook.items.map((item) => ({ ...item, restDays: calculateRestDays(item) })),
    [hook.items],
  );

  return {
    ...hook,
    rawItems: hook.items,
    items: itemsWithRestDays,
  };
}

export default function Client() {
   const { t } = useTranslation();
  const [carmarques, setCarmarques] = useState([]);
  const [batteltypes, setBatteltypes] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [days, setDays] = useState([]);
  const [cartypes, setCartypes] = useState([]);
  const [states, setStates] = useState([]);
  const [domiciles, setDomiciles] = useState([]);
  const [docs, setDocs] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showInsetDatesDialog, setShowInsetDatesDialog] = useState(false);
  const [insetDatesForm, setInsetDatesForm] = useState({ dateStart: '', dateEnd: '' });
  const [showReportsDialog, setShowReportsDialog] = useState(false);
  const [reportsClient, setReportsClient] = useState(null);
  const [productYear, setProductYear] = useState(getSelectedProductYear);
  const clientHook = useClientsWithRestDays();

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

  const [erpSearchResults, setErpSearchResults] = useState([]);
  const [selectedErpClient, setSelectedErpClient] = useState(null);
  const [erpSearchText, setErpSearchText] = useState('');

  const handleErpSearch = async (event) => {
    const query = event.query;
    if (!query || query.length < 2) {
      setErpSearchResults([]);
      return;
    }
    try {
      const results = await ClientErpService.search(query);
      setErpSearchResults(results || []);
    } catch {
      setErpSearchResults([]);
    }
  };

  const handleErpSelect = (e) => {
    const erp = e.value;
    if (!erp) return;
    setSelectedErpClient(erp);
    clientHook.setFormData((prev) => ({
      ...prev,
      clientErp: { id: erp.id },
      name: erp.name || '',
      phone: erp.phone || '',
      tiraz: erp.tiraz || '',
      tasalaly: erp.tasalaly || '',
      number: erp.number || '',
      carnumb: erp.carnumb || '',
      battlenumb: erp.battlenumb || '',
      moneyy: erp.moneyy || '',
      tproduct: erp.tproduct || '',
      tverify: erp.tverify || '',
      lastTanjime: erp.lastTanjime || '',
      lastTanjime5: erp.lastTanjime5 || '',
      firsttverify: erp.firsttverify || '',
      obs: erp.obs || '',
      sizeType: erp.sizeType || '',
      mcarmarqueT: erp.mcarmarqueT || null,
      mbatteltypeT: erp.mbatteltypeT || null,
      msizeT: erp.msizeT || null,
      mdaysT: erp.mdaysT || null,
      mcartypeT: erp.mcartypeT || null,
      mstateT: erp.mstateT || null,
      mdomicileT: erp.mdomicileT || null,
      mdocT: erp.mdocT || null,
    }));
  };



  const clearErpSelection = () => {
    setSelectedErpClient(null);
    setErpSearchText('');
    clientHook.setFormData((prev) => ({
      ...prev,
      clientErp: null,
      name: '',
      phone: '',
      tiraz: '',
      tasalaly: '',
      number: '',
      carnumb: '',
      battlenumb: '',
      moneyy: '',
      tproduct: '',
      tverify: '',
      lastTanjime: '',
      lastTanjime5: '',
      firsttverify: '',
      obs: '',
      sizeType: '',
      mcarmarqueT: null,
      mbatteltypeT: null,
      msizeT: null,
      mdaysT: null,
      mcartypeT: null,
      mstateT: null,
      mdomicileT: null,
      mdocT: null,
    }));
  };

  const formatYearMonth = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value.slice(0, 7);
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return `${value.getFullYear()}/${String(value.getMonth() + 1).padStart(2, '0')}`;
    }
    return '';
  };
 


  const moneyBodyTemplate = (rowData) => {
    const amount = parseAmount(rowData.moneyy);
    if (!amount) return <span>{formatDZD(amount)}</span>;
    return (
      <span
        style={{
          display: 'inline-block',
          padding: '0.25rem 0.6rem',
          borderRadius: '6px',
          backgroundColor: '#fdecea',
          color: '#b71c1c',
          fontWeight: 600,
        }}
      >
        {formatDZD(amount)}
      </span>
    );
  };

  const restDaysBodyTemplate = (rowData) => {
    if (rowData.restDays == null) return '-';
    return <span dir="ltr">{rowData.restDays}</span>;
  };

  const clientRowClassName = (rowData) => {
    if (rowData.restDays != null && rowData.restDays <= 0) {
      const amount = parseAmount(rowData.moneyy);
      if (amount !== 0) {
        return 'row-rest-days-expired';
      }
      
    }
    return '';
  };

 const columns = [
  { field: 'idcode', header: t('client.docNumb'), sortable: true, filter: true, style: { width: '8rem' } },
  { field: 'name', header: t('client.name'), sortable: true, filter: true, style: { minWidth: '13rem' } },
  { field: 'phone', header: t('client.phone'), sortable: true, filter: true },
    { field: 'moneyy', header: t('client.moneyy'), filter: true, body: moneyBodyTemplate, style: { maxWidth: '12rem' } },
  { field: 'tproduct', header: t('client.tproduct'), sortable: true, body: (rowData) => formatYearMonth(rowData.tproduct) },
  { field: 'tverify', header: t('client.tverify'), sortable: true },
  { field: 'lastTanjime', header: t('client.lastTanjime'), sortable: true, filter: true },
  { field: 'lastTanjime5', header: t('client.lastTanjime5'), sortable: true, filter: true },
  { field: 'restDays', header: t('client.restDays'), sortable: true, filter: true, body: restDaysBodyTemplate, style: { width: '8rem' } },
  { field: 'battlenumb', header: t('client.battlenumb'), filter: true },
  { field: 'mcarmarqueT.nom', header: t('client.marque'), filter: true },
  { field: 'mdaysT.nom', header: t('client.duree'), filter: true, style: { maxWidth: '12rem' } },
  { field: 'mstateT.nom', header: t('client.state'), filter: true },
  { field: 'datestart', header: t('client.datestart'), filter: true },
  { field: 'dateend', header: t('client.dateend'), filter: true },
];


  const renderUserDialog = ({ visible, onHide, saving, editingItem, formData, onFormChange, onSave }) => {
    const isEditing = !!editingItem;
    const suggestedIdCode = generateNextClientIdCode(clientHook.rawItems || clientHook.items, productYear);

    const defaults = useMemo(() => getClientDefaultFormValues(), []);

    const effectiveFormData = useMemo(() => {
      if (isEditing) return formData;
      return { ...defaults, ...formData };
    }, [isEditing, formData, defaults]);

    const handleDialogHide = () => {
      setSelectedErpClient(null);
      setErpSearchText('');
      onHide();
    };

    return (
      <Dialog
        header={isEditing ? t('client.editTitle') : t('clientErp.createTitle')}
        visible={visible}
        style={{ width: 'min(45rem, calc(100vw - 1rem))' }}
        modal
        onHide={handleDialogHide}
      >
        <div className="p-fluid client-dialog-form">
          {!isEditing && (
            <>
              <div className="client-erp-search">
                <label><strong>{t('clientErp.searchLabel')}</strong></label>
                <AutoComplete
                  value={selectedErpClient || erpSearchText}
                  suggestions={erpSearchResults}
                  completeMethod={handleErpSearch}
                  dropdown
                  placeholder={t('clientErp.searchPlaceholder')}
                  selectedItemTemplate={(value) => {
                    if (typeof value === 'object' && value !== null) return value.name || '';
                    return value || '';
                  }}
                  onChange={(e) => {
                    if (typeof e.value === 'string') {
                      setErpSearchText(e.value);
                    } else if (!e.value) {
                      clearErpSelection();
                    }
                  }}
                  onSelect={handleErpSelect}

                  itemTemplate={(item) => (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '4px 0' }}>
                      <span style={{ fontWeight: 600 }}>{item.name}</span>
                      <span style={{ fontSize: '0.85rem', color: '#666' }}>
                        {item.phone} {item.carnumb ? `- ${item.carnumb}` : ''}
                      </span>
                    </div>
                  )}
                />
                {selectedErpClient && (
                  <div className="client-erp-selected">
                    <Button
                      type="button"
                      icon="pi pi-times"
                      className="p-button-rounded p-button-text p-button-sm"
                      onClick={clearErpSelection}
                      tooltip={t('clientErp.clearSelection')}
                    />
                  </div>
                )}
              </div>
              <Divider />
            </>
          )}
          {/* Basic Information Section */}
          <div className="client-dialog-grid">
            <label><strong>{t('client.fullName')} *</strong></label>
            <InputText value={effectiveFormData.name || ''} onChange={(e) => onFormChange('name', e.target.value)} />

            <label><strong>{t('client.docNumb')}</strong> <span style={{ fontSize: '0.8rem', color: '#888' }}>({t('client.yearLabel')}: {productYear})</span></label>
            {isEditing ? (
              <InputText
                value={effectiveFormData.idcode || ''}
                onChange={(e) => onFormChange('idcode', e.target.value)}
              />
            ) : (
              <InputText
                value={effectiveFormData.idcode ? (effectiveFormData.idcode.split('-')[1] || '') : (suggestedIdCode.split('-')[1] || '')}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '');
                  onFormChange('idcode', digits ? `${productYear}-${digits}` : '');
                }}
                placeholder={suggestedIdCode.split('-')[1] || '1'}
              />
            )}

            <label><strong>{t('client.phone')} *</strong></label>
            <InputText value={effectiveFormData.phone || ''} onChange={(e) => onFormChange('phone', e.target.value)} />

            <label><strong>{t('client.tiraz')} *</strong></label>
            <InputText value={effectiveFormData.tiraz || ''} onChange={(e) => onFormChange('tiraz', e.target.value)} />

            <label><strong>{t('client.tasalaly')} *</strong></label>
            <InputText value={effectiveFormData.tasalaly || ''} onChange={(e) => onFormChange('tasalaly', e.target.value)} />

            <label><strong>{t('client.carnumb')} *</strong></label>
            <InputText value={effectiveFormData.carnumb || ''} onChange={(e) => onFormChange('carnumb', e.target.value)} />

            <label><strong>{t('client.battlenumb')} *</strong></label>
            <InputText value={effectiveFormData.battlenumb || ''} onChange={(e) => onFormChange('battlenumb', e.target.value)} />

            <label><strong>{t('client.moneyy')}</strong></label>
            <InputText value={effectiveFormData.moneyy || ''} onChange={(e) => onFormChange('moneyy', e.target.value)} disabled={isEditing} />

            <label><strong>{t('client.tproduct')} *</strong></label>
            <Calendar value={effectiveFormData.tproduct || ''} onChange={(e) => onFormChange('tproduct', e.value)} view="month" dateFormat="mm/yy" />

            <label><strong>{t('client.tverify')} *</strong></label>
            <InputText type="date" value={effectiveFormData.tverify || ''} onChange={(e) => onFormChange('tverify', e.target.value)} />

            <label><strong>{t('client.lastTanjime')}</strong></label>
            <InputText type="date" value={effectiveFormData.lastTanjime || ''} onChange={(e) => onFormChange('lastTanjime', e.target.value)} />

            <label><strong>{t('client.lastTanjime5')}</strong></label>
            <InputText type="date" value={effectiveFormData.lastTanjime5 || ''} onChange={(e) => onFormChange('lastTanjime5', e.target.value)} />
          </div>

          <Divider />

          {/* Additional Information Section */}
          <div className="client-dialog-grid">
            <label><strong>{t('client.marque')}</strong></label>
            <Dropdown value={effectiveFormData.mcarmarqueT || null} onChange={(e) => onFormChange('mcarmarqueT', e.value)} options={carmarques} optionLabel="nom" placeholder={t('client.selectMarque')} />

            <label><strong>{t('client.batteltype')}</strong></label>
            <Dropdown value={effectiveFormData.mbatteltypeT || null} onChange={(e) => onFormChange('mbatteltypeT', e.value)} options={batteltypes} optionLabel="nom" placeholder={t('client.selectBatteltype')} />

            <label><strong>{t('client.duree')}</strong></label>
            <Dropdown value={effectiveFormData.mdaysT || null} onChange={(e) => onFormChange('mdaysT', e.value)} options={days} optionLabel="nom" placeholder={t('client.selectDays')} />

            <label><strong>{t('client.size')}</strong></label>
            <Dropdown value={effectiveFormData.msizeT || null} onChange={(e) => {
              onFormChange('msizeT', e.value);
              const sizeVal = Number(e.value?.nom);
              onFormChange('sizeType', !isNaN(sizeVal) && sizeVal >= 58 ? 'Cylindrique' : 'Tourique');
            }} options={sizes} optionLabel="nom" placeholder={t('client.selectSize')} />

            <label><strong>{t('client.sizeType')}</strong></label>
            <Dropdown
              value={effectiveFormData.sizeType || ''}
              onChange={(e) => onFormChange('sizeType', e.value)}
              options={[
                { label: 'Cylindrique', value: 'Cylindrique' },
                { label: 'Tourique', value: 'Tourique' },
              ]}
              placeholder={t('client.selectSizeType')}
            />

            <label><strong>{t('client.cartype')}</strong></label>
            <Dropdown value={effectiveFormData.mcartypeT || null} onChange={(e) => onFormChange('mcartypeT', e.value)} options={cartypes} optionLabel="nom" placeholder={t('client.selectCartype')} />

            <label><strong>{t('client.state')}</strong></label>
            <Dropdown value={effectiveFormData.mstateT || null} onChange={(e) => onFormChange('mstateT', e.value)} options={states} optionLabel="nom" placeholder={t('client.selectState')} />

            <label><strong>{t('client.domicile')}</strong></label>
            <Dropdown value={effectiveFormData.mdomicileT || null} onChange={(e) => onFormChange('mdomicileT', e.value)} options={domiciles} optionLabel="nom" placeholder={t('client.selectDomicile')} />

            <label><strong>{t('client.doc')}</strong></label>
            <Dropdown value={effectiveFormData.mdocT || null} onChange={(e) => onFormChange('mdocT', e.value)} options={docs} optionLabel="nom" placeholder={t('client.selectDoc')} />
          </div>

          {/* Action Buttons */}
          <div className="client-dialog-actions">
            <Button label={t('common.cancel')} icon="pi pi-times" onClick={onHide} className="p-button-outlined" />
            <Button
              label={isEditing ? t('common.update') : t('common.create')}
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
    let manualIdCode = normalizeIdCode(currentFormData.idcode);
    const idCodeSource = clientHook.rawItems || clientHook.items;

    if (manualIdCode && /^\d+$/.test(manualIdCode)) {
      manualIdCode = `${productYear}-${manualIdCode}`;
    }

    const resolvedIdCode = manualIdCode || generateNextClientIdCode(idCodeSource, productYear);

    if (!isValidIdCodeFormat(resolvedIdCode)) {
      window.alert(`ID Code must use this format: year-number (example: 2026-1). Got: "${resolvedIdCode}"`);
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

  const runReport = async (rowData, documentType, getParams) => {
    let currentUser = null;
    try {
      currentUser = await UsersService.getCurrent();
      if (!currentUser) { window.alert('User information not found.'); return; }
    } catch { window.alert('Unable to load user information.'); return; }
    const companyInfo = currentUser?.companyInfoT || {};
    ReportService.openByDocumentType(documentType, getParams(rowData, companyInfo));
  };

  const REPORTS = [
    {
      key: 'VERIFICATION_CERT',
      label: 'مراقبة',
      icon: 'pi pi-shield',
      desc: 'شهادة المراقبة',
      getParams: (rowData, companyInfo) => ({
        carnumb: rowData?.carnumb, instalateur: companyInfo.adminName || 'N/A',
        agrement: companyInfo.agrement || 'N/A', name: rowData?.name,
        marque: rowData?.mcarmarqueT.nom, tsalsely: rowData?.tasalaly,
        tiraz: rowData?.tiraz, prod: dateFormatFRMY(new Date(rowData.tproduct)),
        sizenumb: rowData?.battlenumb + '/' + rowData?.msizeT.nom + 'LT',
        du: rowData?.tverify ? dateFormatFR(new Date(rowData.tverify)) : '',
        days: rowData?.mdaysT.nom, ph1: companyInfo.phone1 || 'N/A',
        ph2: companyInfo.phone2 || 'N/A', email: companyInfo.email || 'N/A',
        id:  idFormatConvert(rowData?.idcode), adress: companyInfo.adresse || 'N/A',
        type: rowData?.mbatteltypeT.nom, au: dateAu(rowData),
      }),
    },
    {
      key: 'REGISTRATION_CARD',
      label: 'بطاقة',
      icon: 'pi pi-id-card',
      desc: 'بطاقة التسجيل',
      getParams: (rowData, companyInfo) => ({
        carnumb: rowData?.carnumb, name: rowData?.name,
        marque: rowData?.mcarmarqueT.nom, tsalsely: rowData?.tasalaly,
        tiraz: rowData?.tiraz, prod: rowData?.tproduct,
        battlenumb: rowData?.battlenumb,
        sizenumb:  rowData?.msizeT.nom + 'LT',
        du: dateFormatFRMY(new Date(rowData.tproduct)),
        type: rowData?.mcartypeT.nom,
        au: rowData?.lastTanjime ? dateFormatFRMY(new Date(rowData.lastTanjime)) : '',
        pression: '20 Bars', wilaya: companyInfo.wilaya || companyInfo.adresse || 'N/A',
        bmarque: rowData?.mbatteltypeT.nom, domc: rowData?.mdomicileT.nom,
        id: rowData?.idcode,
      }),
    },
    {
      key: 'BACK_FACE',
      label: 'البطاقة الخلف',
      icon: 'pi pi-file',
      desc: 'الوجه الخلفي للبطاقة',
      getParams: (rowData, companyInfo) => ({
        agriment: companyInfo?.cardAgriment || 'N/A',
        annee: companyInfo?.cardAnnee || 'N/A',
        wilaya: companyInfo.wilaya || 'N/A',
        wilayaAr: companyInfo.wilayaArabic || 'N/A',
      }),
    },
    {
      key: 'Etancheite',
      label: 'شهادة السير',
      icon: 'pi pi-check-circle',
      desc: 'شهادة الإتمان',
      getParams: (rowData, companyInfo) => ({
        carnumb: rowData?.carnumb, name: rowData?.name,
        marque: rowData?.mcarmarqueT.nom, tiraz: rowData?.mcartypeT.nom,
        type: rowData?.tiraz, ordre: rowData?.tasalaly,
        sizenumb: rowData?.battlenumb + '/' + rowData?.msizeT.nom + 'LT',
        reservoirN: rowData?.battlenumb,
        annee: dateFormatFRMY(rowData.tproduct),
        adress: companyInfo.adresse || 'N/A',
        phoneEmail: companyInfo.phonesEmail || 'N/A',
        instalateur: companyInfo.adminName || 'N/A',
        dateEpreuve: dateFormatFRMY(rowData.lastTanjime),
        dateValidite: dateFormatFRMY(rowData.lastTanjime5),
        wilaya: companyInfo.wilaya || companyInfo.adresse || 'N/A',
        marqueR: rowData?.mbatteltypeT.nom,
        agrement: companyInfo?.agrement || 'N/A',
      }),
    },
  ];

  const renderReportsDialog = () => (
    <Dialog
      header={`التقارير - ${reportsClient?.name || ''}`}
      visible={showReportsDialog}
      style={{ width: 'min(32rem, calc(100vw - 1rem))' }}
      modal
      onHide={() => setShowReportsDialog(false)}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {REPORTS.map((r) => (
          <Button
            key={r.key}
            icon={r.icon}
            label={r.label}
            severity="info"
            outlined
            style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
            onClick={() => runReport(reportsClient, r.key, r.getParams)}
          >
          </Button>
        ))}
      </div>
    </Dialog>
  );

  const renderInsetDatesDialog = () => {
    return (<Dialog
      header="إدخال تواريخ البطاقة"
      visible={showInsetDatesDialog}
      style={{ width: 'min(28rem, calc(100vw - 1rem))' }}
      modal
      onHide={() => setShowInsetDatesDialog(false)}
    >
      <div className="p-fluid" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <output style={{ fontStyle: 'italic', color: '#555' }}>
          {selectedClient ? `${selectedClient.name} (${selectedClient.idcode})` : 'None'}
        </output>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <label htmlFor="dateStart"><strong>تاريخ البداية</strong></label>
          <InputText
            id="dateStart"
            type="date"
            value={insetDatesForm.dateStart}
            onChange={(e) => setInsetDatesForm((prev) => ({ ...prev, dateStart: e.target.value }))}
          />
        </div>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <label htmlFor="dateEnd"><strong>تاريخ النهاية</strong></label>
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
            icon={'pi pi-check'}
            onClick={handleInsetDatesSave}
            disabled={clientHook.saving || !selectedClient}
          />
        </div>
      </div>
    </Dialog>);
  };

  return (
    <>
      {renderReportsDialog()}
      {renderInsetDatesDialog()}
      <EntityTable
        useHook={() => clientHook}
        title="Clients"
        entityName="client"
        columns={columns}
        frozenActions
        actionsColumnStyle={{ width: '11rem' }}
        rowActions={[
          {
            key: 'reports',
           
            icon: 'pi pi-print',
            severity: 'info',
            onClick: (rowData) => {
              setReportsClient(rowData);
              setShowReportsDialog(true);
            },
          },
          {
            key: 'Dates',
          
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
        selected={selectedClient}
        onSelectedChange={setSelectedClient}
        selectionMode="single"
        rowClassName={clientRowClassName}
      />
    </>
  );
}
