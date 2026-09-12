/**
 * Site Visit Tool — Apps Script POC backend
 *
 * Scope (per the "Backend Architecture Recommendation" doc, Sep 2026):
 *   1) loadProject(sheetId) — GET: read one floor's stations back out of the sheet
 *   2) syncFloor()          — POST: write station data + one photo to Sheets/Drive
 *
 * Deploy this bound to the test sheet (Extensions > Apps Script), run setupSheet()
 * once from the editor to create the tabs, set the SHARED_SECRET script property,
 * then deploy > New deployment > Web app (execute as Me, access: Anyone with link).
 */

// ── ONE-TIME SETUP ──────────────────────────────────────────────────────
// Run this once from the Apps Script editor (select setupSheet in the function
// dropdown, click Run). Creates the four tabs with headers if they don't exist.
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const tabs = {
    'Building': ['name', 'address', 'hauler', 'auditor', 'streams', 'driveFolderId'],
    'Floors': ['floorId', 'floorIndex', 'floorName', 'planDriveFileId', 'planDataUrl_DEPRECATED', 'displayWidth', 'displayHeight'],
    'Stations': ['floorId', 'stationId', 'letter', 'stream', 'scale', 'binCode', 'x', 'y', 'notes', 'lastUpdated'],
    'Photos': ['stationId', 'photoType', 'driveFileId', 'shareableLink', 'timestamp'],
  };

  Object.keys(tabs).forEach(tabName => {
    let sheet = ss.getSheetByName(tabName);
    if (!sheet) sheet = ss.insertSheet(tabName);
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, tabs[tabName].length).setValues([tabs[tabName]]);
      sheet.setFrozenRows(1);
    }
  });

  // Remove the default "Sheet1" if it's still empty and unused
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && defaultSheet.getLastRow() === 0) {
    ss.deleteSheet(defaultSheet);
  }

  // Logger.log (not a UI alert) — alert()/Browser.inputBox() need an active
  // spreadsheet UI session and just hang forever when run from the standalone
  // script.google.com editor instead of from a custom menu inside the open Sheet.
  // View this via the Executions log (clock icon on the left) or Ctrl/Cmd+Enter.
  Logger.log('Tabs created/verified: ' + Object.keys(tabs).join(', '));
}

// Run this once to set the shared-secret token. Edit TOKEN_VALUE below first,
// then run this function — it writes to Script Properties, not into source,
// so the token itself never ends up in code you might share/commit.
// (Browser.inputBox() would be the interactive way to do this, but it has the
// same UI-context hang risk as alert() above, so we avoid it here.)
function setToken() {
  const TOKEN_VALUE = 'poc-test-123'; // <-- change this before running, then you can change it back/remove it
  PropertiesService.getScriptProperties().setProperty('SHARED_SECRET', TOKEN_VALUE);
  Logger.log('Token set.');
}

function checkToken_(token) {
  const expected = PropertiesService.getScriptProperties().getProperty('SHARED_SECRET');
  return expected && token === expected;
}

// ── GET: loadProject ────────────────────────────────────────────────────
// ?sheetId=...&token=...&floorId=...   (sheetId is accepted but this script is
// bound to one sheet in the POC; a later multi-tenant version would open by ID)
function doGet(e) {
  const token = e.parameter.token;
  if (!checkToken_(token)) {
    return jsonResponse_({ error: 'invalid token' }, 401);
  }

  const floorId = e.parameter.floorId;
  if (!floorId) {
    return jsonResponse_({ error: 'floorId is required' }, 400);
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const stationsSheet = ss.getSheetByName('Stations');
  const rows = stationsSheet.getDataRange().getValues();
  const headers = rows[0];

  const stations = rows.slice(1)
    .filter(row => row[headers.indexOf('floorId')] === floorId)
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });

  const floorsSheet = ss.getSheetByName('Floors');
  const floorRows = floorsSheet.getDataRange().getValues();
  const floorHeaders = floorRows[0];
  const floorRow = floorRows.slice(1).find(row => row[floorHeaders.indexOf('floorId')] === floorId);
  const floor = floorRow ? Object.fromEntries(floorHeaders.map((h, i) => [h, floorRow[i]])) : null;

  return jsonResponse_({ floor, stations });
}

// ── POST: syncFloor ─────────────────────────────────────────────────────
// Body (JSON): {
//   token: '...',
//   floorId: '...',
//   stations: [{ stationId, letter, stream, scale, binCode, x, y, notes }, ...],
//   photo: { stationId, photoType, base64, mimeType, buildingName, floorIndex } // optional, one per call for the POC
//   driveFolderId: '...'  // where photos for this project live
// }
function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse_({ error: 'invalid JSON body' }, 400);
  }

  if (!checkToken_(body.token)) {
    return jsonResponse_({ error: 'invalid token' }, 401);
  }
  if (!body.floorId || !Array.isArray(body.stations)) {
    return jsonResponse_({ error: 'floorId and stations[] are required' }, 400);
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const stationsSheet = ss.getSheetByName('Stations');
  writeStations_(stationsSheet, body.floorId, body.stations);

  let photoResult = null;
  if (body.photo) {
    photoResult = uploadPhoto_(body.photo, body.driveFolderId);
    logPhoto_(ss.getSheetByName('Photos'), body.photo.stationId, body.photo.photoType, photoResult);
  }

  return jsonResponse_({ ok: true, stationsWritten: body.stations.length, photo: photoResult });
}

// Upsert: replace all rows for this floorId, then append the incoming rows.
// Simple and correct for the POC's "sync per floor" model; a production
// version would want per-row versioning/merge instead of a full replace.
function writeStations_(sheet, floorId, stations) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const floorIdCol = headers.indexOf('floorId');

  const keepRows = data.slice(1).filter(row => row[floorIdCol] !== floorId);

  const newRows = stations.map(st => headers.map(h => {
    if (h === 'floorId') return floorId;
    if (h === 'lastUpdated') return new Date().toISOString();
    return st[h] !== undefined ? st[h] : '';
  }));

  const allRows = keepRows.concat(newRows);
  sheet.getRange(2, 1, Math.max(allRows.length, 1), headers.length).clearContent();
  if (allRows.length > 0) {
    sheet.getRange(2, 1, allRows.length, headers.length).setValues(allRows);
  }
}

function uploadPhoto_(photo, driveFolderId) {
  const bytes = Utilities.base64Decode(photo.base64);
  const blob = Utilities.newBlob(bytes, photo.mimeType || 'image/jpeg');

  // {building}_{floorIdx}_{stationID}_{type}.jpg — matches the current
  // station-ID filename scheme per the doc's naming convention.
  const fileName = [photo.buildingName || 'Site', photo.floorIndex || '0', photo.stationId, photo.photoType]
    .join('_') + '.jpg';
  blob.setName(fileName);

  const folder = driveFolderId ? DriveApp.getFolderById(driveFolderId) : DriveApp.getRootFolder();
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return {
    fileId: file.getId(),
    // Fast thumbnail for in-app previews per the doc; full-res link is file.getUrl()
    thumbnailLink: 'https://lh3.googleusercontent.com/d/' + file.getId() + '=w400',
    fullLink: file.getUrl(),
  };
}

function logPhoto_(sheet, stationId, photoType, photoResult) {
  sheet.appendRow([stationId, photoType, photoResult.fileId, photoResult.fullLink, new Date().toISOString()]);
}

function jsonResponse_(obj, code) {
  // Apps Script Web Apps can't set a real HTTP status code on the response,
  // so callers should check the `error` field rather than the status.
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
