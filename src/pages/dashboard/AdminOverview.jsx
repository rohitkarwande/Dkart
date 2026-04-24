import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { Users, Package, Activity, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminOverview = () => {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, listings: 0, deals: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile || profile.role !== 'admin') {
      alert('Access Denied. Admins only.');
      navigate('/dashboard');
      return;
    }

    const fetchAdminData = async () => {
      setLoading(true);
      try {
        // Fetch total profiles
        const { count: userCount, error: userError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
          
        // Fetch total listings
        const { count: listingCount, error: listingError } = await supabase
          .from('equipment_listings')
          .select('*', { count: 'exact', head: true });

        // Fetch total deals
        const { count: dealCount, error: dealError } = await supabase
          .from('chats')
          .select('*', { count: 'exact', head: true });

        // Fetch recent users
        const { data: users, error: recentError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (!userError && !listingError && !dealError) {
          setStats({
            users: userCount || 0,
            listings: listingCount || 0,
            deals: dealCount || 0
          });
        }

        if (!recentError && users) {
          setRecentUsers(users);
        }
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [profile, navigate]);

  const handleApproveUser = async (userId) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: true })
        .eq('id', userId);

      if (error) throw error;
      
      // Update local state
      setRecentUsers(prev => prev.map(u => u.id === userId ? { ...u, is_verified: true } : u));
    } catch (err) {
      alert("Error approving user: " + err.message);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading Admin Panel...</div>;

  return (
    <div className="admin-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="admin-header" style={{ marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}>
          <ShieldCheck size={28} />
          Platform Administration
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>Overview of marketplace activity and user management.</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card" style={{ borderTop: '4px solid var(--primary-color)' }}>
          <div className="kpi-icon blue"><Users size={24} /></div>
          <div className="kpi-data">
            <h3>{stats.users}</h3>
            <p>Total Registered Users</p>
          </div>
        </div>

        <div className="kpi-card" style={{ borderTop: '4px solid #10b981' }}>
          <div className="kpi-icon green"><Package size={24} /></div>
          <div className="kpi-data">
            <h3>{stats.listings}</h3>
            <p>Active Equipment Listings</p>
          </div>
        </div>

        <div className="kpi-card" style={{ borderTop: '4px solid #f59e0b' }}>
          <div className="kpi-icon orange"><Activity size={24} /></div>
          <div className="kpi-data">
            <h3>{stats.deals}</h3>
            <p>Active Negotiations (Deals)</p>
          </div>
        </div>
      </div>

      <div className="admin-section" style={{ marginTop: '3rem', background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-soft)', boxShadow: 'var(--shadow-md)' }}>
        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
          Recent User Registrations
        </h3>
        
        {recentUsers.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '1rem 0' }}>Name / Company</th>
                <th style={{ padding: '1rem 0' }}>Role</th>
                <th style={{ padding: '1rem 0' }}>Status</th>
                <th style={{ padding: '1rem 0' }}>Joined</th>
                <th style={{ padding: '1rem 0' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '1rem 0' }}>
                    <strong>{u.full_name || 'N/A'}</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{u.company_name || 'Individual'}</div>
                  </td>
                  <td style={{ padding: '1rem 0' }}>
                    <span className={`role-badge ${u.role}`} style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}>
                      {u.role?.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 0' }}>
                    {u.is_verified ? (
                      <span style={{ color: '#10b981', fontWeight: '700', fontSize: '0.9rem' }}>✓ VERIFIED</span>
                    ) : (
                      <span style={{ color: '#f59e0b', fontWeight: '700', fontSize: '0.9rem' }}>PENDING</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem 0' }}>
                    {!u.is_verified && (
                      <button 
                        onClick={() => handleApproveUser(u.id)}
                        style={{ padding: '4px 12px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700' }}
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No recent registrations found.</p>
        )}
      </div>
    </div>
  );
};

export default AdminOverview;
