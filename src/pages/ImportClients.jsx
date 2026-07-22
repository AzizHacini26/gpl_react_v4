import { useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { ClientService } from '../services/ClientService';
import PageHeader from '../components/ui/PageHeader';
import { hasPermission } from '../services/authApi';

export default function ImportClients() {
  const toast = useRef(null);
  const [jsonText, setJsonText] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  if (!hasPermission('READ_CLIENTS')) {
    return <div className="page-container"><p>You don't have permission to import clients.</p></div>;
  }

  const handleImport = async () => {
    setResult(null);
    if (!jsonText.trim()) {
      toast.current.show({ severity: 'warn', summary: 'Empty', detail: 'Paste JSON data first.' });
      return;
    }

    let data;
    try {
      data = JSON.parse(jsonText);
      if (!Array.isArray(data)) {
        toast.current.show({ severity: 'error', summary: 'Invalid', detail: 'JSON must be an array of clients.' });
        return;
      }
    } catch {
      toast.current.show({ severity: 'error', summary: 'Invalid JSON', detail: 'Check the syntax and try again.' });
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
      setResult(res);
      toast.current.show({ severity: 'success', summary: 'Done', detail: `${res.imported} imported, ${res.skipped} skipped.` });
    } catch (err) {
      toast.current.show({ severity: 'error', summary: 'Import failed', detail: err.message });
    } finally {
      setImporting(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setJsonText(ev.target.result);
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="page-container">
      <Toast ref={toast} position="top-right" />
      <PageHeader
        title="استيراد الزبائن"
        subtitle="لصق بيانات JSON المصدرة من تطبيق سطح المكتب"
      />

      <Card className="entity-card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="file"
              accept=".json,.txt"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="jsonFileInput"
            />
            <label htmlFor="jsonFileInput">
              <Button icon="pi pi-upload" label="Open JSON file" severity="secondary" outlined onClick={() => document.getElementById('jsonFileInput').click()} />
            </label>
            <Button
              icon="pi pi-play"
              label={importing ? 'Importing...' : 'Import'}
              severity="success"
              onClick={handleImport}
              disabled={importing || !jsonText.trim()}
            />
          </div>

          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder='Paste JSON array here...&#10;&#10;Example:&#10;[&#10;  {&#10;    "id": "1",&#10;    "name": "...",&#10;    "phone": "...",&#10;    "carMark": "...",&#10;    "bottleMark": "...",&#10;    "state": "سليمة",&#10;    ...&#10;  }&#10;]'
            style={{
              width: '100%',
              minHeight: '300px',
              fontFamily: 'monospace',
              fontSize: '13px',
              padding: '1rem',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              resize: 'vertical',
            }}
          />

          {result && (
            <>
              <Divider />
              <div className="stats-grid">
                <div className="ui-card"><div className="ui-card__body stat-card stat-card--success">
                  <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{result.imported}</h3>
                  <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Imported</p>
                </div></div>
                <div className="ui-card"><div className="ui-card__body stat-card stat-card--warning">
                  <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{result.skipped}</h3>
                  <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Skipped</p>
                </div></div>
                <div className="ui-card"><div className="ui-card__body stat-card">
                  <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{(result.errors || []).length}</h3>
                  <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Errors</p>
                </div></div>
              </div>
              {result.errors?.length > 0 && (
                <div style={{ background: 'var(--color-danger-bg)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <strong style={{ color: 'var(--color-danger)' }}>Errors:</strong>
                  <ul style={{ margin: '0.5rem 0 0', fontSize: '0.85rem' }}>
                    {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
