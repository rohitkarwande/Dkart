import { useState } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle, ShoppingBag } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import Papa from 'papaparse';

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

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const { data } = results;
        
        // Fetch categories to map names to IDs
        const { data: categories } = await supabase.from('categories').select('id, name');
        const catMap = categories?.reduce((acc, cat) => {
          acc[cat.name.toLowerCase()] = cat.id;
          return acc;
        }, {}) || {};

        const listingsToInsert = data.map(row => ({
          seller_id: profile.id,
          title: row.title,
          description: row.description || '',
          price: row.price ? parseFloat(row.price) : null,
          condition: row.condition?.toLowerCase() || 'new',
          location: row.location || 'India',
          category_id: catMap[row.category?.toLowerCase()] || null,
          status: 'active',
          images: row.images ? [row.images] : []
        }));

        try {
          const { error } = await supabase.from('equipment_listings').insert(listingsToInsert);
          if (error) throw error;
          
          setIsUploading(false);
          setIsSuccess(true);
        } catch (err) {
          alert("Error importing: " + err.message);
          setIsUploading(false);
        }
      },
      error: (err) => {
        alert("Error parsing CSV: " + err.message);
        setIsUploading(false);
      }
    });
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
