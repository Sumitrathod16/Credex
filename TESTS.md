# TESTS.md — SpendLens Automated Tests

## How to Run

```bash
# Run all tests (one-shot, for CI)
npm run test

# Run in watch mode (during development)
npm run test:watch
```

All tests use **Vitest** with Node environment. No network calls, no database — pure unit tests.

---

## Test Files

### `tests/audit-engine.test.ts`

The primary test file. Covers all core audit engine logic.

| Test # | Test Name | What It Covers |
|--------|-----------|----------------|
| 1 | Cursor Business → Pro downgrade | Verifies that a solo developer on Cursor Business ($40/seat) gets a `downgrade` recommendation to Pro ($20/seat), with positive savings and a reasoning string containing dollar amounts |
| 2 | Claude Team with < 5 users | Claude Team requires min 5 seats. With 2 users, engine should flag inefficiency and recommend downgrade. Checks recommendation type and savings. |
| 3 | ChatGPT Team for 1 user | ChatGPT Team ($30) for a single user is wasteful vs Plus ($20). Verifies `downgrade` to "ChatGPT Plus" with exactly $10/mo savings. |
| 4 | Optimal case — GitHub Copilot Individual | The cheapest paid coding plan for 1 user. Should be `optimal` or `switch` (not `downgrade`). Verifies annual savings = 12x monthly. |
| 5 | High savings tier threshold | With 20 seats across Cursor Business + Claude Team + ChatGPT Team, total savings should exceed $500/mo → `savingsTier === "high"`. |
| 6 | Low savings tier threshold | A single GitHub Copilot Individual seat ($10/mo) should have < $100/mo savings → `savingsTier === "low"`. |
| 7 | Annual savings math consistency | `totalAnnualSavings === totalMonthlySavings * 12` for any multi-tool input. |
| 8 | `getSavingsTierMessage` returns distinct strings | All three tier messages are non-empty strings and distinct from each other. |

---

## Test Coverage Philosophy

Tests focus on the **audit engine** specifically because:
1. It contains business logic that must be correct — wrong savings figures damage trust
2. It's pure functions — no mocking needed
3. The assignment required ≥ 5 tests covering the audit engine specifically

UI component tests and API route tests are not included in MVP — the test surface that matters most is the savings calculation logic.

---

## CI Integration

Tests run automatically on every push to `main` via `.github/workflows/ci.yml`:

```yaml
- name: Run tests
  run: npm run test
```

The CI badge reflects the latest run status on the README.
