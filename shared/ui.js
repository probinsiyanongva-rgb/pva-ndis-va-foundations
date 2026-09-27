/* =========================================================================
   PVA Free Training — NDIS VA Foundations
   Shared page behavior: step panels, local drafts, completion, progress
   displays, lesson-notes export, and the Export / Restore Progress panel.

   Requires shared/course-data.js and shared/progress-ndis.js.
   All learner-entered text stays in this browser (window.PVANDIS).
   ========================================================================= */

(function (window, document) {
  "use strict";

  var P = window.PVANDIS;
  if (!P) return;

  var CHECK_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.2l-3.5-3.6L4 14.1l5 5 11-11-1.5-1.4z"/></svg>';

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function stampHtml(status, labels) {
    labels = labels || {};
    if (status === "complete") return '<span class="stamp">' + CHECK_SVG + (labels.complete || "Complete") + "</span>";
    if (status === "in-progress") return '<span class="stamp pending in-progress">' + (labels.progress || "In progress") + "</span>";
    return '<span class="stamp pending">' + (labels.none || "Not started") + "</span>";
  }

  function timeLabel() {
    var d = new Date();
    var h = d.getHours(), m = d.getMinutes();
    return (h % 12 || 12) + ":" + (m < 10 ? "0" : "") + m + (h < 12 ? " am" : " pm");
  }

  // Root-relative path helper: every page sets data-root on <body>.
  var ROOT = document.body.getAttribute("data-root") || "./";

  // ---------------------------------------------------------------------
  // Storage availability notice (private browsing, blocked storage)
  // ---------------------------------------------------------------------
  function storageNotice() {
    if (P.storageAvailable()) return;
    var main = $("main");
    if (!main) return;
    var div = document.createElement("div");
    div.className = "callout storage-blocked";
    div.setAttribute("role", "status");
    div.innerHTML = "<strong>Progress can't be saved in this browser right now.</strong> " +
      "Browser storage appears to be blocked (this often happens in private/incognito windows or with strict privacy settings). " +
      "You can still read every lesson, but completion and saved responses will not be kept when you leave.";
    main.insertBefore(div, main.firstChild);
  }

  // ---------------------------------------------------------------------
  // Drafts: textareas, inputs and checkboxes marked with data-draft
  // inside an element carrying data-draft-scope.
  // ---------------------------------------------------------------------
  function bindDrafts() {
    $all("[data-draft]").forEach(function (el) {
      var scopeEl = el.closest("[data-draft-scope]");
      if (!scopeEl) return;
      var scopeId = scopeEl.getAttribute("data-draft-scope");
      var key = el.getAttribute("data-draft");
      var status = null;
      var statusId = el.getAttribute("data-status");
      if (statusId) status = document.getElementById(statusId);

      if (el.type === "checkbox") {
        el.checked = !!P.getDraft(scopeId, key, false);
        el.addEventListener("change", function () {
          P.saveDraft(scopeId, key, el.checked);
          refreshProgressDisplays();
        });
        return;
      }

      var saved = P.getDraft(scopeId, key, "");
      if (saved) el.value = saved;
      var timer = null;
      function save() {
        var ok = P.saveDraft(scopeId, key, el.value);
        if (status) status.textContent = ok ? "Saved in this browser · " + timeLabel() : "Not saved — browser storage is unavailable";
      }
      el.addEventListener("input", function () {
        clearTimeout(timer);
        timer = setTimeout(save, 500);
      });
      el.addEventListener("blur", function () {
        clearTimeout(timer);
        save();
      });
    });

    // "Copy this template into my notes"
    $all("[data-copy-template]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var src = document.getElementById(btn.getAttribute("data-copy-template"));
        var dest = document.getElementById(btn.getAttribute("data-target"));
        if (!src || !dest) return;
        var text = src.textContent.replace(/\s+$/, "");
        dest.value = dest.value ? dest.value.replace(/\s+$/, "") + "\n\n" + text + "\n" : text + "\n";
        dest.dispatchEvent(new Event("blur"));
        dest.focus();
      });
    });
  }

  // ---------------------------------------------------------------------
  // Lesson page: step panels (SMM pattern), completion, notes export
  // ---------------------------------------------------------------------
  function initLesson() {
    var body = document.body;
    var lessonId = body.getAttribute("data-lesson-id");
    if (!lessonId) return;

    var panels = $all(".step-panel");
    var nav = $("#stepNav");
    var bar = $("#lessonProgressBar");
    var contentCount = panels.length - 1; // last panel is the "Done" panel

    // Build step chips (buttons, keyboard accessible).
    panels.forEach(function (panel, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "step-chip";
      btn.textContent = panel.getAttribute("data-label");
      btn.setAttribute("data-goto", String(i));
      if (i === panels.length - 1) btn.className += " step-chip-done";
      nav.appendChild(btn);
    });
    var chips = $all(".step-chip", nav);

    function paintChips(current) {
      var complete = P.isLessonComplete(lessonId);
      chips.forEach(function (c, i) {
        c.classList.toggle("is-current", i === current);
        c.classList.toggle("is-done", complete || i < current);
        if (i === current) c.setAttribute("aria-current", "step");
        else c.removeAttribute("aria-current");
      });
    }

    function goTo(i, opts) {
      opts = opts || {};
      if (i < 0) i = 0;
      if (i > panels.length - 1) i = panels.length - 1;
      panels.forEach(function (p, j) { p.classList.toggle("is-active", j === i); });
      paintChips(i);
      if (bar) bar.style.width = Math.round((Math.min(i, contentCount) / contentCount) * 100) + "%";
      if (i < contentCount) P.saveStepProgress(lessonId, i);
      if (!opts.initial) {
        var h = panels[i].querySelector("h2");
        if (h) {
          h.setAttribute("tabindex", "-1");
          h.focus({ preventScroll: true });
        }
        var top = nav.getBoundingClientRect().top + window.pageYOffset - 12;
        window.scrollTo(0, top);
      }
      if (history.replaceState) history.replaceState(null, "", "#step-" + (i + 1));
    }

    document.addEventListener("click", function (e) {
      var t = e.target.closest("[data-goto]");
      if (!t) return;
      e.preventDefault();
      goTo(parseInt(t.getAttribute("data-goto"), 10));
    });

    function paintCompletion() {
      var complete = P.isLessonComplete(lessonId);
      $all("[data-lesson-state]").forEach(function (el) {
        el.innerHTML = stampHtml(complete ? "complete" : (P.getStepProgress(lessonId) > 0 ? "in-progress" : "none"), { complete: "Lesson complete" });
      });
      var undo = $("#markNotDone");
      if (undo) undo.hidden = !complete;
      var mark = $("#markDone");
      if (mark) mark.textContent = complete ? "Lesson marked as done — continue" : mark.getAttribute("data-label");
    }

    var markBtn = $("#markDone");
    if (markBtn) {
      markBtn.addEventListener("click", function () {
        P.markLessonComplete(lessonId);
        paintCompletion();
        goTo(panels.length - 1);
      });
    }
    var undoBtn = $("#markNotDone");
    if (undoBtn) {
      undoBtn.addEventListener("click", function () {
        P.markLessonIncomplete(lessonId);
        paintCompletion();
        goTo(contentCount - 1);
      });
    }

    // Lesson notes export (SMM "Generate my …" pattern)
    var genBtn = $("#generateNotes");
    if (genBtn) {
      genBtn.addEventListener("click", function () {
        var text = buildLessonNotes();
        var box = $("#notesExportBox");
        box.textContent = text;
        box.hidden = false;
        $("#notesExportActions").hidden = false;
      });
      $("#downloadNotes").addEventListener("click", function () {
        downloadText(buildLessonNotes(), body.getAttribute("data-notes-filename") || "lesson-notes.txt");
      });
    }

    var hashStep = /^#step-(\d+)$/.exec(window.location.hash || "");
    var start = hashStep ? parseInt(hashStep[1], 10) - 1 : Math.min(P.getStepProgress(lessonId), contentCount - 1);
    goTo(start, { initial: true });
    paintCompletion();
  }

  function buildLessonNotes() {
    var body = document.body;
    var lines = [];
    lines.push(body.getAttribute("data-notes-title") || document.title);
    lines.push("PVA Free Training — NDIS VA Foundations");
    lines.push("FICTIONAL TRAINING ARTIFACT — CREATED FOR PRACTICE PURPOSES ONLY");
    lines.push("NO REAL NDIS PARTICIPANT DATA USED");
    lines.push("Generated: " + new Date().toLocaleString());
    lines.push("");
    var any = false;
    $all(".step-panel").forEach(function (panel) {
      var section = [];
      $all("[data-draft]", panel).forEach(function (el) {
        var label = el.getAttribute("data-export-label") || el.getAttribute("aria-label") || "";
        if (el.type === "checkbox") {
          section.push((el.checked ? "[x] " : "[ ] ") + label);
          if (el.checked) any = true;
        } else if (el.value.trim()) {
          any = true;
          section.push(label + ":");
          section.push(el.value.trim());
          section.push("");
        }
      });
      if (section.length) {
        lines.push("== " + panel.getAttribute("data-label") + " ==");
        lines = lines.concat(section);
        lines.push("");
      }
    });
    if (!any) lines.push("(No responses saved yet for this lesson.)");
    return lines.join("\n");
  }

  function downloadText(text, filename) {
    try {
      var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
    } catch (e) { /* download blocked; text remains visible on page */ }
  }

  // ---------------------------------------------------------------------
  // Progress displays (home, module pages, lesson lists, progress page)
  // ---------------------------------------------------------------------
  function refreshProgressDisplays() {
    var prog = P.getCourseProgress();

    $all("[data-course-progress-bar]").forEach(function (el) { el.style.width = prog.percent + "%"; });
    $all("[data-course-progress-text]").forEach(function (el) {
      el.textContent = prog.modulesComplete + " of " + prog.modulesTotal + " modules complete · " +
        prog.lessonsComplete + " of " + prog.lessonsTotal + " lessons";
    });
    $all("[data-course-progress-percent]").forEach(function (el) { el.textContent = prog.percent + "%"; });

    $all("[data-module-status]").forEach(function (el) {
      var num = parseInt(el.getAttribute("data-module-status"), 10);
      el.innerHTML = stampHtml(P.getModuleStatus(num));
    });
    $all("[data-module-count]").forEach(function (el) {
      var c = P.getModuleCounts(parseInt(el.getAttribute("data-module-count"), 10));
      el.textContent = c.done + " of " + c.total + " lessons done";
    });
    $all("[data-module-bar]").forEach(function (el) {
      var c = P.getModuleCounts(parseInt(el.getAttribute("data-module-bar"), 10));
      el.style.width = (c.total ? Math.round((c.done / c.total) * 100) : 0) + "%";
    });
    $all("[data-lesson-status]").forEach(function (el) {
      var id = el.getAttribute("data-lesson-status");
      var st = P.isLessonComplete(id) ? "complete" : (P.getStepProgress(id) > 0 || Object.keys(P.getDrafts(id)).length ? "in-progress" : "none");
      el.innerHTML = stampHtml(st);
      var card = el.closest(".lesson-card");
      if (card) card.classList.toggle("is-complete", st === "complete");
    });

    // "Next action" button on the home page
    $all("[data-next-action]").forEach(function (el) {
      var next = P.getNextLesson();
      if (!next) {
        el.href = ROOT + "certification-submission/";
        el.textContent = "All lessons marked done — review Certification Submission →";
        return;
      }
      el.href = ROOT + next.path;
      el.textContent = (P.hasAnyProgress() ? "Continue: " : "Start: ") + next.label + " →";
    });
  }

  // ---------------------------------------------------------------------
  // Export / Restore Progress panel — Build Brief Section 37
  // ---------------------------------------------------------------------
  function initProgressTools() {
    $all("[data-export-progress]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var result = P.exportProgress();
        var msg = document.getElementById(btn.getAttribute("data-message") || "");
        if (!msg) return;
        msg.hidden = false;
        if (result.ok) {
          msg.className = "feedback-box show ok";
          msg.textContent = "Backup downloaded as " + result.filename + " — " + result.summary.lessonsComplete + " of " +
            result.summary.lessonsTotal + " lessons marked done, " + result.summary.savedItems +
            " saved responses. Keep this file somewhere safe (for example, your own Google Drive folder).";
        } else {
          msg.className = "feedback-box show warn";
          msg.textContent = result.error + " Try again, or try another browser on this device.";
        }
      });
    });

    var fileInput = $("#restoreFile");
    if (!fileInput) return;
    var msg = $("#restoreMessage");
    var confirmWrap = $("#restoreConfirm");
    var pending = null;

    function show(kind, text) {
      msg.hidden = false;
      msg.className = "feedback-box show " + kind;
      msg.textContent = text;
    }

    fileInput.addEventListener("change", function () {
      pending = null;
      confirmWrap.hidden = true;
      var f = fileInput.files && fileInput.files[0];
      if (!f) return;
      if (f.size > 5 * 1024 * 1024) {
        show("warn", "That file is too large to be a progress backup.");
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        var res = P.parseBackup(String(reader.result || ""));
        if (!res.ok) { show("warn", res.error); return; }
        pending = res;
        var when = res.exportedAt ? new Date(res.exportedAt).toLocaleString() : "an unknown date";
        show("info", "Backup from " + when + ": " + res.summary.lessonsComplete + " of " + res.summary.lessonsTotal +
          " lessons marked done, " + res.summary.savedItems + " saved responses. Restoring will REPLACE the progress currently saved in this browser.");
        confirmWrap.hidden = false;
        var btn = $("#restoreConfirmBtn");
        if (btn) btn.focus();
      };
      reader.onerror = function () { show("warn", "The file could not be read."); };
      reader.readAsText(f);
    });

    $("#restoreConfirmBtn").addEventListener("click", function () {
      if (!pending) return;
      if (P.restoreFromData(pending.data)) {
        show("ok", "Progress restored in this browser.");
        confirmWrap.hidden = true;
        fileInput.value = "";
        pending = null;
        refreshProgressDisplays();
        renderProgressDetail();
      } else {
        show("warn", "Restore failed — browser storage is unavailable (private/incognito windows often block it).");
      }
    });
    $("#restoreCancelBtn").addEventListener("click", function () {
      pending = null;
      confirmWrap.hidden = true;
      fileInput.value = "";
      show("info", "Restore cancelled. Nothing was changed.");
    });

    var resetBtn = $("#resetProgress");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        var ok = window.confirm("Clear all NDIS VA Foundations progress and saved responses from this browser?\n\nThis cannot be undone. Export a backup first if you might need it.");
        if (!ok) return;
        P.resetProgress();
        show("info", "All NDIS VA Foundations progress was cleared from this browser.");
        refreshProgressDisplays();
        renderProgressDetail();
      });
    }
  }

  // Per-module breakdown on the progress page
  function renderProgressDetail() {
    var wrap = $("#progressDetail");
    if (!wrap) return;
    wrap.innerHTML = "";
    P.COURSE.modules.forEach(function (m) {
      var c = P.getModuleCounts(m.num);
      var row = document.createElement("a");
      row.className = "progress-row";
      row.href = ROOT + m.path;
      var label = document.createElement("span");
      label.className = "progress-row-label";
      label.textContent = "Module " + m.num + " — " + m.title;
      var count = document.createElement("span");
      count.className = "progress-row-count";
      count.textContent = c.done + "/" + c.total;
      var stamp = document.createElement("span");
      stamp.innerHTML = stampHtml(P.getModuleStatus(m.num));
      row.appendChild(label);
      row.appendChild(count);
      row.appendChild(stamp);
      wrap.appendChild(row);
    });
  }

  // ---------------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------------
  document.addEventListener("DOMContentLoaded", function () {
    storageNotice();
    bindDrafts();
    initLesson();
    initProgressTools();
    refreshProgressDisplays();
    renderProgressDetail();
  });

  // Keep displays in sync if another tab changes progress
  window.addEventListener("storage", function (e) {
    if (e.key === P.STORAGE_KEY) {
      refreshProgressDisplays();
      renderProgressDetail();
    }
  });
})(window, document);
