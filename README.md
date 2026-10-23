# OVXS marketing

Content for Studio OVXS: LinkedIn, Facebook, Instagram, newsletter and blog. Claude does the research and writing. Ramit decides and posts. Nothing in this repo is deployed to the website.

## How it runs

| When (IST) | What | Ramit's part |
|---|---|---|
| Monday 10:00 | `/content weekly` picks 3 topics, researches them, writes 3 angles each | Pick an angle on the [Content Desk](https://claude.ai/artifact/Qzfxro2BcEUF9hM8oQw5wu) |
| Daily 18:30 | `/content daily` drafts decided pieces, redrafts ones sent back, and stages today's approved posts in Chrome | Review drafts, approve with a date and time, click Post in Chrome, tap "I've posted it" |
| Any time | `/content <topic>` or paste a batch from `.claude/skills/content/brief-template.md` | Same, live in chat |

Ideas can also go in the Desk's **New topic** tab. The next weekly run picks them up.

## Files

- `voice.md` — voice, offer, proof, channel rules. Every draft follows it.
- `pillars.md` — content pillars and audiences.
- `tracker.csv` — every piece and its status.
- `topics/<date>-<slug>/` — `brief.md` (research, angles, decisions), `copy.md`, `page.html` (designed preview), `export/` (PNGs and post text).
- `desk/index.html` — source of the Content Desk artifact.
- `brand/` — fonts and logos for previews.
- `scripts/stock.mjs` — searches Pexels and Unsplash and downloads photos with their credits. It needs a key in `.env`; copy `.env.example` to create it.
- `docs/OVXS-Content-Playbook.pdf` — the team guide (source in `docs/guide.html`).
- `.claude/skills/content/` — the `/content` skill.
- `imports/` — earlier work brought in from Claude Design.

Scheduled runs only happen while the Claude desktop app is open. A run that was missed starts the next time the app opens.
