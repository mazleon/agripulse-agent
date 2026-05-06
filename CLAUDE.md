## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)

---

## Code Formatting & Linting Rules (ALL Agents — OpenCode, Claude, Antigravity, etc.)

**These checks MUST pass before any code is pushed to git.**

### Python Backend

1. **Run `uv ruff check --fix`** on all modified `.py` files:
   ```bash
   cd backend
   uv run ruff check --fix app/ tests/
   ```

2. **Run `uv ruff format`** on all modified `.py` files:
   ```bash
   cd backend
   uv run ruff format app/ tests/
   ```

3. **Run `mypy`** type check:
   ```bash
   cd backend
   uv run mypy app/
   ```

4. **Configuration**: `backend/pyproject.toml` has `[tool.ruff]` and `[tool.mypy]` sections. Do not change these without team approval.

### Frontend (TypeScript / JavaScript)

1. **Run `eslint`** on all modified `{ts,tsx,js,jsx}` files:
   ```bash
   cd frontend
   npx eslint --fix src/ app/ components/
   ```

2. **Run `prettier`** format check:
   ```bash
   cd frontend
   npx prettier --write .
   ```

3. **Run `tsc`** type check:
   ```bash
   cd frontend
   npx tsc --noEmit
   ```

### Pre-Push Hook

This project uses **lefthook** (`.github/lefthook.yml`). Install it:
```bash
npx lefthook install
```

The hook runs automatically on `git push` and blocks the push if any formatting/type checks fail.

### Agent Checklist Before Any Commit

- [ ] `uv ruff check --fix` passes (Python)
- [ ] `uv ruff format` passes (Python)
- [ ] `mypy` passes (Python)
- [ ] `eslint --fix` passes (Frontend)
- [ ] `prettier --write` passes (Frontend)
- [ ] `tsc --noEmit` passes (Frontend)
- [ ] No `.env` or secrets committed (see `.github/workflows/security-check.yml`)
- [ ] `graphify update .` run if code structure changed significantly
