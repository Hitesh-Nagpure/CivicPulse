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
  UserX,
  RotateCcw
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

  const resetFilters = () => {
    setSelectedDept('All');
    setMinDays(0);
    setSortBy('neglect');
  };

  return (
    <div className="shame-page-wrapper">
      {/* Hero Header */}
      <div className="page-hero">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
          <span className="shame-badge-counter">
            <AlertTriangle size={14} />
            PUBLIC ACCOUNTABILITY
          </span>
          <span style={{ fontSize: '0.85rem', color: '#b91c1c', fontWeight: 700, letterSpacing: '0.02em' }}>
            Municipal Hall of Shame
          </span>
        </div>
        <h1 className="page-hero-title shame-hero-title">
          Municipal Wall of Shame
        </h1>
        <p className="page-hero-desc" style={{ maxWidth: '780px' }}>
          Holding defaulting civic authorities accountable in public daylight. These critical citizen 
          grievances remain unaddressed past mandatory SLAs. Vote to escalate public pressure and demand immediate remediation!
        </p>
      </div>

      {/* Shame Alert Banner (Rich, High-Contrast Red Emergency Banner) */}
      <div className="shame-banner">
        <div className="shame-banner-info">
          <div className="shame-flame-icon">
            <Flame size={32} />
          </div>
          <div>
            <h3 className="shame-banner-heading">
              {shameData.totalShamedIssues} Overdue Civic Emergencies Exposed
            </h3>
            <p className="shame-banner-subtext">
              Defaulting Agency with Most Unaddressed Issues:{' '}
              <strong>{shameData.worstDepartment?.name || 'Road Infrastructure & Public Works'}</strong>
              {shameData.worstDepartment && ` (Avg. Delay: ${shameData.worstDepartment.avgDaysDelayed} Days)`}
            </p>
          </div>
        </div>

        <div className="shame-banner-stats">
          <div className="shame-stats-label">
            Citizen Demand Votes
          </div>
          <div className="shame-stats-value">
            {shameData.departmentRankings?.reduce((sum, d) => sum + (d.totalUpvotes || 0), 0) || 177}+ Votes
          </div>
        </div>
      </div>

      {/* Department Defaulter Rankings Bar */}
      {shameData.departmentRankings && shameData.departmentRankings.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#991b1b' }}>
            <Building2 size={18} />
            Department Neglect Index (Most Defaulting First)
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {shameData.departmentRankings.slice(0, 4).map((dept, idx) => (
              <div
                key={idx}
                className={`dept-ranking-card ${idx === 0 ? 'dept-worst' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: idx === 0 ? '#b91c1c' : 'var(--text-muted)' }}>
                    #{idx + 1} DEFAULTER
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: 700, background: '#fee2e2', padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-sm)' }}>
                    {dept.unresolvedCount} Pending
                  </span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: idx === 0 ? '#991b1b' : 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  {dept.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Avg. Delay: <strong style={{ color: '#0f172a' }}>{dept.avgDaysDelayed} Days</strong> • {dept.criticalCount} Critical
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Sort Bar */}
      <div className="glass-panel shame-filter-bar">
        <div className="shame-filters-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <Filter size={15} color="var(--primary)" />
            <span>Filter:</span>
          </div>

          <select
            id="shame-dept-filter"
            className="form-select"
            style={{ width: 'auto', minWidth: '200px', padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
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
            style={{ width: 'auto', padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
            value={minDays}
            onChange={(e) => setMinDays(Number(e.target.value))}
          >
            <option value="0">All Pending Delays</option>
            <option value="3">Ignored &gt; 3 Days</option>
            <option value="7">Ignored &gt; 7 Days</option>
            <option value="10">Ignored &gt; 10 Days</option>
          </select>

          {(selectedDept !== 'All' || minDays > 0) && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', gap: '0.3rem' }}
              onClick={resetFilters}
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="shame-sort-group">
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sort by:</span>
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
        <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-secondary)' }}>
          <div className="pulse-dot" style={{ margin: '0 auto 1rem', width: 16, height: 16, background: '#dc2626' }}></div>
          <p style={{ fontWeight: 600 }}>Loading Wall of Shame registry...</p>
        </div>
      ) : shameData.complaints?.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
          <ShieldAlert size={48} color="#16a34a" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            No overdue issues matching this filter
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 1.25rem' }}>
            All complaints under this department are currently progressing within target resolution SLAs.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={resetFilters}
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.88rem' }}
          >
            View All Defaulting Issues
          </button>
        </div>
      ) : (
        <div className="grid-3 shame-grid">
          {shameData.complaints.map((item) => (
            <div key={item._id} className="shame-card">
              {/* Card Header */}
              <div className="shame-card-header">
                <span className="shame-days-badge">
                  <Clock size={13} />
                  {item.daysNeglected || item.daysOpen || 1} DAYS IGNORED
                </span>

                <span className={`badge-severity badge-${item.aiSeverity?.level?.toLowerCase()}`}>
                  {item.aiSeverity?.level} ({item.aiSeverity?.score || 8}/10)
                </span>
              </div>

              {/* Photo Evidence */}
              <div className="shame-media-wrap">
                {item.media?.url ? (
                  item.media.mediaType === 'video' ? (
                    <video src={item.media.url} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <img 
                      src={item.media.url} 
                      alt={item.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  )
                ) : null}
                
                <div 
                  className="shame-media-fallback"
                  style={{ display: item.media?.url ? 'none' : 'flex' }}
                >
                  <AlertTriangle size={26} color="#dc2626" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>
                    Photo Evidence Attached
                  </span>
                </div>

                <div className="shame-tracking-tag">
                  #{item.trackingId}
                </div>
              </div>

              {/* Title & Description */}
              <div style={{ padding: '1.25rem 1.25rem 0.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.45rem', lineHeight: 1.35 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '0.75rem' }}>
                  {item.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <MapPin size={14} color="var(--primary)" />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.location?.address}
                  </span>
                </div>
              </div>

              {/* Official Blame Box (High Contrast & Clear) */}
              <div className="authority-blame-box">
                <div style={{ fontSize: '0.72rem', color: '#b91c1c', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Responsible Authority:
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: '0.2rem 0' }}>
                  {item.aiSeverity?.suggestedDepartment || item.wallOfShame?.responsibleAuthority || 'Municipal Public Works'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Escalated to: <strong style={{ color: '#334155' }}>{item.wallOfShame?.officialEscalated || 'Zonal Chief Engineer'}</strong>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="shame-card-footer">
                {/* Shame & Demand Action Button */}
                <button
                  id={`shame-vote-${item.trackingId}`}
                  type="button"
                  className="btn btn-danger"
                  style={{ flex: 1, padding: '0.55rem 0.85rem', fontSize: '0.84rem', fontWeight: 700 }}
                  onClick={() => handleShameUpvote(item._id)}
                  disabled={upvotingId === item._id}
                >
                  <Flame size={16} />
                  <span>
                    Demand Action ({item.wallOfShame?.shameUpvotes || 0})
                  </span>
                </button>

                {/* Track Button */}
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.55rem 0.85rem', fontSize: '0.84rem' }}
                  onClick={() => onTrackComplaint(item.trackingId)}
                  title="View full tracking lifecycle"
                >
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
