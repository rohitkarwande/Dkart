import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { User, Building, ShieldCheck, Mail, Phone, Settings, Heart, MessageSquare, Clock } from 'lucide-react';
import ExploreFeed from '../../components/ExploreFeed';
import './Profile.css';

const Profile = () => {
  const { profile } = useAuthStore();
  const isSeller = profile?.role === 'seller';

  return (
    <div className="dashboard-profile-container">
      {/* Welcome Banner */}
      <div className="profile-welcome-banner">
        <div className="welcome-text">
          <h1>Welcome back, {profile?.first_name || profile?.full_name?.split(' ')[0] || 'User'}!</h1>
          <p>Here's what's happening in your B2B marketplace today.</p>
        </div>
        <div className="profile-quick-stats">
          <div className="stat-card">
            <h3>{profile?.credits_balance || 0}</h3>
            <span>Available Credits</span>
          </div>
          {isSeller ? (
            <div className="stat-card">
              <h3>12</h3>
              <span>Active Listings</span>
            </div>
          ) : (
            <div className="stat-card">
              <h3>3</h3>
              <span>Active Deals</span>
            </div>
          )}
        </div>
      </div>

      <div className="profile-main-grid">
        {/* Main Content Area (Products) */}
        <div className="profile-main-content">
          <div className="profile-section" style={{ padding: 0, border: 'none', boxShadow: 'none', background: 'transparent' }}>
            <div className="profile-section-header" style={{ marginBottom: '1rem', borderBottom: 'none' }}>
              <h2>
                <Clock size={20} color="var(--primary-color)" />
                {isSeller ? 'Marketplace Pulse' : 'Recommended for You'}
              </h2>
              <Link to="/search" className="section-link">View all equipment &rarr;</Link>
            </div>
            
            {/* Embed the ExploreFeed directly into the dashboard */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-soft)', boxShadow: 'var(--shadow-sm)' }}>
              <ExploreFeed />
            </div>
          </div>
        </div>

        {/* Sidebar (User Details & Actions) */}
        <div className="profile-sidebar">
          
          <div className="profile-section">
            <div className="profile-section-header">
              <h2><User size={20} /> Personal Details</h2>
              <Link to="/dashboard/settings" className="section-link">Edit</Link>
            </div>
            
            <div className="user-info-card">
              <div className="info-row">
                <div className="info-icon"><User size={20} /></div>
                <div className="info-content">
                  <p>Full Name</p>
                  <h4>{profile?.full_name || 'Not provided'}</h4>
                </div>
              </div>
              
              <div className="info-row">
                <div className="info-icon"><Mail size={20} /></div>
                <div className="info-content">
                  <p>Email Address</p>
                  <h4>{profile?.email || 'user@example.com'}</h4>
                </div>
              </div>

              {profile?.company_name && (
                <div className="info-row">
                  <div className="info-icon"><Building size={20} /></div>
                  <div className="info-content">
                    <p>Company</p>
                    <h4>{profile.company_name}</h4>
                  </div>
                </div>
              )}

              <div className="info-row">
                <div className="info-icon">
                  <ShieldCheck size={20} color={profile?.is_verified ? "var(--primary-color)" : "#94a3b8"} />
                </div>
                <div className="info-content">
                  <p>Account Status</p>
                  <h4 style={{ color: profile?.is_verified ? 'var(--primary-color)' : 'var(--text-main)' }}>
                    {profile?.is_verified ? 'Verified Business' : 'Standard User'}
                  </h4>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <div className="profile-section-header">
              <h2><Settings size={20} /> Quick Actions</h2>
            </div>
            
            <div className="quick-actions-grid">
              <Link to="/messages" className="action-btn">
                <MessageSquare size={24} />
                <span>Messages</span>
              </Link>
              <Link to="/deals" className="action-btn">
                <Building size={24} />
                <span>My Deals</span>
              </Link>
              <Link to="/search" className="action-btn">
                <Heart size={24} />
                <span>Saved Items</span>
              </Link>
              <Link to="/dashboard/settings" className="action-btn">
                <Settings size={24} />
                <span>Settings</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
