/* 영상 샷 도감 — 카드 · 필터 · 검색 · 즐겨찾기 · 상세보기 · 샷 조합기 */
(() => {
  'use strict';

  const CATS = window.SHOT_CATEGORIES || [];
  const CAT_ORDER = Object.fromEntries(CATS.map((c, i) => [c.id, i]));
  const SHOTS = (window.SHOTS || []).slice().sort((a, b) => (CAT_ORDER[a.cat] ?? 99) - (CAT_ORDER[b.cat] ?? 99));
  const BUILDER_CATS = ['size', 'angle', 'move', 'comp', 'lens', 'time']; // 조합기에서 고를 분류
  const DEFAULT_SUBJECT = 'a young woman in a bright yellow raincoat';
  const DEFAULT_LOCATION = 'a rainy neon-lit city street at night';
  const MEDIA_LABEL = { image: '이미지 예시', video: '영상 예시', cut: '컷 편집 예시' };

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  const catName = (id) => (CATS.find((c) => c.id === id) || {}).ko || id;
  const byId = (id) => SHOTS.find((s) => s.id === id);
  const state = { cat: 'all', q: '', current: null, guide: false };

  // ── 저장 (이 브라우저) ──────────────────────────────
  const store = {
    get(k, d) { try { const v = localStorage.getItem('dtm:shots:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('dtm:shots:' + k, JSON.stringify(v)); } catch { /* 저장 불가 */ } },
  };
  const favs = new Set(store.get('favs', []));
  const slots = { subject: store.get('subject', DEFAULT_SUBJECT), location: store.get('location', DEFAULT_LOCATION) };
  const picks = store.get('picks', {}); // 조합기 선택: { size: 'close-up', ... }

  // ── 미디어 ─────────────────────────────────────────
  function mediaHTML(s, { big = false } = {}) {
    const m = s.media;
    if (m.type === 'video') {
      return `<video src="${m.src}" poster="${m.poster}" muted loop playsinline preload="${big ? 'auto' : 'none'}"${big ? ' autoplay controls' : ''} aria-label="${esc(s.ko)} 예시 영상"></video>`;
    }
    if (m.type === 'cut') {
      return `<div class="cut" data-hold="${m.hold || 1200}">${m.srcs.map((src, i) => `<img src="${src}" alt="${esc(s.ko)} 예시 ${i + 1}" class="${i === 0 ? 'on' : ''}" loading="lazy">`).join('')}<span class="cut-count">CUT 1/${m.srcs.length}</span></div>`;
    }
    return `<img src="${m.src}" alt="${esc(s.ko)} 예시" loading="${big ? 'eager' : 'lazy'}">`;
  }

  // 컷 시퀀스: 보이는 동안 일정 간격으로 다음 컷으로
  const cutTimers = new WeakMap();
  function startCut(box) {
    const cut = box.querySelector('.cut');
    if (!cut || cutTimers.has(cut)) return;
    const imgs = cut.querySelectorAll('img');
    let i = 0;
    cutTimers.set(cut, setInterval(() => {
      imgs[i].classList.remove('on');
      i = (i + 1) % imgs.length;
      imgs[i].classList.add('on');
      cut.querySelector('.cut-count').textContent = `CUT ${i + 1}/${imgs.length}`;
    }, Number(cut.dataset.hold)));
  }
  function stopCut(box) {
    const cut = box.querySelector('.cut');
    if (cut && cutTimers.has(cut)) { clearInterval(cutTimers.get(cut)); cutTimers.delete(cut); }
  }

  // 화면에 보이는 카드만 영상 재생 · 컷 전환
  const playObserver = new IntersectionObserver((entries) => {
    for (const en of entries) {
      const box = en.target;
      const v = box.querySelector('video');
      if (en.isIntersecting) {
        if (v) v.play().catch(() => {});
        startCut(box);
      } else {
        if (v) v.pause();
        stopCut(box);
      }
    }
  }, { threshold: 0.35 });

  // ── 카드 ────────────────────────────────────────────
  const STAR_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/></svg>';

  function cardHTML(s) {
    return `<article class="card" data-id="${s.id}">
  <div class="demo">
    ${mediaHTML(s)}
    <span class="hint-chip media-chip ${s.media.type}">${MEDIA_LABEL[s.media.type]}</span>
    <span class="abbr">${esc(s.abbr)}</span>
    <button type="button" class="fav" data-act="fav" data-fav="${s.id}" aria-pressed="${favs.has(s.id)}" aria-label="${esc(s.ko)} 즐겨찾기" title="즐겨찾기 (맨 위에 고정)">${STAR_SVG}</button>
  </div>
  <div class="card-body">
    <div class="card-title"><h3>${esc(s.ko)}</h3></div>
    <p class="en">${esc(s.en)}</p>
    <div class="meta"><span class="badge">${esc(catName(s.cat))}</span><span class="badge">${esc(s.keyword.split(',')[0])}</span></div>
    <p class="summary">${esc(s.summary)}</p>
    <div class="card-actions">
      <button type="button" class="btn primary" data-act="open">상세보기</button>
      <button type="button" class="btn" data-act="prompt" title="AI 프롬프트 복사">프롬프트 복사</button>
    </div>
  </div>
</article>`;
  }

  function buildGrid() {
    const grid = $('grid');
    grid.innerHTML = '<h2 class="sec-title fav-title" id="favTitle" hidden>★ 즐겨찾기</h2><h2 class="sec-title" id="restTitle" hidden>모든 샷</h2>' + SHOTS.map(cardHTML).join('');
    for (const box of grid.querySelectorAll('.demo')) playObserver.observe(box);
    grid.addEventListener('click', (ev) => {
      const btn = ev.target.closest('[data-act]');
      const card = ev.target.closest('.card');
      if (!card) return;
      const s = byId(card.dataset.id);
      if (!btn) { if (ev.target.closest('.demo')) openDetail(s); return; }
      if (btn.dataset.act === 'open') openDetail(s);
      else if (btn.dataset.act === 'fav') toggleFav(s.id);
      else copy(fillPrompt(s.prompt), btn, '프롬프트를 복사했어요');
    });
  }

  // ── 필터 · 검색 · 즐겨찾기 ─────────────────────────
  function buildFilters() {
    const count = (id) => SHOTS.filter((s) => s.cat === id).length;
    const items = [{ id: 'all', ko: '전체', n: SHOTS.length }, { id: 'fav', ko: '★ 즐겨찾기', n: favs.size }, ...CATS.filter((c) => count(c.id)).map((c) => ({ ...c, n: count(c.id) }))];
    $('filters').innerHTML = items.map((c) => `<button type="button" class="chip${c.id === 'fav' ? ' chip-fav' : ''}" data-cat="${c.id}" aria-pressed="${c.id === state.cat}">${esc(c.ko)}<small>${c.n}</small></button>`).join('');
    $('filters').addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-cat]');
      if (!b) return;
      state.cat = b.dataset.cat;
      for (const x of $('filters').children) x.setAttribute('aria-pressed', String(x === b));
      applyFilter();
    });
    $('statShots').textContent = SHOTS.length;
    $('statCats').textContent = items.length - 2;
    $('statVideos').textContent = SHOTS.filter((s) => s.media.type === 'video').length;
  }

  const norm = (s) => String(s).toLowerCase().replace(/[\s\-_/·'()]+/g, '');
  const matches = (s, q) => !q || [s.ko, s.en, s.abbr, ...(s.aka || []), s.keyword, catName(s.cat), s.summary].some((t) => norm(t).includes(q));

  function applyFilter() {
    const q = norm(state.q);
    let shown = 0, shownFav = 0;
    for (const card of $('grid').querySelectorAll('.card')) {
      const s = byId(card.dataset.id);
      const fav = favs.has(s.id);
      const inCat = state.cat === 'all' || (state.cat === 'fav' ? fav : s.cat === state.cat);
      const ok = inCat && matches(s, q);
      card.hidden = !ok;
      card.classList.toggle('is-fav', fav);
      card.style.order = fav ? -1 : 0;
      if (ok) { shown++; if (fav) shownFav++; }
    }
    const split = state.cat !== 'fav' && shownFav > 0 && shown > shownFav;
    $('favTitle').hidden = !split;
    $('restTitle').hidden = !split;
    $('empty').hidden = shown > 0;
    $('empty').textContent = state.cat === 'fav' && !favs.size
      ? '아직 즐겨찾기가 없어요. 카드 오른쪽 위의 ☆ 를 누르면 자주 쓰는 샷이 여기와 목록 맨 위에 모여요.'
      : '검색 결과가 없어요. 영문 이름이나 약어(CU, OTS, POV …)로도 찾아보세요.';
    const label = state.cat === 'all' ? '전체' : state.cat === 'fav' ? '즐겨찾기' : catName(state.cat);
    const favNote = shownFav && state.cat !== 'fav' ? ` · ★ 즐겨찾기 ${shownFav}개가 맨 위에 있어요` : '';
    $('result').textContent = (state.q ? `「${state.q}」 검색 결과 ${shown}개` : `${label} ${shown}개`) + favNote;
  }

  function toggleFav(id) {
    if (favs.has(id)) favs.delete(id); else favs.add(id);
    store.set('favs', [...favs]);
    const on = favs.has(id);
    for (const b of document.querySelectorAll(`[data-fav="${id}"]`)) b.setAttribute('aria-pressed', String(on));
    if (state.current && state.current.id === id) $('dFav').setAttribute('aria-pressed', String(on));
    const chip = $('filters').querySelector('[data-cat="fav"] small');
    if (chip) chip.textContent = favs.size;
    applyFilter();
    toast(on ? `★ ${byId(id).ko} — 즐겨찾기에 추가, 맨 위에 고정했어요` : `${byId(id).ko} — 즐겨찾기에서 뺐어요`);
  }

  // ── 프롬프트 ───────────────────────────────────────
  const fillPrompt = (p) => p.replace(/\[SUBJECT\]/g, slots.subject || DEFAULT_SUBJECT).replace(/\[LOCATION\]/g, slots.location || DEFAULT_LOCATION);
  const markPrompt = (p) => esc(p)
    .replace(/\[SUBJECT\]/g, `<mark>${esc(slots.subject || DEFAULT_SUBJECT)}</mark>`)
    .replace(/\[LOCATION\]/g, `<mark>${esc(slots.location || DEFAULT_LOCATION)}</mark>`);

  function bindSlots(subjectEl, locationEl, onChange) {
    subjectEl.value = slots.subject;
    locationEl.value = slots.location;
    const update = () => {
      slots.subject = subjectEl.value.trim();
      slots.location = locationEl.value.trim();
      store.set('subject', slots.subject);
      store.set('location', slots.location);
      onChange();
    };
    subjectEl.addEventListener('input', update);
    locationEl.addEventListener('input', update);
  }

  // ── 카메라 배치 도식 (SVG) ─────────────────────────
  const ARROW = '<defs><marker id="dgArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#f472b6"/></marker></defs>';
  const camIcon = (x, y, deg) => `<g transform="translate(${x} ${y}) rotate(${deg})"><rect class="dg-cam" x="-9" y="-5" width="12" height="10" rx="2"/><path class="dg-cam" d="M3 -3L9 -6V6L3 3z"/></g>`;

  function diagramSVG(d) {
    if (d.type === 'size') {
      // 인물(키 1)과 16:9 프레임을 같은 좌표에 놓고 화면에 맞게 축소
      const fy0 = d.top, fy1 = d.bottom, fw = (fy1 - fy0) * 16 / 9;
      const minX = Math.min(-0.2, -fw / 2), maxX = Math.max(0.2, fw / 2), minY = Math.min(0, fy0), maxY = Math.max(1, fy1);
      const k = Math.min(134 / (maxX - minX), 84 / (maxY - minY));
      const X = (x) => 75 + x * k, Y = (y) => 50 + (y - (minY + maxY) / 2) * k;
      const person = `<circle class="dg-person" cx="${X(0)}" cy="${Y(0.07)}" r="${0.07 * k}"/>
        <rect class="dg-person" x="${X(-0.11)}" y="${Y(0.16)}" width="${0.22 * k}" height="${0.4 * k}" rx="${0.05 * k}"/>
        <rect class="dg-person" x="${X(-0.09)}" y="${Y(0.56)}" width="${0.07 * k}" height="${0.44 * k}"/>
        <rect class="dg-person" x="${X(0.02)}" y="${Y(0.56)}" width="${0.07 * k}" height="${0.44 * k}"/>`;
      return `<svg viewBox="0 0 150 100" aria-hidden="true">${person}<rect class="dg-frame" x="${X(-fw / 2)}" y="${Y(fy0)}" width="${fw * k}" height="${(fy1 - fy0) * k}"/></svg>`;
    }
    if (d.type === 'angle') {
      const person = '<circle class="dg-person" cx="105" cy="34" r="6"/><rect class="dg-person" x="100" y="41" width="10" height="24" rx="3"/><rect class="dg-person" x="101" y="65" width="3.5" height="22"/><rect class="dg-person" x="105.5" y="65" width="3.5" height="22"/>';
      const ground = '<line class="dg-ground" x1="8" y1="87" x2="142" y2="87"/>';
      const cams = { high: [38, 12, 105, 55], low: [38, 80, 105, 40], top: [105, 8, 105, 30], tilt: [36, 40, 100, 45] };
      const [cx, cy, tx, ty] = cams[d.cam];
      const deg = Math.atan2(ty - cy, tx - cx) * 180 / Math.PI + (d.cam === 'tilt' ? -20 : 0);
      return `<svg viewBox="0 0 150 100" aria-hidden="true">${ground}${person}<line class="dg-ray" x1="${cx}" y1="${cy}" x2="${tx}" y2="${ty}"/>${camIcon(cx, cy, deg)}</svg>`;
    }
    if (d.type === 'move') {
      const person = (x, y) => `<circle class="dg-person" cx="${x}" cy="${y}" r="7"/>`;
      if (d.path === 'push') return `<svg viewBox="0 0 150 100" aria-hidden="true">${ARROW}${person(115, 50)}${camIcon(30, 50, 0)}<path class="dg-move" d="M45 50H95"/></svg>`;
      if (d.path === 'pan') return `<svg viewBox="0 0 150 100" aria-hidden="true">${ARROW}${person(118, 62)}<line class="dg-ray" x1="40" y1="50" x2="115" y2="22"/><line class="dg-ray" x1="40" y1="50" x2="115" y2="62"/>${camIcon(40, 50, 0)}<path class="dg-move" d="M58 34A24 24 0 0 1 60 64"/></svg>`;
      if (d.path === 'track') return `<svg viewBox="0 0 150 100" aria-hidden="true">${ARROW}${person(75, 72)}<path class="dg-move" d="M75 62V48"/>${camIcon(75, 28, 90)}<path class="dg-move" d="M92 34V12"/></svg>`;
      if (d.path === 'orbit') return `<svg viewBox="0 0 150 100" aria-hidden="true">${ARROW}${person(75, 50)}<path class="dg-move" d="M37 50A38 38 0 0 1 113 50"/>${camIcon(37, 58, 0)}</svg>`;
    }
    return '';
  }
  const DIAGRAM_CAP = {
    size: ['FRAME', '점선 상자가 화면에 담기는 범위예요. 인물의 어디까지 담는지가 샷 크기를 정해요.'],
    angle: ['SIDE VIEW', '옆에서 본 카메라 높이와 방향이에요. 카메라가 높을수록 인물이 작아 보여요.'],
    move: ['TOP VIEW', '위에서 본 카메라 움직임이에요. 분홍 화살표가 카메라(또는 인물)가 움직이는 방향이에요.'],
  };

  // ── 구도 가이드 선 ─────────────────────────────────
  function guideSVG(type) {
    const g = {
      thirds: '<line x1="33.3" y1="0" x2="33.3" y2="100"/><line x1="66.6" y1="0" x2="66.6" y2="100"/><line x1="0" y1="33.3" x2="100" y2="33.3"/><line x1="0" y1="66.6" x2="100" y2="66.6"/><circle cx="33.3" cy="33.3" r="0.9"/><circle cx="66.6" cy="33.3" r="0.9"/><circle cx="33.3" cy="66.6" r="0.9"/><circle cx="66.6" cy="66.6" r="0.9"/>',
      center: '<line x1="50" y1="0" x2="50" y2="100"/><line x1="0" y1="50" x2="100" y2="50"/><line x1="0" y1="0" x2="50" y2="50"/><line x1="100" y1="0" x2="50" y2="50"/><line x1="0" y1="100" x2="50" y2="50"/><line x1="100" y1="100" x2="50" y2="50"/>',
      space: '<rect class="shade" x="2" y="3" width="60" height="60" rx="1"/><line x1="66.6" y1="0" x2="66.6" y2="100"/><line x1="0" y1="66.6" x2="100" y2="66.6"/>',
    }[type];
    return g ? `<svg class="guide" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${g}</svg>` : '';
  }

  // ── 상세보기 ───────────────────────────────────────
  const dlg = $('detail');

  function openDetail(s, { fromHash = false } = {}) {
    state.current = s;
    $('dCat').textContent = `${catName(s.cat).toUpperCase()} · ${s.abbr}`;
    $('dTitle').textContent = s.ko;
    $('dEn').textContent = s.en;
    $('dType').textContent = MEDIA_LABEL[s.media.type];
    $('dFav').setAttribute('aria-pressed', String(favs.has(s.id)));
    $('dMedia').innerHTML = mediaHTML(s, { big: true });
    if (s.media.type === 'cut') { stopCut($('dMedia')); startCut($('dMedia')); }

    state.guide = false;
    $('dGuide').hidden = !guideSVG(s.guide);
    $('dGuide').setAttribute('aria-pressed', 'false');

    $('dDiagram').hidden = !s.diagram;
    if (s.diagram) {
      $('dDiagramSvg').innerHTML = diagramSVG(s.diagram);
      const [t, c] = DIAGRAM_CAP[s.diagram.type];
      $('dDiagramCap').innerHTML = `<b>${t}</b>${c}`;
    }

    const pairs = (s.pairs || []).map(byId).filter(Boolean);
    $('panel-info').innerHTML = `
      <p class="desc">${esc(s.summary)}</p>
      <h4>어떤 느낌을 주나요</h4><p class="feel">${esc(s.feel)}</p>
      <h4>언제 쓰면 좋아요</h4><p>${esc(s.use)}</p>
      <h4>주의할 점</h4><p class="tip">${esc(s.tip)}</p>
      <h4>다른 이름 · 검색 키워드</h4><div class="aka">${[s.en, s.abbr, ...(s.aka || [])].map((a) => `<span class="badge">${esc(a)}</span>`).join('')}</div>
      ${pairs.length ? `<h4>잘 어울리는 샷</h4><div class="pairs">${pairs.map((p) => `<button type="button" data-goto="${p.id}">${esc(p.ko)}</button>`).join('')}</div>` : ''}`;

    renderDetailPrompt();
    selectTab('info');
    if (!dlg.open) dlg.showModal();
    if (!fromHash) history.replaceState(null, '', `#${s.id}`);
  }

  function renderDetailPrompt() {
    const s = state.current;
    if (!s) return;
    $('pKeyword').textContent = s.keyword;
    $('pFull').innerHTML = markPrompt(s.prompt);
  }

  function selectTab(name) {
    for (const t of ['info', 'prompt']) {
      $(`tab-${t}`).setAttribute('aria-selected', String(t === name));
      $(`panel-${t}`).hidden = t !== name;
    }
  }

  function bindDetail() {
    $('dClose').addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', (ev) => { if (ev.target === dlg) dlg.close(); });
    dlg.addEventListener('close', () => {
      stopCut($('dMedia'));
      $('dMedia').innerHTML = '';
      state.current = null;
      history.replaceState(null, '', location.pathname + location.search);
    });
    for (const t of ['info', 'prompt']) $(`tab-${t}`).addEventListener('click', () => selectTab(t));
    $('dFav').addEventListener('click', () => toggleFav(state.current.id));
    $('dGuide').addEventListener('click', () => {
      state.guide = !state.guide;
      $('dGuide').setAttribute('aria-pressed', String(state.guide));
      const old = $('dMedia').querySelector('.guide');
      if (old) old.remove();
      if (state.guide) $('dMedia').insertAdjacentHTML('beforeend', guideSVG(state.current.guide));
    });
    $('dAdd').addEventListener('click', () => {
      const s = state.current;
      if (!BUILDER_CATS.includes(s.cat)) { toast(`${catName(s.cat)} 샷은 조합기에 없어요 — 프롬프트를 그대로 복사해 쓰세요`); return; }
      picks[s.cat] = s.id;
      store.set('picks', picks);
      renderBuilder();
      toast(`조합기에 「${s.ko}」 추가 — 오른쪽 위 샷 조합기에서 확인하세요`);
    });
    $('panel-info').addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-goto]');
      if (b) openDetail(byId(b.dataset.goto));
    });
    bindSlots($('pSubject'), $('pLocation'), () => { renderDetailPrompt(); renderBuilder(); syncSlotInputs('p'); });
    $('copyKeyword').addEventListener('click', (ev) => copy(state.current.keyword, ev.currentTarget, '키워드를 복사했어요'));
    $('copyPrompt').addEventListener('click', (ev) => copy(fillPrompt(state.current.prompt), ev.currentTarget, '프롬프트를 복사했어요'));
  }

  function openFromHash() {
    const s = byId(decodeURIComponent(location.hash.slice(1)));
    if (s) openDetail(s, { fromHash: true });
    else if (dlg.open) dlg.close();
  }

  // ── 샷 조합기 ──────────────────────────────────────
  const bdlg = $('builder');
  const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);

  function composePrompt() {
    const sel = Object.fromEntries(BUILDER_CATS.map((c) => [c, picks[c] && byId(picks[c])]));
    const subject = slots.subject || DEFAULT_SUBJECT, location = slots.location || DEFAULT_LOCATION;
    const head = [sel.size, sel.angle].filter(Boolean).map((s) => s.keyword).join(', ');
    const out = [`${head ? cap(head) + ' — ' : 'Cinematic shot — '}${subject} in ${location}.`];
    if (sel.move) out.push(`Camera movement: ${sel.move.keyword}.`);
    if (sel.comp) out.push(`Composition: ${sel.comp.keyword}.`);
    if (sel.lens) out.push(`Lens: ${sel.lens.keyword}.`);
    if (sel.time) out.push(`Timing: ${sel.time.keyword}.`);
    out.push(sel.move || sel.time ? 'Cinematic lighting, realistic, one continuous shot, no cuts.' : 'Cinematic lighting, realistic film still.');
    const ko = BUILDER_CATS.map((c) => sel[c] && sel[c].ko).filter(Boolean);
    return { en: out.join(' '), ko: ko.length ? '선택: ' + ko.join(' · ') : '아직 아무것도 고르지 않았어요. 분류마다 하나씩 골라 보세요.' };
  }

  function renderBuilder() {
    $('bRows').innerHTML = BUILDER_CATS.map((c) => {
      const opts = SHOTS.filter((s) => s.cat === c);
      return `<div class="b-row"><span>${esc(catName(c))}</span><div class="b-opts" data-cat="${c}">
        <button type="button" class="none" data-pick="" aria-pressed="${!picks[c]}">선택 안 함</button>
        ${opts.map((s) => `<button type="button" data-pick="${s.id}" aria-pressed="${picks[c] === s.id}" title="${esc(s.keyword)}">${esc(s.ko)}</button>`).join('')}
      </div></div>`;
    }).join('');
    const { en, ko } = composePrompt();
    $('bOut').textContent = en;
    $('bKo').textContent = ko;
  }

  function syncSlotInputs(from) {
    // 상세보기와 조합기의 대상·장소 입력을 같은 값으로 맞춤
    for (const p of ['p', 'b']) {
      if (p === from) continue;
      $(p + 'Subject').value = slots.subject;
      $(p + 'Location').value = slots.location;
    }
  }

  function bindBuilder() {
    $('builderOpen').addEventListener('click', () => { renderBuilder(); bdlg.showModal(); });
    $('bClose').addEventListener('click', () => bdlg.close());
    bdlg.addEventListener('click', (ev) => { if (ev.target === bdlg) bdlg.close(); });
    $('bRows').addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-pick]');
      if (!b) return;
      const c = b.closest('[data-cat]').dataset.cat;
      if (b.dataset.pick) picks[c] = b.dataset.pick; else delete picks[c];
      store.set('picks', picks);
      renderBuilder();
    });
    $('bReset').addEventListener('click', () => {
      for (const c of BUILDER_CATS) delete picks[c];
      store.set('picks', picks);
      renderBuilder();
    });
    bindSlots($('bSubject'), $('bLocation'), () => { renderBuilder(); renderDetailPrompt(); syncSlotInputs('b'); });
    $('bCopy').addEventListener('click', (ev) => copy(composePrompt().en, ev.currentTarget, '조합한 프롬프트를 복사했어요'));
  }

  // ── 복사 · 토스트 ──────────────────────────────────
  let toastTimer = 0;
  function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
  }

  async function copy(text, btn, msg) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      (document.querySelector('dialog[open]') || document.body).append(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    toast(msg);
    if (btn) {
      const old = btn.textContent;
      btn.classList.add('copied');
      btn.textContent = '복사됨 ✓';
      setTimeout(() => { btn.classList.remove('copied'); btn.textContent = old; }, 1400);
    }
  }

  // ── 시작 ────────────────────────────────────────────
  function init() {
    buildFilters();
    buildGrid();
    bindDetail();
    bindBuilder();
    renderBuilder();
    applyFilter();
    $('search').addEventListener('input', (ev) => { state.q = ev.target.value.trim(); applyFilter(); });
    document.addEventListener('keydown', (ev) => {
      if (ev.key === '/' && !/^(INPUT|TEXTAREA)$/.test(ev.target.tagName) && !document.querySelector('dialog[open]')) {
        ev.preventDefault();
        $('search').focus();
      }
    });
    window.addEventListener('hashchange', openFromHash);
    openFromHash();
  }

  init();
})();
