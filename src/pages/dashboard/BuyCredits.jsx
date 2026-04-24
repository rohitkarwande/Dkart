import { useAuthStore } from '../../store/useAuthStore';
import { CreditCard, Zap, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const BuyCredits = () => {
  const { profile, addCredits } = useAuthStore();
  const currentCredits = profile?.credits_balance || 0;

  const handlePurchase = async (amount) => {
    if (!profile) return;
    
    const newBalance = (profile.credits_balance || 0) + amount;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ credits_balance: newBalance })
        .eq('id', profile.id);

      if (error) throw error;
      
      addCredits(amount); // Update local store
      alert(`Successfully added ${amount} credits to your account!`);
    } catch (err) {
      alert("Error processing purchase: " + err.message);
    }
  };

  return (
    <div className="credits-container">
      <div className="credits-header">
        <h2>Credit Balance</h2>
        <div className="current-balance">
          <Zap size={32} color="#f59e0b" />
          <span>{currentCredits} Credits Available</span>
        </div>
        <p className="credits-subtitle">Credits are used to unlock verified seller contact details and start negotiations.</p>
      </div>

      <div className="pricing-grid">
        {/* Starter Pack */}
        <div className="pricing-card">
          <div className="pricing-title">Starter</div>
          <div className="pricing-amount">10 Credits</div>
          <div className="pricing-price">₹500</div>
          <ul className="pricing-features">
            <li><CheckCircle size={16} /> 10 Contact Unlocks</li>
            <li><CheckCircle size={16} /> Standard Support</li>
          </ul>
          <button className="auth-button primary mt-4" onClick={() => handlePurchase(10)}>
            <CreditCard size={18} style={{ display: 'inline', marginRight: '8px' }} />
            Buy Starter Pack
          </button>
        </div>

        {/* Pro Pack */}
        <div className="pricing-card popular">
          <div className="popular-badge">Most Popular</div>
          <div className="pricing-title">Professional</div>
          <div className="pricing-amount">50 Credits</div>
          <div className="pricing-price">₹2,000 <span className="discount">Save ₹500</span></div>
          <ul className="pricing-features">
            <li><CheckCircle size={16} /> 50 Contact Unlocks</li>
            <li><CheckCircle size={16} /> Priority Support</li>
            <li><CheckCircle size={16} /> Analytics Dashboard</li>
          </ul>
          <button className="auth-button primary mt-4" onClick={() => handlePurchase(50)}>
            <CreditCard size={18} style={{ display: 'inline', marginRight: '8px' }} />
            Buy Professional Pack
          </button>
        </div>

        {/* Enterprise Pack */}
        <div className="pricing-card">
          <div className="pricing-title">Enterprise</div>
          <div className="pricing-amount">200 Credits</div>
          <div className="pricing-price">₹7,000</div>
          <ul className="pricing-features">
            <li><CheckCircle size={16} /> 200 Contact Unlocks</li>
            <li><CheckCircle size={16} /> Dedicated Account Manager</li>
            <li><CheckCircle size={16} /> Premium Badge</li>
          </ul>
          <button className="auth-button primary mt-4" onClick={() => handlePurchase(200)}>
            <CreditCard size={18} style={{ display: 'inline', marginRight: '8px' }} />
            Buy Enterprise Pack
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyCredits;
