const HeroBanner = () => {
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
          />
          <input 
            type="text" 
            className="hero-location-input" 
            placeholder="All India" 
          />
          <button className="hero-search-btn">Search</button>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
