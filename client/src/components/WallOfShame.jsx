import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Flame, 
  Clock, 
  Building2, 
  ThumbsUp, 
  MapPin, 
  ExternalLink, 
  ShieldAlert, 
  TrendingUp, 
  Filter,
  UserX
} from 'lucide-react';

export default function WallOfShame({ onTrackComplaint }) {
  const [shameData, setShameData] = useState({
    totalShamedIssues: 0,
    worstDepartment: null,
    departmentRankings: [],
    complaints: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('All');
  const [minDays, setMinDays] = useState(0);
  const [sortBy, setSortBy] = useState('neglect');
  const [upvotingId, setUpvotingId] = useState(null);

  useEffect(() => {
    fetchWallOfShame();
  }, [selectedDept, minDays, sortBy]);

  const fetchWallOfShame = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDept !== 'All') params.append('department', selectedDept);
      if (minDays > 0) params.append('minDays', minDays);
      params.append('sort', sortBy);

      const res = await fetch(`/api/wall-of-shame?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setShameData(data);
      }
    } catch (err) {
      console.error('Error fetching Wall of Shame:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShameUpvote = async (complaintId) => {
    setUpvotingId(complaintId);
    try {
      const res = await fetch(`/api/complaints/${complaintId}/shame-upvote`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        // Optimistically update the upvote count in state
        setShameData((prev) => ({
          ...prev,
          complaints: prev.complaints.map((item) =>
            item._id === complaintId
              ? {
                  ...item,
                  wallOfShame: {
                    ...item.wallOfShame,
                    shameUpvotes: data.shameUpvotes,
                  },
                }
              : item
          ),
        }));
      }
    } catch (err) {
      console.error('Error upvoting shame:', err);
    } finally {
      setUpvotingId(null);
    }
  };

  return (
    <div>
      {/* Hero Header */}
      <div className="page-hero">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
          <span className="shame-badge-counter">
            🚨 PUBLIC ACCOUNTABILITY
          </span>
          <span style={{ fontSize: '0.85rem', color: '#f87171', fontWeight: 600 }}>
            Civic Hall of Shame
          </span>
        </div>
        <h1 className="page-hero-title" style={{ background: 'linear-gradient(135deg, #fff 40%, #f87171 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Municipal Wall of Shame
        </h1>
        <p className="page-hero-desc">
          Holding defaulting civic authorities accountable in public daylight. These critical citizen 
          grievances remain unaddressed past mandatory SLAs. Vote to escalate public pressure!
        </p>
      </div>

      {/* Shame Alert Banner */}
      <div className="shame-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.25)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Flame size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '0.2rem' }}>
              {shameData.totalShamedIssues} Overdue Civic Emergencies Publicly Exposed
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#fca5a5' }}>
              Worst Defaulting Agency:{' '}
              <strong>{shameData.worstDepartment?.name || 'Road Infrastructure & Public Works'}</strong>
              {shameData.worstDepartment && ` (Avg. Delay: ${shameData.worstDepartment.avgDaysDelayed} Days)`}
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '0.75rem', color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Citizens Demanding Action
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)' }}>
            {shameData.departmentRankings?.reduce((sum, d) => sum + (d.totalUpvotes || 0), 0) || 280}+ Votes
          </div>
        </div>
      </div>

      {/* Department Defaulter Rankings Bar */}
      {shameData.departmentRankings && shameData.departmentRankings.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fca5a5' }}>
            <Building2 size={16} />
            Department Neglect Index (Most Defaulting First)
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {shameData.departmentRankings.slice(0, 4).map((dept, idx) => (
              <div
                key={idx}
                style={{
                  background: idx === 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0, 0, 0, 0.3)',
                  border: `1px solid ${idx === 0 ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: idx === 0 ? '#f87171' : 'var(--text-muted)' }}>
                    #{idx + 1} DEFAULTER
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 700 }}>
                    {dept.unresolvedCount} Issues Pending
                  </span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff', marginBottom: '0.4rem' }}>
                  {dept.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Avg. Neglect: <strong>{dept.avgDaysDelayed} Days</strong> • {dept.criticalCount} Critical
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Sort Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <Filter size={15} />
            <span>Filter Agency:</span>
          </div>

          <select
            id="shame-dept-filter"
            className="form-select"
            style={{ width: 'auto', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="All">All Defaulting Departments</option>
            {shameData.departmentRankings?.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name} ({d.unresolvedCount})
              </option>
            ))}
          </select>

          <select
            id="shame-days-filter"
            className="form-select"
            style={{ width: 'auto', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
            value={minDays}
            onChange={(e) => setMinDays(Number(e.target.value))}
          >
            <option value="0">All Pending Delays</option>
            <option value="3">Ignored &gt; 3 Days</option>
            <option value="7">Ignored &gt; 7 Days</option>
            <option value="10">Ignored &gt; 10 Days</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Sort by:</span>
          <button
            type="button"
            className={`btn ${sortBy === 'neglect' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
            onClick={() => setSortBy('neglect')}
          >
            Most Days Neglected
          </button>
          <button
            type="button"
            className={`btn ${sortBy === 'upvotes' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
            onClick={() => setSortBy('upvotes')}
          >
            Highest Citizen Outrage
          </button>
        </div>
      </div>

      {/* Shamed Grievance Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <div className="pulse-dot" style={{ margin: '0 auto 1rem', width: 14, height: 14 }}></div>
          <p>Loading Wall of Shame registry...</p>
        </div>
      ) : shameData.complaints?.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <ShieldAlert size={42} color="#10b981" style={{ margin: '0 auto 1rem' }} />
          <h3>No overdue issues matching this filter!</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Departments are currently operating within the expected resolution threshold for this criteria.
          </p>
        </div>
      ) : (
        <div className="grid-3">
          {shameData.complaints.map((item) => (
            <div key={item._id} className="shame-card">
              {/* Card Header */}
              <div className="shame-card-header">
                <span className="shame-days-badge">
                  <Clock size={14} />
                  {item.daysNeglected} DAYS IGNORED
                </span>

                <span className={`badge-severity badge-${item.aiSeverity?.level?.toLowerCase()}`}>
                  {item.aiSeverity?.level} ({item.aiSeverity?.score}/10)
                </span>
              </div>

              {/* Photo Evidence */}
              <div style={{ height: 180, background: '#000', overflow: 'hidden', position: 'relative' }}>
                {item.media?.url ? (
                  item.media.mediaType === 'video' ? (
                    <video src={item.media.url} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <img src={item.media.url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Photo evidence attached
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0, 0, 0, 0.75)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', color: '#fff' }}>
                  #{item.trackingId}
                </div>
              </div>

              {/* Title & Description */}
              <div style={{ padding: '1.25rem 1.25rem 0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.3 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '0.75rem' }}>
                  {item.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <MapPin size={14} />
                  <span>{item.location?.address}</span>
                </div>
              </div>

              {/* Official Blame Box */}
              <div className="authority-blame-box">
                <div style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: 800, textTransform: 'uppercase' }}>
                  Responsible Authority:
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                  {item.aiSeverity?.suggestedDepartment || item.wallOfShame?.responsibleAuthority}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                  Escalated to: <strong>{item.wallOfShame?.officialEscalated || 'Zonal Chief Engineer'}</strong>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div style={{ padding: '1rem 1.25rem 1.25rem', marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                {/* Shame & Demand Action Button */}
                <button
                  id={`shame-vote-${item.trackingId}`}
                  type="button"
                  className="btn btn-danger"
                  style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}
                  onClick={() => handleShameUpvote(item._id)}
                  disabled={upvotingId === item._id}
                >
                  <Flame size={15} />
                  <span>
                    Demand Action ({item.wallOfShame?.shameUpvotes || 0})
                  </span>
                </button>

                {/* Track Button */}
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem 0.8rem', fontSize: '0.82rem' }}
                  onClick={() => onTrackComplaint(item.trackingId)}
                  title="View full tracking lifecycle"
                >
                  <ExternalLink size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
