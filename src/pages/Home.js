import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-page">
      <section className="hero">
        <h1>Earn Money Watching Videos</h1>
        <p>Watch YouTube videos and earn real money daily!</p>
        <div className="cta-buttons">
          <Link to="/signup" className="btn-primary">Get Started</Link>
          <Link to="/login" className="btn-secondary">Login</Link>
        </div>
      </section>
      
      <section className="features">
        <div className="feature-card">
          <i className="fas fa-play-circle"></i>
          <h3>Watch & Earn</h3>
          <p>Earn ₹5 per video watched</p>
        </div>
        <div className="feature-card">
          <i className="fas fa-crown"></i>
          <h3>Premium Benefits</h3>
          <p>Unlimited videos for just ₹199</p>
        </div>
        <div className="feature-card highlight">
          <i className="fas fa-users"></i>
          <h3>Referral Program</h3>
          <p>Earn <strong>₹50</strong> per referral</p>
        </div>
      </section>
      
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Sign Up</h3>
            <p>Create your account with mobile number</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Refer Friends</h3>
            <p>Share your referral code and earn ₹50 per signup</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Watch Videos</h3>
            <p>Watch YouTube videos to earn more money</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Withdraw Earnings</h3>
            <p>Withdraw your earnings to your bank account</p>
          </div>
        </div>
      </section>
      
      <section className="referral-highlight">
        <div className="highlight-content">
          <h2>Refer & Earn Program</h2>
          <p>Invite your friends to join and earn <strong>₹50</strong> for each successful signup!</p>
          <p>Your friends get a special bonus too when they use your referral code.</p>
          <Link to="/signup" className="btn-primary">Join Now</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
