/* 웹 효과 도감 — 카드 · 필터 · 검색 · 상세보기
   데모는 iframe(srcdoc) 안에서 effects-data.js 의 html/css/js 를 그대로 실행합니다.
   → 카드에서 보이는 효과와 상세보기 「코드」 탭의 코드가 항상 같아요. */
(() => {
  'use strict';

  const CATS = window.EFFECT_CATEGORIES || [];
  const CAT_ORDER = Object.fromEntries(CATS.map((c, i) => [c.id, i]));
  // 데이터에 나중에 추가한 효과도 카테고리 순서대로 보이게 (정렬은 안정적이라 같은 카테고리 안 순서는 유지)
  const EFFECTS = (window.EFFECTS || []).slice().sort((a, b) => (CAT_ORDER[a.cat] ?? 99) - (CAT_ORDER[b.cat] ?? 99));
  const BASE_URL = new URL('.', location.href).href; // 데모 안의 assets/… 경로 기준

  // 모든 데모에 공통으로 깔리는 기본 CSS (각 효과의 css 가 이 위에 덮어씀)
  const DEMO_BASE_CSS = `*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; }
body {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0b0b14;
  color: #ecebf5;
  font-family: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}
img { max-width: 100%; }`;
  const DEMO_FONT = '<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">';

  const HINTS = { hover: '마우스를 올려 보세요', click: '클릭해 보세요', scroll: '안에서 스크롤해 보세요', auto: '자동 재생' };
  const LEVELS = ['', '쉬움', '보통', '어려움'];
  const catName = (id) => (CATS.find((c) => c.id === id) || {}).ko || id;

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  const state = { cat: 'all', q: '', current: null, codeLang: 'html' };
  const STAR_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/></svg>';

  // ── 즐겨찾기 (이 브라우저에 저장) ───────────────────
  const FAV_KEY = 'dtm:fx-favs';
  const favs = new Set((() => { try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch { return []; } })());
  const isFav = (id) => favs.has(id);
  function toggleFav(id) {
    if (favs.has(id)) favs.delete(id); else favs.add(id);
    try { localStorage.setItem(FAV_KEY, JSON.stringify([...favs])); } catch { /* 저장 불가 환경 */ }
    const on = favs.has(id);
    for (const b of document.querySelectorAll(`[data-fav="${id}"]`)) setFavButton(b, on);
    if (state.current && state.current.id === id) setFavButton($('dFav'), on);
    updateFavChip();
    applyFilter();
    const e = EFFECTS.find((x) => x.id === id);
    toast(on ? `★ ${e.ko} — 즐겨찾기에 추가, 맨 위에 고정했어요` : `${e.ko} — 즐겨찾기에서 뺐어요`);
  }
  function setFavButton(b, on) {
    b.setAttribute('aria-pressed', String(on));
    b.title = on ? '즐겨찾기 해제' : '즐겨찾기 (맨 위에 고정)';
  }

  // ── 데모 문서 / 프롬프트 / 단일 파일 ─────────────────
  function demoDoc(e) {
    return `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<base href="${BASE_URL}">${DEMO_FONT}
<style>${DEMO_BASE_CSS}</style>
<style>${e.css}</style></head>
<body>${e.html}${e.js ? `<script>${e.js}<\/script>` : ''}</body></html>`;
  }

  // 「한 파일로 복사」: 그대로 저장해서 브라우저로 열 수 있는 HTML
  function standaloneFile(e) {
    return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e.ko} (${e.en})</title>
<style>
/* 기본 */
${DEMO_BASE_CSS}

/* ${e.ko} */
${e.css}
</style>
</head>
<body>
${e.html}
${e.js ? `<script>\n${e.js}\n<\/script>\n` : ''}</body>
</html>
`;
  }

  // AI 에게 이 효과를 만들어 달라고 할 때 붙여넣는 프롬프트
  function fullPrompt(e) {
    const aka = e.aka && e.aka.length ? ` (다른 이름: ${e.aka.join(', ')})` : '';
    return `웹페이지에 「${e.ko} / ${e.en}」 효과를 만들어줘${aka}.

무엇인가요
${e.summary} ${e.desc}

요구사항
${e.prompt.trim()}

공통 조건
- 프레임워크 없이 HTML · CSS · JavaScript(바닐라)로 작성하고, 한 파일로 바로 열어 볼 수 있게 해줘.
- 사용 기술: ${e.tech}. 모바일에서도 자연스럽게 보이도록 반응형으로 만들어줘.
- 색 · 속도 · 크기 같은 값은 CSS 변수로 빼서 쉽게 바꿀 수 있게 해줘.
- prefers-reduced-motion 을 켠 사용자에게는 움직임을 줄이거나 멈춰줘.
- 핵심 원리를 한국어 주석으로 짧게 달아줘.
- 주의할 점: ${e.tip}`;
  }

  // ── 카드 ────────────────────────────────────────────
  const levelDots = (n) => `<span class="level" title="난이도 ${LEVELS[n]}">${[1, 2, 3].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}<span>${LEVELS[n]}</span></span>`;

  function cardHTML(e) {
    return `<article class="card" data-id="${e.id}">
  <div class="demo">
    <span class="placeholder">불러오는 중…</span>
    <span class="hint-chip">${HINTS[e.hint] || ''}</span>
    <button type="button" class="fav" data-act="fav" data-fav="${e.id}" aria-pressed="${isFav(e.id)}" aria-label="${esc(e.ko)} 즐겨찾기" title="${isFav(e.id) ? '즐겨찾기 해제' : '즐겨찾기 (맨 위에 고정)'}">${STAR_SVG}</button>
  </div>
  <div class="card-body">
    <div class="card-title"><h3>${esc(e.ko)}</h3>${levelDots(e.level)}</div>
    <p class="en">${esc(e.en)}</p>
    <div class="meta"><span class="badge">${esc(catName(e.cat))}</span><span class="badge">${esc(e.tech)}</span></div>
    <p class="summary">${esc(e.summary)}</p>
    <div class="card-actions">
      <button type="button" class="btn primary" data-act="open">상세보기</button>
      <button type="button" class="btn" data-act="prompt" title="AI 프롬프트 복사">프롬프트 복사</button>
    </div>
  </div>
</article>`;
  }

  // 화면 근처에 온 카드만 데모를 실행하고, 멀어지면 내려서 28개가 동시에 돌지 않게 함
  const demoObserver = new IntersectionObserver((entries) => {
    for (const en of entries) {
      const card = en.target.closest('.card');
      const e = EFFECTS.find((x) => x.id === card.dataset.id);
      const box = en.target;
      let frame = box.querySelector('iframe');
      if (en.isIntersecting && !frame) {
        frame = document.createElement('iframe');
        frame.title = `${e.ko} 데모`;
        frame.setAttribute('sandbox', 'allow-scripts');
        frame.setAttribute('loading', 'lazy');
        frame.srcdoc = demoDoc(e);
        box.prepend(frame);
        box.querySelector('.placeholder').hidden = true;
      } else if (!en.isIntersecting && frame) {
        frame.remove();
        box.querySelector('.placeholder').hidden = false;
      }
    }
  }, { rootMargin: '300px 0px' });

  function buildGrid() {
    const grid = $('grid');
    grid.innerHTML = '<h2 class="sec-title fav-title" id="favTitle" hidden>★ 즐겨찾기</h2><h2 class="sec-title" id="restTitle" hidden>모든 효과</h2>' + EFFECTS.map(cardHTML).join('');
    for (const box of grid.querySelectorAll('.demo')) demoObserver.observe(box);
    grid.addEventListener('click', (ev) => {
      const btn = ev.target.closest('[data-act]');
      if (!btn) return;
      const e = EFFECTS.find((x) => x.id === btn.closest('.card').dataset.id);
      if (btn.dataset.act === 'open') openDetail(e);
      else if (btn.dataset.act === 'fav') toggleFav(e.id);
      else copy(fullPrompt(e), btn, '프롬프트를 복사했어요');
    });
  }

  // ── 필터 · 검색 ─────────────────────────────────────
  function buildFilters() {
    const counts = Object.fromEntries(CATS.map((c) => [c.id, EFFECTS.filter((e) => e.cat === c.id).length]));
    const items = [{ id: 'all', ko: '전체', n: EFFECTS.length }, { id: 'fav', ko: '★ 즐겨찾기', n: favs.size }, ...CATS.filter((c) => counts[c.id]).map((c) => ({ ...c, n: counts[c.id] }))];
    $('filters').innerHTML = items.map((c) => `<button type="button" class="chip${c.id === 'fav' ? ' chip-fav' : ''}" data-cat="${c.id}" aria-pressed="${c.id === state.cat}">${esc(c.ko)}<small>${c.n}</small></button>`).join('');
    $('filters').addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-cat]');
      if (!b) return;
      state.cat = b.dataset.cat;
      for (const x of $('filters').children) x.setAttribute('aria-pressed', String(x === b));
      applyFilter();
    });
    $('statEffects').textContent = EFFECTS.length;
    $('statCats').textContent = items.length - 2;
  }

  function updateFavChip() {
    const chip = $('filters').querySelector('[data-cat="fav"] small');
    if (chip) chip.textContent = favs.size;
  }

  const norm = (s) => String(s).toLowerCase().replace(/[\s\-_/·]+/g, '');
  function matches(e, q) {
    if (!q) return true;
    return [e.ko, e.en, ...(e.aka || []), e.tech, catName(e.cat), e.summary].some((t) => norm(t).includes(q));
  }

  // 즐겨찾기는 CSS order 로 맨 앞에 (DOM 을 옮기지 않아서 돌고 있는 데모가 끊기지 않음)
  function applyFilter() {
    const q = norm(state.q);
    let shown = 0, shownFav = 0;
    for (const card of $('grid').querySelectorAll('.card')) {
      const e = EFFECTS.find((x) => x.id === card.dataset.id);
      const fav = isFav(e.id);
      const inCat = state.cat === 'all' || (state.cat === 'fav' ? fav : e.cat === state.cat);
      const ok = inCat && matches(e, q);
      card.hidden = !ok;
      card.classList.toggle('is-fav', fav);
      card.style.order = fav ? -1 : 0;
      if (ok) { shown++; if (fav) shownFav++; }
    }
    // 섹션 제목: 즐겨찾기와 나머지가 둘 다 보일 때만
    const split = state.cat !== 'fav' && shownFav > 0 && shown > shownFav;
    $('favTitle').hidden = !split;
    $('restTitle').hidden = !split;

    $('empty').hidden = shown > 0;
    $('empty').textContent = state.cat === 'fav' && !favs.size
      ? '아직 즐겨찾기가 없어요. 카드 오른쪽 위의 ☆ 를 누르면 자주 쓰는 효과가 여기와 목록 맨 위에 모여요.'
      : '검색 결과가 없어요. 다른 이름(영문 포함)으로 찾아보세요.';
    const label = state.cat === 'all' ? '전체' : state.cat === 'fav' ? '즐겨찾기' : catName(state.cat);
    const favNote = shownFav && state.cat !== 'fav' ? ` · ★ 즐겨찾기 ${shownFav}개가 맨 위에 있어요` : '';
    $('result').textContent = (state.q ? `「${state.q}」 검색 결과 ${shown}개` : `${label} ${shown}개`) + favNote;
  }

  // ── 상세보기 ───────────────────────────────────────
  const dlg = $('detail');

  function openDetail(e, { fromHash = false } = {}) {
    state.current = e;
    $('dCat').textContent = `${catName(e.cat).toUpperCase()} · ${e.tech}`;
    $('dTitle').textContent = e.ko;
    $('dEn').textContent = e.en;
    $('dHint').textContent = HINTS[e.hint] || '';
    setFavButton($('dFav'), isFav(e.id));
    $('dDemo').srcdoc = demoDoc(e);

    $('panel-info').innerHTML = `
      <p class="desc">${esc(e.desc)}</p>
      ${e.aka && e.aka.length ? `<h4>다른 이름 · 검색 키워드</h4><div class="aka">${[e.en, ...e.aka].map((a) => `<span class="badge">${esc(a)}</span>`).join('')}</div>` : ''}
      <h4>언제 쓰면 좋아요</h4><p>${esc(e.use)}</p>
      <h4>주의할 점</h4><p class="tip">${esc(e.tip)}</p>
      <h4>난이도</h4><p>${levelDots(e.level)}</p>`;

    const langs = [['html', 'HTML'], ['css', 'CSS'], ['js', 'JS']].filter(([k]) => e[k] && e[k].trim());
    if (!langs.some(([k]) => k === state.codeLang)) state.codeLang = 'html';
    $('codeSeg').innerHTML = langs.map(([k, label]) => `<button type="button" data-lang="${k}" aria-pressed="${k === state.codeLang}">${label}</button>`).join('');
    showCode();
    $('promptView').textContent = fullPrompt(e);

    selectTab('info');
    if (!dlg.open) dlg.showModal();
    if (!fromHash) history.replaceState(null, '', `#${e.id}`);
  }

  function showCode() {
    const e = state.current;
    for (const b of $('codeSeg').children) b.setAttribute('aria-pressed', String(b.dataset.lang === state.codeLang));
    $('codeView').textContent = e[state.codeLang].trim();
  }

  function selectTab(name) {
    for (const t of ['info', 'code', 'prompt']) {
      $(`tab-${t}`).setAttribute('aria-selected', String(t === name));
      $(`panel-${t}`).hidden = t !== name;
    }
  }

  function bindDetail() {
    $('dClose').addEventListener('click', () => dlg.close());
    $('dFav').addEventListener('click', () => toggleFav(state.current.id));
    dlg.addEventListener('click', (ev) => { if (ev.target === dlg) dlg.close(); });
    dlg.addEventListener('close', () => {
      $('dDemo').srcdoc = '';
      state.current = null;
      history.replaceState(null, '', location.pathname + location.search);
    });
    $('dReplay').addEventListener('click', () => { $('dDemo').srcdoc = demoDoc(state.current); });
    for (const t of ['info', 'code', 'prompt']) $(`tab-${t}`).addEventListener('click', () => selectTab(t));
    $('codeSeg').addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-lang]');
      if (!b) return;
      state.codeLang = b.dataset.lang;
      showCode();
    });
    $('copyCode').addEventListener('click', (ev) => copy(state.current[state.codeLang].trim(), ev.currentTarget, `${state.codeLang.toUpperCase()} 코드를 복사했어요`));
    $('copyFile').addEventListener('click', (ev) => copy(standaloneFile(state.current), ev.currentTarget, 'HTML 파일 전체를 복사했어요'));
    $('copyPrompt').addEventListener('click', (ev) => copy(fullPrompt(state.current), ev.currentTarget, '프롬프트를 복사했어요'));
  }

  function openFromHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    const e = EFFECTS.find((x) => x.id === id);
    if (e) openDetail(e, { fromHash: true });
    else if (dlg.open) dlg.close();
  }

  // ── 복사 · 토스트 ──────────────────────────────────
  let toastTimer = 0;
  function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 1600);
  }

  async function copy(text, btn, msg) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // clipboard API 를 못 쓰는 환경(file:// 등) 대비
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      (dlg.open ? dlg : document.body).append(ta);
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
    applyFilter();
    $('search').addEventListener('input', (ev) => { state.q = ev.target.value.trim(); applyFilter(); });
    document.addEventListener('keydown', (ev) => {
      if (ev.key === '/' && !/^(INPUT|TEXTAREA)$/.test(ev.target.tagName) && !dlg.open) {
        ev.preventDefault();
        $('search').focus();
      }
    });
    window.addEventListener('hashchange', openFromHash);
    openFromHash();
  }

  init();
})();
