import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import VerifiedBadge from '../components/VerifiedBadge';
import ReviewSection from '../components/ReviewSection';
import ContactUnlockModal from '../components/ContactUnlockModal';
import { useAuthStore } from '../store/useAuthStore';
import { MapPin, Calendar, Building, User, ShieldCheck, Box, ChevronRight } from 'lucide-react';
import './ListingDetails.css';

const ListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [existingChat, setExistingChat] = useState(null);
  const { profile } = useAuthStore();

  useEffect(() => {
    const fetchListing = async () => {
      // 1. Fetch the listing
      const { data: listingData, error: listingError } = await supabase
        .from('equipment_listings')
        .select('*, categories(name)')
        .eq('id', id)
        .single();

      if (listingError || !listingData) {
        console.error('Error fetching listing:', listingError);
        setLoading(false);
        return;
      }

      setListing(listingData);

      // 2. Fetch the seller's profile
      const { data: sellerData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', listingData.seller_id)
        .single();

      if (sellerData) setSeller(sellerData);

      // 3. Check if buyer already has an open chat for this listing
      if (profile?.id) {
        const { data: chatData } = await supabase
          .from('chats')
          .select('id')
          .eq('listing_id', listingData.id)
          .eq('buyer_id', profile.id)
          .maybeSingle();
        
        if (chatData) setExistingChat(chatData);
      }

      setLoading(false);
    };

    if (id) fetchListing();
  }, [id, profile?.id]);

  const handleContactSeller = () => {
    if (!profile) {
      navigate('/login');
      return;
    }
    // If chat already exists, go straight to messages
    if (existingChat) {
      navigate('/messages');
      return;
    }
    setIsModalOpen(true);
  };

  // Called after buyer confirms unlock in the modal
  const handleUnlockSuccess = async () => {
    try {
      // Create a chat room for the negotiation (chats IS the deal tracking table)
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .insert([{
          listing_id: listing.id,
          buyer_id: profile.id,
          seller_id: seller.id,
          status: 'open'
        }])
        .select()
        .single();

      if (chatError) throw chatError;

      // Send an opening message automatically
      await supabase.from('messages').insert([{
        chat_id: chatData.id,
        sender_id: profile.id,
        content: `Hi! I'm interested in your "${listing.title}". Can we discuss further?`
      }]);

      setExistingChat(chatData);
      setIsModalOpen(false);
      navigate('/messages');
    } catch (err) {
      console.error(err);
      alert('Error starting negotiation: ' + err.message);
    }
  };

  const handleRequestQuotation = async () => {
    if (!profile) {
      navigate('/login');
      return;
    }
    try {
      // Check for existing chat first
      let chat = existingChat;
      if (!chat) {
        const { data: chatData, error: chatError } = await supabase
          .from('chats')
          .insert([{
            listing_id: listing.id,
            buyer_id: profile.id,
            seller_id: seller.id,
            status: 'open'
          }])
          .select()
          .single();

        if (chatError) throw chatError;
        chat = chatData;
        setExistingChat(chat);
      }

      // Send a formal quotation request
      await supabase.from('messages').insert([{
        chat_id: chat.id,
        sender_id: profile.id,
        content: `Hello! I am interested in your "${listing.title}". Could you please provide a formal quotation including bulk pricing if available?`
      }]);

      navigate('/messages');
    } catch (err) {
      console.error(err);
      alert('Error requesting quotation: ' + err.message);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '5rem' }}>Loading Listing...</div>;
  if (!listing) return <div style={{ textAlign: 'center', padding: '5rem' }}>Listing not found!</div>;

  return (
    <div className="listing-details-container">
      <div className="listing-grid">
        {/* Left Column: Main Listing Content */}
        <div className="listing-main">
          <div className="image-gallery">
            <div className="gallery-main">
              {listing.images && listing.images.length > 0 ? (
                <img src={listing.images[0]} alt={listing.title} />
              ) : (
                <div className="image-placeholder">
                  <Box size={64} />
                  <p>No Images Available</p>
                </div>
              )}
            </div>
            <div className="gallery-badge">
              <ShieldCheck size={16} />
              Verified Listing
            </div>
          </div>

          <div className="listing-content">
            <div className="listing-header">
              <nav className="breadcrumb">
                <Link to="/">Home</Link> <ChevronRight size={14} />
                <Link to="/search">Equipment</Link> <ChevronRight size={14} />
                <span>{listing.categories?.name || 'Category'}</span>
              </nav>
              <h1>{listing.title}</h1>
              <div className="listing-location">
                <MapPin size={18} />
                <span>{listing.location}</span>
              </div>
              <div className="listing-badges">
                <span className="badge badge-condition">{listing.condition?.toUpperCase()}</span>
                {listing.categories?.name && (
                  <span className="badge badge-category">{listing.categories.name}</span>
                )}
              </div>
            </div>

            <div className="listing-section">
              <h2>Description</h2>
              <p>{listing.description || 'No description provided by the seller.'}</p>
            </div>

            <div className="listing-section">
              <div className="section-title">
                <Box size={20} />
                <h2>Specifications & Details</h2>
              </div>
              <ul className="specs-list">
                <li><strong>Condition:</strong> <span>{listing.condition}</span></li>
                <li><strong>Status:</strong> <span>{listing.status}</span></li>
                <li><strong>Listed On:</strong> <span>{new Date(listing.created_at).toLocaleDateString()}</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing and Seller Info */}
        <div className="listing-sidebar">
          <div className="price-card">
            <div className="price-display">
              {listing.price ? `₹${Number(listing.price).toLocaleString('en-IN')}` : 'Price on Request'}
            </div>

            <div className="action-buttons">
              {existingChat ? (
                <button className="btn-primary" onClick={() => navigate('/messages')}>
                  💬 Continue Negotiation
                </button>
              ) : (
                <button className="btn-primary" onClick={handleContactSeller}>
                  Contact Seller / Unlock
                </button>
              )}
              <button className="btn-secondary" onClick={handleRequestQuotation}>
                Request Quotation
              </button>
            </div>
          </div>

          {seller && (
            <div className="seller-card">
              <div className="seller-header">
                <div className="seller-avatar">
                  {seller.full_name ? seller.full_name[0] : 'S'}
                </div>
                <div className="seller-info">
                  <h3>{seller.company_name || 'Independent Seller'}</h3>
                  <VerifiedBadge isVerified={seller.is_verified} trustScore={seller.trust_score} />
                </div>
              </div>
              <div className="seller-details">
                <p><User size={16} /><span>{seller.full_name || 'Verified User'}</span></p>
                <p><Calendar size={16} /><span>Member since {new Date(seller.created_at).getFullYear()}</span></p>
                <p><Building size={16} /><span>Verified Business Entity</span></p>
              </div>
            </div>
          )}

          {seller && <ReviewSection targetUserId={seller.id} />}
        </div>
      </div>

      <ContactUnlockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        seller={seller}
        onUnlockSuccess={handleUnlockSuccess}
      />
    </div>
  );
};

export default ListingDetails;
