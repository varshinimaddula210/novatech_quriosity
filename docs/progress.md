# Progress Log — Quriosity 2026

> A running record of decisions, approaches, and activity throughout the jam.
> Includes the *why* behind every choice, not just the what.

---

## Entry 01 — Pre-build setup
**Time:** ~10:30–13:00, 3 October 2026

### Choosing the topic
**Decision:** Basis Switching and Measurement Scrambling (Option 01)

**Why:** Out of the 6 options, basis switching ranked easiest to build around in 16 hours for two reasons:
1. The core mechanic writes itself — "asking the wrong question destroys the answer." That's a natural game loop without needing complex physics to implement.
2. The weirdness is immediately felt by a beginner. You don't need to understand the math to feel that something strange is happening.

Other options considered and why they were deprioritized:
- Deutsch-Jozsa: hard to gamify without it feeling like arbitrary logic
- Superdense Coding: the pre-shared entanglement setup adds explanation overhead
- Unitary Gates: strong second choice, but basis switching had a more instinctive mechanic

---

### Exploration strategy
**Decision:** Two-stage exploration before building

**Why:** The event explicitly rewards finding the moment something stops making sense and building around that confusion. A single-stage approach (everyone explores together) risks groupthink and misses the "fresh ears" perspective. Two stages solves this:

- **Stage 1** — A+B explore independently, note every wrong intuition and confusion point
- **Stage 2** — A+B explain to C+D (who know nothing yet), and C+D ask "but why?" aggressively. The gaps in the explanation are the real design targets.
- **Stage 3** — All 4 vote on the single confusion point with the most natural mechanic hiding inside it

This mirrors how good educational design works: you find where understanding breaks, then design around that exact break.

**Time budget:** 2.5 hours max for exploration, start building by hour 2.5. Rationale: building teaches you more than reading. The real deadline is having something playable by hour 6.

---

### Team structure
**Team size:** 4

| Role | People |
|------|--------|
| Explorers (Stage 1) | A + B |
| Fresh ears (Stage 2) | C + D |
| Scribe | One of A/B — maintains running confusion doc in real time |

---

### Tech stack
**Decision:** HTML / CSS / JS, hosted on GitHub Pages

**Why:**
- Submission requires a hosted link — web skips the export/packaging step entirely
- No install friction for judges — one click, runs in browser
- Whole team can contribute without needing the same environment
- LLMs produce the best output for web code
- GitHub Pages is free and auto-deploys on every push to main

Alternatives considered: Unity (slow iteration, painful WebGL export), Godot (decent but quirks), Pygame (desktop only).

---

### Files created
| File | Purpose |
|------|---------|
| `docs/approach.md` | Exploration strategy, team roles, build milestones, golden moments tracker, README raw material |
| `index.html` | Bare HTML boilerplate, links style.css and main.js |
| `style.css` | CSS reset, dark theme CSS variables, base layout |
| `main.js` | Minimal init/render scaffold with placeholder state object |

---

### README plan
**Decision:** README will cover more than the event minimum

Event requires: what the team learned in the first 3 hours + how it became the mechanic.

We will also include: how to play, how to run (just a link), team names, and which option was chosen — because the judging criteria specifically rewards a beginner being able to pick it up and understand it, and that requires clear instructions.

A README template will be stubbed out so it can be filled progressively during the jam rather than written from scratch at hour 15.

---

### GitHub Pages
**Status:** Not yet enabled (intentional — will do when ready to deploy)
**Steps when ready:** Repo → Settings → Pages → Source: main → / (root) → Save
**Live URL once enabled:** `https://varshinimaddula210.github.io/novatech_quriosity/`

---

## Entry 02 — *(next update pending)*
