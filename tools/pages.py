"""Site-level pages for NDIS VA Foundations: home, progress & backup,
Wattlebird practice file, and Certification Submission.

Learner-facing wording on these pages is either quoted from the RC4 learner
files / learner Sandbox Pack, or is interface text (navigation, storage
behaviour). No course content is invented here."""
import html

esc = lambda s: html.escape(str(s), quote=True)

STORAGE_WARNINGS = """<ul class="warning-list">
  <li><strong>Switching devices or browsers may not carry your progress over.</strong> Progress is saved on this device, in this browser only.</li>
  <li><strong>Clearing browser/site data may remove saved progress.</strong></li>
  <li><strong>Private/incognito browsing may prevent your progress from being saved at all.</strong></li>
  <li><strong>You are responsible for keeping a backup of important progress.</strong> Use <em>Export Progress</em> regularly and keep your finished work in your own files.</li>
</ul>
<p class="storage-note">There is no learner account and no cloud synchronization. Nobody can recover your progress for you — a backup file you exported is the only way to bring it back.</p>"""


def export_block(msg_id, root):
    return """<div class="btn-row" style="margin-top:10px;">
  <button type="button" class="btn btn-primary" data-export-progress data-message="%(id)s">Export Progress (download backup)</button>
  <a class="btn btn-secondary" href="%(root)sprogress/">Restore or manage progress</a>
</div>
<div class="feedback-box" id="%(id)s" role="status" aria-live="polite" hidden></div>""" % {"id": msg_id, "root": root}


def build_all(OUT, mods, data, wb, B):
    build_home(OUT, mods, B)
    build_progress(OUT, B)
    build_wattlebird(OUT, wb, B)
    build_cert(OUT, wb, B)


