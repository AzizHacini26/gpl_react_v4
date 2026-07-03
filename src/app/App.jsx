import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import SidebarLayout from '../layouts/SidebarLayout';
import { appRoutes } from '../app/appRoutes';
import Login from '../pages/Login';
import Denied from '../pages/Denied';
import { AuthProvider, useAuth } from '../context/AuthContext';

function RequireAuth() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function GuestOnly() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function ProtectedLayout() {
  return <SidebarLayout />;
}

function RequirePermission({ permission, children }) {
  const { hasPermission } = useAuth();
  if (!hasPermission(permission)) {
    return <Navigate to="/denied" replace />;
  }
  return children;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route path="/" element={<ProtectedLayout />}>
          {appRoutes.map((route) => {
            const childPath = route.path === '/' ? '' : route.path.slice(1);
            return (
              <Route
                key={route.path}
                path={childPath}
                element={(
                  <RequirePermission permission={route.requiredPermission}>
                    {route.element}
                  </RequirePermission>
                )}
              />
            );
          })}
          <Route path="denied" element={<Denied />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
