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
// Tab order and schema mirror the Spare-it Batch Sample API reference sheets
// (Quick Start guide tab first, then Building List, then the data tabs) so
// this sheet reads the same way to anyone already familiar with that
// workflow, and can eventually feed the same import script.
const SHEET_SCHEMA_V2 = {
  'Instructions': ['Site Visit Sync — How This Sheet Works'],
  'Building List': ['Building Name', 'UUID', 'Address', 'Hauler', 'Auditor', 'Streams', 'Drive Folder ID'],
  'Stations': ['floorId', 'stationId', 'letter', 'stationName', 'floor', 'stream', 'occurrence', 'scale', 'accessory', 'accessory2', 'binId', 'bin', 'x', 'y', 'notes', 'lastUpdated', 'planLink'],
  'Gateways': ['floorId', 'gatewayId', 'label', 'location', 'tagId', 'x', 'y', 'notes', 'lastUpdated'],
  'Displays': ['floorId', 'displayId', 'label', 'location', 'tagId', 'x', 'y', 'notes', 'lastUpdated'],
  'Photos': ['stationId', 'photoType', 'driveFileId', 'shareableLink', 'timestamp', 'photoId'],
  'Floors': ['floorId', 'floor', 'building', 'planOriginalLink', 'planAnnotatedLink', 'pinsOnImage', 'stationsInSheet', 'pinnedInSheet', 'check', 'lastUpdated'],
};
const SHEET_TAB_ORDER = ['Instructions', 'Building List', 'Stations', 'Gateways', 'Displays', 'Photos', 'Floors'];

const INSTRUCTIONS_TEXT = [
  ['📋 Site Visit Sync — How This Sheet Works'],
  [''],
  ['This sheet is written to automatically by the Site Visit Tool app as a site visit'],
  ['happens — station, gateway, display, and photo data all land here in near real time.'],
  ['You should not need to edit these tabs by hand during a visit.'],
  [''],
  ['Tabs:'],
  ['  • Building List — one row per building this sheet has ever synced, with the'],
  ['    Drive folder that building\'s photos are stored under.'],
  ['  • Stations — one row per bin. Columns follow the same BinID convention as'],
  ['    other Spare-it Batch Sample API sheets: Building code + Station + Stream'],
  ['    code + Occurrence + Scale, e.g. "5840L1T1s". Accessories are listed in'],
  ['    their own columns (up to 2), never folded into the BinID itself.'],
  ['  • Gateways / Displays — one row per device. A "tagId" column is reserved'],
  ['    for the physical asset tag Operations assigns after install; it is left'],
  ['    blank until that separate tagging workflow exists.'],
  ['  • Photos — every photo synced to Drive, with a direct link and sync status.'],
  [''],
  ['Full replace-per-floor model: every sync for a floor overwrites all of that'],
  ['floor\'s existing rows in Stations/Gateways/Displays with the current complete'],
  ['set from the app — this sheet is not additive, so editing rows here by hand'],
  ['will be overwritten by the next sync from the app.'],
];

function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  SHEET_TAB_ORDER.forEach(tabName => {
    let sheet = ss.getSheetByName(tabName);
    if (!sheet) sheet = ss.insertSheet(tabName);
    if (sheet.getLastRow() === 0) {
      if (tabName === 'Instructions') {
        sheet.getRange(1, 1, INSTRUCTIONS_TEXT.length, 1).setValues(INSTRUCTIONS_TEXT);
        sheet.setColumnWidth(1, 640);
      } else {
        const headers = SHEET_SCHEMA_V2[tabName];
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        sheet.setFrozenRows(1);
      }
    }
  });

  // Put tabs in the reference order (Instructions, Building List, then data tabs).
  SHEET_TAB_ORDER.forEach((tabName, i) => {
    const sheet = ss.getSheetByName(tabName);
    if (sheet) ss.setActiveSheet(sheet), ss.moveActiveSheet(i + 1);
  });

  // Remove legacy/default tabs that are empty and unused.
  ['Sheet1', 'Building'].forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (sheet && sheet.getLastRow() === 0) ss.deleteSheet(sheet);
  });

  Logger.log('Tabs created/verified in order: ' + SHEET_TAB_ORDER.join(', '));
}

