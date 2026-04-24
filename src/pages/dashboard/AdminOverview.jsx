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
  const [kycDocs, setKycDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [previewDoc, setPreviewDoc] = useState(null);

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

        // 3. Fetch Active Deals (Chats with equipment info)
        const { data: deals } = await supabase
          .from('chats')
          .select(`
            id, status, created_at, buyer_id, seller_id,
            equipment_listings (title, price)
          `)
          .order('created_at', { ascending: false })
          .limit(20);

        // Collect all buyer/seller IDs and fetch their profiles separately
        const dealUserIds = [...new Set(
          (deals || []).flatMap(d => [d.buyer_id, d.seller_id]).filter(Boolean)
        )];
        let dealProfiles = {};
        if (dealUserIds.length > 0) {
          const { data: dProfiles } = await supabase
            .from('profiles')
            .select('id, full_name, company_name')
            .in('id', dealUserIds);
          (dProfiles || []).forEach(p => { dealProfiles[p.id] = p; });
        }

        // Attach profile info to each deal
        const dealsWithProfiles = (deals || []).map(d => ({
          ...d,
          buyer: dealProfiles[d.buyer_id] || null,
          seller: dealProfiles[d.seller_id] || null,
        }));

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

        // 6. Fetch Pending KYC Docs
        const { data: kyc } = await supabase
          .from('kyc_documents')
          .select('*, profiles(full_name, company_name)')
          .order('submitted_at', { ascending: false });

        // Ensure we have public URLs if only paths were stored
        const kycWithUrls = kyc?.map(doc => {
          if (doc.file_url && !doc.file_url.startsWith('http')) {
            const { data } = supabase.storage.from('kyc-documents').getPublicUrl(doc.file_url);
            return { ...doc, file_url: data.publicUrl };
          }
          return doc;
        });

        setStats({
          users: userCount || 0,
          listings: listingCount || 0,
          deals: dealCount || 0,
          revenue: (listingCount || 0) * 1500 // Mock revenue logic
        });
        setRecentUsers(users || []);
        setActiveDeals(dealsWithProfiles);
        setTopProducts(products || []);
        setCompanies(uniqueCompanies);
        setKycDocs(kycWithUrls || []);
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

  const handleActionKYC = async (docId, userId, newStatus) => {
    try {
      // 1. Update document status
      const { error: docError } = await supabase
        .from('kyc_documents')
        .update({ status: newStatus })
        .eq('id', docId);

      if (docError) throw docError;

      // 2. If approved, verify the user profile too
      if (newStatus === 'approved') {
        await supabase.from('profiles').update({ is_verified: true }).eq('id', userId);
      }

      // 3. Refresh local state
      setKycDocs(prev => prev.map(d => d.id === docId ? { ...d, status: newStatus } : d));
      setRecentUsers(prev => prev.map(u => u.id === userId ? { ...u, is_verified: newStatus === 'approved' } : u));
      
      alert(`KYC ${newStatus} successfully.`);
    } catch (err) {
      alert("Error processing KYC: " + err.message);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading Admin Panel...</div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Platform Intelligence</h2>
        <p>Real-time analytics and management dashboard.</p>
      </div>

      <div className="admin-tabs">
        <button 
          onClick={() => setActiveTab('overview')} 
          className={activeTab === 'overview' ? 'active' : ''}
        >
          Insights
        </button>
        <button 
          onClick={() => setActiveTab('deals')} 
          className={activeTab === 'deals' ? 'active' : ''}
        >
          Live Negotiations
        </button>
        <button 
          onClick={() => setActiveTab('kyc')} 
          className={activeTab === 'kyc' ? 'active' : ''}
        >
          KYC Verifications
        </button>
        <button 
          onClick={() => setActiveTab('analytics')} 
          className={activeTab === 'analytics' ? 'active' : ''}
        >
          Growth Data
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon green"><Users size={28} /></div>
              <div className="kpi-data">
                <h3>{stats.users}</h3>
                <p>Platform Users</p>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon green-light"><Package size={28} /></div>
              <div className="kpi-data">
                <h3>{stats.listings}</h3>
                <p>Total Listings</p>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon green-dark"><Briefcase size={28} /></div>
              <div className="kpi-data">
                <h3>{stats.deals}</h3>
                <p>Negotiations</p>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon green-rich"><Activity size={28} /></div>
              <div className="kpi-data">
                <h3>₹{(stats.revenue / 100000).toFixed(1)}L</h3>
                <p>GMV Volume</p>
              </div>
            </div>
          </div>
          <div className="admin-grid-layout elite">
            {/* User Management */}
            <div className="admin-card">
              <h3><Users size={20} /> User Pipeline</h3>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Identity</th>
                      <th>Account</th>
                      <th>Verified</th>
                      <th>KYC Doc</th>
                      <th>Management</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map(u => (
                      <tr key={u.id}>
                        <td>
                          <strong>{u.full_name || 'New User'}</strong>
                          <div className="sub-text">{u.company_name || 'Individual'}</div>
                        </td>
                        <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                        <td>{u.is_verified ? '✅' : '⏳'}</td>
                        <td>
                          {kycDocs.find(d => d.user_id === u.id) ? (
                            <button 
                              onClick={() => setPreviewDoc(kycDocs.find(d => d.user_id === u.id))} 
                              className="sub-text" 
                              style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: 'var(--primary-color)', fontWeight: '700', textDecoration: 'underline' }}
                            >
                              View
                            </button>
                          ) : '—'}
                        </td>
                        <td>
                          {!u.is_verified && (
                            <button onClick={() => handleApproveUser(u.id)} className="approve-small-btn">Approve</button>
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
              <h3><TrendingUp size={20} /> Market Trends</h3>
              <div className="chart-container-elite">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={topProducts}>
                    <XAxis dataKey="title" hide />
                    <Tooltip cursor={{fill: 'rgba(5, 150, 105, 0.05)'}} />
                    <Bar dataKey="views_count" fill="var(--primary-color)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="trending-list-elite">
                {topProducts.map((p, i) => (
                  <div key={i} className="trending-row">
                    <span>{p.title}</span>
                    <span className="count">{p.views_count} views</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'kyc' && (
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3><ShieldCheck size={20} /> Seller KYC Verification Queue</h3>
            <span className="sub-text">{kycDocs.filter(d => d.status === 'pending').length} Pending Requests</span>
          </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Seller / Company</th>
                  <th>Document Type</th>
                  <th>Submission Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {kycDocs.map(doc => (
                  <tr key={doc.id}>
                    <td>
                      <strong>{doc.profiles?.full_name}</strong>
                      <div className="sub-text">{doc.profiles?.company_name}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Building2 size={16} color="var(--primary-color)" />
                        {doc.document_type}
                      </div>
                    </td>
                    <td>{new Date(doc.submitted_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${doc.status}`}>
                        {doc.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          onClick={() => setPreviewDoc(doc)}
                          className="approve-small-btn"
                          style={{ background: '#f1f5f9', color: 'var(--text-main)', border: '1px solid #e2e8f0' }}
                        >
                          View File
                        </button>
                        {doc.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleActionKYC(doc.id, doc.user_id, 'approved')}
                              className="approve-small-btn"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleActionKYC(doc.id, doc.user_id, 'rejected')}
                              className="approve-small-btn"
                              style={{ background: '#fef2f2', color: '#ef4444' }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {kycDocs.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No KYC documents submitted yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
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
      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="elite-modal-overlay" onClick={() => setPreviewDoc(null)}>
          <div className="elite-modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>KYC Document: {previewDoc.document_type}</h3>
              <button onClick={() => setPreviewDoc(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="doc-meta">
                <span>Submitted by: <strong>{previewDoc.profiles?.full_name}</strong></span>
                <span>Date: {new Date(previewDoc.submitted_at).toLocaleDateString()}</span>
              </div>
              <div className="doc-viewer">
                {previewDoc.file_url.match(/\.(jpeg|jpg|gif|png)$/) !== null ? (
                  <img src={previewDoc.file_url} alt="KYC Document" style={{ maxWidth: '100%', borderRadius: '12px' }} />
                ) : (
                  <iframe 
                    src={previewDoc.file_url} 
                    title="Document Viewer" 
                    width="100%" 
                    height="500px" 
                    style={{ border: 'none', borderRadius: '12px' }}
                  ></iframe>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOverview;
