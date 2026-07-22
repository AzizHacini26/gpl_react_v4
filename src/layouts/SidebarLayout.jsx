import { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Menu } from 'primereact/menu';
import { OverlayPanel } from 'primereact/overlaypanel';
import { useTranslation } from 'react-i18next';
import '../assets/styles/sidebar.css';
import reactI from '../assets/images/GPL.png';
import { appRoutes } from '../app/appRoutes';
import { useAuth } from '../hooks/useAuth';
import { APP_VERSION } from '../utils/version';
import { AuditService } from '../services/AuditService';
import { useTheme } from '../context/ThemeContext';

const ROUTE_TRANSLATION_KEYS = {
  '/': 'routes.home',
  '/users': 'routes.users',
  '/clients': 'routes.clients',
  '/add-client': 'routes.addClient',
  '/ClientsNotSent': 'routes.clientsNotSent',
  '/clientcards': 'routes.clientCards',
  '/account': 'routes.account',
  '/logout': 'routes.logout',
  '/permissions': 'routes.permissions',
  '/roles': 'routes.roles',
  '/companyinfo': 'routes.companyInfo',
  '/multitypes': 'routes.multiTypes',
  '/debts': 'routes.debts',
  '/settings': 'routes.settings',
  '/import-clients': 'routes.importClients',
  '/audit-logs': 'routes.auditLogs',
};

