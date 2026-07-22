import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { TemplateSettingsService } from '../services/TemplateSettingsService';
import { MultiTypesService } from '../services/MultiTypesService';
import { loadClientDefaults, saveClientDefaults } from '../utils/clientDefaults';

const PRODUCT_YEAR_STORAGE_KEY = 'productYear';

export default function Settings() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const currentYear = new Date().getFullYear();
  const [documentTypes, setDocumentTypes] = useState([]);
  const [templatesByDocType, setTemplatesByDocType] = useState({});
  const [selections, setSelections] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [productYear, setProductYear] = useState(() => {
    const savedYear = localStorage.getItem(PRODUCT_YEAR_STORAGE_KEY);
    return savedYear ? Number(savedYear) : currentYear;
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [previewLabel, setPreviewLabel] = useState('');
  const [uploading, setUploading] = useState(null);
  const [templateImages, setTemplateImages] = useState({});
  const fileInputRef = useRef(null);
  const uploadTemplateIdRef = useRef(null);
  const blobUrlsRef = useRef({});

  const [carmarques, setCarmarques] = useState([]);
  const [batteltypes, setBatteltypes] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [daysList, setDaysList] = useState([]);
  const [cartypes, setCartypes] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [domiciles, setDomiciles] = useState([]);
  const [docs, setDocs] = useState([]);
  const [clientDefaults, setClientDefaults] = useState(() => loadClientDefaults());
  const [defaultsSaving, setDefaultsSaving] = useState(false);

  const revokeBlobUrls = useCallback(() => {
    Object.values(blobUrlsRef.current).forEach((url) => {
      if (url) URL.revokeObjectURL(url);
    });
    blobUrlsRef.current = {};
  }, []);

  const loadTemplateBlob = useCallback(async (templateId) => {
    const blob = await TemplateSettingsService.fetchTemplateImageBlob(templateId);
    if (!blob) return null;
    const url = URL.createObjectURL(blob);
    blobUrlsRef.current[templateId] = url;
    return url;
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        const [types, mySelections] = await Promise.all([
          TemplateSettingsService.getDocumentTypes(),
          TemplateSettingsService.getMySelections(),
        ]);

        const templatePairs = await Promise.all(
          types.map(async (type) => {
            const templates = await TemplateSettingsService.getTemplatesByDocumentType(type.code);
            return [type.code, templates];
          }),
        );

        if (!mounted) return;

        const templatesMap = Object.fromEntries(templatePairs);
        const selectionsMap = {};
        mySelections.forEach((item) => {
          selectionsMap[item.documentTypeCode] = item.templateId;
        });

        setDocumentTypes(types);
        setTemplatesByDocType(templatesMap);
        setSelections(selectionsMap);

        const allTemplates = Object.values(templatesMap).flat();
        const blobResults = await Promise.all(
          allTemplates
            .filter((t) => t.hasImage)
            .map(async (t) => {
              const url = await loadTemplateBlob(t.id);
              return [t.id, url];
            }),
        );
        if (!mounted) return;
        setTemplateImages(Object.fromEntries(blobResults.filter(([, url]) => url)));

      } catch (err) {
        if (!mounted) return;
        setError(err.message || 'Failed to load settings');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    MultiTypesService.getAllByType('MARQUE').then((d) => setCarmarques(d || []));
    MultiTypesService.getAllByType('BATTELTYPE').then((d) => setBatteltypes(d || []));
    MultiTypesService.getAllByType('SIZE').then((d) => setSizes(d || []));
    MultiTypesService.getAllByType('DAYS').then((d) => setDaysList(d || []));
    MultiTypesService.getAllByType('CARTYPE').then((d) => setCartypes(d || []));
    MultiTypesService.getAllByType('STATE').then((d) => setStatesList(d || []));
    MultiTypesService.getAllByType('DOMICILE').then((d) => setDomiciles(d || []));
    MultiTypesService.getAllByType('DOC').then((d) => setDocs(d || []));

    return () => {
      mounted = false;
      revokeBlobUrls();
    };
  }, [loadTemplateBlob, revokeBlobUrls]);

  const saveDisabled = useMemo(
    () => saving || Object.keys(selections).length === 0,
    [saving, selections],
  );
  const productYearOptions = useMemo(() => ([
    currentYear + 1,
    currentYear,
    currentYear - 1,
    currentYear - 2,
    currentYear - 3,
  ].map((year) => ({ label: String(year), value: year }))), [currentYear]);

  const handleSelectionChange = (documentTypeCode, templateId) => {
    setSelections((prev) => ({
      ...prev,
      [documentTypeCode]: templateId || null,
    }));
  };

  const handleSaveSelections = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = Object.entries(selections)
        .filter(([, templateId]) => templateId)
        .map(([documentTypeCode, templateId]) => ({ documentTypeCode, templateId }));

      const saved = await TemplateSettingsService.saveMySelections(payload);
      const nextSelections = {};
      saved.forEach((item) => {
        nextSelections[item.documentTypeCode] = item.templateId;
      });
      setSelections(nextSelections);
    } catch (err) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleProductYearChange = (year) => {
    setProductYear(year);
    localStorage.setItem(PRODUCT_YEAR_STORAGE_KEY, String(year));
    window.dispatchEvent(new CustomEvent('productYearChanged', { detail: year }));
  };

  const handleClientDefaultChange = (key, value) => {
    setClientDefaults((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveClientDefaults = () => {
    setDefaultsSaving(true);
    saveClientDefaults(clientDefaults);
    setTimeout(() => setDefaultsSaving(false), 400);
  };

  const getSelectedTemplate = (docTypeCode) => {
    const templateId = selections[docTypeCode];
    if (!templateId) return null;
    const templates = templatesByDocType[docTypeCode] || [];
    return templates.find((t) => t.id === templateId) || null;
  };

  const handlePreview = (template) => {
    const url = templateImages[template.id] || TemplateSettingsService.getTemplateImageUrl(template.id);
    setPreviewImage(url);
    setPreviewLabel(template.name);
  };

  const handleUploadClick = (templateId) => {
    uploadTemplateIdRef.current = templateId;
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTemplateIdRef.current) return;

    const targetId = uploadTemplateIdRef.current;
    setUploading(targetId);
    setError('');
    try {
      await TemplateSettingsService.uploadTemplateImage(targetId, file);
      if (blobUrlsRef.current[targetId]) {
        URL.revokeObjectURL(blobUrlsRef.current[targetId]);
      }
      const newUrl = await loadTemplateBlob(targetId);
      setTemplatesByDocType((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((code) => {
          next[code] = next[code].map((t) =>
            t.id === targetId ? { ...t, hasImage: true } : t,
          );
        });
        return next;
      });
      if (newUrl) {
        setTemplateImages((prev) => ({ ...prev, [targetId]: newUrl }));
      }
    } catch (err) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(null);
      uploadTemplateIdRef.current = null;
      e.target.value = '';
    }
  };

  if (loading) {
    return <div>{t('settings.loading')}</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h1 className="text-2xl font-bold mb-2">{t('settings.title')}</h1>

      {error && <Message severity="error" text={error} />}

      <Card title={t('settings.productYearTitle')}>
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '0.75rem', alignItems: 'center' }}>
          <label htmlFor="product-year"><strong>{t('settings.productYearLabel')}</strong></label>
          <Dropdown
            id="product-year"
            value={productYear}
            options={productYearOptions}
            onChange={(e) => handleProductYearChange(e.value)}
            placeholder={t('settings.selectProductYear')}
          />
        </div>
      </Card>

      <Card title={t('settings.templateSelectionTitle')}>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {documentTypes.map((docType) => {
            const templates = templatesByDocType[docType.code] || [];
            const options = templates.map((template) => ({
              label: `${template.name} (${template.sourceType})`,
              value: template.id,
            }));
            const selectedTemplate = getSelectedTemplate(docType.code);

            return (
              <div key={docType.code} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {selectedTemplate && templateImages[selectedTemplate.id] ? (
                  <img
                    src={templateImages[selectedTemplate.id]}
                    alt={selectedTemplate.name}
                    style={{
                      width: 50, height: 50, borderRadius: 6,
                      objectFit: 'cover', border: '1px solid #dee2e6',
                      cursor: 'pointer',
                    }}
                    onClick={() => handlePreview(selectedTemplate)}
                  />
                ) : (
                  <div
                    style={{
                      width: 50, height: 50, borderRadius: 6,
                      border: '1px solid #dee2e6', background: '#f8f9fa',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, color: '#ccc',
                    }}
                  >
                    <i className="pi pi-image" />
                  </div>
                )}
                <label htmlFor={`select-${docType.code}`} style={{ minWidth: 140 }}>
                  <strong>{docType.nameAr}</strong>
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {selectedTemplate?.hasImage && (
                    <Button
                      icon="pi pi-eye"
                      tooltip="Preview"
                      tooltipOptions={{ position: 'top' }}
                      className="p-button-rounded p-button-text p-button-sm"
                      onClick={() => handlePreview(selectedTemplate)}
                    />
                  )}
                  {isAdmin && selectedTemplate && (
                    <Button
                      icon="pi pi-image"
                      tooltip="Change image"
                      tooltipOptions={{ position: 'top' }}
                      className="p-button-rounded p-button-text p-button-sm"
                      loading={uploading === selectedTemplate.id}
                      onClick={() => handleUploadClick(selectedTemplate.id)}
                    />
                  )}
                </div>
                <Dropdown
                  id={`select-${docType.code}`}
                  value={selections[docType.code] || null}
                  options={options}
                  onChange={(e) => handleSelectionChange(docType.code, e.value)}
                  placeholder={t('settings.selectTemplate')}
                  showClear
                  filter
                  style={{ minWidth: '18rem', flex: 1 }}
                />
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            label={saving ? t('settings.saving') : t('settings.save')}
            icon="pi pi-save"
            onClick={handleSaveSelections}
            disabled={saveDisabled}
            loading={saving}
          />
        </div>
      </Card>

      <Card title={t('settings.clientDefaultsTitle')}>
        <p style={{ margin: '0 0 1rem 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          {t('settings.clientDefaultsDesc')}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label><strong>{t('client.marque')}</strong></label>
            <Dropdown
              value={clientDefaults.mcarmarqueT || null}
              onChange={(e) => handleClientDefaultChange('mcarmarqueT', e.value)}
              options={carmarques}
              optionLabel="nom"
              placeholder={t('client.selectMarque')}
              showClear
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label><strong>{t('client.batteltype')}</strong></label>
            <Dropdown
              value={clientDefaults.mbatteltypeT || null}
              onChange={(e) => handleClientDefaultChange('mbatteltypeT', e.value)}
              options={batteltypes}
              optionLabel="nom"
              placeholder={t('client.selectBatteltype')}
              showClear
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label><strong>{t('client.size')}</strong></label>
            <Dropdown
              value={clientDefaults.msizeT || null}
              onChange={(e) => handleClientDefaultChange('msizeT', e.value)}
              options={sizes}
              optionLabel="nom"
              placeholder={t('client.selectSize')}
              showClear
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label><strong>{t('client.duree')}</strong></label>
            <Dropdown
              value={clientDefaults.mdaysT || null}
              onChange={(e) => handleClientDefaultChange('mdaysT', e.value)}
              options={daysList}
              optionLabel="nom"
              placeholder={t('client.selectDays')}
              showClear
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label><strong>{t('client.cartype')}</strong></label>
            <Dropdown
              value={clientDefaults.mcartypeT || null}
              onChange={(e) => handleClientDefaultChange('mcartypeT', e.value)}
              options={cartypes}
              optionLabel="nom"
              placeholder={t('client.selectCartype')}
              showClear
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label><strong>{t('client.state')}</strong></label>
            <Dropdown
              value={clientDefaults.mstateT || null}
              onChange={(e) => handleClientDefaultChange('mstateT', e.value)}
              options={statesList}
              optionLabel="nom"
              placeholder={t('client.selectState')}
              showClear
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label><strong>{t('client.domicile')}</strong></label>
            <Dropdown
              value={clientDefaults.mdomicileT || null}
              onChange={(e) => handleClientDefaultChange('mdomicileT', e.value)}
              options={domiciles}
              optionLabel="nom"
              placeholder={t('client.selectDomicile')}
              showClear
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label><strong>{t('client.doc')}</strong></label>
            <Dropdown
              value={clientDefaults.mdocT || null}
              onChange={(e) => handleClientDefaultChange('mdocT', e.value)}
              options={docs}
              optionLabel="nom"
              placeholder={t('client.selectDoc')}
              showClear
            />
          </div>
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            label={t('settings.save')}
            icon="pi pi-save"
            onClick={handleSaveClientDefaults}
            loading={defaultsSaving}
          />
        </div>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelected}
      />

      <Dialog
        header={previewLabel}
        visible={!!previewImage}
        style={{ width: '80vw', maxWidth: 800 }}
        onHide={() => setPreviewImage(null)}
      >
        {previewImage && (
          <img
            src={previewImage}
            alt={previewLabel}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        )}
      </Dialog>

    </div>
  );
}
