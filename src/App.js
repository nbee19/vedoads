import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Premium from './pages/Premium';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import Referral from './pages/Referral';
import AdminDashboard from './pages/AdminDashboard';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) {
          await checkAdminStatus(session.user.id);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session) {
          await checkAdminStatus(session.user.id);
        } else {
          setIsAdmin(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId) => {
    try {
      const { data } = await supabase
        .from('admins')
        .select('*')
        .eq('id', userId)
        .single();
      
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading VideoEarn...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="app-container">
          <Header session={session} isAdmin={isAdmin} />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<Dashboard session={session} />} />
              <Route path="/premium" element={<Premium session={session} />} />
              <Route path="/deposit" element={<Deposit session={session} />} />
              <Route path="/withdraw" element={<Withdraw session={session} />} />
              <Route path="/referral" element={<Referral session={session} />} />
              <Route path="/admin" element={<AdminDashboard session={session} />} />
              <Route path="*" element={<div className="error-page">Page not found</div>} />
            </Routes>
          </main>
          <Footer session={session} />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