function SidebarLayout() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const languageMenuRef = useRef(null);
  const notifPanelRef = useRef(null);
  const sidebarRef = useRef(null);
  const [productYear, setProductYear] = useState(() => localStorage.getItem('productYear'));
  const [recentLogs, setRecentLogs] = useState([]);
  const [notifLoading, setNotifLoading] = useState(true);

  const loadRecentLogs = useCallback(async () => {
    setNotifLoading(true);
    try {
      const data = await AuditService.getMyLogs();
      setRecentLogs(data.slice(0, 2));
    } catch {
      setRecentLogs([]);
    } finally {
      setNotifLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecentLogs();
  }, [loadRecentLogs]);
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const accountRoute = appRoutes.find((route) => route.path === '/account');
  const logoutRoute = appRoutes.find((route) => route.path === '/logout');
  const menuRoutes = appRoutes.filter(
    (route) => route.path !== '/account'
      && route.path !== '/logout'
      && hasPermission(route.requiredPermission),
  );

  const getRouteLabel = (route) => t(ROUTE_TRANSLATION_KEYS[route.path] || route.label);

  const onLogoutClick = (event) => {
    event.preventDefault();
    confirmDialog({
      group: 'logoutConfirm',
      message: t('auth.confirmLogoutMessage'),
      header: t('auth.confirmLogoutTitle'),
      icon: 'pi pi-sign-out',
      acceptLabel: t('auth.logout'),
      rejectLabel: t('auth.cancel'),
      acceptClassName: 'p-button-danger',
      accept: () => navigate('/logout'),
    });
  };

  const languageOptions = [
    { label: t('language.ar'), value: 'ar' },
    { label: t('language.fr'), value: 'fr' },
  ];

  const languageItems = languageOptions.map((option) => ({
    label: option.label,
    icon: i18n.language === option.value ? 'pi pi-check' : 'pi pi-globe',
    command: () => i18n.changeLanguage(option.value),
  }));

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === 'productYear') {
        setProductYear(event.newValue);
      }
    };

    const handleProductYearChanged = (event) => {
      setProductYear(String(event.detail));
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('productYearChanged', handleProductYearChanged);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('productYearChanged', handleProductYearChanged);
    };
  }, []);

  const isExpanded = collapsed ? hovered : true;

  const navLinkStyle = ({ isActive }) => ({
    textDecoration: 'none',
    color: isActive ? '#ffffff' : 'var(--color-text)',
    background: isActive ? '#0d9488' : 'transparent',
    borderRadius: 'var(--radius-sm)',
    padding: '10px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: isExpanded ? 'flex-start' : 'center',
    gap: '10px',
    transition: 'background var(--transition-fast), color var(--transition-fast)',
  });

  const closeSidebar = () => {
    setMobileOpen(false);
    setHovered(false);
  };

  const sidebarClasses = [
    'sidebar',
    collapsed ? 'sidebar--collapsed' : '',
    mobileOpen ? 'sidebar--mobile-open' : '',
    hovered && collapsed ? 'sidebar--hovered' : '',
  ].filter(Boolean).join(' ');

  return (
    <section className="sidebar-bg">
      <ConfirmDialog group="logoutConfirm" />

      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        ref={sidebarRef}
        className={sidebarClasses}
        onMouseEnter={() => collapsed && setHovered(true)}
        onMouseLeave={() => collapsed && setHovered(false)}
      >
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <img src={reactI} alt="" className="sidebar-logo" />
            {isExpanded && (
              <div className="sidebar-brand-text">
                <h2 className="sidebar-title">{t('app.title')}</h2>
                {productYear ? (
                  <span className="sidebar-year">{productYear}</span>
                ) : null}
              </div>
            )}
          </div>
          <button
            className="sidebar-collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <i className={`pi pi-angle-${collapsed ? 'right' : 'left'}`} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuRoutes.map((route) => (
            <NavLink
              key={route.path}
              to={route.path}
              end={route.path === '/'}
              style={navLinkStyle}
              onClick={closeSidebar}
              title={!isExpanded ? getRouteLabel(route) : undefined}
            >
              {route.icon && <span className={route.icon} aria-hidden="true" />}
              <span className="sidebar-nav-label">{getRouteLabel(route)}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="sidebar-content">
        <header className="sidebar-topbar">
          <button
            className="sidebar-hamburger"
            onClick={() => setMobileOpen(true)}
            aria-label="Open sidebar"
          >
            <i className="pi pi-bars" />
          </button>

          <div className="sidebar-topbar-end">
            <span className="topbar-version">v{APP_VERSION}</span>

            <OverlayPanel ref={notifPanelRef} dismissable showCloseIcon style={{ width: '340px' }}>
              <div style={{ padding: '0.25rem 0' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--color-text)' }}>
                  {t('notifications.title')}
                </div>
                {notifLoading ? (
                  <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    <i className="pi pi-spin pi-spinner" style={{ marginRight: '0.5rem' }} />
                    {t('common.loading')}
                  </div>
                ) : recentLogs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    {t('notifications.empty')}
                  </div>
                ) : (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {recentLogs.map((log) => (
                      <li key={log.id} style={{
                        padding: '0.5rem 0',
                        borderBottom: '1px solid var(--color-border)',
                        fontSize: '0.82rem',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <span style={{
                            background: log.action === 'CREATE' ? '#e8f5e9'
                              : log.action === 'UPDATE' ? '#e3f2fd'
                                : '#fbe9e7',
                            color: log.action === 'CREATE' ? '#2e7d32'
                              : log.action === 'UPDATE' ? '#1565c0'
                                : '#c62828',
                            padding: '1px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontWeight: 700,
                            fontSize: '0.7rem',
                          }}>
                            {log.action}
                          </span>
                          <span style={{ textTransform: 'capitalize', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                            {log.entityType?.replace(/_/g, ' ') || '-'}
                          </span>
                        </div>
                        <div style={{ color: 'var(--color-text)', fontWeight: 500, marginBottom: '0.1rem' }}>
                          {log.description || '-'}
                        </div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>
                          {log.changedAt ? new Date(log.changedAt).toLocaleDateString() + ' ' + new Date(log.changedAt).toLocaleTimeString() : '-'}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                  <Button
                    type="button"
                    label={t('notifications.showMore')}
                    icon="pi pi-history"
                    size="small"
                    outlined
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => {
                      notifPanelRef.current?.hide();
                      navigate('/audit-logs');
                    }}
                  />
                </div>
              </div>
            </OverlayPanel>

            <Button
              type="button"
              icon="pi pi-bell"
              className="topbar-btn p-overlay-badge"
              text
              rounded
              aria-label="Notifications"
              tooltip="Notifications"
              tooltipOptions={{ position: 'bottom' }}
              onClick={(e) => notifPanelRef.current?.toggle(e)}
            >
              {recentLogs.length > 0 && <Badge value={recentLogs.length} severity="danger" />}
            </Button>

            <Menu model={languageItems} popup ref={languageMenuRef} />
            <Button
              type="button"
              icon={theme === 'dark' ? 'pi pi-sun' : 'pi pi-moon'}
              className="topbar-btn"
              text
              rounded
              aria-label="Toggle theme"
              tooltip={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              tooltipOptions={{ position: 'bottom' }}
              onClick={toggleTheme}
            />
            <Button
              type="button"
              icon="pi pi-language"
              className="topbar-btn"
              text
              rounded
              aria-label={t('app.language')}
              tooltip={t('app.language')}
              tooltipOptions={{ position: 'bottom' }}
              onClick={(event) => languageMenuRef.current?.toggle(event)}
            />
            {accountRoute ? (
              <NavLink
                to={accountRoute.path}
                className="topbar-link"
                onClick={closeSidebar}
              >
                {accountRoute.icon && <span className={accountRoute.icon} aria-hidden="true" />}
                <span className="topbar-link-label">{getRouteLabel(accountRoute)}</span>
              </NavLink>
            ) : null}
            {logoutRoute ? (
              <NavLink
                to={logoutRoute.path}
                className="topbar-link"
                onClick={(e) => { onLogoutClick(e); closeSidebar(); }}
                aria-label={getRouteLabel(logoutRoute)}
                title={getRouteLabel(logoutRoute)}
              >
                {logoutRoute.icon && <span className={logoutRoute.icon} aria-hidden="true" />}
                <span className="topbar-link-label">{getRouteLabel(logoutRoute)}</span>
              </NavLink>
            ) : null}
          </div>
        </header>

        <main className="sidebar-main anim-fade-in">
          <Outlet />
        </main>

        <footer className="sidebar-footer-bar">
          <div className="sidebar-footer-row">
            <div className="sidebar-footer-copy">
              <h6 style={{ margin: 0 }}>{t('app.developerTeam')}</h6>
              <h6 style={{ margin: 0 }}>{t('app.copyright')}</h6>
            </div>
          </div>
        </footer>
      </div>
    </section>
  );
}

export default SidebarLayout;
