// Calm Guide → Google Sheet webhook (v2).
// Replaces the v1 script. Routes by body.type:
//   "report"     → Handoffs tab (default, same columns as v1)
//   "correction" → Corrections tab (screen differs from the guide's notes; no name or email)
//   "tools"      → Tools tab (anonymous tool profile; no name or email)
//
// After pasting: Deploy > Manage deployments > (your deployment) > Edit (pencil) >
// Version: New version > Deploy. This keeps the same /exec URL, so the app needs no change.

const SECRET = 'PASTE-THE-SAME-SECRET-AS-BEFORE';

const TABS = {
  report: {
    name: 'Handoffs',
    headers: ['Received', 'Report ID', 'Name', 'Email', 'Product', 'Goal', 'What was tried',
      'Blocker / question', 'Progress summary', 'Routine progress', 'Transcript (last 20)', 'Status'],
    row: r => [r.id, r.userName, r.userEmail, r.product, r.goal, r.tried, r.blocker,
      r.progressSummary, r.routineProgress, r.transcript, 'New'],
  },
  correction: {
    name: 'Corrections',
    headers: ['Received', 'ID', 'Product', 'Device', 'Topic', 'Our notes say', 'Screen shows', 'Status'],
    row: r => [r.id, r.product, r.device, r.topic, r.notesSay, r.screenShows, 'New'],
  },
  tools: {
    name: 'Tools',
    headers: ['Received', 'Anonymous user', 'Device', 'Tools (id:account:sensitive)', 'Other tools'],
    row: r => [r.anonId, r.device, r.tools, r.other],
  },
};

function clean(v) {
  const s = String(v == null ? '' : v).slice(0, 45000);
  return /^[=+\-@]/.test(s) ? "'" + s : s; // stop text being read as a formula
}

function doPost(e) {
  const out = o => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.secret !== SECRET) return out({ ok: false, error: 'bad secret' });

    const type = TABS[body.type] ? body.type : 'report';
    const tab = TABS[type];
    const record = body.report || body.record || {};

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(tab.name) || ss.insertSheet(tab.name);
    if (sheet.getLastRow() === 0) sheet.appendRow(tab.headers);

    // For "tools", keep one row per anonymous user: update it if it exists.
    if (type === 'tools' && record.anonId && sheet.getLastRow() > 1) {
      const ids = sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getValues();
      for (let i = 0; i < ids.length; i++) {
        if (ids[i][0] === record.anonId) {
          sheet.getRange(i + 2, 1, 1, tab.headers.length)
            .setValues([[new Date()].concat(tab.row(record).map(clean))]);
          return out({ ok: true, id: record.anonId });
        }
      }
    }

    sheet.appendRow([new Date()].concat(tab.row(record).map(clean)));
    return out({ ok: true, id: record.id || record.anonId || '' });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}
