/*
# kaamWala core marketplace tables

Plain-English summary: creates the tables that power the worker marketplace, the access rules that decide who can read and change each row, and the starter list of service categories.

1. New Tables
- `profiles`: one row per account, holding name, phone, city, photo and role (customer, worker or admin). Created automatically when someone signs up.
- `service_categories`: the services shown on the site (plumber, electrician, and so on). Admins manage them.
- `worker_profiles`: a worker's professional details: headline, bio, experience, skills, rates, location, service radius, working days and hours, availability and approval status. Rating fields are maintained by the system.
- `worker_categories`: which service categories a worker offers, with an expertise note for each.
- `portfolio_images`: photos of past work shown on a worker's profile.
- `reviews`: one rating (1 to 5) and comment per customer per worker.

2. Security
- Row level security is enabled on every table.
- Public visitors can only see approved workers, their categories, portfolios and reviews.
- Workers can only create and change their own profile, categories and portfolio.
- Customers can only write reviews for approved workers and only edit their own reviews.
- Approval status and rating fields are not writable by users; they are changed only by the system or by admin actions.
- Column-level grants stop users from editing sensitive columns such as role.

3. Important notes
- A helper function `is_admin()` identifies admins by their profile role.
- The rating fields on workers are recalculated by a separate migration whenever reviews change.
*/

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'worker', 'admin')),
  full_name text NOT NULL DEFAULT '' CHECK (char_length(full_name) <= 100),
  phone text NOT NULL DEFAULT '' CHECK (char_length(phone) <= 20),
  city text NOT NULL DEFAULT '' CHECK (char_length(city) <= 100),
  avatar_url text CHECK (avatar_url IS NULL OR char_length(avatar_url) <= 500),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 60),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 240),
  icon text NOT NULL DEFAULT 'Wrench' CHECK (char_length(icon) <= 40),
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.worker_profiles (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  headline text NOT NULL DEFAULT '' CHECK (char_length(headline) <= 120),
  bio text NOT NULL DEFAULT '' CHECK (char_length(bio) <= 2000),
  years_experience int NOT NULL DEFAULT 0 CHECK (years_experience BETWEEN 0 AND 80),
  skills text[] NOT NULL DEFAULT '{}' CHECK (cardinality(skills) <= 20),
  pricing_type text NOT NULL DEFAULT 'hourly' CHECK (pricing_type IN ('hourly', 'daily', 'fixed')),
  price numeric(10, 2) NOT NULL DEFAULT 0 CHECK (price >= 0 AND price <= 1000000),
  city text NOT NULL DEFAULT '' CHECK (char_length(city) <= 100),
  area text NOT NULL DEFAULT '' CHECK (char_length(area) <= 150),
  latitude double precision CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
  longitude double precision CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180),
  service_radius_km int NOT NULL DEFAULT 10 CHECK (service_radius_km BETWEEN 1 AND 200),
  working_days text[] NOT NULL DEFAULT '{}' CHECK (working_days <@ ARRAY['mon','tue','wed','thu','fri','sat','sun']::text[]),
  start_time time NOT NULL DEFAULT '09:00',
  end_time time NOT NULL DEFAULT '18:00',
  is_available boolean NOT NULL DEFAULT true,
  approval_status text NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  avg_rating numeric(3, 2) NOT NULL DEFAULT 0 CHECK (avg_rating BETWEEN 0 AND 5),
  review_count int NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS worker_profiles_status_idx ON public.worker_profiles (approval_status);

CREATE TABLE IF NOT EXISTS public.worker_categories (
  worker_id uuid NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
  expertise text NOT NULL DEFAULT '' CHECK (char_length(expertise) <= 200),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (worker_id, category_id)
);

CREATE INDEX IF NOT EXISTS worker_categories_category_idx ON public.worker_categories (category_id);

CREATE TABLE IF NOT EXISTS public.portfolio_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id uuid NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
  image_url text NOT NULL CHECK (char_length(image_url) <= 500),
  caption text NOT NULL DEFAULT '' CHECK (char_length(caption) <= 120),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS portfolio_images_worker_idx ON public.portfolio_images (worker_id);

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id uuid NOT NULL REFERENCES public.worker_profiles(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name text NOT NULL DEFAULT '' CHECK (char_length(author_name) <= 100),
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL DEFAULT '' CHECK (char_length(comment) <= 1000),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (worker_id, customer_id)
);

