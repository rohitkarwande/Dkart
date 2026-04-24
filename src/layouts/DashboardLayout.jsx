import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { LogOut, User, FileText, Settings, ShieldAlert } from 'lucide-react';

const DashboardLayout = () => {
  const { profile, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    navigate('/login');
  };

  const isSeller = profile?.role === 'seller';

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <h2>MediMart Panel</h2>
          <span className="role-badge">{profile?.role || 'User'}</span>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item">
            <User size={20} />
            Profile
          </Link>
          
          {isSeller && (
            <Link to="/dashboard/kyc" className="nav-item">
              <ShieldAlert size={20} />
              KYC Verification
              {!profile?.is_verified && <span className="status-dot red"></span>}
            </Link>
          )}

          <Link to="/coming-soon" className="nav-item">
            <FileText size={20} />
            My Inquiries
          </Link>

          <Link to="/coming-soon" className="nav-item">
            <Settings size={20} />
            Settings
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <h3>Welcome, {profile?.full_name || 'User'}</h3>
          <div className="topbar-actions">
            <span className="credits-badge">Credits: {profile?.credits_balance || 0}</span>
          </div>
        </header>
        
        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
