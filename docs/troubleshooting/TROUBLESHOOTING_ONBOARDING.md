# Troubleshooting: "Failed to create organization" Error

## Quick Diagnosis

You're seeing this error because the database isn't properly set up yet. Follow these steps to fix it.

---

## Step 1: Run Diagnostic Script

```bash
npm run check-db
```

This will tell you **exactly** what's missing in your database.

---

## Step 2: Most Likely Fix - Apply Migrations

The diagnostic will probably show missing columns. This means you need to run the database migrations in Supabase.

### Go to Supabase Dashboard:
1. Open https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** (left sidebar)

### Run These Migrations In Order:

**Migration 1: Initial Schema (001)**
- Click "New query"
- Copy/paste content from `supabase/migrations/001_initial_schema.sql`
- Click "Run" (or press Ctrl+Enter)

**Migration 2: Seed Data (002) - IMPORTANT!**
- Use the **FIXED version** from `supabase/migrations/002_seed_data.sql`
- This creates FAW, EFAW, PFA course types
- Click "Run"

**Migration 5: Organizations (005)**
- Copy/paste from `supabase/migrations/005_organizations_multi_user.sql`
- This creates the `organizations` table
- Click "Run"

**Migration 12: Trial Fields (012)**
- Copy/paste from `supabase/migrations/012_add_trial_fields.sql`
- This adds `trial_end_date`, `plan`, `seats` fields
- Click "Run"

**Migration 13: Profile Enhancements (013)**
- Copy/paste from `supabase/migrations/013_profile_enhancements.sql`
- This adds `timezone`, `logo_url`, etc.
- Click "Run"

### After All Migrations, Run This:
```sql
NOTIFY pgrst, 'reload schema';
```

This reloads the PostgREST schema cache so it recognizes your new tables.

---

## Step 3: Verify Environment Variables

Check your `.env.local` file has these variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # CRITICAL!
```

**Get these from:**
- Supabase Dashboard → Settings → API
- Copy the "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
- Copy "anon public" key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy "service_role" key → `SUPABASE_SERVICE_ROLE_KEY` (**SECRET!**)

### If you changed .env.local:
```bash
# Restart the dev server
npm run dev
```

---

## Step 4: Enable Realtime (For Later)

You'll need this for the trainer console, but not for onboarding:

In Supabase Dashboard:
1. Database → Replication
2. Enable these tables:
   - `attempts`
   - `enrolments`
   - `sittings`

**OR** run this SQL:
```sql
ALTER PUBLICATION supabase_realtime
ADD TABLE attempts, enrolments, sittings;
```

---

## Step 5: Test Again

1. Refresh your browser at http://localhost:3000/onboarding
2. Fill in organization details
3. Click "Complete setup and start trial"

**Now check browser console (F12):**
- If it works: You'll see a redirect to plan selection ✅
- If it fails: You'll see detailed error logs with the actual error message

---

## Common Errors & Solutions

### Error: "column 'trial_end_date' does not exist"
**Fix:** Run migration 012 (`012_add_trial_fields.sql`)

### Error: "column 'timezone' does not exist"
**Fix:** Run migration 013 (`013_profile_enhancements.sql`)

### Error: "relation 'organizations' does not exist"
**Fix:** Run migration 005 (`005_organizations_multi_user.sql`)

### Error: "Not authenticated"
**Fix:** Make sure you're signed in. Go to `/admin/sign-in` first.

### Error: "SUPABASE_SERVICE_ROLE_KEY is not defined"
**Fix:** Add the service role key to `.env.local` and restart dev server

---

## Still Having Issues?

### Check the Console Logs:

**In Terminal (where `npm run dev` is running):**
Look for errors like:
```
Error creating organisation: {error details}
```

**In Browser Console (F12 → Console tab):**
Look for:
```
Onboarding error: ...
Error details: {...}
Error message: ...
```

The detailed error message will tell you exactly what's wrong!

---

## Complete Migration Checklist

Run these migrations in order:

- [ ] 001_initial_schema.sql
- [ ] 002_seed_data.sql (FIXED version!)
- [ ] 003_questions_schema.sql
- [ ] 004_seed_questions.sql
- [ ] 005_organizations_multi_user.sql ⬅️ **CRITICAL for organizations**
- [ ] 006_add_sitting_details.sql (now fixed!)
- [ ] 007_practical_assessments.sql
- [ ] 008_seed_practical_assessments.sql
- [ ] 009_trainer_invite_tokens.sql
- [ ] 010_subscription_management.sql
- [ ] 011_enrolments_table.sql
- [ ] 012_add_trial_fields.sql ⬅️ **CRITICAL for trial fields**
- [ ] 013_profile_enhancements.sql ⬅️ **CRITICAL for timezone**
- [ ] Run: `NOTIFY pgrst, 'reload schema';`

---

## Quick Test After Fix

**Test organization creation:**
```bash
npm run check-db
```

This will:
1. Check all environment variables
2. Verify database connection
3. Check organizations table schema
4. Verify seed data (course types)
5. **Attempt to create a test organization** ← This will catch the error!

If the test organization creates successfully, your issue is fixed! 🎉

---

## Need More Help?

1. Run `npm run check-db` and share the output
2. Check browser console (F12) for detailed error messages
3. Check terminal logs where `npm run dev` is running
4. Verify all 13 migrations are applied in Supabase

---

**TL;DR:** Run migrations 005, 012, and 013 in Supabase SQL Editor, then run `NOTIFY pgrst, 'reload schema';`
