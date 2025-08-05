import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const AdminDashboard = ({ session }) => {
  const [users, setUsers] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [settings, setSettings] = useState({});
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    fetchUsers();
    fetchWithdrawals();
    fetchDeposits();
    fetchReferrals();
    fetchSettings();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase.from('users').select('*');
    setUsers(data);
  };

  const fetchWithdrawals = async () => {
    const { data } = await supabase
      .from('transactions')
      .select(`
        *,
        user:users!user_id(mobile_number)
      `)
      .eq('type', 'withdrawal')
      .order('created_at', { ascending: false });
    
    setWithdrawals(data);
  };

  const fetchDeposits = async () => {
    const { data } = await supabase
      .from('transactions')
      .select(`
        *,
        user:users!user_id(mobile_number)
      `)
      .eq('type', 'deposit')
      .order('created_at', { ascending: false });
    
    setDeposits(data);
  };

  const fetchReferrals = async () => {
    const { data } = await supabase
      .from('referrals')
      .select(`
        *,
        referrer:users!referrer_id(mobile_number),
        referred:users!referred_id(mobile_number)
      `)
      .order('created_at', { ascending: false });
    
    setReferrals(data);
  };

  const fetchSettings = async () => {
    const { data } = await supabase.from('site_settings').select('*');
    const settingsObj = {};
    data.forEach(item => {
      settingsObj[item.key] = item.value;
    });
    setSettings(settingsObj);
  };

  const handleWithdrawalAction = async (id, status) => {
    await supabase
      .from('transactions')
      .update({ status })
      .eq('id', id);
    
    fetchWithdrawals();
  };

  const updateSetting = async (key, value) => {
    await supabase
      .from('site_settings')
      .upsert({ key, value });
    
    fetchSettings();
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        <h1>Admin Panel</h1>
        
        <div className="admin-tabs">
          <button 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button 
            className={`tab-btn ${activeTab === 'withdrawals' ? 'active' : ''}`}
            onClick={() => setActiveTab('withdrawals')}
          >
            Withdrawals
          </button>
          <button 
            className={`tab-btn ${activeTab === 'deposits' ? 'active' : ''}`}
            onClick={() => setActiveTab('deposits')}
          >
            Deposits
          </button>
          <button 
            className={`tab-btn ${activeTab === 'referrals' ? 'active' : ''}`}
            onClick={() => setActiveTab('referrals')}
          >
            Referrals
          </button>
          <button 
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>
        
        <div className="admin-content">
          {activeTab === 'users' && (
            <div className="users-section">
              <h2>User Management</h2>
              <div className="user-table">
                <table>
                  <thead>
                    <tr>
                      <th>Mobile</th>
                      <th>Referral Code</th>
                      <th>Premium</th>
                      <th>Balance</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.mobile_number}</td>
                        <td>{user.referral_code || 'N/A'}</td>
                        <td>{user.is_premium ? 'Yes' : 'No'}</td>
                        <td>₹{user.balance}</td>
                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        <td>
                          <button className="action-btn">Edit</button>
                          <button className="action-btn delete">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === 'referrals' && (
            <div className="referrals-section">
              <h2>Referral Management</h2>
              <div className="referral-table">
                <table>
                  <thead>
                    <tr>
                      <th>Referrer</th>
                      <th>Referred</th>
                      <th>Reward</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.map(referral => (
                      <tr key={referral.id}>
                        <td>{referral.referrer?.mobile_number || 'N/A'}</td>
                        <td>{referral.referred?.mobile_number || 'N/A'}</td>
                        <td>₹{referral.reward}</td>
                        <td>{new Date(referral.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === 'withdrawals' && (
            <div className="withdrawals-section">
              <h2>Withdrawal Requests</h2>
              <div className="withdrawal-table">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map(withdrawal => (
                      <tr key={withdrawal.id}>
                        <td>{withdrawal.user?.mobile_number || 'N/A'}</td>
                        <td>₹{withdrawal.amount}</td>
                        <td>{new Date(withdrawal.created_at).toLocaleDateString()}</td>
                        <td className={`status ${withdrawal.status}`}>
                          {withdrawal.status}
                        </td>
                        <td>
                          {withdrawal.status === 'pending' && (
                            <>
                              <button 
                                className="action-btn approve"
                                onClick={() => handleWithdrawalAction(withdrawal.id, 'approved')}
                              >
                                Approve
                              </button>
                              <button 
                                className="action-btn reject"
                                onClick={() => handleWithdrawalAction(withdrawal.id, 'rejected')}
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === 'deposits' && (
            <div className="deposits-section">
              <h2>Deposit History</h2>
              <div className="deposit-table">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Payment ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deposits.map(deposit => (
                      <tr key={deposit.id}>
                        <td>{deposit.user?.mobile_number || 'N/A'}</td>
                        <td>₹{deposit.amount}</td>
                        <td>{new Date(deposit.created_at).toLocaleDateString()}</td>
                        <td className={`status ${deposit.status}`}>
                          {deposit.status}
                        </td>
                        <td>{deposit.razorpay_payment_id || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="settings-section">
              <h2>Site Settings</h2>
              <div className="settings-form">
                <div className="form-group">
                  <label>Amount per Video (₹)</label>
                  <input
                    type="number"
                    value={settings.amount_per_video || 5}
                    onChange={(e) => updateSetting('amount_per_video', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Referral Bonus (₹)</label>
                  <input
                    type="number"
                    value={settings.referral_bonus || 50}
                    onChange={(e) => updateSetting('referral_bonus', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Premium Membership Fee (₹)</label>
                  <input
                    type="number"
                    value={settings.premium_fee || 199}
                    onChange={(e) => updateSetting('premium_fee', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Minimum Withdrawal (₹)</label>
                  <input
                    type="number"
                    value={settings.min_withdrawal || 100}
                    onChange={(e) => updateSetting('min_withdrawal', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
