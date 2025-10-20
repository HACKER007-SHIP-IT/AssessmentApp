# Repository Cleanup Audit Report

**Date**: 2025-10-20
**Environment**: Node v22.20.0 | npm 10.9.3 | Windows
**Baseline**: ✓ Build passing | ⚠ ESLint not configured
**Branch**: chore/cleanup-dryrun
**Rollback Tag**: pre-cleanup-2025-10-20

---

## Executive Summary

Comprehensive audit of the Focus Assessments codebase revealed:
- **15 unused files** (mostly marketing and utility components)
- **2 unused dependencies** (@stripe/stripe-js, uuid)
- **59+ unused exports** (UI component variants, helper functions)
- **20 unused types** (interfaces for data structures)
- **No TypeScript errors** ✓
- **No critical circular dependencies** (76 minor warnings)
- **10+ documentation files** at root level (consolidation opportunity)

**Recommendation**: Archive unused files first, then remove confirmed unused dependencies in Phase 5.

---

## A. Unused Files (15 total)

| File | Status | Reason | Confidence | Risk | Rollback |
|------|--------|--------|------------|------|----------|
| `lib/offline-queue.ts` | **ARCHIVE** | Not imported anywhere, queue functionality unused | HIGH | LOW | TRIVIAL |
| `components/admin/OnboardingChecklist.tsx` | **ARCHIVE** | Not imported, possible future feature | MEDIUM | LOW | TRIVIAL |
| `components/marketing/FAQ.tsx` | **MAYBE** | Marketing component, check if internal-only app | MEDIUM | LOW | SIMPLE |
| `components/marketing/FeaturesGrid.tsx` | **MAYBE** | Marketing component, check if internal-only app | MEDIUM | LOW | SIMPLE |
| `components/marketing/LandingFooter.tsx` | **MAYBE** | Marketing component, check if internal-only app | MEDIUM | LOW | SIMPLE |
| `components/marketing/LandingHero.tsx` | **MAYBE** | Marketing component, check if internal-only app | MEDIUM | LOW | SIMPLE |
| `components/marketing/LandingNav.tsx` | **MAYBE** | Marketing component, check if internal-only app | MEDIUM | LOW | SIMPLE |
| `components/marketing/PricingSection.tsx` | **MAYBE** | Marketing component, check if internal-only app | MEDIUM | LOW | SIMPLE |
| `components/marketing/Testimonials.tsx` | **MAYBE** | Marketing component, check if internal-only app | MEDIUM | LOW | SIMPLE |
| `components/marketing/TrustBadges.tsx` | **MAYBE** | Marketing component, check if internal-only app | MEDIUM | LOW | SIMPLE |
| `components/practical/SkillChecklistItem.tsx` | **ARCHIVE** | Not imported, likely superseded by other components | MEDIUM | LOW | SIMPLE |
| `components/trainer/SyncStatus.tsx` | **ARCHIVE** | Not imported, sync functionality may be elsewhere | MEDIUM | LOW | SIMPLE |
| `components/ui/EmptyState.tsx` | **ARCHIVE** | Reusable component not yet used, keep for future? | LOW | LOW | TRIVIAL |
| `components/ui/ErrorState.tsx` | **ARCHIVE** | Reusable component not yet used, keep for future? | LOW | LOW | TRIVIAL |
| `components/ui/SkeletonLoader.tsx` | **ARCHIVE** | Reusable component not yet used, keep for future? | LOW | LOW | TRIVIAL |

**Action Recommendation**:
- **ARCHIVE** 6 files → `/_archive/2025-10-20/components/`
- **MAYBE** 9 marketing files → Manual review: Is this an internal-only app or public-facing?

---

## B. Unused Dependencies (2 total)

| Package | Type | Reason | Confidence | Risk | Action |
|---------|------|--------|------------|------|--------|
| `@stripe/stripe-js` | dependency | Not imported anywhere, server-side Stripe only? | HIGH | MEDIUM | **DELETE** |
| `uuid` | dependency | Not imported, `crypto.randomUUID()` used instead? | HIGH | LOW | **DELETE** |

