# Kniffel Scoreboard

A web-based **scoreboard and game-management app** for the dice game
[Kniffel](https://en.wikipedia.org/wiki/Yahtzee) (the German Yahtzee variant).
It tracks players, turns, and scores — it is **not** a digital dice roller.

This is a learning project with two goals:

1. Practice **modern React** (Vite, TypeScript, testing).
2. Practice **serverless AWS** deployment with **AWS Amplify Gen 2**.

## Prerequisites

- **Node.js LTS** (>= 20.19; see `.nvmrc` — run `nvm use`)
- **npm** (bundled with Node)
- An **AWS account** _only_ for the later cloud milestones. Ordinary frontend
  development needs no AWS account or credentials.

## Installation

```bash
npm install
```

## Local development

```bash
npm run dev
```

Then open the printed URL (default <http://localhost:5173>). No AWS resources or
credentials are required to run the app locally.

## Available scripts

| Script                    | Purpose                                             |
| ------------------------- | --------------------------------------------------- |
| `npm run dev`             | Start the Vite dev server with HMR                  |
| `npm run build`           | Type-check (project refs) and build for production  |
| `npm run preview`         | Serve the production build locally                  |
| `npm run typecheck`       | Type-check without emitting (`tsc -b`)              |
| `npm run lint`            | Lint with Oxlint (the scaffolded linter)            |
| `npm run lint:fix`        | Lint and auto-fix                                   |
| `npm run format`          | Format all files with Prettier                      |
| `npm run format:check`    | Check formatting without writing                    |
| `npm test`                | Run the test suite once (Vitest)                    |
| `npm run test:watch`      | Run tests in watch mode                             |
| `npm run amplify:sandbox` | Deploy a personal Amplify cloud sandbox (needs AWS) |

> **Type-checking vs. linting.** Oxlint handles linting; the TypeScript compiler
> (`npm run typecheck`) handles type-checking. Oxlint's type-aware mode is
> deliberately **not** enabled, since it is not guaranteed compatible with the
> scaffolded TypeScript version.

## Project structure

```text
amplify/            AWS Amplify Gen 2 backend (auth + data), not yet deployed
  auth/             Cognito user pool
  data/             AppSync + DynamoDB schema (owner-scoped Game model)
  backend.ts        Backend composition
e2e/                Reserved for browser end-to-end tests (later milestone)
public/             Static assets served as-is
src/
  components/       Reusable, presentation-focused UI (AppShell, ...)
  features/
    game/           Game-facing feature UI (Scoreboard, ...)
  domain/
    scoring/        Pure Kniffel scoring logic — no React, no AWS
  services/
    amplify/        AWS/Amplify integration boundary (inert until deployed)
  test/             Test setup (jsdom + jest-dom matchers)
```

**Architectural boundary:** `domain/` is pure TypeScript with no knowledge of
React or AWS. UI consumes the domain; the `services/amplify` layer is the only
place that talks to the cloud. This keeps the scoring rules testable in
isolation and swappable independently of the backend.

## Planned AWS architecture

Following the AWS Amplify Gen 2 stack (a static React frontend on a CDN plus a
serverless backend):

- **AWS Amplify Hosting** — builds and serves the static React app on a CDN.
- **Amazon Cognito** — user sign-up / sign-in (email).
- **AWS AppSync** — GraphQL API, auto-generated from the data schema.
- **Amazon DynamoDB** — persists games/scores, one owner-scoped table per model.

```text
Browser (React SPA)
   |  HTTPS
   v
Amplify Hosting (CDN)  --auth-->  Cognito
   |
   |  GraphQL (authorized)
   v
AppSync  -->  DynamoDB
```

### AWS actions required later (not done yet)

None of these are needed for local frontend work:

- Create/authorize an AWS account and configure credentials (`aws configure` or
  Amplify's credential setup).
- `npm run amplify:sandbox` — provisions a **personal cloud sandbox** (Cognito,
  AppSync, DynamoDB) and generates `amplify_outputs.json`.
- Activate `src/services/amplify/client.ts` (see its comments) to connect the
  app to the sandbox.
- For production: connect the repo to **Amplify Hosting** for CI/CD deploys.

Generated files (`amplify_outputs.json`, `.amplify/`) and any `.env` files are
git-ignored — they contain environment-specific config and must not be committed.

## Which tutorial this follows

This project broadly follows the AWS hands-on tutorial
**“Build a web application using S3, Lambda, API Gateway, and DynamoDB.”** The
tutorial's current content uses the modern stack — **Vite, React, AWS Amplify
Gen 2, Cognito, AppSync, Lambda, and DynamoDB** — even though its URL still
mentions S3 and API Gateway:

<https://docs.aws.amazon.com/hands-on/latest/build-web-app-s3-lambda-api-gateway-dynamodb/build-web-app-s3-lambda-api-gateway-dynamodb.html>

## Roadmap

| # | Milestone                          | Status  |
| - | ---------------------------------- | ------- |
| 0 | Project foundation & app shell     | ✅ done |
| 1 | Local scoreboard (players, turns)  | ⬜ next |
| 2 | Tested Kniffel scoring rules       | ⬜      |
| 3 | Local game persistence             | ⬜      |
| 4 | User authentication (Cognito)      | ⬜      |
| 5 | Cloud persistence & sync (AppSync) | ⬜      |
| 6 | Production deployment (Hosting)    | ⬜      |

## Open rule decisions

Some Kniffel scoring rules vary between house/variant rules. To avoid guessing,
the following are documented but **not yet implemented** (see the comment block
in `src/domain/scoring/scoring.ts`):

- Full house — fixed 25 points vs. sum-of-dice; whether a five-of-a-kind counts.
- Small / large straight — fixed 30 / 40 points vs. sum-based variants.
- Kniffel (five of a kind) — fixed 50 points.
- Kniffel bonus / Joker rule and the upper-section +35 bonus at ≥ 63 (these are
  game-aggregation rules, deferred to a future game-scoring module).
