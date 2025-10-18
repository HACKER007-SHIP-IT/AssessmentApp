# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Focus Assessments is a Next.js 14 application for administering first aid assessments to FAIB (First Aid in Business) providers. The system supports three course types (FAW, EFAW, PFA), each with multiple papers containing assessment questions.

## Development Commands

```bash
# Start development server (runs on port 3000, or 3001 if 3000 is occupied)
npm run dev
# or
pnpm dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Critical Architecture Concepts

### 1. Three-Tier Supabase Client Pattern

The application uses **three separate Supabase clients** for different contexts:

- **`lib/supabase/client.ts`**: Browser client for client-side operations (uses `createBrowserClient` from `@supabase/ssr`)
- **`lib/supabase/server.ts`**: Server client with cookie handling for server components (uses `createServerClient` from `@supabase/ssr`)
- **`lib/supabase/service.ts`**: Service role client that **bypasses RLS** (Row Level Security) - only use in server actions

**IMPORTANT**: Never import the service client in client components or pages. Server actions in `lib/actions/*` use the service client exclusively.

### 2. Server Actions Pattern

All database operations go through server actions in `lib/actions/`:
- `lib/actions/sittings.ts` - Sitting creation, fetching, session controls (start, extend, lock, end)
- `lib/actions/attempts.ts` - Student/attempt creation, fetching, submission
- `lib/actions/questions.ts` - Question fetching (without answers for students), response saving, scoring

Server actions are marked with `'use server'` directive and always use `createServiceClient()`.

### 3. Real-time Subscriptions

The trainer console (`app/trainer/[token]/page.tsx`) uses Supabase real-time to show students joining/submitting live:

```typescript
const channel = supabase
  .channel(`sitting:${sittingId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'attempts',
    filter: `sitting_id=eq.${sittingId}`
  }, callback)
  .subscribe()
```

Real-time must be enabled in Supabase Dashboard for the `attempts` table.

### 4. Authentication & Route Protection

- Admin routes (`/admin/*`) are protected by `middleware.ts`
- Middleware checks `supabase.auth.getUser()` and redirects unauthenticated users to `/admin/sign-in`
- Public routes: `/`, `/join`, `/join/confirm`, `/trainer/[token]`, `/attempt/[id]`
- Default admin credentials: `admin@focus.test` / `Focus!Admin123`

### 5. Assessment Flow Architecture

**Admin/Trainer Flow:**
1. Admin creates sitting via wizard (`/admin/sittings/new`) → saves to database
2. Redirected to trainer console (`/trainer/[token]`)
3. Trainer clicks "Start" to change status to `in_progress`
4. Trainer monitors students joining/submitting in real-time
5. Trainer can extend time, lock joins, or end sitting

**Student Flow:**
1. Student visits `/join` and enters short code (e.g., `FAW-AB3D`)
2. Validates code at `/join/confirm`, creates student + attempt records
3. Redirected to `/attempt/[id]` with actual questions
4. Answers auto-save to `responses` table as `selected_index` (0-3 for A-D)
5. Timer counts down; auto-submits at 0:00
6. On submit, `calculateAndSubmitScore()` marks answers, calculates score
7. Results screen shows score, percentage, PASS/FAIL (72% threshold)

### 6. Database Schema Critical Details

**7 tables:**
- `course_types` - FAW, EFAW, PFA (seeded)
- `papers` - Paper 1, Paper 2 for each course type (seeded)
- `trainers` - Created on-demand when admin enters trainer name
- `sittings` - Contains `status` ('ready', 'in_progress', 'closed'), `settings` JSONB, `short_code`, `token`
- `students` - Just name, created when student joins
- `attempts` - Links student to sitting, has `score`, `total_questions`, `pass_mark`, `passed`, `submitted_at`
- `responses` - Links attempt to question, stores `selected_index` (0-3) NOT `selected_answer`
- `questions` - 106 questions across 6 papers, has `correct_answer` ('A', 'B', 'C', 'D')

**CRITICAL**: The `responses` table uses `selected_index` (integer 0-3) not `selected_answer` (letter). Code converts between letter (UI) and index (database).

### 7. Migration Order & Supabase Setup

Database migrations MUST be run in order in Supabase SQL Editor:
1. `001_initial_schema.sql` - Creates 7 tables
2. `002_seed_data.sql` - Seeds course types and papers
3. `003_questions_schema.sql` - Adds questions table and scoring fields to attempts
4. `004_seed_questions.sql` - Inserts 106 questions

After running migrations, you MUST run in Supabase SQL Editor:
```sql
NOTIFY pgrst, 'reload schema';
```
This reloads PostgREST schema cache so it recognizes new tables.

**Realtime Setup:**
- Enable for `attempts` table in Supabase Dashboard → Database → Replication
- OR run: `ALTER PUBLICATION supabase_realtime ADD TABLE attempts;`

### 8. Token & Short Code Generation

Utility functions in `lib/utils.ts`:
- `generateToken()` - 24-character base32 string for trainer console URL
- `generateShortCode(courseType)` - Format: `{COURSE}-{4-char-base32}` (e.g., `FAW-AB3D`)
- `generateId()` - UUID v4 for manual ID generation

Short codes are shown to students and entered in join form. Tokens are secret URLs for trainer consoles.

### 9. Scoring Logic

In `lib/actions/questions.ts`:
1. Fetch all questions for paper with `correct_answer` field
2. Fetch student's responses with `selected_index` field
3. Convert: `letterToIndex = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 }`
4. Compare `studentAnswerIndex === correctAnswerIndex`
5. Calculate percentage: `(correctCount / totalQuestions) * 100`
6. Pass/fail: `percentage >= 72` (72% is pass mark for all course types)
7. Update attempt with `score`, `total_questions`, `pass_mark`, `passed`

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...  # NEVER expose to client!
```

## Common Patterns

### Adding a New Server Action

1. Create function in appropriate `lib/actions/*.ts` file
2. Add `'use server'` directive at top of file
3. Use `createServiceClient()` from `lib/supabase/service`
4. Handle errors with try/catch and throw new Error
5. Import and call from client component

### Fetching Data in Client Component

```typescript
'use client'
import { useState, useEffect } from 'react'
import { getSomething } from '@/lib/actions/something'

export default function Page() {
  const [data, setData] = useState(null)

  useEffect(() => {
    async function load() {
      const result = await getSomething()
      setData(result)
    }
    load()
  }, [])
}
```

### Adding Real-time Subscription

```typescript
useEffect(() => {
  if (!id) return
  const supabase = createClient() // browser client

  const channel = supabase
    .channel(`unique-channel-name:${id}`)
    .on('postgres_changes', {
      event: '*', // or 'INSERT', 'UPDATE', 'DELETE'
      schema: 'public',
      table: 'table_name',
      filter: `column=eq.${value}`
    }, (payload) => {
      // Handle change
    })
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}, [id])
```

## Testing the Application

1. Run all 4 migrations in Supabase SQL Editor
2. Run `NOTIFY pgrst, 'reload schema';` in SQL Editor
3. Enable realtime for `attempts` table
4. Create admin user in Supabase Auth
5. Start dev server: `npm run dev`
6. Sign in at `/admin/sign-in`
7. Create new sitting via wizard
8. Open trainer console in one browser
9. Join as student in another browser/window
10. Complete assessment, verify real-time updates

## Troubleshooting

**"Could not find the table 'public.questions' in the schema cache"**
- Run `NOTIFY pgrst, 'reload schema';` in Supabase SQL Editor
- Verify migrations 003 and 004 ran successfully

**"column responses.selected_answer does not exist"**
- The schema uses `selected_index` (0-3), not `selected_answer` (A-D)
- Code should convert between letter (UI) and index (DB)

**Real-time not working**
- Enable replication for `attempts` table in Supabase Dashboard
- OR run `ALTER PUBLICATION supabase_realtime ADD TABLE attempts;`

**Timer not counting down**
- Check that `started_at` timestamp exists in attempt
- Timer calculates remaining time on page load based on duration setting

**Students can't join**
- Check if sitting status is 'closed' or `settings.joinsLocked` is true
- Verify short code matches exactly (case-sensitive)

1. First think through the problem, read the codebase for relevant files, and write a plan to tasks/todo.md.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Finally, add a review section to the todo.md file with a summary of the changes you made and any other relevant information.
8. DO NOT BE LAZY. NEVER BE LAZY. IF THERE IS A BUG FIND THE ROOT CAUSE AND FIX IT. NO TEMPORARY FIXES. YOU ARE A SENIOR DEVELOPER. NEVER BE LAZY
9. MAKE ALL FIXES AND CODE CHANGES AS SIMPLE AS HUMANLY POSSIBLE. THEY SHOULD ONLY IMPACT NECESSARY CODE RELEVANT TO THE TASK AND NOTHING ELSE. IT SHOULD IMPACT AS LITTLE CODE AS POSSIBLE. YOUR GOAL IS TO NOT INTRODUCE ANY BUGS. IT'S ALL ABOUT SIMPLICITY

CRITICAL: When debugging you MUST trace through the ENTIRE code flow step by step. no assumptions. no shortcuts
