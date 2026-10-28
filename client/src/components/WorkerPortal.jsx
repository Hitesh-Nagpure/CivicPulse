import React, { useState, useEffect } from 'react';
import { 
  HardHat, 
  CheckCircle, 
  Clock, 
  Upload, 
  Camera, 
  AlertCircle, 
  MapPin, 
  Calendar, 
  Star, 
  Hand, 
  CheckCheck, 
  RotateCcw,
  Sparkles,
  ExternalLink,
  X
} from 'lucide-react';

export default function WorkerPortal({ currentUser, onTrackComplaint }) {
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [workerTab, setWorkerTab] = useState('unassigned'); // 'unassigned' | 'my-tasks'

  const [unassignedPool, setUnassignedPool] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Submit Work Modal State
  const [resolvingComplaint, setResolvingComplaint] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [workerNotes, setWorkerNotes] = useState('');
  const [submittingProof, setSubmittingProof] = useState(false);

  // Fetch workers list on mount
  useEffect(() => {
    fetchWorkers();
  }, []);

  // When worker is selected, fetch their tasks and the unassigned pool
  useEffect(() => {
    if (selectedWorker) {
      fetchUnassignedPool();
      fetchMyTasks(selectedWorker._id);
    }
  }, [selectedWorker]);

  const fetchWorkers = async () => {
    try {
      const res = await fetch('/api/workers');
      const data = await res.json();
      if (data.success && data.workers.length > 0) {
        setWorkers(data.workers);
        // Default to logged-in worker if available
        const matched = data.workers.find(
          (w) => w.email === currentUser?.email || w._id === currentUser?.workerId || w.name === currentUser?.name
        ) || data.workers[0];
        setSelectedWorker(matched);
      }
    } catch (err) {
      console.error('Error fetching workers:', err);
    }
  };

  const fetchUnassignedPool = async () => {
    try {
      const res = await fetch('/api/workers/unassigned-pool');
      const data = await res.json();
      if (data.success) {
        setUnassignedPool(data.pool);
      }
    } catch (err) {
      console.error('Error fetching unassigned pool:', err);
    }
  };

  const fetchMyTasks = async (workerId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/workers/${workerId}/tasks`);
      const data = await res.json();
      if (data.success) {
        setMyTasks(data.tasks);
      }
    } catch (err) {
      console.error('Error fetching worker tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Worker Willingly Claims Unassigned Complaint
  const handleClaimComplaint = async (complaintId) => {
    if (!selectedWorker) return;

    try {
      const res = await fetch(`/api/complaints/${complaintId}/claim`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: selectedWorker._id,
          workerName: selectedWorker.name,
          department: selectedWorker.department,
          phone: selectedWorker.phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not claim task.');

      alert(`Success! You voluntarily accepted and claimed #${data.complaint.trackingId}!`);
      // Refresh both lists
      fetchUnassignedPool();
      fetchMyTasks(selectedWorker._id);
      setWorkerTab('my-tasks');
    } catch (err) {
      alert(err.message);
    }
  };

  // Worker starts task
  const handleStartTask = async (complaintId) => {
    try {
      const res = await fetch(`/api/complaints/${complaintId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'In Progress' }),
      });
      if (res.ok) {
        fetchMyTasks(selectedWorker._id);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Proof File Selection
  const handleProofFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
  };

  // Submit Completed Work with Resolution Photo
  const handleSubmitWork = async (e) => {
    e.preventDefault();
    if (!resolvingComplaint || (!proofFile && !proofPreview)) {
      alert('Please upload a photo of the completed resolution work.');
      return;
    }

    setSubmittingProof(true);
    try {
      const formData = new FormData();
      if (proofFile) {
        formData.append('resolutionPhoto', proofFile);
      }
      formData.append('notes', workerNotes.trim() || 'Work completed on site.');

      const res = await fetch(`/api/complaints/${resolvingComplaint._id}/submit-work`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error submitting completed work.');

      alert('Work submitted successfully! Chief Admin will now review and verify the proof.');
      setResolvingComplaint(null);
      setProofFile(null);
      setProofPreview(null);
      setWorkerNotes('');
      fetchMyTasks(selectedWorker._id);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingProof(false);
    }
  };

  return (
    <div>
      {/* Page Hero */}
      <div className="page-hero">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <HardHat size={20} color="#38bdf8" />
          <span style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>
            Municipal Field Operations
          </span>
        </div>
        <h1 className="page-hero-title">Municipal Worker Dashboard</h1>
        <p className="page-hero-desc">
          Browse unassigned civic complaints to voluntarily claim tasks without waiting for assignment, 
          manage active work orders, and upload photographic proof upon job completion for Admin sign-off.
        </p>
      </div>

      {/* Worker Profile Card & Switcher */}
      {selectedWorker && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <img
              src={selectedWorker.avatar || `https://api.dicebear.com/7.x/personas/svg?seed=${selectedWorker.name}`}
              alt={selectedWorker.name}
              style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #38bdf8' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{selectedWorker.name}</h3>
                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-full)', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', fontWeight: 700 }}>
                  Badge #{selectedWorker.badgeNumber}
                </span>
              </div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                {selectedWorker.department} • <em>{selectedWorker.specialization}</em>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Assigned Zone: {selectedWorker.assignedZone} • Rating: ⭐ {selectedWorker.rating} / 5.0
              </div>
            </div>
          </div>

          {/* Switch Worker Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Switch Worker:</span>
            <select
              id="worker-select-dropdown"
              className="form-select"
              style={{ width: 'auto', fontSize: '0.85rem' }}
              value={selectedWorker._id}
              onChange={(e) => {
                const found = workers.find((w) => w._id === e.target.value);
                if (found) {
                  setSelectedWorker(found);
                  setCurrentPersona({
                    role: 'worker',
                    workerId: found._id,
                    name: found.name,
                    department: found.department,
                  });
                }
              }}
            >
              {workers.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name} ({w.department.split('&')[0]})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Sub Tabs: Unassigned Pool vs My Tasks */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem' }}>
        <button
          id="tab-unassigned-pool"
          type="button"
          className={`btn ${workerTab === 'unassigned' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setWorkerTab('unassigned')}
          style={{ padding: '0.7rem 1.4rem' }}
        >
          <Hand size={18} />
          <span>Available Unassigned Pool ({unassignedPool.length})</span>
        </button>

        <button
          id="tab-my-tasks"
          type="button"
          className={`btn ${workerTab === 'my-tasks' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setWorkerTab('my-tasks')}
          style={{ padding: '0.7rem 1.4rem' }}
        >
          <CheckCheck size={18} />
          <span>My Assigned Tasks ({myTasks.length})</span>
        </button>
      </div>

      {/* TAB 1: Unassigned Pool (Voluntary Claim) */}
      {workerTab === 'unassigned' && (
        <div>
          <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Sparkles size={20} color="#38bdf8" />
            <div style={{ fontSize: '0.88rem', color: '#bae6fd' }}>
              <strong>Voluntary Civic Action:</strong> As a municipal worker, you can willingly accept any open grievance from this pool without waiting for administrative assignment.
            </div>
          </div>

          {unassignedPool.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <CheckCircle size={40} color="#10b981" style={{ margin: '0 auto 0.75rem' }} />
              <h3>All Complaints Currently Assigned!</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                There are no unassigned grievances waiting in the queue. Check back shortly.
              </p>
            </div>
          ) : (
            <div className="grid-3">
              {unassignedPool.map((task) => (
                <div key={task._id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  {/* Card Image */}
                  <div style={{ height: 160, background: '#000', position: 'relative' }}>
                    {task.media?.url ? (
                      task.media.mediaType === 'video' ? (
                        <video src={task.media.url} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <img src={task.media.url} alt={task.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        No photo attached
                      </div>
                    )}
                    <span style={{ position: 'absolute', top: 10, left: 10 }} className={`badge-severity badge-${task.aiSeverity?.level?.toLowerCase()}`}>
                      {task.aiSeverity?.level} ({task.aiSeverity?.score}/10)
                    </span>
                  </div>

                  {/* Card Content */}
                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '0.25rem' }}>
                      #{task.trackingId} • {task.category}
                    </div>

                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem', lineHeight: 1.3 }}>
                      {task.title}
                    </h4>

                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {task.description}
                    </p>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1rem' }}>
                      <MapPin size={14} />
                      <span>{task.location?.address}</span>
                    </div>

                    {/* Claim Button */}
                    <button
                      id={`claim-task-${task.trackingId}`}
                      type="button"
                      className="btn btn-primary"
                      style={{ marginTop: 'auto', width: '100%', padding: '0.6rem', fontSize: '0.88rem' }}
                      onClick={() => handleClaimComplaint(task._id)}
                    >
                      <Hand size={16} />
                      <span>✋ Willingly Accept & Claim Task</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: My Assigned Tasks */}
      {workerTab === 'my-tasks' && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="pulse-dot" style={{ margin: '0 auto 1rem', width: 14, height: 14 }}></div>
              <p>Loading your assigned tasks...</p>
            </div>
          ) : myTasks.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <HardHat size={40} color="#38bdf8" style={{ margin: '0 auto 0.75rem' }} />
              <h3>No tasks assigned yet!</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                You have no active or completed assignments right now.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setWorkerTab('unassigned')}
              >
                Browse Open Unassigned Complaints
              </button>
            </div>
          ) : (
            <div className="grid-2">
              {myTasks.map((task) => (
                <div key={task._id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                  {/* Task Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                          #{task.trackingId}
                        </span>
                        <span className={`badge-status badge-status-${task.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {task.status}
                        </span>
                        {task.assignedWorker?.isSelfClaimed && (
                          <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}>
                            Self-Claimed
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{task.title}</h3>
                    </div>

                    <span className={`badge-severity badge-${task.aiSeverity?.level?.toLowerCase()}`}>
                      {task.aiSeverity?.level}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.4 }}>
                    {task.description}
                  </p>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
                    <MapPin size={14} />
                    <span>{task.location?.address} ({task.location?.ward})</span>
                  </div>

                  {/* If previous work was rejected by admin, display prominent rework banner! */}
                  {task.adminReview?.decision === 'Rejected' && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f87171', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                        <AlertCircle size={16} />
                        <span>REWORK REQUIRED BY CHIEF ADMIN:</span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#fca5a5' }}>
                        "{task.adminReview?.feedback}"
                      </p>
                    </div>
                  )}

                  {/* Before / After Preview if exists */}
                  <div className="comparison-grid" style={{ marginBottom: '1rem' }}>
                    <div className="comparison-card">
                      <div className="comparison-header">Initial Complaint</div>
                      {task.media?.url ? (
                        <img src={task.media.url} alt="Initial" className="comparison-img" style={{ height: 120 }} />
                      ) : (
                        <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          No image
                        </div>
                      )}
                    </div>

                    <div className="comparison-card">
                      <div className="comparison-header">My Proof Photo</div>
                      {task.resolutionProof?.photoUrl ? (
                        <img src={task.resolutionProof.photoUrl} alt="Proof" className="comparison-img" style={{ height: 120 }} />
                      ) : (
                        <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          Pending Upload
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                    {task.status === 'Assigned' && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ flex: 1, fontSize: '0.85rem' }}
                        onClick={() => handleStartTask(task._id)}
                      >
                        Start Work (Mark In Progress)
                      </button>
                    )}

                    {(task.status === 'In Progress' || task.adminReview?.decision === 'Rejected') && (
                      <button
                        id={`complete-task-${task.trackingId}`}
                        type="button"
                        className="btn btn-primary"
                        style={{ flex: 1, fontSize: '0.85rem' }}
                        onClick={() => setResolvingComplaint(task)}
                      >
                        <Camera size={16} />
                        <span>Upload Resolution Photo & Submit</span>
                      </button>
                    )}

                    {task.status === 'Under Review' && (
                      <div style={{ flex: 1, background: 'rgba(168, 85, 247, 0.15)', color: '#d8b4fe', textAlign: 'center', padding: '0.5rem', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', fontWeight: 600 }}>
                        ⏳ Awaiting Admin Approval & Acceptance
                      </div>
                    )}

                    {task.status === 'Resolved' && (
                      <div style={{ flex: 1, background: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7', textAlign: 'center', padding: '0.5rem', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', fontWeight: 600 }}>
                        ✓ Accepted & Signed Off by Admin
                      </div>
                    )}

                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '0.5rem 0.75rem' }}
                      onClick={() => onTrackComplaint(task.trackingId)}
                      title="Open full tracking timeline"
                    >
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload Resolution Proof Modal */}
      {resolvingComplaint && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Camera size={22} color="var(--primary)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Submit Completed Job Proof</h3>
              </div>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ padding: '0.3rem' }}
                onClick={() => setResolvingComplaint(null)}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Submitting completion evidence for complaint: <strong>#{resolvingComplaint.trackingId}</strong> ({resolvingComplaint.title}).
            </p>

            <form onSubmit={handleSubmitWork}>
              {/* Photo Proof Upload */}
              <div className="form-group">
                <label className="form-label">
                  <span>After-Resolution Photo Proof *</span>
                  <span className="form-label-hint">Photo proving the repaired site</span>
                </label>

                {proofPreview ? (
                  <div className="media-preview-box">
                    <img src={proofPreview} alt="Work Proof" className="media-preview-img" />
                    <button
                      type="button"
                      className="media-remove-btn"
                      onClick={() => {
                        setProofFile(null);
                        setProofPreview(null);
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="dropzone-container" htmlFor="proof-photo-input">
                    <input
                      id="proof-photo-input"
                      type="file"
                      accept="image/*"
                      onChange={handleProofFileChange}
                      style={{ display: 'none' }}
                      required
                    />
                    <div className="dropzone-icon">
                      <Camera size={26} />
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      Click to Upload Proof Photo
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Clear high-resolution photo showing repaired infrastructure
                    </div>
                  </label>
                )}
              </div>

              {/* Completion Notes */}
              <div className="form-group">
                <label className="form-label" htmlFor="worker-proof-notes">
                  <span>Work Done & Technical Notes</span>
                </label>
                <textarea
                  id="worker-proof-notes"
                  className="form-textarea"
                  style={{ minHeight: '85px' }}
                  placeholder="e.g. Filled crater with cold asphalt mix, compacted with roller, site cleaned and safety tape removed."
                  value={workerNotes}
                  onChange={(e) => setWorkerNotes(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setResolvingComplaint(null)}
                >
                  Cancel
                </button>
                <button
                  id="submit-proof-btn"
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={submittingProof}
                >
                  {submittingProof ? 'Uploading Proof...' : 'Submit to Admin for Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
