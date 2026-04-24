import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Eye, Award } from 'lucide-react';

// Simulated Hackathon Data
const data = [
  { name: 'Mon', views: 400, leads: 24 },
  { name: 'Tue', views: 300, leads: 13 },
  { name: 'Wed', views: 550, leads: 38 },
  { name: 'Thu', views: 420, leads: 31 },
  { name: 'Fri', views: 700, leads: 48 },
  { name: 'Sat', views: 850, leads: 62 },
  { name: 'Sun', views: 610, leads: 41 },
];

const VendorAnalytics = () => {
  const { profile, upgradeToPro } = useAuthStore();
  const isPro = profile?.plan_tier === 'pro';

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <div className="header-text">
          <h2>Seller Analytics Dashboard</h2>
          <p>Monitor your equipment views and incoming leads.</p>
        </div>
        
        {!isPro && (
          <button className="auth-button primary pro-upgrade-btn" onClick={upgradeToPro}>
            <Award size={18} />
            Upgrade to PRO
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon blue"><Eye size={24} /></div>
          <div className="kpi-data">
            <h3>3,830</h3>
            <p>Total Profile Views</p>
          </div>
          <div className="kpi-trend positive"><TrendingUp size={16} /> +12%</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon green"><Users size={24} /></div>
          <div className="kpi-data">
            <h3>257</h3>
            <p>Leads Unlocked</p>
          </div>
          <div className="kpi-trend positive"><TrendingUp size={16} /> +8%</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon purple"><Award size={24} /></div>
          <div className="kpi-data">
            <h3>98/100</h3>
            <p>Trust Score</p>
          </div>
          <div className="kpi-trend neutral">Top 5% Seller</div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="chart-section">
        <h3>Traffic & Lead Conversion (Last 7 Days)</h3>
        {!isPro && (
          <div className="pro-overlay">
            <Award size={48} color="#f59e0b" />
            <h3>PRO Feature</h3>
            <p>Upgrade to PRO to view detailed daily analytics and conversion tracking.</p>
            <button className="auth-button primary" onClick={upgradeToPro}>Upgrade Now</button>
          </div>
        )}
        
        <div className={`chart-wrapper ${!isPro ? 'blurred' : ''}`}>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
              />
              <Line type="monotone" dataKey="views" name="Profile Views" stroke="#047857" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
              <Line type="monotone" dataKey="leads" name="Unlocked Leads" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default VendorAnalytics;
