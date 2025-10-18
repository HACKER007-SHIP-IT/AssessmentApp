# Block 5 Setup Instructions

If you're seeing "Failed to load assessment" errors, follow these steps:

## 1. Run Database Migrations

You need to run two new SQL migrations in your Supabase dashboard:

### Step 1: Create Questions Table

1. Go to your Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy and paste the entire contents of `supabase/migrations/003_questions_schema.sql`
4. Click "Run"
5. You should see "Success. No rows returned"

### Step 2: Seed Questions

1. In SQL Editor, click "New Query" again
2. Copy and paste the entire contents of `supabase/migrations/004_seed_questions.sql`
3. Click "Run"
4. This will take a moment as it inserts 100+ questions
5. You should see "Success. No rows returned"

### Step 3: Verify Questions Were Created

Run this query in SQL Editor to verify:

```sql
SELECT COUNT(*) FROM questions;
```

You should see a count of around 106 questions.

### Step 4: Check Questions by Paper

```sql
SELECT
  ct.code,
  p.label,
  COUNT(q.id) as question_count
FROM questions q
JOIN papers p ON q.paper_id = p.id
JOIN course_types ct ON p.course_type_id = ct.id
GROUP BY ct.code, p.label
ORDER BY ct.code, p.label;
```

You should see:
- FAW Paper 1: 20 questions
- FAW Paper 2: 20 questions
- EFAW Paper 1: 15 questions
- EFAW Paper 2: 15 questions
- PFA Paper 1: 18 questions
- PFA Paper 2: 18 questions

## 2. Restart Development Server

After running the migrations:

1. Stop the dev server (Ctrl+C in the terminal)
2. Run `npm run dev` again
3. Try the assessment flow again

## 3. Test the Flow

1. Sign in as admin
2. Create a new sitting (choose FAW Paper 1 for testing - it has 20 questions)
3. Join from another browser window
4. You should now see actual questions instead of the error

## Troubleshooting

### Error: "relation 'questions' does not exist"
- You didn't run migration 003. Go back to Step 1.

### Error: "Failed to load assessment"
- Check the browser console (F12) for more details
- Make sure you ran both migrations 003 and 004
- Make sure your SUPABASE_SERVICE_ROLE_KEY is set in .env.local

### Questions appear but they're all the same
- You didn't run migration 004. Go back to Step 2.

### Can't see the timer or score
- Make sure migration 003 ran successfully - it adds score fields to attempts table

### SQL Error when running 004
- The migration uses DO blocks and might need the papers to exist
- Make sure you ran migrations 001 and 002 first
- Make sure course types and papers exist in the database
