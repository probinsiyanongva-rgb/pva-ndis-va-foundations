# NDIS VA Foundations — PVA Free Training

This is a static HTML/CSS/vanilla JS build of the approved **NDIS VA Foundations RC4** learner course. It uses the PVA Free Training design system from the SMM pathway.

## Deploy

Push this folder to a GitHub repo and deploy it on Cloudflare Pages, which is how the SMM pathway is hosted.

- No build step is needed. The output directory is the repo root.
- `index.html` sits at the root, and every page uses relative paths. The site therefore also works from a subfolder.

## Structure

```
index.html                     Course home: progress, module map, notices
module-01/ … module-17/        Module overview (intro, lesson list, wrap-up)
  lesson-N-M/index.html        Lesson pages (9 step panels + Done)
progress/                      Your progress & backup (Export / Restore / Clear)
wattlebird/                    Practice file page + download
certification-submission/      M15 + M16 evidence set, rubric, submission route
downloads/                     Wattlebird_Sandbox_Pack_v2.3.4.xlsx (RC4 copy, M1–14/16/17)
                               M15_Learner_Synchronized_Rebuilt.xlsx (M15 capstone)
shared/styles.css              SMM design system + NDIS additions (bottom section)
shared/course-data.js          Generated course structure (titles + paths only)
shared/progress-ndis.js        window.PVANDIS — progress, drafts, export/restore
shared/ui.js                   Step panels, drafts, displays, export UI
tools/                         Build + fidelity scripts (not used at runtime)
```

## Progress storage

- A single localStorage key holds all progress: **`pva-ndis-vaf-progress`**. It never reads or writes any other course's key.
- Export downloads JSON with `format: "pva-ndis-vaf-progress-backup"`, `version: 1`.
- Restore accepts only that format, shows a summary and asks for confirmation before replacing anything.

## Opening the certification submission route

The Certification Submission page shows "route not open yet" until a URL is set. You can open it in either of two ways:

- Set `SUBMISSION_URL` in `tools/build.py` and rebuild.
- Edit `certification-submission/index.html` directly: replace the `route-closed` block with a link button.

## Rebuilding from the course files

```
python3 tools/build.py <path-to>/NDIS_VA_Foundations_RC4 <output-folder>
python3 tools/fidelity.py <path-to>/NDIS_VA_Foundations_RC4 <output-folder>
```

The build needs `markdown` and `openpyxl`. `fidelity.py` checks that every source line appears in the built pages.
