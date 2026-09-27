# NDIS VA Foundations — Claude Build Report (Brief Section 38)

**Build date:** 27 September 2026
**Content source:** NDIS_VA_Foundations_RC4 learner files (M1–M17; M9, M14, M15 and M16 at v1.1)
**Design source:** pva-smm-free-training-main.zip

This build has **not** been QA approved and is **not** release ready. Independent QA follows.

---

## Blockers and resolved items

### B1. M15 capstone inputs: RESOLVED by a correction to the build inputs (27 Sep 2026)

`M15_Learner_Synchronized_Rebuilt.xlsx` has been added as the **authoritative learner workbook for M15 capstone execution**. Its SHA-256 is `0770cdfd…c96644f2` and its Start_Here tab says "v2.3.7 learner bundle".

- It contains all six required M15 sheets: `M15_Capstone`, `M15_Capstone_Scenarios`, `M15_Capstone_Roster`, `M15_Capstone_Invoice_Batch`, `M15_Capstone_Invoice_Evidence` and `M15_Capstone_Audit_Records`.
- Its CAP-01 to CAP-10 descriptions match the RC4 M15 learner text (W07/P08, W10, P12, P04, P10, P02).
- As instructed, it was **not** reconciled against the Sandbox Pack v2.3.4 `M15_Capstone` sheet.

What changed in the build:

- The workbook ships unmodified as `downloads/M15_Learner_Synchronized_Rebuilt.xlsx`.
- The M15 module page and lessons 15.1–15.4 now show a **Capstone workbook** strip with a direct download, in place of the v2.3.4 strip.
- The practice-file page (`/wattlebird/`) has a new "Module 15 capstone workbook" section, listing the six sheets by each sheet's own title row.
- The home page's practice-file card has one added line about the M15 workbook.
- No M15 lesson text, scoring, weights, thresholds or Critical Failure wording changed.
- A diff against the previous build confirmed that only those 7 HTML files changed.

**Review items for independent QA (not changed, per "do not alter the M15 assessment"):**

- **M1. The "Exercise Note" column is directive.** Column F of `M15_Capstone_Scenarios` gives fairly direct handling guidance. Examples: CAP-03 "route the funding question to support coordination without answering it", CAP-09 "Urgent handoff first", and CAP-01 "do not choose the final cover". Please confirm this level of guidance is intended in learner-facing assessment inputs.
- **M2. Hidden roster columns.** In `M15_Capstone_Roster`, **columns H–J (Worker Site, Status, Notes) are hidden**. CAP-01 and CAP-02 ask learners to verify site. Hidden columns are easy for beginners to miss. Please confirm this is intended.
- **M3. The M15 workbook differs from Sandbox Pack v2.3.4 outside M15.** The sheets M15 relies on (`Participants`, `Staff`, `Price_Table`, `Follow_Up_Log`, `M10_Agreement`, `Inbox`, `Incident_Log`) are **identical** in both workbooks. These differ:
  - `M11_Service_Delivery` row 14: time window 10:00–13:00 vs 17:00–20:00, and the note text.
  - `M14_Incidents`: the reported vs event time wording for one row.
  - `M17_Trial_Pack`: an entirely different set of trial tasks (TR-01 to TR-03).
  - `Self_Audit_Guide`: two evidence rows.
  - `Certification_Rubric` title: "v2.2" in the M15 workbook vs "v2.3" in v2.3.4. The manifest says rubric v2.3, and the site's Certification page uses v2.3.4.
  - The M15 workbook also omits the `QA_Checklist`, `Asset_Change_Log` and `Source_Verification` sheets (see item 6).

  Modules 1–14, 16 and 17 still point to **Sandbox Pack v2.3.4**. The RC4 lesson text doesn't settle which M11, M14 and M17 values are intended. **Decision needed:** whether v2.3.7 should replace v2.3.4 as the single course practice file. If so, only the download links need to change.

### B2. The certification submission route URL is not set

The site has one route, **NDIS VA Foundations → Certification Submission** (`/certification-submission/`). It shows "route not open yet" because no submission URL was supplied.

That wording follows M15's own rule: "If the course page does not yet show a submission route, the course is not ready for certification submission."

The shared PVA Portfolio Submission system is not known to have NDIS VA Foundations set up as a course. **Decision needed:** confirm the submission URL. Then set `SUBMISSION_URL` in `tools/build.py` and rebuild, or edit the page directly.

---

## Content items flagged (not changed except as noted)

