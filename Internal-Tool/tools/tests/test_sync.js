const { chromium } = require('playwright');

// A valid 1x1 red JPEG, used as the "photo bytes" round-tripped through the mocks.
const TINY_JPEG_BASE64 = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

const dataUrlToBase64 = (dataUrl) => dataUrl.split(',')[1];

async function main() {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
  const results = [];

  // ── Shared page setup: intercept the Apps Script URL so we never touch the real backend ──
  async function newPage({ mockMode = 'success', offline = false } = {}) {
    const page = await browser.newPage();
    const pageErrors = [];
    const syncCalls = [];
    page.on('pageerror', e => pageErrors.push(String(e)));
    page.on('console', m => { if (/\[SYNC\]/.test(m.text())) syncCalls.push(m.text()); });

    await page.route('https://script.google.com/**', async route => {
      const req = route.request();
      const url = new URL(req.url());
      if (mockMode === 'network-fail') {
        await route.abort('failed');
        return;
      }
      if (req.method() === 'POST') {
        const body = JSON.parse(req.postData());
        if (mockMode === 'server-error') {
          return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ error: 'mock server error' }) });
        }
        return route.fulfill({
          status: 200, contentType: 'application/json',
          body: JSON.stringify({
            ok: true, stationsWritten: body.stations.length,
            photo: body.photo ? { fileId: 'MOCK_FILE_1', thumbnailLink: 'https://mock.example/thumb.jpg', fullLink: 'https://mock.example/full.jpg' } : null,
          }),
        });
      }
      if (url.searchParams.get('action') === 'getPhoto') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, fileId: url.searchParams.get('fileId'), mimeType: 'image/jpeg', base64: TINY_JPEG_BASE64 }) });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ error: 'unhandled mock route' }) });
    });

    await page.goto('http://localhost:8792/app.html');
    await page.evaluate((off) => { isOffline = off; }, offline);
    return { page, pageErrors, syncCalls };
  }

  function record(name, pass, detail) {
    results.push({ name, pass, detail });
    console.log((pass ? 'PASS' : 'FAIL') + ' — ' + name + (detail ? ': ' + JSON.stringify(detail) : ''));
  }

  // ── TEST 1: add a photo to an EXISTING station (processStationPhotoData path) ──
  {
    const { page, pageErrors } = await newPage();
    const state = await page.evaluate(async (jpegB64) => {
      S.building = 'Test Building';
      const floorId = uid();
      const st = { id: 'st-existing', letter: 'A', location: '', name: '', notes: '', bins: [], x: 50, y: 50, photos: [] };
      S.floors = [{ id: floorId, number: 1, planDataUrl: '', stations: [st], gateways: [], displays: [] }];
      curFloorId = floorId;
      curStationId = st.id;

      const dataUrl = 'data:image/jpeg;base64,' + jpegB64;
      processStationPhotoData(dataUrl, 'test.jpg');
      const immediately = JSON.parse(JSON.stringify(st.photos));

      // wait for the async sync/eviction to land
      await new Promise(r => setTimeout(r, 300));
      const afterSync = JSON.parse(JSON.stringify(st.photos));
      return { immediately, afterSync };
    }, TINY_JPEG_BASE64);

    record('existing-station photo is a real data URL immediately after add',
      state.immediately[0].data.startsWith('data:image/jpeg;base64,'));
    record('existing-station photo evicted to Drive link after sync confirms',
      state.afterSync[0].data === 'https://mock.example/thumb.jpg' && state.afterSync[0].driveFileId === 'MOCK_FILE_1' && state.afterSync[0].synced === true,
      state.afterSync[0]);
    record('no page errors during existing-station photo add', pageErrors.length === 0, pageErrors);
    await page.close();
  }

  // ── TEST 2: create a NEW station WITH a photo via the Create Station modal path ──
  {
    const { page, pageErrors } = await newPage();
    const state = await page.evaluate(async (jpegB64) => {
      S.building = 'Test Building';
      S.selectedStreams = [{ stream: 'Trash' }];
      const floorId = uid();
      S.floors = [{ id: floorId, number: 1, planDataUrl: '', stations: [], gateways: [], displays: [] }];
      curFloorId = floorId;

      // Simulate opening the modal + picking bins + attaching a photo, then confirming
      openAddStation(false);
      document.getElementById('new-st-letter').value = 'A';
      document.getElementById('new-st-name').value = 'Test Station';
      stationCreationBins.forEach(b => { if (b.scale === 'Medium') b.selected = true; });
      stationCreationPhoto = { data: 'data:image/jpeg;base64,' + jpegB64, name: 'creation.jpg', timestamp: new Date().toISOString() };

      confirmStationCreation();
      const f = S.floors[0];
      const created = f.stations[0];
      const immediately = created ? JSON.parse(JSON.stringify(created.photos)) : null;

      await new Promise(r => setTimeout(r, 300));
      const afterSync = created ? JSON.parse(JSON.stringify(created.photos)) : null;
      return { stationCount: f.stations.length, immediately, afterSync, stationCreationPhotoClearedAfter: stationCreationPhoto };
    }, TINY_JPEG_BASE64);

    record('exactly one station created', state.stationCount === 1, state.stationCount);
    record('created station has the attached photo immediately', !!(state.immediately && state.immediately.length === 1 && state.immediately[0].data.startsWith('data:')), state.immediately);
    record('created station photo evicted to Drive link after sync', !!(state.afterSync && state.afterSync[0].data === 'https://mock.example/thumb.jpg'), state.afterSync);
    record('stationCreationPhoto cleared after creation', state.stationCreationPhotoClearedAfter === null, state.stationCreationPhotoClearedAfter);
    record('no page errors during station creation with photo', pageErrors.length === 0, pageErrors);
    await page.close();
  }

  // ── TEST 3: offline behavior — processStationPhotoData() routes to the app's
  // PRE-EXISTING offline photo queue (queueOfflinePhoto()) instead of pushing into
  // st.photos at all when isOffline. That means syncStationPhotoToBackend() is never
  // even reached on this path — the `isOffline` guard inside it is dead-code-safe
  // redundancy, not a load-bearing check. Verifying the actual behavior: no crash,
  // no photo pushed to st.photos, and (real gap, noted in BLOCKERS.md, not fixed
  // here) no [SYNC] call either — an offline-queued photo, once the existing
  // syncPhotoQueue() mechanism sends it on reconnect, does NOT go through Drive
  // sync/eviction; it stays local indefinitely.
  {
    const { page, pageErrors, syncCalls } = await newPage({ offline: true });
    const state = await page.evaluate(async (jpegB64) => {
      window.alert = () => {}; // queueOfflinePhoto() alerts; suppress for the test
      S.building = 'Test Building';
      const floorId = uid();
      const st = { id: 'st-offline', letter: 'A', location: '', name: '', notes: '', bins: [], x: 50, y: 50, photos: [] };
      S.floors = [{ id: floorId, number: 1, planDataUrl: '', stations: [st], gateways: [], displays: [] }];
      curFloorId = floorId;
      curStationId = st.id;
      const dataUrl = 'data:image/jpeg;base64,' + jpegB64;
      processStationPhotoData(dataUrl, 'test.jpg');
      await new Promise(r => setTimeout(r, 300));
      return { photos: JSON.parse(JSON.stringify(st.photos)), offlineQueueLength: (window.offlinePhotoQueue || []).length };
    }, TINY_JPEG_BASE64);

    record('offline: st.photos left empty (queued elsewhere, existing behavior)', state.photos.length === 0, state.photos);
    record('offline: no [SYNC] network attempt logged (unreachable on this path)', syncCalls.length === 0, syncCalls);
    record('no page errors while offline', pageErrors.length === 0, pageErrors);
    await page.close();
  }

  // ── TEST 4: sync network failure — local copy must be preserved, no crash ──
  {
    const { page, pageErrors, syncCalls } = await newPage({ mockMode: 'network-fail' });
    const state = await page.evaluate(async (jpegB64) => {
      S.building = 'Test Building';
      const floorId = uid();
      const st = { id: 'st-fail', letter: 'A', location: '', name: '', notes: '', bins: [], x: 50, y: 50, photos: [] };
      S.floors = [{ id: floorId, number: 1, planDataUrl: '', stations: [st], gateways: [], displays: [] }];
      curFloorId = floorId;
      curStationId = st.id;
      const dataUrl = 'data:image/jpeg;base64,' + jpegB64;
      processStationPhotoData(dataUrl, 'test.jpg');
      await new Promise(r => setTimeout(r, 300));
      return JSON.parse(JSON.stringify(st.photos));
    }, TINY_JPEG_BASE64);

    record('sync failure: local copy preserved', state[0].data.startsWith('data:image/jpeg;base64,'), state[0].data.slice(0, 30));
    record('sync failure: a [SYNC] warning was logged (not silently ignored)', syncCalls.some(s => /failed/i.test(s)), syncCalls);
    record('no page errors on sync network failure', pageErrors.length === 0, pageErrors);
    await page.close();
  }

  // ── TEST 5: server responds but without a valid photo result — must not evict ──
  {
    const { page, pageErrors, syncCalls } = await newPage({ mockMode: 'server-error' });
    const state = await page.evaluate(async (jpegB64) => {
      S.building = 'Test Building';
      const floorId = uid();
      const st = { id: 'st-servererr', letter: 'A', location: '', name: '', notes: '', bins: [], x: 50, y: 50, photos: [] };
      S.floors = [{ id: floorId, number: 1, planDataUrl: '', stations: [st], gateways: [], displays: [] }];
      curFloorId = floorId;
      curStationId = st.id;
      const dataUrl = 'data:image/jpeg;base64,' + jpegB64;
      processStationPhotoData(dataUrl, 'test.jpg');
      await new Promise(r => setTimeout(r, 300));
      return JSON.parse(JSON.stringify(st.photos));
    }, TINY_JPEG_BASE64);

    record('server error response: local copy preserved (not evicted on bad response)', state[0].data.startsWith('data:image/jpeg;base64,'), state[0].data.slice(0, 30));
    record('server error response: a [SYNC] warning was logged', syncCalls.length > 0, syncCalls);
    record('no page errors on server error response', pageErrors.length === 0, pageErrors);
    await page.close();
  }

  // ── TEST 6: export path resolves an EVICTED photo back to real bytes (resolvePhotoDataUrl / getPhoto) ──
  {
    const { page, pageErrors } = await newPage();
    const state = await page.evaluate(async (jpegB64) => {
      S.building = 'Test Building'; S.date = '2026-09-12'; S.selectedStreams = [];
      const floorId = uid();
      // Simulate a photo that was ALREADY synced+evicted (as if from a prior session)
      const st = { id: 'st-evicted', letter: 'A', location: '', name: '', notes: '', bins: [], x: 50, y: 50,
        photos: [{ data: 'https://mock.example/thumb.jpg', driveFileId: 'MOCK_FILE_1', synced: true, name: 'x.jpg', timestamp: new Date().toISOString() }] };
      S.floors = [{ id: floorId, number: 1, planDataUrl: '', stations: [st], gateways: [], displays: [] }];
      curFloorId = floorId;

      const photos = await collectAllPhotos();
      const resolved = photos.find(p => p.type === 'Station');
      return { resolvedDataUrl: resolved ? resolved.data : null };
    }, TINY_JPEG_BASE64);

    const expectedDataUrl = 'data:image/jpeg;base64,' + TINY_JPEG_BASE64;
    record('collectAllPhotos() resolves an evicted photo back to real image bytes via getPhoto',
      state.resolvedDataUrl === expectedDataUrl,
      { got: state.resolvedDataUrl && state.resolvedDataUrl.slice(0, 40), expected: expectedDataUrl.slice(0, 40) });
    record('no page errors resolving evicted photo for export', pageErrors.length === 0, pageErrors);
    await page.close();
  }

  // ── TEST 7: getPhoto itself fails at export time — must fall back to the link, not throw ──
  {
    const { page, pageErrors } = await newPage({ mockMode: 'network-fail' });
    const state = await page.evaluate(async () => {
      S.building = 'Test Building'; S.date = '2026-09-12'; S.selectedStreams = [];
      const floorId = uid();
      const st = { id: 'st-evicted2', letter: 'A', location: '', name: '', notes: '', bins: [], x: 50, y: 50,
        photos: [{ data: 'https://mock.example/thumb.jpg', driveFileId: 'MOCK_FILE_1', synced: true, name: 'x.jpg', timestamp: new Date().toISOString() }] };
      S.floors = [{ id: floorId, number: 1, planDataUrl: '', stations: [st], gateways: [], displays: [] }];
      curFloorId = floorId;
      const photos = await collectAllPhotos();
      const resolved = photos.find(p => p.type === 'Station');
      return { resolvedDataUrl: resolved ? resolved.data : null };
    });

    record('getPhoto failure at export falls back to the Drive link (degrades, does not throw)',
      state.resolvedDataUrl === 'https://mock.example/thumb.jpg', state.resolvedDataUrl);
    record('no page errors when getPhoto fails during export', pageErrors.length === 0, pageErrors);
    await page.close();
  }

  await browser.close();

  const failed = results.filter(r => !r.pass);
  console.log('\n=== ' + (results.length - failed.length) + '/' + results.length + ' PASSED ===');
  if (failed.length) {
    console.log('FAILURES:');
    failed.forEach(f => console.log(' - ' + f.name + ': ' + JSON.stringify(f.detail)));
    process.exit(1);
  }
}

main().catch(e => { console.error('TEST HARNESS ERROR:', e); process.exit(1); });
