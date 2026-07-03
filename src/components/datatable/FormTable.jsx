import { Button } from 'primereact/button';
import { useTranslation } from 'react-i18next';
import StatePanel from '../ui/StatePanel';

function FormTable({ loading, error, onRetry, children }) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <StatePanel
        variant="loading"
        title={t('common.loading')}
        message={t('common.loadingData')}
      />
    );
  }

  if (error) {
    return (
      <StatePanel
        variant="error"
        title={t('common.error')}
        message={error}
        icon="pi pi-exclamation-triangle"
        onRetry={onRetry}
        retryLabel={t('common.retry')}
      />
    );
  }

  return children;
}

export default FormTable;
