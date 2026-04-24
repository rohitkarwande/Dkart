import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
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

        // Fetch recent users
        const { data: users, error: recentError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (!userError && !listingError) {
          setStats({
            users: userCount || 0,
            listings: listingCount || 0,
            deals: 12 // Simulated for hackathon
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

  if (loading) return <div style={{ padding: '2rem' }}>Loading Admin Panel...</div>;

  return (
    <div className="admin-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="admin-header" style={{ marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e3a8a' }}>
          <ShieldCheck size={28} />
          Platform Administration
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>Overview of marketplace activity and user management.</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card" style={{ borderTop: '4px solid #3b82f6' }}>
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

        <div className="kpi-card" style={{ borderTop: '4px solid #8b5cf6' }}>
          <div className="kpi-icon purple"><Activity size={24} /></div>
          <div className="kpi-data">
            <h3>{stats.deals}</h3>
            <p>Active Negotiations (Deals)</p>
          </div>
        </div>
      </div>

      <div className="admin-section" style={{ marginTop: '3rem', background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
          Recently Registered Users
        </h3>
        
        {recentUsers.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '1rem 0' }}>Name / Company</th>
                <th style={{ padding: '1rem 0' }}>Role</th>
                <th style={{ padding: '1rem 0' }}>Status</th>
                <th style={{ padding: '1rem 0' }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '1rem 0' }}>
                    <strong>{u.full_name || 'N/A'}</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{u.company_name}</div>
                  </td>
                  <td style={{ padding: '1rem 0' }}>
                    <span className="role-badge" style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 0' }}>
                    {u.is_verified ? (
                      <span style={{ color: '#10b981', fontWeight: '500', fontSize: '0.9rem' }}>✓ Verified</span>
                    ) : (
                      <span style={{ color: '#f59e0b', fontWeight: '500', fontSize: '0.9rem' }}>Pending</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No users found.</p>
        )}
      </div>
    </div>
  );
};

export default AdminOverview;
