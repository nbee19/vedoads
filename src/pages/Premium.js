import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { loadScript } from '../utils/loadScript';

const Premium = ({ session }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserData = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      setUser(data);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to fetch user data. Please try again.');
    }
  }, [session.user.id]);

  useEffect(() => {
    fetchUserData();
    loadScript('https://checkout.razorpay.com/v1/checkout.js')
      .then(() => setScriptLoaded(true))
      .catch((err) => {
        console.error('Failed to load Razorpay script:', err);
        setError('Failed to load payment gateway. Please try again later.');
      });
  }, [fetchUserData]);

  const handlePurchase = async () => {
    if (error) {
      alert('Payment gateway is not available. Please try again later.');
      return;
    }

    if (!scriptLoaded) {
      alert('Payment gateway is loading. Please try again in a moment.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY || 'rzp_test_1DP5mmOlF5G5ag',
        amount: 19900,
        currency: 'INR',
        name: 'VideoEarn App',
        description: 'Premium Membership',
        image: '/logo.png',
        handler: async (response) => {
          try {
            const { error: updateError } = await supabase
              .from('users')
              .update({ is_premium: true })
              .eq('id', session.user.id);
            
            if (updateError) throw updateError;
              
            const { error: transactionError } = await supabase.from('transactions').insert({
              user_id: session.user.id,
              type: 'deposit',
              amount: 199.00,
              status: 'completed',
              razorpay_payment_id: response.razorpay_payment_id
            });
            
            if (transactionError) throw transactionError;
            
            alert('Payment successful! You are now a premium member.');
            fetchUserData();
          } catch (err) {
            console.error('Error updating user status:', err);
            setError('Payment was successful but there was an error updating your account. Please contact support.');
          }
          setLoading(false);
        },
        prefill: {
          contact: session.user.phone
        },
        theme: {
          color: '#3399cc'
        },
        modal: {
          ondismiss: () => setLoading(false)
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Error opening Razorpay:', err);
      setError('Failed to open payment gateway. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="premium-page">
      <div className="premium-container">
        <h2>Premium Membership</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        {user?.is_premium ? (
          <div className="premium-status">
            <i className="fas fa-crown"></i>
            <h3>You're already a Premium Member!</h3>
            <p>Enjoy unlimited video watching and other benefits.</p>
          </div>
        ) : (
          <>
            <div className="premium-features">
              <div className="feature">
                <i className="fas fa-check-circle"></i>
                <span>Unlimited video watching</span>
              </div>
              <div className="feature">
                <i className="fas fa-check-circle"></i>
                <span>Higher earning rates</span>
              </div>
              <div className="feature">
                <i className="fas fa-check-circle"></i>
                <span>Priority withdrawal</span>
              </div>
              <div className="feature">
                <i className="fas fa-check-circle"></i>
                <span>Exclusive videos</span>
              </div>
            </div>
            
            <div className="pricing">
              <div className="price-card">
                <h3>One-time Payment</h3>
                <div className="price">₹199</div>
                <p>Lifetime access</p>
                <button 
                  onClick={handlePurchase} 
                  disabled={loading || !scriptLoaded}
                  className="btn-primary"
                >
                  {loading ? 'Processing...' : scriptLoaded ? 'Upgrade Now' : 'Loading...'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Premium;
