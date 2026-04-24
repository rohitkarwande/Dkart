-- ==========================================
-- B2B MEDICAL EQUIPMENT MARKETPLACE SCHEMA
-- Designed for Supabase (PostgreSQL)
-- ==========================================
-- Note: This schema links Dev A's User modules with Dev B's Marketplace modules.

-- ==========================================
-- DEVELOPER A'S DOMAIN: USERS, KYC, & BILLING
-- ==========================================

-- 1. Profiles Table (Extends Supabase Auth)
CREATE TABLE profiles (
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
CREATE TABLE kyc_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    document_type VARCHAR(100), -- e.g., 'Business License', 'Tax ID'
    file_url TEXT NOT NULL,     -- Points to Supabase Storage
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Subscriptions (For Monetization without paying external providers immediately)
CREATE TABLE subscriptions (
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
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    parent_id UUID REFERENCES categories(id) -- For sub-categories
);

-- 5. Equipment Listings
CREATE TABLE equipment_listings (
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

-- 6. Inquiries (The Lead Generation Core)
-- Created when a buyer unlocks a seller's contact.
CREATE TABLE inquiries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    buyer_id UUID REFERENCES profiles(id),
    seller_id UUID REFERENCES profiles(id),
    listing_id UUID REFERENCES equipment_listings(id),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'negotiating', 'closed_won', 'closed_lost')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(buyer_id, listing_id) -- Prevent duplicate inquiries for the same listing
);

-- 7. Chat Rooms (Supabase Realtime)
CREATE TABLE chat_rooms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    inquiry_id UUID REFERENCES inquiries(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Messages
CREATE TABLE messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id),
    content TEXT,
    attachment_url TEXT, -- For PDF quotations (Supabase Storage)
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Reviews & Trust
CREATE TABLE reviews (
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

-- Example RLS: Sellers can insert their own listings
CREATE POLICY "Sellers can insert own listings" 
ON equipment_listings FOR INSERT 
WITH CHECK (auth.uid() = seller_id);

-- Categories RLS: Allow anyone to view categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" 
ON categories FOR SELECT USING (true);

-- Categories RLS: Allow users to insert categories (Hackathon bypass)
CREATE POLICY "Anyone can insert categories" 
ON categories FOR INSERT WITH CHECK (true);

-- Profile RLS: Allow users to insert their profile during registration
CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Profile RLS: Allow anyone to view basic profiles (needed for a marketplace)
CREATE POLICY "Profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

-- Profile RLS: Allow users to update their own profile
CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);