1. **Stray Module 11 block inside Module 2 (excluded).** `Module_2 … v1.0.md` contains a block headed "# Module 11 — Invoicing and Claims" between Lesson 2.4 and "Module Prove It — Communication Pack". It is 1,770 characters and covers M11 outcome, assets, routing rule and pricing note. M11 has its own fuller version of this content. The block was **left out of the M2 page** because it would show M11 material as part of M2. Please confirm, or ask for it to be restored.
2. **Authoring citation markers removed.** Hidden ChatGPT-style citation tokens (for example `citeturn0search0`) appear in the source: M6 ×11, M9 ×3, M10 ×4, M11 ×4, M12 ×2 and M13 ×4. They are not course content and were stripped when the pages were rendered. The sentences around them are unchanged.
3. **Dash normalization in M4.** Pandoc-style `---` and `--` were rendered as — and – (for example "Module 4 — …" and "9:00 am–12:00 pm"). No wording was changed.
4. **M2 evidence lists disagree.** The Lesson 2.4 Prove It lists six evidence items. "Module Prove It — Communication Pack" lists four. Both are rendered as written.
5. **Sandbox Pack version.** The standalone `Wattlebird_Sandbox_Pack_v2.3.4_Rubric_v2.3_Label_Fixed.xlsx` you uploaded differs from the RC4 copy in two cells of `QA_Checklist`: it says "v2.2" where RC4 says "v2.3". The **RC4 copy** was shipped because it matches the RC4 manifest checksum (`1ceb4a49…`). Please confirm.
6. **Answer-adjacent material in the learner Sandbox Pack (workbook not modified):**
   - `Source_Verification` states the Melbourne Cup and Gold Coast holiday conclusion, which relates to CAP-04 verification.
   - `Asset_Change_Log` describes SD-004/SD-001 duplicate handling and "answer leakage" fixes, and names `Operational_Key`.
   - `QA_Checklist` is internal QA content.
   - `M15_Capstone` says to "Use the Certification_Rubric plus the Capstone rubric in the answer-key workbook."
   Consider removing these sheets or rows from the learner copy before release.
7. **Naming.** The M15 and M16 text says "When delivered through PVA Academy…" and "The PVA Academy course certificate…". This site is branded PVA Free Training (per the SMM design source). Both phrasings are kept verbatim. Please confirm the intended wording.
8. **No course-overview source.** The package has no course description, intended-learner statement or course-level learning outcomes. The homepage uses only:
   - text quoted from the modules (the workflow and decision layer from M1, the progression from M17, notices from M1, M15 and M16);
   - one descriptive lede sentence and the SMM-style eyebrow ("Free · Self-Paced · No Account Needed").
   Please review the lede.
9. **Current-source links.** All 31 official NDIS, NDIS Commission, OAIC and state links are rendered as the source gives them. They open in a new tab. They **could not be checked live** from the build environment. The source content was last reviewed 25 September 2026.

---

## Files created

- `index.html`: course home
- `module-01/` … `module-17/`: 17 module pages
- 68 lesson pages at `module-NN/lesson-N-M/`
- `progress/`: Your progress & backup (Export / Restore / Clear)
- `wattlebird/`: practice-file page
- `downloads/Wattlebird_Sandbox_Pack_v2.3.4.xlsx` (Modules 1–14, 16, 17)
- `downloads/M15_Learner_Synchronized_Rebuilt.xlsx` (Module 15 capstone; added 27 Sep 2026)
- `certification-submission/`
- `shared/`: `styles.css`, `course-data.js`, `progress-ndis.js`, `ui.js`
- `tools/`: `build.py`, `pages.py`, `fidelity.py` (not loaded by pages)
- `README.md`, `BUILD_REPORT.md`

That is 89 HTML pages in total.

## Shared system (adapted from SMM)

- `shared/styles.css` is the **SMM stylesheet unchanged**, with an NDIS-only section appended at the end. The SMM source itself was not modified.
- Reused as-is:
  - colour tokens, Fraunces/Inter type and the kraft-paper surfaces;
  - route bar and page header;
  - cards, folder tabs and stamps;
  - buttons, progress rails, step chips and step panels;
  - `key-idea` and `callout`;
  - `ref-table`, `export-box` and `lesson-card`;
  - focus treatment (3px gold outline) and print rules.
- Added:
  - rendered-content typography;
  - fillable-table cells, with a stacked-card layout on phones;
  - task-list checkboxes;
  - model-answer disclosures;
  - "Check the current official source" frame;
  - practice-file strip and notes boxes;
  - module cards and progress-page rows;
  - skip link.
- The lesson interaction follows the SMM pattern: one step panel at a time, clickable step chips, Back/Continue, a Mark-done button, a Done panel with stamp, and "Generate my … notes" in the style of SMM's "Generate my …".
- No cartoon or avatar treatment, as in SMM.

## Course structure

All **17 modules and 68 lessons** (4 per module) were implemented. Each lesson has 9 step panels from the source: Progress Reminder, Why This Matters, Learn, See It, Try It, Check Yourself + Model Answer, Prove It, Work Boundary and Next Step. A Done panel follows.

