import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { AutoComplete } from 'primereact/autocomplete';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { MultiTypesService } from '../services/MultiTypesService';
import { ClientErpService } from '../services/ClientErpService';
import { ClientService } from '../services/ClientService';
import {
  generateNextClientIdCode,
  getSelectedProductYear,
  hasDuplicateIdCode,
  isValidIdCodeFormat,
  normalizeIdCode,
} from '../utils/clientIdCode';
import { getClientDefaultFormValues } from '../utils/clientDefaults';
import { useTranslation } from 'react-i18next';

const INITIAL_FORM = {
  name: '',
  idcode: '',
  phone: '',
  tiraz: '',
  tasalaly: '',
  carnumb: '',
  battlenumb: '',
  moneyy: '',
  tproduct: '',
  tverify: '',
  lastTanjime: '',
  lastTanjime5: '',
  mcarmarqueT: null,
  mbatteltypeT: null,
  msizeT: null,
  mdaysT: null,
  mcartypeT: null,
  mstateT: null,
  mdomicileT: null,
  mdocT: null,
  sizeType: '',
  clientErp: null,
};

export default function AddClient() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(() => ({
    ...INITIAL_FORM,
    ...getClientDefaultFormValues(),
  }));
  const [saving, setSaving] = useState(false);
  const [productYear, setProductYear] = useState(getSelectedProductYear);
  const [existingClients, setExistingClients] = useState([]);

  const [carmarques, setCarmarques] = useState([]);
  const [batteltypes, setBatteltypes] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [days, setDays] = useState([]);
  const [cartypes, setCartypes] = useState([]);
  const [states, setStates] = useState([]);
  const [domiciles, setDomiciles] = useState([]);
  const [docs, setDocs] = useState([]);

  const [erpSearchResults, setErpSearchResults] = useState([]);
  const [selectedErpClient, setSelectedErpClient] = useState(null);
  const [erpSearchText, setErpSearchText] = useState('');
  const [importing, setImporting] = useState(false);
  const toast = useRef(null);

  useEffect(() => {
    MultiTypesService.getAllByType('MARQUE').then((d) => setCarmarques(d || []));
    MultiTypesService.getAllByType('BATTELTYPE').then((d) => setBatteltypes(d || []));
    MultiTypesService.getAllByType('SIZE').then((d) => setSizes(d || []));
    MultiTypesService.getAllByType('DAYS').then((d) => setDays(d || []));
    MultiTypesService.getAllByType('CARTYPE').then((d) => setCartypes(d || []));
    MultiTypesService.getAllByType('STATE').then((d) => setStates(d || []));
    MultiTypesService.getAllByType('DOMICILE').then((d) => setDomiciles(d || []));
    MultiTypesService.getAllByType('DOC').then((d) => setDocs(d || []));
    ClientService.getAll().then((d) => setExistingClients(d || [])).catch(() => {});
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

  const onFormChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const jsonText = ev.target.result;
      let data;
      try {
        data = JSON.parse(jsonText);
        if (!Array.isArray(data)) {
          toast.current.show({ severity: 'error', summary: 'خطأ', detail: 'يجب أن يكون JSON مصفوفة من الزبائن.' });
          return;
        }
      } catch {
        toast.current.show({ severity: 'error', summary: 'خطأ في JSON', detail: 'تحقق من الصيغة وحاول مرة أخرى.' });
        return;
      }
      setImporting(true);
      try {
        const mapped = data.map((row) => {
          const r = { ...row };
          if (r.number !== undefined) {
            r.battlenumb = r.number;
          }
          delete r.number;
          return r;
        });
        const res = await ClientService.importClients(mapped);
        toast.current.show({ severity: 'success', summary: 'تم بنجاح', detail: `تم استيراد ${res.imported}، تم تخطي ${res.skipped}.` });
        if (res.imported > 0) {
          ClientService.getAll().then((d) => setExistingClients(d || [])).catch(() => {});
        }
      } catch (err) {
        toast.current.show({ severity: 'error', summary: 'فشل الاستيراد', detail: err.message });
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const suggestedIdCode = generateNextClientIdCode(existingClients, productYear);

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
    setFormData((prev) => ({
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
    setFormData((prev) => ({
      ...INITIAL_FORM,
      ...getClientDefaultFormValues(),
    }));
  };

  const handleSave = async () => {
    let manualIdCode = normalizeIdCode(formData.idcode);

    if (manualIdCode && /^\d+$/.test(manualIdCode)) {
      manualIdCode = `${productYear}-${manualIdCode}`;
    }

    const resolvedIdCode = manualIdCode || generateNextClientIdCode(existingClients, productYear);

    if (!isValidIdCodeFormat(resolvedIdCode)) {
      window.alert(`ID Code must use this format: year-number (example: 2026-1). Got: "${resolvedIdCode}"`);
      return;
    }

    if (hasDuplicateIdCode(existingClients, resolvedIdCode)) {
      window.alert('ID Code must be unique. This value already exists.');
      return;
    }

    setSaving(true);
    try {
      const payload = { ...formData, idcode: resolvedIdCode };
      const result = await ClientService.create(payload);
      if (result?.ok) {
        navigate('/clients');
      } else {
        window.alert('Failed to create client.');
      }
    } catch {
      window.alert('An error occurred while creating the client.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container add-client-page">
      <Toast ref={toast} position="top-right" />
      <div className="add-client-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 0.5rem 0' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
            {t('entityTable.add.client')}
          </h2>
          <input
            type="file"
            accept=".json,.txt"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            id="jsonFileInput"
          />
          <Button
            icon="pi pi-upload"
            label={importing ? 'Importing...' : 'Import JSON'}
            severity="secondary"
            outlined
            loading={importing}
            onClick={() => document.getElementById('jsonFileInput').click()}
          />
        </div>

        {/* ERP Search */}
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

        {/* Basic Information */}
        <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
          {t('client.sectionBasic')}
        </h3>
        <div className="add-client-grid">
          <div className="add-client-field">
            <label><strong>{t('client.name')} *</strong></label>
            <InputText value={formData.name} onChange={(e) => onFormChange('name', e.target.value)} />
          </div>

          <div className="add-client-field">
            <label>
              <strong>{t('client.docNumb')}</strong>
              <span style={{ fontSize: '0.8rem', color: '#888', marginLeft: '0.5rem' }}>(Année: {productYear})</span>
            </label>
            <InputText
              value={formData.idcode ? (formData.idcode.split('-')[1] || '') : (suggestedIdCode.split('-')[1] || '')}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '');
                onFormChange('idcode', digits ? `${productYear}-${digits}` : '');
              }}
              placeholder={suggestedIdCode.split('-')[1] || '1'}
            />
          </div>

          <div className="add-client-field">
            <label><strong>{t('client.phone')} *</strong></label>
            <InputText value={formData.phone} onChange={(e) => onFormChange('phone', e.target.value)} />
          </div>

          <div className="add-client-field">
            <label><strong>{t('client.tiraz')} *</strong></label>
            <InputText value={formData.tiraz} onChange={(e) => onFormChange('tiraz', e.target.value)} />
          </div>

          <div className="add-client-field">
            <label><strong>{t('client.tasalaly')} *</strong></label>
            <InputText value={formData.tasalaly} onChange={(e) => onFormChange('tasalaly', e.target.value)} />
          </div>

          <div className="add-client-field">
            <label><strong>{t('client.carnumb')} *</strong></label>
            <InputText value={formData.carnumb} onChange={(e) => onFormChange('carnumb', e.target.value)} />
          </div>

          <div className="add-client-field">
            <label><strong>{t('client.battlenumb')} *</strong></label>
            <InputText value={formData.battlenumb} onChange={(e) => onFormChange('battlenumb', e.target.value)} />
          </div>

          <div className="add-client-field">
            <label><strong>{t('client.moneyy')} *</strong></label>
            <InputText value={formData.moneyy} onChange={(e) => onFormChange('moneyy', e.target.value)} />
          </div>

          <div className="add-client-field">
            <label><strong>{t('client.tproduct')} *</strong></label>
            <Calendar value={formData.tproduct} onChange={(e) => onFormChange('tproduct', e.value)} view="month" dateFormat="mm/yy" />
          </div>

          <div className="add-client-field">
            <label><strong>{t('client.tverify')} *</strong></label>
            <InputText type="date" value={formData.tverify} onChange={(e) => onFormChange('tverify', e.target.value)} />
          </div>

          <div className="add-client-field">
            <label><strong>{t('client.lastTanjime')}</strong></label>
            <InputText type="date" value={formData.lastTanjime} onChange={(e) => onFormChange('lastTanjime', e.target.value)} />
          </div>

          <div className="add-client-field">
            <label><strong>{t('client.lastTanjime5')}</strong></label>
            <InputText type="date" value={formData.lastTanjime5} onChange={(e) => onFormChange('lastTanjime5', e.target.value)} />
          </div>
        </div>

        <Divider />

        {/* Additional Information */}
        <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
          {t('client.sectionAdditional')}
        </h3>
        <div className="add-client-grid">
          <div className="add-client-field">
            <label><strong>{t('client.marque')}</strong></label>
            <Dropdown value={formData.mcarmarqueT} onChange={(e) => onFormChange('mcarmarqueT', e.value)} options={carmarques} optionLabel="nom" placeholder={t('client.selectMarque')} />
          </div>

          <div className="add-client-field">
            <label><strong>{t('client.batteltype')}</strong></label>
            <Dropdown value={formData.mbatteltypeT} onChange={(e) => onFormChange('mbatteltypeT', e.value)} options={batteltypes} optionLabel="nom" placeholder={t('client.selectBatteltype')} />
          </div>

          <div className="add-client-field">
            <label><strong>{t('client.duree')}</strong></label>
            <Dropdown value={formData.mdaysT} onChange={(e) => onFormChange('mdaysT', e.value)} options={days} optionLabel="nom" placeholder={t('client.selectDays')} />
          </div>

          <div className="add-client-field">
            <label><strong>{t('client.size')}</strong></label>
            <Dropdown value={formData.msizeT} onChange={(e) => {
              onFormChange('msizeT', e.value);
              const sizeVal = Number(e.value?.nom);
              onFormChange('sizeType', !isNaN(sizeVal) && sizeVal >= 58 ? 'Cylindrique' : 'Tourique');
            }} options={sizes} optionLabel="nom" placeholder={t('client.selectSize')} />
          </div>

          <div className="add-client-field">
            <label><strong>{t('client.sizeType')}</strong></label>
            <Dropdown
              value={formData.sizeType}
              onChange={(e) => onFormChange('sizeType', e.value)}
              options={[
                { label: 'Cylindrique', value: 'Cylindrique' },
                { label: 'Tourique', value: 'Tourique' },
              ]}
              placeholder={t('client.selectSizeType')}
            />
          </div>

          <div className="add-client-field">
            <label><strong>{t('client.cartype')}</strong></label>
            <Dropdown value={formData.mcartypeT} onChange={(e) => onFormChange('mcartypeT', e.value)} options={cartypes} optionLabel="nom" placeholder={t('client.selectCartype')} />
          </div>

          <div className="add-client-field">
            <label><strong>{t('client.state')}</strong></label>
            <Dropdown value={formData.mstateT} onChange={(e) => onFormChange('mstateT', e.value)} options={states} optionLabel="nom" placeholder={t('client.selectState')} />
          </div>

          <div className="add-client-field">
            <label><strong>{t('client.domicile')}</strong></label>
            <Dropdown value={formData.mdomicileT} onChange={(e) => onFormChange('mdomicileT', e.value)} options={domiciles} optionLabel="nom" placeholder={t('client.selectDomicile')} />
          </div>

          <div className="add-client-field">
            <label><strong>{t('client.doc')}</strong></label>
            <Dropdown value={formData.mdocT} onChange={(e) => onFormChange('mdocT', e.value)} options={docs} optionLabel="nom" placeholder={t('client.selectDoc')} />
          </div>
        </div>

        {/* Actions */}
        <div className="client-dialog-actions" style={{ marginTop: '1.5rem' }}>
          <Button
            label={t('common.cancel') || 'Back'}
            icon="pi pi-arrow-left"
            onClick={() => navigate('/clients')}
            className="p-button-outlined"
          />
          <Button
            label={t('entityTable.created') || 'Create'}
            icon="pi pi-check"
            onClick={handleSave}
            disabled={saving}
          />
        </div>
      </div>
    </div>
  );
}
