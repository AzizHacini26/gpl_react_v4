import { useEffect, useMemo, useState } from 'react';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { useTranslation } from 'react-i18next';
import { TemplateSettingsService } from '../services/TemplateSettingsService';

const PRODUCT_YEAR_STORAGE_KEY = 'productYear';

export default function Settings() {
  const { t } = useTranslation();
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

      } catch (err) {
        if (!mounted) return;
        setError(err.message || 'Failed to load settings');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

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
            const options = (templatesByDocType[docType.code] || []).map((template) => ({
              label: `${template.name} (${template.sourceType})`,
              value: template.id,
            }));

            return (
              <div key={docType.code} style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '0.75rem', alignItems: 'center' }}>
                <label htmlFor={`select-${docType.code}`}><strong>{docType.nameAr}</strong></label>
                <Dropdown
                  id={`select-${docType.code}`}
                  value={selections[docType.code] || null}
                  options={options}
                  onChange={(e) => handleSelectionChange(docType.code, e.value)}
                  placeholder={t('settings.selectTemplate')}
                  showClear
                  filter
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

    </div>
  );
}
