/* DTM — 반응형 미리보기 도구 (의존성 없음) */
(() => {
  'use strict';

  // ── 기기 프리셋 ─────────────────────────────────────────────
  // bezel: 화면 바깥 테두리 두께(px). styles.css 의 .bezel--* 값과 맞춰야 합니다.
  const DEVICES = [
    {
      id: 'desktop', label: '데스크탑', rotatable: false, def: 'd1440',
      bezel: { x: 3, top: 33, bottom: 3 },
      presets: [
        { id: '4k', name: '4K UHD', w: 3840, h: 2160 },
        { id: 'qhd', name: 'QHD', w: 2560, h: 1440 },
        { id: 'fhd', name: 'Full HD', w: 1920, h: 1080 },
        { id: 'mbp14', name: 'MacBook Pro 14"', w: 1512, h: 982 },
        { id: 'd1440', name: 'Desktop', w: 1440, h: 900 },
        { id: 'd1280', name: 'Laptop', w: 1280, h: 800 },
      ],
    },
    {
      id: 'tablet', label: '태블릿', rotatable: true, def: 'ipad-air',
      bezel: { x: 15, top: 15, bottom: 15 },
      presets: [
        { id: 'ipad-mini', name: 'iPad mini', w: 744, h: 1133 },
        { id: 'ipad-air', name: 'iPad Air', w: 820, h: 1180 },
        { id: 'ipad-pro11', name: 'iPad Pro 11"', w: 834, h: 1210 },
        { id: 'ipad-pro13', name: 'iPad Pro 13"', w: 1032, h: 1376 },
        { id: 'tab-s9', name: 'Galaxy Tab S9', w: 800, h: 1280 },
        { id: 't768', name: 'Tablet 768', w: 768, h: 1024 },
      ],
    },
    {
      id: 'mobile', label: '모바일', rotatable: true, def: 'iphone16',
      bezel: { x: 12, top: 12, bottom: 12 },
      presets: [
        { id: 'iphone-se', name: 'iPhone SE', w: 375, h: 667 },
        { id: 'iphone16', name: 'iPhone 16', w: 393, h: 852 },
        { id: 'iphone16pm', name: 'iPhone 16 Pro Max', w: 440, h: 956 },
        { id: 'galaxy-s24', name: 'Galaxy S24', w: 360, h: 780 },
        { id: 'galaxy-s24u', name: 'Galaxy S24 Ultra', w: 384, h: 824 },
      ],
    },
  ];

  const DEFAULT_BP = 'sm:640, md:768, lg:1024, xl:1280, 2xl:1536'; // Tailwind 기본값
  const SPEEDS = [{ v: 150, label: '느리게' }, { v: 350, label: '보통' }, { v: 800, label: '빠르게' }];
  const ZOOMS = [['fit', '맞춤'], ['0.25', '25%'], ['0.5', '50%'], ['0.75', '75%'], ['1', '100%']];
  const QUICK = ['localhost:3000', 'localhost:3001', 'localhost:5173', 'localhost:8080'];
  const L = { pad: 28, gap: 28, head: 62, minW: 210 }; // .multi padding/gap, 기기 헤더(54)+간격(8), 기기 카드 최소 폭
  const M = { top: 36, bottom: 6, gutter: 40 };           // 리사이즈: 프레임 위(눈금자)/아래 여백, 좌우 핸들 여백
  const MAX_WIDTH = 3840;                                  // 4K
  const HOLD_END = 700, HOLD_BP = 650;                    // 재생 중 끝/브레이크포인트에서 멈추는 시간(ms)

  // UI 아이콘: Codex 로 만든 16×16 픽셀 SVG (assets/icons/*.svg → assets/icons.js)
  const ICONS = window.DTM_ICONS || {};
  const icon = (name) => `<span class="ico" aria-hidden="true">${ICONS[name] || ''}</span>`;
  // 기기 아이콘: Codex 로 생성한 픽셀 아트 PNG
  const deviceIcon = (id) => `<img class="dev-ico" src="assets/device-${id}.png" alt="" width="20" height="20">`;

  // ── 저장 ────────────────────────────────────────────────────
  const store = {
    get(k, d) { try { const v = localStorage.getItem('dtm:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('dtm:' + k, JSON.stringify(v)); } catch { /* 저장 불가 환경 무시 */ } },
  };

  const S = {
    url: store.get('url', ''),
    mode: store.get('mode', 'multi') === 'morph' ? 'morph' : 'multi',
    visible: { desktop: true, tablet: true, mobile: true, ...store.get('visible', {}) },
    preset: {},
    landscape: { tablet: false, mobile: false, ...store.get('landscape', {}) },
    zoom: store.get('zoom', 'fit'),
    sync: store.get('sync', true),
    recent: store.get('recent', []),
    bpText: store.get('bp', DEFAULT_BP),
    morph: { width: 1440, min: 320, max: 1440, speed: 350, hold: true, ...store.get('morph', {}) },
    capture: { folder: '', scope: 'viewport', overview: false, ...store.get('capture', {}) },
  };
  const savedPreset = store.get('preset', {});
  for (const d of DEVICES) S.preset[d.id] = d.presets.some((p) => p.id === savedPreset[d.id]) ? savedPreset[d.id] : d.def;
  if (!DEVICES.some((d) => S.visible[d.id])) S.visible.desktop = true;
  if (!ZOOMS.some(([v]) => v === S.zoom)) S.zoom = 'fit';

  function save() {
    store.set('url', S.url); store.set('mode', S.mode); store.set('visible', S.visible);
    store.set('preset', S.preset); store.set('landscape', S.landscape); store.set('zoom', S.zoom);
    store.set('sync', S.sync); store.set('recent', S.recent); store.set('bp', S.bpText); store.set('morph', S.morph);
    store.set('capture', S.capture);
  }
  let saveTimer = 0;
  const saveSoon = () => { clearTimeout(saveTimer); saveTimer = setTimeout(save, 400); };

  // ── 런타임 상태 ─────────────────────────────────────────────
  const R = {
    proxyOrigin: null, // 동기화 프록시 주소 (node server.mjs 로 실행했을 때만)
    server: false,     // 로컬 서버(캡처 API) 사용 가능 여부
    capDir: '',        // 마지막으로 저장한 캡처 폴더
    origin: '',        // 미리보는 사이트 origin
    path: '/',         // 현재 경로 (pathname + search)
    frames: new Map(), // 기기 id → 프레임
    morph: null,       // 리사이즈 모드 프레임
    bps: [],
    ms: 0, cx: 0,      // 리사이즈 배율, 캔버스 중심 x
    playing: false, raf: 0, tween: 0, dir: -1, holdUntil: 0, lastT: 0, lastBp: undefined,
    toastTimer: 0,
  };

  const el = {};
  for (const id of [
    'urlForm', 'urlInput', 'recentUrls', 'reloadBtn', 'modeSeg', 'syncToggle', 'syncSwitch',
    'multiBar', 'chips', 'showAllBtn', 'zoomSelect',
    'morphBar', 'playBtn', 'speedSelect', 'holdBp', 'widthRange', 'rangeTicks', 'widthInput', 'bpBadge',
    'morphPresets', 'settings', 'minInput', 'maxInput', 'bpInput', 'bpReset',
    'stage', 'multi', 'morph', 'morphCanvas', 'rulerTicks', 'rulerSpan', 'pillW', 'pillBp', 'guides',
    'empty', 'quick', 'toast', 'themeBtn',
    'captureBtn', 'captureDlg', 'captureForm', 'capClose', 'capSetup', 'capFolder', 'capPick', 'capOverview', 'capOverviewRow',
    'capList', 'capResult', 'capDoneTitle', 'capDonePath', 'capFiles', 'capError', 'capSetupFoot', 'capResultFoot',
    'capCancel', 'capGo', 'capAgain', 'capOpen',
  ]) el[id] = document.getElementById(id);

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

  // ── 브레이크포인트 ─────────────────────────────────────────
  function parseBps(text) {
    const out = [];
    for (const part of String(text).split(/[,\n]/)) {
      const m = part.trim().match(/^(?:([\w-]+)\s*[:=]\s*)?(\d{2,4})(?:px)?$/i);
      if (m) out.push({ name: m[1] || m[2], w: Number(m[2]) });
    }
    out.sort((a, b) => a.w - b.w);
    return out.filter((b, i) => i === 0 || b.w !== out[i - 1].w);
  }
  function bpFor(w) {
    let cur = null;
    for (const b of R.bps) if (w >= b.w) cur = b;
    return cur;
  }
  const bpName = (b) => (b ? b.name : 'base');

  // ── URL & 프레임 로딩 ──────────────────────────────────────
  function normalizeUrl(raw) {
    let v = String(raw || '').trim();
    if (!v) return null;
    if (/^\d{2,5}$/.test(v)) v = 'http://localhost:' + v;
    else if (/^:\d{2,5}/.test(v)) v = 'http://localhost' + v;
    else if (!/^[a-z][a-z\d+.-]*:\/\//i.test(v)) {
      v = (/^(localhost|127\.|0\.0\.0\.0|192\.168\.|10\.|\[)/i.test(v) ? 'http://' : 'https://') + v;
    }
    try {
      const u = new URL(v);
      return /^https?:$/.test(u.protocol) ? u : null;
    } catch {
      return null;
    }
  }

  const useProxy = () => S.sync && !!R.proxyOrigin;
  const frameSrc = () => (useProxy() ? R.proxyOrigin : R.origin) + R.path;
  const directUrl = () => R.origin + R.path;
  const allFrames = () => [...R.frames.values(), R.morph];

  function displayedFrames() {
    if (!R.origin) return [];
    if (S.mode === 'morph') return [R.morph];
    return DEVICES.filter((d) => S.visible[d.id]).map((d) => R.frames.get(d.id));
  }

  function makeFrame(title) {
    const screen = document.createElement('div');
    screen.className = 'screen';
    const iframe = document.createElement('iframe');
    iframe.title = title;
    screen.append(iframe);
    const f = { screen, iframe, loaded: null, timer: 0 };
    iframe.addEventListener('load', () => {
      if (!f.loaded) return;
      screen.classList.remove('loading');
      clearTimeout(f.timer);
    });
    return f;
  }

  function loadFrame(f, src) {
    f.loaded = src;
    f.screen.classList.add('loading');
    clearTimeout(f.timer);
    f.timer = setTimeout(() => f.screen.classList.remove('loading'), 15000);
    f.iframe.src = src;
  }

  // 화면에 보이는 프레임 중 주소가 바뀐 것만 다시 불러옵니다. 숨겨진 프레임은 보일 때 갱신됩니다.
  function refreshFrames(force = false) {
    const src = frameSrc();
    for (const f of displayedFrames()) if (force || f.loaded !== src) loadFrame(f, src);
  }

  function reloadAll() {
    if (!R.origin) return;
    for (const f of allFrames()) f.loaded = null;
    refreshFrames(true);
    toast('새로고침');
  }

  async function openUrl(raw, { remember = true } = {}) {
    const u = normalizeUrl(raw);
    if (!u) { toast('올바른 주소를 입력해 주세요'); return; }
    R.origin = u.origin;
    R.path = u.pathname + u.search;
    if (remember) {
      S.recent = [u.origin + R.path, ...S.recent.filter((x) => x !== u.origin + R.path)].slice(0, 8);
      renderRecent();
    }
    if (useProxy()) await pushProxyTarget();
    for (const f of allFrames()) f.loaded = null;
    setPath(R.path);
    renderVisibility();
    layout();
    refreshFrames(true);
  }

  // 현재 경로가 바뀌었을 때 주소창·링크·저장 상태를 갱신
  function setPath(path) {
    R.path = path;
    S.url = directUrl();
    if (document.activeElement !== el.urlInput) el.urlInput.value = S.url;
    for (const f of R.frames.values()) {
      f.open.href = S.url;
      if (f.curl) f.curl.textContent = S.url.replace(/^https?:\/\//, '');
    }
    try { history.replaceState(null, '', `${location.pathname}?url=${encodeURIComponent(S.url)}`); } catch { /* file:// 등 */ }
    save();
  }

  function renderRecent() {
    el.recentUrls.innerHTML = S.recent.map((u) => `<option value="${esc(u)}"></option>`).join('');
    const list = [...new Set([...S.recent.slice(0, 3), ...QUICK.map((q) => 'http://' + q)])].slice(0, 6);
    el.quick.innerHTML = list.map((u, i) => `<button type="button" class="px-btn${i === 0 ? ' primary' : ''}" data-url="${esc(u)}">${esc(u.replace(/^https?:\/\//, ''))}${i === 0 ? icon('arrow-right') : ''}</button>`).join('');
  }

  // ── 동기화 프록시 ──────────────────────────────────────────
  async function initProxy() {
    if (!/^https?:$/.test(location.protocol)) return;
    // GitHub Pages 처럼 로컬 서버가 없는 곳에서는 찾지 않음 (동기화·캡처는 npm run dev 로 실행할 때만)
    if (!/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) return;
    try {
      const r = await fetch('/__dtm/info', { cache: 'no-store' });
      if (!r.ok) return;
      const info = await r.json();
      R.proxyOrigin = `${location.protocol}//${location.hostname}:${info.proxyPort}`;
      R.server = !!info.capture;
    } catch { /* 정적 파일로 열었을 때는 프록시 없음 */ }
  }

  async function pushProxyTarget() {
    try {
      const r = await fetch('/__dtm/target', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ origin: R.origin }),
      });
      if (!r.ok) throw new Error(String(r.status));
    } catch {
      R.proxyOrigin = null;
      updateSyncUi();
      toast('동기화 서버에 연결할 수 없어 일반 모드로 표시해요');
    }
  }

  function updateSyncUi() {
    const ok = !!R.proxyOrigin;
    el.syncToggle.disabled = !ok;
    el.syncToggle.checked = ok && S.sync;
    el.syncSwitch.classList.toggle('disabled', !ok);
    el.syncSwitch.title = ok
      ? '켜면 한 화면에서 스크롤하거나 페이지를 이동할 때 다른 기기 화면도 함께 따라옵니다'
      : '터미널에서 "node server.mjs"로 실행하면 사용할 수 있어요';
  }

  const frameByWindow = (win) => allFrames().find((f) => f.iframe.contentWindow === win);
  const post = (f, msg) => f.iframe.contentWindow?.postMessage({ __dtm: 1, ...msg }, R.proxyOrigin);

  // bridge.js(프록시가 사이트에 주입)가 보내는 메시지를 다른 기기 화면으로 중계
  window.addEventListener('message', (e) => {
    if (!R.proxyOrigin || e.origin !== R.proxyOrigin) return;
    const m = e.data;
    if (!m || m.__dtm !== 1) return;
    const src = frameByWindow(e.source);
    if (!src) return;

    if (m.type === 'scroll' && typeof m.ratio === 'number') {
      for (const f of displayedFrames()) if (f !== src) post(f, { type: 'scrollTo', ratio: m.ratio });
    } else if ((m.type === 'hello' || m.type === 'nav') && typeof m.path === 'string' && m.path.startsWith('/')) {
      src.loaded = R.proxyOrigin + m.path;
      if (m.path === R.path) return;
      setPath(m.path);
      for (const f of displayedFrames()) {
        if (f === src) continue;
        f.loaded = R.proxyOrigin + m.path;
        post(f, { type: 'navigate', path: m.path });
      }
    }
  });

  // ── 한눈에 보기 ────────────────────────────────────────────
  function dimsOf(d) {
    const p = d.presets.find((x) => x.id === S.preset[d.id]) || d.presets[0];
    return S.landscape[d.id] ? { w: p.h, h: p.w } : { w: p.w, h: p.h };
  }

  function buildDevices() {
    for (const d of DEVICES) {
      const f = makeFrame(`${d.label} 미리보기`);
      const root = document.createElement('section');
      root.className = `device device--${d.id}`;
      root.innerHTML = `
        <div class="device-head">
          <div class="dh-row">
            <button type="button" class="dh-title" title="${d.label}만 보기 / 다시 클릭하면 모두 보기">${deviceIcon(d.id)}<span>${d.label}</span></button>
            <span class="bp-chip" title="적용 중인 브레이크포인트"></span>
            <span class="dh-spacer"></span>
            ${d.rotatable ? `<button type="button" class="icon-btn" data-act="rotate" title="가로/세로 회전" aria-label="가로/세로 회전">${icon('rotate')}</button>` : ''}
            <a class="icon-btn" data-act="open" target="_blank" rel="noopener" title="새 탭에서 열기" aria-label="새 탭에서 열기">${icon('external')}</a>
            <button type="button" class="icon-btn" data-act="hide" title="숨기기" aria-label="${d.label} 숨기기">${icon('close')}</button>
          </div>
          <div class="dh-row dh-meta">
            <select aria-label="${d.label} 기종">${d.presets.map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select>
            <span class="dims"></span>
          </div>
        </div>
        <div class="bezel bezel--${d.id}">${d.id === 'desktop' ? '<div class="chrome"><i></i><i></i><i></i><span class="chrome-url"></span></div>' : ''}</div>`;
      root.querySelector('.bezel').append(f.screen);

      const q = (s) => root.querySelector(s);
      Object.assign(f, { d, root, bp: q('.bp-chip'), dims: q('.dims'), select: q('select'), open: q('[data-act=open]'), curl: q('.chrome-url') });
      f.select.value = S.preset[d.id];
      f.select.addEventListener('change', () => { S.preset[d.id] = f.select.value; save(); onDevicesChanged(); });
      q('.dh-title').addEventListener('click', () => solo(d.id));
      q('[data-act=hide]').addEventListener('click', () => toggleDevice(d.id));
      q('[data-act=rotate]')?.addEventListener('click', () => {
        S.landscape[d.id] = !S.landscape[d.id];
        save();
        onDevicesChanged();
      });
      R.frames.set(d.id, f);
      el.multi.append(root);
    }
  }

  function onDevicesChanged() {
    updateChips();
    buildMorphPresets();
    layout();
  }

  function buildChips() {
    el.chips.innerHTML = DEVICES.map((d, i) => `
      <div class="chip-group" data-id="${d.id}">
        <button type="button" class="chip" aria-pressed="false" title="${d.label} 보이기/숨기기 (Shift+${i + 1})">${deviceIcon(d.id)}<span>${d.label}</span><small></small></button>
        <button type="button" class="chip-only" title="${d.label}만 보기 (${i + 1})">단독</button>
      </div>`).join('');
    for (const g of el.chips.children) {
      const id = g.dataset.id;
      g.querySelector('.chip').addEventListener('click', () => toggleDevice(id));
      g.querySelector('.chip-only').addEventListener('click', () => solo(id, true));
    }
    updateChips();
  }

  function updateChips() {
    for (const g of el.chips.children) {
      const d = DEVICES.find((x) => x.id === g.dataset.id);
      g.querySelector('.chip').setAttribute('aria-pressed', String(!!S.visible[d.id]));
      g.querySelector('small').textContent = dimsOf(d).w;
    }
    el.showAllBtn.disabled = DEVICES.every((d) => S.visible[d.id]);
  }

  function toggleDevice(id) {
    if (S.visible[id] && DEVICES.filter((d) => S.visible[d.id]).length === 1) {
      toast('최소 한 기기는 보여야 해요');
      return;
    }
    S.visible[id] = !S.visible[id];
    afterVisibility();
  }

  // 단독 보기. 이미 그 기기만 보이는 중이면 다시 모두 보기로 돌아갑니다(force 제외).
  function solo(id, force = false) {
    const already = DEVICES.every((d) => S.visible[d.id] === (d.id === id));
    if (already && !force) return showAll();
    for (const d of DEVICES) S.visible[d.id] = d.id === id;
    afterVisibility();
  }

  function showAll() {
    for (const d of DEVICES) S.visible[d.id] = true;
    afterVisibility();
  }

  function afterVisibility() {
    save();
    updateChips();
    if (S.mode !== 'multi') return setMode('multi');
    renderVisibility();
    layout();
    refreshFrames();
  }

  // 모든 기기를 같은 배율로 줄여서(실제 크기 비율 유지) 화면 안에 들어오게 배치
  function layoutMulti() {
    const items = DEVICES.filter((d) => S.visible[d.id]).map((d) => ({ d, f: R.frames.get(d.id), ...dimsOf(d) }));
    for (const d of DEVICES) R.frames.get(d.id).root.hidden = !S.visible[d.id];
    if (!items.length) return;

    const W = el.stage.clientWidth - L.pad * 2;
    const H = el.stage.clientHeight - L.pad * 2;
    const fits = (s) => {
      let tw = L.gap * (items.length - 1);
      let mh = 0;
      for (const it of items) {
        tw += Math.max(L.minW, it.w * s + it.d.bezel.x * 2);
        mh = Math.max(mh, L.head + it.h * s + it.d.bezel.top + it.d.bezel.bottom);
      }
      return tw <= W && mh <= H;
    };

    let s;
    if (S.zoom !== 'fit') s = Number(S.zoom);
    else if (fits(1)) s = 1;
    else {
      let lo = 0.05, hi = 1;
      for (let i = 0; i < 24; i++) { const mid = (lo + hi) / 2; if (fits(mid)) lo = mid; else hi = mid; }
      s = lo;
    }

    for (const { d, f, w, h } of items) {
      const b = bpFor(w);
      f.root.style.width = `${Math.max(L.minW, w * s + d.bezel.x * 2)}px`;
      f.root.style.setProperty('--s', s);
      f.screen.style.width = `${w * s}px`;
      f.screen.style.height = `${h * s}px`;
      f.iframe.style.width = `${w}px`;
      f.iframe.style.height = `${h}px`;
      f.iframe.style.transform = `scale(${s})`;
      f.dims.textContent = `${w}×${h} · ${Math.round(s * 100)}%`;
      f.bp.textContent = bpName(b);
      f.bp.title = b ? `${b.name}: ${b.w}px 이상 스타일 적용 중` : '가장 작은 화면 스타일';
    }
  }

  // ── 리사이즈(모핑) 모드 ────────────────────────────────────
  function buildMorph() {
    const f = makeFrame('리사이즈 미리보기');
    const frame = document.createElement('div');
    frame.className = 'morph-frame';
    frame.append(f.screen);
    frame.insertAdjacentHTML('beforeend',
      '<div class="handle handle--l" data-side="-1" title="드래그해서 폭 조절"></div>' +
      '<div class="handle handle--r" data-side="1" title="드래그해서 폭 조절"></div>');
    el.morphCanvas.append(frame);
    f.frame = frame;
    R.morph = f;
    for (const h of frame.querySelectorAll('.handle')) bindHandle(h);
  }

  function bindHandle(h) {
    h.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      stopMotion();
      const side = Number(h.dataset.side);
      const x0 = e.clientX;
      const w0 = S.morph.width;
      h.setPointerCapture(e.pointerId);
      document.body.classList.add('is-dragging');
      // 프레임이 가운데 정렬이라 한쪽을 끌면 양쪽이 같이 움직입니다 → 이동량 x2
      const move = (ev) => setMorphWidth(w0 + (side * 2 * (ev.clientX - x0)) / R.ms);
      const end = () => {
        h.removeEventListener('pointermove', move);
        h.removeEventListener('pointerup', end);
        h.removeEventListener('pointercancel', end);
        document.body.classList.remove('is-dragging');
      };
      h.addEventListener('pointermove', move);
      h.addEventListener('pointerup', end);
      h.addEventListener('pointercancel', end);
    });
  }

  // 배율은 "최대 폭"을 기준으로 고정 → 폭이 줄어들 때 실제로 좁아지는 느낌이 그대로 보입니다
  function layoutMorph() {
    const f = R.morph;
    const cw = el.morphCanvas.clientWidth;
    const ch = el.morphCanvas.clientHeight;
    if (!cw || !ch) return;
    R.ms = Math.min(1, (cw - M.gutter * 2) / S.morph.max);
    R.cx = cw / 2;
    const sh = ch - M.top - M.bottom;
    f.iframe.style.height = `${sh / R.ms}px`;
    f.iframe.style.transform = `scale(${R.ms})`;
    renderGuides();
    applyMorphWidth();
  }

  function renderGuides() {
    const { min, max } = S.morph;
    const s = R.ms, cx = R.cx;
    const ticks = [], guides = [];
    for (const b of R.bps) {
      if (b.w > max) continue;
      const off = (b.w * s) / 2;
      ticks.push(
        `<i class="tick" data-w="${b.w}" style="left:${cx - off}px"></i>`,
        `<i class="tick" data-w="${b.w}" style="left:${cx + off}px"></i>`,
        `<span class="tick-label" data-w="${b.w}" style="left:${cx + off}px">${esc(b.name)}<em>${b.w}</em></span>`,
      );
      guides.push(`<i class="guide" style="left:${cx - off}px"></i><i class="guide" style="left:${cx + off}px"></i>`);
    }
    el.rulerTicks.innerHTML = ticks.join('');
    el.guides.innerHTML = guides.join('');
    el.rangeTicks.innerHTML = R.bps
      .filter((b) => b.w >= min && b.w <= max)
      .map((b) => `<i style="left:${((b.w - min) / (max - min)) * 100}%" title="${esc(b.name)} ${b.w}px"></i>`)
      .join('');
  }

  function applyMorphWidth() {
    const f = R.morph;
    if (!R.ms) return;
    const w = Math.round(S.morph.width);
    const s = R.ms;
    f.screen.style.width = `${w * s}px`;
    f.iframe.style.width = `${w}px`;
    el.rulerSpan.style.left = `${R.cx - (w * s) / 2}px`;
    el.rulerSpan.style.width = `${w * s}px`;

    const bp = bpFor(w);
    const name = bpName(bp);
    el.pillW.textContent = `${w}px`;
    el.pillBp.textContent = name;
    el.bpBadge.textContent = name;
    el.widthRange.value = w;
    if (document.activeElement !== el.widthInput) el.widthInput.value = w;
    for (const t of el.rulerTicks.children) {
      const tw = Number(t.dataset.w);
      t.classList.toggle('in', tw <= w);
      t.classList.toggle('active', !!bp && tw === bp.w);
    }
    if (R.lastBp !== undefined && R.lastBp !== name) onBpCross(R.lastBp, name);
    R.lastBp = name;
  }

  function onBpCross(from, to) {
    restartAnim(el.bpBadge, 'pulse');
    restartAnim(R.morph.frame, 'flash');
    toast(`${from} → ${to}`);
    if (R.playing && S.morph.hold) R.holdUntil = performance.now() + HOLD_BP;
  }

  function restartAnim(node, cls) {
    node.classList.remove(cls);
    void node.offsetWidth; // 애니메이션 재시작
    node.classList.add(cls);
  }

  function setMorphWidth(w) {
    S.morph.width = clamp(w, S.morph.min, S.morph.max);
    applyMorphWidth();
    saveSoon();
  }

  // 재생: 최대 ↔ 최소 폭을 일정 속도로 왕복
  function play() {
    if (R.playing || !R.origin) return;
    cancelAnimationFrame(R.tween);
    const { width, min, max } = S.morph;
    if (width <= min + 1) R.dir = 1;
    else if (width >= max - 1) R.dir = -1;
    R.playing = true;
    R.lastT = 0;
    R.holdUntil = 0;
    R.raf = requestAnimationFrame(tick);
    updatePlayBtn();
  }

  function pause() {
    if (!R.playing) return;
    R.playing = false;
    cancelAnimationFrame(R.raf);
    updatePlayBtn();
  }

  function stopMotion() {
    pause();
    cancelAnimationFrame(R.tween);
  }

  function tick(t) {
    if (!R.playing) return;
    const dt = R.lastT ? Math.min(50, t - R.lastT) : 0;
    R.lastT = t;
    if (t >= R.holdUntil) {
      const { min, max, speed } = S.morph;
      let w = S.morph.width + (R.dir * speed * dt) / 1000;
      if (w <= min) { w = min; R.dir = 1; R.holdUntil = t + HOLD_END; }
      else if (w >= max) { w = max; R.dir = -1; R.holdUntil = t + HOLD_END; }
      setMorphWidth(w);
    }
    R.raf = requestAnimationFrame(tick);
  }

  // 특정 폭으로 부드럽게 이동
  function animateTo(target, dur = 700) {
    stopMotion();
    // 4K 처럼 최대 폭보다 넓은 기기로 이동하면 최대 폭을 늘려서 그대로 보여줌
    if (target > S.morph.max && target <= MAX_WIDTH) {
      S.morph.max = Math.round(target);
      el.maxInput.value = S.morph.max;
      R.lastBp = undefined;
      save();
      updateRange();
      layout();
      toast(`최대 폭을 ${S.morph.max}px 로 늘렸어요`);
    }
    const to = clamp(target, S.morph.min, S.morph.max);
    if (to !== target) toast(`범위(${S.morph.min}–${S.morph.max}px) 밖이라 ${Math.round(to)}px로 맞췄어요`);
    const from = S.morph.width;
    const t0 = performance.now();
    const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      setMorphWidth(from + (to - from) * ease(p));
      if (p < 1) R.tween = requestAnimationFrame(step);
    };
    R.tween = requestAnimationFrame(step);
  }

  function updatePlayBtn() {
    el.playBtn.innerHTML = R.playing ? `${icon('pause')}일시정지` : `${icon('play')}재생`;
    el.playBtn.title = `${R.playing ? '일시정지' : '재생'} (Space)`;
  }

  function buildMorphControls() {
    el.speedSelect.innerHTML = SPEEDS.map((s) => `<option value="${s.v}">${s.label}</option>`).join('');
    if (!SPEEDS.some((s) => s.v === S.morph.speed)) S.morph.speed = 350;
    el.speedSelect.value = String(S.morph.speed);
    el.holdBp.checked = S.morph.hold;
    el.minInput.value = S.morph.min;
    el.maxInput.value = S.morph.max;
    el.bpInput.value = S.bpText;
    updateRange();
    buildMorphPresets();
    updatePlayBtn();

    el.playBtn.addEventListener('click', () => (R.playing ? pause() : play()));
    el.speedSelect.addEventListener('change', () => { S.morph.speed = Number(el.speedSelect.value); save(); });
    el.holdBp.addEventListener('change', () => { S.morph.hold = el.holdBp.checked; save(); });
    el.widthRange.addEventListener('input', () => { stopMotion(); setMorphWidth(Number(el.widthRange.value)); });
    el.widthInput.addEventListener('change', () => {
      const v = Number(el.widthInput.value);
      if (Number.isFinite(v) && v > 0) animateTo(v);
    });
    el.widthInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') el.widthInput.blur(); });
    el.morphPresets.addEventListener('click', (e) => {
      const b = e.target.closest('[data-w]');
      if (b) animateTo(Number(b.dataset.w));
    });
    for (const input of [el.minInput, el.maxInput, el.bpInput]) input.addEventListener('change', applySettings);
    el.bpReset.addEventListener('click', () => { el.bpInput.value = DEFAULT_BP; applySettings(); });
    document.addEventListener('pointerdown', (e) => {
      if (el.settings.open && !el.settings.contains(e.target)) el.settings.open = false;
    });
  }

  function updateRange() {
    el.widthRange.min = S.morph.min;
    el.widthRange.max = S.morph.max;
    el.widthRange.value = Math.round(S.morph.width);
  }

  function buildMorphPresets() {
    el.morphPresets.innerHTML = DEVICES.map((d) => {
      const w = dimsOf(d).w;
      return `<button type="button" class="px-btn" data-w="${w}" title="${d.label} 폭(${w}px)으로 이동">${deviceIcon(d.id)}<small>${w}</small></button>`;
    }).join('');
  }

  function applySettings() {
    const min = clamp(parseInt(el.minInput.value, 10) || 320, 200, 2000);
    const max = clamp(parseInt(el.maxInput.value, 10) || 1440, min + 100, MAX_WIDTH);
    S.morph.min = min;
    S.morph.max = max;
    S.morph.width = clamp(S.morph.width, min, max);
    el.minInput.value = min;
    el.maxInput.value = max;

    const parsed = parseBps(el.bpInput.value);
    if (parsed.length) {
      S.bpText = el.bpInput.value.trim();
      R.bps = parsed;
    } else {
      toast('브레이크포인트 형식을 확인해 주세요 (예: md:768)');
      el.bpInput.value = S.bpText;
    }
    R.lastBp = undefined;
    save();
    updateRange();
    layout();
  }

  // ── 모드 & 화면 구성 ───────────────────────────────────────
  function setMode(mode) {
    S.mode = mode;
    if (mode !== 'morph') stopMotion();
    for (const b of el.modeSeg.querySelectorAll('button')) {
      const on = b.dataset.mode === mode;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', String(on));
    }
    save();
    renderVisibility();
    layout();
    refreshFrames();
  }

  function renderVisibility() {
    const has = !!R.origin;
    el.multiBar.hidden = S.mode !== 'multi';
    el.morphBar.hidden = S.mode !== 'morph';
    el.multi.hidden = !has || S.mode !== 'multi';
    el.morph.hidden = !has || S.mode !== 'morph';
    el.empty.hidden = has;
  }

  function layout() {
    if (!R.origin) return;
    if (S.mode === 'multi') layoutMulti();
    else layoutMorph();
  }

  // ── 기타 UI ────────────────────────────────────────────────
  function toast(msg) {
    el.toast.textContent = msg;
    el.toast.classList.add('show');
    clearTimeout(R.toastTimer);
    R.toastTimer = setTimeout(() => el.toast.classList.remove('show'), 1400);
  }

  function bindToolbar() {
    el.urlForm.addEventListener('submit', (e) => {
      e.preventDefault();
      el.urlInput.blur();
      openUrl(el.urlInput.value);
    });
    el.quick.addEventListener('click', (e) => {
      const b = e.target.closest('[data-url]');
      if (b) openUrl(b.dataset.url);
    });
    el.reloadBtn.addEventListener('click', reloadAll);
    el.modeSeg.addEventListener('click', (e) => {
      const b = e.target.closest('[data-mode]');
      if (b && b.dataset.mode !== S.mode) setMode(b.dataset.mode);
    });
    el.showAllBtn.addEventListener('click', showAll);
    el.zoomSelect.innerHTML = ZOOMS.map(([v, label]) => `<option value="${v}">${label}</option>`).join('');
    el.zoomSelect.value = S.zoom;
    el.zoomSelect.addEventListener('change', () => { S.zoom = el.zoomSelect.value; save(); layout(); });
    el.syncToggle.addEventListener('change', async () => {
      S.sync = el.syncToggle.checked;
      save();
      if (!R.origin) return;
      if (useProxy()) await pushProxyTarget();
      refreshFrames(); // 프록시 ↔ 직접 주소가 바뀌므로 다시 불러옴
      toast(S.sync ? '동기화 켜짐 — 스크롤·페이지 이동이 함께 움직여요' : '동기화 꺼짐');
    });
    el.themeBtn.addEventListener('click', () => setTheme(isDark() ? 'light' : 'dark'));
    updateThemeBtn();
  }

  // ── 테마 (라이트/다크) ─────────────────────────────────────
  const isDark = () => document.documentElement.dataset.theme === 'dark';
  function setTheme(theme) {
    if (theme === 'dark') document.documentElement.dataset.theme = 'dark';
    else delete document.documentElement.dataset.theme;
    store.set('theme', theme);
    updateThemeBtn();
  }
  function updateThemeBtn() {
    const dark = isDark();
    el.themeBtn.querySelector('.ico').innerHTML = ICONS[dark ? 'sun' : 'moon'] || '';
    el.themeBtn.title = dark ? '라이트 모드로 전환' : '다크 모드로 전환';
    el.themeBtn.setAttribute('aria-label', el.themeBtn.title);
  }

  function bindKeys() {
    document.addEventListener('keydown', (e) => {
      const t = e.target;
      if (/^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName) || t.isContentEditable) {
        if (e.key === 'Escape') t.blur();
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey || el.captureDlg.open) return;

      const idx = { Digit1: 0, Digit2: 1, Digit3: 2, Numpad1: 0, Numpad2: 1, Numpad3: 2 }[e.code];
      if (idx !== undefined) {
        e.preventDefault();
        const d = DEVICES[idx];
        if (S.mode === 'morph') animateTo(dimsOf(d).w);
        else if (e.shiftKey) toggleDevice(d.id);
        else solo(d.id);
        return;
      }

      const step = e.shiftKey ? 100 : 10;
      switch (e.key) {
        case '0': showAll(); break;
        case 'm': case 'M': case 'ㅡ': setMode(S.mode === 'multi' ? 'morph' : 'multi'); break;
        case 'r': case 'R': case 'ㄱ': reloadAll(); break;
        case 'c': case 'C': case 'ㅊ': e.preventDefault(); openCapture(); break;
        case '/': e.preventDefault(); el.urlInput.focus(); el.urlInput.select(); break;
        case ' ':
          if (S.mode !== 'morph') return;
          e.preventDefault();
          R.playing ? pause() : play();
          break;
        case 'ArrowLeft':
        case 'ArrowRight':
          if (S.mode !== 'morph') return;
          e.preventDefault();
          stopMotion();
          setMorphWidth(Math.round(S.morph.width) + (e.key === 'ArrowLeft' ? -step : step));
          break;
        default:
      }
    });
  }


  // ── 캡처 ───────────────────────────────────────────────────
  // 실제 캡처는 로컬 서버(capture.mjs)가 보이지 않는 Chrome 으로 각 기기 크기 그대로 찍습니다.
  async function api(path, body) {
    const r = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || `요청 실패 (${r.status})`);
    return data;
  }

  // 지금 화면에 보이는 것 = 캡처할 것
  function captureShots() {
    if (S.mode === 'morph') {
      const w = Math.round(S.morph.width);
      const h = Math.round(parseFloat(R.morph.iframe.style.height) || 900);
      const b = bpFor(w);
      return [{ name: 'resize', label: `리사이즈 ${w}px · ${bpName(b)}`, w, h, icon: 'desktop' }];
    }
    return DEVICES.filter((d) => S.visible[d.id]).map((d) => {
      const { w, h } = dimsOf(d);
      const p = d.presets.find((x) => x.id === S.preset[d.id]);
      return { name: d.id, label: `${d.label} · ${p ? p.name : ''}`, w, h, icon: d.id };
    });
  }

  function openCapture() {
    if (!R.origin) { toast('먼저 미리볼 주소를 열어 주세요'); return; }
    if (!R.server) { toast('터미널에서 "npm run dev" 로 실행하면 캡처할 수 있어요'); return; }
    stopMotion();
    showCaptureStep('setup');
    renderCaptureSetup();
    el.captureDlg.showModal();
    (S.capture.folder ? el.capGo : el.capPick).focus();
  }

  function renderCaptureSetup() {
    const shots = captureShots();
    const { folder, scope, overview } = S.capture;
    el.capFolder.textContent = folder || '아직 선택하지 않았어요';
    el.capFolder.title = folder;
    el.capFolder.classList.toggle('is-empty', !folder);
    renderScope();
    el.capOverview.checked = overview;
    el.capOverviewRow.hidden = shots.length < 2;
    renderCaptureList(shots);
    el.capGo.disabled = !folder;
    el.capGo.title = folder ? '' : '저장할 폴더를 먼저 선택해 주세요';
  }

  function renderCaptureList(shots = captureShots()) {
    el.capList.innerHTML = shots.map((s) => {
      const k = captureScale(s.w);
      return `<li>${deviceIcon(s.icon)}<b>${esc(s.label)}</b><span>${s.w}×${s.h} → 저장 ${s.w * k}×${S.capture.scope === 'full' ? '…' : s.h * k}px</span></li>`;
    }).join('');
  }

  // capture.mjs 의 scaleFor 와 같은 규칙: 기본 2배(레티나), 결과 폭이 4K(4000px)를 넘으면 1배
  const captureScale = (w) => (w * 2 > 4000 ? 1 : 2);

  function renderScope() {
    for (const b of document.querySelectorAll('[data-scope]')) b.setAttribute('aria-pressed', String(b.dataset.scope === S.capture.scope));
    if (el.captureDlg.open && !el.capSetup.hidden) renderCaptureList();
  }

  function showCaptureStep(step) {
    const done = step === 'done';
    el.capSetup.hidden = done;
    el.capSetupFoot.hidden = done;
    el.capResult.hidden = !done;
    el.capResultFoot.hidden = !done;
    el.capError.hidden = true;
  }

  function captureError(msg) {
    el.capError.textContent = msg;
    el.capError.hidden = false;
  }

  async function pickCaptureFolder() {
    el.capPick.disabled = true;
    el.capPick.textContent = 'Finder 창 확인…';
    try {
      const { path } = await api('/__dtm/pick-folder', { current: S.capture.folder });
      if (path) {
        S.capture.folder = path;
        save();
      }
      renderCaptureSetup();
      (path ? el.capGo : el.capPick).focus();
    } catch (err) {
      captureError(err.message);
    } finally {
      el.capPick.disabled = false;
      el.capPick.textContent = '폴더 선택…';
    }
  }

  async function runCapture() {
    if (!S.capture.folder) { pickCaptureFolder(); return; }
    const shots = captureShots();
    const label = el.capGo.querySelector('span:last-child');
    el.captureDlg.classList.add('busy');
    el.capGo.disabled = true;
    el.capError.hidden = true;
    label.textContent = `캡처 중… (${shots.length}개)`;
    try {
      const res = await api('/__dtm/capture', {
        url: directUrl(),
        folder: S.capture.folder,
        fullPage: S.capture.scope === 'full',
        overview: S.capture.overview && shots.length > 1,
        shots: shots.map(({ name, label: l, w, h }) => ({ name, label: l, w, h })),
      });
      R.capDir = res.dir;
      el.capDoneTitle.textContent = `${res.files.length}개 파일을 저장했어요`;
      el.capDonePath.textContent = res.dir;
      el.capFiles.innerHTML = res.files.map((f) => `<li>${icon('image')}<code>${esc(f)}</code></li>`).join('');
      showCaptureStep('done');
      el.capOpen.focus();
    } catch (err) {
      captureError(err.message);
    } finally {
      el.captureDlg.classList.remove('busy');
      el.capGo.disabled = !S.capture.folder;
      label.textContent = '캡처하기';
    }
  }

  function bindCapture() {
    el.captureBtn.addEventListener('click', openCapture);
    // 캡처 범위 버튼 (툴바 + 캡처 창, 서로 연동)
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-scope]');
      if (!b) return;
      S.capture.scope = b.dataset.scope;
      save();
      renderScope();
      if (!el.captureDlg.open) toast(S.capture.scope === 'full' ? '캡처 범위: 전체 페이지' : '캡처 범위: 보이는 화면만');
    });
    renderScope();
    el.capPick.addEventListener('click', pickCaptureFolder);
    el.captureForm.addEventListener('submit', (e) => { e.preventDefault(); if (!el.capSetup.hidden) runCapture(); });
    el.captureForm.addEventListener('change', (e) => {
      if (e.target === el.capOverview) S.capture.overview = el.capOverview.checked;
      save();
    });
    for (const b of [el.capClose, el.capCancel]) b.addEventListener('click', () => el.captureDlg.close());
    el.captureDlg.addEventListener('cancel', (e) => { if (el.captureDlg.classList.contains('busy')) e.preventDefault(); });
    el.captureDlg.addEventListener('click', (e) => { if (e.target === el.captureDlg && !el.captureDlg.classList.contains('busy')) el.captureDlg.close(); });
    el.capAgain.addEventListener('click', () => { showCaptureStep('setup'); renderCaptureSetup(); el.capGo.focus(); });
    el.capOpen.addEventListener('click', async () => {
      try { await api('/__dtm/open-folder', { path: R.capDir }); el.captureDlg.close(); }
      catch (err) { captureError(err.message); }
    });
  }

  // ── 시작 ────────────────────────────────────────────────────
  async function init() {
    R.bps = parseBps(S.bpText);
    if (!R.bps.length) { S.bpText = DEFAULT_BP; R.bps = parseBps(DEFAULT_BP); }

    for (const node of document.querySelectorAll('[data-icon]')) node.innerHTML = ICONS[node.dataset.icon] || '';
    buildChips();
    buildDevices();
    buildMorph();
    buildMorphControls();
    renderRecent();
    bindToolbar();
    bindKeys();
    bindCapture();
    setMode(S.mode);
    new ResizeObserver(() => layout()).observe(el.stage);
    window.addEventListener('beforeunload', save);

    await initProxy();
    updateSyncUi();

    const fromQuery = new URLSearchParams(location.search).get('url');
    const start = fromQuery || S.url;
    if (start) openUrl(start, { remember: !!fromQuery });
    else { renderVisibility(); el.urlInput.focus(); }
  }

  init();
})();
