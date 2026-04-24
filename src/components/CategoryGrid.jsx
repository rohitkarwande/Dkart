import { Link } from 'react-router-dom';

const categories = [
  { id: 1, title: 'Equipment Listings', icon: '🩻', desc: 'Browse all medical devices', path: '/coming-soon' },
  { id: 2, title: 'Inquiry System', icon: '📝', desc: 'Send bulk requirements', path: '/coming-soon' },
  { id: 3, title: 'Chat & Negotiate', icon: '💬', desc: 'Connect with sellers', path: '/coming-soon' },
  { id: 4, title: 'Verified Deals', icon: '🏷️', desc: 'Special B2B pricing', path: '/coming-soon' },
  { id: 5, title: 'User Dashboard', icon: '📊', desc: 'Manage your profile', path: '/coming-soon' },
  { id: 6, title: 'Global Search', icon: '🔍', desc: 'Find what you need', path: '/coming-soon' },
  { id: 7, title: 'Admin Panel', icon: '⚙️', desc: 'Platform management', path: '/coming-soon' },
  { id: 8, title: 'Auth & Security', icon: '🔒', desc: 'Login / Register', path: '/coming-soon' },
];

const CategoryGrid = () => {
  return (
    <section className="category-section">
      <div className="section-header">
        <h2>Explore Platform Features</h2>
        <Link to="/coming-soon" className="view-all">View All →</Link>
      </div>
      
      <div className="category-grid">
        {categories.map((category) => (
          <Link key={category.id} to={category.path} className="category-card">
            <div className="category-icon">{category.icon}</div>
            <div className="category-info">
              <h3>{category.title}</h3>
              <p>{category.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
