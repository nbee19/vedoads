import { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { supabase } from '../services/supabaseClient';

const VideoPlayer = ({ userId, onVideoComplete }) => {
  const [videoId, setVideoId] = useState('dQw4w9WgXcQ');
  const [videoStarted, setVideoStarted] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);

  useEffect(() => {
    fetchRandomVideo();
  }, []);

  const fetchRandomVideo = async () => {
    const videos = [
      'dQw4w9WgXcQ',
      'M7lc1UVf-VE',
      'kJQP7kiw5Fk'
    ];
    const randomVideo = videos[Math.floor(Math.random() * videos.length)];
    setVideoId(randomVideo);
  };

  const onReady = (event) => {
    event.target.playVideo();
  };

  const onStateChange = (event) => {
    if (event.data === YouTube.PlayerState.PLAYING && !videoStarted) {
      setVideoStarted(true);
    }
    
    if (event.data === YouTube.PlayerState.ENDED && !videoCompleted) {
      handleVideoComplete();
    }
  };

  const handleVideoComplete = async () => {
    setVideoCompleted(true);
    
    try {
      await supabase.from('video_earnings').insert({
        user_id: userId,
        video_id: videoId,
        amount: 5.00
      });
      
      await supabase.rpc('increment_balance', {
        user_id: userId,
        amount: 5.00
      });
      
      onVideoComplete();
    } catch (err) {
      console.error('Error recording video completion:', err);
    }
  };

  const opts = {
    height: '390',
    width: '640',
    playerVars: {
      autoplay: 1,
      controls: 1,
      rel: 0,
      showinfo: 0
    }
  };

  return (
    <div className="video-player-container">
      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={onReady}
        onStateChange={onStateChange}
      />
      {videoCompleted && (
        <div className="video-completed">
          <p>Video completed! You earned ₹5</p>
          <button onClick={fetchRandomVideo} className="btn-primary">
            Watch Next Video
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
