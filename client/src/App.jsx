import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ReportComplaint from './components/ReportComplaint';
import TrackComplaint from './components/TrackComplaint';
import WallOfShame from './components/WallOfShame';
import CivicLeaderboard from './components/CivicLeaderboard';
import WorkerPortal from './components/WorkerPortal';
import AdminDashboard from './components/AdminDashboard';
import LoginPage from './components/LoginPage';
import CitizenPortal from './components/CitizenPortal';

export default function App() {
  const [activeTab, setActiveTab] = useState('report');
  const [activeTrackingId, setActiveTrackingId] = useState('');
  
  // Current authenticated user (loaded from localStorage if exists)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('civic_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Role protection: If non-logged in user clicks on worker or admin, show login
  const handleTabChange = (tab) => {
    if ((tab === 'worker' || tab === 'admin') && !currentUser) {
      setActiveTab('login');
      return;
    }
    setActiveTab(tab);
  };

  // Login success handler: routes directly to user's dedicated portal
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setActiveTab('admin');
    } else if (user.role === 'worker') {
      setActiveTab('worker');
    } else {
      setActiveTab('citizen-portal');
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('civic_user');
    setCurrentUser(null);
    setActiveTab('report');
  };

  // Direct track request handler
  const handleTrackRequest = (trackingId) => {
    setActiveTrackingId(trackingId);
    setActiveTab('track');
  };

  return (
    <div className="app-container">
      {/* Light Theme Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="main-wrapper">
        {/* Tab 1: Report Complaint (Guest / No Login Needed) */}
        {activeTab === 'report' && (
          <ReportComplaint
            currentUser={currentUser}
            onComplaintCreated={(comp) => {
              setActiveTrackingId(comp.trackingId);
            }}
            onTrackRequest={handleTrackRequest}
          />
        )}

        {/* Tab 2: Track Complaint */}
        {activeTab === 'track' && (
          <TrackComplaint initialTrackingId={activeTrackingId} />
        )}

        {/* Tab 3: Wall of Shame */}
        {activeTab === 'shame' && (
          <WallOfShame onTrackComplaint={handleTrackRequest} />
        )}

        {/* Tab 4: Civic Leaderboard */}
        {activeTab === 'leaderboard' && (
          <CivicLeaderboard />
        )}

        {/* Tab 5: Citizen Portal (My Complaints) */}
        {activeTab === 'citizen-portal' && (
          <CitizenPortal
            currentUser={currentUser}
            onTrackComplaint={handleTrackRequest}
            onNewComplaint={() => setActiveTab('report')}
          />
        )}

        {/* Tab 6: Worker Portal */}
        {activeTab === 'worker' && (
          <WorkerPortal
            currentUser={currentUser}
            onTrackComplaint={handleTrackRequest}
          />
        )}

        {/* Tab 7: Admin Command Center */}
        {activeTab === 'admin' && (
          <AdminDashboard onTrackComplaint={handleTrackRequest} />
        )}

        {/* Tab 8: Login Page */}
        {activeTab === 'login' && (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onContinueGuest={() => setActiveTab('report')}
          />
        )}
      </main>

      {/* Clean Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', background: '#ffffff', padding: '1.5rem', marginTop: 'auto', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <strong>CivicPulse</strong> — Urban Grievance Management System
          </div>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <span>Automatic AI Priority Classification</span>
            <span>Reverse Geocoded Location</span>
            <span>Public Wall of Shame</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