**False Positives (KEEP)**:
| Package | Type | Reason |
|---------|------|--------|
| `autoprefixer` | devDependency | ❌ Flagged by depcheck, but REQUIRED by PostCSS/Tailwind |
| `postcss` | devDependency | ❌ Flagged by depcheck, but REQUIRED by PostCSS/Tailwind |
| `eslint` | devDependency | ❌ Flagged by knip, but used by `next lint` |
| `eslint-config-next` | devDependency | ❌ Flagged by knip, but used by `next lint` |
| `@types/uuid` | devDependency | ❌ Can remove if `uuid` package is removed |

**Action Recommendation**:
- Verify `@stripe/stripe-js` not used in client components (check for `loadStripe` calls)
- Verify `uuid` not used (search for `import { v4 }` or `uuid()`)
- If confirmed, remove both packages: `npm uninstall @stripe/stripe-js uuid @types/uuid`

---

## C. Unused Exports (59 total)

### C1. UI Component Variants (LOW PRIORITY)

These are exported variants of shadcn/ui components that may be used in future:

| Export | File | Status | Reason |
|--------|------|--------|--------|
| `CardFooter` | components/ui/card.tsx | **KEEP** | Common UI pattern, may be used soon |
| `badgeVariants` | components/ui/badge.tsx | **KEEP** | Variant helper for custom styling |
| `AlertTitle` | components/ui/alert.tsx | **KEEP** | Common alert component part |
| `SelectGroup`, `SelectLabel`, etc. | components/ui/select.tsx | **KEEP** | Shadcn components, keep all exports |
| `DialogPortal`, `DialogOverlay`, etc. | components/ui/dialog.tsx | **KEEP** | Shadcn components, keep all exports |
| `AlertDialogPortal`, `AlertDialogOverlay` | components/ui/alert-dialog.tsx | **KEEP** | Shadcn components, keep all exports |
| `DropdownMenu*` variants (10 exports) | components/ui/dropdown-menu.tsx | **KEEP** | Shadcn components, keep all exports |
| `Sheet*` variants (5 exports) | components/ui/sheet.tsx | **KEEP** | Shadcn components, keep all exports |
| `ToastAction` | components/ui/toast.tsx | **KEEP** | Toast functionality, may be used |

**Reason to KEEP**: Shadcn/ui components are designed with all variants exported. Removing exports breaks the pattern and may cause issues if imported later.

### C2. Server Actions (REVIEW INDIVIDUALLY)

| Export | File | Status | Reason | Confidence |
|--------|------|--------|--------|------------|
| `updateOrganization` | lib/actions/organizations.ts | **MAYBE** | Check if used in profile page | MEDIUM |
| `hasActiveSubscription` | lib/actions/subscriptions.ts | **MAYBE** | Check if used in middleware/billing | MEDIUM |
| `submitAttempt` | lib/actions/attempts.ts | **MAYBE** | Check if used in attempt submission flow | HIGH |
| `getQuestionsByPaperId` | lib/actions/questions.ts | **MAYBE** | Check if used in assessment pages | HIGH |
| `getAttemptsBySittingId` | lib/actions/sittings.ts | **MAYBE** | Check if used in results pages | HIGH |
| `startSitting` | lib/actions/sittings.ts | **MAYBE** | Check if used in trainer console | HIGH |
| `extendSitting` | lib/actions/sittings.ts | **MAYBE** | Check if used in trainer console | HIGH |
| `getEnrolledStudents` | lib/actions/students.ts | **MAYBE** | Check if used in trainer dashboard | HIGH |
| `startWrittenAssessment` | lib/actions/students.ts | **MAYBE** | Check if used in student enrollment | HIGH |
| `getCombinedStudentResults` | lib/actions/students.ts | **MAYBE** | Check if used in results pages | HIGH |
| `broadcastTimerUpdate` | lib/hooks/useTrainerRealtime.ts | **MAYBE** | Check if used in trainer realtime updates | MEDIUM |
| `broadcastSittingUpdate` | lib/hooks/useTrainerRealtime.ts | **MAYBE** | Check if used in trainer realtime updates | MEDIUM |
| `formatAmount` | lib/stripe.ts | **MAYBE** | Check if used in billing pages | MEDIUM |
| `isSubscriptionActive` | lib/stripe.ts | **MAYBE** | Check if used in middleware/billing | MEDIUM |
| `needsSubscriptionAttention` | lib/stripe.ts | **MAYBE** | Check if used in billing UI | MEDIUM |
| `getPracticalSittingResults` | lib/actions/practicals.ts | **MAYBE** | Check if used in practical results | MEDIUM |
| `getPracticalSittingStudents` | lib/actions/practicals.ts | **MAYBE** | Check if used in practical pages | MEDIUM |
| `getStudentCourseResult` | lib/actions/course-results.ts | **MAYBE** | Check if used in certificate pages | MEDIUM |
| `canIssueCertificate` | lib/actions/course-results.ts | **MAYBE** | Check if used in certificate logic | MEDIUM |
| `refreshSession` | lib/actions/auth.ts | **ARCHIVE** | Not used, session refresh via middleware? | LOW |
| `signOutUser` | lib/actions/auth.ts | **ARCHIVE** | Not used, sign-out via route handler? | LOW |