CREATE INDEX IF NOT EXISTS reviews_worker_idx ON public.reviews (worker_id);

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT UPDATE (full_name, phone, city, avatar_url) ON public.profiles TO authenticated;

GRANT SELECT ON public.service_categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.service_categories TO authenticated;

GRANT SELECT ON public.worker_profiles TO anon, authenticated;
GRANT INSERT (id, headline, bio, years_experience, skills, pricing_type, price, city, area, latitude, longitude, service_radius_km, working_days, start_time, end_time, is_available) ON public.worker_profiles TO authenticated;
GRANT UPDATE (headline, bio, years_experience, skills, pricing_type, price, city, area, latitude, longitude, service_radius_km, working_days, start_time, end_time, is_available) ON public.worker_profiles TO authenticated;

GRANT SELECT ON public.worker_categories TO anon, authenticated;
GRANT INSERT (worker_id, category_id, expertise) ON public.worker_categories TO authenticated;
GRANT DELETE ON public.worker_categories TO authenticated;

GRANT SELECT ON public.portfolio_images TO anon, authenticated;
GRANT INSERT (worker_id, image_url, caption), DELETE ON public.portfolio_images TO authenticated;

GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT (worker_id, customer_id, rating, comment) ON public.reviews TO authenticated;
GRANT UPDATE (rating, comment) ON public.reviews TO authenticated;
GRANT DELETE ON public.reviews TO authenticated;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT
TO authenticated USING (id = auth.uid());

DROP POLICY IF EXISTS "profiles_select_public_workers" ON public.profiles;
CREATE POLICY "profiles_select_public_workers" ON public.profiles FOR SELECT
TO anon, authenticated USING (
  EXISTS (SELECT 1 FROM public.worker_profiles wp WHERE wp.id = profiles.id AND wp.approval_status = 'approved')
);

DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
CREATE POLICY "profiles_select_admin" ON public.profiles FOR SELECT
TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE
TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "categories_select_active" ON public.service_categories;
CREATE POLICY "categories_select_active" ON public.service_categories FOR SELECT
TO anon, authenticated USING (is_active OR public.is_admin());

DROP POLICY IF EXISTS "categories_insert_admin" ON public.service_categories;
CREATE POLICY "categories_insert_admin" ON public.service_categories FOR INSERT
TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "categories_update_admin" ON public.service_categories;
CREATE POLICY "categories_update_admin" ON public.service_categories FOR UPDATE
TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "categories_delete_admin" ON public.service_categories;
CREATE POLICY "categories_delete_admin" ON public.service_categories FOR DELETE
TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "worker_profiles_select" ON public.worker_profiles;
CREATE POLICY "worker_profiles_select" ON public.worker_profiles FOR SELECT
TO anon, authenticated USING (approval_status = 'approved' OR id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "worker_profiles_insert_own" ON public.worker_profiles;
CREATE POLICY "worker_profiles_insert_own" ON public.worker_profiles FOR INSERT
TO authenticated WITH CHECK (
  id = auth.uid() AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'worker')
);

DROP POLICY IF EXISTS "worker_profiles_update_own" ON public.worker_profiles;
CREATE POLICY "worker_profiles_update_own" ON public.worker_profiles FOR UPDATE
TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "worker_categories_select" ON public.worker_categories;
CREATE POLICY "worker_categories_select" ON public.worker_categories FOR SELECT
TO anon, authenticated USING (
  EXISTS (SELECT 1 FROM public.worker_profiles wp WHERE wp.id = worker_categories.worker_id AND (wp.approval_status = 'approved' OR wp.id = auth.uid() OR public.is_admin()))
);

DROP POLICY IF EXISTS "worker_categories_insert_own" ON public.worker_categories;
CREATE POLICY "worker_categories_insert_own" ON public.worker_categories FOR INSERT
TO authenticated WITH CHECK (
  worker_id = auth.uid()
  AND EXISTS (SELECT 1 FROM public.service_categories sc WHERE sc.id = worker_categories.category_id AND sc.is_active)
);