# ---------------------------------------------------------------------------
def build_home(OUT, mods, B):
    root = "./"
    cards = []
    for m in mods:
        tag = ""
        if m["num"] == 15:
            tag = ' · <strong>Capstone assessment</strong>'
        elif m["num"] == 16:
            tag = ' · <strong>Portfolio &amp; certification evidence</strong>'
        cards.append("""<a class="lesson-card module-card" href="%(path)s/">
  <div class="lesson-num">%(n)d</div>
  <div class="lesson-info">
    <h3>Module %(n)d — %(t)s</h3>
    <p class="module-lessons">%(k)d lessons%(tag)s · <span data-module-count="%(n)d"></span></p>
    <div class="progress-rail mini-rail" aria-hidden="true"><span data-module-bar="%(n)d" style="width:0%%;"></span></div>
  </div>
  <div class="lesson-status" data-module-status="%(n)d"></div>
</a>""" % {"path": B.mod_dir(m["num"]), "n": m["num"], "t": esc(m["title"]), "k": len(m["lessons"]), "tag": tag})

    main = """
<section class="folder-tab" data-tab="Your progress" data-state="current" aria-labelledby="progress-h" style="margin-top:30px;">
  <h2 id="progress-h" style="font-size:1.1rem;">Course progress</h2>
  <div class="progress-rail"><span data-course-progress-bar style="width:0%%;"></span></div>
  <div class="progress-meta"><span data-course-progress-text>Loading…</span><span data-course-progress-percent></span></div>
  <div class="btn-row"><a class="btn btn-primary" data-next-action href="%(first)s">Start: Lesson 1.1 →</a></div>
  <h3 style="font-size:1rem;margin-top:22px;">Where your progress is saved</h3>
  <p style="font-size:0.9rem;margin-bottom:6px;">No account, no login. Your lesson completion and saved responses stay on this device, in this browser.</p>
  %(warn)s
  %(export)s
</section>

<section class="card" style="margin-top:28px;" aria-labelledby="how-h">
  <h2 id="how-h">How this course works</h2>
  <p>You are building toward a practical VA workflow:</p>
  <div class="key-idea"><strong>DO → CHECK → CLASSIFY → ACT / HAND OFF → FOLLOW UP → CLOSE THE LOOP</strong></div>
  <p>For decisions in the sandbox, use:</p>
  <ul>
    <li><strong>OK</strong> — proceed or complete because the required checks are satisfied.</li>
    <li><strong>FLAG</strong> — an exception needs attention or verification through the normal owner/workflow.</li>
    <li><strong>ASK</strong> — factual clarification is needed.</li>
    <li><strong>ESCALATE</strong> — authority, urgent action, or an issue involving safety, privacy, or compliance is beyond your role.</li>
  </ul>
  <p>The course progression is:</p>
  <div class="key-idea"><strong>LEARN → PRACTICE → PROVE → PRESENT → PREPARE</strong></div>
  <p style="font-size:0.9rem;color:var(--ink-soft);">Each lesson moves through the same steps — Progress Reminder, Why This Matters, Learn, See It, Try It, Check Yourself (with a model answer), Prove It, Work Boundary and Next Step. Mark each lesson as done when you finish it.</p>
</section>

<section class="card" aria-labelledby="notice-h">
  <h2 id="notice-h">Important training notices</h2>
  <div class="md">
    <blockquote class="callout-fictional"><p><strong>Important:</strong> Wattlebird Support Services, its participants, staff, records, prices, schedules, and scenarios are fictional training data. They are not real NDIS records.</p></blockquote>
    <div class="current-source-note"><span class="cs-tag">Check the current official source</span><p><strong>Current-information note:</strong> NDIS information can change. Use the current official source for changeable information.</p></div>
    <p>The PVA Academy course certificate is a training credential from the academy. It is <strong>not an NDIS provider certification or government accreditation</strong>.</p>
    <p>For Wattlebird work, the accurate description is <strong>fictional training practice</strong>.</p>
  </div>
</section>

<section style="margin-top:36px;" aria-labelledby="modules-h">
  <h2 id="modules-h">Modules</h2>
  <div class="module-grid">
%(cards)s
  </div>
</section>

<section class="folder-tab" data-tab="Practice file" style="margin-top:36px;" aria-labelledby="wb-h">
  <h2 id="wb-h" style="font-size:1.1rem;">Wattlebird Sandbox Pack</h2>
  <p>Most lessons ask you to open a tab in the Wattlebird Sandbox Pack — a fictional provider workbook used for practice across the course.</p>
  <p style="font-size:0.9rem;">Module 15 (capstone) uses its own <strong>M15 Learner Workbook</strong>, available on the same page.</p>
  <div class="btn-row" style="margin-top:0;"><a class="btn btn-secondary" href="wattlebird/">Open the Wattlebird practice file →</a></div>
</section>

<section class="folder-tab" data-tab="Certification" style="margin-top:36px;" aria-labelledby="cert-h">
  <h2 id="cert-h" style="font-size:1.1rem;">Certification Submission</h2>
  <p><strong>M15 supplies the integrated operational assessment evidence; M16 supplies the portfolio and presentation evidence.</strong> Submit the complete set together through the certification route.</p>
  <div class="btn-row" style="margin-top:0;"><a class="btn btn-secondary" href="certification-submission/">NDIS VA Foundations → Certification Submission</a></div>
</section>

<section style="margin-top:36px;" aria-labelledby="more-h">
  <h2 id="more-h">More PVA Free Training</h2>
  <div class="lesson-grid">
    <a class="lesson-card" href="https://pva-free-training.netlify.app/"><div class="lesson-num">GA</div><div class="lesson-info"><h3>General Administrative VA</h3><p>Beginner foundations for admin support work</p></div></a>
    <a class="lesson-card" href="https://pva-free-training.netlify.app/customer-support/"><div class="lesson-num">CS</div><div class="lesson-info"><h3>Customer Support VA</h3><p>Beginner foundations for support queue work</p></div></a>
    <a class="lesson-card" href="https://pva-smm-free-training.pages.dev/"><div class="lesson-num">SM</div><div class="lesson-info"><h3>Social Media Management VA</h3><p>Beginner foundations for SMM work</p></div></a>
  </div>
</section>
""" % {"first": B.mod_dir(1) + "/" + B.lesson_dir(1, 1) + "/", "warn": STORAGE_WARNINGS,
       "export": export_block("homeExportMsg", root), "cards": "\n".join(cards)}

    hdr = B.header("Free · Self-Paced · No Account Needed", "NDIS Virtual Assistant Foundations",
                   "Seventeen modules of administrative support practice for virtual assistants working with NDIS providers — worked inside Wattlebird Support Services, a fictional provider sandbox.")
    html_out = B.page(root, "NDIS VA Foundations | PVA Free Training",
                      "Free, self-paced NDIS VA Foundations training from Probinsiyanong VA — 17 modules practised in the fictional Wattlebird Support Services sandbox.",
                      [], hdr, main, scope="home")
    # Home page: the home crumb is the current page.
    (OUT / "index.html").write_text(html_out, encoding="utf-8")


