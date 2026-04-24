import { useState } from 'react';
import { UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';

const KYCUpload = () => {
  const { profile } = useAuthStore();
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('Business License');
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !profile?.id) return;

    setIsUploading(true);
    setError(null);

    try {
      // 1. Upload file to Supabase Storage bucket "kyc-documents"
      const fileExt = file.name.split('.').pop();
      const filePath = `${profile.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('kyc-documents')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 2. Get the public URL
      const { data: urlData } = supabase.storage
        .from('kyc-documents')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // 3. Insert record into kyc_documents table
      const { error: dbError } = await supabase.from('kyc_documents').insert([{
        user_id: profile.id,
        document_type: docType,
        file_url: publicUrl,
        status: 'pending'
      }]);

      if (dbError) throw dbError;

      setIsSuccess(true);
      setFile(null);
    } catch (err) {
      console.error('KYC Upload error:', err);
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="kyc-container success">
        <CheckCircle size={64} color="#10b981" />
        <h2>Document Submitted Successfully!</h2>
        <p>Our admin team will review your <strong>{docType}</strong> within 24-48 hours. You'll be notified once verified.</p>
        <button onClick={() => { setIsSuccess(false); setError(null); }} className="outline-btn mt-4">
          Upload Another Document
        </button>
      </div>
    );
  }

  return (
    <div className="kyc-container">
      <div className="kyc-header">
        <h2>Seller KYC Verification</h2>
        <p>Upload your business documents to get verified and unlock full platform access.</p>
      </div>

      <form onSubmit={handleUpload} className="kyc-form">
        {/* Document Type Selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
            Document Type
          </label>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '1rem' }}
          >
            <option>Business License</option>
            <option>Tax ID / GST Certificate</option>
            <option>Aadhar Card</option>
            <option>PAN Card</option>
            <option>Company Registration</option>
          </select>
        </div>

        <div className="upload-zone">
          <UploadCloud size={48} className="upload-icon" />
          <p>Drag and drop your document here, or click to browse</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Supports: PDF, JPG, PNG (Max 10MB)</p>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="file-input"
            required
          />
        </div>

        {file && (
          <div className="file-preview">
            <span>Selected File:</span>
            <strong>{file.name}</strong>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({(file.size / 1024).toFixed(1)} KB)</span>
          </div>
        )}

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#ef4444', marginTop: '1rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          className="auth-button primary mt-4"
          disabled={!file || isUploading}
        >
          {isUploading ? 'Uploading to Secure Storage...' : 'Submit for Verification'}
        </button>
      </form>
    </div>
  );
};

export default KYCUpload;
