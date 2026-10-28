import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Award, 
  CheckCircle2, 
  Star, 
  Users, 
  Sparkles, 
  ShieldCheck, 
  ArrowUpRight 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CivicLeaderboard() {
  const [leaderboardData, setLeaderboardData] = useState({
    stats: {
      totalResolvedComplaints: 0,
      totalComplaints: 0,
      totalCitizens: 0,
      resolutionRate: 0,
    },
    leaderboard: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (data.success) {
        setLeaderboardData(data);
        // Trigger celebratory confetti
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#10b981', '#f59e0b', '#06b6d4'],
        });
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const top3 = leaderboardData.leaderboard.slice(0, 3);
  const remainingCitizens = leaderboardData.leaderboard.slice(3);

  return (
    <div>
      {/* Page Header */}
      <div className="page-hero">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Trophy size={20} color="#fbbf24" />
          <span style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: 700, textTransform: 'uppercase' }}>
            Community Champions
          </span>
        </div>
        <h1 className="page-hero-title">Civic Impact Leaderboard</h1>
        <p className="page-hero-desc">
          Honoring pro-active citizens who report grievances and drive their neighborhoods toward 100% 
          resolution. Solved complaints earn 50 civic points and prestigious community guardian badges!
        </p>
      </div>

      {/* Community Impact Statistics Counters */}
      <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <CheckCircle2 size={26} />
          </div>
          <div>
            <div className="stat-value" style={{ color: '#34d399' }}>
              {leaderboardData.stats.totalResolvedComplaints}
            </div>
            <div className="stat-label">Issues Resolved</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
            <Award size={26} />
          </div>
          <div>
            <div className="stat-value" style={{ color: '#22d3ee' }}>
              {leaderboardData.stats.resolutionRate}%
            </div>
            <div className="stat-label">Municipal Fix Rate</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
            <Users size={26} />
          </div>
          <div>
            <div className="stat-value" style={{ color: '#818cf8' }}>
              {leaderboardData.stats.totalCitizens}
            </div>
            <div className="stat-label">Civic Guardians</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Star size={26} />
          </div>
          <div>
            <div className="stat-value" style={{ color: '#fbbf24' }}>
              {leaderboardData.leaderboard.reduce((s, c) => s + (c.civicPoints || 0), 0)}
            </div>
            <div className="stat-label">Total Points Awarded</div>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {top3.length > 0 && (
        <div className="podium-container">
          {/* Second Place */}
          {top3[1] && (
            <div className="podium-card second">
              <div className="podium-avatar-wrap">
                <img
                  src={top3[1].avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${top3[1].name}`}
                  alt={top3[1].name}
                  className="podium-avatar"
                />
                <div className="podium-rank-badge">🥈</div>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{top3[1].name}</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                {top3[1].ward}
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-full)', fontWeight: 800, fontSize: '0.95rem', display: 'inline-block', marginBottom: '0.5rem' }}>
                {top3[1].resolvedCount} Issues Solved
              </div>
              <div style={{ fontSize: '0.82rem', color: '#fbbf24', fontWeight: 600 }}>
                ⭐ {top3[1].civicPoints} Civic Points
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                {top3[1].badge}
              </div>
            </div>
          )}

          {/* First Place - Grand Champion */}
          {top3[0] && (
            <div className="podium-card first">
              <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#f59e0b', color: '#000', fontWeight: 800, fontSize: '0.75rem', padding: '0.2rem 0.75rem', borderRadius: 'var(--radius-full)', letterSpacing: '0.05em' }}>
                TOP SOLVER 👑
              </div>
              <div className="podium-avatar-wrap" style={{ width: 96, height: 96 }}>
                <img
                  src={top3[0].avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${top3[0].name}`}
                  alt={top3[0].name}
                  className="podium-avatar"
                  style={{ borderColor: '#f59e0b' }}
                />
                <div className="podium-rank-badge" style={{ borderColor: '#f59e0b' }}>🥇</div>
              </div>
              <h3 style={{ fontSize: '1.45rem', fontWeight: 800 }}>{top3[0].name}</h3>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                {top3[0].ward}
              </div>
              <div style={{ background: '#10b981', color: '#fff', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', fontWeight: 800, fontSize: '1.05rem', display: 'inline-block', marginBottom: '0.6rem', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }}>
                {top3[0].resolvedCount} Issues Solved
              </div>
              <div style={{ fontSize: '0.9rem', color: '#fbbf24', fontWeight: 700 }}>
                ⭐ {top3[0].civicPoints} Civic Points
              </div>
              <div style={{ fontSize: '0.82rem', color: '#f59e0b', fontWeight: 700, marginTop: '0.35rem' }}>
                {top3[0].badge}
              </div>
            </div>
          )}

          {/* Third Place */}
          {top3[2] && (
            <div className="podium-card third">
              <div className="podium-avatar-wrap">
                <img
                  src={top3[2].avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${top3[2].name}`}
                  alt={top3[2].name}
                  className="podium-avatar"
                />
                <div className="podium-rank-badge">🥉</div>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{top3[2].name}</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                {top3[2].ward}
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-full)', fontWeight: 800, fontSize: '0.95rem', display: 'inline-block', marginBottom: '0.5rem' }}>
                {top3[2].resolvedCount} Issues Solved
              </div>
              <div style={{ fontSize: '0.82rem', color: '#fbbf24', fontWeight: 600 }}>
                ⭐ {top3[2].civicPoints} Civic Points
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                {top3[2].badge}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rankings Table */}
      <div className="glass-panel" style={{ padding: '1.75rem', overflowX: 'auto' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award size={18} color="var(--primary)" />
          Civic Guardian Leaderboard Rankings
        </h3>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '0.75rem 1rem' }}>Rank</th>
              <th style={{ padding: '0.75rem 1rem' }}>Citizen Guardian</th>
              <th style={{ padding: '0.75rem 1rem' }}>Ward / District</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Resolved Issues</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Civic Points</th>
              <th style={{ padding: '0.75rem 1rem' }}>Badge Status</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.leaderboard.map((citizen) => (
              <tr
                key={citizen._id}
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  transition: 'background var(--transition-fast)',
                }}
              >
                <td style={{ padding: '1rem', fontWeight: 800, fontSize: '1rem' }}>
                  <span style={{ marginRight: '0.35rem' }}>{citizen.rankBadge}</span>
                  #{citizen.rank}
                </td>

                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={citizen.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${citizen.name}`}
                      alt={citizen.name}
                      style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{citizen.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{citizen.email}</div>
                    </div>
                  </div>
                </td>

                <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {citizen.ward}
                </td>

                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#34d399',
                      padding: '0.3rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                    }}
                  >
                    ✓ {citizen.resolvedCount} Solved
                  </span>
                </td>

                <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 700, color: '#fbbf24' }}>
                  ⭐ {citizen.civicPoints}
                </td>

                <td style={{ padding: '1rem' }}>
                  <span
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      padding: '0.25rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: '#a5b4fc',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                    }}
                  >
                    {citizen.badge}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
