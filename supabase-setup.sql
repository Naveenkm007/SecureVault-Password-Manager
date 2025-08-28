-- SecureVault Database Setup for Supabase
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    vault_key_hash TEXT NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create passwords table
CREATE TABLE IF NOT EXISTS public.passwords (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    username TEXT NOT NULL,
    encrypted_password TEXT NOT NULL,
    website TEXT,
    notes TEXT,
    category TEXT DEFAULT 'General',
    favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_logs table
CREATE TABLE IF NOT EXISTS public.admin_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    admin_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_passwords_user_id ON public.passwords(user_id);
CREATE INDEX IF NOT EXISTS idx_passwords_category ON public.passwords(category);
CREATE INDEX IF NOT EXISTS idx_passwords_favorite ON public.passwords(favorite);
CREATE INDEX IF NOT EXISTS idx_passwords_created_at ON public.passwords(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON public.admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON public.admin_logs(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_passwords_updated_at BEFORE UPDATE ON public.passwords
    FOR EOW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passwords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Passwords table policies
CREATE POLICY "Users can view own passwords" ON public.passwords
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own passwords" ON public.passwords
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own passwords" ON public.passwords
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own passwords" ON public.passwords
    FOR DELETE USING (auth.uid() = user_id);

-- Admin logs policies (only admins can access)
CREATE POLICY "Admins can view all logs" ON public.admin_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND settings->>'role' = 'admin'
        )
    );

CREATE POLICY "Admins can insert logs" ON public.admin_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND settings->>'role' = 'admin'
        )
    );

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, vault_key_hash)
    VALUES (NEW.id, NEW.email, '');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to get user statistics
CREATE OR REPLACE FUNCTION public.get_user_stats(user_uuid UUID)
RETURNS TABLE (
    total_passwords BIGINT,
    categories_count BIGINT,
    favorite_count BIGINT,
    last_updated TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_passwords,
        COUNT(DISTINCT category)::BIGINT as categories_count,
        COUNT(*) FILTER (WHERE favorite = true)::BIGINT as favorite_count,
        MAX(updated_at) as last_updated
    FROM public.passwords
    WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search passwords
CREATE OR REPLACE FUNCTION public.search_passwords(
    user_uuid UUID,
    search_query TEXT,
    category_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    username TEXT,
    website TEXT,
    category TEXT,
    favorite BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.username,
        p.website,
        p.category,
        p.favorite,
        p.created_at,
        p.updated_at
    FROM public.passwords p
    WHERE p.user_id = user_uuid
    AND (
        search_query IS NULL OR
        p.title ILIKE '%' || search_query || '%' OR
        p.username ILIKE '%' || search_query || '%' OR
        COALESCE(p.website, '') ILIKE '%' || search_query || '%' OR
        COALESCE(p.notes, '') ILIKE '%' || search_query || '%'
    )
    AND (
        category_filter IS NULL OR
        p.category = category_filter
    )
    ORDER BY p.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample data for testing (optional)
-- INSERT INTO public.users (id, email, vault_key_hash) VALUES 
--     ('00000000-0000-0000-0000-000000000001', 'admin@securevault.com', 'admin_hash'),
--     ('00000000-0000-0000-0000-000000000002', 'user@securevault.com', 'user_hash');

-- Update admin user role
-- UPDATE public.users SET settings = jsonb_set(settings, '{role}', '"admin"') 
-- WHERE email = 'admin@securevault.com';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.passwords TO anon, authenticated;
GRANT ALL ON public.admin_logs TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Create view for admin dashboard
CREATE OR REPLACE VIEW public.admin_dashboard_stats AS
SELECT 
    COUNT(DISTINCT u.id) as total_users,
    COUNT(DISTINCT CASE WHEN u.settings->>'suspended' != 'true' THEN u.id END) as active_users,
    COUNT(DISTINCT CASE WHEN u.settings->>'suspended' = 'true' THEN u.id END) as suspended_users,
    COUNT(p.id) as total_passwords,
    ROUND(AVG(passwords_per_user.count), 2) as avg_passwords_per_user,
    MAX(u.created_at) as latest_user_signup,
    MAX(p.updated_at) as latest_password_update
FROM public.users u
LEFT JOIN public.passwords p ON u.id = p.user_id
LEFT JOIN (
    SELECT user_id, COUNT(*) as count
    FROM public.passwords
    GROUP BY user_id
) passwords_per_user ON u.id = passwords_per_user.user_id;

-- Grant access to admin view
GRANT SELECT ON public.admin_dashboard_stats TO authenticated;
