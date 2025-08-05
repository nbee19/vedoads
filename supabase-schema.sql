-- Create tables
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mobile_number VARCHAR(20) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE,
  balance DECIMAL(10,2) DEFAULT 0.00,
  referral_code VARCHAR(10) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE video_earnings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  video_id VARCHAR(100),
  amount DECIMAL(10,2) NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type VARCHAR(10) CHECK (type IN ('deposit', 'withdrawal')),
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  razorpay_payment_id TEXT,
  bank_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE referrals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  referrer_id UUID REFERENCES users(id),
  referred_id UUID REFERENCES users(id),
  reward DECIMAL(10,2) DEFAULT 50.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE site_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key VARCHAR(50) UNIQUE NOT NULL,
  value TEXT NOT NULL
);

CREATE TABLE admins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Functions for balance management
CREATE OR REPLACE FUNCTION increment_balance(user_id UUID, amount DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE users SET balance = balance + amount WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_balance(user_id UUID, amount DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE users SET balance = balance - amount WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS VARCHAR(10) AS $$
DECLARE
  code VARCHAR(10);
  exists BOOLEAN;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text) from 1 for 6));
    SELECT EXISTS(SELECT 1 FROM users WHERE referral_code = code) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Insert default settings
INSERT INTO site_settings (key, value) VALUES 
('amount_per_video', '5'),
('referral_bonus', '50'),
('premium_fee', '199'),
('min_withdrawal', '100');

-- Create admin user (password: admin123)
INSERT INTO admins (id, email, password_hash) VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  'admin@example.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' -- bcrypt hash for 'admin123'
);
