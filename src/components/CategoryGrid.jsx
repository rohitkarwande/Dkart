import { Link } from 'react-router-dom';
import { ShoppingBag, FileText, MessageCircle, BadgeCheck, LayoutDashboard, Globe, Settings, ShieldCheck } from 'lucide-react';

const categories = [
  { id: 1, title: 'Equipment', icon: <ShoppingBag size={32} />, desc: 'Browse medical devices', path: '/search' },
  { id: 2, title: 'Inquiry', icon: <FileText size={32} />, desc: 'Send bulk requirements', path: '/search' },
  { id: 3, title: 'Messages', icon: <MessageCircle size={32} />, desc: 'Connect with sellers', path: '/messages' },
  { id: 4, title: 'Verified Deals', icon: <BadgeCheck size={32} />, desc: 'Special B2B pricing', path: '/deals' },
  { id: 5, title: 'Dashboard', icon: <LayoutDashboard size={32} />, desc: 'Manage your profile', path: '/dashboard' },
  { id: 6, title: 'Global Search', icon: <Globe size={32} />, desc: 'Find what you need', path: '/search' },
  { id: 7, title: 'Settings', icon: <Settings size={32} />, desc: 'Platform settings', path: '/dashboard' },
  { id: 8, title: 'Security', icon: <ShieldCheck size={32} />, desc: 'Login / Register', path: '/login' },
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
            <div className="category-icon-wrapper">
              {category.icon}
            </div>
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
