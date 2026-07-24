-- Auto-confirm emails on signup for @grandauto.local domain
-- Without this, new users can't log in because email confirmation is required
CREATE OR REPLACE FUNCTION public.auto_confirm_email()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = auth AS $$
BEGIN
  IF NEW.email LIKE '%@grandauto.local' THEN
    NEW.email_confirmed_at := now();
    NEW.confirmation_token := '';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_confirm ON auth.users;

CREATE TRIGGER on_auth_user_created_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_email();

-- Confirm any existing unconfirmed @grandauto.local users
UPDATE auth.users
SET
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  confirmation_token = ''
WHERE email LIKE '%@grandauto.local'
  AND email_confirmed_at IS NULL;