# ---------------------------------------------------------------------------
def build_progress(OUT, B):
    root = "../"
    main = """
<section class="folder-tab" data-tab="Overview" data-state="current" style="margin-top:30px;" aria-labelledby="ov-h">
  <h2 id="ov-h" style="font-size:1.1rem;">Course progress</h2>
  <div class="progress-rail"><span data-course-progress-bar style="width:0%%;"></span></div>
  <div class="progress-meta"><span data-course-progress-text>Loading…</span><span data-course-progress-percent></span></div>
  <div id="progressDetail" style="margin-top:16px;"></div>
</section>

<section class="card" style="margin-top:28px;" aria-labelledby="lim-h">
  <h2 id="lim-h">Before you rely on this browser</h2>
  <p>This course uses <strong>device/browser-local progress only</strong>. Your progress and saved activities remain available when you return using the <strong>same device and browser</strong>, subject to normal browser storage limitations.</p>
  %(warn)s
</section>

<div class="tools-grid" style="margin-top:22px;">
  <section class="card" aria-labelledby="exp-h">
    <h2 id="exp-h" style="font-size:1.15rem;">Export Progress</h2>
    <p style="font-size:0.9rem;">Downloads a backup file (<code>.json</code>) of this course's saved progress: which lessons you marked as done, where you were in each lesson, your saved responses, table entries and checklist ticks.</p>
    <p style="font-size:0.85rem;color:var(--ink-soft);">It contains only NDIS VA Foundations data from this browser. It is not a certification record and is not sent anywhere.</p>
    <div class="btn-row" style="margin-top:0;"><button type="button" class="btn btn-primary" data-export-progress data-message="exportMsg">Export Progress</button></div>
    <div class="feedback-box" id="exportMsg" role="status" aria-live="polite" hidden></div>
  </section>

  <section class="card" aria-labelledby="res-h">
    <h2 id="res-h" style="font-size:1.15rem;">Restore from a backup</h2>
    <p style="font-size:0.9rem;">Choose a backup file you exported earlier. You'll see what it contains before anything changes. Restoring <strong>replaces</strong> the progress currently saved in this browser.</p>
    <label class="file-pick" for="restoreFile">Backup file (.json)
      <input type="file" id="restoreFile" accept=".json,application/json">
    </label>
    <div class="feedback-box" id="restoreMessage" role="status" aria-live="polite" hidden></div>
    <div class="btn-row" id="restoreConfirm" hidden>
      <button type="button" class="btn btn-primary" id="restoreConfirmBtn">Replace and restore</button>
      <button type="button" class="btn btn-ghost" id="restoreCancelBtn">Cancel</button>
    </div>
  </section>

  <section class="card" aria-labelledby="clr-h">
    <h2 id="clr-h" style="font-size:1.15rem;">Clear progress</h2>
    <p style="font-size:0.9rem;">Removes all NDIS VA Foundations progress and saved responses from this browser. Other PVA courses are not affected.</p>
    <div class="btn-row" style="margin-top:0;"><button type="button" class="btn btn-danger" id="resetProgress">Clear this course's progress</button></div>
  </section>
</div>
""" % {"warn": STORAGE_WARNINGS}
    hdr = B.header("Local progress · Export · Restore", "Your progress &amp; backup",
                   "Everything you save in this course stays in this browser. Export a backup so you can restore it later.")
    d = OUT / "progress"
    d.mkdir(parents=True, exist_ok=True)
    (d / "index.html").write_text(B.page(root, "Your Progress & Backup | NDIS VA Foundations — PVA Free Training",
                                         "Export, restore or clear your NDIS VA Foundations progress. Progress is saved in this browser only.",
                                         [{"text": "Your progress & backup"}], hdr, main, scope="progress"), encoding="utf-8")


