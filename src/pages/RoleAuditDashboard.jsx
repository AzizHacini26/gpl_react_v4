import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { useTranslation } from 'react-i18next';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import StatePanel from '../components/ui/StatePanel';
import { DashboardService } from '../services/DashboardService';
import { formatDZD } from '../utils/currency';
import { dateFormatFR } from '../utils/helpers';
import { useAuth } from '../hooks/useAuth';

const PERMISSION_ROUTES = [
  { to: '/clients', icon: 'pi pi-id-card', labelKey: 'routes.clients', permission: 'READ_CLIENTS' },
  { to: '/ClientsNotSent', icon: 'pi pi-send', labelKey: 'routes.clientsNotSent', permission: 'READ_CLIENTS' },
  { to: '/clientcards', icon: 'pi pi-id-card', labelKey: 'routes.clientCards', permission: 'READ_CLIENTS' },
  { to: '/debts', icon: 'pi pi-wallet', labelKey: 'routes.debts', permission: 'READ_DEBT' },
  { to: '/users', icon: 'pi pi-users', labelKey: 'routes.users', permission: 'READ_USERS' },
  { to: '/permissions', icon: 'pi pi-lock', labelKey: 'routes.permissions', permission: 'READ_PERMISSIONS' },
  { to: '/roles', icon: 'pi pi-briefcase', labelKey: 'routes.roles', permission: 'READ_ROLES' },
  { to: '/multitypes', icon: 'pi pi-tags', labelKey: 'routes.multiTypes', permission: 'READ_TYPES' },
  { to: '/companyinfo', icon: 'pi pi-building', labelKey: 'routes.companyInfo', permission: 'READ_COMPANYINFO' },
  { to: '/settings', icon: 'pi pi-cog', labelKey: 'routes.settings', permission: 'READ_PARAMETERS' },
  { to: '/import-clients', icon: 'pi pi-upload', labelKey: 'routes.importClients', permission: 'READ_CLIENTS' },
];

