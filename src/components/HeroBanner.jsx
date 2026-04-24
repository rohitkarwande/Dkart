import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, CheckCircle } from 'lucide-react';

const HeroBanner = () => {
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
    <section className="hero-banner">
      <div className="hero-overlay"></div>
      <div className="hero-container">
        <div className="hero-content">
          <div className="trust-tag">
            <CheckCircle size={16} />
            <span>Over 10,000+ Verified Suppliers</span>
          </div>
          <h1>
            Your Premier Source for <br />
            <span>Medical Equipment B2B</span>
          </h1>
          <p>Direct from Manufacturers, Wholesale Dealers & Certified Importers</p>
          
          <div className="hero-search-wrapper">
            <div className="hero-input-group">
              <Search size={20} className="hero-icon" />
              <input 
                type="text" 
                placeholder="What are you looking for?" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="hero-input-group location">
              <MapPin size={20} className="hero-icon" />
              <input 
                type="text" 
                placeholder="Location" 
                defaultValue="All India"
              />
            </div>
            <button className="hero-main-btn" onClick={handleSearch}>Get Quotations</button>
          </div>

          <div className="hero-features">
            <span>Popular:</span>
            <button onClick={() => navigate('/search?q=MRI')}>MRI Machines</button>
            <button onClick={() => navigate('/search?q=Ultrasound')}>Ultrasound</button>
            <button onClick={() => navigate('/search?q=Gloves')}>Surgical Gloves</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
