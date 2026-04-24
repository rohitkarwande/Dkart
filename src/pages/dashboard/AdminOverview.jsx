import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { Users, Package, Activity, ShieldCheck, TrendingUp, BarChart3, Briefcase, Building2, ExternalLink } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

const AdminOverview = () => {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, listings: 0, deals: 0, revenue: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [activeDeals, setActiveDeals] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!profile || profile.role !== 'admin') {
      alert('Access Denied. Admins only.');
      navigate('/dashboard');
      return;
    }

    const fetchAdminData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Stats
        const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: listingCount } = await supabase.from('equipment_listings').select('*', { count: 'exact', head: true });
        const { count: dealCount } = await supabase.from('chats').select('*', { count: 'exact', head: true });

        // 2. Fetch Recent Users
        const { data: users } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(8);

        // 3. Fetch Active Deals (Chats with Joins)
        const { data: deals } = await supabase
          .from('chats')
          .select(`
            id, status, created_at,
            equipment_listings (title, price),
            buyer:profiles!buyer_id (full_name, company_name),
            seller:profiles!seller_id (full_name, company_name)
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        // 4. Fetch Top Products (by views)
        const { data: products } = await supabase
          .from('equipment_listings')
          .select('title, views_count, price')
          .order('views_count', { ascending: false })
          .limit(5);

        // 5. Fetch Unique Companies
        const { data: profileCompanies } = await supabase
          .from('profiles')
          .select('company_name, role')
          .not('company_name', 'is', null)
          .limit(50);

        const uniqueCompanies = [...new Set(profileCompanies.map(p => p.company_name))].slice(0, 10);

        setStats({
          users: userCount || 0,
          listings: listingCount || 0,
          deals: dealCount || 0,
          revenue: (listingCount || 0) * 1500 // Mock revenue logic
        });
        setRecentUsers(users || []);
        setActiveDeals(deals || []);
        setTopProducts(products || []);
        setCompanies(uniqueCompanies);
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

      <div className="admin-tabs" style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--border-soft)' }}>
        <button 
          onClick={() => setActiveTab('overview')} 
          style={{ padding: '1rem 0', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '700', color: activeTab === 'overview' ? 'var(--primary-color)' : 'var(--text-muted)', borderBottom: activeTab === 'overview' ? '3px solid var(--primary-color)' : '3px solid transparent' }}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('deals')} 
          style={{ padding: '1rem 0', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '700', color: activeTab === 'deals' ? 'var(--primary-color)' : 'var(--text-muted)', borderBottom: activeTab === 'deals' ? '3px solid var(--primary-color)' : '3px solid transparent' }}
        >
          All Deals
        </button>
        <button 
          onClick={() => setActiveTab('analytics')} 
          style={{ padding: '1rem 0', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '700', color: activeTab === 'analytics' ? 'var(--primary-color)' : 'var(--text-muted)', borderBottom: activeTab === 'analytics' ? '3px solid var(--primary-color)' : '3px solid transparent' }}
        >
          Advanced Analysis
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="kpi-grid">
            <div className="kpi-card" style={{ borderTop: '4px solid var(--primary-color)' }}>
              <div className="kpi-icon blue"><Users size={24} /></div>
              <div className="kpi-data">
                <h3>{stats.users}</h3>
                <p>Total Users</p>
              </div>
            </div>

            <div className="kpi-card" style={{ borderTop: '4px solid #10b981' }}>
              <div className="kpi-icon green"><Package size={24} /></div>
              <div className="kpi-data">
                <h3>{stats.listings}</h3>
                <p>Active Listings</p>
              </div>
            </div>

            <div className="kpi-card" style={{ borderTop: '4px solid #f59e0b' }}>
              <div className="kpi-icon orange"><Briefcase size={24} /></div>
              <div className="kpi-data">
                <h3>{stats.deals}</h3>
                <p>Platform Deals</p>
              </div>
            </div>

            <div className="kpi-card" style={{ borderTop: '4px solid #8b5cf6' }}>
              <div className="kpi-icon purple"><TrendingUp size={24} /></div>
              <div className="kpi-data">
                <h3>₹{(stats.revenue / 100000).toFixed(1)}L</h3>
                <p>Estimated GMV</p>
              </div>
            </div>
          </div>

          <div className="admin-grid-layout" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginTop: '3rem' }}>
            {/* User Management */}
            <div className="admin-card">
              <h3>Recent Registrations</h3>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User / Company</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map(u => (
                      <tr key={u.id}>
                        <td>
                          <strong>{u.full_name || 'New User'}</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.company_name || 'Individual'}</div>
                        </td>
                        <td><span className={`role-badge ${u.role}`}>{u.role?.toUpperCase()}</span></td>
                        <td>{u.is_verified ? '✅' : '⏳'}</td>
                        <td>
                          {!u.is_verified && (
                            <button onClick={() => handleApproveUser(u.id)} className="approve-small-btn">Verify</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Trending Analysis */}
            <div className="admin-card">
              <h3>Top Trending Equipment</h3>
              <div style={{ height: '300px', width: '100%', marginTop: '1rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="title" hide />
                    <YAxis />
                    <Tooltip cursor={{fill: 'rgba(5, 150, 105, 0.1)'}} />
                    <Bar dataKey="views_count" fill="var(--primary-color)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="trending-list" style={{ marginTop: '1rem' }}>
                {topProducts.map((p, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-soft)' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{p.title}</span>
                    <span style={{ color: 'var(--primary-color)', fontWeight: '700' }}>{p.views_count} views</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'deals' && (
        <div className="admin-card" style={{ marginTop: '0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3>Platform Negotiations (Live Deals)</h3>
            <button onClick={() => fetchAdminData()} className="outline-btn small">Refresh Live Data</button>
          </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Deal ID</th>
                  <th>Equipment</th>
                  <th>Buyer</th>
                  <th>Seller</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {activeDeals.map(deal => (
                  <tr key={deal.id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>#{deal.id.substring(0, 8)}</td>
                    <td>
                      <strong>{deal.equipment_listings?.title}</strong>
                      <div style={{ color: 'var(--primary-color)', fontWeight: '600' }}>₹{deal.equipment_listings?.price?.toLocaleString()}</div>
                    </td>
                    <td>{deal.buyer?.company_name || deal.buyer?.full_name}</td>
                    <td>{deal.seller?.company_name || deal.seller?.full_name}</td>
                    <td><span className={`status-badge ${deal.status?.toLowerCase()}`}>{deal.status}</span></td>
                    <td>{new Date(deal.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="analytics-view">
          <div className="admin-grid-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="admin-card">
              <h3>Growth Metrics (New Listings)</h3>
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer>
                  <AreaChart data={[
                    {name: 'Jan', val: 4}, {name: 'Feb', val: 7}, {name: 'Mar', val: 12}, 
                    {name: 'Apr', val: stats.listings}
                  ]}>
                    <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="val" stroke="var(--primary-color)" fillOpacity={1} fill="url(#colorVal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="admin-card">
              <h3>Listed Key Companies</h3>
              <div className="company-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                {companies.map((company, i) => (
                  <div key={i} className="company-badge" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem', background: 'var(--bg-light)', borderRadius: '8px', border: '1px solid var(--border-soft)' }}>
                    <Building2 size={20} color="var(--primary-color)" />
                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{company}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOverview;
