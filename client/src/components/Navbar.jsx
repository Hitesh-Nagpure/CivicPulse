import React, { useState } from 'react';
import { 
  Building2, 
  AlertTriangle, 
  Trophy, 
  HardHat, 
  ShieldCheck, 
  Search, 
  PlusCircle, 
  LogIn, 
  LogOut, 
  User, 
  FileText,
  Menu,
  X
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, currentUser, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar-container">
      <div className="navbar-content">
        {/* Brand Logo */}
        <div className="brand-logo" onClick={() => handleNavClick('report')}>
          <div className="brand-icon-wrap">
            <Building2 size={22} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>CivicPulse</span>
              <span className="pulse-dot" title="System Active"></span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>
              URBAN MANAGEMENT
            </div>
          </div>
        </div>

        {/* Mobile Toggle Button */}
        <div className="mobile-nav-toggle">
          <button
            type="button"
            className="btn btn-secondary mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation Tabs (Desktop & Responsive Mobile Drawer) */}
        <nav className={`nav-tabs ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <button
            id="nav-report-btn"
            className={`nav-tab-btn ${activeTab === 'report' ? 'active' : ''}`}
            onClick={() => handleNavClick('report')}
          >
            <PlusCircle size={16} />
            <span>Report Issue</span>
          </button>

          <button
            id="nav-track-btn"
            className={`nav-tab-btn ${activeTab === 'track' ? 'active' : ''}`}
            onClick={() => handleNavClick('track')}
          >
            <Search size={16} />
            <span>Track</span>
          </button>

          <button
            id="nav-shame-btn"
            className={`nav-tab-btn nav-tab-shame ${activeTab === 'shame' ? 'active-shame' : ''}`}
            onClick={() => handleNavClick('shame')}
          >
            <AlertTriangle size={16} color="#dc2626" />
            <span className="shame-nav-label">Wall of Shame</span>
            <span className="shame-nav-badge">ALERT</span>
          </button>

          <button
            id="nav-leaderboard-btn"
            className={`nav-tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => handleNavClick('leaderboard')}
          >
            <Trophy size={16} color="#d97706" />
            <span>Leaderboard</span>
          </button>

          {/* Role-specific tabs for authenticated users */}
          {currentUser && currentUser.role === 'citizen' && (
            <button
              id="nav-citizen-portal-btn"
              className={`nav-tab-btn ${activeTab === 'citizen-portal' ? 'active' : ''}`}
              onClick={() => handleNavClick('citizen-portal')}
            >
              <FileText size={16} color="var(--primary)" />
              <span>My Complaints</span>
            </button>
          )}

          {(!currentUser || currentUser.role === 'worker') && (
            <button
              id="nav-worker-btn"
              className={`nav-tab-btn ${activeTab === 'worker' ? 'active' : ''}`}
              onClick={() => handleNavClick('worker')}
            >
              <HardHat size={16} color="#0284c7" />
              <span>Worker Portal</span>
            </button>
          )}

          {(!currentUser || currentUser.role === 'admin') && (
            <button
              id="nav-admin-btn"
              className={`nav-tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => handleNavClick('admin')}
            >
              <ShieldCheck size={16} color="#7e22ce" />
              <span>Admin Center</span>
            </button>
          )}

          {/* In mobile drawer: show login/profile inside drawer too */}
          <div className="mobile-user-row">
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div className="user-badge">
                  <span className={`user-badge-role role-${currentUser.role}`}>
                    {currentUser.role}
                  </span>
                  <span>{currentUser.name}</span>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                  onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                className={`btn ${activeTab === 'login' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem' }}
                onClick={() => handleNavClick('login')}
              >
                <LogIn size={15} />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>
        </nav>

        {/* Desktop User Account / Login State */}
        <div className="user-nav-action desktop-user-nav">
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div className="user-badge">
                <span className={`user-badge-role role-${currentUser.role}`}>
                  {currentUser.role}
                </span>
                <span>{currentUser.name}</span>
              </div>
              <button
                id="logout-btn"
                type="button"
                className="btn btn-ghost"
                style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                onClick={onLogout}
                title="Log out"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button
              id="nav-login-btn"
              type="button"
              className={`btn ${activeTab === 'login' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
              onClick={() => handleNavClick('login')}
            >
              <LogIn size={14} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
