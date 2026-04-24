import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Link } from 'react-router-dom';
import { X, Lock, PhoneCall, CheckCircle } from 'lucide-react';

const ContactUnlockModal = ({ isOpen, onClose, seller, onUnlockSuccess }) => {
  const { profile, deductCredit } = useAuthStore();
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockedPhone, setUnlockedPhone] = useState(null);

  if (!isOpen) return null;

  const creditsBalance = profile?.credits_balance || 0;
  const hasEnoughCredits = creditsBalance >= 1;

  const handleUnlock = () => {
    setIsUnlocking(true);
    
    // Simulate API delay
    setTimeout(() => {
      deductCredit();
      // Simulate fetching the phone number
      const phone = seller?.phone_number || '+91 98765 43210';
      setUnlockedPhone(phone);
      setIsUnlocking(false);
      
      if (onUnlockSuccess) {
        onUnlockSuccess(phone);
      }
    }, 800);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        {unlockedPhone ? (
          <div className="modal-success-state">
            <CheckCircle size={48} color="#10b981" />
            <h2>Contact Unlocked!</h2>
            <p>You can now reach out to the seller directly.</p>
            
            <div className="phone-display">
              <PhoneCall size={20} />
              <span>{unlockedPhone}</span>
            </div>

            <button className="auth-button primary" onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <div className="modal-unlock-state">
            <div className="modal-icon-header">
              <Lock size={48} color="var(--primary-color)" />
            </div>
            
            <h2>Unlock Seller Details</h2>
            <p>You are about to unlock contact information for <strong>{seller?.company_name || 'this seller'}</strong>.</p>
            
            <div className="credit-cost-box">
              <div className="cost-row">
                <span>Cost:</span>
                <strong>1 Credit</strong>
              </div>
              <div className="cost-row">
                <span>Your Balance:</span>
                <strong className={hasEnoughCredits ? 'text-green' : 'text-red'}>
                  {creditsBalance} Credits
                </strong>
              </div>
            </div>

            {hasEnoughCredits ? (
              <button 
                className="auth-button primary" 
                onClick={handleUnlock}
                disabled={isUnlocking}
              >
                {isUnlocking ? 'Unlocking...' : 'Confirm Unlock'}
              </button>
            ) : (
              <div className="insufficient-funds">
                <p>You do not have enough credits.</p>
                <Link to="/dashboard/credits" className="auth-button secondary" onClick={onClose}>
                  Buy More Credits
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactUnlockModal;
