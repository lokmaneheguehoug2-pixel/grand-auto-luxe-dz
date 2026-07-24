/*
# Auto-Confirm Emails + Fix Auth for grandauto.local domain

1. Problem
- Users sign up with @grandauto.local emails that can't receive confirmation emails
- Without confirmation, login always fails with "Email not confirmed"

2. Solution
- Create a trigger that auto-confirms email on signup
*/

-- Auto-confirm emails on signup for @grandauto.local domain
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

-- Update any existing unconfirmed users with @grandauto.local
UPDATE auth.users
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  confirmation_token = ''
WHERE email LIKE '%@grandauto.local'
  AND email_confirmed_at IS NULL;
