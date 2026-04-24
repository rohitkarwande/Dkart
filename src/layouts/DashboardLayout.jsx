import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { LogOut, User, FileText, Settings, ShieldAlert, Zap, BarChart2, UploadCloud, Package, ShoppingBag } from 'lucide-react';

const DashboardLayout = () => {
  const { profile, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    navigate('/login');
  };

  const isSeller = profile?.role === 'seller';
  const isAdmin = profile?.role === 'admin';
  const isPro = profile?.plan_tier === 'pro';

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <h2>MediMart Panel</h2>
          <div className="badge-container">
            <span className="role-badge">{profile?.role || 'User'}</span>
            {isPro && <span className="pro-badge">PRO</span>}
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item">
            <User size={20} />
            Profile
          </Link>

          <Link to="/search" className="nav-item" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>
            <ShoppingBag size={20} />
            Browse Marketplace
          </Link>
          
          {isSeller && (
            <>
              <Link to="/dashboard/my-listings" className="nav-item">
                <Package size={20} />
                My Listings
              </Link>

              <Link to="/dashboard/kyc" className="nav-item">
                <ShieldAlert size={20} />
                KYC Verification
                {!profile?.is_verified && <span className="status-dot red"></span>}
              </Link>
              
              <Link to="/dashboard/analytics" className="nav-item">
                <BarChart2 size={20} />
                Vendor Analytics
                {!isPro && <span className="pro-tag">PRO</span>}
              </Link>
              
              <Link to="/dashboard/bulk-upload" className="nav-item">
                <UploadCloud size={20} />
                Bulk Import
              </Link>
            </>
          )}

          {isAdmin && (
            <Link to="/dashboard/admin" className="nav-item" style={{ borderLeft: '4px solid #10b981', background: '#ecfdf5' }}>
              <ShieldAlert size={20} />
              Admin Overview
            </Link>
          )}

          <Link to="/dashboard/credits" className="nav-item">
            <Zap size={20} />
            Buy Credits
          </Link>

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
          <h3>
            Welcome, {profile?.full_name || 'User'}
            {isPro && <span className="pro-badge inline">PRO</span>}
          </h3>
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