# ---------------------------------------------------------------------------
def build_wattlebird(OUT, wb, B):
    root = "../"
    ws = wb["Start_Here"]
    rows = B.sheet_rows(ws)
    sim_date = ""
    tabs = []
    in_guide = False
    for r in rows:
        cells = [c for c in r]
        label = cells[1] if len(cells) > 1 else ""
        val = cells[2] if len(cells) > 2 else ""
        note = cells[3] if len(cells) > 3 else ""
        if label.startswith("Wattlebird 'today'"):
            sim_date = "%s — %s" % (val, note)
        if label == "Tab guide":
            in_guide = True
            continue
        if in_guide:
            if label.startswith("v2.3") or label.startswith("Urgent work rule"):
                in_guide = False
                continue
            if label and val:
                tabs.append((label, val))
    m15_html = ""
    if B.M15_WB is not None:
        m15_rows = ""
        for name in ["M15_Capstone", "M15_Capstone_Scenarios", "M15_Capstone_Roster", "M15_Capstone_Invoice_Batch",
                     "M15_Capstone_Invoice_Evidence", "M15_Capstone_Audit_Records"]:
            rws = B.sheet_rows(B.M15_WB[name])
            desc = rws[0][0] if rws else ""
            m15_rows += '<tr><td data-label="Tab"><code>%s</code></td><td data-label="What it contains">%s</td></tr>' % (esc(name), esc(desc))
        m15_html = """
<section class="card" id="m15-workbook" aria-labelledby="m15-h">
  <h2 id="m15-h">Module 15 capstone workbook</h2>
  <div class="md">
    <p>Module 15 uses its own learner workbook. It contains the capstone task sheet and the capstone input sheets named in the Module 15 lessons. Use this workbook for the M15 capstone.</p>
    <blockquote class="callout-fictional"><p><strong>FICTIONAL TRAINING DATA.</strong> The M15 sheets are assessment inputs created for M15 and are not copied from the worked scenarios in Modules 1–14.</p></blockquote>
  </div>
  <div class="btn-row"><a class="btn btn-primary" href="%(root)s%(m15)s" download>Download M15 Learner Workbook (.xlsx)</a></div>
  <div class="table-wrap" role="region" aria-label="M15 capstone sheets" tabindex="0" style="margin-top:18px;"><table class="ref-table"><thead><tr><th>Tab</th><th>What it contains</th></tr></thead><tbody>%(rows)s</tbody></table></div>
  <p class="storage-note">Work from a copy. Keep your completed capstone evidence separate from the clean workbook.</p>
</section>
""" % {"root": root, "m15": B.M15_FILE, "rows": m15_rows}
    tab_rows = "".join("<tr><td data-label=\"Tab\"><code>%s</code></td><td data-label=\"What it contains\">%s</td></tr>" % (esc(a), esc(b)) for a, b in tabs)
    main = """
<section class="card" style="margin-top:30px;" aria-labelledby="dl-h">
  <h2 id="dl-h">Download the practice file</h2>
  <div class="md">
    <blockquote class="callout-fictional"><p><strong>FICTIONAL TRAINING DATA ONLY.</strong> Wattlebird people, participant records, invoices, prices, limits, emails, routing rules and systems are fictional training materials.</p></blockquote>
    <blockquote class="callout-fictional"><p><strong>Practice rule:</strong> Work from a copy of the Wattlebird Sandbox Pack. Keep your completed evidence separate from the clean source workbook.</p></blockquote>
  </div>
  <div class="btn-row"><a class="btn btn-primary" href="%(root)s%(pack)s" download>Download Wattlebird Sandbox Pack v2.3.4 (.xlsx)</a></div>
  <p class="storage-note">Opens in Microsoft Excel, Google Sheets (File → Import) or LibreOffice Calc. Your work in the workbook is saved in your own copy of the file — not on this website.</p>
</section>

<section class="card" aria-labelledby="use-h">
  <h2 id="use-h">How the course uses it</h2>
  <div class="md">
    <p>When a lesson says, for example, <strong>Wattlebird Sandbox → <code>Provider</code></strong>, open that tab in your copy of the workbook.</p>
    <p><strong>Wattlebird "today" (simulation date):</strong> %(sim)s</p>
    <p><strong>What to keep as evidence:</strong> save your completed practice work in your own files, using the file names the Prove It steps give you, and label Wattlebird practice evidence:</p>
    <blockquote class="callout-fictional"><p><strong>FICTIONAL TRAINING ARTIFACT — CREATED FOR PRACTICE PURPOSES ONLY</strong><br><strong>NO REAL NDIS PARTICIPANT DATA USED</strong></p></blockquote>
    <p><strong>Simulation vs real work:</strong> Your portfolio must not imply that Wattlebird was a real employer or client, or that the practice records represent real participant work. For Wattlebird work, the accurate description is <strong>fictional training practice</strong>.</p>
  </div>
</section>

%(m15)s
<section class="card" aria-labelledby="tabs-h">
  <h2 id="tabs-h">Tab guide — Sandbox Pack v2.3.4</h2>
  <p style="font-size:0.9rem;color:var(--ink-soft);">From the workbook's <code>Start_Here</code> tab.</p>
  <div class="table-wrap" role="region" aria-label="Wattlebird tab guide" tabindex="0"><table class="ref-table"><thead><tr><th>Tab</th><th>What it contains</th></tr></thead><tbody>%(rows)s</tbody></table></div>
</section>
""" % {"root": root, "pack": B.PACK_FILE, "sim": esc(sim_date), "rows": tab_rows, "m15": m15_html}
    hdr = B.header("Practice file · Fictional training data", "Wattlebird Support Services — Sandbox Pack",
                   "The fictional provider workbook you'll use throughout NDIS VA Foundations.")
    d = OUT / "wattlebird"
    d.mkdir(parents=True, exist_ok=True)
    (d / "index.html").write_text(B.page(root, "Wattlebird Practice File | NDIS VA Foundations — PVA Free Training",
                                         "Download the fictional Wattlebird Support Services Sandbox Pack used for practice in NDIS VA Foundations.",
                                         [{"text": "Wattlebird practice file"}], hdr, main, scope="wattlebird"), encoding="utf-8")


