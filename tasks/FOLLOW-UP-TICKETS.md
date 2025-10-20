# Follow-Up Tickets - Post-Cleanup

**Date**: 2025-10-20
**Related PR**: #4

---

## Phase 6: Hard Delete Archived Items (30 days post-merge)

**Priority**: LOW
**Estimated Time**: 5 minutes
**When**: 2025-11-20 (30 days after cleanup)

**Task**:
If no issues arise and archived files remain unused after 30 days of production:

```bash
# Verify nothing from archive was restored
git log --since="30 days ago" --grep="restore\|_archive" --oneline

# If clean, remove archive folder
git rm -r _archive/
git commit -m "chore: remove 30-day-old archived files

Items archived on 2025-10-20 confirmed unused after 30 days.
Original tag: pre-cleanup-2025-10-20 remains for historical reference."
```

**Alternative**: Keep `_archive/` permanently as historical reference (recommended for audit trail).

---

## CI/CD Requirements

**Priority**: MEDIUM
**Estimated Time**: 15 minutes
**When**: Next sprint

**Tasks**:

### 1. Required Checks Before Merge
Add to GitHub branch protection rules:

- ✅ `npm run typecheck` must pass
- ✅ `npm run lint` must pass
- ✅ `npm run build` must pass

**Implementation**:
1. Go to repo Settings → Branches → Branch protection rules
2. Add rule for `main` branch
3. Enable "Require status checks to pass before merging"
4. Add checks: `typecheck`, `lint`, `build`

### 2. CodeRabbit as Required Reviewer
Configure in `.github/codeowners` or repo settings:

```
# Require CodeRabbit review for critical paths
/components/**  @coderabbitai
/lib/actions/** @coderabbitai
/middleware.ts  @coderabbitai
```

### 3. Node/npm Version Consistency
Document in README or add `.nvmrc`:

```bash
# .nvmrc
22.20.0
```

Ensure CI uses same Node v22.20.0 and npm 10.9.3 as documented in cleanup report.

---

## ESLint Next Integration (Optional)

**Priority**: LOW
**Estimated Time**: 10 minutes
**When**: As needed

**Current State**:
- Baseline ESLint config exists (`eslint.config.js`)
- `eslint-config-next` installed but not actively configured

**Options**:

**Option A**: Enable Next.js ESLint later
```bash
# When ready, run Next.js ESLint setup
npx next lint
# Follow prompts to configure
```

**Option B**: Keep plain ESLint
Current minimal config is sufficient for now. Next.js-specific rules not critical.

**Recommendation**: Keep as-is until specific Next.js linting rules are needed.

---

## Smoke Test Enhancement

**Priority**: LOW
**Estimated Time**: 10 minutes
**When**: Future enhancement

**Current**:
```json
"smoke": "curl -I localhost:3000 && curl -I localhost:3000/admin ..."
```

**Enhancement**: Create proper smoke test script

```javascript
// scripts/smoke-test.js
const routes = ['/', '/admin', '/join', '/pricing', '/signin'];

Promise.all(routes.map(route =>
  fetch(`http://localhost:3000${route}`)
    .then(r => ({ route, status: r.status, ok: r.ok }))
)).then(results => {
  console.table(results);
  const failed = results.filter(r => !r.ok);
  if (failed.length > 0) {
    console.error('❌ Failed routes:', failed);
    process.exit(1);
  }
  console.log('✅ All routes passed');
});
```

```json
// package.json
"smoke": "node scripts/smoke-test.js"
```

---

## Refactoring Opportunities

**Priority**: LOW
**Estimated Time**: 30 minutes each
**When**: Future sprints

### 1. Consolidate Stripe Helper Usage

**Current**: `lib/stripe.ts` exports `formatAmount`, `isSubscriptionActive`, `needsSubscriptionAttention` but they're unused.

**Action**:
- Refactor `app/admin/billing/page.tsx` to use these helpers
- Remove inline subscription status checks from `middleware.ts`
- Use centralized helpers for consistency

### 2. Break Navigation Circular Dependencies

**Current**: `components/nav/NavBar.tsx` has 3 circular deps with MobileMenu

**Action**:
- Create `lib/nav/NavContext.tsx` for shared navigation state
- Pass nav items as props instead of importing between components
- Use React Context for nav state management

See `tasks/CIRCULAR-DEPS-ANALYSIS.md` for full details.

### 3. Type Consolidation

**Current**: Duplicate types across `lib/actions/*.ts` and `lib/types/*.ts`

**Action**:
- Create barrel file `lib/types/index.ts`
- Export all types from single source
- Update imports to use barrel

---

## Documentation Maintenance

**Priority**: LOW
**Estimated Time**: 5 minutes/month
**When**: Ongoing

**Tasks**:
1. Update `docs/QUICK-REFERENCE.md` when new commands added
2. Keep `docs/QA-PROGRESS-REPORT.md` in sync with testing progress
3. Archive outdated reports to `docs/reports/archive/` annually

---

## Monitoring & Alerts

**Priority**: MEDIUM
**Estimated Time**: 20 minutes
**When**: Post-production deploy

**Setup**:
1. Monitor production for 24-48 hours after merge
2. Watch for:
   - Any 404s on moved doc paths
   - Missing component errors
   - Build failures in CI
3. Keep `pre-cleanup-2025-10-20` tag for quick rollback

**Alerting**: Set up error tracking (Sentry, etc.) if not already enabled

---

## Audit Tool Maintenance

**Priority**: LOW
**Estimated Time**: 10 minutes quarterly
**When**: Every 3 months

**Tasks**:
1. Re-run audit suite:
   ```bash
   npm run audit:knip
   npm run audit:exports
   npm run audit:deps
   npm run audit:circles
   ```
2. Review new findings
3. Create new cleanup ticket if needed
4. Update `.depcheckrc` ignores as dependencies evolve

---

**Total Estimated Time**: ~2-3 hours across multiple sprints
**Critical Items**: CI/CD requirements (MEDIUM priority)
**Optional Items**: Everything else (LOW priority)

**Status**: 📋 Documented for future sprints
