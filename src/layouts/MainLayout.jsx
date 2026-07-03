import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import { useTranslation } from 'react-i18next';
import '../assets/styles/layout.css';
import flagIcon from '../assets/images/f.png';
import iIcon from '../assets/images/i.png';
import reactI from '../assets/images/GPL.png';
import { appRoutes } from '../app/appRoutes';
import { useAuth } from '../hooks/useAuth';

const ROUTE_TRANSLATION_KEYS = {
  '/': 'routes.home',
  '/users': 'routes.users',
  '/clients': 'routes.clients',
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

function MainLayout() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const languageMenuRef = useRef(null);
  const [productYear, setProductYear] = useState(() => localStorage.getItem('productYear'));
  const accountRoute = appRoutes.find((route) => route.path === '/account');
  const logoutRoute = appRoutes.find((route) => route.path === '/logout');
  const menuRoutes = appRoutes.filter(
    (route) => route.path !== '/account'
      && route.path !== '/logout'
      && hasPermission(route.requiredPermission),
  );

  const navLinkStyle = ({ isActive }) => ({
    textDecoration: 'none',
    color: isActive ? '#ffffff' : 'var(--color-text)',
    background: isActive ? 'var(--color-primary-600)' : 'transparent',
    borderRadius: 'var(--radius-sm)',
    padding: '6px 12px',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background var(--transition-fast), color var(--transition-fast)',
  });

  const getRouteLabel = (route) => t(ROUTE_TRANSLATION_KEYS[route.path] || route.label);

  const items = menuRoutes.map((route) => ({
    label: getRouteLabel(route),
    icon: route.icon,
    to: route.path,
    template: (item) => (
      <NavLink to={item.to} end={item.to === '/'} style={navLinkStyle}>
        {item.icon && <span className={item.icon} aria-hidden="true" />}
        <span>{item.label}</span>
      </NavLink>
    ),
  }));

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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const endNav = (
    <div className="main-nav-end">
      <Menu model={languageItems} popup ref={languageMenuRef} />
      <Button
        type="button"
        icon="pi pi-language"
        className="language-button"
        text
        rounded
        aria-label={t('app.language')}
        tooltip={t('app.language')}
        tooltipOptions={{ position: 'bottom' }}
        onClick={(event) => languageMenuRef.current?.toggle(event)}
      />
      {accountRoute ? (
        <NavLink to={accountRoute.path} style={navLinkStyle} onClick={() => setMobileMenuOpen(false)}>
          {accountRoute.icon && <span className={accountRoute.icon} aria-hidden="true" />}
          <span>{getRouteLabel(accountRoute)}</span>
        </NavLink>
      ) : null}
      {logoutRoute ? (
        <NavLink
          to={logoutRoute.path}
          style={(state) => ({
            ...navLinkStyle(state),
            width: '2.5rem',
            height: '2.5rem',
            justifyContent: 'center',
            padding: 0,
          })}
          onClick={(e) => { onLogoutClick(e); setMobileMenuOpen(false); }}
          aria-label={getRouteLabel(logoutRoute)}
          title={getRouteLabel(logoutRoute)}
        >
          {logoutRoute.icon && <span className={logoutRoute.icon} aria-hidden="true" />}
        </NavLink>
      ) : null}
    </div>
  );

  return (
    <section className="bg">
      <ConfirmDialog group="logoutConfirm" />
      <div className="app-shell">
        <header className="app-header">
          <div className="app-header-top">
            <div className="brand-row">
              <img src={reactI} alt="" className="brand-logo" />
              <h2 className="brand-title">{t('app.title')}</h2>
              {productYear ? (
                <span className="product-year-badge">{productYear}</span>
              ) : null}
            </div>
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              <i className={`pi ${mobileMenuOpen ? 'pi-times' : 'pi-bars'}`} />
            </button>
           </div>

          <div className="app-nav-wrap" style={{ display: mobileMenuOpen ? 'block' : undefined }}>
            <Menubar model={items} end={endNav} />
          </div>
        </header>

        <main className="app-main anim-fade-in">
          <Outlet />
        </main>

        <footer className="app-footer">
          <div style={{ width: '100%' }}>
            <div className="footer-row">
              <div className="footer-copy">
                <h6 style={{ margin: 0 }}>{t('app.developerTeam')}</h6>
                <h6 style={{ margin: 0 }}>{t('app.copyright')}</h6>
              </div>

              <div
                className="footer-icons"
              >
                <img src={flagIcon} alt="flag icon" style={{ width: 16, height: 16 }} />
                <img src={iIcon} alt="info icon" style={{ width: 16, height: 16 }} />
              </div>
            </div>
          </div>
        </footer>
      </div>
    </section>
  );
}

export default MainLayout;
