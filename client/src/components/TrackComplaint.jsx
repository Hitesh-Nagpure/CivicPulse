import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Clock, 
  MapPin, 
  User, 
  HardHat, 
  ShieldCheck, 
  CheckCircle, 
  AlertCircle, 
  Flame, 
  FileText, 
  Calendar,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Camera
} from 'lucide-react';

export default function TrackComplaint({ initialTrackingId }) {
  const [searchCode, setSearchCode] = useState(initialTrackingId || '');
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentComplaints, setRecentComplaints] = useState([]);

  // Load recent complaints from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('my_complaints') || '[]');
      setRecentComplaints(stored);
    } catch (e) {}
  }, []);

  // Auto-search if initialTrackingId is passed
  useEffect(() => {
    if (initialTrackingId) {
      setSearchCode(initialTrackingId);
      fetchComplaint(initialTrackingId);
    }
  }, [initialTrackingId]);

  const fetchComplaint = async (code) => {
    const target = (code || searchCode).trim();
    if (!target) return;

    setLoading(true);
    setError('');
    setComplaint(null);

    try {
      const res = await fetch(`/api/complaints/${encodeURIComponent(target)}`);
      const data = await res.json();
      if (!res.ok || !data.complaint) {
        throw new Error(data.message || 'No complaint found with this Tracking ID.');
      }
      setComplaint(data.complaint);
    } catch (err) {
      setError(err.message || 'Error tracking complaint.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaint();
  };

  // Helper for Stepper State
  const getStepStatus = (stepName) => {
    if (!complaint) return 'upcoming';

    const order = ['Submitted', 'Approved', 'Assigned', 'In Progress', 'Under Review', 'Resolved'];
    const currentIdx = order.indexOf(complaint.status);
    const stepIdx = order.indexOf(stepName);

    if (complaint.status === 'Rejected' && stepName === 'Under Review') {
      return 'rejected';
    }

    if (currentIdx > stepIdx) return 'completed';
    if (currentIdx === stepIdx) return 'active';
    return 'upcoming';
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-hero">
        <h1 className="page-hero-title">Track Complaint Status</h1>
        <p className="page-hero-desc">
          Live transparency into municipal action. Enter your Tracking ID to view the full resolution 
          timeline, assigned worker details, and before/after verification evidence.
        </p>
      </div>

      {/* Search Bar */}
      <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
            <Search 
              size={18} 
              color="var(--text-muted)" 
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} 
            />
            <input
              id="track-search-input"
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.8rem' }}
              placeholder="Enter Tracking ID (e.g. CP-2026-SH492)"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              required
            />
          </div>
          <button
            id="track-submit-btn"
            type="submit"
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.75rem' }}
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search Status'}
          </button>
        </form>

        {/* Recent Device Complaints Chips */}
        {recentComplaints.length > 0 && (
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Recent on this device:
            </span>
            {recentComplaints.map((item) => (
              <button
                key={item.trackingId}
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)' }}
                onClick={() => {
                  setSearchCode(item.trackingId);
                  fetchComplaint(item.trackingId);
                }}
              >
                {item.trackingId} ({item.title?.slice(0, 18)}...)
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderColor: '#ef4444', marginBottom: '2rem' }}>
          <AlertCircle size={32} color="#ef4444" style={{ margin: '0 auto 0.5rem' }} />
          <h3 style={{ color: '#f87171', fontSize: '1.1rem', marginBottom: '0.35rem' }}>Complaint Not Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{error}</p>
          <div style={{ marginTop: '1rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Try sample seeded tracking codes: </span>
            <button
              className="btn btn-ghost"
              style={{ fontSize: '0.8rem', textDecoration: 'underline' }}
              onClick={() => {
                setSearchCode('CP-2026-SH492');
                fetchComplaint('CP-2026-SH492');
              }}
            >
              CP-2026-SH492 (Wall of Shame)
            </button>
            {' | '}
            <button
              className="btn btn-ghost"
              style={{ fontSize: '0.8rem', textDecoration: 'underline' }}
              onClick={() => {
                setSearchCode('CP-2026-RV519');
                fetchComplaint('CP-2026-RV519');
              }}
            >
              CP-2026-RV519 (Under Review)
            </button>
            {' | '}
            <button
              className="btn btn-ghost"
              style={{ fontSize: '0.8rem', textDecoration: 'underline' }}
              onClick={() => {
                setSearchCode('CP-2026-RS101');
                fetchComplaint('CP-2026-RS101');
              }}
            >
              CP-2026-RS101 (Resolved)
            </button>
          </div>
        </div>
      )}

      {/* Main Complaint Tracker Card */}
      {complaint && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          {/* Header Bar */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--accent-cyan)' }}>
                  #{complaint.trackingId}
                </span>
                <span className={`badge-status badge-status-${complaint.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  {complaint.status}
                </span>
                <span className={`badge-severity badge-${complaint.aiSeverity?.level?.toLowerCase()}`}>
                  {complaint.aiSeverity?.level} (Score {complaint.aiSeverity?.score}/10)
                </span>
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                {complaint.title}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={14} />
                  Reported: {new Date(complaint.createdAt).toLocaleDateString()} ({complaint.daysOpen || 0} days ago)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={14} />
                  {complaint.location?.address} ({complaint.location?.ward})
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <User size={14} />
                  By: {complaint.citizen?.name} {complaint.citizen?.isGuest ? '(Guest)' : ''}
                </span>
              </div>
            </div>

            {/* Wall of Shame notice if flagged */}
            {complaint.wallOfShame?.isFlagged && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Flame size={20} color="#ef4444" />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f87171' }}>
                    LISTED ON WALL OF SHAME
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Overdue beyond SLA with {complaint.wallOfShame?.shameUpvotes || 0} public upvotes
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid-2">
            {/* Left: Interactive Progress Timeline */}
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} color="var(--primary)" />
                Resolution Progress Timeline
              </h3>

              <div className="timeline-track">
                {/* Step 1: Lodged */}
                <div className={`timeline-step ${getStepStatus('Submitted')}`}>
                  <div className="timeline-marker"></div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    Complaint Lodged
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Grievance registered. Free AI model evaluated severity as <strong>{complaint.aiSeverity?.level}</strong> (SLA target: {complaint.aiSeverity?.slaHours} hrs).
                  </div>
                </div>

                {/* Step 2: Approved / Verified */}
                <div className={`timeline-step ${getStepStatus('Approved')}`}>
                  <div className="timeline-marker"></div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    Admin Approved for Municipal Action
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {complaint.status === 'Submitted'
                      ? 'Awaiting review by Municipal Dispatch Officer...'
                      : `Approved for dispatch under ${complaint.aiSeverity?.suggestedDepartment}.`}
                  </div>
                </div>

                {/* Step 3: Worker Assigned or Self-Claimed */}
                <div className={`timeline-step ${getStepStatus('Assigned')}`}>
                  <div className="timeline-marker"></div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <HardHat size={16} />
                    <span>Worker Assigned / Claimed</span>
                    {complaint.assignedWorker?.isSelfClaimed && (
                      <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', borderRadius: 'var(--radius-sm)' }}>
                        Voluntarily Claimed
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {complaint.assignedWorker?.name ? (
                      <div>
                        Staff: <strong>{complaint.assignedWorker.name}</strong> ({complaint.assignedWorker.department})
                        {complaint.assignedWorker.phone && ` • Contact: ${complaint.assignedWorker.phone}`}
                      </div>
                    ) : (
                      'In open unassigned pool awaiting worker pickup or admin direct allocation.'
                    )}
                  </div>
                </div>

                {/* Step 4: In Progress */}
                <div className={`timeline-step ${getStepStatus('In Progress')}`}>
                  <div className="timeline-marker"></div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    Work In Progress
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {['In Progress', 'Under Review', 'Resolved'].includes(complaint.status)
                      ? 'On-site repair team dispatched and actively performing remediation.'
                      : 'Pending on-site deployment.'}
                  </div>
                </div>

                {/* Step 5: Resolution Submitted (Under Review) */}
                <div className={`timeline-step ${getStepStatus('Under Review')}`}>
                  <div className="timeline-marker"></div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Camera size={16} />
                    <span>Resolution Proof Submitted</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {complaint.resolutionProof?.photoUrl ? (
                      <div>
                        Worker uploaded photographic evidence on {new Date(complaint.resolutionProof.submittedAt).toLocaleDateString()}.
                        <br />
                        <em>"{complaint.resolutionProof.notes}"</em>
                      </div>
                    ) : (
                      'Worker has not yet uploaded completion proof.'
                    )}
                  </div>
                </div>

                {/* Step 6: Final Verification (Accepted or Rejected) */}
                <div className={`timeline-step ${getStepStatus('Resolved')}`}>
                  <div className="timeline-marker"></div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ShieldCheck size={16} />
                    <span>Chief Admin Verification</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {complaint.status === 'Resolved' ? (
                      <span style={{ color: '#34d399', fontWeight: 600 }}>
                        ✓ Accepted & Verified by Chief Municipal Officer. Issue closed!
                      </span>
                    ) : complaint.adminReview?.decision === 'Rejected' ? (
                      <span style={{ color: '#f87171', fontWeight: 600 }}>
                        ✕ Work rejected by Admin. Reassigned to worker for rework. Feedback: "{complaint.adminReview.feedback}"
                      </span>
                    ) : (
                      'Awaiting final inspection and sign-off by Municipal Authorities.'
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Before vs After Evidence & Details */}
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Camera size={18} color="var(--accent-cyan)" />
                Visual Verification Evidence
              </h3>

              {/* Before vs After Grid */}
              <div className="comparison-grid">
                {/* Before Media */}
                <div className="comparison-card">
                  <div className="comparison-header" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}>
                    <span>Before (Citizen Report)</span>
                    <span>{complaint.media?.mediaType || 'Media'}</span>
                  </div>
                  {complaint.media?.url ? (
                    complaint.media.mediaType === 'video' ? (
                      <video src={complaint.media.url} controls className="comparison-img" />
                    ) : (
                      <img src={complaint.media.url} alt="Initial Issue" className="comparison-img" />
                    )
                  ) : (
                    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No initial photo uploaded
                    </div>
                  )}
                </div>

                {/* After Media */}
                <div className="comparison-card">
                  <div className="comparison-header" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7' }}>
                    <span>After (Worker Resolution)</span>
                    <span>Proof Photo</span>
                  </div>
                  {complaint.resolutionProof?.photoUrl ? (
                    <img src={complaint.resolutionProof.photoUrl} alt="Resolution Proof" className="comparison-img" />
                  ) : (
                    <div style={{ height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', padding: '1rem', textAlign: 'center' }}>
                      <Clock size={24} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                      <span style={{ fontSize: '0.85rem' }}>Pending Worker Completion Proof</span>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Details Box */}
              <div style={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginTop: '1.25rem', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  <Sparkles size={16} color="#f59e0b" />
                  <span>AI Severity Diagnostic</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                  {complaint.aiSeverity?.reasoning}
                </p>
                {complaint.aiSeverity?.factors && complaint.aiSeverity.factors.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {complaint.aiSeverity.factors.map((f, i) => (
                      <span key={i} style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-sm)' }}>
                        • {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
