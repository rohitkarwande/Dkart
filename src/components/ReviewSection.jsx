import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/useAuthStore';

const ReviewSection = ({ targetUserId, listingId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const { profile, user } = useAuthStore();

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          reviewer:reviewer_id(full_name, company_name)
        `)
        .eq('target_seller_id', targetUserId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setReviews(data);
      }
      setLoading(false);
    };

    if (targetUserId) {
      fetchReviews();
    }
  }, [targetUserId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newReview.comment.trim()) return;

    if (!profile && !user) {
      alert('You must be logged in to submit a review.');
      return;
    }

    const reviewerId = profile?.id || user?.id;

    if (!reviewerId) {
      alert('Your user ID is missing. Please try logging out and logging in again.');
      return;
    }

    // Ensure the profile exists in the database to prevent foreign key violations
    // (This handles legacy accounts or accounts created without the proper profile trigger)
    if (!profile?.id && user?.id) {
      const { error: profileUpsertError } = await supabase
        .from('profiles')
        .upsert([
          {
            id: user.id,
            role: 'buyer',
            full_name: user.email?.split('@')[0] || 'Buyer',
            company_name: 'Independent Buyer'
          }
        ], { onConflict: 'id' });
        
      if (profileUpsertError) {
        console.error("Profile auto-create error:", profileUpsertError);
      }
    }

    // In a real app, you would verify that the reviewer actually completed a deal with the targetUserId
    // For this prototype, we'll just insert it directly
    const { data, error } = await supabase
      .from('reviews')
      .insert([
        {
          reviewer_id: reviewerId,
          target_seller_id: targetUserId,
          listing_id: listingId || null,
          rating: parseInt(newReview.rating),
          comment: newReview.comment,
        }
      ])
      .select(`
        id,
        rating,
        comment,
        created_at,
        reviewer:reviewer_id(full_name, company_name)
      `);

    if (error) {
      console.error("Review submission error:", error);
      alert('Error submitting review');
    } else if (data) {
      setReviews(prev => [data[0], ...prev]);
      setNewReview({ rating: 5, comment: '' });
      alert('Review submitted!');
    }
  };

  return (
    <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
      <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Reviews & Ratings</h3>
      
      {/* Review Submission Form (Simplified) */}
      <form onSubmit={handleSubmitReview} style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
        <h4 style={{ marginBottom: '1rem' }}>Write a Review</h4>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <select 
            value={newReview.rating} 
            onChange={(e) => setNewReview({...newReview, rating: e.target.value})}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
          >
            {[5, 4, 3, 2, 1].map(num => (
              <option key={num} value={num}>{num} Stars</option>
            ))}
          </select>
        </div>
        <textarea 
          placeholder="Share your experience working with this seller..."
          value={newReview.comment}
          onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', marginBottom: '1rem', minHeight: '80px', fontFamily: 'inherit' }}
        />
        <button 
          type="submit" 
          disabled={!newReview.comment.trim()}
          style={{ 
            backgroundColor: 'var(--primary-color)', 
            color: 'white', 
            border: 'none', 
            padding: '0.75rem 1.5rem', 
            borderRadius: '4px', 
            fontWeight: '600',
            cursor: newReview.comment.trim() ? 'pointer' : 'not-allowed',
            opacity: newReview.comment.trim() ? 1 : 0.5
          }}
        >
          Submit Review
        </button>
      </form>

      {/* Reviews List */}
      {loading ? (
        <p>Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No reviews yet for this user.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {reviews.map(review => (
            <div key={review.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong style={{ color: 'var(--text-main)' }}>
                  {review.reviewer?.company_name || review.reviewer?.full_name || 'Anonymous User'}
                </strong>
                <span style={{ color: '#d97706', fontWeight: 'bold' }}>
                  {'⭐'.repeat(review.rating)}
                </span>
              </div>
              <p style={{ color: 'var(--text-main)', marginBottom: '0.5rem', lineHeight: '1.5' }}>
                {review.comment}
              </p>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
