import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import VerifiedBadge from '../components/VerifiedBadge';
import ReviewSection from '../components/ReviewSection';
import ContactUnlockModal from '../components/ContactUnlockModal';
import { useAuthStore } from '../store/useAuthStore';
import { MapPin, Calendar, Building, User, ShieldCheck, Box, MessageSquare, Briefcase, ChevronRight } from 'lucide-react';
import './ListingDetails.css';

const ListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { profile, user } = useAuthStore();

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
      const { data: sellerData, error: sellerError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', listingData.seller_id)
        .single();

      if (!sellerError && sellerData) {
        setSeller(sellerData);
      }

      setLoading(false);
    };

    if (id) {
      fetchListing();
    }
  }, [id]);

  const handleContactSeller = () => {
    setIsModalOpen(true);
  };

  const handleUnlockSuccess = async (phone) => {
    try {
      // 1. Create Inquiry (Lead)
      const buyerId = profile?.id || user?.id;
      if (!buyerId) {
        alert('You must be logged in to contact the seller.');
        return;
      }

      const { data: inquiryData, error: inquiryError } = await supabase
        .from('inquiries')
        .insert([{
          listing_id: listing.id,
          buyer_id: buyerId,
          seller_id: seller?.id || null, 
          status: 'open'
        }])
        .select()
        .single();

      if (inquiryError) throw inquiryError;

      // 2. Create Chat Room
      const { data: chatData, error: chatError } = await supabase
        .from('chat_rooms')
        .insert([{
          inquiry_id: inquiryData.id
        }])
        .select()
        .single();
        
      if (chatError) throw chatError;

      // We don't immediately redirect so the user can see the phone number in the modal
      console.log("Deal and chat created. Phone: ", phone);
      
      // Optional: Store chatId so they can go there later or redirect
      // For now, we'll keep them in the modal to see the phone number
      
    } catch (err) {
      console.error(err);
      alert('Error creating deal/chat: ' + err.message);
    }
  };

  const handleRequestQuotation = async () => {
    try {
      // 1. Create Deal (Lead)
      const buyerId = profile?.id || user?.id;
      if (!buyerId) {
        navigate('/login', { state: { from: `/listing/${listing.id}` } });
        return;
      }

      const { data: dealData, error: dealError } = await supabase
        .from('deals')
        .insert([{
          listing_id: listing.id,
          buyer_id: buyerId,
          seller_id: seller?.id || null, 
          status: 'Open'
        }])
        .select()
        .single();

      if (dealError) {
        if (dealError.code === '23505') {
          // Deal already exists, fetch it first
          const { data: existingDeal } = await supabase
            .from('deals')
            .select('id')
            .eq('listing_id', listing.id)
            .eq('buyer_id', buyerId)
            .single();

          if (existingDeal) {
            // Now fetch the chat linked to this listing and buyer
            const { data: existingChat } = await supabase
              .from('chats')
              .select('id')
              .eq('listing_id', listing.id)
              .eq('buyer_id', buyerId)
              .single();
              
            if (existingChat) {
              navigate(`/messages?chatId=${existingChat.id}`);
              return;
            }
          }
        }
        throw dealError;
      }

      // 2. Create Associated Chat
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .insert([{
          listing_id: listing.id,
          buyer_id: buyerId,
          seller_id: seller?.id || null,
          status: 'active'
        }])
        .select()
        .single();
        
      if (chatError) throw chatError;

      // 3. Send Initial Quotation Request Message
      await supabase.from('messages').insert([{
        room_id: chatData.id,
        sender_id: buyerId,
        content: `Hello! I am interested in your ${listing.title}. Could you please provide a formal quotation?`
      }]);

      alert('Quotation Request Sent!');
      navigate(`/messages?chatId=${chatData.id}`);
      
    } catch (err) {
      console.error(err);
      alert('Error requesting quotation: ' + err.message);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem' }}>Loading Listing...</div>;
  }

  if (!listing) {
    return <div style={{ textAlign: 'center', padding: '5rem' }}>Listing not found!</div>;
  }

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
                <span className="badge badge-condition">
                  {listing.condition?.toUpperCase()}
                </span>
                {listing.categories?.name && (
                  <span className="badge badge-category">
                    {listing.categories.name}
                  </span>
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
                <li>
                  <strong>Condition:</strong> 
                  <span>{listing.condition}</span>
                </li>
                <li>
                  <strong>Status:</strong> 
                  <span>{listing.status}</span>
                </li>
                <li>
                  <strong>Listed On:</strong> 
                  <span>{new Date(listing.created_at).toLocaleDateString()}</span>
                </li>
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
              <button className="btn-primary" onClick={handleContactSeller}>
                Contact Seller / Unlock
              </button>
              <button className="btn-secondary" onClick={handleRequestQuotation}>
                Request Quotation
              </button>
            </div>
          </div>

          {seller && (
            <div className="seller-card">
              <div className="seller-header">
                <div className="seller-avatar">
                  {seller.first_name ? seller.first_name[0] : seller.full_name ? seller.full_name[0] : 'S'}
                </div>
                <div className="seller-info">
                  <h3>{seller.company_name || 'Independent Seller'}</h3>
                  <VerifiedBadge isVerified={seller.is_verified} trustScore={seller.trust_score} />
                </div>
              </div>
              
              <div className="seller-details">
                <p>
                  <User size={16} />
                  <span>{seller.full_name || 'Verified User'}</span>
                </p>
                <p>
                  <Calendar size={16} />
                  <span>Member since {new Date(seller.created_at).getFullYear()}</span>
                </p>
                <p>
                  <Building size={16} />
                  <span>Verified Business Entity</span>
                </p>
              </div>
            </div>
          )}
          
          {/* Reviews Section */}
          {seller && <ReviewSection targetUserId={seller.id} listingId={id} />}
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
