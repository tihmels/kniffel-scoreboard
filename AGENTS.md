# AGENTS.md

Guidance for AI coding agents working in this repository. Humans should read
[`README.md`](./README.md) first — this file is the agent-facing complement.

## What this is

A learning project: a **scoreboard and game-management** web app for the dice
game Kniffel (German Yahtzee). It tracks players, turns, and scores — it is
**not** a dice roller / game engine. Two learning goals: modern React and
serverless AWS via Amplify Gen 2.

## Tech stack

Vite + React 19 + TypeScript (strict) · Vitest + React Testing Library ·
**Oxlint** (linter) + Prettier (formatter) · AWS Amplify Gen 2 (Cognito,
AppSync, DynamoDB). npm only. Node LTS (`.nvmrc`, `engines >= 20.19`).

Do **not** introduce: Next.js, Redux, a component library, containers, a
monorepo, an extra backend framework, or a second package manager.

## Commands

```bash
npm run dev          # dev server (HMR)
npm run typecheck    # tsc -b — TYPE errors live here, not in the linter
npm run lint         # oxlint
npm run format       # prettier --write .
npm test             # vitest run
npm run build        # tsc -b && vite build
```

Before claiming work is done, run **typecheck + lint + test + build** and paste
real output. Do not assert success without it.

## Architecture & boundaries (important)

```
src/
  components/    Reusable presentational UI (CSS Modules)
  features/game/ Game-facing feature UI
  domain/        PURE TypeScript rules — no React, no AWS imports
    scoring/
  services/      The ONLY layer allowed to touch AWS/Amplify
    amplify/
amplify/         Amplify Gen 2 backend (auth + data)
```

- Keep `domain/` free of React and AWS. UI depends on the domain, never the
  reverse. All cloud access goes through `services/amplify`.
- `services/amplify/client.ts` is intentionally **inert**: local development
  must not require AWS credentials or a deployed backend. Do not wire it up
  until an Amplify sandbox exists.

## Kniffel scoring — do not guess rule variants

Only the unambiguous categories are implemented (upper section,
three/four-of-a-kind, chance). `scoringFunctions` is a `Partial<Record<...>>`;
variant-dependent categories (full house, straights, Kniffel, the Kniffel/Joker
bonus, the ≥63 upper bonus) are **deliberately unimplemented** and documented in
`src/domain/scoring/scoring.ts` and the README. When implementing them, get an
explicit rule decision first; a test asserts they stay absent until then.

## Conventions

- TypeScript strict mode is on (incl. `noUncheckedIndexedAccess`). Don't weaken
  `tsconfig` to make code compile — fix the code.
- Prettier owns formatting (no semicolons, single quotes, trailing commas).
  Run `npm run format`; don't hand-format.
- Colocate tests next to source as `*.test.ts(x)`. Reserve `e2e/` for later
  browser tests.
- Comments explain *why*, not *what*. Match the surrounding style.

## AWS / safety boundaries

- Do **not** deploy, create remote AWS resources, or run `ampx sandbox`
  autonomously — those cost money and need the user's AWS account.
- Never commit `amplify_outputs.json`, `.amplify/`, `.env*`, or secrets (all
  git-ignored). Never commit generated Amplify output.

## Git

- Do not commit or push unless the user explicitly asks.
- Feature branches + PRs; do not push directly to `main`/`master`, don't merge
  PRs, don't delete branches, don't force-push (use `--force-with-lease`).
- No AI-authorship trailers or attribution in commits, code, or docs.
