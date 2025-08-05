import { supabase } from './supabaseClient';

const generateReferralCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const signUp = async (mobile, password, referralCode = null) => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      phone: mobile,
      password,
    });
    
    if (authError) throw authError;
    
    if (!authData.user) {
      throw new Error('User creation failed');
    }
    
    let newReferralCode = generateReferralCode();
    let codeExists = true;
    let attempts = 0;
    
    while (codeExists && attempts < 10) {
      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', newReferralCode)
        .single();
      
      if (!data) {
        codeExists = false;
      } else {
        newReferralCode = generateReferralCode();
        attempts++;
      }
    }
    
    const { error: userError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        mobile_number: mobile,
        password_hash: password,
        referral_code: newReferralCode
      }]);
    
    if (userError) throw userError;
    
    if (referralCode) {
      const { data: referrer } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', referralCode)
        .single();
      
      if (referrer) {
        const { error: referralError } = await supabase.from('referrals').insert([{
          referrer_id: referrer.id,
          referred_id: authData.user.id,
          reward: 50.00
        }]);
        
        if (referralError) throw referralError;
        
        const { error: balanceError } = await supabase.rpc('increment_balance', {
          user_id: referrer.id,
          amount: 50.00
        });
        
        if (balanceError) throw balanceError;
      }
    }
    
    return { data: authData, error: null };
  } catch (error) {
    console.error('Signup error:', error);
    return { data: null, error };
  }
};

export const login = async (mobile, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      phone: mobile,
      password,
    });
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Login error:', error);
    return { data: null, error };
  }
};

export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Logout error:', error);
    return { error };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};
