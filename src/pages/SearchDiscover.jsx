import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { MapPin, Box, ShieldCheck, Star } from 'lucide-react';
import './SearchDiscover.css';

const SearchDiscover = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Filters state
  const [filters, setFilters] = useState({
    query: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    condition: [],
  });

  // Fetch categories for the sidebar
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*');
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  // Fetch listings based on filters
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      let query = supabase
        .from('equipment_listings')
        .select('*, categories(name)')
        .eq('status', 'active');

      // Apply search query (simple ilike for now, could be upgraded to full-text search)
      if (filters.query) {
        query = query.ilike('title', `%${filters.query}%`);
      }

      // Apply category filter
      if (filters.category) {
        query = query.eq('category_id', filters.category);
      }

      // Apply condition filters (OR logic)
      if (filters.condition.length > 0) {
        query = query.in('condition', filters.condition);
      }

      // Order by newest
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (!error && data) {
        setListings(data);
      }
      setLoading(false);
    };

    fetchListings();
  }, [filters]);

  const handleConditionChange = (e) => {
    const value = e.target.value;
    setFilters((prev) => {
      const newConditions = prev.condition.includes(value)
        ? prev.condition.filter((c) => c !== value)
        : [...prev.condition, value];
      return { ...prev, condition: newConditions };
    });
  };

  const handleCategoryChange = (e) => {
    setFilters((prev) => ({ ...prev, category: e.target.value }));
  };

  return (
    <div className="search-page-container">
      {/* Sidebar Filters */}
      <aside className="filters-sidebar">
        <h2>Filters</h2>
        
        <div className="filter-group">
          <h3>Category</h3>
          <select 
            value={filters.category} 
            onChange={handleCategoryChange}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <h3>Condition</h3>
          <label>
            <input 
              type="checkbox" 
              value="new" 
              checked={filters.condition.includes('new')}
              onChange={handleConditionChange} 
            />
            New
          </label>
          <label>
            <input 
              type="checkbox" 
              value="used" 
              checked={filters.condition.includes('used')}
              onChange={handleConditionChange} 
            />
            Used
          </label>
          <label>
            <input 
              type="checkbox" 
              value="refurbished" 
              checked={filters.condition.includes('refurbished')}
              onChange={handleConditionChange} 
            />
            Refurbished
          </label>
        </div>
      </aside>

      {/* Main Search Results */}
      <main className="search-results-area">
        <div className="search-header">
          <h1>
            {filters.query ? `Results for "${filters.query}"` : 'All Medical Equipment'}
          </h1>
          <span style={{ color: 'var(--text-muted)' }}>
            {listings.length} {listings.length === 1 ? 'result' : 'results'}
          </span>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading listings...</div>
        ) : listings.length === 0 ? (
          <div className="loading-spinner">No equipment found matching your criteria.</div>
        ) : (
          <div className="results-grid">
            {listings.map((listing) => (
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
                    <button onClick={() => navigate(`/listing/${listing.id}`)} className="card-btn primary">
                      Get Quotation
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchDiscover;
