const { chromium } = require('playwright');
const TINY_JPEG_BASE64 = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

async function main() {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
  const results = [];
  function record(name, pass, detail) {
    results.push({ name, pass, detail });
    console.log((pass ? 'PASS' : 'FAIL') + ' — ' + name + (detail ? ': ' + JSON.stringify(detail) : ''));
  }

  async function newPage() {
    const page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', e => pageErrors.push(String(e)));
    await page.route('https://script.google.com/**', route => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ ok: true, photo: { fileId: 'MOCK_FILE_1', thumbnailLink: 'https://mock.example/thumb.jpg', fullLink: 'https://mock.example/full.jpg' } }),
    }));
    await page.goto('http://localhost:8792/app.html');
    return { page, pageErrors };
  }

  // TEST A: queue offline, go back online, queued photo actually attaches to the station
  {
    const { page, pageErrors } = await newPage();
    const state = await page.evaluate(async (jpegB64) => {
      window.alert = (m) => { (window.__alerts ||= []).push(m); };
      isOffline = true;
      S.building = 'Test Building';
      const floorId = uid();
      const st = { id: 'st-q1', letter: 'A', location: '', name: '', notes: '', bins: [], x: 50, y: 50, photos: [] };
      S.floors = [{ id: floorId, number: 1, planDataUrl: '', stations: [st], gateways: [], displays: [] }];
      curFloorId = floorId;
      curStationId = st.id;

      const dataUrl = 'data:image/jpeg;base64,' + jpegB64;
      processStationPhotoData(dataUrl, 'offline_test.jpg');
      const queueAfterOfflineAdd = JSON.parse(JSON.stringify(S.photoQueue));

      isOffline = false;
      syncPhotoQueue();
      await new Promise(r => setTimeout(r, 300));

      return {
        queueAfterOfflineAdd,
        photosAfterSync: JSON.parse(JSON.stringify(st.photos)),
        queueAfterSync: JSON.parse(JSON.stringify(S.photoQueue)),
        alerts: window.__alerts || [],
      };
    }, TINY_JPEG_BASE64);

    record('queued entry captured stationId/floorId', state.queueAfterOfflineAdd.length === 1 && state.queueAfterOfflineAdd[0].stationId === 'st-q1', state.queueAfterOfflineAdd);
    record('reconnecting actually attaches the photo to the station (was previously silently dropped)',
      state.photosAfterSync.length === 1 && state.photosAfterSync[0].data === 'https://mock.example/thumb.jpg',
      state.photosAfterSync);
    record('queue is empty after successful sync', state.queueAfterSync.length === 0, state.queueAfterSync);
    record('user is told a station photo was synced', state.alerts.some(a => /1 station photo/.test(a)), state.alerts);
    record('no page errors', pageErrors.length === 0, pageErrors);
    await page.close();
  }

  // TEST B: station deleted while its photo was queued offline — must report the miss, not claim false success
  {
    const { page, pageErrors } = await newPage();
    const state = await page.evaluate(async (jpegB64) => {
      window.alert = (m) => { (window.__alerts ||= []).push(m); };
      isOffline = true;
      S.building = 'Test Building';
      const floorId = uid();
      const st = { id: 'st-q2', letter: 'B', location: '', name: '', notes: '', bins: [], x: 50, y: 50, photos: [] };
      S.floors = [{ id: floorId, number: 1, planDataUrl: '', stations: [st], gateways: [], displays: [] }];
      curFloorId = floorId;
      curStationId = st.id;
      processStationPhotoData('data:image/jpeg;base64,' + jpegB64, 'x.jpg');

      // Station gets deleted before the user ever reconnects
      S.floors[0].stations = [];

      isOffline = false;
      syncPhotoQueue();
      await new Promise(r => setTimeout(r, 200));
      return { alerts: window.__alerts || [], queueAfter: S.photoQueue };
    }, TINY_JPEG_BASE64);

    record('deleted-station case: queue drained (not stuck forever)', state.queueAfter.length === 0, state.queueAfter);
    record('deleted-station case: user is told about the miss, not a false success', state.alerts.some(a => /could not be attached/.test(a)), state.alerts);
    record('no page errors', pageErrors.length === 0, pageErrors);
    await page.close();
  }

  // TEST C: automatic reconnect with an EMPTY queue must not show any alert
  {
    const { page, pageErrors } = await newPage();
    const state = await page.evaluate(async () => {
      window.alert = (m) => { (window.__alerts ||= []).push(m); };
      S.photoQueue = [];
      syncPhotoQueue(); // simulates the automatic window 'online' listener firing with nothing queued
      return { alerts: window.__alerts || [] };
    });
    record('empty queue: no "No photos to sync" popup on automatic reconnect', state.alerts.length === 0, state.alerts);
    record('no page errors', pageErrors.length === 0, pageErrors);
    await page.close();
  }

  // TEST D: context photo queue behavior is unchanged (existing feature, must not regress)
  {
    const { page, pageErrors } = await newPage();
    const state = await page.evaluate(async () => {
      window.alert = (m) => { (window.__alerts ||= []).push(m); };
      S.contextPhotos = [];
      S.photoQueue = [{ type: 'context', location: 'Building', dataUrl: 'data:image/jpeg;base64,x', description: 'front entrance', timestamp: Date.now() }];
      syncPhotoQueue();
      return { contextPhotos: S.contextPhotos, alerts: window.__alerts || [] };
    });
    record('context photo queue still works unchanged', state.contextPhotos.length === 1 && state.contextPhotos[0].description === 'front entrance', state.contextPhotos);
    record('user told about the context photo sync', state.alerts.some(a => /1 context photo/.test(a)), state.alerts);
    record('no page errors', pageErrors.length === 0, pageErrors);
    await page.close();
  }

  await browser.close();
  const failed = results.filter(r => !r.pass);
  console.log('\n=== ' + (results.length - failed.length) + '/' + results.length + ' PASSED ===');
  if (failed.length) process.exit(1);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
