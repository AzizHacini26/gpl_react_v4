import { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import reactLogo from '../assets/images/GPL.png';

function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      setError(t('login.required'));
      return;
    }

    setLoading(true);

    try {
      const result = await login(cleanUsername, cleanPassword);
      if (result.success) {
        navigate('/', { replace: true });
        return;
      }
      setError(t(result.error === 'invalidCredentials' ? 'login.invalidCredentials' : 'login.serverError'));
    } catch {
      setError(t('login.serverError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__brand">
          <img src={reactLogo} alt="" width={48} height={48} />
          <h1 className="login-card__title">{t('app.title')}</h1>
          <p className="login-card__subtitle">{t('login.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="field">
            <label htmlFor="username">{t('login.username')}</label>
            <InputText
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('login.usernamePlaceholder')}
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="field">
            <label htmlFor="password">{t('login.password')}</label>
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('login.passwordPlaceholder')}
              disabled={loading}
              feedback={false}
              toggleMask
              inputClassName="w-full"
              autoComplete="current-password"
            />
          </div>

          {error ? <p className="login-error" role="alert">{error}</p> : null}

          <Button
            type="submit"
            label={loading ? t('login.checking') : t('login.submit')}
            icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-sign-in'}
            loading={loading}
            className="w-full"
          />
        </form>
      </div>
    </div>
  );
}

export default Login;
