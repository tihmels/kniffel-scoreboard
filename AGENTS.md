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

The one standing exception is `@aws-amplify/ui-react`, used solely for the
Cognito `Authenticator` (the component the AWS tutorial uses). It is
auth-scoped and code-split — it is not a licence to build the rest of the UI
from it. All other UI stays plain CSS Modules.

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
  features/
    game/        Game-facing feature UI
    auth/        Cognito auth gate (active only when a backend exists)
  domain/        PURE TypeScript rules — no React, no AWS imports
    scoring/     Per-category scoring functions
    game/        Game state + reducer + score selectors (incl. upper bonus)
  services/      The ONLY layer allowed to touch AWS/Amplify
    amplify/     Amplify integration boundary
    storage/     localStorage persistence for the local game
  test/          Vitest setup (jsdom + jest-dom)
amplify/         Amplify Gen 2 backend (auth + data)
```

- Keep `domain/` free of React and AWS. UI depends on the domain, never the
  reverse. All cloud access goes through `services/amplify`.
- **Local mode must stay credential-free.** `services/amplify/client.ts` loads
  the git-ignored `amplify_outputs.json` optionally via `import.meta.glob` and
  exports only `amplifyOutputs` / `hasAmplifyBackend`. It deliberately does not
  import `aws-amplify`, so the local-mode bundle ships without the SDK;
  `Amplify.configure` happens in the lazily-loaded
  `features/auth/AuthenticatedApp.tsx` chunk. Preserve that split — never import
  `aws-amplify` from a module reachable from the local-mode entry path.
- There is no generated AppSync data client yet. Cloud reads/writes belong in
  `services/amplify`, behind `hasAmplifyBackend`, so the app keeps working with
  no backend.

## Kniffel scoring — do not guess rule variants

The project uses **standard German Kniffel**, recorded in the RULE DECISIONS
comment block at the bottom of `src/domain/scoring/scoring.ts`. That block is the
source of truth — read it before touching scoring.

All 13 per-category scorers are implemented and tested: `scoringFunctions` is a
complete `Record<ScoreCategory, ScoringFunction>` (full house 25, small/large
straight 30/40, Kniffel 50). The +35 upper-section bonus at ≥ 63 is an
aggregation rule and lives in `src/domain/game/gameState.ts`, not in `scoring/`.

**Still deferred:** the Kniffel bonus / Joker rule (+50 per additional Kniffel,
and using a surplus Kniffel as a wildcard). It needs per-turn history, which the
current state shape does not carry. Do not implement it — or any other rule
variant — without an explicit rule decision from the user first.

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
