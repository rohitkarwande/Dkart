import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MessageSquare, Briefcase, User, PlusCircle, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user, profile, logout } = useAuthStore();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/search');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    navigate('/login');
  };

  return (
    <header className="site-header">
      <div className="header-container">
        <div className="logo-section">
          <Link to="/" className="logo">
            <div className="logo-badge">
              <PlusCircle size={24} color="#059669" />
            </div>
            <span className="logo-text">MediMart</span>
          </Link>
        </div>
        
        <div className="search-section">
          <div className="search-bar">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon-inner" />
              <input 
                type="text" 
                placeholder="Search for medical equipment..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button className="search-button" onClick={handleSearch}>Search</button>
          </div>
        </div>

        <div className="actions-section">
          {user && (
            <>
              <Link to="/messages" className="action-link">
                <MessageSquare size={20} />
                <span>Messages</span>
              </Link>
              <Link to="/deals" className="action-link">
                <Briefcase size={20} />
                <span>Deals</span>
              </Link>
              
              {(profile?.role === 'seller' || profile?.role === 'admin') && (
                <Link to="/dashboard" className="action-link">
                  <LayoutDashboard size={20} />
                  <span>Dashboard</span>
                </Link>
              )}
            </>
          )}

          {user ? (
            <button onClick={handleLogout} className="action-link logout-btn" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          ) : (
            <Link to="/login" className="action-link sign-in">
              <User size={20} />
              <span>Sign In</span>
            </Link>
          )}

          {(!user || profile?.role === 'seller' || profile?.role === 'admin') && (
            <Link to="/post-listing" className="header-post-btn">
              Post Equipment
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
