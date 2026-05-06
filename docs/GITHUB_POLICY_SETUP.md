# GitHub Repository Policies & CI/CD Setup Guide

This document provides step-by-step instructions for configuring all GitHub policies, branch protection rules, and CI/CD settings for the AgriPulse project.

---

## ✅ Already Configured (Automated)

The following settings have been applied automatically via GitHub API:

| Setting | Value | Status |
|---------|-------|--------|
| Default branch | `dev` | ✅ Done |
| Delete branch on merge | Enabled | ✅ Done |
| Squash merge | Enabled (PR title + body) | ✅ Done |
| Merge commit | Enabled | ✅ Done |
| Rebase merge | Disabled | ✅ Done |
| Vulnerability alerts | Enabled | ✅ Done |

---

## ⚠️ Requires GitHub Pro / Team / Enterprise

The following features require a paid GitHub plan for **private repositories**. They are **free for public repositories**.

### Option 1: Make Repository Public (Free)

If this is an open-source project, make it public:

1. Go to: https://github.com/mazleon/agripulse-agent/settings
2. Scroll to "Danger Zone" at the bottom
3. Click "Change visibility" → "Make public"
4. Confirm with your password

Once public, branch protection and secret scanning become **free**.

### Option 2: Upgrade to GitHub Pro / Team

1. Go to: https://github.com/settings/billing
2. Select "Upgrade to Pro" or "Start free trial"
3. Follow payment instructions

---

## 🔒 Branch Protection Rules (Manual Setup)

After making the repo public or upgrading to Pro, configure these rules:

### Step 1: `main` Branch Protection

Go to: https://github.com/mazleon/agripulse-agent/settings/branches

Click **"Add rule"** and configure:

**Branch name pattern:** `main`

#### ✅ Protect matching branches

**Require a pull request before merging:**
- [x] Require approvals: **2**
- [x] Dismiss stale PR approvals when new commits are pushed
- [x] Require review from Code Owners (if CODEOWNERS file exists)
- [x] Require approval of the most recent reviewable push

**Require status checks to pass before merging:**
- [x] Require branches to be up to date before merging

**Status checks that are required:**
- Search and select:
  - `Backend Lint & Type Check`
  - `Backend Tests`
  - `Frontend Lint & Build`
  - `Docker Build`
  - `TruffleHog Secret Scan`
  - `Env File Leak Check`
  - `Dependency Vulnerability Scan`

**Require signed commits:**
- [x] Require signed commits

**Require linear history:**
- [ ] Leave unchecked (we use merge commits)

**Include administrators:**
- [x] Do not allow bypassing the above settings

**Restrict who can push to matching branches:**
- [x] Restrict pushes that create matching branches
- Add: `@mazleon` (release manager)

**Allow force pushes:**
- [ ] Do not allow

**Allow deletions:**
- [ ] Do not allow

---

### Step 2: `dev` Branch Protection

Click **"Add rule"** and configure:

**Branch name pattern:** `dev`

#### ✅ Protect matching branches

**Require a pull request before merging:**
- [x] Require approvals: **1**
- [x] Dismiss stale PR approvals when new commits are pushed

**Require status checks to pass before merging:**
- [x] Require branches to be up to date before merging

**Status checks that are required:**
- Search and select:
  - `Backend Lint & Type Check`
  - `Backend Tests`
  - `Frontend Lint & Build`
  - `TruffleHog Secret Scan`

**Require signed commits:**
- [ ] Optional (recommended: enable)

**Allow force pushes:**
- [ ] Do not allow

**Allow deletions:**
- [ ] Do not allow

---

### Step 3: `test` Branch Protection

Click **"Add rule"** and configure:

**Branch name pattern:** `test`

#### ✅ Protect matching branches

**Require a pull request before merging:**
- [x] Require approvals: **1**

**Require status checks to pass before merging:**
- [x] Require branches to be up to date before merging

**Status checks that are required:**
- Search and select:
  - `Backend Lint & Type Check`
  - `Backend Tests`
  - `Frontend Lint & Build`
  - `TruffleHog Secret Scan`

**Allow force pushes:**
- [ ] Do not allow

**Allow deletions:**
- [ ] Do not allow

---

## 🔐 Security Settings

### Enable Secret Scanning (Requires Pro / Public Repo)

1. Go to: https://github.com/mazleon/agripulse-agent/settings/security_analysis
2. Under "Secret scanning":
   - [x] Enable "Secret scanning"
   - [x] Enable "Push protection for secret scanning"
3. Under "Dependency graph":
   - [x] Enable "Dependency graph"
   - [x] Enable "Dependabot alerts"
   - [x] Enable "Dependabot security updates"

### What Push Protection Does

When enabled, GitHub will **block any push** that contains:
- API keys (OpenRouter, Anthropic, etc.)
- Database passwords
- Private tokens
- SSH private keys
- AWS credentials

