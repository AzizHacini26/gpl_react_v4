import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Divider } from 'primereact/divider';
import PageHeader from '../components/ui/PageHeader';
import StatePanel from '../components/ui/StatePanel';
import StatusBadge from '../components/ui/StatusBadge';
import { UsersService } from '../services/UsersService';

function InfoField({ label, value }) {
  return (
    <div className="info-field">
      <span className="info-field__label">{label}</span>
      <span className="info-field__value">{value || '-'}</span>
    </div>
  );
}

function Account() {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const currentUser = await UsersService.getCurrent();
        if (!currentUser) {
          setError(t('account.notFound'));
        } else {
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Error loading account:', err);
        setError(t('account.loadError'));
      } finally {
        setLoading(false);
      }
    };

    loadCurrentUser();
  }, [t]);

  const initials = useMemo(() => {
    const name = user?.nom || user?.username || '';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || '?';
  }, [user]);

  if (loading) {
    return (
      <div className="page-container">
        <StatePanel
          variant="loading"
          title={t('account.loading')}
          message={t('account.loadingMessage')}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <StatePanel
          variant="error"
          title={t('account.errorTitle')}
          message={error}
          icon="pi pi-exclamation-triangle"
        />
      </div>
    );
  }

  const company = user?.companyInfoT;

  return (
    <div className="page-container">
      <PageHeader
        title={t('account.title')}
        subtitle={t('account.subtitle')}
      />

      <div className="account-grid">
        <aside className="ui-card profile-card">
          <div className="ui-card__body">
            <div className="profile-avatar" aria-hidden="true">{initials}</div>
            <h2 className="profile-name">{user?.nom || '-'}</h2>
            <p className="profile-role">{user?.roleT?.nom || '-'}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
              <StatusBadge
                label={user?.activated ? t('account.activated') : t('account.notActivated')}
                variant={user?.activated ? 'success' : 'danger'}
              />
              {user?.firstLogin ? (
                <StatusBadge label={t('account.firstLogin')} variant="warning" />
              ) : null}
            </div>
          </div>
        </aside>

        <div className="ui-card">
          <div className="ui-card__body dashboard-panel">
            <div className="dashboard-panel__header">
              <div>
                <h2 className="dashboard-panel__title">{t('account.personalInfo')}</h2>
                <p className="dashboard-panel__subtitle">{t('account.personalInfoSubtitle')}</p>
              </div>
            </div>
            <div className="info-grid">
              <InfoField label={t('account.name')} value={user?.nom} />
              <InfoField label={t('account.username')} value={user?.username} />
              <InfoField label={t('account.phone')} value={user?.phone} />
              <InfoField label={t('account.role')} value={user?.roleT?.nom} />
            </div>

            {company ? (
              <>
                <Divider />
                <div className="dashboard-panel__header">
                  <div>
                    <h2 className="dashboard-panel__title">{t('account.companyInfo')}</h2>
                    <p className="dashboard-panel__subtitle">{t('account.companyInfoSubtitle')}</p>
                  </div>
                </div>
                <div className="info-grid">
                  <InfoField label={t('account.companyName')} value={company.companyName} />
                  <InfoField label={t('account.adminName')} value={company.adminName} />
                  <InfoField label={t('account.agrement')} value={company.agrement} />
                  <InfoField label={t('account.address')} value={company.adresse} />
                  <InfoField label={t('account.wilaya')} value={company.wilayaArabic || company.wilaya} />
                  <InfoField label={t('account.subwilaya')} value={company.subwilaya} />
                  <InfoField label={t('account.phone1')} value={company.phone1} />
                  <InfoField label={t('account.phone2')} value={company.phone2} />
                  <InfoField label={t('account.email')} value={company.email} />
                  <InfoField label={t('account.cardAgrement')} value={company.cardAgriment} />
                  <InfoField label={t('account.cardYear')} value={company.cardAnnee} />
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Account;
