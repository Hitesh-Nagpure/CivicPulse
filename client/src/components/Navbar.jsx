import React from 'react';
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
  FileText
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, currentUser, onLogout }) {
  return (
    <header className="navbar-container">
      <div className="navbar-content">
        {/* Brand Logo */}
        <div className="brand-logo" onClick={() => setActiveTab('report')}>
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

        {/* Navigation Tabs */}
        <nav className="nav-tabs">
          <button
            id="nav-report-btn"
            className={`nav-tab-btn ${activeTab === 'report' ? 'active' : ''}`}
            onClick={() => setActiveTab('report')}
          >
            <PlusCircle size={15} />
            <span>Report Issue</span>
          </button>

          <button
            id="nav-track-btn"
            className={`nav-tab-btn ${activeTab === 'track' ? 'active' : ''}`}
            onClick={() => setActiveTab('track')}
          >
            <Search size={15} />
            <span>Track</span>
          </button>

          <button
            id="nav-shame-btn"
            className={`nav-tab-btn ${activeTab === 'shame' ? 'active-shame' : ''}`}
            onClick={() => setActiveTab('shame')}
          >
            <AlertTriangle size={15} color={activeTab === 'shame' ? '#b91c1c' : '#dc2626'} />
            <span style={{ color: activeTab === 'shame' ? '#b91c1c' : '#dc2626' }}>Wall of Shame</span>
          </button>

          <button
            id="nav-leaderboard-btn"
            className={`nav-tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            <Trophy size={15} color="#d97706" />
            <span>Leaderboard</span>
          </button>

          {/* Role-specific tabs for authenticated users */}
          {currentUser && currentUser.role === 'citizen' && (
            <button
              id="nav-citizen-portal-btn"
              className={`nav-tab-btn ${activeTab === 'citizen-portal' ? 'active' : ''}`}
              onClick={() => setActiveTab('citizen-portal')}
            >
              <FileText size={15} color="var(--primary)" />
              <span>My Complaints</span>
            </button>
          )}

          {(!currentUser || currentUser.role === 'worker') && (
            <button
              id="nav-worker-btn"
              className={`nav-tab-btn ${activeTab === 'worker' ? 'active' : ''}`}
              onClick={() => setActiveTab('worker')}
            >
              <HardHat size={15} color="#0284c7" />
              <span>Worker Portal</span>
            </button>
          )}

          {(!currentUser || currentUser.role === 'admin') && (
            <button
              id="nav-admin-btn"
              className={`nav-tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              <ShieldCheck size={15} color="#7e22ce" />
              <span>Admin Center</span>
            </button>
          )}
        </nav>

        {/* User Account / Login State */}
        <div className="user-nav-action">
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
              onClick={() => setActiveTab('login')}
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