**Action Recommendation**: Manual code search for each "MAYBE" export to confirm usage. Many may be dynamically called or used in unreached code paths.

### C3. Utility Functions

| Export | File | Status | Reason |
|--------|------|--------|--------|
| `randomBase32` | lib/utils.ts | **MAYBE** | Check if used for token generation | MEDIUM |
| `reducer`, `toast` | hooks/use-toast.ts | **MAYBE** | Check if toast system is used | HIGH |

### C4. Validation Schemas

| Export | File | Status | Reason |
|--------|------|--------|--------|
| `brandColorSchema` | lib/validation/profile.ts | **MAYBE** | Check if used in profile customization | MEDIUM |
| `organizationDeleteSchema` | lib/validation/profile.ts | **MAYBE** | Check if used in org deletion flow | MEDIUM |
| `logoUploadSchema` | lib/validation/profile.ts | **MAYBE** | Check if used in profile upload | MEDIUM |
| `normalizePhone` | lib/validation/profile.ts | **ARCHIVE** | Not used, phone fields don't exist? | MEDIUM |

### C5. Config/Navigation

| Export | File | Status | Reason |
|--------|------|--------|--------|
| `noHeaderRoutes` | lib/nav/config.ts | **MAYBE** | Check if used in layout for conditional header | MEDIUM |

**Action Recommendation**: Most exports marked MAYBE need manual code search. Do NOT remove without verification.

---

## D. Unused Exported Types (20 total)

