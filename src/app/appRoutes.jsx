import RoleAuditDashboard from '../pages/RoleAuditDashboard';
import Users from '../pages/Users';
import Logout from '../pages/Logout';
import Permissions from '../pages/Permissions';
import Roles from '../pages/Role';
import Account from '../pages/Account';
import MultiTypes from '../pages/MultiTypes';
import Client from '../pages/Client';
import ClientNotSent from '../pages/ClientsNotSent';
import ClientCards from '../pages/ClientCards';
import ClientErp from '../pages/ClientErp';
import CompanyInfo from '../pages/CompanyInfo';
import Settings from '../pages/Settings';
import Debts from '../pages/Debts';
import ImportClients from '../pages/ImportClients';
import AuditLog from '../pages/AuditLog';
export const appRoutes = [
  { path: '/', label: 'Home', icon: 'pi pi-home', element: <RoleAuditDashboard /> },
  { path: '/users', label: 'Users', icon: 'pi pi-users', requiredPermission: 'READ_USERS', element: <Users /> },
  { path: '/clients', label: 'Clients', icon: 'pi pi-id-card',requiredPermission: 'READ_CLIENTS', element: <Client /> },
   { path: '/ClientsNotSent', label: 'Clients Not Sent', icon: 'pi pi-id-card',requiredPermission: 'READ_CLIENTS', element: <ClientNotSent /> },
   {path: '/clientcards', label: 'Client Cards', icon: 'pi pi-id-card',requiredPermission: 'READ_CLIENTS', element: <ClientCards />},
   {path: '/client-erp', label: 'Clients ERP', icon: 'pi pi-database',requiredPermission: 'READ_CLIENTS', element: <ClientErp />},
  { path: '/account', label: 'Account', icon: 'pi pi-user', element: <Account /> },
   { path: '/logout', label: 'Logout', icon: 'pi pi-sign-out', element: <Logout /> },
   {path: '/permissions', label: 'Permissions', icon: 'pi pi-lock',requiredPermission: 'READ_PERMISSIONS', element: <Permissions />},
   {path: '/roles', label: 'Roles', icon: 'pi pi-briefcase', requiredPermission: 'READ_ROLES',element: <Roles />},
{path: '/companyinfo', label: 'Company Info', icon: 'pi pi-building',requiredPermission: 'READ_COMPANYINFO', element: <CompanyInfo />},
    {path: '/multitypes', label: 'Multi Types', icon: 'pi pi-tags',requiredPermission: 'READ_TYPES',    element: <MultiTypes />},
    {path: '/debts', label: 'Debts', icon: 'pi pi-wallet', requiredPermission: 'READ_DEBT', element: <Debts />},
    {path: '/settings', label: 'Settings', icon: 'pi pi-cog',requiredPermission: 'READ_PARAMETERS',  element: <Settings />},
    {path: '/import-clients', label: 'Import Clients', icon: 'pi pi-upload', requiredPermission: 'READ_CLIENTS', element: <ImportClients />},
    {path: '/audit-logs', label: 'Audit Logs', icon: 'pi pi-history', requiredPermission: 'READ_AUDIT_LOGS', element: <AuditLog />},
];
