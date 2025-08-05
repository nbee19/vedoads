import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

const Referral = ({ session }) => {
  const [user, setUser] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);

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
    }
  }, [session.user.id]);

  const fetchReferrals = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('referrals')
        .select(`
          *,
          referred:users!referred_id(mobile_number)
        `)
        .eq('referrer_id', session.user.id);
      
      setReferrals(data);
    } catch (err) {
      console.error('Error fetching referrals:', err);
    }
  }, [session.user.id]);

  const generateReferralLink = useCallback(() => {
    const baseUrl = window.location.origin;
    const code = user?.referral_code || session.user.id;
    setReferralLink(`${baseUrl}/signup?ref=${code}`);
  }, [user?.referral_code, session.user.id]);

  useEffect(() => {
    fetchUserData();
    fetchReferrals();
    generateReferralLink();
  }, [fetchUserData, fetchReferrals, generateReferralLink]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="referral-page">
      <div className="referral-container">
        <h2>Referral Program</h2>
        
        <div className="referral-info">
          <div className="info-card">
            <h3>Your Referral Code</h3>
            <div className="referral-code-display">
              <span className="code">{user?.referral_code || 'Loading...'}</span>
            </div>
            <div className="referral-link-container">
              <input 
                type="text" 
                value={referralLink} 
                readOnly 
                className="referral-link"
              />
              <button 
                onClick={copyToClipboard}
                className="copy-btn"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p>Share this link with your friends and earn <strong>₹50</strong> for each successful signup!</p>
          </div>
          
          <div className="info-card">
            <h3>Referral Stats</h3>
            <div className="stats">
              <div className="stat">
                <span className="number">{referrals.length}</span>
                <span>Total Referrals</span>
              </div>
              <div className="stat">
                <span className="number">₹{referrals.length * 50}</span>
                <span>Total Earnings</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="referral-list">
          <h3>Your Referrals</h3>
          {referrals.length === 0 ? (
            <p>You haven't referred anyone yet</p>
          ) : (
            <div className="referral-table">
              <table>
                <thead>
                  <tr>
                    <th>Mobile Number</th>
                    <th>Signup Date</th>
                    <th>Reward</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map(referral => (
                    <tr key={referral.id}>
                      <td>{referral.referred?.mobile_number || 'N/A'}</td>
                      <td>{new Date(referral.created_at).toLocaleDateString()}</td>
                      <td>₹{referral.reward}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Referral;
