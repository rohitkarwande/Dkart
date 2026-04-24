-- ==========================================
-- B2B MEDICAL EQUIPMENT MARKETPLACE SCHEMA
-- Designed for Supabase (PostgreSQL)
-- ==========================================
-- Note: This schema links Dev A's User modules with Dev B's Marketplace modules.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- DEVELOPER A'S DOMAIN: USERS, KYC, & BILLING
-- ==========================================

-- 1. Profiles Table (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    role VARCHAR(50) NOT NULL CHECK (role IN ('buyer', 'seller', 'admin')),
    full_name VARCHAR(255),
    company_name VARCHAR(255),
    phone_number VARCHAR(50),
    is_verified BOOLEAN DEFAULT false,
    trust_score INT DEFAULT 0,
    credits_balance INT DEFAULT 0, -- Used for unlocking contacts
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. KYC Documents
CREATE TABLE IF NOT EXISTS kyc_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    document_type VARCHAR(100), -- e.g., 'Business License', 'Tax ID'
    file_url TEXT NOT NULL,     -- Points to Supabase Storage
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Subscriptions (For Monetization without paying external providers immediately)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    plan_tier VARCHAR(50) DEFAULT 'free' CHECK (plan_tier IN ('free', 'pro', 'enterprise')),
    status VARCHAR(50) DEFAULT 'active',
    valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- DEVELOPER B'S DOMAIN: MARKETPLACE & DEALS
-- ==========================================

-- 4. Categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    parent_id UUID REFERENCES categories(id) -- For sub-categories
);

-- 5. Equipment Listings
CREATE TABLE IF NOT EXISTS equipment_listings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- Link to Dev A's User
    category_id UUID REFERENCES categories(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    condition VARCHAR(50) CHECK (condition IN ('new', 'used', 'refurbished')),
    price DECIMAL(12, 2), -- Optional, can be negotiated
    location VARCHAR(255),
    images TEXT[], -- Array of Supabase Storage URLs
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold')),
    views_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- SHARED DOMAIN: LEADS, CHAT & NEGOTIATION
-- ==========================================

-- 6. Deals
CREATE TABLE IF NOT EXISTS deals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    buyer_id UUID REFERENCES profiles(id),
    seller_id UUID REFERENCES profiles(id),
    listing_id UUID REFERENCES equipment_listings(id),
    status VARCHAR(50) DEFAULT 'Open' CHECK (status IN ('Open', 'Negotiation', 'Closed')),
    agreed_price DECIMAL(12, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(buyer_id, listing_id) -- Prevent duplicate deals for the same listing
);

-- 7. Chats
CREATE TABLE IF NOT EXISTS chats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    buyer_id UUID REFERENCES profiles(id),
    seller_id UUID REFERENCES profiles(id),
    listing_id UUID REFERENCES equipment_listings(id),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id),
    content TEXT,
    attachment_url TEXT, -- For PDF quotations (Supabase Storage)
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Reviews & Trust
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reviewer_id UUID REFERENCES profiles(id),
    target_seller_id UUID REFERENCES profiles(id),
    listing_id UUID REFERENCES equipment_listings(id),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_listings ENABLE ROW LEVEL SECURITY;

-- Example RLS: Anyone can view active listings
CREATE POLICY "Listings are visible to everyone" 
ON equipment_listings FOR SELECT 
USING (status = 'active');

-- Example RLS: Sellers can only update their own listings
CREATE POLICY "Sellers can update own listings" 
ON equipment_listings FOR UPDATE 
USING (auth.uid() = seller_id);

-- Example RLS: Allow anyone to insert listings during development
CREATE POLICY "Anyone can insert listings"
ON equipment_listings FOR INSERT
WITH CHECK (true);

-- DUMMY DATA FOR DEVELOPMENT
-- Removed dummy profile insert as it conflicts with auth.users foreign key constraint.
-- Please create a user in Supabase Authentication dashboard first, and copy their UUID into profiles manually if testing without Dev A's auth flow.

INSERT INTO categories (id, name, slug) VALUES 
('11111111-1111-1111-1111-111111111111', 'MRI Machines', 'mri-machines'),
('22222222-2222-2222-2222-222222222222', 'X-Ray Systems', 'x-ray-systems'),
('33333333-3333-3333-3333-333333333333', 'Ultrasound', 'ultrasound')
ON CONFLICT (id) DO NOTHING;
