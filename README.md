# Focus Assessments

Simple, reliable assessments for FAIB providers.

## Development Progress

### Block 1: Minimal Scaffold ✅

Initial scaffold with basic structure and navigation:

- Next.js 14 with App Router and TypeScript
- Tailwind CSS + shadcn/ui components
- Supabase client configuration
- Four placeholder pages: Home, Admin, Trainer Console, and Join

### Block 2: Admin Authentication ✅

Secure admin authentication using Supabase Auth:

- Email/password sign-in for admin users
- Protected `/admin` routes with middleware
- Sign-in and sign-out functionality
- Dynamic header navigation based on auth state

### Block 3: Start Sitting Wizard (UI Only) ✅

UI-only wizard for creating assessment sittings and basic join flow:

- 4-step wizard for creating assessment sittings
- Course type selection (FAW, EFAW, PFA)
- Paper selection and settings configuration
- Mock data generation (no database writes yet)
- Trainer console with QR code and short code display
- Student join flow with name entry and rules agreement
- Placeholder attempt page for demo purposes

### Block 4: Database Persistence & Real-time Updates ✅

Full database integration with real-time synchronization:

- Complete database schema with 7 tables (course_types, papers, trainers, sittings, students, attempts, responses)
- Wizard now persists sittings to Supabase database
- Trainer console fetches real sitting data and displays live student joins
- Real-time subscriptions show students appearing instantly in trainer view
- Students create actual database records when joining
- Attempt tracking with start/submit timestamps
- Server actions for secure database operations

### Block 5: Questions, Timer, Scoring & Session Controls ✅

Complete assessment functionality with questions, timer, and scoring:

- Question bank with 100+ realistic first aid questions across all papers
- Students see actual assessment questions with multiple choice answers
- Real-time answer recording to database as students select answers
- Countdown timer with visual warning when time is running low
- Auto-submit when timer reaches zero
- Automatic scoring with pass/fail calculation (72% pass mark)
- Results screen showing score, percentage, and pass/fail status
- Functional session controls: Start, Extend (+5min), Lock Joins, End
- Trainer can manage assessment lifecycle from console
- Prevents students joining locked/closed assessments

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm (or npm/yarn)
- A Supabase project (for environment variables)

### Installation

1. Clone or navigate to this directory

2. Install dependencies:
```bash
pnpm install
# or
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` and add your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key
   - **`SUPABASE_SERVICE_ROLE_KEY`** - Your Supabase service role key (Block 4)

   You can find these in your Supabase project settings at:
   https://app.supabase.com/project/_/settings/api

   **IMPORTANT:** Keep the service role key secret - never expose it to the client!

5. **Set up Supabase Authentication** (Block 2):
   - Go to your Supabase Dashboard → Authentication → Providers
   - Enable the **Email** provider
   - Go to Authentication → Users → Add User
   - Create an admin user:
     - Email: `admin@focus.test`
     - Password: `Focus!Admin123`
     - Auto Confirm User: ✓ (checked)

6. **Run Database Migrations** (Blocks 4 & 5):
   - Go to your Supabase Dashboard → SQL Editor
   - Click "New Query"
   - Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
   - Click "Run" to create all tables
   - Create a new query and paste `supabase/migrations/002_seed_data.sql`
   - Click "Run" to seed course types and papers
   - Create a new query and paste `supabase/migrations/003_questions_schema.sql`
   - Click "Run" to create questions table and scoring fields
   - Create a new query and paste `supabase/migrations/004_seed_questions.sql`
   - Click "Run" to seed 100+ assessment questions

7. **Enable Realtime** (Block 4):
   - Go to Database → Replication
   - Find the `attempts` table
   - Toggle the switch to enable realtime for this table

8. Run the development server:
```bash
pnpm dev
# or
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
.
├── app/
│   ├── admin/
│   │   ├── sign-in/
│   │   │   └── page.tsx       # Admin sign-in page (Block 2)
│   │   ├── sign-out/
│   │   │   └── route.ts       # Sign-out route handler (Block 2)
│   │   └── page.tsx           # Protected admin dashboard (Block 2)
│   ├── join/
│   │   └── page.tsx           # Join page with short code input
│   ├── trainer/
│   │   └── [token]/
│   │       └── page.tsx       # Trainer console with dynamic token
│   ├── layout.tsx             # Root layout with AppHeader
│   ├── page.tsx               # Home page with navigation cards
│   └── globals.css            # Tailwind + shadcn/ui styles
├── components/
│   ├── ui/
│   │   ├── button.tsx         # shadcn/ui Button component
│   │   ├── card.tsx           # shadcn/ui Card component
│   │   └── input.tsx          # shadcn/ui Input component
│   ├── app-header.tsx         # App header with conditional nav (Block 2)
│   └── sign-out-button.tsx    # Sign-out button component (Block 2)
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # Browser Supabase client
│   │   └── server.ts          # Server Supabase client
│   └── utils.ts               # Utility functions (cn)
├── middleware.ts              # Auth middleware (Block 2)
└── .env.example               # Environment variables template
```

