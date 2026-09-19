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
  const TOKEN_VALUE = '123'; // <-- must match SYNC_TOKEN in INTERNAL_Site_Visit_Tool_v3.html
  PropertiesService.getScriptProperties().setProperty('SHARED_SECRET', TOKEN_VALUE);
  Logger.log('Token set.');
}

function checkToken_(token) {
  const expected = PropertiesService.getScriptProperties().getProperty('SHARED_SECRET');
  return expected && token === expected;
}

// ── GET: loadProject (default) or getPhoto (?action=getPhoto&fileId=...) ──
// ?sheetId=...&token=...&floorId=...   (sheetId is accepted but this script is
// bound to one sheet in the POC; a later multi-tenant version would open by ID)
//
// getPhoto exists because the client evicts a synced photo's local base64 copy
// once it's confirmed uploaded (that's the whole point — it's what frees the
// local storage that was crashing the app), replacing it with just a Drive
// thumbnail link. The Excel/zip export needs the real bytes back at export
// time. A direct browser fetch() to the Drive thumbnail/file URL usually can't
// read the response (Drive/googleusercontent don't send permissive CORS
// headers for arbitrary origins), so the client re-fetches through this same
// Apps Script endpoint instead, which has no such restriction.
function doGet(e) {
  const token = e.parameter.token;
  if (!checkToken_(token)) {
    return jsonResponse_({ error: 'invalid token' }, 401);
  }

  if (e.parameter.action === 'getPhoto') {
    return handleGetPhoto_(e);
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
  let buildingFolderResult = null;
  if (body.photo) {
    // Each building gets its own subfolder under the shared parent folder the
    // client points at (driveFolderId), created once and reused on every
    // later sync — found by name, so the client never has to remember an id.
    const buildingName = body.photo.buildingName || body.buildingName || 'Untitled Building';
    const buildingFolder = getOrCreateBuildingFolder_(body.driveFolderId, buildingName);
    buildingFolderResult = { id: buildingFolder.getId(), url: buildingFolder.getUrl() };
    photoResult = uploadPhoto_(body.photo, buildingFolder.getId());
    logPhoto_(ss.getSheetByName('Photos'), body.photo.stationId, body.photo.photoType, photoResult);
  }

  return jsonResponse_({ ok: true, stationsWritten: body.stations.length, photo: photoResult, buildingFolder: buildingFolderResult });
}

// Finds (by name) or creates a subfolder for this building inside the shared
// parent photos folder, so every sync for the same building lands in the same
// place without the client needing to store/manage a folder id itself.
function getOrCreateBuildingFolder_(parentFolderId, buildingName) {
  const parent = parentFolderId ? DriveApp.getFolderById(parentFolderId) : DriveApp.getRootFolder();
  const safeName = (buildingName || 'Untitled Building').toString().trim() || 'Untitled Building';
  const existing = parent.getFoldersByName(safeName);
  if (existing.hasNext()) return existing.next();
  const created = parent.createFolder(safeName);
  created.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return created;
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

  // {Building}_F{floor}_{StationLetter}_Photo{n}.jpg — matches the same
  // station-linked naming already used by the app's own Excel/zip export
  // (see collectAllPhotos() in the main tool: 03_Station_F{floor}_{letter}_
  // Photo{n}.jpg), so a Drive file can be matched back to its station and
  // photo number at a glance instead of by the opaque internal station id.
  // Falls back to the old {building}_{floorIdx}_{stationId}_{type} scheme
  // if an older client sends a request without stationLetter/photoIndex.
  const fileName = photo.stationLetter
    ? [photo.buildingName || 'Site', 'F' + (photo.floorIndex != null ? photo.floorIndex : '0'), photo.stationLetter, 'Photo' + (photo.photoIndex || 1)].join('_') + '.jpg'
    : [photo.buildingName || 'Site', photo.floorIndex || '0', photo.stationId, photo.photoType].join('_') + '.jpg';
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

function handleGetPhoto_(e) {
  const fileId = e.parameter.fileId;
  if (!fileId) {
    return jsonResponse_({ error: 'fileId is required' }, 400);
  }
  try {
    const file = DriveApp.getFileById(fileId);
    const blob = file.getBlob();
    return jsonResponse_({
      ok: true,
      fileId,
      mimeType: blob.getContentType(),
      base64: Utilities.base64Encode(blob.getBytes()),
    });
  } catch (err) {
    return jsonResponse_({ error: 'could not read file: ' + err }, 404);
  }
}

function jsonResponse_(obj, code) {
  // Apps Script Web Apps can't set a real HTTP status code on the response,
  // so callers should check the `error` field rather than the status.
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
