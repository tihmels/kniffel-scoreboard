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
    scoring/     Categories, the score-ENTRY model, and dice scoring
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

## This is a scorepad, not a game (the load-bearing constraint)

Players roll real dice on a real table and **announce** what they scored; the app
only writes it down. It never rolls, never asks what was rolled, never validates a
roll. The primary user is the **scorekeeper** recording someone else's announced
score, ~13 × N times a game (52 with four players). Every UI decision is measured
against that number.

Four invariants hold the design together. Breaking any of them silently undoes
the redesign, so change them only on an explicit request:

1. **No keyboard except player names.** Every score comes from a small
   enumerable set, so entry is 1–2 taps from fixed choices. `domain/scoring/entry.ts`
   models this: `inputKind` returns `count` (upper section, 0–5 dice),
   `fixed` (25/30/40/50), or `sum` (5–30). Never add a numeric text field.
2. **Turn order is a hint, not a rule.** `activePlayerIndex` only predicts who is
   next. `recordScore` accepts any player and moves the hint on. A skipped turn
   must never lock the pad.
3. **Correction is a normal path, not an error path.** Every filled cell is
   re-tappable, `recordScore` overwrites, and `undo` restores the previous value
   from `state.lastEntry`. Do not reinstate an "already scored" guard.
4. **Scratched ≠ open.** A recorded `0` is a deliberate scratch and renders as the
   paper slash (`ScratchMark`); an absent category renders blank. Scratching costs
   exactly one tap, same as scoring.

## Kniffel scoring — do not guess rule variants

The project uses **standard German Kniffel**, recorded in the RULE DECISIONS
comment block at the bottom of `src/domain/scoring/scoring.ts`. That block is the
source of truth — read it before touching scoring.

Two modules, different jobs. `entry.ts` models what a human can legally record
(`allowedScores` / `isValidScore` — narrow by design: it rejects impossible values
but never checks one category against another, because players are trusted about
what they rolled). `scoring.ts` holds the dice → points rules; all 13 scorers are
implemented and tested, but **the UI no longer uses them** since dice are never
entered. It is kept because it documents the rules and costs nothing; do not
delete it, and do not wire it back into the UI without a reason.

The +35 upper bonus at ≥ 63 is an aggregation rule in `domain/game/gameState.ts`,
along with `bonusState` / `maxAchievableUpper` / `countSecuringBonus` — the bonus
is the most valuable thing on screen, so keep it derived, never stored.

**Still deferred:** the Kniffel bonus / Joker rule (+50 per additional Kniffel,
and using a surplus Kniffel as a wildcard). It needs per-turn history, which the
current state shape does not carry. Do not implement it — or any other rule
variant — without an explicit rule decision from the user first.

## UI copy

Category names are **German** (`features/game/labels.ts`) because they are the
words players say out loud — matching the announced word to the row label is the
scorekeeper's whole task. Domain keys stay English. There is no i18n layer; do not
add one without being asked.

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
