# One-time install steps

Most of the project's Claude Code setup is committed in this repo and works
the moment you clone. A handful of things you need to run **once per machine**:

## 1. Superpowers + skill-creator — cherry-picked manual install (DONE)

The full superpowers plugin isn't installable via the VSCode extension
(`/plugin` is CLI-only). Instead, the 5 high-value skills from
[obra/superpowers](https://github.com/obra/superpowers) NOT already in
your global skill library have been copied into `~/.claude/skills/`:

| Skill | Why |
|---|---|
| `dispatching-parallel-agents` | Run 2+ independent tasks in parallel via separate subagent contexts |
| `requesting-code-review` | Dispatch a code reviewer with crafted context, keep main session clean |
| `receiving-code-review` | Evaluate review feedback with technical rigor, not blind agreement |
| `subagent-driven-development` | Execute plans by dispatching fresh subagent per task + two-stage review |
| `writing-skills` | TDD applied to skill authoring — author new skills with red-green-refactor |

Plus the official Anthropic meta-skill:

| Skill | Why |
|---|---|
| `skill-creator` | Canonical Anthropic reference for creating, evaluating, and benchmarking skills (485-line SKILL.md + agents/, references/, scripts/) |

**What we DID NOT copy** (already present in your `~/.claude/skills/`):
`brainstorming`, `executing-plans`, `finishing-a-development-branch`,
`systematic-debugging`, `test-driven-development`, `using-git-worktrees`,
`using-superpowers`, `verification-before-completion`, `writing-plans`,
`webapp-testing`, `mcp-builder`, `claude-api`, `brand-guidelines`,
`frontend-design`, `theme-factory`, `docx`, `pdf`, `pptx`, `xlsx`.

Per Karpathy "Surgical Changes": your existing versions are slightly
older but functional. We did NOT overwrite them — replacing established
patterns risks breaking your muscle memory.

## 1b. SEO toolkit — cherry-picked from AgriciDaniel/claude-seo

Modern SEO/AEO/GEO toolkit from [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo)
(v1.9.9). Full repo ships 25 sub-skills + 18 sub-agents with optional
DataForSEO/Ahrefs/Google API extensions. We picked the 10 skills + 6 agents
that fit a small marketing site and don't require paid APIs.

**Installed skills** (`~/.claude/skills/`):

| Skill | Role |
|---|---|
| `seo` | Main entry — comprehensive site audit orchestrator |
| `seo-page` | Single-page deep audit (use for /about, /work/[slug]) |
| `seo-content` | E-E-A-T quality + AI citation readiness |
| `seo-geo` | GEO — get cited by AI Overviews, ChatGPT, Perplexity |
| `seo-schema` | JSON-LD validator + generator with templates.json |
| `seo-competitor-pages` | "X vs Y" comparison pages, alternatives pages |
| `seo-content-brief` | Per-section content briefs for new pages |
| `seo-plan` | Strategic SEO planning for a new or existing site |
| `seo-technical` | 9-category technical audit (crawlability, CWV, schema, etc.) |
| `seo-sxo` | Search Experience Optimization (SERP-driven) |

**Installed agents** (`~/.claude/agents/`):

| Agent | Role |
|---|---|
| `seo-content` | Content quality reviewer (E-E-A-T) |
| `seo-technical` | Technical SEO specialist |
| `seo-geo` | GEO specialist for AI Overviews/ChatGPT/Perplexity |
| `seo-schema` | Schema.org JSON-LD validator/generator |
| `seo-performance` | Core Web Vitals analyzer |
| `seo-visual` | Screenshot + mobile rendering via Playwright |

**Skipped** (need paid APIs or wrong use case):
`seo-audit` (orchestrator for 500-page crawls), `seo-backlinks` (Ahrefs API),
`seo-dataforseo` (DataForSEO API), `seo-drift` (historical baseline needed),
`seo-google` (Google Search Console OAuth), `seo-flow`, `seo-image-gen`,
`seo-images`, `seo-cluster`, `seo-ecommerce`, `seo-hreflang`, `seo-local`,
`seo-maps`, `seo-programmatic`, `seo-sitemap`.

**Python deps:** the 10 skills we installed do NOT require Python.
Subagents `seo-performance` and `seo-visual` use Playwright (already in
project devDependencies). No additional install needed.

## 2. Optional: Graphify (only if codebase grows past ~500 files)

[Graphify](https://github.com/lucasrosati/claude-code-memory-setup) converts
the codebase to a queryable AST graph so Claude doesn't re-read files every
session. Claims 70× token savings on 500+ file codebases.

This project has ~40 source files — savings would be marginal. **Skip for now.**
Revisit if/when the codebase grows.

If you do install:

```bash
pip install graphifyy
graphify install         # creates ~/.claude/skills/graphify/SKILL.md
cd ~/projects/TGLOBAL/Tglobal-revamp
graphify build           # generates graph.json from the codebase
```

## 3. Optional: react-scan (already wired)

[react-scan](https://github.com/aidenybai/react-scan) is already installed as
a devDependency and auto-loads in `npm run dev` via a `<Script>` tag in
`src/app/layout.tsx`. It's stripped from production builds via
`process.env.NODE_ENV === "development"`.

To see it in action: `npm run dev` → open localhost:3000 → click around the
visible outlines that appear on re-rendering components. Outlines for
necessary renders are fine; outlines on stable text or images mean
unnecessary re-renders.

To disable temporarily, comment out the `<Script id="react-scan" />` block
in `src/app/layout.tsx`.

## 4. Optional: ccstatusline (per-machine, not per-project)

[ccstatusline](https://github.com/sirmalloc/ccstatusline) adds a live status
bar showing current branch, model, token usage, cost. Not project-specific —
install once globally:

```bash
npm install -g ccstatusline
ccstatusline init        # writes config to ~/.claude/settings.json
```

You'll want this if you switch branches a lot (you do — `staging` vs `main`
matters for the merge freeze).

## 5. Available npm scripts

After `npm install` (which pulls @next/bundle-analyzer, react-scan, and
@axe-core/playwright):

| Command | What it does |
|---|---|
| `npm run dev` | Next dev with react-scan overlay |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` (same check the post-edit hook runs) |
| `npm run preflight` | typecheck + lint, run before claiming work done |
| `npm run sweep -- /about` | Playwright responsive sweep + axe-core on a route |
| `npm run analyze` | `ANALYZE=true next build` — opens the bundle treemap |

## 6. Available slash commands (in Claude Code)

| Command | What it does |
|---|---|
| `/preflight` | Runs `npm run preflight`, reports result |
| `/sweep /about` | Runs the responsive sweep on a route |
| `/review` | Delegates to code-reviewer + nextjs-reviewer subagents on the current diff |

## 7. Hooks (auto-active, no setup needed)

The hooks in `.claude/hooks/` activate automatically when Claude Code reads
`.claude/settings.json`. After cloning, run `/hooks` inside Claude Code to
confirm they're registered.

If they don't appear: ensure `.claude/settings.json` is present and run
`/exit` then re-launch Claude Code on the project directory.
