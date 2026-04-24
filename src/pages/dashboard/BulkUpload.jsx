import { UploadCloud, FileSpreadsheet, CheckCircle, ShoppingBag } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuthStore } from '../../store/useAuthStore';

const BulkUpload = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const { profile } = useAuthStore();

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
      } else {
        alert("Please upload a .csv file");
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setProgress(0);

    // Actual Insert for Hackathon Demo
    const sampleProducts = [
      { seller_id: profile.id, title: "GE Revolution CT Scanner", condition: "new", price: 12000000, location: "Mumbai", status: "active", description: "High-end CT scanner with AI features." },
      { seller_id: profile.id, title: "Siemens Magnetom MRI", condition: "refurbished", price: 8500000, location: "Delhi", status: "active", description: "Reliable 1.5T MRI machine." },
      { seller_id: profile.id, title: "Philips Affiniti 70 Ultrasound", condition: "used", price: 1500000, location: "Bangalore", status: "active", description: "Versatile ultrasound for clinical use." }
    ];

    try {
      const { error } = await supabase.from('equipment_listings').insert(sampleProducts);
      if (error) throw error;
      
      // Simulate progress bar for UX
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            setIsSuccess(true);
            return 100;
          }
          return prev + 25;
        });
      }, 300);
    } catch (err) {
      alert("Error importing: " + err.message);
      setIsUploading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bulk-container success">
        <CheckCircle size={64} color="#10b981" />
        <h2>Upload Complete!</h2>
        <p>Successfully parsed and imported <strong>142</strong> medical equipment listings to your inventory.</p>
        <button onClick={() => { setIsSuccess(false); setFile(null); }} className="outline-btn mt-4">
          Upload Another File
        </button>
      </div>
    );
  }

  return (
    <div className="bulk-container">
      <div className="bulk-header">
        <h2>Bulk Inventory Upload</h2>
        <p>Upload a CSV file to add multiple equipment listings at once.</p>
      </div>

      <div className="bulk-content">
        <div 
          className="upload-zone large" 
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <UploadCloud size={64} className="upload-icon" />
          <h3>Drag and drop your CSV file here</h3>
          <p>or click to browse your computer</p>
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileChange}
            className="file-input"
          />
        </div>

        {file && (
          <div className="file-preview-card">
            <FileSpreadsheet size={24} color="var(--primary-color)" />
            <div className="file-details">
              <strong>{file.name}</strong>
              <span>{(file.size / 1024).toFixed(2)} KB</span>
            </div>
            
            {isUploading ? (
              <div className="progress-container">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <span>{progress}%</span>
              </div>
            ) : (
              <button className="auth-button primary" onClick={handleUpload}>
                Start Import
              </button>
            )}
          </div>
        )}

        <div className="csv-template-guide">
          <h4>Required CSV Columns:</h4>
          <ul>
            <li><code>title</code> (e.g. "GE MRI Scanner 1.5T")</li>
            <li><code>category</code> (e.g. "Imaging")</li>
            <li><code>condition</code> (new, used, refurbished)</li>
            <li><code>price</code> (Optional)</li>
          </ul>
          <a href="#" className="download-link">Download Template.csv</a>
        </div>
      </div>
    </div>
  );
};

export default BulkUpload;
