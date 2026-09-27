/* =========================================================================
   PVA Free Training — NDIS VA Foundations
   Progress tracking, local drafts, and Export / Restore (window.PVANDIS)

   Follows the PVA Free Training pattern established in the SMM pathway
   (shared/progress-smm.js): no accounts, no backend, one course-specific
   localStorage key. This module uses its OWN key and namespace so NDIS
   progress can never mix with any other PVA course.

   Export Progress (Build Brief Section 37) is a new shared component:
   the SMM reference has no course-level export, so this adds one using
   the same storage pattern. The export contains only the learner's own
   saved state from the NDIS key — nothing else is read or written.

   Requires shared/course-data.js (window.NDIS_COURSE) to be loaded first.
   ========================================================================= */

(function (window, document) {
  "use strict";

  var STORAGE_KEY = "pva-ndis-vaf-progress";
  var EXPORT_FORMAT = "pva-ndis-vaf-progress-backup";
  var EXPORT_VERSION = 1;

  var COURSE = window.NDIS_COURSE || { modules: [] };

  // ---------------------------------------------------------------------
  // Storage
  // ---------------------------------------------------------------------
  function storageAvailable() {
    try {
      var t = "__pva_ndis_test__";
      window.localStorage.setItem(t, t);
      window.localStorage.removeItem(t);
      return true;
    } catch (e) {
      return false;
    }
  }

  function readState() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function writeState(state) {
    try {
      state._meta = state._meta || {};
      state._meta.updatedAt = new Date().toISOString();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      return false;
    }
  }

  function scope(state, id) {
    if (!state[id] || typeof state[id] !== "object") state[id] = {};
    return state[id];
  }

  // ---------------------------------------------------------------------
  // Lessons
  // ---------------------------------------------------------------------
  function markLessonComplete(lessonId) {
    var state = readState();
    var s = scope(state, lessonId);
    s.complete = true;
    s.completedAt = new Date().toISOString();
    return writeState(state);
  }

  function markLessonIncomplete(lessonId) {
    var state = readState();
    var s = scope(state, lessonId);
    s.complete = false;
    delete s.completedAt;
    return writeState(state);
  }

  function isLessonComplete(lessonId) {
    var state = readState();
    return !!(state[lessonId] && state[lessonId].complete);
  }

  function saveStepProgress(lessonId, stepIndex) {
    var state = readState();
    scope(state, lessonId).lastStep = stepIndex;
    state._meta = state._meta || {};
    state._meta.lastLesson = lessonId;
    writeState(state);
  }

  function getStepProgress(lessonId) {
    var state = readState();
    return state[lessonId] && typeof state[lessonId].lastStep === "number" ? state[lessonId].lastStep : 0;
  }

  // ---------------------------------------------------------------------
  // Drafts (learner-entered text, checklists, table cells)
  // Saved locally only. Never sent anywhere.
  // ---------------------------------------------------------------------
  function saveDraft(scopeId, key, value) {
    var state = readState();
    var s = scope(state, scopeId);
    if (!s.drafts || typeof s.drafts !== "object") s.drafts = {};
    if (value === "" || value === false || value === null) {
      delete s.drafts[key];
    } else {
      s.drafts[key] = value;
    }
    return writeState(state);
  }

  function getDraft(scopeId, key, fallback) {
    var state = readState();
    var v = state[scopeId] && state[scopeId].drafts && state[scopeId].drafts[key];
    return v === undefined ? fallback : v;
  }

  function getDrafts(scopeId) {
    var state = readState();
    return (state[scopeId] && state[scopeId].drafts) || {};
  }

  function hasActivity(state, lessonId) {
    var s = state[lessonId];
    if (!s) return false;
    if (s.complete) return true;
    if (typeof s.lastStep === "number" && s.lastStep > 0) return true;
    return !!(s.drafts && Object.keys(s.drafts).length);
  }

  // ---------------------------------------------------------------------
  // Course structure helpers
  // ---------------------------------------------------------------------
  function allLessons() {
    var out = [];
    COURSE.modules.forEach(function (m) {
      m.lessons.forEach(function (l) { out.push(l); });
    });
    return out;
  }

  function findModule(num) {
    for (var i = 0; i < COURSE.modules.length; i++) {
      if (COURSE.modules[i].num === num) return COURSE.modules[i];
    }
    return null;
  }

  function getModuleStatus(num) {
    var m = findModule(num);
    if (!m || !m.lessons.length) return "not-started";
    var state = readState();
    var done = m.lessons.filter(function (l) { return state[l.id] && state[l.id].complete; }).length;
    if (done === m.lessons.length) return "complete";
    var touched = done > 0 || m.lessons.some(function (l) { return hasActivity(state, l.id); }) ||
      !!(state[m.id] && state[m.id].drafts && Object.keys(state[m.id].drafts).length);
    return touched ? "in-progress" : "not-started";
  }

  function getModuleCounts(num) {
    var m = findModule(num);
    var state = readState();
    if (!m) return { done: 0, total: 0 };
    return {
      done: m.lessons.filter(function (l) { return state[l.id] && state[l.id].complete; }).length,
      total: m.lessons.length
    };
  }

  function getCourseProgress() {
    var state = readState();
    var lessons = allLessons();
    var lessonsDone = lessons.filter(function (l) { return state[l.id] && state[l.id].complete; }).length;
    var modulesDone = COURSE.modules.filter(function (m) {
      return m.lessons.length && m.lessons.every(function (l) { return state[l.id] && state[l.id].complete; });
    }).length;
    return {
      modulesComplete: modulesDone,
      modulesTotal: COURSE.modules.length,
      lessonsComplete: lessonsDone,
      lessonsTotal: lessons.length,
      percent: lessons.length ? Math.round((lessonsDone / lessons.length) * 100) : 0
    };
  }

  // The next lesson to suggest: the last lesson visited if it is not yet
  // done, otherwise the first lesson (in course order) not marked done.
  function getNextLesson() {
    var state = readState();
    var lessons = allLessons();
    var last = state._meta && state._meta.lastLesson;
    if (last) {
      for (var i = 0; i < lessons.length; i++) {
        if (lessons[i].id === last && !(state[last] && state[last].complete)) return lessons[i];
      }
    }
    for (var j = 0; j < lessons.length; j++) {
      if (!(state[lessons[j].id] && state[lessons[j].id].complete)) return lessons[j];
    }
    return null;
  }

  function hasAnyProgress() {
    var state = readState();
    return Object.keys(state).some(function (k) { return k !== "_meta"; });
  }

  // ---------------------------------------------------------------------
  // Export / Restore — Build Brief Section 37
  // ---------------------------------------------------------------------
  function summarize(state) {
    var lessons = allLessons();
    var drafts = 0;
    Object.keys(state).forEach(function (k) {
      if (k !== "_meta" && state[k] && state[k].drafts) drafts += Object.keys(state[k].drafts).length;
    });
    return {
      lessonsComplete: lessons.filter(function (l) { return state[l.id] && state[l.id].complete; }).length,
      lessonsTotal: lessons.length,
      savedItems: drafts
    };
  }

  function buildExport() {
    var state = readState();
    return {
      format: EXPORT_FORMAT,
      version: EXPORT_VERSION,
      course: "NDIS VA Foundations — PVA Free Training",
      storageKey: STORAGE_KEY,
      exportedAt: new Date().toISOString(),
      note: "Backup of learner progress saved in one browser. Contains only this course's lesson completion, step position and saved activity responses. Not a certification record.",
      summary: summarize(state),
      data: state
    };
  }

  function exportProgress() {
    var payload = buildExport();
    var json = JSON.stringify(payload, null, 2);
    var stamp = payload.exportedAt.slice(0, 10);
    var filename = "NDIS-VA-Foundations-progress-backup-" + stamp + ".json";
    try {
      var blob = new Blob([json], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
      return { ok: true, filename: filename, summary: payload.summary };
    } catch (e) {
      return { ok: false, error: "Your browser blocked the download." };
    }
  }

  // Validates a backup's text. Returns { ok, data, summary } or { ok:false, error }.
  function parseBackup(text) {
    var parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      return { ok: false, error: "This file is not a valid progress backup (it could not be read as JSON)." };
    }
    if (!parsed || parsed.format !== EXPORT_FORMAT) {
      return { ok: false, error: "This file is not an NDIS VA Foundations progress backup. Backups from other PVA courses cannot be restored here." };
    }
    if (typeof parsed.version !== "number" || parsed.version > EXPORT_VERSION) {
      return { ok: false, error: "This backup was made by a newer version of the course and cannot be restored here." };
    }
    if (!parsed.data || typeof parsed.data !== "object" || Array.isArray(parsed.data)) {
      return { ok: false, error: "This backup file is missing its saved progress." };
    }
    return { ok: true, data: parsed.data, exportedAt: parsed.exportedAt, summary: summarize(parsed.data) };
  }

  function restoreFromData(data) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      return false;
    }
  }

  function resetProgress() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (e) {
      return false;
    }
  }

  window.PVANDIS = {
    STORAGE_KEY: STORAGE_KEY,
    COURSE: COURSE,
    storageAvailable: storageAvailable,
    markLessonComplete: markLessonComplete,
    markLessonIncomplete: markLessonIncomplete,
    isLessonComplete: isLessonComplete,
    saveStepProgress: saveStepProgress,
    getStepProgress: getStepProgress,
    saveDraft: saveDraft,
    getDraft: getDraft,
    getDrafts: getDrafts,
    getModuleStatus: getModuleStatus,
    getModuleCounts: getModuleCounts,
    getCourseProgress: getCourseProgress,
    getNextLesson: getNextLesson,
    hasAnyProgress: hasAnyProgress,
    allLessons: allLessons,
    exportProgress: exportProgress,
    buildExport: buildExport,
    parseBackup: parseBackup,
    restoreFromData: restoreFromData,
    resetProgress: resetProgress
  };
})(window, document);