## Pages

### Home (`/`)
Landing page with three navigation cards linking to:
- Admin area
- Trainer console (demo)
- Join assessment

### Admin Sign In (`/admin/sign-in`)
**Block 2:** Email/password sign-in form for admin users. Redirects to dashboard on successful authentication.

### Admin Dashboard (`/admin`)
**Block 2:** Protected admin dashboard showing the logged-in user's email. Redirects to sign-in if not authenticated. Will include sitting management wizard in Block 3.

### Trainer Console (`/trainer/[token]`)
Displays the session token from the URL. Will become a real-time monitoring dashboard in later blocks.

### Join (`/join`)
Input form for participants to enter a short code. No validation or logic yet.

## Authentication (Block 2)

### How It Works

- **Sign In**: Navigate to `/admin/sign-in` and use the credentials created in Supabase
- **Protected Routes**: The `/admin` dashboard is protected by middleware
  - If not authenticated → redirected to `/admin/sign-in`
  - If already authenticated and visiting `/admin/sign-in` → redirected to `/admin`
- **Sign Out**: Click the "Sign Out" button in the header (appears when logged in)
- **Session Management**: Supabase handles session cookies automatically

### Admin Credentials

Default admin account (set up in Supabase):
- Email: `admin@focus.test`
- Password: `Focus!Admin123`

## Testing Block 3: Wizard Flow (UI Only)

### Complete Flow Test

1. **Sign in as admin** at `/admin/sign-in`
2. **Click "New Sitting"** button in header
3. **Step through the wizard:**
   - Step 1: Select a course type (FAW, EFAW, or PFA)
   - Step 2: Choose a paper (Paper 1 or Paper 2)
   - Step 3: Set duration and randomization options
   - Step 4: Enter trainer name
   - Click "Finish"
4. **You'll be redirected to the Trainer Console** showing:
   - QR code for students to scan
   - Short code (e.g., FAW-AB3D)
   - Sitting details
   - Disabled control buttons (Start, Extend, Lock, End)
   - Empty students list
5. **In a new tab/window, navigate to `/join`**
6. **Enter the short code** shown on the trainer console
7. **Fill in your name** and check the rules agreement
8. **Click "Start Assessment"**
9. **You'll see the demo placeholder page** explaining this is UI-only

### What's Working (Block 3)

- ✅ Complete wizard with validation
- ✅ Mock data generation (ID, token, short code)
- ✅ QR code generation
- ✅ Data passed via URL parameters (no database)
- ✅ Student join flow with validation
- ✅ Mobile-responsive design

## Testing Block 4: Database Integration & Real-time

### Complete Database Flow Test

**Prerequisites:**
- Database migrations run (see installation step 6)
- Realtime enabled for attempts table (see installation step 7)
- Service role key added to `.env.local`

**Test Steps:**

1. **Sign in as admin** and click "New Sitting"
2. **Complete the wizard** - this now saves to database
3. **You'll be redirected to Trainer Console** - data is loaded from Supabase
4. **In a NEW browser window/tab** (or incognito), go to `/join`
5. **Enter the short code** and your name
6. **Watch the trainer console** - the student should appear instantly (real-time!)
7. **On the student page**, click "Submit Assessment (Demo)"
8. **Watch the trainer console** - student status changes to "Submitted" in real-time

### What's Working (Block 5)

- ✅ Database persistence with all tables
- ✅ Real-time updates for student joins
- ✅ Complete question bank (100+ questions across 6 papers)
- ✅ Live assessment with actual questions
- ✅ Answer recording with auto-save
- ✅ Countdown timer with auto-submit
- ✅ Automatic scoring and pass/fail calculation
- ✅ Results screen with detailed feedback
- ✅ Session controls (Start, Extend, Lock, End)
- ✅ Locked/closed sitting prevention

## Testing Block 5: Complete Assessment Flow

### Full End-to-End Test

**Prerequisites:**
- All database migrations run (001, 002, 003, 004)
- Realtime enabled for attempts table
- Service role key in `.env.local`

**Test Steps:**

1. **Sign in as admin** and click "New Sitting"
2. **Create a new sitting:**
   - Select course type (e.g., FAW)
   - Choose Paper 1
   - Set duration to 45 minutes
   - Enable randomization options
   - Enter trainer name
