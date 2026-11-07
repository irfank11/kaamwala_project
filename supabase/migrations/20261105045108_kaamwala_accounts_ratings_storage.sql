/*
# kaamWala accounts, ratings, admin actions and photo storage

Plain-English summary: makes sign-up create a matching profile automatically, keeps each worker's star rating in sync with their reviews, gives admins a safe way to approve or reject workers, and sets up a storage area for profile and portfolio photos.

1. Automation
- When someone signs up, a profile is created for them. Only the customer or worker roles can be chosen at sign-up; anything else becomes a customer.
- Each review stores the reviewer's name automatically from their profile, so it cannot be faked.
- A worker's average rating and review count are recalculated after every review is added, changed or removed.

2. Admin actions
- `admin_set_worker_status` lets an admin approve, reject or reset a worker. Anyone else calling it is refused.

3. Storage
- A public `portfolio` photo bucket accepts JPEG, PNG or WebP images up to 5 MB.
- Users can only upload to and delete from their own folder (named after their user ID).

4. Security notes
- Trigger and helper functions are not callable directly by visitors.
- Photo uploads are restricted to the owner's folder by policy.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');
BEGIN
  IF v_role NOT IN ('customer', 'worker') THEN
    v_role := 'customer';
  END IF;

  INSERT INTO public.profiles (id, role, full_name)
  VALUES (NEW.id, v_role, LEFT(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 100))
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_review_author()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SELECT COALESCE(NULLIF(p.full_name, ''), 'Customer') INTO NEW.author_name
  FROM public.profiles p
  WHERE p.id = NEW.customer_id;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_review_author() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS reviews_set_author ON public.reviews;
CREATE TRIGGER reviews_set_author
BEFORE INSERT ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.set_review_author();

CREATE OR REPLACE FUNCTION public.refresh_worker_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_worker uuid := COALESCE(NEW.worker_id, OLD.worker_id);
BEGIN
  UPDATE public.worker_profiles wp
  SET
    review_count = s.cnt,
    avg_rating = s.avg_score
  FROM (
    SELECT
      COUNT(*)::int AS cnt,
      COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS avg_score
    FROM public.reviews r
    WHERE r.worker_id = v_worker
  ) s
  WHERE wp.id = v_worker;
  RETURN NULL;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.refresh_worker_rating() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS reviews_refresh_rating ON public.reviews;
CREATE TRIGGER reviews_refresh_rating
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.refresh_worker_rating();

CREATE OR REPLACE FUNCTION public.admin_set_worker_status(p_worker_id uuid, p_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;

  IF p_status NOT IN ('pending', 'approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;

  UPDATE public.worker_profiles
  SET approval_status = p_status
  WHERE id = p_worker_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Worker not found';
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_set_worker_status(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_worker_status(uuid, text) TO authenticated;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('portfolio', 'portfolio', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "portfolio_objects_select" ON storage.objects;
CREATE POLICY "portfolio_objects_select" ON storage.objects FOR SELECT
TO anon, authenticated USING (bucket_id = 'portfolio');

DROP POLICY IF EXISTS "portfolio_objects_insert_own" ON storage.objects;
CREATE POLICY "portfolio_objects_insert_own" ON storage.objects FOR INSERT
TO authenticated WITH CHECK (
  bucket_id = 'portfolio' AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "portfolio_objects_delete_own" ON storage.objects;
CREATE POLICY "portfolio_objects_delete_own" ON storage.objects FOR DELETE
TO authenticated USING (
  bucket_id = 'portfolio' AND (storage.foldername(name))[1] = auth.uid()::text
);