function MonthlyBarChart({ data, incomeLabel, debtLabel }) {
  const maxValue = useMemo(() => {
    const values = data.flatMap((item) => [item.income, item.debt]);
    return Math.max(...values, 1);
  }, [data]);

  return (
    <div>
      <div className="bar-chart" role="img" aria-label="Monthly income and debt chart">
        {data.map((item) => (
          <div key={item.label} className="bar-chart__item">
            <div className="bar-chart__bars">
              <div
                className="bar-chart__bar bar-chart__bar--income"
                style={{ height: `${(item.income / maxValue) * 100}%` }}
                title={`${incomeLabel}: ${formatDZD(item.income)}`}
              />
              <div
                className="bar-chart__bar bar-chart__bar--debt"
                style={{ height: `${(item.debt / maxValue) * 100}%` }}
                title={`${debtLabel}: ${formatDZD(item.debt)}`}
              />
            </div>
            <span className="bar-chart__label">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="bar-chart__legend">
        <span className="legend-item">
          <span className="legend-item__dot" style={{ background: 'var(--color-success)' }} />
          {incomeLabel}
        </span>
        <span className="legend-item">
          <span className="legend-item__dot" style={{ background: 'var(--color-danger)' }} />
          {debtLabel}
        </span>
      </div>
    </div>
  );
}

function DebtDonutChart({ debt, payment, debtLabel, paymentLabel, totalLabel }) {
  const total = debt + payment || 1;
  const paymentPercent = Math.round((payment / total) * 100);
  const debtPercent = 100 - paymentPercent;

  return (
    <div className="donut-chart">
      <div
        className="donut-chart__ring"
        style={{
          background: `conic-gradient(var(--color-success) 0% ${paymentPercent}%, var(--color-danger) ${paymentPercent}% 100%)`,
        }}
      >
        <div className="donut-chart__center">
          <span className="donut-chart__center-value">{formatDZD(total)}</span>
          <span className="donut-chart__center-label">{totalLabel}</span>
        </div>
      </div>
      <div className="donut-chart__legend">
        <div className="donut-legend-item">
          <span className="donut-legend-item__label">
            <span className="legend-item__dot" style={{ background: 'var(--color-success)' }} />
            {paymentLabel}
          </span>
          <strong>{formatDZD(payment)} ({paymentPercent}%)</strong>
        </div>
        <div className="donut-legend-item">
          <span className="donut-legend-item__label">
            <span className="legend-item__dot" style={{ background: 'var(--color-danger)' }} />
            {debtLabel}
          </span>
          <strong>{formatDZD(debt)} ({debtPercent}%)</strong>
        </div>
      </div>
    </div>
  );
}

function RoleBadge({ name, permissions }) {
  return (
    <div className="ui-card">
      <div className="ui-card__body" style={{ padding: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
          <div style={{
            width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-full)',
            background: 'var(--color-primary-50)', color: 'var(--color-primary-600)',
            display: 'grid', placeItems: 'center', fontSize: '1.15rem',
          }}>
            <i className="pi pi-shield" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>{name || 'Unknown Role'}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              {permissions?.length || 0} {permissions?.length === 1 ? 'permission' : 'permissions'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          {permissions?.map((perm) => (
            <span key={perm} className="status-badge status-badge--neutral" style={{ fontSize: '0.7rem' }}>
              {perm}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RoleAuditDashboard() {
  const { t } = useTranslation();
  const tOrDefault = (key, defaultValue) => t(key, { defaultValue });
  const { user, hasPermission } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userRole = user?.role ?? null;
  const userPermissions = user?.permissions ?? [];

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await DashboardService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError(t('dashboard.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const availableRoutes = useMemo(
    () => PERMISSION_ROUTES.filter((r) => hasPermission(r.permission)),
    [hasPermission],
  );

  const roleDisplayName = useMemo(() => {
    if (!userRole) return '-';
    if (typeof userRole === 'string') return userRole;
    if (userRole?.nom) return userRole.nom;
    if (userRole?.name) return userRole.name;
    return String(userRole);
  }, [userRole]);

  if (loading) {
    return (
      <div className="page-container">
        <StatePanel
          variant="loading"
          title={t('dashboard.loading')}
          message={t('dashboard.loadingMessage')}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <StatePanel
          variant="error"
          title={t('dashboard.errorTitle')}
          message={error}
          icon="pi pi-exclamation-triangle"
          onRetry={loadStats}
          retryLabel={t('dashboard.retry')}
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        title={t('dashboard.title')}
        subtitle={t('dashboard.subtitle')}
        actions={(
          <Button
            type="button"
            icon="pi pi-refresh"
            label={t('dashboard.refresh')}
            onClick={loadStats}
            outlined
          />
        )}
      />

      <section className="stats-grid" aria-label={t('dashboard.kpiSection')}>
        <StatCard
          label={t('dashboard.totalRevenue')}
          value={formatDZD(stats.totalRevenue)}
          meta={t('dashboard.totalRevenueMeta', { count: stats.paymentsCount })}
          icon="pi pi-chart-line"
          variant="success"
        />
        <StatCard
          label={t('dashboard.totalClients')}
          value={stats.totalClients}
          meta={t('dashboard.totalClientsMeta', { active: stats.activeClients })}
          icon="pi pi-users"
          variant="info"
        />
        <StatCard
          label={t('dashboard.pendingDebts')}
          value={formatDZD(stats.totalDebt)}
          meta={t('dashboard.pendingDebtsMeta', { count: stats.pendingDebtsCount })}
          icon="pi pi-exclamation-circle"
          variant="danger"
        />
        <StatCard
          label={t('dashboard.monthlyIncome')}
          value={formatDZD(stats.monthlyIncome)}
          meta={t('dashboard.monthlyIncomeMeta')}
          icon="pi pi-calendar"
          variant="success"
        />
        <StatCard
          label={t('dashboard.activeRentals')}
          value={stats.activeClients}
          meta={t('dashboard.activeRentalsMeta', { inactive: stats.inactiveClients })}
          icon="pi pi-check-circle"
          variant="info"
        />
        <StatCard
          label={t('dashboard.expiringSoon')}
          value={stats.expiringSoon}
          meta={t('dashboard.expiringSoonMeta', { expired: stats.expiredVerifications })}
          icon="pi pi-clock"
          variant="warning"
        />
      </section>

      <section className="dashboard-grid">
        <div className="ui-card">
          <div className="ui-card__body dashboard-panel">
            <div className="dashboard-panel__header">
              <div>
                <h2 className="dashboard-panel__title">{t('dashboard.monthlyChart')}</h2>
                <p className="dashboard-panel__subtitle">{t('dashboard.monthlyChartSubtitle')}</p>
              </div>
            </div>
            <MonthlyBarChart
              data={stats.monthlyData}
              incomeLabel={t('dashboard.income')}
              debtLabel={t('dashboard.debt')}
            />
          </div>
        </div>

        <div className="ui-card">
          <div className="ui-card__body dashboard-panel">
            <div className="dashboard-panel__header">
              <div>
                <h2 className="dashboard-panel__title">{t('dashboard.debtOverview')}</h2>
                <p className="dashboard-panel__subtitle">{t('dashboard.debtOverviewSubtitle')}</p>
              </div>
            </div>
            <DebtDonutChart
              debt={stats.debtVsPayment.debt}
              payment={stats.debtVsPayment.payment}
              debtLabel={t('dashboard.outstandingDebt')}
              paymentLabel={t('dashboard.collectedPayments')}
              totalLabel={t('dashboard.totalVolume')}
            />
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="ui-card">
          <div className="ui-card__body dashboard-panel">
            <div className="dashboard-panel__header">
              <div>
                <h2 className="dashboard-panel__title">{t('dashboard.recentActivities')}</h2>
                <p className="dashboard-panel__subtitle">{t('dashboard.recentActivitiesSubtitle')}</p>
              </div>
            </div>
            {stats.recentActivities.length === 0 ? (
              <StatePanel
                variant="empty"
                title={t('dashboard.noActivities')}
                message={t('dashboard.noActivitiesMessage')}
                icon="pi pi-inbox"
              />
            ) : (
              <ul className="activity-list">
                {stats.recentActivities.map((activity) => (
                  <li key={activity.id} className="activity-item">
                    <span className={`activity-item__icon activity-item__icon--${activity.type}`} aria-hidden="true">
                      <i className={
                        activity.type === 'payment' ? 'pi pi-check'
                          : activity.type === 'debt' ? 'pi pi-exclamation-triangle'
                            : 'pi pi-user'
                      } />
                    </span>
                    <div className="activity-item__content">
                      <p className="activity-item__title">{activity.title}</p>
                      <p className="activity-item__subtitle">
                        {activity.subtitle}
                        {activity.date ? ` · ${dateFormatFR(activity.date)}` : ''}
                      </p>
                    </div>
                    <span className="activity-item__amount">{formatDZD(activity.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="ui-card">
          <div className="ui-card__body dashboard-panel">
            <div className="dashboard-panel__header">
              <div>
                <h2 className="dashboard-panel__title">{t('dashboard.quickActions')}</h2>
                <p className="dashboard-panel__subtitle">{t('dashboard.quickActionsSubtitle')}</p>
              </div>
            </div>
            <div className="quick-actions">
              {availableRoutes.map((action) => (
                <Link key={action.to} to={action.to} className="quick-action-btn">
                  <i className={action.icon} aria-hidden="true" />
                  <span>{tOrDefault(action.labelKey, action.to.replace('/', ''))}</span>
                </Link>
              ))}
            </div>
            {stats.clientsNotSent > 0 && (
              <div className="stats-grid" style={{ marginTop: 'var(--space-2)' }}>
                <StatCard
                  label={t('dashboard.clientsNotSent')}
                  value={stats.clientsNotSent}
                  icon="pi pi-send"
                  variant="warning"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      
    </div>
  );
}
