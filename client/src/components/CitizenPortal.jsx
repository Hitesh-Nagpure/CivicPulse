import React, { useState, useEffect } from 'react';
import { 
  User, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  PlusCircle, 
  ExternalLink, 
  Award, 
  Star,
  Calendar
} from 'lucide-react';

export default function CitizenPortal({ currentUser, onTrackComplaint, onNewComplaint }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.email) {
      fetchUserComplaints(currentUser.email);
    }
  }, [currentUser]);

  const fetchUserComplaints = async (email) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/complaints?citizenEmail=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success) {
        setComplaints(data.complaints);
      }
    } catch (err) {
      console.error('Error fetching citizen complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  return (
    <div>
      {/* Citizen Profile Card */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{currentUser?.name || 'Citizen'}</h2>
              <span className="badge-severity badge-low" style={{ textTransform: 'none' }}>
                {currentUser?.badge || 'Active Citizen 🌱'}
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {currentUser?.email} • {currentUser?.ward || 'General Ward'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Civic Points
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
              ⭐ {currentUser?.civicPoints || resolvedCount * 50}
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={onNewComplaint}
          >
            <PlusCircle size={16} />
            <span>Raise New Complaint</span>
          </button>
        </div>
      </div>

      {/* Previous Complaints Section */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
            My Complaints History ({complaints.length})
          </h3>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {resolvedCount} Resolved of {complaints.length} Total
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
            <div className="pulse-dot" style={{ margin: '0 auto 0.75rem', width: 10, height: 10 }}></div>
            <p>Loading your complaint history...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
            <Clock size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>No complaints lodged yet</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.35rem 0 1rem' }}>
              Report issues in your neighborhood to track resolution and earn civic points.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onNewComplaint}
            >
              <PlusCircle size={15} />
              <span>Report Your First Issue</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {complaints.map((item) => (
              <div
                key={item._id}
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.9rem' }}>
                      #{item.trackingId}
                    </span>
                    <span className={`badge-status badge-status-${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {item.status}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    {item.title}
                  </h4>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>{item.category}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={12} />
                      {item.location?.address?.slice(0, 30)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={12} />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}
                  onClick={() => onTrackComplaint(item.trackingId)}
                >
                  <ExternalLink size={14} />
                  <span>View Live Progress</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
