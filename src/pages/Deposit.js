import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { loadScript } from '../utils/loadScript';

const Deposit = ({ session }) => {
  const [user, setUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchUserData();
    fetchTransactions();
  }, []);

  const fetchUserData = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    setUser(data);
  };

  const fetchTransactions = async () => {
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('type', 'deposit')
      .order('created_at', { ascending: false });
    
    setTransactions(data);
  };

  const handleDeposit = async () => {
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    setLoading(true);
    
    // Load Razorpay script dynamically
    const scriptLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    
    if (!scriptLoaded) {
      alert('Failed to load payment gateway. Please try again later.');
      setLoading(false);
      return;
    }
    
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY || 'rzp_test_1DP5mmOlF5G5ag', // Use test key as fallback
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      name: 'VideoEarn App',
      description: 'Deposit to Wallet',
      image: '/logo.png',
      handler: async (response) => {
        // Verify payment on server
        const paymentVerified = await verifyPayment(response.razorpay_payment_id);
        
        if (paymentVerified) {
          // Update user balance
          await supabase.rpc('increment_balance', {
            user_id: session.user.id,
            amount: parseFloat(amount)
          });
          
          // Add transaction record
          await supabase.from('transactions').insert({
            user_id: session.user.id,
            type: 'deposit',
            amount: parseFloat(amount),
            status: 'completed',
            razorpay_payment_id: response.razorpay_payment_id
          });
          
          alert('Deposit successful!');
          setAmount('');
          fetchUserData();
          fetchTransactions();
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
    
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const verifyPayment = async (paymentId) => {
    // In a real app, you would verify the payment on your server
    return true;
  };

  return (
    <div className="deposit-page">
      <div className="deposit-container">
        <h2>Deposit to Wallet</h2>
        
        <div className="balance-info">
          <div className="current-balance">
            <span>Current Balance:</span>
            <span className="amount">₹{user?.balance || 0}</span>
          </div>
        </div>
        
        <div className="deposit-form">
          <div className="form-group">
            <label>Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount to deposit"
              min="1"
            />
          </div>
          <button 
            onClick={handleDeposit} 
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Processing...' : 'Deposit Now'}
          </button>
        </div>
        
        <div className="deposit-history">
          <h3>Deposit History</h3>
          {transactions.length === 0 ? (
            <p>No deposit transactions yet</p>
          ) : (
            <div className="transaction-list">
              {transactions.map(transaction => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-info">
                    <span className="amount">₹{transaction.amount}</span>
                    <span className={`status ${transaction.status}`}>
                      {transaction.status}
                    </span>
                  </div>
                  <div className="transaction-date">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Deposit;