// ── ONE-TIME MIGRATION (v1 → v2 schema) ─────────────────────────────────
// Run this once from the editor if this spreadsheet already has the old
// 4-tab schema (Building/Floors/Stations/Photos with the old Stations
// columns). It is destructive to the Stations tab's existing rows, since
// the column meanings changed entirely (bins-per-row instead of one row
// per station) — safe here because this is the test sheet, not production
// data. Building/Floors/Photos content is not touched beyond header/rename.
function migrateSheetsToV2() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Old 'Building' tab (single-row-per-project) becomes 'Building List'
  // (one row per building, keyed by name) if it isn't already renamed.
  const oldBuilding = ss.getSheetByName('Building');
  if (oldBuilding && !ss.getSheetByName('Building List')) {
    oldBuilding.setName('Building List');
  }

  const stations = ss.getSheetByName('Stations');
  if (stations) {
    const currentHeaders = stations.getLastRow() > 0
      ? stations.getRange(1, 1, 1, stations.getLastColumn()).getValues()[0]
      : [];
    const isLegacy = currentHeaders.indexOf('binCode') !== -1 || currentHeaders.indexOf('accessory') === -1;
    if (isLegacy) {
      stations.clear();
      const headers = SHEET_SCHEMA_V2['Stations'];
      stations.getRange(1, 1, 1, headers.length).setValues([headers]);
      stations.setFrozenRows(1);
      Logger.log('Stations tab migrated to v2 schema (old rows cleared — column meaning changed).');
    }
  }

  // Create any new tabs (Building List, Gateways, Displays, Instructions)
  // that didn't exist before, and reorder everything.
  setupSheet();

  // Reconcile the Building List header if it was carried over from the old
  // single-row 'Building' tab shape.
  const buildingList = ss.getSheetByName('Building List');
  const blHeaders = buildingList.getRange(1, 1, 1, Math.max(buildingList.getLastColumn(), 1)).getValues()[0];
  if (blHeaders[0] !== 'Building Name') {
    buildingList.clear();
    const headers = SHEET_SCHEMA_V2['Building List'];
    buildingList.getRange(1, 1, 1, headers.length).setValues([headers]);
    buildingList.setFrozenRows(1);
  }

  Logger.log('Migration to v2 schema complete.');
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
  // 9 Oct 2026: serialise all writes. Two overlapping POSTs (photo + floor
  // data, or two retries) used to read-modify-write the same sheet ranges at
  // the same time; the later writer could silently drop the earlier one's rows.
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(25000)) return jsonResponse_({ error: 'server busy — retry' });
  try {
    return doPost_(e);
  } finally {
    lock.releaseLock();
  }
}

function doPost_(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse_({ error: 'invalid JSON body' }, 400);
  }

  if (!checkToken_(body.token)) {
    return jsonResponse_({ error: 'invalid token' }, 401);
  }
  if (body.action === 'floorPlan') {
    return handleFloorPlan_(body);
  }
  if (!body.floorId || !Array.isArray(body.stations)) {
    return jsonResponse_({ error: 'floorId and stations[] are required' }, 400);
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureColumns_(ss.getSheetByName('Stations'), ['planLink']); // self-heal older sheets
  writeSheetRows_(ss.getSheetByName('Stations'), body.floorId, body.stations);
  if (Array.isArray(body.gateways)) writeSheetRows_(ss.getSheetByName('Gateways'), body.floorId, body.gateways);
  if (Array.isArray(body.displays)) writeSheetRows_(ss.getSheetByName('Displays'), body.floorId, body.displays);

  let photoResult = null;
  let buildingFolderResult = null;
  if (body.photo) {
    // Each building gets its own subfolder under the shared parent folder the
    // client points at (driveFolderId), created once and reused on every
    // later sync — found by name, so the client never has to remember an id.
    const buildingName = body.photo.buildingName || body.buildingName || 'Untitled Building';
    const buildingFolder = getOrCreateBuildingFolder_(body.driveFolderId, buildingName);
    buildingFolderResult = { id: buildingFolder.getId(), url: buildingFolder.getUrl() };
    const photosSheet = ss.getSheetByName('Photos');

    // Bug fix (28 Sep 2026): idempotency check. A client retry after an
    // AMBIGUOUS failure (the fetch timed out or the connection dropped, but
    // this execution actually finished and created the Drive file) used to
    // have no way to tell "already uploaded" from "never attempted" — it
    // would just upload again, leaving two Drive files for one photo. The
    // client now sends a stable photoId with every attempt; if a Photos-tab
    // row already exists for that id with a Drive file recorded, reuse it
    // instead of uploading again.
    const photoIdKey = body.photo.photoId ? String(body.photo.photoId) : null;
    photoResult = photoIdKey ? findExistingPhotoUpload_(photosSheet, photoIdKey) : null;
    if (!photoResult) {
      photoResult = uploadPhoto_(body.photo, buildingFolder.getId());
      logPhoto_(photosSheet, photoIdKey, body.photo.stationId, body.photo.photoType, photoResult);
    }
    upsertBuildingListRow_(ss.getSheetByName('Building List'), buildingName, buildingFolder.getId(), body.building || {});
  }

  return jsonResponse_({
    ok: true,
    stationsWritten: body.stations.length,
    gatewaysWritten: Array.isArray(body.gateways) ? body.gateways.length : 0,
    displaysWritten: Array.isArray(body.displays) ? body.displays.length : 0,
    photo: photoResult,
    buildingFolder: buildingFolderResult,
  });
}