3. **You'll be redirected to Trainer Console**
   - Status shows "(Ready to start)"
   - Start button is enabled
4. **Click the "Start" button**
   - Status changes to "(In Progress)"
   - Extend and Lock buttons become enabled
5. **In a new browser window**, go to `/join`
6. **Enter the short code** and your name
7. **You'll see the assessment with:**
   - Question 1 of 20 (for FAW)
   - Multiple choice options (A, B, C, D)
   - Timer counting down from 45:00
   - Progress indicator showing 0/20
8. **Answer questions:**
   - Select answers by clicking radio buttons
   - "Saving..." appears briefly after each selection
   - Navigate with Previous/Next buttons
   - Question grid shows answered questions in green
9. **Watch the trainer console** (real-time):
   - Student appears in the list instantly
   - Status shows "In progress"
10. **Test the timer:**
    - Timer counts down in real-time
    - Turns red when < 5 minutes remaining
    - Auto-submits when time reaches 0:00
11. **Test extending time (trainer):**
    - Click "Extend +5m" button
    - Duration increases to 50 minutes
    - Students see updated timer
12. **Submit the assessment:**
    - Must answer all questions before submitting
    - Click "Submit Assessment"
    - Redirects to results screen
13. **View results:**
    - Shows score percentage
    - Displays PASS or FAIL (72% pass mark)
    - Shows correct/total questions
    - Green border for pass, red for fail
14. **Back to trainer console:**
    - Student status changes to "Submitted" in real-time
15. **Test Lock Joins:**
    - Click "Lock Joins" button
    - Try joining from new browser - shows error
16. **Test End Sitting:**
    - Click "End" button
    - Confirms warning about auto-submission
    - Status changes to "(Closed)"
    - All unsubmitted attempts are auto-submitted

### What's Working

- ✅ Full question bank with realistic questions
- ✅ Question navigation with visual indicators
- ✅ Real-time answer auto-save
- ✅ Timer with countdown and auto-submit
- ✅ Scoring calculation (correct/incorrect)
- ✅ Pass/fail determination (72% threshold)
- ✅ Detailed results screen
- ✅ Session lifecycle management
- ✅ Real-time trainer monitoring
- ✅ Join prevention when locked/closed

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Button, Card, Input, Select, RadioGroup, Switch, Checkbox, Label)
- **Icons**: lucide-react
- **QR Codes**: qrcode.react
- **Backend**: Supabase (auth active, database coming in Block 4)

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Notes

- **Block 1**: Minimal scaffold with basic navigation
- **Block 2**: Admin authentication is now active - `/admin` routes require sign-in
- **Block 3**: UI-only wizard and join flow
- **Block 4**: Full database persistence with real-time updates - sittings and attempts are saved!
- **Block 5**: Complete assessment system with questions, timer, scoring, and session controls
- Public pages (Home, Join, Trainer) remain accessible without authentication
- Database includes 100+ realistic first aid questions across 6 papers
- Real-time updates for student joins and submissions
- Automatic scoring with 72% pass mark across all course types
- Timer auto-submits when expired
- Trainers can manage sitting lifecycle (Start, Extend, Lock, End)

## Documentation

For detailed setup guides, implementation notes, and troubleshooting:

### Setup Guides
- [Block 5 Setup Guide](docs/setup/BLOCK5_SETUP.md) - Questions, Timer, Scoring & Session Controls
- [Stripe Integration Guide](docs/setup/STRIPE_SETUP_GUIDE.md) - Payment and subscription setup

### Implementation Docs
- [Trainer Console Implementation](docs/implementation/TRAINER_CONSOLE_IMPLEMENTATION.md) - Technical details of trainer features

### Database & Migrations
- [Migration Instructions](docs/MIGRATION_INSTRUCTIONS.md) - Database migration guide

### Reports & Analysis
- [Launch Readiness Report](docs/reports/LAUNCH_READY_REPORT.md) - Pre-launch checklist
- [Audit Report](docs/reports/AUDIT_REPORT.md) - Security and code quality audit

### Troubleshooting
- [Onboarding Troubleshooting](docs/troubleshooting/TROUBLESHOOTING_ONBOARDING.md) - Common onboarding issues and fixes

### Additional Resources
- [Quick Reference Guide](docs/QUICK-REFERENCE.md) - Common commands and workflows
- [QA Progress Report](docs/QA-PROGRESS-REPORT.md) - Testing and QA status
- [Polish Summary](docs/POLISH-SUMMARY.md) - UI/UX refinements

---

Built with Next.js 14 and Supabase
