import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/useAuthStore';
import './PostListing.css';

const PostListing = () => {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    condition: 'new',
    price: '',
    location: '',
    description: '',
  });

  useEffect(() => {
    if (!profile || profile.role !== 'seller') {
      alert('You must be logged in as a Seller to post a listing.');
      navigate('/login');
    }
  }, [profile, navigate]);

  useEffect(() => {
    // Fetch categories on load
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('*');
      if (!error && data) {
        setCategories(data);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Fallback categories in case Supabase fetch fails
  const FALLBACK_CATEGORIES = [
    { id: '11111111-1111-1111-1111-111111111111', name: 'MRI Machines' },
    { id: '22222222-2222-2222-2222-222222222222', name: 'X-Ray Systems' },
    { id: '33333333-3333-3333-3333-333333333333', name: 'Ultrasound' }
  ];

  const displayCategories = categories.length > 0 ? categories : FALLBACK_CATEGORIES;

  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const handleImageFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({ ...prev, imageUrl: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.from('equipment_listings').insert([
      {
        seller_id: profile.id,
        title: formData.title,
        category_id: formData.category_id || null,
        condition: formData.condition,
        price: formData.price ? parseFloat(formData.price) : null,
        location: formData.location,
        description: formData.description,
        status: 'active',
        images: formData.imageUrl ? [formData.imageUrl] : [],
      },
    ]);

    setLoading(false);

    if (error) {
      alert('Error posting listing: ' + error.message);
    } else {
      alert('Listing posted successfully!');
      navigate('/');
    }
  };

  return (
    <div className="post-listing-container">
      <div className="post-listing-header">
        <h1>Post Equipment for Sale</h1>
        <p>List your medical equipment to thousands of verified buyers.</p>
      </div>

      <form className="post-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Listing Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            required
            placeholder="e.g. GE Optima MR360 1.5T"
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category_id">Category</label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
            >
              <option value="">Select Category</option>
              {displayCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="condition">Condition *</label>
            <select
              id="condition"
              name="condition"
              value={formData.condition}
              onChange={handleChange}
            >
              <option value="new">New</option>
              <option value="used">Used</option>
              <option value="refurbished">Refurbished</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Asking Price (₹)</label>
            <input
              type="number"
              id="price"
              name="price"
              placeholder="e.g. 5000000"
              value={formData.price}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <input
              type="text"
              id="location"
              name="location"
              required
              placeholder="e.g. Mumbai, Maharashtra"
              value={formData.location}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Detailed Description</label>
          <textarea
            id="description"
            name="description"
            rows="5"
            placeholder="Provide specifications, usage history, warranty details, etc."
            value={formData.description}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="form-group">
          <label>Equipment Image</label>
          <div 
            className={`image-upload-area ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput').click()}
            style={{ 
              border: isDragging ? '2px dashed var(--primary-color)' : '2px dashed var(--border-color)',
              backgroundColor: isDragging ? 'rgba(4, 120, 87, 0.05)' : '#fafafa',
              padding: '2rem',
              textAlign: 'center',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {formData.imageUrl ? (
              <img 
                src={formData.imageUrl} 
                alt="Preview" 
                style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'contain', zIndex: 1, position: 'relative' }} 
              />
            ) : (
              <div style={{ zIndex: 1, position: 'relative' }}>
                <div style={{ fontSize: '2rem', color: 'var(--primary-color)' }}>📸</div>
                <p style={{ margin: '0.5rem 0', fontWeight: '600', color: 'var(--text-main)' }}>
                  Click or drag image here to upload
                </p>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Supports JPG, PNG (Auto-converted to Base64)
                </span>
              </div>
            )}
            
            {formData.imageUrl && (
              <div 
                style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  zIndex: 2
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
              >
                Click or Drop to Change Image
              </div>
            )}
            
            <input 
              type="file" 
              id="fileInput" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleFileSelect}
            />
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Posting...' : 'Post Listing'}
        </button>
      </form>
    </div>
  );
};

export default PostListing;