Module pages render the source text that appears before the lessons, the lesson list, and the wrap-up material (Module Practice, Prove It, Quick Reference, Official sources, Certification sections).

A fidelity check compared every source line with the built pages. It matched everything except the excluded M2 block (item 1) and the per-module course-title lines, which the page headers replace.

## Interactive components

- **Fillable tables.** Every empty table cell in the source becomes a labeled text box, saved locally.
- **Checklists.** Source `- [ ]` items become saved checkboxes.
- **Response boxes** on Try It, Check Yourself and Prove It. On Check Yourself, the box sits above the model answer. On the two code-block templates, a "Copy this template into my notes" button fills the box.
- **Model answers.** The source `<details>` blocks become collapsible sections, closed by default.
- **Mark as done / Mark as not done.** Nothing is gated.
- **Lesson notes export.** A text version of everything typed in a lesson, with the fictional-artifact label, that can be copied, printed or downloaded.
- **Certification evidence checklist.** The 10 items quoted from M15, saved locally.
- **No auto-graded activities.** Nothing was added that the source doesn't contain. No answer logic is in the JavaScript.

## Progress (Section 37)

- **Storage:** one localStorage key, `pva-ndis-vaf-progress`, with its own namespace (`window.PVANDIS`). Isolation was tested: a pre-seeded SMM key (`pva-smm-ft-progress`) was left untouched and was not included in the export.
- **What is saved:** lesson completion, step position, response boxes, table cells and checklist ticks. Saving happens as you type (0.5 s debounce) and on blur, with a "Saved in this browser · time" status line.
- **Displays:**
  - Home: "X of 17 modules complete · Y of 68 lessons", a percentage, and a Start/Continue button for the next lesson.
  - Module pages: lessons done in that module.
  - Lesson headers and cards: Not started / In progress / Complete stamps.
  - Progress page: per-module breakdown.
- **Export Progress** (home page and `/progress/`): downloads `NDIS-VA-Foundations-progress-backup-YYYY-MM-DD.json` with `format` `pva-ndis-vaf-progress-backup`, `version` 1, a summary and the full NDIS state.
- **Restore is implemented.** It checks the format and version, rejects backups from other courses, and shows a summary before asking to replace. This was tested in a fresh browser: progress and a table entry came back.
- **Clear** asks for confirmation first.
- **Warnings** appear on the home page and `/progress/`: switching devices or browsers, clearing site data, private/incognito browsing, and the learner's responsibility to keep a backup. If storage is blocked, a banner appears on every page.
- No claim of cloud sync, accounts or cross-device recovery is made anywhere.

## Assessment integrity

- The M15 scoring (20 points; pass at 16/20 and no Critical Failure), published weights and Critical Failure definitions are rendered verbatim and were not modified.
- The certification rubric is taken directly from the Sandbox Pack's `Certification_Rubric` tab: 10 criteria, all Required, with the pass rule of 16/20 AND every Required criterion ≥1 and the remediation text.
- M16 requirements and the "Certification Submission Contract" are verbatim.
- There is one submission route, and the M15 and M16 wrap-ups link to it.
- The Answer Key, QA reports and internal materials were **not** used as build inputs and are not in the site. The only exception was a sheet-name listing of the Answer Key, used to diagnose B1. A leakage scan of all HTML, JS and CSS for key and staff terms and HTML comments found nothing. See item 6 for the workbook itself.

## QA (self-check)

| Check | Result |
|---|---|
| Broken internal links / missing assets | None (89 pages scanned) |
| Duplicate IDs; one `<h1>` per page | Pass |
| Console / JS errors | None. The only failed requests are Google Fonts, which the build sandbox blocks; the fonts load normally when deployed, as in SMM |
| Horizontal overflow at 375 / 768 / 1024 / 1440 px | None on all 89 pages, with every panel and model answer expanded |
| Mobile | Step chips wrap; fillable tables stack into labeled cards; reference tables scroll in their own labeled, focusable region |
| Accessibility | Semantic landmarks; skip link; breadcrumb `nav`; step chips are `<button>`s with `aria-current`; focus moves to the panel heading on step change; every form field is labeled; save and export status use `aria-live`; SMM focus outline kept. A full screen-reader pass was **not** done |
| Progress persistence, isolation, export, restore, bad-file rejection | Tested in headless Chromium: pass |
| Unresolved content questions | B2, M1–M3 and items 1–9 above (B1 resolved) |

## Blockers

- **B2.** The submission URL still needs to be supplied.
- **M3.** You need to decide whether the v2.3.7 learner bundle replaces v2.3.4 course-wide.
- **M1 and M2** are review items for independent QA.
- **B1** (missing M15 inputs) is resolved by the corrected build input.