// Keeps one row per building in the 'Building List' tab, upserted by name —
// mirrors the reference sheets' Building List tab, but keyed by name instead
// of a platform UUID since this POC doesn't create platform records yet.
function upsertBuildingListRow_(sheet, buildingName, folderId, extra) {
  if (!sheet) return;
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const nameCol = headers.indexOf('Building Name');
  const rowIndex = data.slice(1).findIndex(row => row[nameCol] === buildingName);
  const row = headers.map(h => {
    if (h === 'Building Name') return buildingName;
    if (h === 'Drive Folder ID') return folderId;
    const key = { 'Address': 'address', 'Hauler': 'hauler', 'Auditor': 'auditor', 'Streams': 'streams' }[h];
    return key && extra[key] !== undefined ? extra[key] : '';
  });
  if (rowIndex === -1) {
    sheet.appendRow(row);
  } else {
    // Preserve UUID column (index 1) if it's already been filled in by hand/another process.
    const uuidCol = headers.indexOf('UUID');
    if (uuidCol !== -1) row[uuidCol] = data[rowIndex + 1][uuidCol] || '';
    sheet.getRange(rowIndex + 2, 1, 1, headers.length).setValues([row]);
  }
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
// Used for Stations, Gateways, and Displays alike — same full-replace-per-floor
// model in all three, just with different header sets. A production version
// would want per-row versioning/merge instead of a full replace.
function writeSheetRows_(sheet, floorId, rows) {
  if (!sheet) return;
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const floorIdCol = headers.indexOf('floorId');

  const keepRows = data.slice(1).filter(row => row[floorIdCol] !== floorId);

  const newRows = rows.map(r => headers.map(h => {
    if (h === 'floorId') return floorId;
    if (h === 'lastUpdated') return new Date().toISOString();
    return r[h] !== undefined ? r[h] : '';
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

// Finds (or, self-healingly, adds) the 'photoId' column on an existing
// Photos sheet — so a sheet from before this fix doesn't need a manual
// re-migration for idempotency to start working on it.
function ensurePhotoIdColumn_(sheet) {
  const headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
  let col = headers.indexOf('photoId');
  if (col === -1) {
    col = headers.length;
    sheet.getRange(1, col + 1).setValue('photoId');
  }
  return col; // 0-based
}

// Looks up a prior upload for this photoId. Returns the same shape
// uploadPhoto_ returns (fileId/thumbnailLink/fullLink) if a Drive file was
// already recorded for it, otherwise null (never attempted, or attempted
// but never confirmed — safe to upload).
function findExistingPhotoUpload_(sheet, photoId) {
  if (!sheet || !photoId) return null;
  ensurePhotoIdColumn_(sheet);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const photoIdCol = headers.indexOf('photoId');
  const fileIdCol = headers.indexOf('driveFileId');
  const linkCol = headers.indexOf('shareableLink');
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][photoIdCol]) === photoId && data[i][fileIdCol]) {
      return {
        fileId: data[i][fileIdCol],
        thumbnailLink: 'https://lh3.googleusercontent.com/d/' + data[i][fileIdCol] + '=w400',
        fullLink: data[i][linkCol],
        deduped: true,
      };
    }
  }
  return null;
}

function logPhoto_(sheet, photoId, stationId, photoType, photoResult) {
  ensurePhotoIdColumn_(sheet);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const values = new Array(headers.length).fill('');
  const set = (name, val) => { const c = headers.indexOf(name); if (c !== -1) values[c] = val; };
  set('stationId', stationId);
  set('photoType', photoType);
  set('driveFileId', photoResult.fileId);
  set('shareableLink', photoResult.fullLink);
  set('timestamp', new Date().toISOString());
  set('photoId', photoId || '');
  sheet.getRange(sheet.getLastRow() + 1, 1, 1, headers.length).setValues([values]);
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


// ── Floor plan -> Drive + Floors tab ─────────────────────────────────────
// Saves the floor plan image (kind 'original') or the plan with pins drawn on
// it (kind 'annotated') into the building's Drive folder and records the link
// in the Floors tab, together with a reconciliation of pins-on-image vs
// station rows in the Stations tab so a mismatch is visible at a glance.
function handleFloorPlan_(body) {
  if (!body.floorId || !body.base64) return jsonResponse_({ error: 'floorId and base64 are required' });
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const buildingName = body.buildingName || 'Untitled Building';
  const folder = getOrCreateBuildingFolder_(body.driveFolderId, buildingName);
  const kind = body.kind === 'original' ? 'original' : 'annotated';
  const fileName = [buildingName, 'F' + body.floorNumber, 'FloorPlan', kind].join('_') + '.jpg';

  // Replace (trash, not hard-delete) any earlier copy with the same name.
  const old = folder.getFilesByName(fileName);
  while (old.hasNext()) old.next().setTrashed(true);
  const blob = Utilities.newBlob(Utilities.base64Decode(body.base64), body.mimeType || 'image/jpeg', fileName);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  const link = file.getUrl();

  // Reconcile against the Stations tab.
  const stSheet = ss.getSheetByName('Stations');
  const data = stSheet.getDataRange().getValues();
  const h = data[0];
  const fCol = h.indexOf('floorId'), sCol = h.indexOf('stationId'), xCol = h.indexOf('x'), yCol = h.indexOf('y');
  const stationIds = {}, pinnedIds = {};
  data.slice(1).forEach(r => {
    if (r[fCol] !== body.floorId) return;
    stationIds[r[sCol]] = true;
    if (r[xCol] !== '' && r[yCol] !== '' && r[xCol] !== null && r[yCol] !== null) pinnedIds[r[sCol]] = true;
  });
  const stationsInSheet = Object.keys(stationIds).length;
  const pinnedInSheet = Object.keys(pinnedIds).length;

  const floors = getOrCreateFloorsSheet_(ss);
  const fh = floors.getRange(1, 1, 1, floors.getLastColumn()).getValues()[0];
  const fdata = floors.getDataRange().getValues();
  let rowIdx = -1;
  for (let i = 1; i < fdata.length; i++) if (fdata[i][fh.indexOf('floorId')] === body.floorId) { rowIdx = i; break; }
  const row = rowIdx === -1 ? new Array(fh.length).fill('') : fdata[rowIdx].slice();
  const set = (name, v) => { const c2 = fh.indexOf(name); if (c2 !== -1) row[c2] = v; };
  set('floorId', body.floorId); set('floor', body.floorNumber); set('building', buildingName);
  if (kind === 'original') set('planOriginalLink', link);
  let check = '';
  if (kind === 'annotated') {
    set('planAnnotatedLink', link);
    set('pinsOnImage', body.pinCount);
    set('stationsInSheet', stationsInSheet);
    set('pinnedInSheet', pinnedInSheet);
    check = (Number(body.pinCount) === pinnedInSheet && Number(body.stationCount) === stationsInSheet) ? 'OK' : 'CHECK';
    set('check', check);
  }
  set('lastUpdated', new Date().toISOString());
  if (rowIdx === -1) floors.appendRow(row);
  else floors.getRange(rowIdx + 1, 1, 1, fh.length).setValues([row]);

  upsertBuildingListRow_(ss.getSheetByName('Building List'), buildingName, folder.getId(), body.building || {});
  return jsonResponse_({ ok: true, link, kind, check, pinsOnImage: body.pinCount, stationsInSheet, pinnedInSheet });
}

// Finds/creates the Floors tab and adds any missing header columns, so an
// older sheet needs no manual migration.
function getOrCreateFloorsSheet_(ss) {
  let sheet = ss.getSheetByName('Floors');
  if (!sheet) sheet = ss.insertSheet('Floors');
  const want = SHEET_SCHEMA_V2['Floors'];
  const have = sheet.getLastRow() > 0 ? sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0] : [];
  want.forEach(name => {
    if (have.indexOf(name) === -1) { have.push(name); sheet.getRange(1, have.length).setValue(name); }
  });
  sheet.setFrozenRows(1);
  return sheet;
}

// Adds any missing header columns to the right of the existing ones.
function ensureColumns_(sheet, names) {
  if (!sheet) return;
  const have = sheet.getLastRow() > 0 ? sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0] : [];
  names.forEach(n => { if (have.indexOf(n) === -1) { have.push(n); sheet.getRange(1, have.length).setValue(n); } });
}
