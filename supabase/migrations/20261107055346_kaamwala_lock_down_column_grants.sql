/*
# Restrict client write access to safe columns

1. Summary
- Signed-in users previously had table-wide write access, so they could change fields the app never lets them edit: their own role, their worker approval status, and their worker rating.
- This migration replaces those broad grants with column-level grants that match exactly what the app edits.

2. Security changes
- anon: read-only (SELECT) on public marketplace tables. Row policies still decide which rows are visible.
- authenticated, profiles: may update full_name, phone, city, avatar_url only. role cannot be changed.
- authenticated, worker_profiles: may insert their own row (id only) and update listing fields only. approval_status, avg_rating and review_count are not writable by users; approval goes through admin_set_worker_status.
- authenticated, reviews: may insert rating and comment (customer_id defaults to the signed-in user), update rating and comment, and delete. customer_id and worker_id cannot be changed after creation.
- authenticated, worker_categories and portfolio_images: insert and delete on their own columns.
- authenticated, service_categories: insert, update and delete; row policies restrict these to admins.
- admin_set_worker_status: EXECUTE revoked from PUBLIC and anon. It still checks for an admin internally.

3. Notes
- Existing row policies are unchanged.
- ensureWorkerProfile inserts only the id, which is covered by the insert grant.
- customer_id default is re-applied idempotently so review inserts that omit it keep working.
*/

REVOKE ALL ON profiles, worker_profiles, reviews, service_categories, worker_categories, portfolio_images FROM anon, authenticated;

GRANT SELECT ON profiles, worker_profiles, reviews, service_categories, worker_categories, portfolio_images TO anon, authenticated;

GRANT UPDATE (full_name, phone, city, avatar_url) ON profiles TO authenticated;

GRANT INSERT (id) ON worker_profiles TO authenticated;
GRANT UPDATE (headline, bio, years_experience, skills, pricing_type, price, city, area, latitude, longitude, service_radius_km, working_days, start_time, end_time, is_available) ON worker_profiles TO authenticated;

GRANT INSERT (worker_id, category_id, expertise), DELETE ON worker_categories TO authenticated;

GRANT INSERT (worker_id, image_url, caption), DELETE ON portfolio_images TO authenticated;

ALTER TABLE reviews ALTER COLUMN customer_id SET DEFAULT auth.uid();
GRANT INSERT (worker_id, rating, comment) ON reviews TO authenticated;
GRANT UPDATE (rating, comment) ON reviews TO authenticated;
GRANT DELETE ON reviews TO authenticated;

GRANT INSERT, UPDATE, DELETE ON service_categories TO authenticated;

REVOKE EXECUTE ON FUNCTION public.admin_set_worker_status(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_worker_status(uuid, text) TO authenticated;