You'll see an error like:
```
Push protection for secret scanning found the following secrets:
- Generic High Entropy Secret in .env (line 8)
```

---

## 👥 Team & Collaborators

### Add Collaborators

1. Go to: https://github.com/mazleon/agripulse-agent/settings/access
2. Click "Add people"
3. Invite by GitHub username or email
4. Select role:
   - **Read**: Can view and clone
   - **Triage**: Can manage issues/PRs
   - **Write**: Can push code (developers)
   - **Maintain**: Can push to protected branches (team leads)
   - **Admin**: Full access (you)

### CODEOWNERS File (Optional but Recommended)

Create `.github/CODEOWNERS`:

```
# Global fallback
* @mazleon

# Backend code
/backend/ @mazleon @backend-lead

# Frontend code
/frontend/ @mazleon @frontend-lead

# Infrastructure
/infra/ @mazleon @devops-lead

# Documentation
/docs/ @mazleon @docs-lead

# Security-critical files
/.github/workflows/ @mazleon
/lefthook.yml @mazleon
```

This ensures the right people review the right code.

---

## 🏷️ Labels Setup

Create these labels for issue/PR organization:

| Label | Color | Description |
|-------|-------|-------------|
| `phase-0` | `#0E8A16` | Foundation |
| `phase-1` | `#1D76DB` | Core Agents |
| `phase-2` | `#5319E7` | Vision + Weather |
| `phase-3` | `#FEF2C0` | Notifications + Booking |
| `phase-4` | `#FFD54F` | Memory + Personalization |
| `phase-5` | `#FF7619` | Self-Evolving |
| `phase-6` | `#B60205` | Mobile + Scale |
| `security` | `#D93F0B` | Security-related |
| `bug` | `#D73A4A` | Something is broken |
| `enhancement` | `#A2EEEF` | New feature |
| `documentation` | `#0075CA` | Docs improvement |
| `good first issue` | `#7057FF` | Good for newcomers |

Go to: https://github.com/mazleon/agripulse-agent/labels

---

## 🚀 CI/CD Pipeline Status

Your CI/CD is already configured via workflow files. Here's the flow:

```
Developer pushes branch
        ↓
GitHub Actions triggers:
  ├─ security-check.yml (parallel)
  │   ├─ TruffleHog secret scan
  │   ├─ .env file leak check
  │   ├─ Hardcoded secret scan
  │   ├─ pip-audit (Python deps)
  │   ├─ npm audit (Node deps)
  │   └─ Trivy container scan (PR only)
  │
  └─ ci.yml (parallel)
      ├─ Backend Lint (ruff + mypy)
      ├─ Backend Tests (pytest)
      ├─ Frontend Lint (eslint + tsc)
      └─ Docker Build
        ↓
All checks must pass for PR to be mergeable
        ↓
Required approvals obtained
        ↓
Merge to dev/test/main
```

---

## 📋 Pre-Push Checklist (For Developers)

Before every `git push`, run:

### Python Backend
```bash
cd backend
uv run ruff check --fix app/ tests/
uv run ruff format app/ tests/
uv run mypy app/
```

### Frontend
```bash
cd frontend
npx eslint --fix src/ app/ components/
npx prettier --write .
npx tsc --noEmit
```

### Install Pre-Push Hook
```bash
npx lefthook install
```

This runs all checks automatically on every push.

---

## 🔄 Merge Strategy Quick Reference

| From → To | Strategy | Why |
|---|---|---|
| `feat/*` → `dev` (≤ 5 commits) | Squash merge | Clean history |
| `feat/*` → `dev` (> 5 commits) | Merge commit | Preserve commit history |
| `dev` → `test` | Merge commit | Keep integration history |
| `test` → `main` | Merge commit | Release traceability |
| `hotfix/*` → `main` | Squash merge | Minimal, focused fix |

---

## 📞 Troubleshooting

### "Cannot merge — status checks failing"

1. Click "Details" on the failing check
2. Fix the issue locally
3. Push the fix to the same branch
4. Checks will re-run automatically

### "Cannot merge — need approvals"

1. Request review from team members
2. Address review comments
3. Re-request review after changes
4. Merge once approved

### "Push rejected — secrets detected"

1. Remove the secret from the file
2. Move it to `.env` (which is gitignored)
3. Use GitHub Secrets for CI/CD values
4. Amend commit: `git commit --amend`
5. Force push: `git push --force-with-lease`

---

## 📚 Related Files

- `.github/workflows/ci.yml` — Main CI pipeline
- `.github/workflows/security-check.yml` — Security scanning
- `lefthook.yml` — Local pre-push hooks
- `docs/BRANCHES.md` — Branch strategy details
- `.github/PULL_REQUEST_TEMPLATE.md` — PR template

---

*Last updated: 2026-05-06*
*Repository: https://github.com/mazleon/agripulse-agent*
