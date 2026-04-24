import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuthStore } from '../../store/useAuthStore';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Eye, Edit, Trash2, Plus } from 'lucide-react';

const MyListings = () => {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile || profile.role !== 'seller') {
      navigate('/dashboard');
      return;
    }

    const fetchMyListings = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('equipment_listings')
          .select('*, categories(name)')
          .eq('seller_id', profile.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setListings(data);
        }
      } catch (err) {
        console.error('Error fetching listings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyListings();
  }, [profile, navigate]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this listing?");
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('equipment_listings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setListings(listings.filter(listing => listing.id !== id));
      alert("Listing deleted successfully!");
    } catch (err) {
      alert("Error deleting listing: " + err.message);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading your listings...</div>;

  return (
    <div className="my-listings-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={24} color="var(--primary-color)" />
            My Inventory
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage the equipment you are currently selling.</p>
        </div>
        <Link to="/post-listing" className="auth-button primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'auto', margin: 0 }}>
          <Plus size={18} />
          Add New Listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="empty-state" style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
          <Package size={48} color="#9ca3af" style={{ margin: '0 auto 1rem' }} />
          <h3>No Listings Found</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>You haven't posted any equipment for sale yet.</p>
          <Link to="/post-listing" className="outline-btn">Post Your First Item</Link>
        </div>
      ) : (
        <div className="listings-grid" style={{ display: 'grid', gap: '1.5rem' }}>
          {listings.map(listing => (
            <div key={listing.id} className="listing-list-card" style={{ display: 'flex', background: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', gap: '1.5rem', alignItems: 'center' }}>
              
              <div className="listing-img" style={{ width: '100px', height: '100px', background: '#f3f4f6', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                {listing.images && listing.images.length > 0 ? (
                  <img src={listing.images[0]} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Package size={32} color="#9ca3af" />
                )}
              </div>

              <div className="listing-details" style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem' }}>{listing.title}</h3>
                  <span className={`status-badge ${listing.status}`} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '12px', background: listing.status === 'active' ? '#dcfce7' : '#f3f4f6', color: listing.status === 'active' ? '#16a34a' : '#4b5563', textTransform: 'capitalize', fontWeight: '600' }}>
                    {listing.status}
                  </span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  {listing.categories?.name || 'Uncategorized'} • {listing.condition.toUpperCase()}
                </div>
                <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                  {listing.price ? `₹${Number(listing.price).toLocaleString('en-IN')}` : 'Price on Request'}
                </div>
              </div>

              <div className="listing-stats" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 2rem', borderLeft: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}>
                <Eye size={20} color="#6b7280" style={{ marginBottom: '0.25rem' }} />
                <strong style={{ fontSize: '1.1rem' }}>{listing.views_count || 0}</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Views</span>
              </div>

              <div className="listing-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                <Link to={`/listing/${listing.id}`} className="icon-btn" style={{ padding: '0.5rem', color: '#3b82f6', background: '#eff6ff', border: 'none', borderRadius: '4px', cursor: 'pointer' }} title="View Public Listing">
                  <Eye size={18} />
                </Link>
                <button className="icon-btn" style={{ padding: '0.5rem', color: '#10b981', background: '#ecfdf5', border: 'none', borderRadius: '4px', cursor: 'pointer' }} title="Edit Listing">
                  <Edit size={18} />
                </button>
                <button onClick={() => handleDelete(listing.id)} className="icon-btn" style={{ padding: '0.5rem', color: '#ef4444', background: '#fef2f2', border: 'none', borderRadius: '4px', cursor: 'pointer' }} title="Delete">
                  <Trash2 size={18} />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;