| Type | File | Status | Reason |
|------|------|--------|--------|
| `ButtonProps`, `BadgeProps`, `InputProps`, `TextareaProps` | components/ui/* | **KEEP** | TypeScript interfaces for props, useful for consumers |
| `CreateAttemptData` | lib/actions/attempts.ts | **KEEP** | Type for data structures, useful for type safety |
| `Question`, `QuestionForStudent` | lib/actions/questions.ts | **KEEP** | Core domain types |
| `CreateSittingData`, `SittingResult` | lib/actions/sittings.ts | **KEEP** | Core domain types |
| `EnrollStudentData` | lib/actions/students.ts | **KEEP** | Core domain types |
| `WrittenStatus`, `PracticalStatus`, `Enrolment` | lib/actions/enrolments.ts | **KEEP** | Core domain types |
| `PracticalAssessment`, `PracticalScenario`, `PracticalSkill`, etc. | lib/actions/practicals.ts | **KEEP** | Core domain types for practical assessments |
| `OrganizationDeleteInput` | lib/validation/profile.ts | **MAYBE** | Check if used in org deletion |

**Reason to KEEP**: Exported types are intentionally public APIs for type safety. Even if not imported elsewhere, they document the shape of data.

**Action Recommendation**: KEEP all types. They provide type safety and documentation.

---

## E. Dynamic Usage Review

### E1. Next.js Dynamic Routes (ALL ARE USED)

| Route | Status | Reason |
|-------|--------|--------|
| `app/trainer/[token]/*` | **KEEP** | ✓ Dynamic trainer console routes |
| `app/attempt/[id]/*` | **KEEP** | ✓ Dynamic assessment attempt routes |
| `app/admin/sittings/[id]/*` | **KEEP** | ✓ Dynamic sitting results routes |
| `app/admin/trainers/[id]/*` | **KEEP** | ✓ Dynamic trainer edit routes |
| `app/trainer/[token]/practical/[studentId]/*` | **KEEP** | ✓ Dynamic practical assessment routes |
| `app/trainer/[token]/results/[attemptId]/*` | **KEEP** | ✓ Dynamic results routes |
| `app/trainer/invite/[token]/*` | **KEEP** | ✓ Dynamic trainer invite routes |

**False Positives**: ts-unused-exports flags these as "unused" because Next.js loads them via file-system routing, not imports.

### E2. API Routes (ALL ARE USED)

| Route | Status | Reason |
|-------|--------|--------|
| `app/api/auth/resend/route.ts` | **KEEP** | ✓ POST handler for email resend |
| `app/api/auth/status/route.ts` | **KEEP** | ✓ GET handler for auth status check |
| `app/api/debug/onboarding/route.ts` | **MAYBE** | Debug endpoint, remove in production? |
| `app/api/stripe/checkout/route.ts` | **KEEP** | ✓ POST handler for Stripe checkout |
| `app/api/stripe/portal/route.ts` | **KEEP** | ✓ POST handler for Stripe portal |
| `app/api/stripe/webhook/route.ts` | **KEEP** | ✓ POST handler for Stripe webhooks |
| `app/auth/confirm/route.ts` | **KEEP** | ✓ GET handler for email confirmation |
| `app/admin/sign-out/route.ts` | **KEEP** | ✓ POST handler for sign out |

**Action Recommendation**: Remove `app/api/debug/onboarding/route.ts` before production deployment.

### E3. Middleware & Config (KEEP ALL)

| File | Status | Reason |
|------|--------|--------|
| `middleware.ts` | **KEEP** | ✓ Next.js middleware for auth/routing |
| `tailwind.config.ts` | **KEEP** | ✓ Tailwind CSS configuration |
| `next.config.js` | **KEEP** | ✓ Next.js configuration |
| `postcss.config.js` | **KEEP** | ✓ PostCSS configuration |
| `tsconfig.json` | **KEEP** | ✓ TypeScript configuration |

**False Positives**: ts-unused-exports flags these, but they're framework config files.

---

## F. Public Assets Policy

### F1. Assets to KEEP (Framework/SEO Required)

| Path | Reason |
|------|--------|
| `public/favicon.ico` | ✓ Browser favicon |
| `public/manifest.json` | ✓ PWA manifest (if exists) |
| `public/robots.txt` | ✓ SEO/crawler instructions |
| `public/og-image.png` | ✓ Open Graph social preview |

### F2. Assets Referenced at Runtime

⚠ **Note**: Images/assets in `/public` directory may be referenced via HTML `<img src="/path.png">` or CSS `url(/path.png)`, which static analysis tools cannot detect.

**Action Recommendation**: Manually check `/public` directory for unused assets. Do NOT auto-archive based on tool output.

---

## G. Supabase/Database References

### G1. Migrations (NEVER TOUCH)

| Path | Status |
|------|--------|
| `supabase/migrations/*.sql` | **KEEP** | ✓ Database schema migrations, DO NOT ARCHIVE |

### G2. Scripts

| Path | Status | Reason |
|------|--------|--------|
| `scripts/check-db-schema.js` | **KEEP** | ✓ Used by `npm run check-db` |
| `scripts/check-migrations.js` | **KEEP** | ✓ Used by `npm run check-migrations` |
| `scripts/check-user-org.js` | **KEEP** | ✓ Used by `npm run check-user` |
| `scripts/run-migration.js` | **MAYBE** | Check if still used |
| `scripts/check-schema.js` | **MAYBE** | Duplicate of check-db-schema.js? |

---

## H. Configuration Consolidation

### H1. Overlapping Configs

✓ **No issues found**. Single source of truth for each tool:
- ESLint: Not configured yet (needs setup)
- TypeScript: `tsconfig.json` (good)
- Tailwind: `tailwind.config.ts` (good)
- PostCSS: `postcss.config.js` (good)

### H2. Documentation Files at Root (CONSOLIDATE)

| File | Status | Action |
|------|--------|--------|
| `README.md` | **KEEP** | ✓ Main readme at root |
| `CLAUDE.md` | **KEEP** | ✓ Claude Code instructions |
| `CONTRIBUTING.md` | **KEEP** | ✓ Contribution guidelines |
| `BLOCK5_SETUP.md` | **CONSOLIDATE** | Move to `docs/setup/` |
| `STRIPE_SETUP_GUIDE.md` | **CONSOLIDATE** | Move to `docs/setup/` |
| `TRAINER_CONSOLE_IMPLEMENTATION.md` | **CONSOLIDATE** | Move to `docs/implementation/` |
| `MIGRATION_INSTRUCTIONS.md` | **CONSOLIDATE** | Move to `docs/` |
| `AUDIT_REPORT.md` | **CONSOLIDATE** | Move to `docs/reports/` |
| `LAUNCH_READY_REPORT.md` | **CONSOLIDATE** | Move to `docs/reports/` |
| `TROUBLESHOOTING_ONBOARDING.md` | **CONSOLIDATE** | Move to `docs/troubleshooting/` |
| `docs/*.md` | **KEEP** | Already in docs folder |

**Action Recommendation**: Move 7 root-level MD files to organized `docs/` subdirectories.

---

## I. Large Assets (>500KB)

⚠ **Manual check needed**: Run `find . -type f -size +500k | grep -v node_modules` to identify large assets.

**Action Recommendation**: If large images/videos found, consider moving to CDN (Vercel Blob, Cloudinary, etc.).

---

## J. Circular Dependencies (76 warnings)

| Component | Imports | Severity |
|-----------|---------|----------|
| `components/nav/NavBar.tsx` | 3 dependencies | LOW |
| `components/nav/MobileMenu.tsx` | 2 dependencies | LOW |
| `components/practical/ScenarioCard.tsx` | 2 dependencies | LOW |
| Various server actions | 1 dependency each | LOW |

**Analysis**: These are mostly UI components importing sub-components, or server actions importing shared utilities. None are critical circular loops.

**Action Recommendation**: No action needed. These are acceptable dependency patterns in React applications.

---

## K. Special Findings (This Repository)

### K1. QRCode.react Usage

| Package | Used In | Status |
|---------|---------|--------|
| `qrcode.react` | `components/qr/Qr.tsx` → used in trainer console | **KEEP** |

✓ **Verified**: qrcode.react IS used in trainer QR panel.

### K2. Recharts Usage

| Package | Used In | Status |
|---------|---------|--------|
| `recharts` | `components/charts/PassRateChart.tsx` | **KEEP** |
| `recharts` | `components/charts/CourseAttemptsChart.tsx` | **KEEP** |

✓ **Verified**: recharts IS used in admin dashboard.

### K3. Marketing Components (9 files)

**Question**: Is Focus Assessments an **internal-only app** or **public-facing with marketing site**?

- If **internal-only**: ARCHIVE all 9 marketing components
- If **public-facing**: KEEP marketing components

**Files in question**:
- `components/marketing/FAQ.tsx`
- `components/marketing/FeaturesGrid.tsx`
- `components/marketing/LandingFooter.tsx`
- `components/marketing/LandingHero.tsx`
- `components/marketing/LandingNav.tsx`
- `components/marketing/PricingSection.tsx`
- `components/marketing/Testimonials.tsx`
- `components/marketing/TrustBadges.tsx`
- `components/admin/OnboardingChecklist.tsx`

**Action Required**: User decision needed.

### K4. Duplicate Types in lib/types/

| File | Status |
|------|--------|
| `lib/types/practical.ts` | **KEEP** | Domain types for practical assessments |

No duplication detected. Types are well-organized.

---

## L. Performance Log

| Audit Step | Duration | Status |
|------------|----------|--------|
| knip | ~5s | ✓ Completed |
| ts-unused-exports | ~3s | ✓ Completed |
| depcheck | ~2s | ✓ Completed |
| tsc --noEmit | ~8s | ✓ Completed (no errors) |
| madge circular | ~4s | ✓ Completed (76 warnings, non-critical) |
| **Total** | **~22s** | ✓ All audits passed |

---

## M. Rollback Instructions

### Method 1: Git Reset (Complete Rollback)
```bash
git reset --hard pre-cleanup-2025-10-20
git push origin chore/cleanup-dryrun --force
```

### Method 2: Archive Restoration
```bash
# Restore specific files from archive
cp -r _archive/2025-10-20/<category>/* <original-path>/
```

### Method 3: Git Revert (Preserve History)
```bash
git revert <commit-hash>
git push origin chore/cleanup-dryrun
```

### Method 4: Package Restoration
```bash
# Restore removed packages
npm install @stripe/stripe-js uuid @types/uuid
```

---

## Summary of Recommended Actions

### Phase 5A: Safe Deletions (Approve First)

#### Dependencies to Remove (Verify First):
1. Search codebase for `@stripe/stripe-js` usage
2. Search codebase for `uuid` usage
3. If confirmed unused: `npm uninstall @stripe/stripe-js uuid @types/uuid`

### Phase 5B: Files to Archive (Approve First)

Create `/_archive/2025-10-20/` structure:

#### Definitely Archive (6 files):
```
/_archive/2025-10-20/
├── lib/
│   └── offline-queue.ts
├── components/
│   ├── practical/SkillChecklistItem.tsx
│   ├── trainer/SyncStatus.tsx
│   └── ui/
│       ├── EmptyState.tsx
│       ├── ErrorState.tsx
│       └── SkeletonLoader.tsx
```

#### Maybe Archive - Needs User Decision (9 marketing + 1 admin):
```
/_archive/2025-10-20/
└── components/
    ├── marketing/
    │   ├── FAQ.tsx
    │   ├── FeaturesGrid.tsx
    │   ├── LandingFooter.tsx
    │   ├── LandingHero.tsx
    │   ├── LandingNav.tsx
    │   ├── PricingSection.tsx
    │   ├── Testimonials.tsx
    │   └── TrustBadges.tsx
    └── admin/
        └── OnboardingChecklist.tsx
```

### Phase 5C: Documentation Reorganization

Move root-level MD files to organized structure:
```bash
mkdir -p docs/setup docs/implementation docs/reports docs/troubleshooting
mv BLOCK5_SETUP.md docs/setup/
mv STRIPE_SETUP_GUIDE.md docs/setup/
mv TRAINER_CONSOLE_IMPLEMENTATION.md docs/implementation/
mv MIGRATION_INSTRUCTIONS.md docs/
mv AUDIT_REPORT.md docs/reports/
mv LAUNCH_READY_REPORT.md docs/reports/
mv TROUBLESHOOTING_ONBOARDING.md docs/troubleshooting/
```

### Phase 5D: Verification (Must Pass)

```bash
npm run audit:types   # Must show no errors
npm run audit:build   # Must complete successfully
npm run dev           # Manual check: test top 5 routes
```

**Top 5 Critical Routes to Test**:
1. `http://localhost:3000/admin` - Dashboard
2. `http://localhost:3000/join` - Student join
3. `http://localhost:3000/admin/sittings/new` - Create sitting
4. `http://localhost:3000/trainer/[token]` - Trainer console (use real token)
5. `http://localhost:3000/attempt/[id]` - Assessment (use real attempt ID)

---

## Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| Breaking dynamic imports | MEDIUM | Manual code search for each MAYBE export before archiving |
| Removing used dependency | HIGH | Grep entire codebase for `@stripe/stripe-js` and `uuid` before removal |
| Archiving needed component | LOW | Archive-first strategy allows easy restoration |
| Documentation loss | LOW | Moving to `docs/` preserves all content, improves organization |
| Marketing site breaks | MEDIUM | User decision required: internal-only vs public-facing app |

---

## Audit Tool Configuration Issues

### Issues Found:
1. ✓ **Fixed**: Knip doesn't support `--silent` flag (changed to `--no-progress`)
2. ✓ **Fixed**: ts-unused-exports doesn't support `--silent` flag (removed)
3. ⚠ **Configuration Hint**: Knip suggests removing `next/dynamic` and `react.lazy` from `ignoreDependencies` (they're not used in the project)

### Recommended Config Updates:

**knip.json**:
```json
{
  "$schema": "https://unpkg.com/knip/schema.json",
  "ignore": [
    "next.config.*",
    "postcss.config.*",
    "tailwind.config.*",
    "scripts/**",
    "public/**",
    "coverage/**",
    "docs/**",
    "_archive/**",
    "**/*.d.ts",
    "supabase/migrations/**"
  ]
}
```
(Remove `ignoreDependencies` section as suggested by knip)

---

## Next Steps

1. ✅ **Review this report** - Approve/modify recommendations
2. ⏳ **User Decision**: Are marketing components needed? (internal-only vs public-facing)
3. ⏳ **Verify Dependencies**: Manual search for `@stripe/stripe-js` and `uuid`
4. ⏳ **Phase 5 Execution**: Apply approved changes only
5. ⏳ **Validation**: Run full test suite + manual smoke tests
6. ⏳ **PR Creation**: Submit for CodeRabbit + human review

---

**Report Generated**: 2025-10-20
**Status**: ⏳ **AWAITING APPROVAL - NO CHANGES APPLIED YET**
**Rollback Available**: `git reset --hard pre-cleanup-2025-10-20`
