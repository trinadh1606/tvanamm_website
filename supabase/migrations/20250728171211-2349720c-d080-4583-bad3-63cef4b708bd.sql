-- Drop the old assign_user_details function with user_role parameter
DROP FUNCTION IF EXISTS public.assign_user_details(uuid, user_role, text, text, text, uuid);

-- Ensure we only have the correct function with text parameter for role
-- The function with (p_user_id uuid, p_role text, p_tvanamm_id text, p_store_location text, p_store_phone text, p_admin_user_id uuid) should remain