import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  HardHat, 
  User, 
  KeyRound, 
  Mail, 
  ArrowRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function LoginPage({ onLoginSuccess, onContinueGuest }) {
  const [role, setRole] = useState('citizen'); // 'citizen' | 'worker' | 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Preset demo credentials for quick testing
  const handleQuickDemo = (demoRole) => {
    setRole(demoRole);
    setError('');
    if (demoRole === 'admin') {
      setEmail('admin@city.gov.in');
      setPassword('admin123');
    } else if (demoRole === 'worker') {
      setEmail('rajesh.pwd@city.gov.in');
      setPassword('worker123');
    } else {
      setEmail('aarav.patel@gmail.com');
      setPassword('password123');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please provide email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim(), role }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Authentication failed.');
      }

      // Save user session
      localStorage.setItem('civic_user', JSON.stringify(data.user));
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '460px', margin: '2rem auto' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
            <Building2 size={24} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>Sign In to CivicPulse</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Enter your credentials to access your portal
          </p>
        </div>

        {/* Role Tab Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem', background: 'var(--bg-surface-elevated)', padding: '0.3rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
          <button
            type="button"
            className={`btn ${role === 'citizen' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.2rem' }}
            onClick={() => handleQuickDemo('citizen')}
          >
            <User size={13} />
            <span>Citizen</span>
          </button>

          <button
            type="button"
            className={`btn ${role === 'worker' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.2rem' }}
            onClick={() => handleQuickDemo('worker')}
          >
            <HardHat size={13} />
            <span>Worker</span>
          </button>

          <button
            type="button"
            className={`btn ${role === 'admin' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.2rem' }}
            onClick={() => handleQuickDemo('admin')}
          >
            <ShieldCheck size={13} />
            <span>Admin</span>
          </button>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              <span>{role === 'admin' ? 'Admin Official Email' : role === 'worker' ? 'Staff Email' : 'Citizen Email'}</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder={role === 'admin' ? 'admin@city.gov.in' : role === 'worker' ? 'rajesh.pwd@city.gov.in' : 'your.email@gmail.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" htmlFor="login-password">
              <span>Password</span>
            </label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : `Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
          </button>
        </form>

        {/* Demo Credentials Helper Box */}
        <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', padding: '0.75rem', marginTop: '1.25rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Quick Demo Credentials:
          </div>
          <div>• <strong>Admin:</strong> admin@city.gov.in / admin123</div>
          <div>• <strong>Worker:</strong> rajesh.pwd@city.gov.in / worker123</div>
          <div>• <strong>Citizen:</strong> aarav.patel@gmail.com / password123</div>
        </div>

        {/* Guest Action */}
        <div style={{ textAlign: 'center', marginTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ fontSize: '0.85rem' }}
            onClick={onContinueGuest}
          >
            <span>Continue as Guest Citizen (No login required)</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
