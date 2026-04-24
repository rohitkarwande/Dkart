import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
      <div className="hero-content">
        <h1>Find verified medical equipment suppliers near you</h1>
        <p>Connecting healthcare professionals with trusted B2B manufacturers and dealers</p>
        
        <div className="hero-search-container">
          <input 
            type="text" 
            className="hero-search-input" 
            placeholder="Enter product or service name (e.g. MRI Machine, Surgical Gloves)" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <input 
            type="text" 
            className="hero-location-input" 
            placeholder="All India" 
            disabled
          />
          <button className="hero-search-btn" onClick={handleSearch}>Search</button>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
