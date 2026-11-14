# ovxs-marketing

Studio OVXS marketing content. Ramit decides and posts; Claude researches, drafts and keeps things tidy. Nothing here goes on the website.

## Keep the playbook in sync

The team playbook lives in git: `docs/guide.html` (source) and `docs/OVXS-Content-Playbook.pdf` (built from it). It must always describe the system as it is today.

Whenever a change touches how the system works, update the playbook in the same commit:
- the Content Desk (`desk/index.html`): tabs, cards, buttons, wording
- the `/content` skill (`.claude/skills/content/`): stages, statuses, rules
- the scheduled tasks (names, times, what they do)
- `voice.md` rules, pillars, tracker columns, photo setup, scripts

Then:
1. Run `./scripts/build-playbook.sh` and check it reports no new near-empty pages (each section starts a new page; split or merge sections if one spills).
2. Republish the playbook page so the shared link stays current: Artifact publish `docs/guide.html` to https://claude.ai/artifact/2vgZgg9gkBvvpiutTr6i91 with `files` `{"OVXS-Content-Playbook.pdf": "docs/OVXS-Content-Playbook.pdf"}`.
3. Bump the version on the cover and in the footer for anything bigger than wording.

Content-only runs (new briefs, drafts, posts) don't need a playbook update.

## Links

- Content Desk: https://claude.ai/artifact/Qzfxro2BcEUF9hM8oQw5wu
- Playbook: https://claude.ai/artifact/2vgZgg9gkBvvpiutTr6i91

## Rules

- Never print or commit API keys. `.env` stays out of git.
- Never commit `.DS_Store` or `settings.local.json`.
- Don't push; Ramit pushes.
