import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuthStore } from '../../store/useAuthStore';
import { User, Building, MapPin, Phone, FileText, Save, ShieldCheck } from 'lucide-react';
import './Profile.css'; // Reuse profile layout styles

const Settings = () => {
  const { profile, setProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    phone_number: '',
    business_address: '',
    gst_number: '',
    business_description: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        company_name: profile.company_name || '',
        phone_number: profile.phone_number || '',
        business_address: profile.business_address || '',
        gst_number: profile.gst_number || '',
        business_description: profile.business_description || ''
      });
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          company_name: formData.company_name,
          phone_number: formData.phone_number,
          business_address: formData.business_address,
          gst_number: formData.gst_number,
          business_description: formData.business_description
        })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-profile-container">
      <div className="profile-welcome-banner" style={{ minHeight: 'auto', padding: '2rem' }}>
        <div className="welcome-text">
          <h1>Account Settings</h1>
          <p>Update your business profile and contact information for the B2B marketplace.</p>
        </div>
      </div>

      <div className="settings-main-container" style={{ marginTop: '2rem' }}>
        <form onSubmit={handleSubmit} className="settings-form-grid">
          
          {/* Section 1: Personal & Primary Contact */}
          <div className="profile-section">
            <div className="profile-section-header">
              <h2><User size={20} /> Identity & Contact</h2>
            </div>
            <div className="settings-inputs">
              <div className="form-group">
                <label>Contact Person Name</label>
                <div className="input-with-icon">
                  <User size={18} />
                  <input 
                    type="text" 
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Primary Phone Number</label>
                <div className="input-with-icon">
                  <Phone size={18} />
                  <input 
                    type="text" 
                    value={formData.phone_number}
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                    placeholder="+91 00000 00000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Business Details */}
          <div className="profile-section">
            <div className="profile-section-header">
              <h2><Building size={20} /> Business Information</h2>
            </div>
            <div className="settings-inputs">
              <div className="form-group">
                <label>Legal Company Name</label>
                <div className="input-with-icon">
                  <Building size={18} />
                  <input 
                    type="text" 
                    value={formData.company_name}
                    onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                    placeholder="e.g. MedLife Solutions Pvt Ltd"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>GST/Tax ID Number (Optional)</label>
                <div className="input-with-icon">
                  <FileText size={18} />
                  <input 
                    type="text" 
                    value={formData.gst_number}
                    onChange={(e) => setFormData({...formData, gst_number: e.target.value})}
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label>Business Address</label>
                <div className="input-with-icon">
                  <MapPin size={18} />
                  <input 
                    type="text" 
                    value={formData.business_address}
                    onChange={(e) => setFormData({...formData, business_address: e.target.value})}
                    placeholder="Detailed office/warehouse address"
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label>Business Description</label>
                <textarea 
                  value={formData.business_description}
                  onChange={(e) => setFormData({...formData, business_description: e.target.value})}
                  placeholder="Tell buyers/sellers more about your business..."
                  rows={4}
                />
              </div>
            </div>
          </div>

          <div className="settings-footer-actions">
            {success && (
              <div className="success-badge">
                <ShieldCheck size={18} /> Profile Updated Successfully!
              </div>
            )}
            <button type="submit" className="save-settings-btn" disabled={loading}>
              {loading ? 'Saving...' : <><Save size={18} /> Save All Changes</>}
            </button>
          </div>

        </form>
      </div>

      <style jsx>{`
        .settings-form-grid {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .settings-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-top: 1.5rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .form-group.full-width {
          grid-column: 1 / -1;
        }
        .form-group label {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text-main);
        }
        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-with-icon svg {
          position: absolute;
          left: 1rem;
          color: var(--text-muted);
        }
        .input-with-icon input {
          width: 100%;
          padding: 0.8rem 1rem 0.8rem 2.8rem;
          border: 1px solid var(--border-soft);
          border-radius: var(--radius-md);
          font-family: inherit;
          font-size: 1rem;
          transition: border-color 0.2s;
        }
        .input-with-icon input:focus {
          outline: none;
          border-color: var(--primary-color);
        }
        textarea {
          width: 100%;
          padding: 1rem;
          border: 1px solid var(--border-soft);
          border-radius: var(--radius-md);
          font-family: inherit;
          font-size: 1rem;
          resize: vertical;
        }
        textarea:focus {
          outline: none;
          border-color: var(--primary-color);
        }
        .settings-footer-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 1.5rem;
          margin-top: 1rem;
          padding: 2rem;
          background: white;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-soft);
        }
        .save-settings-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, opacity 0.2s;
        }
        .save-settings-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .success-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #10b981;
          font-weight: 600;
        }
        @media (max-width: 768px) {
          .settings-inputs {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Settings;
