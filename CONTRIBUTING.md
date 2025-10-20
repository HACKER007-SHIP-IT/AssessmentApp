# Contributing to Focus Assessments

Thank you for contributing to Focus Assessments! This document outlines our development workflow and standards.

## CodeRabbit Review Workflow (Policy)

### Goal

All changes are merged to `main` only via pull requests reviewed by CodeRabbit (and a human when needed).

---

## Standard Flow (for every task)

1. **Branch**: Create `feature/<ticket-or-topic>` from latest `main`
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/my-feature
   ```

2. **Commit**: Small, scoped commits using [Conventional Commits](https://www.conventionalcommits.org/)
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `refactor:` - Code refactoring
   - `test:` - Adding or updating tests
   - `chore:` - Maintenance tasks

3. **Push & PR**: Open a PR to `main` with clear title, description, and checklist
   ```bash
   git push -u origin feature/my-feature
   gh pr create --base main
   ```

   The PR template will automatically populate with our checklist.

4. **CI runs**: All checks must pass
   - Tests (`npm test`)
   - Lint (`npm run lint`)
   - Type check (`npm run typecheck`)
   - Build (`npm run build`)

5. **CodeRabbit review**: Wait for automated review to complete
   - CodeRabbit will analyze code quality, security, and best practices
   - Address any high-priority feedback

6. **Human review** (if needed): Required for risky changes
   - Security changes (auth, permissions)
   - Payment/billing code
   - Database migrations
   - Breaking changes

7. **Address feedback**: Push fixes until all checks pass
   - Respond to review comments
   - Make requested changes
   - Push new commits to the same branch

8. **Merge**: Squash-merge to maintain linear history
   - Use "Squash and merge" button in GitHub
   - Edit commit message if needed
   - Delete branch after merge

---

## Branch Protection (GitHub Settings)

The `main` branch has the following protections enabled:

- ✅ Require pull requests to merge (no direct pushes)
- ✅ Required status checks:
  - `ci/test`
  - `lint`
  - `typecheck`
  - `CodeRabbit Review`
- ✅ Require linear history
- ✅ Require branches to be up-to-date before merging
- ✅ Require CODEOWNERS approval for sensitive paths (see `.github/CODEOWNERS`)
- ✅ Dismiss stale approvals when new commits are pushed
- ✅ Enforce for administrators

---

## Pull Request Checklist

When creating a PR, ensure:

### Code Quality
- [ ] Scope is small (< ~400 LOC diff or split into multiple PRs)
- [ ] Code follows existing style and conventions
- [ ] Self-review completed
- [ ] Comments added for complex/non-obvious code

### Testing
- [ ] Tests added/updated (unit/integration) and passing
- [ ] All existing tests pass locally
- [ ] Test coverage meets minimum requirement (80%)

### Technical Requirements
- [ ] Lint passing (`npm run lint`)
- [ ] Type check passing (`npm run typecheck`)
- [ ] Build succeeds (`npm run build`)

### Documentation & Dependencies
- [ ] Migration notes included (DB, env vars, deployment)
- [ ] README/docs updated (if applicable)
- [ ] New dependencies documented with rationale

### Security & Privacy
- [ ] No secrets, tokens, or credentials committed
- [ ] Sensitive data properly handled
- [ ] Security implications considered and documented

---

## Exceptions & Hotfixes

### Hotfix Process
For urgent production issues:

1. Branch from `main`: `hotfix/<issue>`
2. Open PR with "Hotfix" label
3. Same checks apply (CI, lint, typecheck, CodeRabbit)
4. Request expedited review from maintainers
5. Merge when approved

### Emergency Bypass
**Only repo admins** in absolute emergencies:

- Direct commit allowed ONLY when:
  - Production is completely down
  - Security incident requires immediate fix
  - Standard process would cause significant harm

- **Must open retro PR within 24 hours** with full review
- Document reason for bypass in commit message

---

## Code Ownership

### CODEOWNERS File
Certain paths require explicit approval from designated owners (see `.github/CODEOWNERS`):

- **Database & Migrations**: All schema changes
- **Auth & Security**: Authentication, authorization, RLS bypass code
- **Payments**: Stripe integration, subscriptions, webhooks
- **Server Actions**: All code using service role client

### Only Maintainers Can Merge
- Code owners review and approve
- Maintainers perform the actual merge
- Ensures final quality check before merging

---

## Metrics & Hygiene

### Target PR Size
- **Aim for ≤ 300–400 LOC** (lines of code changed)
- Large changes should be split into multiple PRs
- Smaller PRs = faster reviews + easier to understand

### Time to First Review
- **Aim for ≤ 1 business day**
- CodeRabbit provides instant automated review
- Human reviewers should respond within 24 hours

### Merge Strategy
- **Squash & merge only**
- Maintains clean, linear commit history
- Each PR becomes a single commit on `main`

---

## Development Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Git and GitHub CLI (`gh`)

### Local Setup
```bash
# Clone repository
git clone https://github.com/Markkershaw07/AssessmentApp.git
cd AssessmentApp

# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Edit .env.local with your Supabase credentials
# NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
# SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Run development server
npm run dev

# Open http://localhost:3000
```

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Code Quality Checks
```bash
# Lint
npm run lint

# Type check
npm run typecheck

# Build
npm run build

# All checks (recommended before pushing)
npm run lint && npm run typecheck && npm run build && npm test
```

---

## Architecture Guidelines

### Three-Tier Supabase Client Pattern
The app uses **three separate Supabase clients**:

1. **Browser Client** (`lib/supabase/client.ts`): Client-side operations
2. **Server Client** (`lib/supabase/server.ts`): Server components with cookie handling
3. **Service Client** (`lib/supabase/service.ts`): **Bypasses RLS** - server actions only

⚠️ **Never import service client in client components!**

### Server Actions Pattern
All database operations go through server actions in `lib/actions/`:
- Marked with `'use server'` directive
- Always use `createServiceClient()`
- Handle errors with try/catch

### Real-time Subscriptions
Trainer console uses Supabase real-time for live updates:
- Enable replication for relevant tables
- Clean up subscriptions in `useEffect` return

See `CLAUDE.md` for detailed architecture documentation.

---

## Getting Help

- **Documentation**: See `README.md` and `CLAUDE.md`
- **Issues**: Report bugs or request features via GitHub Issues
- **Questions**: Ask in pull request comments or discussions

---

## Code of Conduct

- Be respectful and professional
- Provide constructive feedback
- Focus on the code, not the person
- Assume good intent
- Help others learn and grow

---

Thank you for contributing to Focus Assessments! 🚀
