import { supabase } from './supabaseClient';

// Generate a random referral code
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
    // Create user in auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      phone: mobile,
      password,
    });
    
    if (authError) throw authError;
    
    // Generate unique referral code
    let newReferralCode = generateReferralCode();
    let codeExists = true;
    
    // Ensure referral code is unique
    while (codeExists) {
      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', newReferralCode)
        .single();
      
      if (!data) {
        codeExists = false;
      } else {
        newReferralCode = generateReferralCode();
      }
    }
    
    // Create user in our database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        mobile_number: mobile,
        password_hash: password, // In production, hash this properly
        referral_code: newReferralCode
      }]);
    
    if (userError) throw userError;
    
    // Process referral if code provided
    if (referralCode) {
      const { data: referrer } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', referralCode)
        .single();
      
      if (referrer) {
        // Add referral record
        await supabase.from('referrals').insert([{
          referrer_id: referrer.id,
          referred_id: authData.user.id,
          reward: 50.00 // 50 INR reward
        }]);
        
        // Update referrer's balance
        await supabase.rpc('increment_balance', {
          user_id: referrer.id,
          amount: 50.00
        });
      }
    }
    
    return { data: authData, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const login = async (mobile, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    phone: mobile,
    password,
  });
  return { data, error };
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
