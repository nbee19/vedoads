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

function App() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      checkAdminStatus(session?.user?.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        checkAdminStatus(session?.user?.id);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId) => {
    if (!userId) {
      setIsAdmin(false);
      return;
    }
    
    const { data } = await supabase
      .from('admins')
      .select('*')
      .eq('id', userId)
      .single();
    
    setIsAdmin(!!data);
  };

  return (
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
          </Routes>
        </main>
        <Footer session={session} />
      </div>
    </Router>
  );
}

export default App;