# ---------------------------------------------------------------------------
def build_cert(OUT, wb, B):
    root = "../"
    ws = wb["Certification_Rubric"]
    rows = B.sheet_rows(ws)
    title = rows[0][0]
    intro = rows[1][0]
    hdr_row = rows[2]
    crit = [r for r in rows[3:] if r[0].strip().isdigit()]
    notes = [r for r in rows[3:] if not r[0].strip().isdigit()]
    head = "".join("<th>%s</th>" % esc(h) for h in hdr_row if h != "")
    body = ""
    for r in crit:
        cells = r[:len([h for h in hdr_row if h != ""])]
        body += "<tr>" + "".join('<td data-label="%s">%s</td>' % (esc(hdr_row[i]), esc(c)) for i, c in enumerate(cells)) + "</tr>"
    notes_html = "".join("<p><strong>%s:</strong> %s</p>" % (esc(r[0]), esc(r[1])) for r in notes if r[0])

    items = [
        ("M15 — Capstone Evidence", [
            "Completed M15_Capstone task evidence for CAP-01 through CAP-10.",
            "Completed Follow_Up_Log and end-of-week handover for open or unresolved work.",
            "The required current-source verification entry/entries.",
            "M15 self-audit and portfolio-ready fictional labels.",
        ]),
        ("M16 — Portfolio Evidence", [
            "Completed certification evidence folder structure containing your course evidence.",
            "Client showcase / selected portfolio artifacts.",
            "Refined VA profile.",
            "Cover letter.",
            "Outreach message.",
            "Completed portfolio self-audit.",
        ]),
    ]
    checklist = ""
    n = 0
    for grp, lst in items:
        checklist += "<h3>%s</h3><ul class=\"task-list\">" % esc(grp)
        for it in lst:
            n += 1
            txt = esc(it)
            txt = txt.replace("M15_Capstone", "<code>M15_Capstone</code>", 1) if "M15_Capstone task" in it else txt
            txt = txt.replace("Follow_Up_Log", "<code>Follow_Up_Log</code>", 1)
            checklist += '<li><label><input type="checkbox" data-draft="evidence-%d" data-export-label="%s"> <span>%d. %s</span></label></li>' % (n, esc(it), n, txt)
        checklist += "</ul>"

    if B.SUBMISSION_URL:
        route = ('<div class="btn-row"><a class="btn btn-primary" href="%s" target="_blank" rel="noopener">Open NDIS VA Foundations → Certification Submission</a></div>'
                 '<p class="storage-note">The submission route opens on the PVA submission system. Nothing on this course site uploads your files.</p>' % esc(B.SUBMISSION_URL))
    else:
        route = ('<div class="route-closed" role="status"><p><strong>The certification submission route is not open yet.</strong></p>'
                 '<p style="margin-bottom:0;">If the course page does not yet show a submission route, the course is not ready for certification submission. Keep your complete evidence set ready and check back here.</p></div>')

    main = """
<section class="card" style="margin-top:30px;" aria-labelledby="route-h">
  <h2 id="route-h">Submit your complete certification evidence set</h2>
  <div class="md">
    <p>The course package does not transmit certification submissions. When delivered through PVA Academy, submit the <strong>complete certification evidence set</strong> through the <strong>NDIS VA Foundations → Certification Submission</strong> route on the course page. The package itself does not transmit files.</p>
    <p>The M15 capstone is not the entire certification submission. <strong>M15 supplies the integrated operational assessment evidence; M16 supplies the portfolio and presentation evidence.</strong> Submit the complete set together through the certification route.</p>
  </div>
  %(route)s
</section>

<section class="folder-tab" data-tab="Evidence checklist" data-state="current" style="margin-top:34px;" aria-labelledby="set-h">
  <h2 id="set-h">Complete Certification Evidence Set</h2>
  <p>Your certification submission must contain all of the following:</p>
  <div class="md">%(checklist)s</div>
  <p class="storage-note">Ticks are saved in this browser only. They are a personal checklist — ticking an item does not submit anything.</p>
</section>

<section class="card" style="margin-top:28px;" aria-labelledby="cap-h">
  <h2 id="cap-h">M15 capstone pass condition</h2>
  <div class="md">
    <p>The capstone is assessed out of 20 points across the published capstone dimensions. <strong>Capstone pass condition: at least 16/20 points and no Critical Failure.</strong> Certification also requires the separate <strong>Certification Rubric</strong> to meet its stated threshold and required-criterion rules. A capstone score alone does not award certification.</p>
    <p>See <a href="%(root)smodule-15/">Module 15</a> for the published capstone weights and Critical Failure definitions.</p>
  </div>
</section>

<section class="card" aria-labelledby="rub-h">
  <h2 id="rub-h">%(rtitle)s</h2>
  <p>%(rintro)s</p>
  <div class="table-wrap" role="region" aria-label="Certification rubric" tabindex="0"><table class="ref-table"><thead><tr>%(rhead)s</tr></thead><tbody>%(rbody)s</tbody></table></div>
  <div class="md">%(rnotes)s</div>
  <p class="storage-note">From the <code>Certification_Rubric</code> tab of the Wattlebird Sandbox Pack v2.3.4.</p>
</section>

<section class="card" aria-labelledby="hon-h">
  <h2 id="hon-h">Honest representation</h2>
  <div class="md">
    <p>Keep the fictional-training disclaimer and honest representation requirements on all portfolio evidence. Do not present Wattlebird, the course exercises, or the course certificate as real NDIS employment, real client work, or official NDIS certification.</p>
    <p>The PVA Academy course certificate is a training credential from the academy. It is <strong>not an NDIS provider certification or government accreditation</strong>.</p>
  </div>
  <div class="btn-row"><a class="btn btn-secondary" href="%(root)smodule-15/">Module 15 — Capstone</a><a class="btn btn-secondary" href="%(root)smodule-16/">Module 16 — Portfolio</a></div>
</section>
""" % {"route": route, "checklist": checklist, "root": root, "rtitle": esc(title), "rintro": esc(intro),
       "rhead": head, "rbody": body, "rnotes": notes_html}
    hdr = B.header("M15 + M16 · One submission route", "NDIS VA Foundations → Certification Submission",
                   "M15 and M16 together form the complete certification evidence submission.")
    d = OUT / "certification-submission"
    d.mkdir(parents=True, exist_ok=True)
    (d / "index.html").write_text(B.page(root, "Certification Submission | NDIS VA Foundations — PVA Free Training",
                                         "What to include in the NDIS VA Foundations certification evidence set (M15 capstone + M16 portfolio) and how to submit it.",
                                         [{"text": "Certification Submission"}], hdr, main, scope="certification"), encoding="utf-8")
