import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { MapPin, Box, ArrowRight, ShieldCheck, Star } from 'lucide-react';
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
        .limit(8);

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
            <div key={listing.id} className="premium-listing-card">
              <div className="card-image-wrapper">
                {listing.images && listing.images.length > 0 ? (
                  <img src={listing.images[0]} alt={listing.title} />
                ) : (
                  <div className="placeholder-image">
                    <Box size={48} />
                  </div>
                )}
                <div className="card-badge verified">
                  <ShieldCheck size={14} />
                  <span>Verified Supplier</span>
                </div>
              </div>
              
              <div className="card-details">
                <div className="card-top">
                  <span className="category-tag">{listing.categories?.name || 'Medical'}</span>
                  <div className="rating-mini">
                    <Star size={12} fill="#f59e0b" color="#f59e0b" />
                    <span>4.8</span>
                  </div>
                </div>
                
                <h3>{listing.title}</h3>
                
                <div className="card-price-row">
                  <span className="price-label">Asking Price</span>
                  <div className="price-value">
                    {listing.price ? `₹${Number(listing.price).toLocaleString('en-IN')}` : 'Contact for Price'}
                  </div>
                </div>

                <div className="card-meta-info">
                  <div className="meta-item">
                    <MapPin size={14} />
                    <span>{listing.location || 'All India'}</span>
                  </div>
                  <div className="meta-item">
                    <Box size={14} />
                    <span>Min. Order: 1 Unit</span>
                  </div>
                </div>
                
                <div className="card-actions">
                  <Link to={`/listing/${listing.id}`} className="card-btn secondary">
                    View Details
                  </Link>
                  <button className="card-btn primary">
                    Get Quotation
                  </button>
                </div>
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
