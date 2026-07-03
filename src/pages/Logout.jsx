import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Logout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    logout();
    navigate('/login', { replace: true });
  }, [navigate, logout]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#f0f0f0',
          padding: '2em',
          display: 'flex',
          flexDirection: 'column',
          gap: '1em',
          width: '300px',
          borderRadius: '12px',
        }}
      >
        <h3 style={{ margin: 0 }}>Logging out...</h3>
      </div>
    </div>
  );
}

export default Logout;
