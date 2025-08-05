import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const Premium = ({ session }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    setUser(data);
  };

  const handlePurchase = async () => {
    setLoading(true);
    
    const options = {
      key: 'YOUR_RAZORPAY_KEY', // Replace with your Razorpay key
      amount: 19900, // 199 INR in paise
      currency: 'INR',
      name: 'VideoEarn App',
      description: 'Premium Membership',
      image: '/logo.png',
      handler: async (response) => {
        // Verify payment on server
        const paymentVerified = await verifyPayment(response.razorpay_payment_id);
        
        if (paymentVerified) {
          // Update user to premium
          await supabase
            .from('users')
            .update({ is_premium: true })
            .eq('id', session.user.id);
            
          // Add transaction record
          await supabase.from('transactions').insert({
            user_id: session.user.id,
            type: 'deposit',
            amount: 199.00,
            status: 'completed',
            razorpay_payment_id: response.razorpay_payment_id
          });
          
          alert('Payment successful! You are now a premium member.');
          fetchUserData();
        } else {
          alert('Payment verification failed. Please contact support.');
        }
        
        setLoading(false);
      },
      prefill: {
        contact: session.user.phone
      },
      theme: {
        color: '#3399cc'
      }
    };
    
    const rzp = new Razorpay(options);
    rzp.open();
  };

  const verifyPayment = async (paymentId) => {
    // In a real app, you would verify the payment on your server
    // This is a simplified version
    return true;
  };

  return (
    <div className="premium-page">
      <div className="premium-container">
        <h2>Premium Membership</h2>
        
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
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Processing...' : 'Upgrade Now'}
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
