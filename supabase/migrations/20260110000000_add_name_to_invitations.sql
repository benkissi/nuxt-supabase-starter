-- Add name column to invitations table to personalize invitations
-- This allows storing the invitee's name for better email personalization

-- Add name column
ALTER TABLE public.invitations
ADD COLUMN IF NOT EXISTS name text;

-- Add comment for documentation
COMMENT ON COLUMN public.invitations.name IS 'Name of the person being invited (optional, for personalization)';
