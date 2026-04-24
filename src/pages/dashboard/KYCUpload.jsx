import { useState } from 'react';
import { UploadCloud, CheckCircle } from 'lucide-react';

const KYCUpload = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    // Note: Since this is a simple version, we are simulating the Supabase Storage upload
    // In production: await supabase.storage.from('kyc_documents').upload(...)
    
    setTimeout(() => {
      setIsUploading(false);
      setIsSuccess(true);
      setFile(null);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="kyc-container success">
        <CheckCircle size={64} color="#10b981" />
        <h2>Document Submitted Successfully!</h2>
        <p>Our team will review your business license within 24-48 hours.</p>
        <button onClick={() => setIsSuccess(false)} className="outline-btn mt-4">
          Upload Another Document
        </button>
      </div>
    );
  }

  return (
    <div className="kyc-container">
      <div className="kyc-header">
        <h2>Seller KYC Verification</h2>
        <p>Please upload your valid Business License or Tax ID to get verified.</p>
      </div>

      <form onSubmit={handleUpload} className="kyc-form">
        <div className="upload-zone">
          <UploadCloud size={48} className="upload-icon" />
          <p>Drag and drop your document here, or click to browse</p>
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
          </div>
        )}

        <button 
          type="submit" 
          className="auth-button primary mt-4" 
          disabled={!file || isUploading}
        >
          {isUploading ? 'Uploading...' : 'Submit Document'}
        </button>
      </form>
    </div>
  );
};

export default KYCUpload;
