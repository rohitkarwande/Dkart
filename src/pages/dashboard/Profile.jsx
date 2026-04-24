import { useAuthStore } from '../../store/useAuthStore';
import { User, Building, ShieldCheck, Mail, MapPin, Award, Zap, Briefcase } from 'lucide-react';

const Profile = () => {
  const { profile } = useAuthStore();
  const isSeller = profile?.role === 'seller';
  const isAdmin = profile?.role === 'admin';

  return (
    <div className="premium-profile-container">
      <div className="profile-header-banner">
        <div className="profile-avatar-large">
          {profile?.full_name ? profile.full_name[0] : 'U'}
        </div>
        <div className="profile-header-text">
          <h1>{profile?.full_name || 'Your Account'}</h1>
          <p>{profile?.role?.toUpperCase()} ACCOUNT • {profile?.company_name || 'Individual'}</p>
        </div>
        <div className="profile-badges-row">
          {profile?.is_verified && (
            <div className="trust-badge">
              <ShieldCheck size={16} />
              <span>Verified Identity</span>
            </div>
          )}
          {profile?.plan_tier === 'pro' && (
            <div className="plan-badge">
              <Zap size={16} fill="currentColor" />
              <span>PRO MEMBER</span>
            </div>
          )}
        </div>
      </div>

      <div className="profile-sections-grid">
        {/* Personal Details */}
        <div className="profile-card-premium">
          <div className="card-header">
            <User size={20} />
            <h3>Personal Information</h3>
          </div>
          <div className="card-body">
            <div className="info-row">
              <span className="label">Full Name</span>
              <span className="value">{profile?.full_name || 'Not provided'}</span>
            </div>
            <div className="info-row">
              <span className="label">Account ID</span>
              <span className="value font-mono">#{profile?.id?.substring(0, 8)}</span>
            </div>
            <div className="info-row">
              <span className="label">Primary Role</span>
              <span className={`role-tag ${profile?.role}`}>{profile?.role}</span>
            </div>
          </div>
        </div>

        {/* Business Details */}
        <div className="profile-card-premium">
          <div className="card-header">
            <Building size={20} />
            <h3>Business Details</h3>
          </div>
          <div className="card-body">
            <div className="info-row">
              <span className="label">Company Name</span>
              <span className="value">{profile?.company_name || 'Individual Seller'}</span>
            </div>
            <div className="info-row">
              <span className="label">Location</span>
              <div className="value-with-icon">
                <MapPin size={14} />
                <span>India (National Marketplace)</span>
              </div>
            </div>
            <div className="info-row">
              <span className="label">Trust Score</span>
              <div className="trust-progress">
                <div className="progress-bar-inner" style={{ width: `${profile?.trust_score || 85}%` }}></div>
                <span>{profile?.trust_score || 85}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Stats */}
        <div className="profile-card-premium">
          <div className="card-header">
            <Award size={20} />
            <h3>Platform Reputation</h3>
          </div>
          <div className="card-body">
            <div className="stats-row">
              <div className="stat-box">
                <span className="stat-val">{profile?.credits_balance || 0}</span>
                <span className="stat-lbl">Credits</span>
              </div>
              <div className="stat-box">
                <span className="stat-val">12</span>
                <span className="stat-lbl">Deals</span>
              </div>
              <div className="stat-box">
                <span className="stat-val">4.9</span>
                <span className="stat-lbl">Rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
