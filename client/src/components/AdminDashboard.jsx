import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  UserPlus, 
  Clock, 
  Filter, 
  Search, 
  Eye, 
  AlertTriangle, 
  RefreshCw,
  HardHat,
  X,
  MapPin,
  ExternalLink
} from 'lucide-react';

export default function AdminDashboard({ onTrackComplaint }) {
  const [complaints, setComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [assigningComplaint, setAssigningComplaint] = useState(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');

  const [reviewingComplaint, setReviewingComplaint] = useState(null);
  const [reviewDecision, setReviewDecision] = useState('Accepted');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchComplaints();
    fetchWorkers();
  }, [statusFilter, severityFilter]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (severityFilter !== 'All') params.append('severity', severityFilter);
      if (searchTerm) params.append('search', searchTerm);

      const res = await fetch(`/api/complaints?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setComplaints(data.complaints);
      }
    } catch (err) {
      console.error('Error fetching admin complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkers = async () => {
    try {
      const res = await fetch('/api/workers');
      const data = await res.json();
      if (data.success) {
        setWorkers(data.workers);
        if (data.workers.length > 0) setSelectedWorkerId(data.workers[0]._id);
      }
    } catch (err) {
      console.error('Error fetching workers:', err);
    }
  };

  // 1. Admin Approves Complaint
  const handleApprove = async (id) => {
    try {
      const res = await fetch(`/api/complaints/${id}/approve`, { method: 'PUT' });
      const data = await res.json();
      if (data.success) {
        alert('Complaint approved! Now available for worker assignment or voluntary pickup.');
        fetchComplaints();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // 2. Admin Deletes Complaint
  const handleDelete = async (id, trackingId) => {
    if (!window.confirm(`Are you sure you want to permanently delete complaint #${trackingId}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/complaints/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert(`Complaint #${trackingId} deleted successfully.`);
        fetchComplaints();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // 3. Admin Assigns Complaint to Worker
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assigningComplaint || !selectedWorkerId) return;

    const worker = workers.find((w) => w._id === selectedWorkerId);
    if (!worker) return;

    try {
      const res = await fetch(`/api/complaints/${assigningComplaint._id}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: worker._id,
          workerName: worker.name,
          department: worker.department,
          phone: worker.phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error assigning complaint.');

      alert(`Assigned #${assigningComplaint.trackingId} to ${worker.name}.`);
      setAssigningComplaint(null);
      fetchComplaints();
    } catch (err) {
      alert(err.message);
    }
  };

  // 4. Admin Accepts or Rejects the Worker's Resolution Work
  const handleReviewWorkSubmit = async (e) => {
    e.preventDefault();
    if (!reviewingComplaint) return;

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/complaints/${reviewingComplaint._id}/review-work`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: reviewDecision,
          feedback: reviewFeedback,
          reviewerName: 'Chief Municipal Officer',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error reviewing work.');

      alert(
        reviewDecision === 'Accepted'
          ? 'Work Accepted! Issue marked as Resolved and Citizen credited with 50 Civic Points.'
          : 'Work Rejected. Feedback sent back to worker for rework.'
      );

      setReviewingComplaint(null);
      setReviewFeedback('');
      fetchComplaints();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Reset Demo Data
  const handleResetData = async () => {
    if (!window.confirm('Reset all demo complaints and re-seed clean test data?')) return;
    try {
      const res = await fetch('/api/seed/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert('Database refreshed with initial state!');
        fetchComplaints();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Calculations for Admin Counters
  const submittedCount = complaints.filter((c) => c.status === 'Submitted').length;
  const underReviewCount = complaints.filter((c) => c.status === 'Under Review').length;
  const inProgressCount = complaints.filter((c) => ['Assigned', 'In Progress'].includes(c.status)).length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  return (
    <div>
      {/* Page Hero */}
      <div className="page-hero">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <ShieldCheck size={20} color="#c084fc" />
              <span style={{ fontSize: '0.85rem', color: '#c084fc', fontWeight: 700, textTransform: 'uppercase' }}>
                Command & Control Center
              </span>
            </div>
            <h1 className="page-hero-title">City Administration Portal</h1>
            <p className="page-hero-desc">
              Manage municipal complaints, approve incoming reports, assign workers, inspect completed 
              remediation proof, and formally accept or reject resolution quality.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem' }}
            onClick={handleResetData}
            title="Re-seed clean demo data"
          >
            <RefreshCw size={15} />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Admin Quick Stat Counters */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="stat-value">{submittedCount}</div>
            <div className="stat-label">Pending Approval</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="stat-value" style={{ color: '#d8b4fe' }}>{underReviewCount}</div>
            <div className="stat-label">Under Review (Action Req.)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <HardHat size={24} />
          </div>
          <div>
            <div className="stat-value" style={{ color: '#fbbf24' }}>{inProgressCount}</div>
            <div className="stat-label">Active Field Jobs</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="stat-value" style={{ color: '#34d399' }}>{resolvedCount}</div>
            <div className="stat-label">Verified & Resolved</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <Filter size={15} />
            <span>Filter Status:</span>
          </div>

          <select
            id="admin-status-filter"
            className="form-select"
            style={{ width: 'auto', fontSize: '0.85rem' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted (Needs Approval)</option>
            <option value="Approved">Approved (Open for Worker)</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Under Review">Under Review (Inspect Proof)</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            id="admin-severity-filter"
            className="form-select"
            style={{ width: 'auto', fontSize: '0.85rem' }}
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical (12h SLA)</option>
            <option value="High">High (24h SLA)</option>
            <option value="Medium">Medium (48h SLA)</option>
            <option value="Low">Low (96h SLA)</option>
          </select>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); fetchComplaints(); }} style={{ display: 'flex', gap: '0.5rem', flex: '1', maxWidth: '350px' }}>
          <input
            type="text"
            className="form-input"
            style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}
            placeholder="Search title, ID, address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary" style={{ padding: '0.5rem 0.9rem' }}>
            <Search size={15} />
          </button>
        </form>
      </div>

      {/* Complaints Table */}
      <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '0.75rem 1rem' }}>Tracking ID</th>
              <th style={{ padding: '0.75rem 1rem' }}>Issue & Category</th>
              <th style={{ padding: '0.75rem 1rem' }}>Location / Ward</th>
              <th style={{ padding: '0.75rem 1rem' }}>AI Severity</th>
              <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              <th style={{ padding: '0.75rem 1rem' }}>Worker</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Admin Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                  <div className="pulse-dot" style={{ margin: '0 auto 1rem', width: 12, height: 12 }}></div>
                  <p style={{ color: 'var(--text-secondary)' }}>Loading grievances database...</p>
                </td>
              </tr>
            ) : complaints.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No complaints match the specified criteria.
                </td>
              </tr>
            ) : (
              complaints.map((item) => (
                <tr
                  key={item._id}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    background: item.status === 'Under Review' ? 'rgba(168, 85, 247, 0.05)' : 'transparent',
                  }}
                >
                  {/* Tracking ID */}
                  <td style={{ padding: '1rem', fontWeight: 800, color: 'var(--accent-cyan)', fontSize: '0.9rem' }}>
                    #{item.trackingId}
                  </td>

                  {/* Title & Category */}
                  <td style={{ padding: '1rem', maxWidth: '280px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {item.category} • By {item.citizen?.name}
                    </div>
                  </td>

                  {/* Location */}
                  <td style={{ padding: '1rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={13} color="var(--primary)" />
                      <span>{item.location?.ward}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {item.location?.address?.slice(0, 30)}...
                    </div>
                  </td>

                  {/* AI Severity */}
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge-severity badge-${item.aiSeverity?.level?.toLowerCase()}`}>
                      {item.aiSeverity?.level} ({item.aiSeverity?.score}/10)
                    </span>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge-status badge-status-${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {item.status}
                    </span>
                  </td>

                  {/* Assigned Worker */}
                  <td style={{ padding: '1rem', fontSize: '0.82rem' }}>
                    {item.assignedWorker?.name ? (
                      <div>
                        <div style={{ fontWeight: 600 }}>{item.assignedWorker.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {item.assignedWorker.department.split('&')[0]}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      {/* 1. Approve Button */}
                      {item.status === 'Submitted' && (
                        <button
                          id={`approve-btn-${item.trackingId}`}
                          type="button"
                          className="btn btn-primary"
                          style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                          onClick={() => handleApprove(item._id)}
                          title="Approve for municipal dispatch"
                        >
                          <CheckCircle size={14} />
                          <span>Approve</span>
                        </button>
                      )}

                      {/* 2. Assign to Worker Button */}
                      {['Submitted', 'Approved'].includes(item.status) && (
                        <button
                          id={`assign-btn-${item.trackingId}`}
                          type="button"
                          className="btn btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                          onClick={() => setAssigningComplaint(item)}
                          title="Assign to specific worker"
                        >
                          <UserPlus size={14} />
                          <span>Assign</span>
                        </button>
                      )}

                      {/* 3. Review Completed Work Button (Under Review) */}
                      {item.status === 'Under Review' && (
                        <button
                          id={`review-work-btn-${item.trackingId}`}
                          type="button"
                          className="btn btn-primary"
                          style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}
                          onClick={() => {
                            setReviewingComplaint(item);
                            setReviewDecision('Accepted');
                            setReviewFeedback('');
                          }}
                          title="Inspect before/after resolution proof"
                        >
                          <Eye size={14} />
                          <span>Review Work</span>
                        </button>
                      )}

                      {/* Track Button */}
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ padding: '0.35rem 0.5rem' }}
                        onClick={() => onTrackComplaint(item.trackingId)}
                        title="View Public Tracker"
                      >
                        <ExternalLink size={15} />
                      </button>

                      {/* Delete Button */}
                      <button
                        id={`delete-btn-${item.trackingId}`}
                        type="button"
                        className="btn btn-ghost"
                        style={{ padding: '0.35rem 0.5rem', color: '#f87171' }}
                        onClick={() => handleDelete(item._id, item.trackingId)}
                        title="Delete complaint"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal 1: Assign to Worker */}
      {assigningComplaint && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={22} color="var(--primary)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Assign Grievance to Staff</h3>
              </div>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ padding: '0.3rem' }}
                onClick={() => setAssigningComplaint(null)}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Assigning complaint <strong>#{assigningComplaint.trackingId}</strong>: {assigningComplaint.title}.
            </p>

            <form onSubmit={handleAssignSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="select-worker-input">
                  <span>Select Registered Worker</span>
                </label>
                <select
                  id="select-worker-input"
                  className="form-select"
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  required
                >
                  {workers.map((w) => (
                    <option key={w._id} value={w._id}>
                      {w.name} — {w.department} ({w.activeJobsCount} active tasks)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setAssigningComplaint(null)}
                >
                  Cancel
                </button>
                <button
                  id="confirm-assign-btn"
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Review Completed Resolution Proof (Accept or Reject Work) */}
      {reviewingComplaint && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '750px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={22} color="#c084fc" />
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                  Inspect Worker Resolution Proof
                </h3>
              </div>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ padding: '0.3rem' }}
                onClick={() => setReviewingComplaint(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                #{reviewingComplaint.trackingId} • {reviewingComplaint.category}
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0.2rem 0 0.4rem' }}>
                {reviewingComplaint.title}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Location: {reviewingComplaint.location?.address}
              </p>
            </div>

            {/* Before vs After Side-by-Side Proof Verification */}
            <div className="comparison-grid">
              {/* Before Photo */}
              <div className="comparison-card">
                <div className="comparison-header" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}>
                  <span>Before (Citizen Report)</span>
                </div>
                {reviewingComplaint.media?.url ? (
                  <img src={reviewingComplaint.media.url} alt="Initial" className="comparison-img" style={{ height: 210 }} />
                ) : (
                  <div style={{ height: 210, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    No before photo
                  </div>
                )}
              </div>

              {/* After Photo Proof */}
              <div className="comparison-card">
                <div className="comparison-header" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7' }}>
                  <span>After (Worker Resolution Proof)</span>
                </div>
                {reviewingComplaint.resolutionProof?.photoUrl ? (
                  <img src={reviewingComplaint.resolutionProof.photoUrl} alt="Proof" className="comparison-img" style={{ height: 210 }} />
                ) : (
                  <div style={{ height: 210, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    No resolution photo
                  </div>
                )}
              </div>
            </div>

            {/* Worker notes */}
            <div style={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: 'var(--radius-md)', padding: '1rem', margin: '1rem 0' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                Worker Notes ({reviewingComplaint.assignedWorker?.name || 'Staff'}):
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                "{reviewingComplaint.resolutionProof?.notes || 'No notes provided'}"
              </p>
            </div>

            {/* Accept / Reject Form */}
            <form onSubmit={handleReviewWorkSubmit}>
              <div className="form-group">
                <label className="form-label">
                  <span>Executive Quality Decision *</span>
                </label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: reviewDecision === 'Accepted' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${reviewDecision === 'Accepted' ? '#10b981' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="decision"
                      value="Accepted"
                      checked={reviewDecision === 'Accepted'}
                      onChange={() => setReviewDecision('Accepted')}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: '#34d399', fontSize: '0.92rem' }}>
                        ✅ Accept Work & Sign Off
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Marks resolved, credits citizen +50 points, closes ticket
                      </div>
                    </div>
                  </label>

                  <label
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: reviewDecision === 'Rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${reviewDecision === 'Rejected' ? '#ef4444' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="decision"
                      value="Rejected"
                      checked={reviewDecision === 'Rejected'}
                      onChange={() => setReviewDecision('Rejected')}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: '#f87171', fontSize: '0.92rem' }}>
                        ❌ Reject & Reassign to Worker
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Work unsatisfactory; prompts worker for mandatory rework
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Feedback text */}
              <div className="form-group">
                <label className="form-label" htmlFor="admin-feedback-input">
                  <span>Inspection Remarks / Feedback {reviewDecision === 'Rejected' ? '*' : '(Optional)'}</span>
                </label>
                <input
                  id="admin-feedback-input"
                  type="text"
                  className="form-input"
                  placeholder={
                    reviewDecision === 'Accepted'
                      ? 'e.g. Work inspected and verified to municipal standards.'
                      : 'e.g. Pothole fill is uneven and asphalt debris left on road. Clean and recoat.'
                  }
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  required={reviewDecision === 'Rejected'}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setReviewingComplaint(null)}
                >
                  Cancel
                </button>
                <button
                  id="confirm-review-decision-btn"
                  type="submit"
                  className={`btn ${reviewDecision === 'Accepted' ? 'btn-success' : 'btn-danger'}`}
                  style={{ flex: 1 }}
                  disabled={submittingReview}
                >
                  {submittingReview
                    ? 'Processing Decision...'
                    : reviewDecision === 'Accepted'
                    ? 'Confirm Acceptance & Close Grievance'
                    : 'Confirm Rejection & Reassign for Rework'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
