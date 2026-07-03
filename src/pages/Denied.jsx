import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { useTranslation } from 'react-i18next';
import StatePanel from '../components/ui/StatePanel';

export default function Denied() {
  const { t } = useTranslation();

  return (
    <div className="page-container">
      <div className="ui-card">
        <div className="ui-card__body">
          <StatePanel
            variant="error"
            title={t('denied.title')}
            message={t('denied.message')}
            icon="pi pi-lock"
          />
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-4)' }}>
            <Link to="/">
              <Button type="button" label={t('denied.backHome')} icon="pi pi-home" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
