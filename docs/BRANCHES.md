# AgriPulse — Git Branch Strategy & Guidelines

## Branch Model

We follow a **GitFlow-inspired** model with four permanent branches and short-lived feature branches.

```
main ──────────────────────────────────────────────── production (protected)
  ↑                                                       ↑
  └── release/* ─────────────────────────────────────────┘
test ──────────────────────────────────────────────── staging / QA (protected)
  ↑
dev ───────────────────────────────────────────────── integration (protected)
  ↑
  ├── feat/vision-agent
  ├── feat/weather-alerts
  ├── fix/bangla-encoding
  └── hotfix/booking-crash  ──── also merges → main
```

---

## Permanent Branches

| Branch | Purpose | Who pushes | Direct push |
|--------|---------|------------|-------------|
| `main` | Production-ready code; deployed to prod | Release manager via PR | ❌ Never |
| `test` | QA/staging; mirrors what's ready to test | Dev team via PR from `dev` | ❌ Never |
| `dev` | Integration; all features land here first | All developers via PR | ❌ Never |

---

## Short-Lived Branch Types

| Prefix | When to use | Branch from | Merges into |
|--------|------------|-------------|-------------|
| `feat/*` | New features (agents, tools, UI) | `dev` | `dev` |
| `fix/*` | Non-urgent bug fixes | `dev` | `dev` |
| `hotfix/*` | Urgent production bugs | `main` | `main` AND `dev` |
| `release/*` | Release preparation, version bumps | `dev` | `main` AND `dev` |
| `chore/*` | Tooling, CI, dependency updates | `dev` | `dev` |
| `docs/*` | Documentation only | `dev` | `dev` |
| `experiment/*` | Spikes / exploratory work (may be discarded) | `dev` | `dev` (if kept) |

---

## Naming Conventions

```
feat/phase-1-knowledge-agent
feat/phase-2-vision-agent
feat/phase-3-notification-alerts
fix/weather-risk-null-region
fix/bangla-encoding-utf8
hotfix/booking-slot-overflow
release/v1.0.0
chore/upgrade-langgraph-0.3
docs/api-endpoints
experiment/yolo-v9-comparison
```

Rules:
- **Lowercase only** — no uppercase, no spaces
- **Hyphens** as separators — no underscores, no slashes within the name part
- **Phase prefix** for feature branches matching the roadmap (e.g., `feat/phase-2-vision-agent`)
- **Max 50 characters** for the branch name
- **Delete** short-lived branches after merge (squash if < 5 commits, merge commit if > 5)

---

## Commit Message Format

We follow **Conventional Commits**:

```
<type>(<scope>): <short summary>

[optional body — what and why, not how]

[optional footer — breaking changes, issue refs]
```

### Types

| Type | When |
|------|------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `chore` | Build, CI, tooling |
| `refactor` | Code change without feature/fix |
| `test` | Adding or fixing tests |
| `perf` | Performance improvement |
| `style` | Formatting (no logic change) |

### Examples

```
feat(vision-agent): add YOLO v8 fallback for low-confidence detections

When Claude Vision returns confidence < 60%, route image through local
YOLO v8 model. Reduces misdiagnosis rate in field conditions.

Closes #14
```

```
fix(memory): correct Redis TTL not applying on session refresh
```

```
chore(deps): upgrade langgraph to 0.3.0
```

---

## Pull Request Process

### Opening a PR

1. Branch must be up-to-date with its target branch (`git rebase dev` before opening)
2. PR title must follow Conventional Commits format
3. Fill out the PR template completely
4. Link related issues with `Closes #N`
5. Add screenshots/logs for UI or agent behavior changes

### PR Template (`.github/PULL_REQUEST_TEMPLATE.md`)

```markdown
## Summary
<!-- What does this PR do? -->

## Type of Change
- [ ] feat — new feature
- [ ] fix — bug fix
- [ ] chore / docs / refactor

## Testing Done
- [ ] Unit tests pass (`pytest tests/unit/`)
- [ ] Integration tests pass (`pytest tests/integration/`)
- [ ] Manual test: [describe what you tested]

## Checklist
- [ ] Branch is up-to-date with target
- [ ] No `.env` or secrets committed
- [ ] Bangla output verified for affected flows
- [ ] `ruff check` and `mypy` pass
```

### Review Requirements

| Target branch | Min approvals | CI required |
|--------------|--------------|-------------|
| `dev` | 1 | Yes |
| `test` | 1 | Yes |
| `main` | 2 | Yes |

### Merge Strategy

| Scenario | Strategy |
|----------|----------|
| `feat/*` → `dev` (≤ 5 commits) | Squash merge |
| `feat/*` → `dev` (> 5 commits) | Merge commit |
| `dev` → `test` | Merge commit |
| `test` → `main` | Merge commit |
| `hotfix/*` → `main` | Squash merge |

---

## Release Flow

```
1. Cut release branch:   git checkout -b release/v1.2.0 dev
2. Bump versions, update CHANGELOG
3. PR release/v1.2.0 → main   (2 approvals required)
4. Tag on main:          git tag -a v1.2.0 -m "Release v1.2.0"
5. Back-merge to dev:    git merge release/v1.2.0 into dev
6. Delete release branch
```

---

## GitHub Branch Protection Rules (Setup Instructions)

Apply these rules in **Settings → Branches → Add rule**:

### `main`
- [x] Require pull request reviews before merging — **2 approvals**
- [x] Dismiss stale pull request approvals when new commits are pushed
- [x] Require status checks to pass — `test`, `build`
- [x] Require branches to be up to date before merging
- [x] Restrict who can push — only release managers
- [x] Do not allow bypassing the above settings

### `test`
- [x] Require pull request reviews — **1 approval**
- [x] Require status checks to pass — `test`, `build`
- [x] Require branches to be up to date

### `dev`
- [x] Require pull request reviews — **1 approval**
- [x] Require status checks to pass — `test`
- [x] Allow force pushes — **disabled**

---

## Hotfix Procedure

For urgent production bugs:

```bash
git checkout main
git pull origin main
git checkout -b hotfix/describe-the-fix

# ... make fix, add tests ...

git push origin hotfix/describe-the-fix
# Open PR → main (needs 2 approvals, fast-track allowed)
# After merge to main, immediately back-merge to dev:
git checkout dev
git merge main
git push origin dev
```
