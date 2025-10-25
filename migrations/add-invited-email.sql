-- Add invited_email column to company_team_members
-- This allows inviting users before they sign up

ALTER TABLE company_team_members
ADD COLUMN IF NOT EXISTS invited_email TEXT;

-- Create index for faster lookups by email
CREATE INDEX IF NOT EXISTS idx_company_team_members_invited_email
ON company_team_members(invited_email);

-- Allow user_id to be NULL (for pending invitations where user hasn't signed up yet)
ALTER TABLE company_team_members
ALTER COLUMN user_id DROP NOT NULL;
