import { Link } from 'react-router-dom';

const Footer = ({ session }) => {
  return (
    <footer className="app-footer">
      <nav className="footer-nav">
        <Link to="/" className="nav-item">
          <i className="fas fa-home"></i>
          <span>Home</span>
        </Link>
        {session && (
          <>
            <Link to="/dashboard" className="nav-item">
              <i className="fas fa-play-circle"></i>
              <span>Videos</span>
            </Link>
            <Link to="/deposit" className="nav-item">
              <i className="fas fa-wallet"></i>
              <span>Deposit</span>
            </Link>
            <Link to="/withdraw" className="nav-item">
              <i className="fas fa-money-bill-wave"></i>
              <span>Withdraw</span>
            </Link>
            <Link to="/referral" className="nav-item">
              <i className="fas fa-user-plus"></i>
              <span>Referral</span>
            </Link>
          </>
        )}
      </nav>
    </footer>
  );
};

export default Footer;
