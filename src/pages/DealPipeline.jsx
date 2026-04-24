import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { Package, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import './DealPipeline.css';

const COLUMNS = [
  { key: 'open', label: 'Open', icon: <Clock size={16} />, color: '#10b981' },
  { key: 'negotiating', label: 'Negotiating', icon: <TrendingUp size={16} />, color: '#f59e0b' },
  { key: 'closed', label: 'Closed', icon: <CheckCircle size={16} />, color: '#64748b' },
];

const DealPipeline = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuthStore();
  const navigate = useNavigate();

  const CURRENT_USER_ID = profile?.id;

  useEffect(() => {
    if (!CURRENT_USER_ID) return;
    const fetchDeals = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('chats')
        .select(`
          id,
          status,
          buyer_id,
          seller_id,
          equipment_listings (id, title, price)
        `)
        .or(`buyer_id.eq.${CURRENT_USER_ID},seller_id.eq.${CURRENT_USER_ID}`);

      if (!error && data) setDeals(data);
      setLoading(false);
    };
    fetchDeals();
  }, [CURRENT_USER_ID]);

  const handleDragStart = (e, dealId) => {
    e.dataTransfer.setData('dealId', dealId);
  };

  const handleDragOver = (e) => { e.preventDefault(); };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('dealId');

    // Optimistic UI update
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, status: newStatus } : d));

    const { error } = await supabase
      .from('chats')
      .update({ status: newStatus })
      .eq('id', dealId);

    if (error) {
      console.error('Error updating deal:', error);
      alert('Failed to update deal status');
    }
  };

  if (!CURRENT_USER_ID) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem' }}>
        <p>Please <a href="/login" style={{ color: 'var(--primary-color)' }}>login</a> to view your deal pipeline.</p>
      </div>
    );
  }

  return (
    <div className="pipeline-container">
      <div className="pipeline-header">
        <h1>My Deal Pipeline</h1>
        <p style={{ color: 'var(--text-muted)' }}>Drag and drop deals to update their negotiation status.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading deals...</div>
      ) : deals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
          <Package size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3>No deals yet</h3>
          <p>Browse the marketplace and contact sellers to start negotiating.</p>
          <button
            onClick={() => navigate('/search')}
            style={{ marginTop: '1.5rem', padding: '12px 24px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}
          >
            Browse Marketplace
          </button>
        </div>
      ) : (
        <div className="kanban-board">
          {COLUMNS.map((col) => {
            const columnDeals = deals.filter(d => (d.status || 'open') === col.key);
            return (
              <div
                key={col.key}
                className="kanban-column"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.key)}
              >
                <div className="kanban-column-header" style={{ borderTop: `3px solid ${col.color}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: col.color }}>
                    {col.icon}
                    <span>{col.label}</span>
                  </div>
                  <span className="count">{columnDeals.length}</span>
                </div>

                {columnDeals.map((deal) => {
                  const isBuying = deal.buyer_id === CURRENT_USER_ID;
                  return (
                    <div
                      key={deal.id}
                      className="deal-card"
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal.id)}
                      onClick={() => navigate('/messages')}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="deal-title">{deal.equipment_listings?.title || 'Unknown Equipment'}</div>
                      <div className="deal-price">
                        {deal.equipment_listings?.price
                          ? `₹${Number(deal.equipment_listings.price).toLocaleString('en-IN')}`
                          : 'Price TBD'}
                      </div>
                      <div className="deal-meta">
                        <span>#{deal.id.substring(0, 8)}</span>
                        <span style={{
                          background: isBuying ? '#ecfdf5' : '#fffbeb',
                          color: isBuying ? '#10b981' : '#f59e0b',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontWeight: '700',
                          fontSize: '0.75rem'
                        }}>
                          {isBuying ? '🛒 Buying' : '📦 Selling'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DealPipeline;