DROP POLICY IF EXISTS "worker_categories_delete_own" ON public.worker_categories;
CREATE POLICY "worker_categories_delete_own" ON public.worker_categories FOR DELETE
TO authenticated USING (worker_id = auth.uid());

DROP POLICY IF EXISTS "portfolio_select" ON public.portfolio_images;
CREATE POLICY "portfolio_select" ON public.portfolio_images FOR SELECT
TO anon, authenticated USING (
  EXISTS (SELECT 1 FROM public.worker_profiles wp WHERE wp.id = portfolio_images.worker_id AND (wp.approval_status = 'approved' OR wp.id = auth.uid() OR public.is_admin()))
);

DROP POLICY IF EXISTS "portfolio_insert_own" ON public.portfolio_images;
CREATE POLICY "portfolio_insert_own" ON public.portfolio_images FOR INSERT
TO authenticated WITH CHECK (
  worker_id = auth.uid()
  AND (SELECT count(*) FROM public.portfolio_images existing WHERE existing.worker_id = auth.uid()) < 24
);

DROP POLICY IF EXISTS "portfolio_delete_own" ON public.portfolio_images;
CREATE POLICY "portfolio_delete_own" ON public.portfolio_images FOR DELETE
TO authenticated USING (worker_id = auth.uid());

DROP POLICY IF EXISTS "reviews_select" ON public.reviews;
CREATE POLICY "reviews_select" ON public.reviews FOR SELECT
TO anon, authenticated USING (
  EXISTS (SELECT 1 FROM public.worker_profiles wp WHERE wp.id = reviews.worker_id AND wp.approval_status = 'approved')
  OR customer_id = auth.uid()
  OR public.is_admin()
);

DROP POLICY IF EXISTS "reviews_insert_customer" ON public.reviews;
CREATE POLICY "reviews_insert_customer" ON public.reviews FOR INSERT
TO authenticated WITH CHECK (
  customer_id = auth.uid()
  AND worker_id <> auth.uid()
  AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'customer')
  AND EXISTS (SELECT 1 FROM public.worker_profiles wp WHERE wp.id = reviews.worker_id AND wp.approval_status = 'approved')
);

DROP POLICY IF EXISTS "reviews_update_own" ON public.reviews;
CREATE POLICY "reviews_update_own" ON public.reviews FOR UPDATE
TO authenticated USING (customer_id = auth.uid()) WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "reviews_delete_own_or_admin" ON public.reviews;
CREATE POLICY "reviews_delete_own_or_admin" ON public.reviews FOR DELETE
TO authenticated USING (customer_id = auth.uid() OR public.is_admin());

INSERT INTO public.service_categories (slug, name, description, icon, sort_order) VALUES
  ('electrician', 'Electrician', 'Wiring, fittings, repairs and power backup installs', 'Zap', 1),
  ('plumber', 'Plumber', 'Leaks, pipelines, bathroom fittings and water tanks', 'Droplets', 2),
  ('carpenter', 'Carpenter', 'Furniture, doors, wardrobes and wooden fixtures', 'Hammer', 3),
  ('painter', 'Painter', 'Interior and exterior painting, polishing and waterproofing', 'PaintRoller', 4),
  ('cleaner', 'Cleaner', 'Home deep cleaning, sofa and kitchen cleaning', 'SprayCan', 5),
  ('goldsmith', 'Goldsmith', 'Jewellery making, repairs, resizing and polishing', 'Gem', 6),
  ('mechanic', 'Mechanic', 'Car and bike servicing, repairs and breakdown help', 'Car', 7),
  ('interior-worker', 'Interior Worker', 'Modular kitchens, false ceilings and home makeovers', 'Sofa', 8),
  ('ac-technician', 'AC Technician', 'Installation, gas refill and servicing for AC units', 'Snowflake', 9),
  ('mason', 'Mason', 'Brickwork, plastering, tiling and small construction jobs', 'Ruler', 10)
ON CONFLICT (slug) DO NOTHING;
