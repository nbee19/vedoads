import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import VideoPlayer from '../components/VideoPlayer';

const Dashboard = ({ session }) => {
  const [user, setUser] = useState(null);
  const [videoLocked, setVideoLocked] = useState(false);
  const [todayEarnings, setTodayEarnings] = useState(0);

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

  const checkVideoStatus = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data } = await supabase
        .from('video_earnings')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('earned_at', today)
        .lt('earned_at', new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]);
      
      if (data && data.length > 0 && !user?.is_premium) {
        setVideoLocked(true);
      }
      
      const totalEarnings = data?.reduce((sum, item) => sum + item.amount, 0) || 0;
      setTodayEarnings(totalEarnings);
    } catch (err) {
      console.error('Error checking video status:', err);
    }
  }, [session.user.id, user?.is_premium]);

  useEffect(() => {
    fetchUserData();
    checkVideoStatus();
  }, [fetchUserData, checkVideoStatus]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h2>Video Dashboard</h2>
        <div className="user-info">
          <div className="balance">
            <span>Balance:</span>
            <span className="amount">₹{user?.balance || 0}</span>
          </div>
          <div className="status">
            {user?.is_premium ? (
              <span className="premium-badge">Premium</span>
            ) : (
              <span>Free User</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="earnings-summary">
        <div className="summary-card">
          <h3>Today's Earnings</h3>
          <p className="amount">₹{todayEarnings}</p>
        </div>
        <div className="summary-card">
          <h3>Videos Watched</h3>
          <p className="amount">{videoLocked && !user?.is_premium ? '1/1' : '0/1'}</p>
        </div>
      </div>
      
      <div className="video-section">
        <h3>Watch & Earn</h3>
        {videoLocked && !user?.is_premium ? (
          <div className="video-locked">
            <p>You've reached your daily limit. Upgrade to Premium to watch unlimited videos!</p>
            <a href="/premium" className="btn-primary">Upgrade Now</a>
          </div>
        ) : (
          <VideoPlayer 
            userId={session.user.id} 
            onVideoComplete={() => {
              if (!user?.is_premium) setVideoLocked(true);
              fetchUserData();
              checkVideoStatus();
            }} 
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
