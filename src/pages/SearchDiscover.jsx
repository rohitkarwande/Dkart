import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import './SearchDiscover.css';

const SearchDiscover = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

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
        )}
      </main>
    </div>
  );
};

export default SearchDiscover;
