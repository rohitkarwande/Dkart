import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import './ExploreFeed.css';
import '../pages/SearchDiscover.css'; // Reusing card styles

const ExploreFeed = () => {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExploreFeeds = async () => {
      setLoading(true);
      // Fetch "Trending" (for now, simply getting latest active listings with views_count > 0, 
      // or just ordering by views_count/created_at)
      const { data, error } = await supabase
        .from('equipment_listings')
        .select('*, categories(name)')
        .eq('status', 'active')
        .order('views_count', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(4);

      if (!error && data) {
        setTrending(data);
      }
      setLoading(false);
    };

    fetchExploreFeeds();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading trending equipment...</div>;
  if (trending.length === 0) return null;

  return (
    <div className="explore-feed-container">
      <section className="explore-section">
        <h2>🔥 Trending Equipment</h2>
        <div className="trending-grid">
          {trending.map((listing) => (
            <div key={listing.id} className="listing-card">
              <div className="listing-img-container">
                {listing.images && listing.images.length > 0 ? (
                  <img src={listing.images[0]} alt={listing.title} />
                ) : (
                  <span style={{ fontSize: '3rem' }}>📸</span>
                )}
                <div className="listing-condition-badge">
                  {listing.condition?.toUpperCase()}
                </div>
              </div>
              
              <div className="listing-card-content">
                <h3>{listing.title}</h3>
                <div className="listing-card-price">
                  {listing.price ? `₹${Number(listing.price).toLocaleString('en-IN')}` : 'Price on Request'}
                </div>
                <div className="listing-card-meta">
                  <span>📍 {listing.location || 'Location Not Specified'}</span>
                  <span>📁 {listing.categories?.name || 'Uncategorized'}</span>
                </div>
                
                <Link to={`/listing/${listing.id}`} className="view-details-btn">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Additional sections like "Recommended For You" can be added here using vector search later */}
      <section className="explore-section" style={{ marginTop: '4rem' }}>
        <h2>✨ Recommended For You</h2>
        <p style={{ color: 'var(--text-muted)' }}>Sign in and browse more listings to get personalized recommendations.</p>
      </section>
    </div>
  );
};

export default ExploreFeed;
