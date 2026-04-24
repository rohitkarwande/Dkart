import { Link } from 'react-router-dom';

const Header = () => {
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
            />
            <button className="search-button">Search</button>
          </div>
        </div>

        <div className="actions-section">
          <Link to="/coming-soon" className="action-link">
            <span className="action-icon">👤</span>
            <span>Sign In</span>
          </Link>
          <Link to="/coming-soon" className="action-button primary">
            Post Requirement
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
