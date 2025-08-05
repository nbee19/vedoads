import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { loadScript } from '../utils/loadScript';

const Deposit = ({ session }) => {
  const [user, setUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserData();
    fetchTransactions();
    loadScript('https://checkout.razorpay.com/v1/checkout.js')
      .then(() => setScriptLoaded(true))
      .catch((err) => {
        console.error('Failed to load Razorpay script:', err);
        setError('Failed to load payment gateway. Please try again later.');
      });
  }, []);

  const fetchUserData = async () => {
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
  };

  const fetchTransactions = async () => {
    try {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('type', 'deposit')
        .order('created_at', { ascending: false });
      
      setTransactions(data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to fetch transactions. Please try again.');
    }
  };

  const handleDeposit = async () => {
    if (error) {
      alert('Payment gateway is not available. Please try again later.');
      return;
    }

    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
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
        amount: amount * 100,
        currency: 'INR',
        name: 'VideoEarn App',
        description: 'Deposit to Wallet',
        image: '/logo.png',
        handler: async (response) => {
          try {
            const { error: balanceError } = await supabase.rpc('increment_balance', {
              user_id: session.user.id,
              amount: parseFloat(amount)
            });
            
            if (balanceError) throw balanceError;
            
            const { error: transactionError } = await supabase.from('transactions').insert({
              user_id: session.user.id,
              type: 'deposit',
              amount: parseFloat(amount),
              status: 'completed',
              razorpay_payment_id: response.razorpay_payment_id
            });
            
            if (transactionError) throw transactionError;
            
            alert('Deposit successful!');
            setAmount('');
            fetchUserData();
            fetchTransactions();
          } catch (err) {
            console.error('Error updating balance:', err);
            setError('Payment was successful but there was an error updating your balance. Please contact support.');
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
    <div className="deposit-page">
      <div className="deposit-container">
        <h2>Deposit to Wallet</h2>
        
        {error && <div className="error-message">{error}</div>}
        
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
            disabled={loading || !scriptLoaded}
            className="btn-primary"
          >
            {loading ? 'Processing...' : scriptLoaded ? 'Deposit Now' : 'Loading...'}
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
