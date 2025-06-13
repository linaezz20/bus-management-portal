import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import './LoginPage.css';
import { Link } from 'react-router-dom';
import TwoFactorAuth from './TwoFactorAuth';

const API_URL = process.env.REACT_APP_API_URL || 'https://nfc-application-latest-4.onrender.com';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [requiresPasswordReset, setRequiresPasswordReset] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setRequiresPasswordReset(false);
    setResetEmailSent(false);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 401 && errorData.requiresPasswordReset) {
          setRequiresPasswordReset(true);
          return;
        }

        throw new Error(errorData.message || 'Email ou mot de passe incorrect');
      }

      const data = await response.json();

      if (data.requires2FA) {
        setRequires2FA(true);
        return;
      }

      // Handle successful login
      const userInfo = {
        name: data.name,
        email: data.email,
        segment: data.segment
      };

      localStorage.setItem('authToken', data.token || 'dummy-token');
      localStorage.setItem('userRole', data.role);
      if (data.segment) {
        localStorage.setItem('userSegment', data.segment);
      }
      localStorage.setItem('userInfo', JSON.stringify(userInfo));

      onLogin(data.role, data.segment, userInfo);

      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });

    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || 'Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async (email, code) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Code de vérification incorrect');
      }

      const userInfo = {
        name: data.name,
        email: data.email,
        segment: data.segment
      };

      localStorage.setItem('authToken', data.token || 'dummy-token');
      localStorage.setItem('userRole', data.role);
      if (data.segment) {
        localStorage.setItem('userSegment', data.segment);
      }
      localStorage.setItem('userInfo', JSON.stringify(userInfo));

      onLogin(data.role, data.segment, userInfo);

      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      throw err;
    }
  };

  const handleSendResetLink = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error("Échec de l'envoi du lien de réinitialisation");
      }

      setResetEmailSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (requires2FA) {
    return (
      <TwoFactorAuth
        email={email}
        onBack={() => setRequires2FA(false)}
        onVerify={handleVerify2FA}
      />
    );
  }

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Connexion</h2>

        {error && <div className="error-message">{error}</div>}

        {requiresPasswordReset && (
          <div className="password-reset-message">
            <p>Vous devez définir votre mot de passe avant de pouvoir vous connecter.</p>
            {resetEmailSent ? (
              <div className="reset-link-message">
                Un lien de réinitialisation a été envoyé à votre adresse email.
              </div>
            ) : (
              <button
                type="button"
                className="send-reset-link"
                onClick={handleSendResetLink}
                disabled={isLoading}
              >
                {isLoading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
              </button>
            )}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="manelchikha67@gmail.com"
          />
        </div>

        <div className="form-group password-group">
          <label htmlFor="password">Mot de passe:</label>
          <div className="password-input-container">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          <div className="forgot-password-link">
            <Link to="/forgot-password">Mot de passe oublié ?</Link>
          </div>
        </div>

        <button
          type="submit"
          className="login-button"
          disabled={isLoading || requiresPasswordReset}
        >
          {isLoading ? 'Connexion en cours...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
