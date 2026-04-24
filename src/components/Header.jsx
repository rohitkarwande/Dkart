import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <header className="site-header">
      <div className="header-container">
        <div className="logo-section">
          <Link to="/" className="logo">
            <span className="logo-icon">➕</span>
            <span className="logo-text">MediMart</span>
          </Link>
        </div>
        
        <div className="search-section">
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Search for medical equipment, supplies, or services..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="search-button" onClick={handleSearch}>Search</button>
          </div>
        </div>

        <div className="actions-section">
          <Link to="/messages" className="action-link">
            <span className="action-icon">💬</span>
            <span>Messages</span>
          </Link>
          <Link to="/deals" className="action-link">
            <span className="action-icon">🤝</span>
            <span>Deals</span>
          </Link>
          <Link to="/coming-soon" className="action-link">
            <span className="action-icon">👤</span>
            <span>Sign In</span>
          </Link>
          <Link to="/post-listing" className="action-button primary">
            Post Equipment
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
