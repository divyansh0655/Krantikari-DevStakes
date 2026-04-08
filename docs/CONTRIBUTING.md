# Contributing to MDOffline

We welcome improvements and feature branch pull requests aligning with the `PLAN.md` core layout constraints.

## Local Setup
1. `npm install` inside `/frontend` targeting standard Node environments (V20+ standard).
2. `npm run dev` to evaluate changes on `localhost`.

## Testing
Always commit and test components locally mapping explicitly against our `vitest` unit bounds:
```bash
npm run test
```

## Creating Pull Requests
- Format your PR titles clearly.
- We utilize an isolated matrix for GitHub Actions across pushes to `main`. Ensure your builds (`npm run build`) clear locally without error before submitting branches natively!
