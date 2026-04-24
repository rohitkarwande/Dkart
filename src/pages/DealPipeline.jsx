import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import './DealPipeline.css';

const DealPipeline = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  const CURRENT_USER_ID = '00000000-0000-0000-0000-000000000001';

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('deals')
        .select(`
          id,
          status,
          agreed_price,
          equipment_listings (title),
          buyer_id,
          seller_id
        `);

      if (!error && data) {
        setDeals(data);
      }
      setLoading(false);
    };

    fetchDeals();
  }, []);

  const handleDragStart = (e, dealId) => {
    e.dataTransfer.setData('dealId', dealId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('dealId');
    
    // Optimistic UI Update
    setDeals(prevDeals => prevDeals.map(deal => 
      deal.id === dealId ? { ...deal, status: newStatus } : deal
    ));

    // Update in Supabase
    const { error } = await supabase
      .from('deals')
      .update({ status: newStatus })
      .eq('id', dealId);

    if (error) {
      console.error('Error updating deal:', error);
      alert('Failed to update deal status');
    }
  };

  const COLUMNS = ['Open', 'Negotiation', 'Closed'];

  return (
    <div className="pipeline-container">
      <div className="pipeline-header">
        <h1>Deal Pipeline</h1>
        <p style={{ color: 'var(--text-muted)' }}>Drag and drop deals to update their status.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading deals...</div>
      ) : (
        <div className="kanban-board">
          {COLUMNS.map((column) => {
            const columnDeals = deals.filter((d) => (d.status || 'Open') === column);
            return (
              <div 
                key={column} 
                className="kanban-column"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column)}
              >
                <div className="kanban-column-header">
                  {column}
                  <span className="count">{columnDeals.length}</span>
                </div>
                
                {columnDeals.map((deal) => (
                  <div 
                    key={deal.id} 
                    className="deal-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, deal.id)}
                  >
                    <div className="deal-title">{deal.equipment_listings?.title || 'Unknown Equipment'}</div>
                    <div className="deal-price">
                      {deal.agreed_price ? `₹${Number(deal.agreed_price).toLocaleString('en-IN')}` : 'Price TBD'}
                    </div>
                    <div className="deal-meta">
                      <span>ID: {deal.id.substring(0, 8)}</span>
                      <span>{deal.buyer_id === CURRENT_USER_ID ? 'Buying' : 'Selling'}</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DealPipeline;
