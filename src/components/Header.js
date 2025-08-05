import { Link } from 'react-router-dom';
import { logout } from '../services/auth';

const Header = ({ session, isAdmin }) => {
  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>VideoEarn</h1>
        </Link>
        
        <nav className="header-nav">
          {session ? (
            <>
              <span className="user-welcome">Welcome, {session.user.phone}</span>
              {isAdmin && (
                <Link to="/admin" className="admin-link">Admin Panel</Link>
              )}
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="nav-link">Sign Up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
