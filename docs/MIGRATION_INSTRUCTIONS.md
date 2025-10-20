# Migration 013: Profile Enhancements - Manual Application Guide

## Status
❌ **Migration NOT YET APPLIED** - Profile page will not work until this is completed

## What This Migration Does
Adds comprehensive profile and organization management capabilities:
- New organization fields: logo_url, brand_color, billing_email, legal_name, timezone, soft delete flags
- Audit logging table (organization_events)
- Supabase Storage bucket for logos
- Updated RLS policies for owner-only editing

## How to Apply

### Method 1: Supabase Dashboard SQL Editor (RECOMMENDED)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy Migration SQL**
   - Open: `supabase/migrations/013_profile_enhancements.sql`
   - Select All (Ctrl+A) and Copy (Ctrl+C)

4. **Execute Migration**
   - Paste the SQL into the Supabase SQL Editor
   - Click "Run" (or press Ctrl+Enter)
   - Wait for "Success" message

5. **Verify**
   - Run this query to check:
   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'organizations'
     AND column_name IN ('logo_url', 'brand_color', 'billing_email', 'legal_name', 'timezone', 'is_deleted');
   ```
   - You should see all 6 columns listed

### Method 2: Programmatic Check

After running the migration, verify it worked:

```bash
node scripts/check-schema.js
```

Expected output:
```
✓ Migration 013 already applied!

All required columns exist:
  - logo_url
  - brand_color
  - billing_email
  - legal_name
  - timezone
  - is_deleted
  - deleted_at
```

## After Migration

Once applied, the profile page will work correctly at `/admin/profile` with:
- ✅ Organization branding (logo upload + brand color)
- ✅ Contact & billing information
- ✅ Trial status with seat tracking
- ✅ Password change (with strength indicator)
- ✅ Email change (with verification flow)
- ✅ Organization deletion (with safeguards)
- ✅ Audit logging for all changes

## Troubleshooting

**If you see errors about policies:**
- The migration uses `DO $$ ... END $$` blocks for idempotent policy creation
- These should work on Supabase's Postgres, but if they fail, you can manually create the policies

**If storage bucket creation fails:**
- You can manually create the bucket in Supabase Dashboard:
  1. Go to Storage
  2. Click "New bucket"
  3. Name: `organization-logos`
  4. Public: ✅ Enabled
  5. File size limit: 2MB
  6. Allowed MIME types: image/png, image/jpeg, image/jpg

## Need Help?

If the migration fails, check the Supabase logs for specific error messages and we can troubleshoot from there.
