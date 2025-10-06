-- ===============================================
-- SaaS Schema: Dedicated Organizations + Personal Accounts
-- Supabase + Nuxt
-- ===============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===============================================
-- 1. ACCOUNTS (personal)
-- ===============================================
CREATE TABLE public.accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    image JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.accounts IS 'Personal accounts for individual users. Each user gets one automatically.';

-- ===============================================
-- 2. ORGANIZATIONS
-- ===============================================
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES auth.users (id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    website TEXT,
    image JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.organizations IS 'Organizations (teams, companies) created by users.';

-- ===============================================
-- 3. ORGANIZATION MEMBERS
-- ===============================================
CREATE TABLE public.organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations (id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    job_title TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (organization_id, user_id)
);

COMMENT ON TABLE public.organization_members IS 'Links users to organizations with roles.';

-- ===============================================
-- 4. INVITATIONS
-- ===============================================
CREATE TABLE public.invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations (id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    invited_by UUID REFERENCES auth.users (id) ON DELETE SET NULL,
    role TEXT NOT NULL DEFAULT 'member',
    token UUID NOT NULL DEFAULT uuid_generate_v4(),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
    UNIQUE (organization_id, email)
);

COMMENT ON TABLE public.invitations IS 'Organization invitations for new or existing users.';

-- ===============================================
-- 5. TIMESTAMP TRIGGER
-- ===============================================
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER accounts_update_timestamp
BEFORE UPDATE ON public.accounts
FOR EACH ROW
EXECUTE PROCEDURE public.update_timestamp();

CREATE TRIGGER orgs_update_timestamp
BEFORE UPDATE ON public.organizations
FOR EACH ROW
EXECUTE PROCEDURE public.update_timestamp();

-- ===============================================
-- 6. RLS (Row Level Security)
-- ===============================================
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Personal account access
CREATE POLICY "Users can view their personal account"
  ON public.accounts
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own personal account"
  ON public.accounts
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Organizations
CREATE POLICY "Users can view their organizations"
  ON public.organizations
  FOR SELECT
  USING (
    owner_id = auth.uid()
    OR id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create organizations"
  ON public.organizations
  FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Org owners can update their organization"
  ON public.organizations
  FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Organization members
CREATE POLICY "Members can view their membership"
  ON public.organization_members
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Org owners can add themselves as owner member"
  ON public.organization_members
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND role = 'owner'
    AND organization_id IN (
      SELECT id FROM public.organizations
      WHERE owner_id = auth.uid()
    )
  );

  CREATE POLICY "Invited users can join organizations"
    ON public.organization_members
    FOR INSERT
    WITH CHECK (
      user_id = auth.uid()
      AND organization_id IN (
        SELECT organization_id FROM public.invitations
        WHERE email = auth.jwt() ->> 'email'
        AND status = 'accepted'
      )
    );

  CREATE POLICY "Owners and admins can update members"
    ON public.organization_members
    FOR UPDATE
    USING (
      auth.uid() = user_id OR
      auth.uid() IN (
        SELECT om2.user_id
        FROM public.organization_members AS om2
        WHERE om2.organization_id = organization_members.organization_id
        AND om2.role IN ('owner', 'admin')
      )
    )
    WITH CHECK (TRUE);


-- Invitations
CREATE POLICY "Invites visible to org members"
  ON public.invitations
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

  CREATE POLICY "Org owners and admins can send invitations"
    ON public.invitations
    FOR INSERT
    WITH CHECK (
      auth.uid() IN (
        SELECT om.user_id
        FROM public.organization_members AS om
        WHERE om.organization_id = invitations.organization_id
        AND om.role IN ('owner', 'admin')
      )
    );

CREATE POLICY "Invited users can view their own invites"
  ON public.invitations
  FOR SELECT
  USING (
    email = auth.jwt() ->> 'email'
  );

-- ===============================================
-- 7. AUTO-CREATE PERSONAL ACCOUNT ON USER SIGNUP
-- ===============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.accounts (user_id, name, slug, image)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CONCAT('user-', NEW.id),
    '{}'::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Keep Supabase's internal trigger intact
-- Add our own alongside it, with a unique name

DROP TRIGGER IF EXISTS after_user_created_handle_account ON auth.users;

CREATE TRIGGER after_user_created_handle_account
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE PROCEDURE public.handle_new_user();

-- ===============================================
-- 8. AUTO-ADD ORGANIZATION OWNER AS MEMBER
-- ===============================================

CREATE OR REPLACE FUNCTION public.add_org_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.organization_members (organization_id, user_id, role, job_title)
  VALUES (
    NEW.id,
    NEW.owner_id,
    'owner',
    'Owner'
  )
  ON CONFLICT (organization_id, user_id) DO NOTHING; -- prevent duplicates
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if re-running migration
DROP TRIGGER IF EXISTS after_org_created_add_owner_member ON public.organizations;

-- Create trigger that runs after an organization is inserted
CREATE TRIGGER after_org_created_add_owner_member
AFTER INSERT ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.add_org_owner_as_member();

