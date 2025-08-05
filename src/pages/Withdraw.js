import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const Withdraw = ({ session }) => {
  const [user, setUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountName: '',
    accountNumber: '',
    ifsc: '',
    bankName: ''
  });
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
      .eq('type', 'withdrawal')
      .order('created_at', { ascending: false });
    
    setTransactions(data);
  };

  const handleWithdraw = async () => {
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    if (parseFloat(amount) > (user?.balance || 0)) {
      alert('Insufficient balance');
      return;
    }
    
    if (!bankDetails.accountName || !bankDetails.accountNumber || !bankDetails.ifsc) {
      alert('Please fill all bank details');
      return;
    }
    
    setLoading(true);
    
    // Add withdrawal request
    await supabase.from('transactions').insert({
      user_id: session.user.id,
      type: 'withdrawal',
      amount: parseFloat(amount),
      status: 'pending',
      bank_details: bankDetails
    });
    
    // Deduct from user balance
    await supabase.rpc('decrement_balance', {
      user_id: session.user.id,
      amount: parseFloat(amount)
    });
    
    alert('Withdrawal request submitted successfully!');
    setAmount('');
    setBankDetails({
      accountName: '',
      accountNumber: '',
      ifsc: '',
      bankName: ''
    });
    fetchUserData();
    fetchTransactions();
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBankDetails({
      ...bankDetails,
      [name]: value
    });
  };

  return (
    <div className="withdraw-page">
      <div className="withdraw-container">
        <h2>Withdraw Earnings</h2>
        
        <div className="balance-info">
          <div className="current-balance">
            <span>Available Balance:</span>
            <span className="amount">₹{user?.balance || 0}</span>
          </div>
        </div>
        
        <div className="withdraw-form">
          <div className="form-group">
            <label>Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount to withdraw"
              min="1"
              max={user?.balance || 0}
            />
          </div>
          
          <h3>Bank Details</h3>
          <div className="form-group">
            <label>Account Holder Name</label>
            <input
              type="text"
              name="accountName"
              value={bankDetails.accountName}
              onChange={handleInputChange}
              placeholder="Enter account holder name"
            />
          </div>
          <div className="form-group">
            <label>Account Number</label>
            <input
              type="text"
              name="accountNumber"
              value={bankDetails.accountNumber}
              onChange={handleInputChange}
              placeholder="Enter account number"
            />
          </div>
          <div className="form-group">
            <label>IFSC Code</label>
            <input
              type="text"
              name="ifsc"
              value={bankDetails.ifsc}
              onChange={handleInputChange}
              placeholder="Enter IFSC code"
            />
          </div>
          <div className="form-group">
            <label>Bank Name</label>
            <input
              type="text"
              name="bankName"
              value={bankDetails.bankName}
              onChange={handleInputChange}
              placeholder="Enter bank name"
            />
          </div>
          
          <button 
            onClick={handleWithdraw} 
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Processing...' : 'Withdraw Now'}
          </button>
        </div>
        
        <div className="withdraw-history">
          <h3>Withdrawal History</h3>
          {transactions.length === 0 ? (
            <p>No withdrawal transactions yet</p>
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

export default Withdraw;
