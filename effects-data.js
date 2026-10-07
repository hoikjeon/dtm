/* 웹 효과 도감 — 효과 데이터
   효과 1개 = 객체 1개. 카드 데모 · 상세보기 코드 · AI 프롬프트가 모두 이 데이터에서 만들어집니다.
   (데모는 iframe 안에서 html/css/js 를 그대로 실행하므로 "보이는 효과 = 보여주는 코드" 입니다)

   필드
   - id        URL 해시용 (effects.html#glitch)
   - cat       카테고리 id (EFFECT_CATEGORIES 참고)
   - ko / en   한글 이름 / 영문 이름(검색 키워드)
   - aka       다른 이름들
   - tech      사용 기술 표시
   - level     난이도 1~3
   - hint      카드에 표시할 조작 안내 ('hover' | 'click' | 'scroll' | 'auto')
   - summary   카드 한 줄 설명
   - desc      상세 설명
   - use       언제 쓰면 좋은지
   - tip       주의점
   - html / css / js   데모 코드 (공통 기본 CSS 는 effects.js 의 DEMO_BASE_CSS)
   - prompt    AI 에게 이 효과를 만들어 달라고 할 때의 핵심 요구사항 (공통 문구는 effects.js 에서 덧붙임)

   ⚠ 데모 코드에는 백틱(`)·${}·역슬래시를 쓰지 않습니다 (이 파일의 템플릿 문자열이 깨지지 않도록). */

window.EFFECT_CATEGORIES = [
  { id: 'text', ko: '텍스트', en: 'Text' },
  { id: 'hover', ko: '호버·인터랙션', en: 'Hover' },
  { id: 'scroll', ko: '스크롤', en: 'Scroll' },
  { id: 'bg', ko: '배경', en: 'Background' },
  { id: 'ui', ko: 'UI 스타일', en: 'UI Style' },
  { id: 'loading', ko: '전환·로딩', en: 'Loading' },
  { id: 'image', ko: '이미지', en: 'Image' },
  { id: '3d', ko: '3D', en: '3D' },
];

window.EFFECTS = [
  /* ───────────────────────── 텍스트 ───────────────────────── */
  {
    id: 'typewriter', cat: 'text', ko: '타이핑 효과', en: 'Typewriter', aka: ['타자기 효과', 'Typing Animation'],
    tech: 'JS', level: 1, hint: 'auto',
    summary: '글자가 한 자씩 입력되고 지워지며 문구가 바뀌어요.',
    desc: '문자열을 한 글자씩 잘라서 보여주고, 끝까지 쓰면 잠시 멈춘 뒤 지우고 다음 문구로 넘어가요. 깜빡이는 커서(caret)를 함께 두면 실제로 타이핑하는 느낌이 납니다.',
    use: '히어로 헤드라인, 서비스가 하는 일을 여러 개 번갈아 보여줄 때, 챗봇·AI 느낌을 낼 때',
    tip: '스크린 리더가 바뀌는 글자를 계속 읽지 않도록 aria-live 를 쓰지 말고, 전체 문구를 aria-label 로 제공하세요.',
    html: `<h1 class="type"><span id="typed"></span><span class="caret"></span></h1>`,
    css: `.type {
  font-size: clamp(22px, 5vw, 44px);
  font-weight: 700;
  letter-spacing: -0.02em;
}
.caret {
  display: inline-block;
  width: 0.08em;
  height: 1em;
  margin-left: 0.08em;
  background: #8b5cf6;
  vertical-align: -0.12em;
  animation: blink 1s steps(1) infinite;
}
@keyframes blink { 50% { opacity: 0; } }`,
    js: `const words = ['웹사이트를 만들어요', '효과를 더해요', '사용자를 놀라게 해요'];
const el = document.getElementById('typed');
let w = 0, i = 0, deleting = false;

function tick() {
  const word = words[w];
  i += deleting ? -1 : 1;
  el.textContent = word.slice(0, i);

  let delay = deleting ? 45 : 95;            // 지울 때가 더 빠르게
  if (!deleting && i === word.length) {      // 다 썼으면 잠깐 멈췄다가 지우기
    deleting = true; delay = 1400;
  } else if (deleting && i === 0) {          // 다 지웠으면 다음 문구
    deleting = false; w = (w + 1) % words.length; delay = 300;
  }
  setTimeout(tick, delay);
}
tick();`,
    prompt: `- 헤드라인에 여러 문구가 한 글자씩 타이핑되고, 다 쓰면 1.4초 멈춘 뒤 지워지고 다음 문구로 넘어가게 해줘.
- 쓰는 속도는 약 95ms, 지우는 속도는 약 45ms 로 지우기가 더 빠르게.
- 글자 뒤에 보라색(#8b5cf6) 세로 막대 커서가 1초 간격으로 깜빡이게.
- 문구 목록은 배열로 쉽게 바꿀 수 있게 맨 위에 둬.`,
  },
  {
    id: 'glitch', cat: 'text', ko: '글리치 텍스트', en: 'Glitch Text', aka: ['RGB 분리', '노이즈 텍스트', 'Chromatic Aberration'],
    tech: 'CSS', level: 2, hint: 'auto',
    summary: '빨강·파랑 채널이 어긋나며 화면이 고장 난 듯 떨려요.',
    desc: '같은 글자를 ::before / ::after 로 두 번 더 겹치고, 각각 다른 색과 clip-path 로 일부만 보이게 한 뒤 위치를 순간적으로 흔들어요. mix-blend-mode: screen 으로 겹친 부분이 밝게 섞여 RGB 분리 느낌이 납니다.',
    use: '게임·사이버펑크·테크 브랜드, 404 페이지, 강렬한 인트로 타이틀',
    tip: '계속 깜빡이는 효과는 눈이 피로하고 광과민성 사용자에게 위험할 수 있어요. 호버 시에만 재생하거나 prefers-reduced-motion 에서 끄세요.',
    html: `<h1 class="glitch" data-text="GLITCH">GLITCH</h1>`,
    css: `.glitch {
  position: relative;
  margin: 0;
  font-size: clamp(44px, 11vw, 110px);
  font-weight: 900;
  letter-spacing: 0.04em;
  color: #fff;
}
.glitch::before,
.glitch::after {
  content: attr(data-text);
  position: absolute;
  inset: 0;
  mix-blend-mode: screen;
}
.glitch::before {
  color: #ff2bd6;
  animation: glitch-a 2.4s infinite steps(1);
}
.glitch::after {
  color: #22d3ee;
  animation: glitch-b 1.9s infinite steps(1);
}
@keyframes glitch-a {
  0%, 100% { transform: translate(-2px, 0); clip-path: inset(0 0 0 0); }
  10% { transform: translate(-6px, -2px); clip-path: inset(10% 0 55% 0); }
  20% { transform: translate(4px, 1px);  clip-path: inset(60% 0 10% 0); }
  30% { transform: translate(-2px, 0);   clip-path: inset(0 0 0 0); }
  70% { transform: translate(5px, -1px); clip-path: inset(35% 0 40% 0); }
  75% { transform: translate(-2px, 0);   clip-path: inset(0 0 0 0); }
}
@keyframes glitch-b {
  0%, 100% { transform: translate(2px, 0); clip-path: inset(0 0 0 0); }
  15% { transform: translate(6px, 2px);   clip-path: inset(70% 0 5% 0); }
  25% { transform: translate(-5px, -1px); clip-path: inset(20% 0 50% 0); }
  35% { transform: translate(2px, 0);     clip-path: inset(0 0 0 0); }
  80% { transform: translate(-4px, 1px);  clip-path: inset(5% 0 75% 0); }
  85% { transform: translate(2px, 0);     clip-path: inset(0 0 0 0); }
}`,
    js: ``,
    prompt: `- 큰 영문 타이틀에 글리치(RGB 분리) 효과를 넣어줘. JS 없이 CSS 만으로.
- 같은 글자를 ::before(핑크 #ff2bd6), ::after(시안 #22d3ee)로 겹치고 mix-blend-mode: screen 사용.
- 각 레이어가 steps(1) 키프레임으로 불규칙하게 좌우로 튀고, clip-path: inset() 으로 가로 띠 일부만 보이게.
- 두 레이어의 애니메이션 주기를 다르게(2.4s, 1.9s) 해서 반복 패턴이 티 나지 않게.`,
  },
  {
    id: 'gradient-text', cat: 'text', ko: '그라디언트 텍스트', en: 'Gradient Text', aka: ['흐르는 그라디언트 글자', 'Animated Gradient Text'],
    tech: 'CSS', level: 1, hint: 'auto',
    summary: '글자 안에서 무지갯빛 그라디언트가 천천히 흘러가요.',
    desc: '배경에 그라디언트를 깔고 background-clip: text 로 글자 모양대로만 잘라낸 뒤, 글자색을 투명하게 해요. 배경을 2배 크기로 만들고 위치를 옮기면 색이 끊김 없이 흐릅니다.',
    use: '히어로 강조 문구, 프라이싱 페이지의 "Pro" 같은 키워드, 브랜드 로고 타입',
    tip: '첫 색과 마지막 색을 같게 해야 반복할 때 이음새가 보이지 않아요. 대비가 낮은 색은 가독성이 떨어지니 어두운 배경에서는 밝은 색 위주로.',
    html: `<h1 class="grad">Gradient Text</h1>`,
    css: `.grad {
  margin: 0;
  font-size: clamp(38px, 9vw, 88px);
  font-weight: 800;
  letter-spacing: -0.03em;
  background: linear-gradient(90deg, #22d3ee, #8b5cf6, #f472b6, #fbbf24, #22d3ee);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: flow 5s linear infinite;
}
@keyframes flow { to { background-position: 200% 0; } }`,
    js: ``,
    prompt: `- 큰 제목 글자 안에 시안→보라→핑크→노랑→시안 순서의 그라디언트를 넣고, 왼쪽으로 끊김 없이 계속 흐르게 해줘.
- background-clip: text + color: transparent 방식, CSS 만 사용.
- background-size: 200% 로 만들고 background-position 을 0 → 200% 로 5초 linear 무한 반복.`,
  },
  {
    id: 'text-scramble', cat: 'text', ko: '텍스트 스크램블', en: 'Text Scramble', aka: ['디코딩 효과', 'Decode Text', '해커 텍스트'],
    tech: 'JS', level: 2, hint: 'auto',
    summary: '무작위 문자가 뒤섞이다가 한 글자씩 원래 문장으로 맞춰져요.',
    desc: '글자마다 시작·끝 프레임을 무작위로 정해, 그 사이에는 랜덤 기호를 보여주고 끝 프레임이 되면 진짜 글자로 고정해요. 글자마다 타이밍이 달라 암호가 풀리는 듯한 느낌이 납니다.',
    use: '테크·보안·개발자 포트폴리오, 로딩 후 타이틀 등장, 메뉴 호버 효과',
    tip: '고정폭(monospace) 글꼴을 쓰면 글자 폭이 흔들리지 않아 훨씬 깔끔해요.',
    html: `<h1 class="scramble" id="scramble">HELLO WORLD</h1>`,
    css: `.scramble {
  margin: 0;
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: clamp(24px, 6vw, 54px);
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #a5f3fc;
}
.scramble .dud { color: #8b5cf6; opacity: 0.75; }`,
    js: `const el = document.getElementById('scramble');
const phrases = ['HELLO WORLD', 'TEXT SCRAMBLE', 'DECODE EFFECT'];
const chars = '!-_/[]{}=+*^?#0123456789ABCDEF';
let p = 0;

function scramble(to) {
  const from = el.textContent;
  const len = Math.max(from.length, to.length);
  // 글자마다 섞이기 시작/끝나는 프레임을 무작위로
  const queue = [];
  for (let i = 0; i < len; i++) {
    const start = Math.floor(Math.random() * 20);
    queue.push({ from: from[i] || '', to: to[i] || '', start: start, end: start + 10 + Math.floor(Math.random() * 20) });
  }
  let frame = 0;
  return new Promise(function (done) {
    (function update() {
      let out = '', finished = 0;
      queue.forEach(function (q) {
        if (frame >= q.end) { finished++; out += q.to; }
        else if (frame >= q.start) out += '<span class="dud">' + chars[Math.floor(Math.random() * chars.length)] + '</span>';
        else out += q.from;
      });
      el.innerHTML = out;
      frame++;
      if (finished === queue.length) done(); else requestAnimationFrame(update);
    })();
  });
}

(function loop() {
  scramble(phrases[p]).then(function () {
    p = (p + 1) % phrases.length;
    setTimeout(loop, 1600);
  });
})();`,
    prompt: `- 제목 텍스트가 무작위 기호(!-_/[]{}=+*^?# 와 숫자, A~F)로 뒤섞이다가 한 글자씩 새 문장으로 맞춰지는 디코딩 효과를 만들어줘.
- 글자마다 섞이기 시작하는 프레임과 끝나는 프레임을 랜덤으로 정해서 동시에 풀리지 않게.
- 섞이는 중인 글자는 보라색으로 살짝 흐리게, 완성된 글자는 밝은 시안색.
- requestAnimationFrame 으로 구현하고, 여러 문장을 1.6초 간격으로 번갈아 보여줘. 고정폭 글꼴 사용.`,
  },

  /* ───────────────────────── 호버·인터랙션 ───────────────────────── */
  {
    id: 'magnetic-button', cat: 'hover', ko: '마그네틱 버튼', en: 'Magnetic Button', aka: ['자석 버튼', 'Magnet Hover'],
    tech: 'JS', level: 2, hint: 'hover',
    summary: '마우스가 가까이 오면 버튼이 자석처럼 끌려와요.',
    desc: '마우스와 버튼 중심 사이의 거리를 계산해, 일정 범위 안이면 그 거리의 일부만큼 버튼을 이동시켜요. 안쪽 글자는 더 적게 움직여서 입체감이 생깁니다.',
    use: 'CTA 버튼, 크리에이티브 에이전시·포트폴리오 사이트의 내비게이션, 소셜 아이콘',
    tip: '터치 기기에서는 의미가 없으니 (hover: hover) 미디어쿼리나 pointer 이벤트로 마우스일 때만 적용하세요.',
    html: `<button class="magnetic" id="mag"><span>Hover me</span></button>`,
    css: `.magnetic {
  padding: 20px 42px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  color: #fff;
  font-family: inherit;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 12px 34px -10px rgba(139, 92, 246, 0.8);
  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.magnetic span {
  display: inline-block;
  pointer-events: none;
  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}`,
    js: `const btn = document.getElementById('mag');
const label = btn.querySelector('span');
const area = 90; // 버튼 바깥 몇 px 까지 끌어당길지

document.addEventListener('mousemove', function (e) {
  const r = btn.getBoundingClientRect();
  const x = e.clientX - (r.left + r.width / 2);
  const y = e.clientY - (r.top + r.height / 2);
  const near = Math.abs(x) < r.width / 2 + area && Math.abs(y) < r.height / 2 + area;

  btn.style.transform = near ? 'translate(' + x * 0.35 + 'px, ' + y * 0.35 + 'px)' : '';
  label.style.transform = near ? 'translate(' + x * 0.15 + 'px, ' + y * 0.15 + 'px)' : '';
});

document.documentElement.addEventListener('mouseleave', function () {
  btn.style.transform = label.style.transform = '';
});`,
    prompt: `- 마우스가 버튼 주변 90px 안으로 들어오면 버튼이 마우스 쪽으로 끌려가는 마그네틱 버튼을 만들어줘.
- 버튼은 마우스와의 거리의 35%, 안쪽 글자는 15% 만큼 이동해서 입체감이 나게.
- 범위를 벗어나면 cubic-bezier(0.2, 0.8, 0.2, 1) 로 부드럽게 제자리로 돌아오게.
- 버튼은 보라→핑크 그라디언트의 알약 모양, 은은한 보라색 그림자.`,
  },
  {
    id: 'tilt-card', cat: 'hover', ko: '3D 기울기 카드', en: 'Tilt Card', aka: ['패럴랙스 틸트', 'Hover Tilt', 'Vanilla Tilt'],
    tech: 'JS', level: 2, hint: 'hover',
    summary: '마우스 위치를 따라 카드가 입체적으로 기울고 빛이 반사돼요.',
    desc: '카드 안 마우스 위치를 0~1 비율로 구해 rotateX / rotateY 각도로 바꿔요. 같은 좌표로 radial-gradient 하이라이트(글레어)를 움직이면 유리에 빛이 비치는 느낌이 납니다.',
    use: '제품 카드, 멤버십·신용카드 소개, NFT·게임 아이템 카드, 포트폴리오 썸네일',
    tip: 'CSS 변수(--rx, --ry)에 값만 넣고 transform 은 CSS 에서 조합하면 코드가 깔끔하고 transition 도 쉽게 걸 수 있어요.',
    html: `<div class="tilt" id="tilt">
  <div class="tilt-body">
    <span class="chip">PREMIUM</span>
    <h2>Tilt Card</h2>
    <p>마우스를 따라 기울어져요</p>
  </div>
  <div class="glare"></div>
</div>`,
    css: `.tilt {
  position: relative;
  width: min(300px, 72vw);
  aspect-ratio: 16 / 10;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(135deg, #1e1b4b, #4c1d95 55%, #be185d);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.8);
  transform: perspective(800px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
  transition: transform 0.2s ease-out;
}
.tilt-body {
  position: absolute;
  inset: 0;
  padding: 22px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.chip { font-size: 11px; letter-spacing: 0.2em; color: #f9a8d4; }
.tilt h2 { margin: 6px 0 2px; font-size: 26px; }
.tilt p { margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.7); }
.glare {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at var(--gx, 50%) var(--gy, 50%), rgba(255, 255, 255, 0.35), transparent 55%);
  opacity: var(--go, 0);
  transition: opacity 0.3s;
  pointer-events: none;
}`,
    js: `const card = document.getElementById('tilt');
const max = 14; // 최대 기울기(도)

card.addEventListener('mousemove', function (e) {
  const r = card.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width;   // 0 ~ 1
  const py = (e.clientY - r.top) / r.height;
  card.style.setProperty('--ry', (px - 0.5) * max * 2 + 'deg');
  card.style.setProperty('--rx', (0.5 - py) * max * 2 + 'deg');
  card.style.setProperty('--gx', px * 100 + '%');
  card.style.setProperty('--gy', py * 100 + '%');
  card.style.setProperty('--go', 1);
});

card.addEventListener('mouseleave', function () {
  card.style.setProperty('--rx', '0deg');
  card.style.setProperty('--ry', '0deg');
  card.style.setProperty('--go', 0);
});`,
    prompt: `- 마우스 위치에 따라 카드가 최대 14도까지 3D 로 기울어지는 틸트 카드를 만들어줘.
- transform: perspective(800px) rotateX() rotateY() 를 CSS 변수(--rx, --ry)로 제어.
- 마우스 위치에 흰색 radial-gradient 글레어가 따라다니고, 마우스가 나가면 카드가 원위치 + 글레어가 사라지게.
- 카드는 남색→보라→핑크 그라디언트, 둥근 모서리, 하단에 작은 라벨·제목·설명.`,
  },
  {
    id: 'spotlight-card', cat: 'hover', ko: '스포트라이트 카드', en: 'Spotlight Hover', aka: ['마우스 글로우', 'Glow Border Card', 'Cursor Glow'],
    tech: 'CSS + JS', level: 2, hint: 'hover',
    summary: '마우스 주변만 은은하게 빛나고, 카드 테두리도 함께 밝아져요.',
    desc: '컨테이너에서 mousemove 를 받아 각 카드 기준 마우스 좌표를 CSS 변수로 넣어요. ::before 는 안쪽 빛, ::after 는 mask 로 테두리 1px 만 남긴 빛이라 카드 사이를 지나갈 때 옆 카드 테두리까지 이어져 빛나요.',
    use: '기능 소개 그리드, 요금제 카드, 대시보드 위젯 (Vercel·Linear 스타일)',
    tip: '마우스 좌표만 JS 로 넘기고 그리기는 전부 CSS 가 하므로 가볍습니다. mask-composite 는 -webkit- 접두사도 함께 써주세요.',
    html: `<div class="spot-grid" id="grid">
  <div class="spot"><b>빠른 속도</b><p>엣지에서 바로 응답해요</p></div>
  <div class="spot"><b>안전한 보안</b><p>모든 요청을 암호화해요</p></div>
  <div class="spot"><b>쉬운 배포</b><p>푸시하면 자동 배포</p></div>
</div>`,
    css: `.spot-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  width: min(660px, 92vw);
}
.spot {
  --x: 50%;
  --y: 50%;
  position: relative;
  padding: clamp(14px, 3vw, 26px);
  border-radius: 16px;
  background: #11111c;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
}
.spot b { position: relative; font-size: clamp(14px, 2.4vw, 18px); }
.spot p { position: relative; margin: 6px 0 0; font-size: 13px; color: #8b8fb0; }
.spot::before,
.spot::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  opacity: 0;
  transition: opacity 0.3s;
}
.spot::before {
  background: radial-gradient(260px circle at var(--x) var(--y), rgba(139, 92, 246, 0.22), transparent 60%);
}
.spot::after {
  padding: 1px;
  background: radial-gradient(200px circle at var(--x) var(--y), rgba(196, 181, 253, 0.9), transparent 60%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}
.spot-grid:hover .spot::before,
.spot-grid:hover .spot::after { opacity: 1; }`,
    js: `document.getElementById('grid').addEventListener('mousemove', function (e) {
  this.querySelectorAll('.spot').forEach(function (card) {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--x', e.clientX - r.left + 'px');
    card.style.setProperty('--y', e.clientY - r.top + 'px');
  });
});`,
    prompt: `- 어두운 카드 3개가 나란히 있는 그리드에서, 마우스 주변만 보라색으로 은은하게 빛나는 스포트라이트 효과를 만들어줘.
- 카드 내부엔 radial-gradient 빛(::before), 카드 테두리 1px 에도 같은 위치의 빛(::after + mask-composite)이 보이게.
- 그리드 전체에서 마우스 좌표를 받아 모든 카드에 각 카드 기준 좌표를 CSS 변수(--x, --y)로 넣어, 카드 사이를 지나갈 때 옆 카드 테두리도 함께 빛나게.
- Vercel / Linear 사이트 같은 세련된 다크 톤.`,
  },
  {
    id: 'ripple', cat: 'hover', ko: '물결 클릭', en: 'Ripple Effect', aka: ['머티리얼 리플', 'Click Ripple', 'Ink Ripple'],
    tech: 'JS', level: 1, hint: 'click',
    summary: '클릭한 지점에서 물결이 동그랗게 퍼져나가요.',
    desc: '클릭 좌표에 원형 span 을 만들고 scale(0) → scale(4) 로 키우면서 투명하게 사라지게 해요. 애니메이션이 끝나면 요소를 지워 DOM 이 쌓이지 않게 합니다.',
    use: '버튼·리스트 아이템 클릭 피드백 (구글 머티리얼 디자인), 모바일 웹앱',
    tip: '버튼에 overflow: hidden 과 position: relative 가 꼭 있어야 물결이 버튼 밖으로 나가지 않아요.',
    html: `<div class="row">
  <button class="ripple-btn">Click me</button>
  <button class="ripple-btn ghost">여기도 클릭</button>
</div>`,
    css: `.row { display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; }
.ripple-btn {
  position: relative;
  overflow: hidden;
  padding: 16px 34px;
  border: 0;
  border-radius: 14px;
  background: #6d28d9;
  color: #fff;
  font-family: inherit;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
}
.ripple-btn.ghost {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.25);
}
.ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.45);
  transform: scale(0);
  animation: ripple 0.65s ease-out;
  pointer-events: none;
}
@keyframes ripple { to { transform: scale(4); opacity: 0; } }`,
    js: `document.querySelectorAll('.ripple-btn').forEach(function (btn) {
  btn.addEventListener('click', function (e) {
    const r = btn.getBoundingClientRect();
    const size = Math.max(r.width, r.height);
    const dot = document.createElement('span');
    dot.className = 'ripple';
    dot.style.width = dot.style.height = size + 'px';
    dot.style.left = e.clientX - r.left - size / 2 + 'px';
    dot.style.top = e.clientY - r.top - size / 2 + 'px';
    btn.appendChild(dot);
    dot.addEventListener('animationend', function () { dot.remove(); });
  });
});`,
    prompt: `- 버튼을 클릭하면 클릭한 위치에서 흰색 반투명 원이 퍼져나가며 사라지는 머티리얼 리플 효과를 만들어줘.
- 원 크기는 버튼의 긴 변 기준, scale(0) → scale(4) + opacity 0 으로 0.65초.
- 애니메이션이 끝나면 생성한 span 을 제거하고, 여러 번 연타해도 자연스럽게 겹치게.
- .ripple-btn 클래스만 붙이면 어떤 버튼에도 적용되게 만들어줘.`,
  },

  /* ───────────────────────── 스크롤 ───────────────────────── */
  {
    id: 'scroll-reveal', cat: 'scroll', ko: '스크롤 등장', en: 'Scroll Reveal', aka: ['페이드 인 업', 'Fade In on Scroll', 'AOS'],
    tech: 'JS', level: 1, hint: 'scroll',
    summary: '스크롤해서 화면에 들어오는 요소가 아래에서 떠오르며 나타나요.',
    desc: 'IntersectionObserver 로 요소가 화면에 들어왔는지 감지해 .visible 클래스를 붙여요. 애니메이션 자체는 CSS transition 이 담당해서 스크롤 이벤트보다 훨씬 가볍습니다.',
    use: '랜딩 페이지 섹션, 기능 목록, 포트폴리오 작업물 — 거의 모든 마케팅 페이지',
    tip: '한 번만 나타나게 하려면 isIntersecting 일 때 classList.add 후 unobserve 하세요. 너무 많은 요소에 쓰면 오히려 산만해져요.',
    html: `<p class="hint">↓ 스크롤해 보세요</p>
<section class="list">
  <div class="item reveal">01 · 아이디어</div>
  <div class="item reveal">02 · 디자인</div>
  <div class="item reveal">03 · 개발</div>
  <div class="item reveal">04 · 테스트</div>
  <div class="item reveal">05 · 배포</div>
  <div class="item reveal">06 · 성장</div>
</section>`,
    css: `body { display: block; padding: 0 20px; }
.hint { margin: 38vh 0 50vh; text-align: center; color: #8b8fb0; }
.item {
  max-width: 440px;
  margin: 0 auto 18px;
  padding: 24px;
  border-radius: 16px;
  background: linear-gradient(135deg, #1e1b4b, #312e81);
  font-size: 18px;
  font-weight: 700;
  opacity: 0;
  transform: translateY(48px) scale(0.96);
  transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.item:nth-child(even) { background: linear-gradient(135deg, #3b0764, #831843); }
.item.visible { opacity: 1; transform: none; }
.list { padding-bottom: 40vh; }`,
    js: `const io = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    // 데모라서 다시 올라가면 사라지게(toggle). 한 번만 보이게 하려면 add + unobserve
    entry.target.classList.toggle('visible', entry.isIntersecting);
  });
}, { threshold: 0.2 });

document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });`,
    prompt: `- 스크롤해서 요소가 화면에 20% 이상 보이면 아래에서 위로 떠오르며(translateY 48px → 0, scale 0.96 → 1) 페이드 인 되게 해줘.
- 스크롤 이벤트 대신 IntersectionObserver 를 쓰고, 애니메이션은 CSS transition 으로.
- .reveal 클래스만 붙이면 어떤 요소에도 적용되게.
- 옵션으로 한 번만 나타나기 / 스크롤할 때마다 반복 둘 다 쉽게 바꿀 수 있게 주석으로 알려줘.`,
  },
  {
    id: 'parallax', cat: 'scroll', ko: '패럴랙스', en: 'Parallax Scrolling', aka: ['시차 스크롤', '레이어 스크롤'],
    tech: 'JS', level: 2, hint: 'scroll',
    summary: '레이어마다 스크롤 속도가 달라 깊이감이 생겨요.',
    desc: '멀리 있는 레이어일수록 스크롤 양에 큰 계수를 곱해 아래로 밀어줘요. 결과적으로 먼 산과 달은 천천히, 가까운 산은 빠르게 지나가 보여 입체감이 생깁니다.',
    use: '스토리텔링 랜딩 페이지, 게임·영화 프로모션, 여행·자연 브랜드 히어로',
    tip: 'transform 만 바꾸고(top·margin 금지) requestAnimationFrame 으로 묶어야 버벅이지 않아요. 모바일에서는 효과를 줄이는 것도 방법.',
    html: `<section class="scene">
  <div class="layer sky"></div>
  <div class="layer moon" data-speed="0.8"></div>
  <div class="layer far" data-speed="0.55"></div>
  <h1 class="layer title" data-speed="0.35">PARALLAX</h1>
  <div class="layer near" data-speed="0.1"></div>
</section>
<section class="after"><p>↑ 레이어마다 스크롤 속도가 달라요</p></section>`,
    css: `body { display: block; }
.scene { position: relative; height: 100vh; overflow: hidden; }
.layer { position: absolute; left: 0; right: 0; will-change: transform; }
.sky { inset: 0; background: linear-gradient(#0f0c29, #302b63 55%, #f472b6); }
.moon {
  top: 12%;
  left: auto;
  right: 18%;
  width: clamp(48px, 12vw, 110px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #fff7ed, #fdba74);
  box-shadow: 0 0 60px #fdba74;
}
.far {
  bottom: 0;
  height: 60%;
  background: #5b21b6;
  clip-path: polygon(0 60%, 15% 30%, 30% 55%, 48% 15%, 65% 50%, 80% 25%, 100% 55%, 100% 100%, 0 100%);
}
.title {
  top: 36%;
  margin: 0;
  text-align: center;
  font-size: clamp(34px, 10vw, 96px);
  font-weight: 900;
  letter-spacing: 0.1em;
  text-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
}
.near {
  bottom: -2px;
  height: 42%;
  background: #0b0b14;
  clip-path: polygon(0 50%, 12% 30%, 25% 60%, 40% 35%, 58% 65%, 75% 30%, 90% 55%, 100% 40%, 100% 100%, 0 100%);
}
.after { min-height: 100vh; display: grid; place-items: center; color: #a5a8c8; }`,
    js: `const layers = document.querySelectorAll('[data-speed]');

function update() {
  const y = window.scrollY;
  layers.forEach(function (el) {
    // speed 가 클수록 스크롤을 따라 내려가서 = 천천히 지나가 보임 = 멀리 있어 보임
    el.style.transform = 'translateY(' + y * el.dataset.speed + 'px)';
  });
}
window.addEventListener('scroll', function () { requestAnimationFrame(update); }, { passive: true });
update();`,
    prompt: `- 밤하늘 히어로 섹션에 패럴랙스 스크롤을 만들어줘: 하늘(그라디언트) · 달 · 먼 산 · 큰 제목 · 가까운 산 5개 레이어.
- 각 레이어에 data-speed(0.8, 0.55, 0.35, 0.1)를 주고, scrollY × speed 만큼 translateY 해서 멀수록 천천히 움직이게.
- 산은 이미지 없이 clip-path: polygon() 으로 그려줘.
- scroll 이벤트는 passive + requestAnimationFrame 으로 최적화.`,
  },
  {
    id: 'scroll-progress', cat: 'scroll', ko: '스크롤 진행바', en: 'Scroll Progress Bar', aka: ['읽기 진행률', 'Reading Progress'],
    tech: 'CSS', level: 1, hint: 'scroll',
    summary: '페이지를 얼마나 읽었는지 상단 막대가 차오르며 보여줘요.',
    desc: '최신 CSS 의 scroll-driven animation(animation-timeline: scroll())을 쓰면 JS 없이 스크롤 위치에 애니메이션을 연결할 수 있어요. 지원하지 않는 브라우저를 위해 JS 대체 코드도 함께 넣었습니다.',
    use: '블로그·뉴스 기사, 긴 문서, 튜토리얼 페이지',
    tip: 'width 대신 transform: scaleX() 를 쓰면 레이아웃 재계산이 없어 훨씬 부드러워요.',
    html: `<div class="progress"></div>
<article>
  <h1>스크롤 진행바</h1>
  <p class="lead">아래로 스크롤하면 상단 막대가 차올라요.</p>
  <div class="line"></div><div class="line w80"></div><div class="line w60"></div>
  <div class="block"></div>
  <div class="line"></div><div class="line w90"></div><div class="line w70"></div><div class="line"></div>
  <div class="block"></div>
  <div class="line w80"></div><div class="line"></div><div class="line w50"></div>
</article>`,
    css: `body { display: block; }
.progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  z-index: 10;
  background: linear-gradient(90deg, #22d3ee, #8b5cf6, #f472b6);
  transform-origin: 0 50%;
  transform: scaleX(0);
  animation: grow linear both;
  animation-timeline: scroll(root);
}
@keyframes grow { to { transform: scaleX(1); } }
article { max-width: 560px; margin: 0 auto; padding: 40px 24px 80px; }
article h1 { margin: 0 0 6px; font-size: 28px; }
.lead { margin: 0 0 24px; color: #8b8fb0; }
.line { height: 12px; margin: 14px 0; border-radius: 6px; background: #1c1c2e; }
.w90 { width: 90%; } .w80 { width: 80%; } .w70 { width: 70%; } .w60 { width: 60%; } .w50 { width: 50%; }
.block { height: 160px; margin: 26px 0; border-radius: 14px; background: linear-gradient(135deg, #1e1b4b, #3b0764); }`,
    js: `// animation-timeline 을 지원하지 않는 브라우저용 대체 코드
if (!CSS.supports('animation-timeline: scroll()')) {
  const bar = document.querySelector('.progress');
  bar.style.animation = 'none';
  window.addEventListener('scroll', function () {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (window.scrollY / max) + ')';
  }, { passive: true });
}`,
    prompt: `- 페이지 맨 위에 고정된 5px 높이의 스크롤 진행바를 만들어줘. 시안→보라→핑크 그라디언트.
- CSS scroll-driven animation(animation-timeline: scroll(root))으로 JS 없이 구현하고, transform: scaleX 로 채워지게.
- 지원하지 않는 브라우저에서는 CSS.supports 로 감지해서 scroll 이벤트 기반 JS 로 대체.`,
  },
  {
    id: 'count-up', cat: 'scroll', ko: '숫자 카운트업', en: 'Count Up', aka: ['숫자 롤링', 'Number Counter', 'Animated Counter'],
    tech: 'JS', level: 1, hint: 'auto',
    summary: '화면에 보이는 순간 숫자가 0부터 목표값까지 빠르게 올라가요.',
    desc: 'IntersectionObserver 로 숫자가 보일 때 한 번만 시작하고, requestAnimationFrame 으로 경과 시간 비율에 easeOutCubic 을 적용해 처음엔 빠르고 끝에선 천천히 멈추게 해요.',
    use: '회사 소개의 실적 숫자, 통계·성과 섹션, 대시보드 요약',
    tip: 'font-variant-numeric: tabular-nums 로 숫자 폭을 고정해야 올라가는 동안 글자가 흔들리지 않아요.',
    html: `<div class="stats">
  <div class="stat"><b data-count="12800">0</b><span>누적 고객</span></div>
  <div class="stat"><b data-count="98" data-suffix="%">0</b><span>만족도</span></div>
  <div class="stat"><b data-count="24" data-suffix="h">0</b><span>평균 응답</span></div>
</div>`,
    css: `.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(14px, 4vw, 40px);
  text-align: center;
}
.stat b {
  display: block;
  font-size: clamp(30px, 7vw, 64px);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  background: linear-gradient(180deg, #fff, #a78bfa);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.stat span { font-size: 14px; color: #8b8fb0; }`,
    js: `function countUp(el) {
  const target = Number(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const duration = 1800;
  const start = performance.now();

  (function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic: 빠르게 시작 → 천천히 멈춤
    el.textContent = Math.round(target * eased).toLocaleString() + suffix;
    if (t < 1) requestAnimationFrame(frame);
  })(start);
}

const io = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) { countUp(entry.target); io.unobserve(entry.target); }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(function (el) { io.observe(el); });`,
    prompt: `- 통계 숫자 3개(누적 고객 12,800 / 만족도 98% / 평균 응답 24h)가 화면에 보이는 순간 0부터 목표값까지 1.8초 동안 올라가게 해줘.
- data-count, data-suffix 속성으로 목표값과 단위를 지정. 천 단위 쉼표 표시.
- easeOutCubic 이징, requestAnimationFrame 사용, IntersectionObserver 로 한 번만 실행.
- 숫자는 흰색→연보라 그라디언트 텍스트, tabular-nums 로 폭 고정.`,
  },

  /* ───────────────────────── 배경 ───────────────────────── */
  {
    id: 'aurora', cat: 'bg', ko: '오로라 배경', en: 'Aurora Background', aka: ['그라디언트 블러', 'Blurry Gradient', 'Animated Blobs'],
    tech: 'CSS', level: 1, hint: 'auto',
    summary: '흐릿한 색 덩어리들이 천천히 떠다니며 오로라처럼 섞여요.',
    desc: '큰 원 3개를 각기 다른 색·주기로 움직이고, 부모에 filter: blur() 를 강하게 걸어 경계를 없애요. mix-blend-mode: screen 으로 겹치는 부분이 밝게 섞입니다.',
    use: 'SaaS·AI 서비스 히어로 배경, 로그인 페이지, 앱 다운로드 섹션',
    tip: '큰 blur 는 GPU 를 많이 써요. 원 개수를 3~4개로 제한하고, 애니메이션은 transform 만 사용하세요.',
    html: `<div class="aurora"><span></span><span></span><span></span></div>
<h1 class="aurora-title">Aurora</h1>`,
    css: `body { overflow: hidden; }
.aurora {
  position: fixed;
  inset: -20%;
  filter: blur(60px) saturate(140%);
}
.aurora span {
  position: absolute;
  width: 55vmax;
  height: 55vmax;
  border-radius: 50%;
  mix-blend-mode: screen;
  opacity: 0.75;
  animation: drift 14s ease-in-out infinite alternate;
}
.aurora span:nth-child(1) { top: 0; left: 5%; background: #7c3aed; }
.aurora span:nth-child(2) { top: 20%; right: 0; background: #06b6d4; animation-duration: 18s; animation-delay: -4s; }
.aurora span:nth-child(3) { bottom: 0; left: 30%; background: #db2777; animation-duration: 22s; animation-delay: -8s; }
@keyframes drift {
  0%   { transform: translate(0, 0) scale(1); }
  50%  { transform: translate(12%, -10%) scale(1.15); }
  100% { transform: translate(-10%, 12%) scale(0.9); }
}
.aurora-title {
  position: relative;
  margin: 0;
  font-size: clamp(44px, 11vw, 110px);
  font-weight: 800;
  letter-spacing: -0.03em;
}`,
    js: ``,
    prompt: `- 보라(#7c3aed) · 시안(#06b6d4) · 핑크(#db2777) 큰 원 3개가 서로 다른 주기(14s, 18s, 22s)로 천천히 떠다니는 오로라 배경을 만들어줘.
- 부모 요소에 filter: blur(60px) 를 걸어 경계 없이 섞이게 하고, mix-blend-mode: screen 사용.
- 배경 위 가운데에 큰 흰색 제목. CSS 만 사용하고 transform 만 애니메이션.`,
  },
  {
    id: 'particles', cat: 'bg', ko: '파티클 네트워크', en: 'Particle Network', aka: ['파티클 배경', 'particles.js', 'Constellation'],
    tech: 'Canvas', level: 3, hint: 'hover',
    summary: '떠다니는 점들이 가까워지면 선으로 이어지고 마우스에 반응해요.',
    desc: 'canvas 에 점을 무작위로 뿌리고 매 프레임 이동시켜요. 두 점 사이 거리가 가까우면 거리에 비례한 투명도로 선을 긋고, 마우스와 가까운 점은 시안색 선으로 이어 별자리처럼 보이게 합니다.',
    use: '테크·AI·블록체인 서비스 히어로, 개발자 포트폴리오 배경',
    tip: '점 개수는 화면 넓이에 비례하게(넓이 ÷ 9000 정도) 정하고, devicePixelRatio 를 반영해야 레티나에서 흐리지 않아요.',
    html: `<canvas id="particles"></canvas>
<h1 class="p-title">Particles</h1>`,
    css: `canvas { position: fixed; inset: 0; width: 100%; height: 100%; }
.p-title {
  position: relative;
  margin: 0;
  font-size: clamp(34px, 9vw, 80px);
  font-weight: 800;
  pointer-events: none;
}`,
    js: `const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
const mouse = { x: -999, y: -999 };
let w, h, dots;

function resize() {
  const dpr = window.devicePixelRatio || 1;
  w = canvas.clientWidth; h = canvas.clientHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = Math.round((w * h) / 9000);
  dots = [];
  for (let i = 0; i < count; i++) {
    dots.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.6 });
  }
}

function draw() {
  ctx.clearRect(0, 0, w, h);
  dots.forEach(function (d, i) {
    d.x += d.vx; d.y += d.vy;
    if (d.x < 0 || d.x > w) d.vx *= -1;
    if (d.y < 0 || d.y > h) d.vy *= -1;

    ctx.fillStyle = '#a78bfa';
    ctx.beginPath(); ctx.arc(d.x, d.y, 1.8, 0, Math.PI * 2); ctx.fill();

    for (let j = i + 1; j < dots.length; j++) {           // 가까운 점끼리 선 잇기
      const o = dots[j];
      const dist = Math.hypot(d.x - o.x, d.y - o.y);
      if (dist < 110) {
        ctx.strokeStyle = 'rgba(167, 139, 250, ' + (1 - dist / 110) * 0.5 + ')';
        ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(o.x, o.y); ctx.stroke();
      }
    }
    const md = Math.hypot(d.x - mouse.x, d.y - mouse.y);  // 마우스와 잇기
    if (md < 150) {
      ctx.strokeStyle = 'rgba(34, 211, 238, ' + (1 - md / 150) + ')';
      ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
    }
  });
  requestAnimationFrame(draw);
}

window.addEventListener('resize', resize);
window.addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
document.documentElement.addEventListener('mouseleave', function () { mouse.x = mouse.y = -999; });
resize();
draw();`,
    prompt: `- 전체 화면 canvas 에 연보라 점들이 천천히 떠다니고, 110px 보다 가까운 점끼리는 거리에 비례한 투명도의 선으로 이어지는 파티클 네트워크 배경을 만들어줘.
- 마우스 150px 안의 점들은 마우스 위치와 시안색 선으로 연결.
- 점 개수는 화면 넓이 ÷ 9000, devicePixelRatio 반영, 창 크기 바뀌면 다시 계산.
- 라이브러리 없이 순수 Canvas 2D + requestAnimationFrame.`,
  },
  {
    id: 'blob', cat: 'bg', ko: '블롭 모핑', en: 'Blob Morph', aka: ['유기적 도형', 'Liquid Shape', 'Morphing Blob'],
    tech: 'CSS', level: 1, hint: 'auto',
    summary: '말랑한 젤리 같은 도형이 계속 모양을 바꾸며 돌아요.',
    desc: 'border-radius 에 8개 값(가로/세로 반지름)을 넣으면 찌그러진 유기적 도형이 돼요. 키프레임마다 이 값을 바꾸고 회전을 함께 주면 액체처럼 꿀렁이는 도형이 됩니다.',
    use: '히어로 일러스트 대체, 프로필 사진 마스크, 섹션 장식 배경',
    tip: '이미지에 적용하면 프로필 사진도 블롭 모양으로 만들 수 있어요(overflow: hidden + 같은 border-radius).',
    html: `<div class="blob"></div>`,
    css: `.blob {
  width: min(250px, 55vmin);
  aspect-ratio: 1;
  background: linear-gradient(135deg, #8b5cf6, #ec4899 50%, #f59e0b);
  border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%;
  box-shadow: 0 0 90px rgba(236, 72, 153, 0.45);
  animation: morph 8s ease-in-out infinite, spin 20s linear infinite;
}
@keyframes morph {
  0%, 100% { border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%; }
  33%      { border-radius: 70% 30% 46% 54% / 30% 29% 71% 70%; }
  66%      { border-radius: 28% 72% 35% 65% / 58% 64% 36% 42%; }
}
@keyframes spin { to { transform: rotate(360deg); } }`,
    js: ``,
    prompt: `- 보라→핑크→주황 그라디언트의 말랑한 블롭 도형이 계속 모양이 바뀌며 천천히 회전하게 만들어줘.
- border-radius 8개 값(예: 42% 58% 70% 30% / 45% 45% 55% 55%)을 키프레임마다 바꿔서 8초 주기로 모핑, 회전은 20초.
- 주변에 같은 색의 은은한 글로우 그림자. CSS 만 사용.`,
  },
  {
    id: 'retro-grid', cat: 'bg', ko: '레트로 그리드', en: 'Retro Grid', aka: ['신스웨이브 바닥', 'Synthwave Grid', 'Perspective Grid'],
    tech: 'CSS', level: 2, hint: 'auto',
    summary: '네온 격자 바닥이 지평선 너머로 끝없이 흘러가요.',
    desc: '격자 무늬를 background 로 그린 바닥을 rotateX 로 눕혀 원근감을 주고, background-position 을 격자 한 칸만큼 반복 이동해 앞으로 달리는 듯한 효과를 내요. 위쪽은 mask 로 흐리게 해 지평선을 만듭니다.',
    use: '80년대·신스웨이브 콘셉트, 게임·음악 이벤트 페이지, 이스포츠',
    tip: '이동 거리를 정확히 격자 크기(48px)와 맞춰야 반복할 때 끊김이 없어요.',
    html: `<div class="retro"><div class="floor"></div></div>
<h1 class="retro-title">RETRO GRID</h1>`,
    css: `body {
  overflow: hidden;
  background: radial-gradient(ellipse at 50% 0%, #3b0764, #0b0b14 70%);
}
.retro { position: fixed; inset: 0; perspective: 300px; overflow: hidden; }
.floor {
  position: absolute;
  left: -50%;
  right: -50%;
  bottom: -10%;
  height: 70%;
  background-image:
    linear-gradient(rgba(236, 72, 153, 0.75) 1px, transparent 1px),
    linear-gradient(90deg, rgba(236, 72, 153, 0.75) 1px, transparent 1px);
  background-size: 48px 48px;
  transform: rotateX(65deg);
  transform-origin: 50% 100%;
  -webkit-mask-image: linear-gradient(transparent, #000 60%);
  mask-image: linear-gradient(transparent, #000 60%);
  animation: run 1.2s linear infinite;
}
@keyframes run { to { background-position: 0 48px; } }
.retro-title {
  position: relative;
  margin: 0 0 18vh;
  font-size: clamp(34px, 9vw, 86px);
  font-weight: 900;
  font-style: italic;
  letter-spacing: 0.06em;
  background: linear-gradient(#fde68a, #f472b6 60%, #8b5cf6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 0 18px rgba(244, 114, 182, 0.6));
}`,
    js: ``,
    prompt: `- 신스웨이브 스타일의 네온 핑크 격자 바닥이 지평선 너머로 계속 흘러가는 배경을 만들어줘.
- 격자는 linear-gradient 두 개로 48px 간격, perspective + rotateX(65deg) 로 바닥처럼 눕히기.
- background-position 을 0 → 48px 로 1.2초 linear 반복해서 앞으로 달리는 느낌, 위쪽은 mask-image 로 페이드.
- 가운데에 노랑→핑크→보라 그라디언트의 이탤릭 굵은 제목 + 네온 글로우. CSS 만 사용.`,
  },

  /* ───────────────────────── UI 스타일 ───────────────────────── */
  {
    id: 'glassmorphism', cat: 'ui', ko: '글래스모피즘', en: 'Glassmorphism', aka: ['유리 효과', 'Frosted Glass', '반투명 블러'],
    tech: 'CSS', level: 1, hint: 'auto',
    summary: '뒤 배경이 뿌옇게 비치는 반투명 유리 카드예요.',
    desc: 'backdrop-filter: blur() 로 요소 뒤의 배경을 흐리게 하고, 반투명 흰 배경 + 얇은 밝은 테두리 + 위쪽 안쪽 하이라이트로 유리판 느낌을 내요. 뒤에 화려한 색이 있어야 효과가 살아납니다.',
    use: '카드·모달·내비게이션 바, 음악/날씨 위젯, Apple(visionOS) 스타일 UI',
    tip: '배경이 단색이면 효과가 거의 안 보여요. 텍스트 대비가 충분한지 꼭 확인하고, Safari 용 -webkit-backdrop-filter 도 함께 쓰세요.',
    html: `<div class="orb o1"></div>
<div class="orb o2"></div>
<div class="glass">
  <span class="g-chip">PREMIUM PLAN</span>
  <h2>Glass Card</h2>
  <p>배경이 비치는 반투명 유리 카드</p>
  <div class="g-row"><b>₩29,000<small>/월</small></b><button>구독하기</button></div>
</div>`,
    css: `body { overflow: hidden; }
.orb { position: fixed; border-radius: 50%; }
.o1 {
  top: 10%; left: 16%;
  width: 42vmin; height: 42vmin;
  background: linear-gradient(135deg, #f472b6, #8b5cf6);
  animation: float 6s ease-in-out infinite;
}
.o2 {
  bottom: 8%; right: 16%;
  width: 32vmin; height: 32vmin;
  background: linear-gradient(135deg, #22d3ee, #3b82f6);
  animation: float 7s ease-in-out infinite reverse;
}
@keyframes float { 50% { transform: translateY(-18px); } }
.glass {
  position: relative;
  width: min(310px, 82vw);
  padding: 24px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.22);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  backdrop-filter: blur(18px) saturate(160%);
  box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.25);
}
.g-chip { font-size: 11px; letter-spacing: 0.16em; color: #fbcfe8; }
.glass h2 { margin: 8px 0 4px; font-size: 24px; }
.glass p { margin: 0 0 18px; font-size: 14px; color: rgba(255, 255, 255, 0.72); }
.g-row { display: flex; align-items: center; justify-content: space-between; }
.g-row small { font-size: 12px; font-weight: 400; opacity: 0.7; }
.g-row button {
  padding: 10px 18px;
  border: 0;
  border-radius: 12px;
  background: #fff;
  color: #111;
  font-family: inherit;
  font-weight: 700;
  cursor: pointer;
}`,
    js: ``,
    prompt: `- 화려한 그라디언트 원 2개가 천천히 떠다니는 어두운 배경 위에 글래스모피즘 요금제 카드를 만들어줘.
- 카드: rgba(255,255,255,0.08) 배경, backdrop-filter: blur(18px) saturate(160%), 1px 반투명 흰 테두리, 위쪽 안쪽 하이라이트(inset box-shadow).
- 카드 안: 작은 라벨, 제목, 설명, 가격과 흰색 구독 버튼.
- Safari 용 -webkit-backdrop-filter 포함.`,
  },
  {
    id: 'neumorphism', cat: 'ui', ko: '뉴모피즘', en: 'Neumorphism', aka: ['소프트 UI', 'Soft UI', 'Neomorphism'],
    tech: 'CSS', level: 1, hint: 'click',
    summary: '배경에서 튀어나오거나 눌린 듯한 부드러운 입체 UI예요.',
    desc: '요소와 배경을 같은 색으로 두고, 왼쪽 위엔 밝은 그림자·오른쪽 아래엔 어두운 그림자를 줘서 튀어나와 보이게 해요. 그림자를 inset 으로 바꾸면 눌린 상태가 됩니다.',
    use: '스마트홈·음악 플레이어 컨트롤, 계산기, 대시보드 다이얼',
    tip: '대비가 낮아 접근성이 약한 스타일이에요. 중요한 버튼에는 색 포인트(활성 색)를 함께 주세요.',
    html: `<div class="neu-wrap">
  <div class="neu-card"><div class="neu-dial"><span>72</span><small>%</small></div></div>
  <button class="neu-btn" aria-pressed="false" aria-label="전원">
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 3v8"/><path d="M6.3 7.5a8 8 0 1 0 11.4 0"/></svg>
  </button>
</div>`,
    css: `body { background: #1e1f26; }
.neu-wrap { display: flex; gap: 30px; align-items: center; }
.neu-card {
  padding: 20px;
  border-radius: 28px;
  background: #1e1f26;
  box-shadow: 10px 10px 22px #121318, -10px -10px 22px #2a2b34;
}
.neu-dial {
  width: 120px; height: 120px;
  display: flex; align-items: baseline; justify-content: center;
  padding-top: 38px;
  border-radius: 50%;
  background: #1e1f26;
  box-shadow: inset 8px 8px 16px #121318, inset -8px -8px 16px #2a2b34;
  color: #a78bfa;
}
.neu-dial span { font-size: 36px; font-weight: 800; }
.neu-dial small { font-size: 14px; opacity: 0.7; }
.neu-btn {
  width: 74px; height: 74px;
  display: grid; place-items: center;
  border: 0;
  border-radius: 50%;
  background: #1e1f26;
  color: #6b6f88;
  cursor: pointer;
  box-shadow: 8px 8px 16px #121318, -8px -8px 16px #2a2b34;
  transition: box-shadow 0.2s, color 0.2s, filter 0.2s;
}
.neu-btn[aria-pressed="true"] {
  color: #22d3ee;
  filter: drop-shadow(0 0 8px rgba(34, 211, 238, 0.6));
  box-shadow: inset 6px 6px 12px #121318, inset -6px -6px 12px #2a2b34;
}`,
    js: `const btn = document.querySelector('.neu-btn');
btn.addEventListener('click', function () {
  btn.setAttribute('aria-pressed', btn.getAttribute('aria-pressed') !== 'true');
});`,
    prompt: `- 어두운 배경(#1e1f26)에서 뉴모피즘 스타일의 다이얼 카드와 전원 버튼을 만들어줘.
- 튀어나온 요소: 오른쪽 아래 어두운 그림자 + 왼쪽 위 밝은 그림자. 눌린 요소: 같은 그림자를 inset 으로.
- 다이얼은 안으로 파인 원 안에 "72%" 숫자(연보라).
- 전원 버튼은 클릭하면 aria-pressed 가 토글되며 눌린 모양 + 시안색 아이콘 글로우로 바뀌게.`,
  },
  {
    id: 'bento-grid', cat: 'ui', ko: '벤토 그리드', en: 'Bento Grid', aka: ['도시락 레이아웃', 'Bento Box Layout'],
    tech: 'CSS', level: 1, hint: 'hover',
    summary: '크기가 다른 칸을 도시락처럼 조합한 카드 레이아웃이에요.',
    desc: 'CSS Grid 에서 일부 칸만 grid-column / grid-row: span 으로 크게 만들어 리듬감 있는 배치를 만들어요. 각 칸에 서로 다른 그라디언트를 주고 호버 시 살짝 떠오르게 했습니다.',
    use: '제품 기능 소개(Apple 발표 스타일), 포트폴리오 요약, 대시보드 홈',
    tip: '모바일에서는 grid-template-columns 를 1~2열로 바꾸고 span 을 해제하는 미디어쿼리를 꼭 넣으세요.',
    html: `<div class="bento">
  <div class="b b1"><b>Bento Grid</b><span>크기가 다른 칸을 조합한 레이아웃</span></div>
  <div class="b b2"><b>98%</b><span>만족도</span></div>
  <div class="b b3"><b>0.8s</b><span>평균 로딩</span></div>
  <div class="b b4"><b>24/7</b><span>고객 지원</span></div>
</div>`,
    css: `.bento {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: minmax(84px, auto);
  gap: 10px;
  width: min(620px, 92vw);
}
.b {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 4px;
  padding: 16px;
  border-radius: 18px;
  background: #14141f;
  border: 1px solid rgba(255, 255, 255, 0.07);
  transition: transform 0.3s, border-color 0.3s;
}
.b:hover { transform: translateY(-4px); border-color: rgba(167, 139, 250, 0.55); }
.b b { font-size: clamp(16px, 3vw, 26px); }
.b span { font-size: 12px; color: #a5a8c8; }
.b1 { grid-column: span 2; grid-row: span 2; background: linear-gradient(135deg, #4c1d95, #1e1b4b); }
.b2 { background: linear-gradient(135deg, #0e7490, #14141f); }
.b3 { grid-row: span 2; background: linear-gradient(160deg, #9d174d, #14141f); }`,
    js: ``,
    prompt: `- 4열 CSS Grid 로 벤토 그리드 레이아웃을 만들어줘: 큰 칸(2×2) 1개, 세로로 긴 칸(1×2) 1개, 작은 칸 2개.
- 칸마다 다른 어두운 그라디언트 배경, 둥근 모서리, 아래쪽에 큰 숫자/제목과 작은 설명.
- 호버하면 4px 떠오르고 테두리가 연보라색으로.
- 모바일(600px 이하)에서는 2열로 바뀌는 미디어쿼리 포함.`,
  },

  /* ───────────────────────── 전환·로딩 ───────────────────────── */
  {
    id: 'skeleton', cat: 'loading', ko: '스켈레톤 로딩', en: 'Skeleton Loading', aka: ['쉬머 로딩', 'Shimmer', 'Placeholder Loading'],
    tech: 'CSS', level: 1, hint: 'auto',
    summary: '내용이 오기 전 회색 뼈대 위로 빛이 반짝이며 지나가요.',
    desc: '실제 콘텐츠 자리에 같은 모양의 회색 블록을 두고, 밝은 띠가 있는 그라디언트를 좌→우로 이동시켜 "불러오는 중" 임을 알려요. 로딩이 끝나면 클래스만 빼서 실제 내용을 보여줍니다.',
    use: '피드·카드 목록, 상품 리스트, 프로필 — API 응답을 기다리는 모든 화면',
    tip: '스피너보다 체감 대기 시간이 짧게 느껴져요. 실제 레이아웃과 크기를 똑같이 맞춰야 로딩 후 화면이 덜컹거리지 않아요(CLS 방지).',
    html: `<article class="card loading" id="card">
  <header>
    <div class="avatar sk"></div>
    <div><p class="name sk">김디자인</p><p class="meta sk">3분 전 · 서울</p></div>
  </header>
  <div class="thumb sk"></div>
  <p class="text sk">스켈레톤은 로딩 중 레이아웃 모양을 미리 보여줘요.</p>
</article>`,
    css: `.card {
  width: min(320px, 86vw);
  padding: 16px;
  border-radius: 18px;
  background: #14141f;
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.card header { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; }
.avatar { width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #8b5cf6, #ec4899); }
.name { margin: 0 0 4px; font-size: 15px; font-weight: 700; }
.meta { margin: 0; font-size: 12px; color: #8b8fb0; }
.thumb { height: 92px; margin-bottom: 12px; border-radius: 12px; background: linear-gradient(135deg, #312e81, #831843); }
.text { margin: 0; font-size: 14px; line-height: 1.5; color: #c7c9e0; }

/* 로딩 중: 글자는 숨기고 반짝이는 회색 블록으로 */
.loading .sk {
  color: transparent;
  border-radius: 8px;
  background: linear-gradient(90deg, #1c1c2b 25%, #2c2c42 50%, #1c1c2b 75%);
  background-size: 200% 100%;
  animation: shimmer 1.3s linear infinite;
}
.loading .avatar { border-radius: 50%; }
@keyframes shimmer {
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
}`,
    js: `// 데모용: 로딩 ↔ 완료 상태를 반복 (실제로는 데이터를 받은 뒤 loading 클래스만 제거)
const card = document.getElementById('card');
setInterval(function () { card.classList.toggle('loading'); }, 2200);`,
    prompt: `- 프로필 사진 · 이름 · 시간 · 썸네일 · 본문이 있는 피드 카드에 스켈레톤 로딩 상태를 만들어줘.
- 카드에 .loading 클래스가 있으면 모든 .sk 요소가 같은 크기의 회색 블록이 되고, 밝은 띠가 1.3초마다 좌→우로 지나가는 shimmer 애니메이션.
- 로딩이 끝나면 .loading 만 제거해서 실제 콘텐츠가 같은 자리에 나타나게(레이아웃 이동 없이).
- 데모로 2.2초마다 두 상태를 토글.`,
  },
  {
    id: 'loaders', cat: 'loading', ko: '로딩 스피너 모음', en: 'CSS Loaders', aka: ['스피너', 'Spinner', 'Loading Indicator'],
    tech: 'CSS', level: 1, hint: 'auto',
    summary: '링 · 점 · 이퀄라이저 · 궤도 — CSS 만으로 만든 로더 4종이에요.',
    desc: '링은 한쪽 테두리만 색을 준 원을 회전, 점은 시간차(animation-delay)로 튀어 오르고, 막대는 scaleY 로 오르내리며, 궤도는 가상 요소 두 개를 붙인 상자를 회전시켜요.',
    use: '버튼 안 제출 중 표시, 페이지 전환, 데이터 새로고침',
    tip: '0.3초 안에 끝나는 작업에는 로더를 띄우지 않는 게 더 빨라 보여요(지연 후 표시).',
    html: `<div class="loaders">
  <figure><div class="l-ring"></div><figcaption>Ring</figcaption></figure>
  <figure><div class="l-dots"><i></i><i></i><i></i></div><figcaption>Dots</figcaption></figure>
  <figure><div class="l-bars"><i></i><i></i><i></i><i></i></div><figcaption>Bars</figcaption></figure>
  <figure><div class="l-orbit"></div><figcaption>Orbit</figcaption></figure>
</div>`,
    css: `.loaders { display: flex; gap: clamp(20px, 6vw, 56px); align-items: center; }
figure { margin: 0; display: grid; justify-items: center; gap: 16px; }
figure > div { height: 44px; display: flex; align-items: center; justify-content: center; }
figcaption { font-size: 12px; color: #8b8fb0; letter-spacing: 0.08em; }

.l-ring {
  width: 44px;
  border-radius: 50%;
  border: 4px solid rgba(167, 139, 250, 0.2);
  border-top-color: #a78bfa;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.l-dots { gap: 6px; }
.l-dots i { width: 10px; height: 10px; border-radius: 50%; background: #22d3ee; animation: bounce 0.9s ease-in-out infinite; }
.l-dots i:nth-child(2) { animation-delay: 0.15s; }
.l-dots i:nth-child(3) { animation-delay: 0.3s; }
@keyframes bounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-12px); opacity: 1; } }

.l-bars { gap: 4px; align-items: flex-end !important; }
.l-bars i { width: 6px; height: 36px; border-radius: 3px; background: #f472b6; transform-origin: bottom; animation: eq 1s ease-in-out infinite; }
.l-bars i:nth-child(2) { animation-delay: -0.2s; }
.l-bars i:nth-child(3) { animation-delay: -0.4s; }
.l-bars i:nth-child(4) { animation-delay: -0.6s; }
@keyframes eq { 0%, 100% { transform: scaleY(0.3); } 50% { transform: scaleY(1); } }

.l-orbit { position: relative; width: 44px; animation: spin 1.2s linear infinite; }
.l-orbit::before,
.l-orbit::after { content: ''; position: absolute; left: 16px; width: 12px; height: 12px; border-radius: 50%; }
.l-orbit::before { top: 0; background: #fbbf24; }
.l-orbit::after { bottom: 0; background: #8b5cf6; }`,
    js: ``,
    prompt: `- CSS 만으로 로딩 인디케이터 4종을 가로로 나란히 만들어줘. 각각 아래에 이름 캡션.
  1) Ring: 위쪽 테두리만 색이 있는 원이 회전
  2) Dots: 점 3개가 시간차로 통통 튀기
  3) Bars: 막대 4개가 이퀄라이저처럼 scaleY 로 오르내리기
  4) Orbit: 작은 원 2개가 서로 반대편에서 궤도를 돌기
- 색은 연보라 · 시안 · 핑크 · 노랑 포인트, 어두운 배경.`,
  },
  {
    id: 'confetti', cat: 'loading', ko: '컨페티', en: 'Confetti', aka: ['꽃가루 효과', '축하 효과', 'Celebration'],
    tech: 'Canvas', level: 2, hint: 'click',
    summary: '버튼을 누르면 색종이가 팡 터지며 흩날려요.',
    desc: '클릭 위치에서 사방으로 속도를 가진 색종이 조각을 만들고, 매 프레임 중력(vy 증가)·공기저항(vx 감소)·회전을 적용해 떨어뜨려요. 수명이 다하거나 화면 밖으로 나간 조각은 배열에서 제거합니다.',
    use: '결제·가입 완료, 목표 달성, 이벤트 당첨 — 성공 순간의 피드백',
    tip: '남발하면 감동이 줄어요. 정말 축하할 순간에만! 조각 수는 100~150개 정도가 성능과 화려함의 균형점이에요.',
    html: `<button id="party" class="party">축하하기 🎉</button>
<canvas id="confetti"></canvas>`,
    css: `canvas { position: fixed; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.party {
  padding: 16px 34px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, #f59e0b, #ec4899);
  color: #fff;
  font-family: inherit;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 12px 30px -8px rgba(236, 72, 153, 0.75);
  transition: transform 0.15s;
}
.party:active { transform: scale(0.94); }`,
    js: `const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');
const colors = ['#f472b6', '#a78bfa', '#22d3ee', '#fbbf24', '#34d399'];
let pieces = [];

function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }

function burst(x, y) {
  for (let i = 0; i < 130; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 8;
    pieces.push({
      x: x, y: y,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 4,
      size: 5 + Math.random() * 6, rot: Math.random() * 360, vr: (Math.random() - 0.5) * 14,
      color: colors[i % colors.length], life: 1,
    });
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pieces.forEach(function (p) {
    p.vy += 0.25;          // 중력
    p.vx *= 0.99;          // 공기 저항
    p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= 0.008;
    ctx.save();
    ctx.globalAlpha = Math.max(p.life, 0);
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot * Math.PI / 180);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    ctx.restore();
  });
  pieces = pieces.filter(function (p) { return p.life > 0 && p.y < canvas.height + 20; });
  requestAnimationFrame(draw);
}

document.getElementById('party').addEventListener('click', function (e) { burst(e.clientX, e.clientY); });
window.addEventListener('resize', resize);
resize();
draw();
setTimeout(function () { burst(window.innerWidth / 2, window.innerHeight / 2); }, 500); // 처음 한 번 자동`,
    prompt: `- "축하하기" 버튼을 누르면 클릭 위치에서 색종이 130개가 사방으로 터지고, 중력과 공기 저항을 받으며 회전하면서 떨어지는 컨페티 효과를 만들어줘.
- 전체 화면 canvas(pointer-events: none) 위에 그리고, 조각은 핑크·보라·시안·노랑·초록 직사각형.
- 수명(life)에 따라 서서히 투명해지고, 화면 밖으로 나가거나 수명이 끝난 조각은 배열에서 제거.
- 라이브러리 없이 Canvas 2D + requestAnimationFrame.`,
  },

  /* ───────────────────────── 이미지 ───────────────────────── */
  {
    id: 'before-after', cat: 'image', ko: '전후 비교 슬라이더', en: 'Before / After Slider', aka: ['이미지 비교', 'Image Compare', 'Comparison Slider'],
    tech: 'CSS + JS', level: 2, hint: 'hover',
    summary: '가운데 손잡이를 드래그해서 보정 전·후 사진을 비교해요.',
    desc: '두 이미지를 겹쳐 두고 위 이미지를 clip-path: inset() 으로 잘라, 잘리는 위치를 CSS 변수(--pos)로 조절해요. 투명한 input[type=range] 를 전체에 덮어 드래그·키보드·터치를 한 번에 지원합니다.',
    use: '사진 보정·리터칭 서비스, 인테리어 시공 전후, 성형·피부과, 화질 개선 AI',
    tip: 'range input 을 쓰면 접근성(키보드 ←→, 스크린리더)이 자동으로 해결돼요. 두 이미지 비율은 반드시 같아야 해요.',
    html: `<div class="compare" id="compare">
  <img src="assets/effects/landscape.webp" alt="보정 후">
  <div class="before"><img src="assets/effects/landscape-before.webp" alt="보정 전"></div>
  <span class="tag left">BEFORE</span>
  <span class="tag right">AFTER</span>
  <div class="handle"></div>
  <input type="range" min="0" max="100" value="50" aria-label="비교 위치">
</div>`,
    css: `.compare {
  --pos: 50%;
  position: relative;
  width: min(600px, 92vw);
  max-height: 86vh;
  aspect-ratio: 16 / 9;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 50px -15px rgba(0, 0, 0, 0.7);
}
.compare img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
.before { position: absolute; inset: 0; clip-path: inset(0 calc(100% - var(--pos)) 0 0); }
.tag {
  position: absolute;
  top: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.55);
  font-size: 11px;
  letter-spacing: 0.12em;
  pointer-events: none;
}
.tag.left { left: 12px; }
.tag.right { right: 12px; }
.handle {
  position: absolute;
  top: 0; bottom: 0;
  left: var(--pos);
  width: 3px;
  margin-left: -1.5px;
  background: #fff;
  pointer-events: none;
}
.handle::after {
  content: '◀ ▶';
  position: absolute;
  top: 50%; left: 50%;
  width: 40px; height: 40px;
  margin: -20px 0 0 -20px;
  display: grid; place-items: center;
  border-radius: 50%;
  background: #fff;
  color: #111;
  font-size: 9px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
}
.compare input {
  position: absolute;
  inset: 0;
  width: 100%; height: 100%;
  margin: 0;
  opacity: 0;
  cursor: ew-resize;
}`,
    js: `const box = document.getElementById('compare');
box.querySelector('input').addEventListener('input', function (e) {
  box.style.setProperty('--pos', e.target.value + '%');
});`,
    prompt: `- 같은 크기의 사진 두 장(보정 전/후)을 겹쳐서, 가운데 세로 손잡이를 좌우로 드래그해 비교하는 Before/After 슬라이더를 만들어줘.
- 위 이미지는 clip-path: inset(0 calc(100% - var(--pos)) 0 0) 으로 자르고, --pos 를 JS 로 갱신.
- 투명한 input[type=range] 를 전체에 덮어서 마우스·터치·키보드 모두 지원.
- 손잡이: 흰색 세로선 + 가운데 원형 버튼(◀ ▶), 좌우 상단에 BEFORE / AFTER 라벨.`,
  },
  {
    id: 'ken-burns', cat: 'image', ko: '켄 번즈', en: 'Ken Burns Effect', aka: ['슬로우 줌', 'Slow Zoom Pan'],
    tech: 'CSS', level: 1, hint: 'auto',
    summary: '정지된 사진이 천천히 확대·이동하며 영화처럼 살아나요.',
    desc: '다큐멘터리 감독 켄 번즈의 이름에서 온 기법이에요. 이미지를 scale + translate 로 아주 천천히 움직이면 사진에도 카메라 무빙 같은 생동감이 생깁니다. 아래쪽 그라디언트로 글자 가독성을 확보했어요.',
    use: '히어로 배경 이미지, 이미지 슬라이드쇼, 호텔·여행·부동산 사이트',
    tip: '움직임은 10초 이상으로 아주 느리게 해야 고급스러워요. 부모에 overflow: hidden 필수.',
    html: `<div class="kb">
  <img src="assets/effects/mountains.webp" alt="안개 낀 산맥의 일출">
  <div class="kb-cap"><small>CINEMATIC</small><h2>Ken Burns</h2></div>
</div>`,
    css: `body { overflow: hidden; }
.kb { position: fixed; inset: 0; overflow: hidden; }
.kb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform-origin: 30% 60%;
  animation: kenburns 14s ease-in-out infinite alternate;
}
@keyframes kenburns {
  from { transform: scale(1) translate(0, 0); }
  to   { transform: scale(1.25) translate(-4%, -3%); }
}
.kb::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(transparent 40%, rgba(5, 5, 12, 0.85));
}
.kb-cap { position: absolute; left: 24px; bottom: 20px; z-index: 1; }
.kb-cap small { font-size: 11px; letter-spacing: 0.3em; color: #f9a8d4; }
.kb-cap h2 { margin: 4px 0 0; font-size: clamp(24px, 5vw, 44px); }`,
    js: ``,
    prompt: `- 전체 화면 배경 사진이 14초 동안 천천히 확대(1 → 1.25)되며 살짝 이동하고, 다시 돌아오기를 반복하는 켄 번즈 효과를 만들어줘.
- object-fit: cover, transform-origin 을 피사체 쪽으로, animation alternate 로 왕복.
- 하단에 어두운 그라디언트 오버레이 + 왼쪽 아래 작은 라벨과 큰 제목. CSS 만 사용.`,
  },
  {
    id: 'lens-reveal', cat: 'image', ko: '마스크 렌즈', en: 'Clip-path Lens Reveal', aka: ['스포트라이트 리빌', '원형 마스크', 'Reveal on Hover'],
    tech: 'CSS + JS', level: 2, hint: 'hover',
    summary: '흑백 사진 위로 마우스가 비추는 동그란 부분만 컬러로 보여요.',
    desc: '같은 이미지를 두 장 겹쳐 아래는 흑백·어둡게, 위는 컬러로 두고 위 이미지에 clip-path: circle() 을 걸어요. 원의 중심을 마우스 좌표(CSS 변수)로 옮기면 손전등으로 비추는 듯한 효과가 됩니다.',
    use: '포트폴리오 히어로, 숨은 그림 찾기형 인터랙션, 제품 디테일 강조',
    tip: '모바일에서는 pointermove 가 터치 드래그로도 동작해요. 누르고 있을 때 원을 키우면(:active) 재미가 더해집니다.',
    html: `<div class="lens" id="lens">
  <img class="mono" src="assets/effects/landscape.webp" alt="">
  <img class="color" src="assets/effects/landscape.webp" alt="네온 도시 야경">
  <p class="lens-hint">마우스를 움직여 보세요 · 누르면 커져요</p>
</div>`,
    css: `body { overflow: hidden; }
.lens { --x: 50%; --y: 50%; --r: 90px; position: fixed; inset: 0; cursor: crosshair; }
.lens:active { --r: 170px; }
.lens img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.mono { filter: grayscale(1) brightness(0.45); }
.color {
  clip-path: circle(var(--r) at var(--x) var(--y));
  transition: clip-path 0.12s ease-out;
}
.lens-hint {
  position: absolute;
  left: 0; right: 0; bottom: 16px;
  margin: 0;
  text-align: center;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
  pointer-events: none;
}`,
    js: `const lens = document.getElementById('lens');
lens.addEventListener('pointermove', function (e) {
  lens.style.setProperty('--x', e.clientX + 'px');
  lens.style.setProperty('--y', e.clientY + 'px');
});`,
    prompt: `- 같은 사진 두 장을 겹쳐서, 아래는 흑백+어둡게, 위는 컬러로 두고 마우스 위치의 원형 영역만 컬러로 보이는 렌즈 리빌 효과를 만들어줘.
- 위 이미지에 clip-path: circle(var(--r) at var(--x) var(--y)), pointermove 로 --x/--y 갱신.
- 기본 반지름 90px, 마우스를 누르고 있으면 170px 로 부드럽게 커지게.
- 하단에 작은 안내 문구.`,
  },

  /* ───────────────────────── 3D ───────────────────────── */
  {
    id: 'flip-card', cat: '3d', ko: '뒤집기 카드', en: 'Flip Card', aka: ['카드 플립', '3D Card Flip'],
    tech: 'CSS', level: 1, hint: 'hover',
    summary: '마우스를 올리면 카드가 3D 로 휙 뒤집혀 뒷면이 나와요.',
    desc: '앞면·뒷면을 겹쳐 두고 뒷면은 미리 rotateY(180deg) 로 돌려둬요. backface-visibility: hidden 으로 뒤를 향한 면은 숨기고, 부모를 180도 돌리면 두 면이 바뀝니다. transform-style: preserve-3d 가 핵심이에요.',
    use: '팀원 소개, 단어 카드·퀴즈, 요금제 상세, 명함',
    tip: '터치 기기를 위해 :focus 나 클릭 토글도 함께 지원하세요(tabindex="0").',
    html: `<div class="flip" tabindex="0">
  <div class="flip-inner">
    <div class="face front"><small>HOVER ME</small><h2>앞면</h2></div>
    <div class="face back"><h2>뒷면</h2><p>rotateY(180deg) 로 뒤집혀요</p></div>
  </div>
</div>`,
    css: `.flip {
  height: min(280px, 78vh);
  aspect-ratio: 3 / 4;
  perspective: 1000px;
  cursor: pointer;
  outline: none;
}
.flip-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.flip:hover .flip-inner,
.flip:focus .flip-inner { transform: rotateY(180deg); }
.face {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 6px;
  padding: 20px;
  border-radius: 20px;
  text-align: center;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}
.front { background: linear-gradient(135deg, #4c1d95, #1e1b4b); border: 1px solid rgba(255, 255, 255, 0.12); }
.back { background: linear-gradient(135deg, #db2777, #7c3aed); transform: rotateY(180deg); }
.face h2 { margin: 0; font-size: 28px; }
.face small { font-size: 11px; letter-spacing: 0.3em; color: #c4b5fd; }
.face p { margin: 0; font-size: 13px; opacity: 0.85; }`,
    js: ``,
    prompt: `- 마우스를 올리거나 포커스하면 Y축으로 180도 뒤집혀 뒷면이 보이는 3D 플립 카드를 만들어줘.
- perspective: 1000px, transform-style: preserve-3d, backface-visibility: hidden 사용.
- 앞면은 남보라 그라디언트에 "HOVER ME" 라벨, 뒷면은 핑크→보라 그라디언트에 설명.
- 0.8초 cubic-bezier(0.2, 0.8, 0.2, 1) 전환, 키보드 접근을 위해 tabindex="0". CSS 만 사용.`,
  },
  {
    id: 'css-cube', cat: '3d', ko: '3D 큐브', en: 'CSS 3D Cube', aka: ['회전 큐브', 'Rotating Cube'],
    tech: 'CSS', level: 2, hint: 'hover',
    summary: '반투명한 정육면체가 공중에서 천천히 회전해요. (호버하면 멈춤)',
    desc: '면 6개를 같은 자리에 겹친 뒤 각각 rotateY/rotateX 로 방향을 돌리고 translateZ(한 변의 절반) 만큼 밀어내 정육면체를 조립해요. 부모를 회전시키면 큐브 전체가 돌아갑니다.',
    use: '3D 로고·인트로, 제품 패키지 미리보기, 이미지 큐브 갤러리',
    tip: '면에 backdrop-filter 나 overflow 를 쓰면 preserve-3d 가 깨져 평면이 돼요. 면 크기를 바꾸면 translateZ 값도 절반으로 같이 바꾸세요.',
    html: `<div class="scene3d">
  <div class="cube">
    <div class="f f1">CSS</div>
    <div class="f f2">3D</div>
    <div class="f f3">CUBE</div>
    <div class="f f4">WEB</div>
    <div class="f f5">✦</div>
    <div class="f f6">✦</div>
  </div>
</div>`,
    css: `.scene3d { width: 120px; height: 120px; perspective: 600px; }
.cube {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  animation: rotate 10s linear infinite;
}
.scene3d:hover .cube { animation-play-state: paused; }
.f {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0.08em;
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.55), rgba(236, 72, 153, 0.35));
  box-shadow: inset 0 0 30px rgba(255, 255, 255, 0.15);
}
.f1 { transform: translateZ(60px); }
.f2 { transform: rotateY(90deg) translateZ(60px); }
.f3 { transform: rotateY(180deg) translateZ(60px); }
.f4 { transform: rotateY(-90deg) translateZ(60px); }
.f5 { transform: rotateX(90deg) translateZ(60px); }
.f6 { transform: rotateX(-90deg) translateZ(60px); }
@keyframes rotate {
  from { transform: rotateX(-22deg) rotateY(0deg); }
  to   { transform: rotateX(-22deg) rotateY(360deg); }
}`,
    js: ``,
    prompt: `- CSS 만으로 120px 크기의 반투명 3D 정육면체를 만들고, 살짝 내려다보는 각도(rotateX -22deg)에서 10초에 한 바퀴 회전하게 해줘.
- 면 6개를 rotateY/rotateX + translateZ(60px) 로 조립, transform-style: preserve-3d.
- 면은 보라→핑크 반투명 그라디언트 + 밝은 테두리, 앞뒤옆에 CSS / 3D / CUBE / WEB 글자.
- 마우스를 올리면 회전이 일시정지.`,
  },
  {
    id: 'ring-carousel', cat: '3d', ko: '3D 링 캐러셀', en: '3D Ring Carousel', aka: ['원형 캐러셀', 'Carousel 3D', '회전목마'],
    tech: 'CSS', level: 3, hint: 'hover',
    summary: '카드들이 원형으로 배치되어 회전목마처럼 돌아가요. (호버하면 멈춤)',
    desc: '카드마다 --i 번호를 주고 rotateY(--i × 45deg) translateZ(반지름) 로 원 둘레에 배치해요. 부모 링을 회전시키면 카드들이 원을 그리며 돌고, 원근 때문에 앞쪽 카드는 크게 뒤쪽은 작게 보입니다.',
    use: '포트폴리오·상품 쇼케이스, 앨범 커버 갤러리, 이벤트 카드 선택',
    tip: '카드 개수 × 각도 = 360deg 가 되게 맞추세요(8장이면 45deg). -webkit-box-reflect 로 바닥 반사도 줄 수 있어요(크롬·사파리).',
    html: `<div class="stage3d">
  <div class="ring">
    <div class="c3" style="--i:0">01</div>
    <div class="c3" style="--i:1">02</div>
    <div class="c3" style="--i:2">03</div>
    <div class="c3" style="--i:3">04</div>
    <div class="c3" style="--i:4">05</div>
    <div class="c3" style="--i:5">06</div>
    <div class="c3" style="--i:6">07</div>
    <div class="c3" style="--i:7">08</div>
  </div>
</div>`,
    css: `body { overflow: hidden; }
.stage3d { perspective: 900px; }
.ring {
  --radius: clamp(130px, 26vw, 230px);
  position: relative;
  width: 88px;
  height: 118px;
  transform-style: preserve-3d;
  animation: ring 16s linear infinite;
}
.stage3d:hover .ring { animation-play-state: paused; }
.c3 {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  border-radius: 14px;
  font-size: 26px;
  font-weight: 800;
  background: linear-gradient(160deg, hsl(calc(var(--i) * 45 + 250) 80% 62%), hsl(calc(var(--i) * 45 + 290) 70% 30%));
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
  transform: rotateY(calc(var(--i) * 45deg)) translateZ(var(--radius));
  -webkit-box-reflect: below 8px linear-gradient(transparent 60%, rgba(255, 255, 255, 0.22));
}
@keyframes ring {
  from { transform: rotateX(-8deg) rotateY(0deg); }
  to   { transform: rotateX(-8deg) rotateY(-360deg); }
}`,
    js: ``,
    prompt: `- 카드 8장이 원형으로 배치되어 회전목마처럼 계속 도는 3D 링 캐러셀을 CSS 만으로 만들어줘.
- 각 카드에 style="--i:0~7" 을 주고 transform: rotateY(calc(var(--i) * 45deg)) translateZ(반지름) 으로 배치.
- 부모 링은 transform-style: preserve-3d, 살짝 내려다보는 각도로 16초에 한 바퀴. 호버 시 일시정지.
- 카드 색은 --i 로 hue 를 바꾼 그라디언트, 바닥 반사(-webkit-box-reflect).`,
  },
  /* ════════════════════ 2차 추가 (카테고리 순서는 effects.js 에서 정렬) ════════════════════ */

  /* 텍스트 */
  {
    id: 'neon-glow', cat: 'text', ko: '네온 글로우', en: 'Neon Glow Text', aka: ['네온사인', 'Neon Sign', 'Glow Text'],
    tech: 'CSS', level: 1, hint: 'auto',
    summary: '간판처럼 빛나는 네온 글자가 가끔 깜빡여요.',
    desc: 'text-shadow 를 여러 겹(가까운 흰빛 + 점점 넓어지는 색 번짐) 쌓아서 빛이 퍼지는 느낌을 내요. 불규칙한 키프레임으로 그림자를 잠깐 끄면 오래된 네온사인처럼 깜빡입니다.',
    use: '바·카페·게임 사이트 타이틀, 야간/레트로 콘셉트 랜딩, 이벤트 배너',
    tip: '그림자가 많을수록 렌더링 비용이 커져요. 큰 글자 한두 줄에만 쓰고, 깜빡임은 prefers-reduced-motion 에서 꺼 주세요.',
    html: `<h1 class="neon">OPEN <span>24</span></h1>`,
    css: `body { background: #07060d; }
.neon {
  --c: #ff4fd8;
  margin: 0;
  font-size: clamp(48px, 12vw, 120px);
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #fff;
  text-shadow:
    0 0 4px #fff,
    0 0 10px var(--c),
    0 0 24px var(--c),
    0 0 48px var(--c),
    0 0 90px var(--c);
  animation: flicker 4s infinite;
}
.neon span {
  --c: #22d3ee;
  color: #e0fbff;
  text-shadow: 0 0 4px #fff, 0 0 10px var(--c), 0 0 24px var(--c), 0 0 48px var(--c), 0 0 90px var(--c);
}
@keyframes flicker {
  0%, 18%, 22%, 25%, 53%, 57%, 100% { opacity: 1; }
  20%, 24%, 55% { opacity: 0.35; }
}`,
    js: ``,
    prompt: `- 어두운 배경에 네온사인처럼 빛나는 큰 제목을 만들어줘. CSS 만 사용.
- text-shadow 를 5겹 쌓기: 0 0 4px 흰색 + 0 0 10/24/48/90px 네온색(CSS 변수 --c).
- 단어마다 다른 네온색(핑크 #ff4fd8, 시안 #22d3ee)을 줄 수 있게.
- 불규칙한 퍼센트의 키프레임으로 가끔 opacity 를 낮춰 오래된 간판처럼 깜빡이게.`,
  },
  {
    id: 'split-reveal', cat: 'text', ko: '글자별 등장', en: 'Split Text Reveal', aka: ['스플릿 텍스트', 'Staggered Letters', '레터 애니메이션'],
    tech: 'CSS + JS', level: 2, hint: 'auto',
    summary: '제목의 글자가 하나씩 차례로 아래에서 올라와요.',
    desc: '문장을 글자마다 <span> 으로 나누고, 각 글자에 순번(--i)을 CSS 변수로 줘서 animation-delay 를 조금씩 늦춰요. 부모에 overflow: hidden 을 주면 글자가 선 아래에서 솟아오르는 것처럼 보입니다.',
    use: '히어로 헤드라인 첫 등장, 섹션 제목, 포트폴리오 인트로',
    tip: '글자를 span 으로 쪼개면 스크린 리더가 한 글자씩 읽을 수 있어요. 부모에 aria-label 로 원문을 주고 span 은 aria-hidden 처리하세요.',
    html: `<h1 class="split" id="split">Hello, Motion</h1>`,
    css: `.split {
  margin: 0;
  padding-bottom: 0.1em;
  font-size: clamp(40px, 9vw, 88px);
  font-weight: 800;
  letter-spacing: -0.02em;
  overflow: hidden;
}
.split .ch {
  display: inline-block;
  transform: translateY(110%);
  opacity: 0;
  animation: rise 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  animation-delay: calc(var(--i) * 45ms);
}
.split .sp { width: 0.3em; }
@keyframes rise { to { transform: none; opacity: 1; } }`,
    js: `const el = document.getElementById('split');
const text = el.textContent;
el.setAttribute('aria-label', text);

function play() {
  el.innerHTML = '';
  Array.from(text).forEach(function (c, i) {
    const s = document.createElement('span');
    s.className = c === ' ' ? 'ch sp' : 'ch';
    s.textContent = c;
    s.style.setProperty('--i', i); // 순번 → animation-delay
    s.setAttribute('aria-hidden', 'true');
    el.appendChild(s);
  });
}
play();
setInterval(play, 3200); // 데모라서 반복`,
    prompt: `- 제목 텍스트를 JS 로 글자마다 span 으로 나누고, 각 span 에 --i(순번) CSS 변수를 넣어줘.
- 글자는 translateY(110%) + opacity 0 에서 시작해 제자리로 올라오게, animation-delay: calc(var(--i) * 45ms).
- 부모는 overflow: hidden 으로 선 아래에서 솟아오르는 느낌. 공백은 너비를 가진 span 으로.
- 접근성: 부모에 aria-label 로 원문, 글자 span 은 aria-hidden.`,
  },
  {
    id: 'marquee', cat: 'text', ko: '흐르는 띠', en: 'Infinite Marquee', aka: ['마퀴', '티커', 'Ticker', 'Scrolling Text'],
    tech: 'CSS', level: 1, hint: 'hover',
    summary: '글자 띠가 끝없이 옆으로 흘러가요. 마우스를 올리면 멈춰요.',
    desc: '같은 내용을 두 번 이어 붙인 트랙을 translateX(-50%) 까지 반복 이동시키면 이음새 없이 무한히 흐르는 것처럼 보여요. 양 끝은 mask-image 로 부드럽게 사라지게 했습니다.',
    use: '브랜드 키워드 띠, 고객사 로고 띠, 공지·할인 문구, 포트폴리오 섹션 구분선',
    tip: '항목 사이 간격을 gap 으로 주면 -50% 위치가 반 칸 어긋나요. 각 항목의 padding 으로 간격을 주세요. 복제한 쪽은 aria-hidden 처리.',
    html: `<div class="marquee">
  <div class="track">
    <span>DESIGN</span><span>✦</span><span>MOTION</span><span>✦</span><span>CODE</span><span>✦</span><span>WEB</span><span>✦</span>
    <span aria-hidden="true">DESIGN</span><span aria-hidden="true">✦</span><span aria-hidden="true">MOTION</span><span aria-hidden="true">✦</span><span aria-hidden="true">CODE</span><span aria-hidden="true">✦</span><span aria-hidden="true">WEB</span><span aria-hidden="true">✦</span>
  </div>
</div>
<div class="marquee reverse" aria-hidden="true">
  <div class="track">
    <span>CREATIVE</span><span>✦</span><span>STUDIO</span><span>✦</span><span>2026</span><span>✦</span>
    <span>CREATIVE</span><span>✦</span><span>STUDIO</span><span>✦</span><span>2026</span><span>✦</span>
  </div>
</div>`,
    css: `body { flex-direction: column; gap: 14px; overflow: hidden; }
.marquee {
  width: 100%;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
}
.track {
  display: flex;
  width: max-content;
  animation: scroll 14s linear infinite;
}
.track span {
  padding-right: 32px; /* gap 대신 padding → -50% 가 정확히 한 바퀴 */
  font-size: clamp(32px, 7vw, 64px);
  font-weight: 900;
}
.reverse .track { animation-direction: reverse; animation-duration: 18s; }
.reverse span { color: transparent; -webkit-text-stroke: 1.5px #a78bfa; }
.marquee:hover .track { animation-play-state: paused; }
@keyframes scroll { to { transform: translateX(-50%); } }`,
    js: ``,
    prompt: `- 가로로 끝없이 흐르는 텍스트 띠(marquee)를 CSS 만으로 만들어줘.
- 같은 항목 목록을 2번 이어 붙인 트랙을 translateX(0 → -50%) 로 linear 무한 반복. 복제본은 aria-hidden.
- 간격은 gap 대신 항목 padding-right 로(이음새가 어긋나지 않게).
- 두 줄: 윗줄은 꽉 찬 글자, 아랫줄은 반대 방향 + 외곽선 글자(-webkit-text-stroke).
- 양 끝은 mask-image 로 페이드, 마우스를 올리면 animation-play-state: paused.`,
  },

  /* 호버·인터랙션 */
  {
    id: 'custom-cursor', cat: 'hover', ko: '커스텀 커서', en: 'Custom Cursor', aka: ['마우스 커서', 'Cursor Follower', '커서 트레일'],
    tech: 'JS', level: 2, hint: 'hover',
    summary: '점과 링이 마우스를 따라오고, 링크 위에서는 링이 커져요.',
    desc: '기본 커서를 숨기고 작은 점은 마우스 위치에 바로, 큰 링은 매 프레임 목표 위치로 15%씩 다가가게(lerp) 해서 부드럽게 따라오는 느낌을 내요. 링크·버튼에 올리면 링이 커지며 클릭할 수 있다는 걸 알려줍니다.',
    use: '포트폴리오, 에이전시, 크리에이티브 랜딩 등 개성이 중요한 사이트',
    tip: '터치 기기에는 커서가 없으니 @media (hover: none) 에서 숨기고 기본 커서를 되돌리세요. 링은 pointer-events: none 이어야 클릭을 가로막지 않아요.',
    html: `<div class="cursor-dot" id="dot"></div>
<div class="cursor-ring" id="ring"></div>
<div class="links">
  <a href="#">Work</a>
  <a href="#">About</a>
  <button type="button">Contact</button>
</div>
<p class="note">마우스를 움직여 보세요</p>`,
    css: `body { cursor: none; flex-direction: column; gap: 24px; }
.links { display: flex; gap: 28px; }
.links a, .links button {
  border: 0;
  background: none;
  color: #ecebf5;
  font-family: inherit;
  font-size: 22px;
  font-weight: 700;
  text-decoration: none;
  cursor: none;
}
.note { margin: 0; color: #8b8fb0; font-size: 14px; }
.cursor-dot, .cursor-ring {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 9;
  border-radius: 50%;
  pointer-events: none;
  translate: -50% -50%; /* 중심을 마우스 위치에 */
}
.cursor-dot { width: 8px; height: 8px; background: #fff; }
.cursor-ring {
  width: 38px;
  height: 38px;
  border: 1.5px solid rgba(255, 255, 255, 0.6);
  transition: width 0.25s, height 0.25s, background 0.25s, border-color 0.25s;
}
.cursor-ring.big { width: 72px; height: 72px; background: rgba(139, 92, 246, 0.25); border-color: transparent; }
@media (hover: none) {
  body, .links a, .links button { cursor: auto; }
  .cursor-dot, .cursor-ring { display: none; }
}`,
    js: `const dot = document.getElementById('dot');
const ring = document.getElementById('ring');
let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

function place(el, x, y) { el.style.transform = 'translate(' + x + 'px, ' + y + 'px)'; }
place(dot, mx, my);

addEventListener('pointermove', function (e) {
  mx = e.clientX;
  my = e.clientY;
  place(dot, mx, my); // 점은 즉시
});

(function loop() {
  rx += (mx - rx) * 0.15; // 링은 15%씩 따라감(lerp)
  ry += (my - ry) * 0.15;
  place(ring, rx, ry);
  requestAnimationFrame(loop);
})();

document.querySelectorAll('a, button').forEach(function (el) {
  el.addEventListener('pointerenter', function () { ring.classList.add('big'); });
  el.addEventListener('pointerleave', function () { ring.classList.remove('big'); });
  el.addEventListener('click', function (e) { e.preventDefault(); });
});`,
    prompt: `- 기본 마우스 커서를 숨기고(cursor: none) 작은 흰 점 + 테두리 링 커서를 만들어줘.
- 점은 pointermove 위치에 즉시, 링은 requestAnimationFrame 루프에서 목표 위치로 15%씩 다가가는 lerp 로 부드럽게 따라오게.
- 링크·버튼에 올리면 링이 72px 로 커지고 반투명 보라 배경으로 바뀌게(CSS transition).
- 링과 점은 pointer-events: none, translate: -50% -50% 로 중심 맞춤.
- @media (hover: none) 에서는 커스텀 커서를 숨기고 기본 커서로.`,
  },
  {
    id: 'animated-border', cat: 'hover', ko: '회전 그라디언트 테두리', en: 'Animated Gradient Border', aka: ['Glow Border', 'Conic Border', '빛나는 테두리'],
    tech: 'CSS', level: 2, hint: 'auto',
    summary: '카드 테두리를 따라 그라디언트 빛이 빙글빙글 돌아요.',
    desc: '@property 로 --angle 을 각도 타입으로 등록하면 CSS 변수도 애니메이션할 수 있어요. conic-gradient(from var(--angle)) 를 border-box 에만 깔고 내용은 padding-box 단색으로 덮어 테두리만 보이게 했고, 같은 그라디언트를 흐리게 한 장 더 깔아 은은한 빛번짐을 냈습니다.',
    use: '추천 요금제 카드, 강조 버튼, AI 기능 소개 카드, 다크 모드 히어로',
    tip: '@property 를 지원하지 않는 오래된 브라우저에서는 회전 없이 정지된 그라디언트로 보여요(깨지지는 않음).',
    html: `<div class="glow-card">
  <h2>Pro Plan</h2>
  <p>회전하는 그라디언트 테두리</p>
  <button type="button">시작하기</button>
</div>`,
    css: `@property --angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}
.glow-card {
  position: relative;
  width: min(300px, 80vw);
  padding: 28px;
  border: 2px solid transparent;
  border-radius: 20px;
  background:
    linear-gradient(#11111c, #11111c) padding-box,
    conic-gradient(from var(--angle), #8b5cf6, #ec4899, #22d3ee, #8b5cf6) border-box;
  animation: spin 4s linear infinite;
}
.glow-card::after {
  content: '';
  position: absolute;
  inset: -2px;
  z-index: -1;
  border-radius: inherit;
  background: conic-gradient(from var(--angle), #8b5cf6, #ec4899, #22d3ee, #8b5cf6);
  filter: blur(22px);
  opacity: 0.55;
  animation: spin 4s linear infinite;
}
.glow-card h2 { margin: 0 0 6px; font-size: 22px; }
.glow-card p { margin: 0 0 20px; color: #9a98b3; font-size: 14px; }
.glow-card button {
  width: 100%;
  height: 42px;
  border: 0;
  border-radius: 12px;
  background: #fff;
  color: #11111c;
  font-family: inherit;
  font-weight: 700;
  cursor: pointer;
}
@keyframes spin { to { --angle: 360deg; } }`,
    js: ``,
    prompt: `- 카드 테두리를 따라 보라→핑크→시안 그라디언트 빛이 회전하는 효과를 CSS 만으로 만들어줘.
- @property --angle(syntax '<angle>')을 등록하고 0deg → 360deg 로 4초 linear 무한 애니메이션.
- 배경을 두 겹: padding-box 는 카드 단색, border-box 는 conic-gradient(from var(--angle), ...) → 2px 투명 테두리 자리에만 그라디언트가 보이게.
- ::after 에 같은 그라디언트 + blur(22px) + opacity 0.55 를 z-index -1 로 깔아 빛번짐.`,
  },
  {
    id: 'underline-hover', cat: 'hover', ko: '밑줄 애니메이션', en: 'Animated Underline', aka: ['링크 호버', 'Link Hover', '하이라이트 호버'],
    tech: 'CSS', level: 1, hint: 'hover',
    summary: '링크에 마우스를 올리면 밑줄이 그어지거나 형광펜이 칠해져요.',
    desc: 'text-decoration 대신 linear-gradient 배경을 밑줄처럼 쓰고, background-size 의 가로 길이를 0% → 100% 로 바꿔서 줄이 그어지게 해요. background-position 을 left / center 로 바꾸면 그어지는 방향이 달라지고, 높이를 키우면 형광펜이 됩니다.',
    use: '내비게이션 메뉴, 본문 링크, 블로그 글 강조, 푸터 링크',
    tip: '배경 밑줄은 여러 줄로 줄바꿈된 링크에도 줄마다 그려져요(display: inline 유지). 키보드 사용자를 위해 :focus-visible 에도 같은 효과를 주세요.',
    html: `<nav class="ul-demo">
  <a href="#" class="u1">왼쪽에서 그어지는 밑줄</a>
  <a href="#" class="u2">가운데서 퍼지는 밑줄</a>
  <a href="#" class="u3">형광펜 하이라이트</a>
</nav>`,
    css: `.ul-demo { display: flex; flex-direction: column; align-items: flex-start; gap: 22px; }
.ul-demo a {
  color: #ecebf5;
  font-size: clamp(18px, 4vw, 26px);
  font-weight: 700;
  text-decoration: none;
}
.u1, .u2 {
  padding-bottom: 4px;
  background: linear-gradient(#a78bfa, #a78bfa) no-repeat;
  background-size: 0% 2px;
  transition: background-size 0.35s ease;
}
.u1 { background-position: left bottom; }
.u2 { background-position: center bottom; }
.u1:hover, .u2:hover, .u1:focus-visible, .u2:focus-visible { background-size: 100% 2px; }
.u3 {
  background: linear-gradient(transparent 60%, rgba(236, 72, 153, 0.55) 60%) no-repeat left / 0% 100%;
  transition: background-size 0.4s ease;
}
.u3:hover, .u3:focus-visible { background-size: 100% 100%; }`,
    js: `document.querySelectorAll('a').forEach(function (a) {
  a.addEventListener('click', function (e) { e.preventDefault(); });
});`,
    prompt: `- 링크 호버 효과 3종을 CSS 만으로 만들어줘. text-decoration 대신 linear-gradient 배경을 밑줄로 사용.
- ① 왼쪽에서 오른쪽으로 그어지는 2px 밑줄 ② 가운데서 양쪽으로 퍼지는 밑줄 ③ 글자 아래 40% 를 칠하는 형광펜.
- background-size 가로를 0% → 100% 로 transition, 방향은 background-position(left / center)으로 조절.
- :hover 와 :focus-visible 둘 다 적용.`,
  },

  /* 스크롤 */
  {
    id: 'sticky-pin', cat: 'scroll', ko: '고정 스크롤 스토리', en: 'Sticky Scrollytelling', aka: ['스크롤리텔링', 'Sticky Pin', '고정 섹션'],
    tech: 'CSS + JS', level: 2, hint: 'scroll',
    summary: '한쪽 그림은 고정된 채, 글을 스크롤하면 그림이 단계별로 바뀌어요.',
    desc: '왼쪽 칸에 position: sticky 로 그림을 고정하고, 오른쪽 단계 글들은 평소처럼 스크롤돼요. IntersectionObserver 의 rootMargin 을 위아래 45%씩 줄여서 화면 가운데를 지나는 단계를 찾아, 그 단계에 맞게 그림의 색·모양을 바꿉니다.',
    use: '제품 기능 소개, 서비스 이용 단계, 데이터 스토리텔링, 연혁',
    tip: 'sticky 가 동작하려면 조상 요소에 overflow: hidden 이 없어야 해요. 모바일 좁은 화면에서는 위아래 배치로 바꾸는 것도 고려하세요.',
    html: `<div class="story">
  <div class="sticky"><div class="visual" id="visual">1</div></div>
  <div class="steps">
    <section class="step" data-step="1"><h3>1. 기획</h3><p>무엇을 만들지 정해요.</p></section>
    <section class="step" data-step="2"><h3>2. 디자인</h3><p>화면과 흐름을 그려요.</p></section>
    <section class="step" data-step="3"><h3>3. 개발</h3><p>코드로 살아 움직이게.</p></section>
    <section class="step" data-step="4"><h3>4. 출시</h3><p>세상에 내보내요!</p></section>
  </div>
</div>`,
    css: `body { display: block; }
.story { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 0 16px; }
.sticky { position: sticky; top: 0; height: 100vh; display: grid; place-items: center; }
.visual {
  width: min(40vw, 220px);
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: 28px;
  background: #8b5cf6;
  color: #fff;
  font-size: 64px;
  font-weight: 900;
  transition: background 0.5s, transform 0.5s, border-radius 0.5s;
}
.steps { padding: 30vh 0; }
.step {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  opacity: 0.3;
  transition: opacity 0.4s;
}
.step.active { opacity: 1; }
.step h3 { margin: 0 0 6px; font-size: 22px; }
.step p { margin: 0; color: #9a98b3; }`,
    js: `const visual = document.getElementById('visual');
const looks = {
  1: ['#8b5cf6', 'rotate(0deg)', '28px'],
  2: ['#ec4899', 'rotate(12deg)', '50%'],
  3: ['#22d3ee', 'rotate(-8deg) scale(0.9)', '12px'],
  4: ['#f59e0b', 'rotate(45deg)', '28px'],
};

// 화면 가운데 10% 띠를 지나는 단계를 "현재 단계"로
const io = new IntersectionObserver(function (entries) {
  entries.forEach(function (en) {
    if (!en.isIntersecting) return;
    document.querySelectorAll('.step').forEach(function (s) { s.classList.toggle('active', s === en.target); });
    const n = en.target.dataset.step;
    visual.textContent = n;
    visual.style.background = looks[n][0];
    visual.style.transform = looks[n][1];
    visual.style.borderRadius = looks[n][2];
  });
}, { rootMargin: '-45% 0px -45% 0px' });

document.querySelectorAll('.step').forEach(function (s) { io.observe(s); });`,
    prompt: `- 2단 레이아웃의 스크롤리텔링 섹션을 만들어줘: 왼쪽은 position: sticky(top: 0, height: 100vh)로 고정된 그림, 오른쪽은 4개의 단계 글.
- IntersectionObserver(rootMargin: '-45% 0px -45% 0px')로 화면 가운데를 지나는 단계를 찾아 active 클래스.
- 단계가 바뀔 때마다 그림의 숫자·배경색·회전·모서리 둥글기를 바꾸고 CSS transition 으로 부드럽게.
- 현재 단계가 아닌 글은 opacity 0.3.`,
  },
  {
    id: 'horizontal-scroll', cat: 'scroll', ko: '가로 스크롤 섹션', en: 'Horizontal Scroll Section', aka: ['Scroll Hijack', '가로 패널', 'Pinned Horizontal'],
    tech: 'JS', level: 2, hint: 'scroll',
    summary: '아래로 스크롤하는데 패널들이 옆으로 지나가요.',
    desc: '섹션을 아주 길게(400vh) 만들고 안쪽을 sticky 로 고정한 뒤, 섹션을 얼마나 지나왔는지(0~1)를 계산해서 가로 트랙을 그 비율만큼 translateX 해요. 세로 스크롤 거리가 가로 이동으로 바뀌는 원리입니다.',
    use: '포트폴리오 작품 나열, 제품 라인업, 타임라인, 갤러리',
    tip: '세로로 길게 스크롤해야 하므로 모바일에서는 답답할 수 있어요. 섹션 높이(400vh)로 이동 속도를 조절하세요.',
    html: `<p class="intro">↓ 스크롤하면 옆으로 움직여요</p>
<section class="hs" id="hs">
  <div class="hs-sticky">
    <div class="hs-track" id="track">
      <article class="panel" style="--h: 260">01</article>
      <article class="panel" style="--h: 300">02</article>
      <article class="panel" style="--h: 330">03</article>
      <article class="panel" style="--h: 190">04</article>
      <article class="panel" style="--h: 30">05</article>
    </div>
  </div>
</section>
<p class="intro">끝!</p>`,
    css: `body { display: block; }
.intro { height: 60vh; display: grid; place-items: center; margin: 0; color: #8b8fb0; }
.hs { height: 400vh; } /* 높을수록 천천히 지나감 */
.hs-sticky {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}
.hs-track { display: flex; gap: 20px; padding: 0 10vw; will-change: transform; }
.panel {
  flex: none;
  width: 60vw;
  height: 60vh;
  display: grid;
  place-items: center;
  border-radius: 22px;
  font-size: 56px;
  font-weight: 900;
  background: linear-gradient(135deg, hsl(var(--h) 80% 55%), hsl(calc(var(--h) + 40) 80% 45%));
}`,
    js: `const hs = document.getElementById('hs');
const track = document.getElementById('track');

function update() {
  const total = hs.offsetHeight - innerHeight;           // 섹션 안에서 스크롤할 수 있는 거리
  const p = Math.min(1, Math.max(0, -hs.getBoundingClientRect().top / total)); // 0 ~ 1
  const max = track.scrollWidth - innerWidth;            // 가로로 움직여야 할 거리
  track.style.transform = 'translateX(' + (-p * max) + 'px)';
}
addEventListener('scroll', function () { requestAnimationFrame(update); }, { passive: true });
addEventListener('resize', update);
update();`,
    prompt: `- 세로로 스크롤하면 패널들이 가로로 지나가는 섹션을 만들어줘.
- 바깥 섹션 height: 400vh, 안쪽 컨테이너는 position: sticky; top: 0; height: 100vh; overflow: hidden.
- 진행률 p = -섹션.top / (섹션높이 - 화면높이) 를 0~1 로 자르고, 트랙을 translateX(-p × (트랙너비 - 화면너비)) 로 이동.
- scroll 이벤트는 passive + requestAnimationFrame, resize 때도 다시 계산.
- 패널 5개는 hsl 그라디언트로 색을 다르게.`,
  },
  {
    id: 'scroll-driven', cat: 'scroll', ko: 'CSS 스크롤 애니메이션', en: 'Scroll-driven Animation', aka: ['animation-timeline', 'view()', 'Scroll Timeline'],
    tech: 'CSS', level: 2, hint: 'scroll',
    summary: 'JS 없이 CSS 만으로, 카드가 화면에 들어오는 만큼 커지고 선명해져요.',
    desc: 'animation-timeline: view() 를 쓰면 애니메이션 진행이 시간 대신 "요소가 화면을 지나가는 정도"에 연결돼요. animation-range 로 화면에 들어오기 시작할 때부터 45% 지점까지 재생되게 했습니다. 지원하지 않는 브라우저에서는 @supports 덕분에 그냥 정지된 카드로 보여요.',
    use: '스크롤 등장 효과를 JS 없이 가볍게, 이미지 갤러리, 긴 소개 페이지',
    tip: '최신 브라우저 기능이에요(Chrome·Edge·Safari 최신). 꼭 필요한 정보가 애니메이션에만 의존하지 않게 하세요.',
    html: `<p class="hint">↓ 스크롤 — JS 없이 CSS 만으로</p>
<div class="cards">
  <div class="c">01 · entry</div>
  <div class="c">02 · view()</div>
  <div class="c">03 · timeline</div>
  <div class="c">04 · range</div>
  <div class="c">05 · no JS</div>
  <div class="c">06 · smooth</div>
</div>`,
    css: `body { display: block; padding: 0 20px; }
.hint { height: 45vh; display: grid; place-items: end center; margin: 0; padding-bottom: 20px; color: #8b8fb0; }
.cards { display: grid; justify-items: center; gap: 24px; padding-bottom: 45vh; }
.c {
  width: min(420px, 90%);
  height: 120px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: linear-gradient(120deg, #312e81, #7c3aed, #db2777);
  font-size: 22px;
  font-weight: 800;
}
@supports (animation-timeline: view()) {
  .c {
    animation: pop linear both;
    animation-timeline: view();
    animation-range: entry 0% cover 45%;
  }
}
@keyframes pop {
  from { opacity: 0; transform: scale(0.7) rotate(-6deg); filter: blur(6px); }
  to { opacity: 1; transform: none; filter: none; }
}`,
    js: ``,
    prompt: `- JS 없이 CSS scroll-driven animation 만으로 스크롤 등장 효과를 만들어줘.
- 카드에 animation: pop linear both; animation-timeline: view(); animation-range: entry 0% cover 45%.
- pop 키프레임: opacity 0, scale(0.7) rotate(-6deg), blur(6px) → 원래 상태.
- @supports (animation-timeline: view()) 안에서만 적용해서, 지원하지 않는 브라우저는 그냥 보이게.`,
  },

  /* 배경 */
  {
    id: 'mesh-gradient', cat: 'bg', ko: '메쉬 그라디언트', en: 'Mesh Gradient', aka: ['Gradient Mesh', '블러 그라디언트', 'Fluid Gradient'],
    tech: 'CSS', level: 1, hint: 'auto',
    summary: '여러 색이 물감처럼 섞인 배경이 천천히 움직여요.',
    desc: '위치가 다른 radial-gradient 여러 개를 겹치고 filter: blur 로 경계를 뭉개면 메쉬 그라디언트처럼 보여요. 레이어 전체를 크게 만들어 천천히 이동·회전시키면 색이 흐르는 듯한 배경이 됩니다.',
    use: 'SaaS·핀테크 랜딩 히어로, 앱 소개 배경, 로그인 화면',
    tip: '큰 blur 는 GPU 를 꽤 써요. 배경 레이어 하나에만 쓰고, 움직임은 transform 으로만 주세요.',
    html: `<div class="mesh"></div>
<h1 class="mesh-title">Mesh Gradient</h1>`,
    css: `body { overflow: hidden; background: #0b0b14; }
.mesh {
  position: fixed;
  inset: -20%;
  background:
    radial-gradient(at 20% 20%, #7c3aed 0, transparent 45%),
    radial-gradient(at 80% 10%, #ec4899 0, transparent 40%),
    radial-gradient(at 70% 80%, #22d3ee 0, transparent 45%),
    radial-gradient(at 10% 85%, #f59e0b 0, transparent 40%);
  filter: blur(40px) saturate(140%);
  animation: drift 14s ease-in-out infinite alternate;
}
@keyframes drift {
  0% { transform: translate(0, 0) rotate(0deg) scale(1); }
  50% { transform: translate(4%, -3%) rotate(8deg) scale(1.1); }
  100% { transform: translate(-3%, 4%) rotate(-6deg) scale(1.05); }
}
.mesh-title {
  position: relative;
  margin: 0;
  font-size: clamp(40px, 9vw, 90px);
  font-weight: 900;
  letter-spacing: -0.03em;
  text-shadow: 0 4px 40px rgba(0, 0, 0, 0.35);
}`,
    js: ``,
    prompt: `- 여러 색이 부드럽게 섞인 메쉬 그라디언트 배경을 CSS 만으로 만들어줘.
- radial-gradient 4개(보라 #7c3aed, 핑크 #ec4899, 시안 #22d3ee, 주황 #f59e0b)를 화면 네 모서리 근처에 겹치기.
- filter: blur(40px) saturate(140%), 레이어를 inset: -20% 로 크게 만들어 가장자리가 비지 않게.
- 14초 ease-in-out alternate 로 살짝 이동·회전·확대해서 색이 흐르는 느낌. 가운데에 큰 흰 제목.`,
  },
  {
    id: 'grain', cat: 'bg', ko: '노이즈 질감', en: 'Film Grain / Noise', aka: ['그레인', 'Noise Texture', '필름 질감'],
    tech: 'CSS', level: 1, hint: 'auto',
    summary: '매끈한 그라디언트 위에 필름 같은 자글자글한 질감을 얹어요.',
    desc: 'SVG 의 feTurbulence 필터로 만든 노이즈를 이미지 파일 없이 data URI 로 배경에 깔고, mix-blend-mode: overlay 로 아래 색과 섞어요. 노이즈 레이어를 steps() 로 툭툭 움직이면 실제 필름처럼 지글거립니다.',
    use: '그라디언트가 밋밋해 보일 때, 빈티지·에디토리얼 콘셉트, 포스터형 히어로',
    tip: '노이즈 opacity 는 0.2~0.4 정도가 적당해요. 너무 진하면 글자가 읽기 어려워져요.',
    html: `<div class="grain-card">
  <h1>Film Grain</h1>
  <p>그라디언트 위에 노이즈 질감</p>
</div>`,
    css: `.grain-card {
  position: relative;
  width: min(480px, 88vw);
  aspect-ratio: 4 / 3;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 28px;
  border-radius: 22px;
  overflow: hidden;
  background: linear-gradient(135deg, #f97316, #db2777 45%, #4c1d95);
}
.grain-card::after {
  content: '';
  position: absolute;
  inset: -50%;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  opacity: 0.35;
  mix-blend-mode: overlay;
  pointer-events: none;
  animation: grain 0.8s steps(4) infinite;
}
.grain-card h1, .grain-card p { position: relative; z-index: 1; }
.grain-card h1 { margin: 0; font-size: 40px; font-weight: 900; }
.grain-card p { margin: 6px 0 0; opacity: 0.85; }
@keyframes grain {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-5%, 3%); }
  50% { transform: translate(4%, -4%); }
  75% { transform: translate(-3%, -5%); }
}`,
    js: ``,
    prompt: `- 주황→핑크→보라 그라디언트 카드 위에 필름 그레인(노이즈) 질감을 얹어줘. 이미지 파일 없이.
- 노이즈는 SVG feTurbulence(type fractalNoise, baseFrequency 0.85, numOctaves 3)를 data URI 로 만들어 ::after 배경에.
- mix-blend-mode: overlay, opacity 0.35, pointer-events: none.
- 노이즈 레이어를 inset: -50% 로 크게 두고 steps(4) 로 0.8초마다 위치를 바꿔 지글거리게. 글자는 z-index 로 위에.`,
  },
  {
    id: 'starfield', cat: 'bg', ko: '별빛 워프', en: 'Starfield Warp', aka: ['Hyperspace', '스타필드', '우주 배경'],
    tech: 'Canvas', level: 2, hint: 'click',
    summary: '별이 화면 가운데서 쏟아져 나와요. 누르고 있으면 워프 속도로 빨라져요.',
    desc: '별마다 3D 좌표(x, y, z)를 주고 z 를 계속 줄이면서, 화면 좌표 = 중심 + x / z 로 원근 투영해요. 가까워질수록(z 가 작을수록) 바깥으로 빨리 퍼지고 커집니다. 매 프레임 반투명 검정으로 덮어 꼬리(잔상)를 남겼어요.',
    use: '우주·테크·게임 히어로, 로딩 화면, 404 페이지',
    tip: 'Canvas 크기는 devicePixelRatio 를 곱해야 선명해요. 화면 밖으로 나간 별은 새로 만들어 재활용하세요.',
    html: `<canvas id="stars"></canvas>
<h1 class="warp">WARP</h1>`,
    css: `body { overflow: hidden; background: #000; user-select: none; }
canvas { position: fixed; inset: 0; width: 100%; height: 100%; }
.warp {
  position: relative;
  margin: 0;
  font-size: clamp(40px, 10vw, 96px);
  font-weight: 900;
  letter-spacing: 0.3em;
  text-shadow: 0 0 30px #8b5cf6;
  pointer-events: none;
}`,
    js: `const cv = document.getElementById('stars');
const ctx = cv.getContext('2d');
const N = 400;
let w, h, speed = 8;

function resize() {
  w = cv.width = innerWidth * devicePixelRatio;
  h = cv.height = innerHeight * devicePixelRatio;
}
function makeStar() {
  return { x: (Math.random() - 0.5) * w, y: (Math.random() - 0.5) * h, z: w };
}
resize();
addEventListener('resize', resize);
const stars = Array.from({ length: N }, function () {
  const s = makeStar();
  s.z = Math.random() * w; // 처음엔 깊이를 골고루
  return s;
});

addEventListener('pointerdown', function () { speed = 40; }); // 누르면 워프
addEventListener('pointerup', function () { speed = 8; });

(function frame() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'; // 반투명으로 덮어서 잔상
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#fff';
  for (const s of stars) {
    s.z -= speed;
    const sx = w / 2 + (s.x / s.z) * (w / 2); // 원근 투영
    const sy = h / 2 + (s.y / s.z) * (w / 2);
    if (s.z <= 1 || sx < 0 || sx > w || sy < 0 || sy > h) { Object.assign(s, makeStar()); continue; }
    const r = (1 - s.z / w) * 2.5 * devicePixelRatio;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  requestAnimationFrame(frame);
})();`,
    prompt: `- Canvas 로 별이 화면 중앙에서 쏟아져 나오는 워프(스타필드) 배경을 만들어줘.
- 별 400개, 각각 x, y(화면 크기 범위의 랜덤), z(깊이) 좌표. 매 프레임 z 를 speed 만큼 줄이고 화면 좌표 = 중심 + (x / z) × (너비/2) 로 원근 투영.
- 가까울수록 크게 그리고, 화면 밖이나 z ≤ 1 이 되면 새 별로 재활용.
- 매 프레임 rgba(0,0,0,0.35) 로 덮어 잔상 꼬리. 마우스를 누르고 있으면 speed 8 → 40 으로 워프.
- canvas 크기에 devicePixelRatio 반영, resize 대응. 가운데에 글로우 제목.`,
  },

  /* UI 스타일 */
  {
    id: 'neo-brutalism', cat: 'ui', ko: '네오브루탈리즘', en: 'Neo-brutalism', aka: ['Neubrutalism', '브루탈리즘 UI', 'Bold Outline UI'],
    tech: 'CSS', level: 1, hint: 'click',
    summary: '굵은 검정 테두리, 딱딱한 그림자, 쨍한 색의 UI 예요. 버튼을 눌러 보세요.',
    desc: 'blur 없는 box-shadow(예: 8px 8px 0 검정)로 종이를 오려 붙인 듯한 딱딱한 그림자를 만들고, 3px 검정 테두리와 원색 배경을 써요. 버튼을 누르면 그림자만큼 이동하고 그림자가 사라져 실제로 눌린 느낌이 납니다.',
    use: '개성 있는 스타트업·크리에이터 사이트, 포트폴리오, 이벤트 페이지',
    tip: '색이 강해서 본문까지 쓰면 피곤해요. 카드·버튼 같은 포인트 요소 위주로 쓰고 글자 대비는 충분히 확보하세요.',
    html: `<div class="nb-card">
  <span class="nb-tag">NEW</span>
  <h2>네오브루탈리즘</h2>
  <p>굵은 테두리 · 딱딱한 그림자 · 쨍한 색</p>
  <div class="nb-row">
    <button type="button" class="nb-btn yellow">눌러보기</button>
    <button type="button" class="nb-btn">취소</button>
  </div>
</div>`,
    css: `body { background: #fdf6e3; color: #111; }
.nb-card {
  position: relative;
  width: min(340px, 86vw);
  padding: 26px;
  border: 3px solid #111;
  border-radius: 14px;
  background: #a5f3fc;
  box-shadow: 8px 8px 0 #111;
}
.nb-tag {
  position: absolute;
  top: -14px;
  right: 18px;
  padding: 4px 10px;
  border: 3px solid #111;
  border-radius: 8px;
  background: #f472b6;
  font-size: 12px;
  font-weight: 900;
  transform: rotate(6deg);
}
.nb-card h2 { margin: 0 0 6px; font-size: 26px; font-weight: 900; }
.nb-card p { margin: 0 0 20px; font-weight: 600; }
.nb-row { display: flex; gap: 12px; }
.nb-btn {
  flex: 1;
  height: 46px;
  border: 3px solid #111;
  border-radius: 10px;
  background: #fff;
  color: #111;
  font: inherit;
  font-weight: 800;
  box-shadow: 4px 4px 0 #111;
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s;
}
.nb-btn.yellow { background: #fde047; }
.nb-btn:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 #111; }
.nb-btn:active { transform: translate(4px, 4px); box-shadow: 0 0 0 #111; }`,
    js: ``,
    prompt: `- 네오브루탈리즘 스타일 카드와 버튼을 만들어줘. 크림색 배경(#fdf6e3).
- 3px 검정 테두리, blur 없는 딱딱한 그림자(카드 8px 8px 0 #111, 버튼 4px 4px 0 #111), 원색(하늘 #a5f3fc, 노랑 #fde047, 핑크 #f472b6).
- 카드 모서리에 살짝 기울어진(rotate 6deg) NEW 태그.
- 버튼 호버 시 (-2px, -2px) 떠오르며 그림자 6px, 누르면(:active) (4px, 4px) 이동하고 그림자 0 → 실제로 눌린 느낌.`,
  },
  {
    id: 'accordion', cat: 'ui', ko: '아코디언', en: 'Accordion', aka: ['FAQ', 'Collapse', '접고 펼치기'],
    tech: 'CSS + JS', level: 1, hint: 'click',
    summary: '질문을 누르면 답이 부드럽게 펼쳐지고, 다른 항목은 접혀요.',
    desc: '높이를 모르는 내용을 부드럽게 펼치기 위해 grid-template-rows 를 0fr → 1fr 로 transition 하는 방법을 썼어요(안쪽 요소는 overflow: hidden). 아이콘의 세로 막대를 회전시켜 + 가 − 로 바뀌게 했고, aria-expanded 로 상태를 알려줍니다.',
    use: 'FAQ, 상품 상세 정보, 설정 메뉴, 모바일 내비게이션',
    tip: '버튼 요소(button)로 만들어야 키보드로도 열고 닫을 수 있어요. 하나만 열리게 할지, 여러 개 열리게 할지는 서비스에 맞게 정하세요.',
    html: `<div class="acc">
  <div class="acc-item open">
    <button type="button" class="acc-head" aria-expanded="true">배송은 얼마나 걸리나요?<i></i></button>
    <div class="acc-body"><div><p>보통 결제 후 1~2일 안에 도착해요.</p></div></div>
  </div>
  <div class="acc-item">
    <button type="button" class="acc-head" aria-expanded="false">교환·환불이 가능한가요?<i></i></button>
    <div class="acc-body"><div><p>받은 날로부터 7일 안에 신청하면 무료로 교환·환불해 드려요.</p></div></div>
  </div>
  <div class="acc-item">
    <button type="button" class="acc-head" aria-expanded="false">해외 배송도 되나요?<i></i></button>
    <div class="acc-body"><div><p>현재는 국내 배송만 지원하고 있어요.</p></div></div>
  </div>
</div>`,
    css: `.acc { width: min(440px, 90vw); display: grid; gap: 10px; }
.acc-item { border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 14px; background: rgba(255, 255, 255, 0.04); }
.acc-head {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}
.acc-head i { position: relative; flex: none; width: 14px; height: 14px; }
.acc-head i::before,
.acc-head i::after {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  width: 14px;
  height: 2px;
  border-radius: 2px;
  background: #a78bfa;
  transition: transform 0.3s;
}
.acc-head i::after { transform: rotate(90deg); }
.open .acc-head i::after { transform: rotate(0deg); } /* + → − */
.acc-body { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.35s ease; }
.open .acc-body { grid-template-rows: 1fr; }
.acc-body > div { overflow: hidden; }
.acc-body p { margin: 0; padding: 0 18px 16px; color: #9a98b3; }`,
    js: `document.querySelectorAll('.acc-head').forEach(function (btn) {
  btn.addEventListener('click', function () {
    const item = btn.parentElement;
    const willOpen = !item.classList.contains('open');
    // 하나만 열리게: 전부 닫고 누른 것만 열기
    document.querySelectorAll('.acc-item').forEach(function (it) {
      it.classList.remove('open');
      it.querySelector('.acc-head').setAttribute('aria-expanded', 'false');
    });
    item.classList.toggle('open', willOpen);
    btn.setAttribute('aria-expanded', String(willOpen));
  });
});`,
    prompt: `- FAQ 아코디언을 만들어줘. 질문은 button, 답변은 그 아래 영역.
- 높이 애니메이션은 grid-template-rows: 0fr → 1fr transition(안쪽 div 는 overflow: hidden)으로, 내용 높이를 몰라도 부드럽게.
- 오른쪽 + 아이콘은 막대 두 개로 그리고, 열리면 세로 막대가 회전해 − 가 되게.
- 한 번에 하나만 열리게, aria-expanded 갱신. 다크 배경에 반투명 카드 스타일.`,
  },
  {
    id: 'toast', cat: 'ui', ko: '토스트 알림', en: 'Toast Notification', aka: ['스낵바', 'Snackbar', '알림 팝업'],
    tech: 'JS', level: 1, hint: 'click',
    summary: '버튼을 누르면 화면 구석에 알림이 떴다가 시간이 지나면 사라져요.',
    desc: '알림 요소를 만들어 고정 위치의 목록에 추가하고, 아래 진행 막대가 3초 동안 줄어든 뒤 옆으로 사라지며 제거돼요. 상태별 색은 CSS 변수(--c) 하나로 바꿉니다. 컨테이너에 aria-live="polite" 를 주면 스크린 리더도 알림을 읽어줘요.',
    use: '저장·복사 완료 알림, 오류 메시지, 장바구니 담기, 실시간 알림',
    tip: '중요한 오류는 토스트처럼 자동으로 사라지면 놓칠 수 있어요. 사용자가 직접 닫을 수 있게 하거나 화면 안에 함께 표시하세요.',
    html: `<div class="t-buttons">
  <button type="button" data-type="success">성공</button>
  <button type="button" data-type="error">오류</button>
  <button type="button" data-type="info">알림</button>
</div>
<div class="toasts" id="toasts" aria-live="polite"></div>`,
    css: `.t-buttons { display: flex; gap: 10px; }
.t-buttons button {
  height: 42px;
  padding: 0 18px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  color: inherit;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
.toasts {
  position: fixed;
  right: 16px;
  bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: min(300px, calc(100vw - 32px));
}
.toast {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  background: #1b1b2b;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
  font-size: 14px;
  overflow: hidden;
  animation: t-in 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.toast::before { content: ''; flex: none; width: 10px; height: 10px; border-radius: 50%; background: var(--c); box-shadow: 0 0 10px var(--c); }
.toast::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 3px;
  background: var(--c);
  transform-origin: left;
  animation: t-life 3s linear forwards; /* 남은 시간 막대 */
}
.toast.out { animation: t-out 0.3s ease forwards; }
@keyframes t-in { from { opacity: 0; transform: translateY(16px) scale(0.96); } }
@keyframes t-out { to { opacity: 0; transform: translateX(40px); } }
@keyframes t-life { to { transform: scaleX(0); } }`,
    js: `const box = document.getElementById('toasts');
const kinds = {
  success: ['#22c55e', '저장했어요'],
  error: ['#ef4444', '문제가 생겼어요'],
  info: ['#38bdf8', '새 메시지가 있어요'],
};

document.querySelectorAll('[data-type]').forEach(function (b) {
  b.addEventListener('click', function () {
    const k = kinds[b.dataset.type];
    const t = document.createElement('div');
    t.className = 'toast';
    t.style.setProperty('--c', k[0]);
    t.textContent = k[1];
    box.appendChild(t);
    setTimeout(function () {
      t.addEventListener('animationend', function (e) { if (e.animationName === 't-out') t.remove(); });
      t.classList.add('out');
    }, 3000);
  });
});`,
    prompt: `- 버튼(성공/오류/알림)을 누르면 화면 오른쪽 아래에 토스트 알림이 쌓이며 뜨게 해줘.
- 컨테이너는 position: fixed + aria-live="polite". 상태 색은 CSS 변수 --c(초록 #22c55e, 빨강 #ef4444, 파랑 #38bdf8).
- 왼쪽에 빛나는 색 점, 아래에 3초 동안 줄어드는 진행 막대(::after scaleX 1 → 0).
- 등장은 아래에서 살짝 올라오며, 3초 뒤 오른쪽으로 사라지는 애니메이션이 끝나면(animationend) DOM 에서 제거.`,
  },

  /* 전환·로딩 */
  {
    id: 'view-transition', cat: 'loading', ko: '뷰 트랜지션', en: 'View Transitions API', aka: ['페이지 전환', 'Layout Animation', 'FLIP'],
    tech: 'CSS + JS', level: 2, hint: 'click',
    summary: '버튼을 누르면 카드들이 새 자리로 부드럽게 날아가며 레이아웃이 바뀌어요.',
    desc: 'document.startViewTransition() 안에서 DOM 을 바꾸면, 브라우저가 바뀌기 전·후 화면을 찍어 자동으로 이어 붙여 줘요. 요소마다 view-transition-name 을 주면 그 요소가 이전 위치에서 새 위치로 따로 날아갑니다. 위치 계산 코드를 직접 짤 필요가 없어요.',
    use: '그리드 ↔ 리스트 전환, 필터·정렬 결과, 썸네일 → 상세 화면, 탭 전환',
    tip: 'view-transition-name 은 화면에서 유일해야 해요. 지원하지 않는 브라우저에서는 if 문으로 그냥 바로 바뀌게 대체하세요.',
    html: `<div class="vt">
  <div class="vt-bar"><button type="button" id="vtBtn">레이아웃 바꾸기</button></div>
  <ul class="vt-list" id="list">
    <li style="view-transition-name: a; --c: #8b5cf6">A</li>
    <li style="view-transition-name: b; --c: #ec4899">B</li>
    <li style="view-transition-name: c; --c: #22d3ee">C</li>
    <li style="view-transition-name: d; --c: #f59e0b">D</li>
    <li style="view-transition-name: e; --c: #22c55e">E</li>
    <li style="view-transition-name: f; --c: #6366f1">F</li>
  </ul>
</div>`,
    css: `.vt { width: min(460px, 92vw); }
.vt-bar { display: flex; justify-content: center; margin-bottom: 16px; }
.vt-bar button {
  height: 40px;
  padding: 0 16px;
  border: 0;
  border-radius: 12px;
  background: #8b5cf6;
  color: #fff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
.vt-list { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 0; padding: 0; list-style: none; }
.vt-list li { height: 80px; display: grid; place-items: center; border-radius: 14px; background: var(--c); font-size: 22px; font-weight: 900; }
.vt-list.list { grid-template-columns: 1fr; }
.vt-list.list li { height: 38px; place-items: center start; padding-left: 16px; }
::view-transition-group(*) { animation-duration: 0.45s; animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1); }`,
    js: `const list = document.getElementById('list');

document.getElementById('vtBtn').addEventListener('click', function () {
  function change() {
    list.classList.toggle('list');                 // 그리드 ↔ 리스트
    Array.from(list.children).reverse().forEach(function (li) { list.appendChild(li); }); // 순서도 뒤집기
  }
  if (document.startViewTransition) document.startViewTransition(change); // 지원하면 애니메이션
  else change();                                                           // 아니면 바로 변경
});`,
    prompt: `- View Transitions API 로 카드 6개가 그리드(3열) ↔ 리스트(1열)로 바뀌면서 새 자리로 부드럽게 이동하는 데모를 만들어줘.
- 카드마다 고유한 view-transition-name(a~f)과 색(--c).
- 버튼 클릭 시 document.startViewTransition(() => { 클래스 토글 + 순서 뒤집기 }). 지원하지 않으면 바로 변경.
- ::view-transition-group(*) 의 duration 0.45s, cubic-bezier(0.2, 0.8, 0.2, 1).`,
  },
  {
    id: 'morph-button', cat: 'loading', ko: '모프 버튼', en: 'Morphing Button', aka: ['로딩 버튼', 'Submit Animation', '상태 버튼'],
    tech: 'CSS + JS', level: 2, hint: 'click',
    summary: '버튼을 누르면 동그란 로딩으로 줄어들었다가 체크 표시로 바뀌어요.',
    desc: '클래스만 바꿔서 상태를 표현해요: 기본 → loading(너비가 높이와 같아져 원이 되고 테두리 스피너) → done(초록 + 체크). 체크 표시는 테두리 두 변만 있는 사각형을 -45도 돌려 만들고, 살짝 튕기는 cubic-bezier 로 나타나게 했습니다.',
    use: '결제·제출·저장 버튼, 회원가입 완료, 업로드 진행 상태',
    tip: '처리 중에는 중복 클릭을 막고 aria-busy 로 상태를 알려 주세요. 실패했을 때의 상태(빨강·흔들림)도 함께 설계하면 좋아요.',
    html: `<button type="button" class="mb" id="mb">
  <span class="label">결제하기</span>
  <span class="check" aria-hidden="true"></span>
</button>`,
    css: `.mb {
  position: relative;
  width: 200px;
  height: 56px;
  border: 0;
  border-radius: 28px;
  background: linear-gradient(120deg, #8b5cf6, #ec4899);
  color: #fff;
  font: inherit;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  transition: width 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), background 0.4s;
}
.mb .label { transition: opacity 0.2s; }
.mb.loading, .mb.done { width: 56px; }
.mb.loading .label, .mb.done .label { opacity: 0; }
.mb.loading::after {
  content: '';
  position: absolute;
  inset: 14px;
  border: 3px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.mb.done { background: #22c55e; }
.mb .check {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 22px;
  height: 12px;
  border-left: 3px solid #fff;
  border-bottom: 3px solid #fff;
  transform: translate(-50%, -70%) rotate(-45deg) scale(0);
  transition: transform 0.3s 0.15s cubic-bezier(0.3, 1.6, 0.5, 1);
}
.mb.done .check { transform: translate(-50%, -70%) rotate(-45deg) scale(1); }
@keyframes spin { to { transform: rotate(360deg); } }`,
    js: `const mb = document.getElementById('mb');

mb.addEventListener('click', function () {
  if (mb.className !== 'mb') return; // 처리 중에는 무시
  mb.classList.add('loading');
  mb.setAttribute('aria-busy', 'true');
  setTimeout(function () {               // 서버 응답이라고 가정
    mb.classList.replace('loading', 'done');
    mb.removeAttribute('aria-busy');
    setTimeout(function () { mb.className = 'mb'; }, 1600); // 데모라서 원래대로
  }, 1500);
});`,
    prompt: `- 결제 버튼을 누르면 ① 버튼이 원(56px)으로 줄어들며 테두리 스피너가 돌고 ② 완료되면 초록색 + 체크 표시가 튀어나오는 모프 버튼을 만들어줘.
- 상태는 클래스(loading, done)만 바꾸고 모양 변화는 CSS transition(width, background).
- 체크는 border-left + border-bottom 사각형을 rotate(-45deg), scale(0 → 1) 에 튕기는 cubic-bezier.
- 처리 중 중복 클릭 방지, aria-busy 갱신. 서버 응답은 setTimeout 으로 흉내.`,
  },

  /* 이미지 */
  {
    id: 'hover-zoom', cat: 'image', ko: '호버 확대', en: 'Image Hover Zoom', aka: ['이미지 줌', 'Zoom on Hover', '캡션 슬라이드'],
    tech: 'CSS', level: 1, hint: 'hover',
    summary: '사진에 마우스를 올리면 천천히 확대되고 캡션이 올라와요.',
    desc: '카드에 overflow: hidden 을 주고 안쪽 이미지만 scale 로 키우면 액자 크기는 그대로인 채 사진만 확대돼요. 아래쪽에 그라디언트 캡션을 숨겨 두었다가 호버 시 올라오게 했습니다.',
    use: '포트폴리오 그리드, 상품 목록, 블로그 썸네일, 갤러리',
    tip: '확대는 transform 으로만 해야 레이아웃이 흔들리지 않아요. 터치 기기에는 호버가 없으니 캡션 정보를 다른 곳에도 보여주세요.',
    html: `<div class="hz">
  <figure class="hz-card">
    <img src="assets/effects/mountains.webp" alt="안개 낀 산맥의 일출">
    <figcaption><b>Mountains</b><span>Sunrise · 2026</span></figcaption>
  </figure>
  <figure class="hz-card">
    <img src="assets/effects/landscape.webp" alt="네온 도시 야경">
    <figcaption><b>Neon City</b><span>Night · 2026</span></figcaption>
  </figure>
</div>`,
    css: `.hz { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; width: min(560px, 92vw); }
.hz-card { position: relative; margin: 0; aspect-ratio: 3 / 4; border-radius: 16px; overflow: hidden; cursor: zoom-in; }
.hz-card img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1), filter 0.7s;
}
.hz-card figcaption {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  padding: 40px 14px 14px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.75));
  opacity: 0;
  transform: translateY(30%);
  transition: 0.45s ease;
}
.hz-card figcaption span { font-size: 12px; color: #c4c2dd; }
.hz-card:hover img { transform: scale(1.12); filter: saturate(1.2); }
.hz-card:hover figcaption { opacity: 1; transform: none; }`,
    js: ``,
    prompt: `- 사진 카드 2개짜리 갤러리에 호버 확대 효과를 CSS 만으로 넣어줘.
- 카드는 aspect-ratio 3/4, overflow: hidden, 이미지는 object-fit: cover.
- 호버 시 이미지만 scale(1.12) + saturate(1.2), 0.7초 cubic-bezier(0.2, 0.8, 0.2, 1).
- 아래쪽 그라디언트 캡션(제목 + 작은 부제)이 평소엔 숨어 있다가 호버 시 아래에서 올라오며 나타나게.`,
  },
  {
    id: 'duotone', cat: 'image', ko: '듀오톤', en: 'Duotone', aka: ['투톤 이미지', 'Two-tone Photo', '컬러 오버레이'],
    tech: 'CSS', level: 2, hint: 'hover',
    summary: '사진을 두 가지 색으로만 표현해요. 마우스를 올리면 원본 색이 돌아와요.',
    desc: '배경을 어두운 색으로 칠하고 흑백 사진을 screen 으로 얹으면 사진의 검은 부분이 그 어두운 색이 돼요. 그 위에 밝은 색을 multiply 로 덮으면 흰 부분이 밝은 색이 됩니다. 결국 어두운 색 ↔ 밝은 색 두 가지로만 이루어진 듀오톤이 돼요.',
    use: '브랜드 컬러로 통일한 사진, 팀 소개 사진, 히어로 배경, 포스터형 디자인',
    tip: '색 조합은 명도 차이가 큰 두 색이어야 사진이 알아보기 쉬워요. 사진 원본 대비가 낮으면 contrast 필터를 같이 쓰세요.',
    html: `<div class="duo-row">
  <figure class="duo" style="--dark: #1e1b4b; --light: #f472b6"><img src="assets/effects/mountains.webp" alt="핑크·남색 듀오톤 산맥"></figure>
  <figure class="duo" style="--dark: #052e16; --light: #a3e635"><img src="assets/effects/mountains.webp" alt="초록 듀오톤 산맥"></figure>
  <figure class="duo" style="--dark: #0c4a6e; --light: #fde68a"><img src="assets/effects/mountains.webp" alt="파랑·노랑 듀오톤 산맥"></figure>
</div>`,
    css: `.duo-row { display: flex; gap: 12px; width: min(600px, 94vw); }
.duo {
  position: relative;
  flex: 1;
  margin: 0;
  aspect-ratio: 3 / 4;
  border-radius: 14px;
  overflow: hidden;
  background: var(--dark); /* 사진의 검정 → 이 색 */
}
.duo img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(1) contrast(1.2);
  mix-blend-mode: screen;
  transition: filter 0.5s;
}
.duo::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--light); /* 사진의 흰색 → 이 색 */
  mix-blend-mode: multiply;
  transition: opacity 0.5s;
}
.duo:hover::after { opacity: 0; }
.duo:hover img { filter: none; mix-blend-mode: normal; }`,
    js: ``,
    prompt: `- 사진을 두 가지 색으로만 보이게 하는 듀오톤 효과를 CSS 만으로 만들어줘(이미지 편집 없이).
- figure 배경 = 어두운 색(--dark), 이미지는 grayscale(1) contrast(1.2) + mix-blend-mode: screen.
- ::after 에 밝은 색(--light) + mix-blend-mode: multiply 로 덮기.
- 같은 사진 3장을 서로 다른 색 조합(남색/핑크, 진초록/라임, 파랑/노랑)으로. 호버 시 원본 색으로 돌아오게.`,
  },

  /* 3D */
  {
    id: 'glass-sphere', cat: '3d', ko: '유리 구슬 (Three.js)', en: 'Glass Sphere', aka: ['WebGL 유리', 'Transmission Material', '3D 굴절'],
    tech: 'Three.js', level: 3, hint: 'hover',
    summary: '진짜 유리처럼 뒤의 물체를 굴절시키는 3D 구슬이 마우스를 따라와요.',
    desc: 'Three.js 의 MeshPhysicalMaterial 에 transmission(투과) 1, 낮은 roughness, 두께(thickness)와 굴절률(ior)을 주면 뒤에 있는 물체가 휘어 보이는 유리가 돼요. iridescence 로 비눗방울 같은 무지개 반사도 더했습니다. 뒤에서 도는 색깔 매듭들이 구슬을 통해 굴절돼 보여요.',
    use: '테크·AI 브랜드 히어로, 제품 소개 3D 오브젝트, 인터랙티브 랜딩',
    tip: 'transmission 은 장면을 한 번 더 그리기 때문에 무거워요. 모바일에서는 pixelRatio 를 낮추고, 화면 밖에서는 렌더링을 멈추세요. WebGL 을 못 쓰는 환경을 위한 정적 이미지도 준비하세요.',
    html: `<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
<canvas id="gl"></canvas>
<p class="g-cap">Three.js · MeshPhysicalMaterial · 마우스를 움직여 보세요</p>`,
    css: `body { overflow: hidden; background: radial-gradient(circle at 50% 40%, #1e1b4b, #07070c 70%); }
#gl { position: fixed; inset: 0; width: 100%; height: 100%; }
.g-cap { position: fixed; left: 0; right: 0; bottom: 14px; margin: 0; text-align: center; font-size: 12px; color: #8b8fb0; }`,
    js: `const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gl'), antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d0b1f); // 유리(transmission)는 뒤 배경을 굴절시키므로 배경색이 필요

// 간단한 환경광: 밝은 색 판들을 구워서 유리 표면 반사에 사용
const envScene = new THREE.Scene();
[[0x8b5cf6, -4], [0x22d3ee, 4], [0xffffff, 0]].forEach(function (p) {
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(4, 8), new THREE.MeshBasicMaterial({ color: p[0], side: THREE.DoubleSide }));
  panel.position.set(p[1], 2, p[1] === 0 ? 5 : 0);
  panel.lookAt(0, 0, 0);
  envScene.add(panel);
});
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(envScene, 0.04).texture;
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(0, 0, 6);

// 유리 구슬: 투과 + 굴절 + 무지개 반사
const glass = new THREE.Mesh(
  new THREE.SphereGeometry(1.2, 64, 64),
  new THREE.MeshPhysicalMaterial({
    transmission: 1, roughness: 0, thickness: 1.5, ior: 1.45,
    iridescence: 0.6, iridescenceIOR: 1.3, clearcoat: 1, envMapIntensity: 1.2,
  })
);
scene.add(glass);

// 뒤에서 도는 색깔 매듭들 (유리를 통해 굴절돼 보임)
const orbs = [0x8b5cf6, 0xec4899, 0x22d3ee, 0xf59e0b].map(function (c) {
  const m = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.35, 0.12, 100, 16),
    new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.6, roughness: 0.3, metalness: 0.3 })
  );
  scene.add(m);
  return m;
});

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const light = new THREE.DirectionalLight(0xffffff, 2.5);
light.position.set(3, 4, 5);
scene.add(light);

let mx = 0, my = 0;
addEventListener('pointermove', function (e) { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });

function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();

const clock = new THREE.Clock();
renderer.setAnimationLoop(function () {
  const t = clock.getElapsedTime();
  orbs.forEach(function (o, i) {
    const a = t * 0.6 + i * Math.PI / 2;
    o.position.set(Math.cos(a) * 2.2, Math.sin(a * 1.3) * 0.8, Math.sin(a) * 1.2 - 1.5);
    o.rotation.set(t + i, t * 0.7, 0);
  });
  glass.position.x += (mx * 1.2 - glass.position.x) * 0.05; // 마우스 쪽으로 천천히
  glass.position.y += (-my * 1.2 - glass.position.y) * 0.05;
  renderer.render(scene, camera);
});`,
    prompt: `- Three.js 로 진짜 유리처럼 굴절되는 3D 구슬 히어로를 만들어줘.
- 구슬: SphereGeometry(1.2, 64, 64) + MeshPhysicalMaterial({ transmission: 1, roughness: 0.05, thickness: 1.2, ior: 1.5, iridescence: 1, clearcoat: 1 }).
- 구슬 뒤에서 보라·핑크·시안·주황 TorusKnot 4개가 원을 그리며 돌아서 유리를 통해 굴절돼 보이게(emissive 로 살짝 발광).
- 구슬은 마우스 위치 쪽으로 lerp(5%)로 천천히 따라오게. AmbientLight + DirectionalLight.
- 유리가 뒤를 굴절시키려면 scene.background(남색)와 환경맵(PMREMGenerator 로 밝은 판 몇 개를 구운 것)이 필요. ACES 톤매핑.
- pixelRatio 최대 2, resize 대응.`,
  },
  /* ════════════════════ 3차 추가: 실무에서 자주 쓰는 16개 ════════════════════ */

  /* 텍스트 */
  {
    id: 'text-fill-scroll', cat: 'text', ko: '스크롤 글자 채우기', en: 'Text Fill on Scroll', aka: ['Scroll Text Reveal', '텍스트 하이라이트 스크롤', '글자 진해지기'],
    tech: 'JS', level: 2, hint: 'scroll',
    summary: '스크롤을 내릴수록 흐린 문장이 한 글자씩 진하게 채워져요.',
    desc: '문장을 글자 단위 span 으로 나눠 처음엔 흐리게 두고, 문단이 화면을 지나가는 정도(0~1)를 계산해서 그 비율만큼 앞 글자부터 진하게 바꿔요. 읽는 속도와 스크롤이 맞물려서 메시지에 집중하게 됩니다.',
    use: '브랜드 철학·미션 문장, 회사 소개 첫 섹션, 제품 핵심 메시지',
    tip: '긴 문단에 쓰면 오히려 읽기 불편해요. 한두 문장짜리 핵심 메시지에만 쓰고, 원문은 aria-label 로 제공하세요.',
    html: `<p class="tf-hint">↓ 스크롤해 보세요</p>
<p class="tf" id="tf">우리는 복잡한 것을 단순하게, 단순한 것을 아름답게 만듭니다. 스크롤을 내릴수록 문장이 한 글자씩 채워져요.</p>
<div class="tf-end"></div>`,
    css: `body { display: block; padding: 0 24px; }
.tf-hint { height: 40vh; display: grid; place-items: end center; margin: 0; padding-bottom: 24px; color: #8b8fb0; }
.tf {
  max-width: 640px;
  margin: 0 auto;
  font-size: clamp(26px, 5.4vw, 44px);
  font-weight: 800;
  line-height: 1.35;
  letter-spacing: -0.02em;
}
.tf span { color: rgba(236, 235, 245, 0.15); transition: color 0.2s; }
.tf span.on { color: #ecebf5; }
.tf-end { height: 70vh; }`,
    js: `const tf = document.getElementById('tf');
const text = tf.textContent;
tf.setAttribute('aria-label', text);
tf.innerHTML = '';
const chars = Array.from(text).map(function (c) {
  const s = document.createElement('span');
  s.textContent = c;
  s.setAttribute('aria-hidden', 'true');
  tf.appendChild(s);
  return s;
});

function update() {
  const r = tf.getBoundingClientRect();
  // 문단 윗변이 화면 80% 지점일 때 0 → 아랫변이 40% 지점일 때 1
  const start = innerHeight * 0.8, end = innerHeight * 0.4;
  const p = Math.min(1, Math.max(0, (start - r.top) / (start - end + r.height)));
  const n = Math.round(p * chars.length);
  chars.forEach(function (s, i) { s.classList.toggle('on', i < n); });
}
addEventListener('scroll', function () { requestAnimationFrame(update); }, { passive: true });
update();`,
    prompt: `- 스크롤할수록 흐린 문장이 앞 글자부터 한 글자씩 진하게 채워지는 효과를 만들어줘.
- JS 로 문장을 글자마다 span 으로 나누고(원문은 aria-label, span 은 aria-hidden), 기본 색은 투명도 15%, .on 이면 100%.
- 진행률 p = (화면80% - 문단.top) / (화면80% - 화면40% + 문단높이) 를 0~1 로 자르고, 앞에서 p × 글자수 만큼 .on.
- 큰 굵은 글씨(최대 44px), scroll 은 passive + requestAnimationFrame.`,
  },

  /* 호버·인터랙션 */
  {
    id: 'hover-image-reveal', cat: 'hover', ko: '이미지 호버 리빌', en: 'Hover Image Reveal', aka: ['List Hover Image', '마우스 따라오는 이미지', 'Floating Preview'],
    tech: 'JS', level: 2, hint: 'hover',
    summary: '목록 항목에 마우스를 올리면 그 사진이 커서 옆에 떠서 따라다녀요.',
    desc: '목록은 글자만으로 깔끔하게 두고, 항목에 올렸을 때만 해당 사진을 position: fixed 이미지로 보여줘요. 이미지 위치는 매 프레임 마우스 쪽으로 18%씩 다가가게(lerp) 해서 살짝 늦게 미끄러지듯 따라오고, 나타날 때 회전·확대가 풀립니다.',
    use: '포트폴리오 프로젝트 목록, 에이전시 작업 리스트, 메뉴·서비스 목록',
    tip: '이미지는 미리 불러와야(preload) 처음 올릴 때 깜빡이지 않아요. 터치 기기에서는 목록 옆에 썸네일을 직접 보여주는 대안이 필요해요.',
    html: `<ul class="hir" id="hir">
  <li data-img="assets/effects/forest.webp">Forest<span>2026</span></li>
  <li data-img="assets/effects/ocean.webp">Ocean<span>2026</span></li>
  <li data-img="assets/effects/desert.webp">Desert<span>2025</span></li>
  <li data-img="assets/effects/street.webp">Street<span>2025</span></li>
</ul>
<img class="hir-img" id="hirImg" src="assets/effects/forest.webp" alt="">`,
    css: `.hir { width: min(520px, 90vw); margin: 0; padding: 0; list-style: none; }
.hir li {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 14px 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  font-size: clamp(26px, 6vw, 40px);
  font-weight: 800;
  letter-spacing: -0.02em;
  cursor: pointer;
  transition: color 0.3s, padding 0.3s;
}
.hir li span { font-size: 13px; font-weight: 500; color: #8b8fb0; }
.hir:hover li { color: rgba(236, 235, 245, 0.3); }
.hir li:hover { color: #fff; padding-left: 14px; }
.hir-img {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 5;
  width: 180px;
  aspect-ratio: 3 / 4;
  margin: -120px 0 0 -90px; /* 이미지 중심을 기준점으로 */
  object-fit: cover;
  border-radius: 12px;
  pointer-events: none;
  opacity: 0;
  transform: scale(0.8) rotate(-6deg);
  transition: opacity 0.25s, transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.hir-img.show { opacity: 1; transform: scale(1) rotate(0deg); }`,
    js: `const img = document.getElementById('hirImg');
let x = 0, y = 0, cx = 0, cy = 0;

document.querySelectorAll('#hir li').forEach(function (li) {
  new Image().src = li.dataset.img; // 미리 불러오기
  li.addEventListener('pointerenter', function () { img.src = li.dataset.img; img.classList.add('show'); });
  li.addEventListener('pointerleave', function () { img.classList.remove('show'); });
});
addEventListener('pointermove', function (e) { x = e.clientX; y = e.clientY; });

(function loop() {
  cx += (x - cx) * 0.18; // 살짝 늦게 따라오게(lerp)
  cy += (y - cy) * 0.18;
  img.style.translate = (cx + 110) + 'px ' + cy + 'px';
  requestAnimationFrame(loop);
})();`,
    prompt: `- 프로젝트 이름 목록(큰 굵은 글씨 + 오른쪽 연도)에 마우스를 올리면 해당 사진이 커서 오른쪽에 떠서 따라다니게 해줘.
- 각 li 에 data-img 로 사진 경로, 사진은 미리 preload.
- 이미지는 position: fixed + pointer-events: none, 위치는 rAF 루프에서 마우스 좌표로 18%씩 lerp.
- 나타날 때 scale(0.8) rotate(-6deg) → 원래대로 + 페이드. 목록에 올리면 다른 항목은 흐려지고 현재 항목은 살짝 오른쪽으로.`,
  },
  {
    id: 'fill-button', cat: 'hover', ko: '버튼 채움 효과', en: 'Button Fill Hover', aka: ['Hover Fill', '슬라이드 버튼', 'Liquid Button'],
    tech: 'CSS + JS', level: 1, hint: 'hover',
    summary: '버튼에 올리면 배경색이 옆에서 차오르거나, 마우스가 들어온 곳에서 원으로 퍼져요.',
    desc: '버튼 안에 ::before 로 색 레이어를 숨겨 두고 호버 때 transform 으로 펼쳐요. ① scaleX 로 왼쪽부터 차오르기 ② 마우스가 들어온 좌표(--x, --y)에서 원이 scale 로 퍼지기 ③ 아래에서 위로 차오르기. 레이어는 z-index: -1 로 글자 뒤에 둡니다.',
    use: 'CTA 버튼, 내비게이션 버튼, 폼 제출 버튼',
    tip: '버튼에 overflow: hidden 과 z-index: 0(새 쌓임 맥락)을 꼭 줘야 색 레이어가 버튼 밖으로 나가거나 글자를 덮지 않아요.',
    html: `<div class="fb">
  <button type="button" class="fb1">Slide Fill</button>
  <button type="button" class="fb2">Circle Fill</button>
  <button type="button" class="fb3">Rise Fill</button>
</div>`,
    css: `.fb { display: flex; flex-direction: column; gap: 16px; }
.fb button {
  position: relative;
  z-index: 0;
  overflow: hidden;
  width: 220px;
  height: 54px;
  border: 2px solid #a78bfa;
  border-radius: 14px;
  background: transparent;
  color: #ecebf5;
  font: inherit;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: color 0.35s;
}
.fb button::before {
  content: '';
  position: absolute;
  z-index: -1;
  background: #a78bfa;
  transition: transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.fb button:hover, .fb button:focus-visible { color: #0b0b14; }
.fb1::before { inset: 0; transform: scaleX(0); transform-origin: left; }
.fb1:hover::before, .fb1:focus-visible::before { transform: scaleX(1); }
.fb2::before {
  left: var(--x, 50%);
  top: var(--y, 50%);
  width: 460px;
  height: 460px;
  margin: -230px 0 0 -230px;
  border-radius: 50%;
  transform: scale(0);
}
.fb2:hover::before, .fb2:focus-visible::before { transform: scale(1); }
.fb3 { border-color: #f472b6; }
.fb3::before { inset: 0; background: #f472b6; transform: translateY(101%); }
.fb3:hover::before, .fb3:focus-visible::before { transform: none; }`,
    js: `// Circle Fill: 마우스가 들어오고 나간 위치에서 원이 퍼지고 줄어들게
const b = document.querySelector('.fb2');
function at(e) {
  const r = b.getBoundingClientRect();
  b.style.setProperty('--x', (e.clientX - r.left) + 'px');
  b.style.setProperty('--y', (e.clientY - r.top) + 'px');
}
b.addEventListener('pointerenter', at);
b.addEventListener('pointerleave', at);`,
    prompt: `- 호버 시 배경색이 채워지는 버튼 3종을 만들어줘(테두리만 있는 투명 버튼).
- 버튼은 position: relative; z-index: 0; overflow: hidden, 색 레이어는 ::before + z-index: -1.
- ① scaleX(0 → 1), transform-origin: left ② 마우스가 들어온 좌표를 --x/--y 로 넘겨 그 위치에서 큰 원이 scale(0 → 1) ③ translateY(101% → 0) 아래에서 위로.
- 채워질 때 글자색이 어둡게 바뀌고, :focus-visible 에도 같은 효과.`,
  },
  {
    id: 'tooltip', cat: 'hover', ko: '툴팁', en: 'Tooltip', aka: ['말풍선', 'Hint Bubble', 'Popover'],
    tech: 'CSS', level: 1, hint: 'hover',
    summary: '아이콘 버튼에 올리면 작은 설명 말풍선이 부드럽게 나타나요.',
    desc: 'data-tip 속성에 문구를 넣고 ::after 의 content: attr(data-tip) 으로 말풍선을, ::before 의 투명 테두리 삼각형으로 꼬리를 만들어요. JS 없이 :hover 와 :focus-visible 로 나타나고, 클래스 하나로 아래쪽 툴팁으로 바꿀 수 있어요.',
    use: '아이콘만 있는 버튼 설명, 단축키 안내, 폼 입력 도움말',
    tip: '툴팁은 보조 설명일 뿐이에요. 버튼에는 aria-label 을 꼭 따로 주세요. 화면 가장자리에서는 잘릴 수 있으니 위치를 바꿔 주세요.',
    html: `<div class="tt-row">
  <button type="button" class="tt" data-tip="복사하기" aria-label="복사하기">⧉</button>
  <button type="button" class="tt" data-tip="좋아요" aria-label="좋아요">♥</button>
  <button type="button" class="tt" data-tip="공유하기 (Ctrl+S)" aria-label="공유하기">↗</button>
  <button type="button" class="tt bottom" data-tip="아래쪽 툴팁" aria-label="설정">⚙</button>
</div>`,
    css: `.tt-row { display: flex; gap: 14px; }
.tt {
  position: relative;
  width: 52px;
  height: 52px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  color: #ecebf5;
  font-size: 22px;
  cursor: pointer;
}
.tt::before,
.tt::after {
  position: absolute;
  left: 50%;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s, transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.tt::after { /* 말풍선 */
  content: attr(data-tip);
  bottom: calc(100% + 10px);
  padding: 6px 10px;
  border-radius: 8px;
  background: #f4f3ff;
  color: #111;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
  transform: translate(-50%, 6px);
}
.tt::before { /* 꼬리 삼각형 */
  content: '';
  bottom: calc(100% + 4px);
  border: 6px solid transparent;
  border-top-color: #f4f3ff;
  border-bottom: 0;
  transform: translate(-50%, 6px);
}
.tt:hover::before, .tt:hover::after,
.tt:focus-visible::before, .tt:focus-visible::after { opacity: 1; transform: translate(-50%, 0); }
.tt.bottom::after { bottom: auto; top: calc(100% + 10px); transform: translate(-50%, -6px); }
.tt.bottom::before { bottom: auto; top: calc(100% + 4px); border: 6px solid transparent; border-bottom-color: #f4f3ff; border-top: 0; transform: translate(-50%, -6px); }
.tt.bottom:hover::before, .tt.bottom:hover::after,
.tt.bottom:focus-visible::before, .tt.bottom:focus-visible::after { transform: translate(-50%, 0); }`,
    js: ``,
    prompt: `- 아이콘 버튼에 마우스를 올리거나 키보드로 포커스하면 말풍선 툴팁이 나타나게 해줘. CSS 만 사용.
- 문구는 data-tip 속성, ::after 에 content: attr(data-tip) 로 밝은 말풍선, ::before 에 border 삼각형 꼬리.
- 평소엔 opacity 0 + 6px 아래, 나타날 때 제자리로 올라오며 페이드.
- .bottom 클래스를 붙이면 버튼 아래쪽에 뜨는 버전. 버튼에는 aria-label 별도로.`,
  },

  /* 스크롤 */
  {
    id: 'hide-header', cat: 'scroll', ko: '스크롤 헤더 숨김', en: 'Hide Header on Scroll', aka: ['Headroom', 'Smart Header', '오토 하이드 헤더'],
    tech: 'JS', level: 1, hint: 'scroll',
    summary: '아래로 내리면 헤더가 숨고, 조금만 올려도 다시 나타나요.',
    desc: '직전 스크롤 위치와 비교해서 내려가는 중이면 헤더에 hide 클래스를 붙여 translateY(-100%) 로 위로 숨기고, 올라가는 중이면 다시 보여줘요. 몇 픽셀의 작은 흔들림은 무시해서 헤더가 깜빡거리지 않게 했습니다.',
    use: '거의 모든 사이트의 상단 헤더, 특히 모바일에서 화면을 넓게 쓰고 싶을 때',
    tip: '맨 위(스크롤 60px 이하)에서는 항상 보이게 하세요. 헤더 안에서 키보드 포커스가 있을 때는 숨기지 않는 게 좋아요.',
    html: `<header class="hh" id="hh">
  <b>LOGO</b>
  <nav><a href="#">Work</a><a href="#">About</a><a href="#">Contact</a></nav>
</header>
<main class="hh-main">
  <p>↓ 아래로 스크롤하면 헤더가 숨고, ↑ 조금만 올려도 다시 나와요.</p>
  <div class="hh-block"></div><div class="hh-block"></div><div class="hh-block"></div>
  <div class="hh-block"></div><div class="hh-block"></div><div class="hh-block"></div>
</main>`,
    css: `body { display: block; }
.hh {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(11, 11, 20, 0.75);
  backdrop-filter: blur(12px);
  transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.hh.hide { transform: translateY(-100%); }
.hh nav { display: flex; gap: 16px; }
.hh a { color: #c4c2dd; font-size: 14px; text-decoration: none; }
.hh-main { max-width: 520px; margin: 0 auto; padding: 90px 20px 40px; }
.hh-main p { color: #9a98b3; }
.hh-block { height: 160px; margin-bottom: 16px; border-radius: 16px; background: linear-gradient(135deg, #1e1b4b, #312e81); }
.hh-block:nth-child(odd) { background: linear-gradient(135deg, #3b0764, #831843); }`,
    js: `const hh = document.getElementById('hh');
let lastY = scrollY;

addEventListener('scroll', function () {
  const y = scrollY;
  if (Math.abs(y - lastY) < 6) return;          // 작은 흔들림은 무시
  hh.classList.toggle('hide', y > lastY && y > 60); // 내리는 중이고 맨 위가 아닐 때만 숨김
  lastY = y;
}, { passive: true });

document.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });`,
    prompt: `- 스크롤을 내리면 상단 고정 헤더가 위로 숨고, 조금이라도 올리면 다시 나타나는 헤더를 만들어줘.
- 직전 scrollY 와 비교해 6px 미만 변화는 무시, 내려가는 중 + scrollY > 60 이면 .hide(translateY(-100%)).
- transition 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), 헤더는 반투명 + backdrop-filter: blur.
- scroll 리스너는 passive.`,
  },
  {
    id: 'line-drawing', cat: 'scroll', ko: 'SVG 선 그리기', en: 'SVG Line Drawing', aka: ['Path Drawing', 'stroke-dashoffset', '스크롤 타임라인 선'],
    tech: 'JS', level: 2, hint: 'scroll',
    summary: '스크롤에 맞춰 구불구불한 선이 그려지고, 선이 닿으면 단계 라벨이 나타나요.',
    desc: 'SVG path 의 전체 길이(getTotalLength)만큼 stroke-dasharray 를 주고 stroke-dashoffset 을 같은 값으로 두면 선이 안 보여요. 스크롤 진행률만큼 offset 을 줄이면 선이 그려지는 것처럼 보입니다. 연한 같은 선을 뒤에 깔아 앞으로 갈 길도 보여줬어요.',
    use: '회사 연혁·로드맵 타임라인, 이용 단계 안내, 손글씨 서명 애니메이션',
    tip: '선 길이는 화면 크기가 바뀌어도 SVG 좌표 기준이라 그대로예요. 그라디언트 선은 SVG 안의 linearGradient 를 stroke: url(#id) 로 연결하세요.',
    html: `<p class="ld-hint">↓ 스크롤하면 길이 그려져요</p>
<section class="ld" id="ld">
  <svg viewBox="0 0 300 900" aria-hidden="true">
    <defs>
      <linearGradient id="ldg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#8b5cf6"/>
        <stop offset="1" stop-color="#22d3ee"/>
      </linearGradient>
    </defs>
    <path class="ld-track" d="M150 0 C 260 120, 40 220, 150 330 S 270 560, 150 660 S 40 820, 150 900"/>
    <path class="ld-line" id="ldPath" d="M150 0 C 260 120, 40 220, 150 330 S 270 560, 150 660 S 40 820, 150 900"/>
  </svg>
  <span class="ld-step" data-at="0.08" style="top: 6%; left: 58%">01 기획</span>
  <span class="ld-step" data-at="0.36" style="top: 36%; left: 10%">02 디자인</span>
  <span class="ld-step" data-at="0.64" style="top: 66%; left: 62%">03 개발</span>
  <span class="ld-step" data-at="0.95" style="top: 96%; left: 30%">04 출시</span>
</section>
<div class="ld-end"></div>`,
    css: `body { display: block; }
.ld-hint { height: 45vh; display: grid; place-items: end center; margin: 0; padding-bottom: 20px; color: #8b8fb0; }
.ld { position: relative; width: min(320px, 80vw); margin: 0 auto; }
.ld svg { display: block; width: 100%; height: auto; overflow: visible; }
.ld path { fill: none; stroke-width: 6; stroke-linecap: round; }
.ld-track { stroke: rgba(255, 255, 255, 0.07); }
.ld-line { stroke: url(#ldg); }
.ld-step {
  position: absolute;
  padding: 6px 12px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  background: #1b1b2b;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  opacity: 0;
  transform: translateY(-30%) scale(0.9);
  transition: opacity 0.4s, transform 0.4s cubic-bezier(0.3, 1.4, 0.5, 1);
}
.ld-step.on { opacity: 1; transform: translateY(-50%); }
.ld-end { height: 60vh; }`,
    js: `const path = document.getElementById('ldPath');
const box = document.getElementById('ld');
const len = path.getTotalLength();          // 선 전체 길이
path.style.strokeDasharray = len;
path.style.strokeDashoffset = len;          // 처음엔 다 숨김
const steps = document.querySelectorAll('.ld-step');

function update() {
  const r = box.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height)); // 화면 60% 지점 기준 진행률
  path.style.strokeDashoffset = len * (1 - p);
  steps.forEach(function (s) { s.classList.toggle('on', p >= Number(s.dataset.at)); });
}
addEventListener('scroll', function () { requestAnimationFrame(update); }, { passive: true });
update();`,
    prompt: `- 스크롤에 맞춰 세로로 구불구불한 SVG 선이 그려지는 로드맵 타임라인을 만들어줘.
- path 의 getTotalLength() 로 stroke-dasharray = 길이, stroke-dashoffset = 길이 × (1 - 진행률).
- 진행률은 (화면높이 × 0.6 - 섹션.top) / 섹션높이 를 0~1 로.
- 같은 모양의 연한 선을 뒤에 깔고, 앞 선은 보라→시안 linearGradient(stroke: url(#id)), 굵기 6, 둥근 끝.
- 선이 각 지점(진행률 0.08 / 0.36 / 0.64 / 0.95)에 닿으면 단계 라벨이 톡 튀어나오게.`,
  },
  {
    id: 'back-to-top', cat: 'scroll', ko: '맨 위로 버튼', en: 'Back to Top', aka: ['Scroll to Top', '진행률 버튼', 'Progress Ring Button'],
    tech: 'JS', level: 1, hint: 'scroll',
    summary: '조금 내려가면 나타나는 맨 위로 버튼. 테두리 원이 읽은 만큼 차올라요.',
    desc: 'SVG 원의 둘레(2πr)를 stroke-dasharray 로 주고, 스크롤 진행률만큼 stroke-dashoffset 을 줄여서 원형 진행 막대를 만들었어요. 200px 이상 내려가면 버튼이 나타나고, 누르면 scrollTo({ behavior: smooth }) 로 부드럽게 올라갑니다.',
    use: '긴 글·블로그, 상품 상세 페이지, 문서 사이트, 모바일 페이지',
    tip: '버튼이 다른 고정 버튼(채팅 상담 등)과 겹치지 않게 위치를 잡고, aria-label 을 꼭 넣으세요.',
    html: `<main class="bt-page">
  <h2>긴 글 읽기</h2>
  <p>스크롤을 내려 보세요. 오른쪽 아래에 맨 위로 버튼이 나타나고, 테두리 원이 읽은 만큼 차올라요.</p>
  <p>좋은 웹사이트는 사용자가 길을 잃지 않게 도와줘요. 긴 페이지에서 지금 어디쯤인지 보여주고, 한 번에 처음으로 돌아갈 수 있는 길을 열어 두는 것도 그중 하나예요.</p>
  <p>버튼은 처음부터 보이면 방해가 되니, 어느 정도 내려간 뒤에 조용히 나타나는 게 좋아요.</p>
  <p>원형 진행 표시는 SVG 원의 테두리를 점선처럼 다루는 방법으로 만들어요. 점선 한 칸의 길이를 원 둘레와 같게 만들고, 시작 위치를 밀어내면 원이 일부만 그려져요.</p>
  <p>스크롤 이벤트는 자주 일어나므로 passive 옵션과 requestAnimationFrame 으로 가볍게 처리해요.</p>
  <p>모바일에서는 엄지가 닿기 쉬운 오른쪽 아래가 좋은 자리예요.</p>
  <p>끝까지 내려오면 원이 꽉 차요. 이제 버튼을 눌러 보세요!</p>
</main>
<button type="button" class="btt" id="btt" aria-label="맨 위로">
  <svg viewBox="0 0 48 48" aria-hidden="true">
    <circle class="trk" cx="24" cy="24" r="21"/>
    <circle class="prog" id="prog" cx="24" cy="24" r="21"/>
    <path d="M24 31V17M17 23l7-7 7 7"/>
  </svg>
</button>`,
    css: `body { display: block; }
.bt-page { max-width: 520px; margin: 0 auto; padding: 32px 20px 80px; }
.bt-page h2 { margin: 0 0 12px; }
.bt-page p { margin: 0 0 14px; color: #9a98b3; line-height: 1.9; }
.btt {
  position: fixed;
  right: 18px;
  bottom: 18px;
  width: 52px;
  height: 52px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: #16162a;
  color: #fff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transform: translateY(16px) scale(0.9);
  transition: opacity 0.3s, transform 0.3s;
}
.btt.show { opacity: 1; pointer-events: auto; transform: none; }
.btt svg { width: 100%; height: 100%; fill: none; stroke-linecap: round; stroke-linejoin: round; }
.btt .trk { stroke: rgba(255, 255, 255, 0.12); stroke-width: 3; }
.btt .prog { stroke: #a78bfa; stroke-width: 3; transform: rotate(-90deg); transform-origin: center; } /* 12시 방향에서 시작 */
.btt path { stroke: #fff; stroke-width: 2.5; }`,
    js: `const btt = document.getElementById('btt');
const prog = document.getElementById('prog');
const C = 2 * Math.PI * 21;            // 원 둘레
prog.style.strokeDasharray = C;

function update() {
  const max = document.documentElement.scrollHeight - innerHeight;
  const p = max > 0 ? scrollY / max : 0;
  prog.style.strokeDashoffset = C * (1 - p);   // 읽은 만큼 원이 참
  btt.classList.toggle('show', scrollY > 200);
}
addEventListener('scroll', function () { requestAnimationFrame(update); }, { passive: true });
btt.addEventListener('click', function () { scrollTo({ top: 0, behavior: 'smooth' }); });
update();`,
    prompt: `- 페이지를 200px 이상 내리면 오른쪽 아래에 나타나는 원형 "맨 위로" 버튼을 만들어줘.
- 버튼 테두리는 SVG 원(r=21)으로, 둘레 C = 2πr 를 stroke-dasharray, stroke-dashoffset = C × (1 - 스크롤 진행률) → 읽은 만큼 차오름. 12시 방향에서 시작(rotate -90deg).
- 가운데 위쪽 화살표, 누르면 scrollTo({ top: 0, behavior: 'smooth' }).
- 나타날 때 아래에서 살짝 올라오며 페이드, aria-label="맨 위로".`,
  },

  /* 배경 */
  {
    id: 'dot-grid', cat: 'bg', ko: '반응하는 도트 그리드', en: 'Interactive Dot Grid', aka: ['Dot Matrix', '마우스 반응 배경', 'Repel Dots'],
    tech: 'Canvas', level: 2, hint: 'hover',
    summary: '바둑판처럼 놓인 점들이 마우스 근처에서 밀려나고 빛나요.',
    desc: 'Canvas 에 일정 간격으로 점을 깔고, 매 프레임 마우스와의 거리를 재서 반경 120px 안의 점은 바깥쪽으로 밀어내고 크기·색을 키워요. 점은 목표 위치로 15%씩 이동해서 마우스가 지나간 뒤 부드럽게 제자리로 돌아옵니다.',
    use: '테크·AI·개발자 도구 랜딩 배경, 히어로 섹션, 인터랙티브 포트폴리오',
    tip: '점 개수가 화면 크기에 비례해 늘어나요. 큰 화면에서는 간격(GAP)을 넓히고, 화면 밖이면 애니메이션을 멈추세요.',
    html: `<canvas id="dots"></canvas>
<h1 class="dg-title">Move your mouse</h1>`,
    css: `body { overflow: hidden; background: #08080f; }
#dots { position: fixed; inset: 0; width: 100%; height: 100%; }
.dg-title {
  position: relative;
  margin: 0;
  font-size: clamp(32px, 7vw, 64px);
  font-weight: 900;
  letter-spacing: -0.03em;
  pointer-events: none;
  background: linear-gradient(120deg, #c4b5fd, #f9a8d4, #67e8f9);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}`,
    js: `const cv = document.getElementById('dots');
const ctx = cv.getContext('2d');
const GAP = 26, R = 120;                // 점 간격, 마우스 영향 반경
const mouse = { x: -999, y: -999 };
let dots = [], w = 0, h = 0;

function build() {
  const dpr = devicePixelRatio || 1;
  w = innerWidth; h = innerHeight;
  cv.width = w * dpr; cv.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  dots = [];
  for (let y = GAP / 2; y < h; y += GAP) {
    for (let x = GAP / 2; x < w; x += GAP) dots.push({ ox: x, oy: y, x: x, y: y });
  }
}
build();
addEventListener('resize', build);
addEventListener('pointermove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
document.documentElement.addEventListener('pointerleave', function () { mouse.x = mouse.y = -999; });

(function frame() {
  ctx.clearRect(0, 0, w, h);
  for (const d of dots) {
    const dx = d.ox - mouse.x, dy = d.oy - mouse.y;
    const dist = Math.hypot(dx, dy) || 1;
    const f = Math.max(0, 1 - dist / R);           // 가까울수록 1
    const tx = d.ox + (dx / dist) * f * 18;        // 바깥으로 밀어내기
    const ty = d.oy + (dy / dist) * f * 18;
    d.x += (tx - d.x) * 0.15;
    d.y += (ty - d.y) * 0.15;
    ctx.fillStyle = f > 0 ? 'hsl(' + (270 - f * 90) + ', 90%, ' + (60 + f * 15) + '%)' : 'rgba(255, 255, 255, 0.16)';
    ctx.beginPath();
    ctx.arc(d.x, d.y, 1.3 + f * 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
  requestAnimationFrame(frame);
})();`,
    prompt: `- Canvas 로 화면 전체에 26px 간격의 점 격자를 깔고, 마우스 반경 120px 안의 점들이 바깥으로 밀려나며 커지고 보라→핑크로 빛나게 해줘.
- 영향도 f = max(0, 1 - 거리/120), 목표 위치 = 원래 위치 + 방향 × f × 18px, 실제 위치는 목표로 15%씩 lerp(마우스가 떠나면 부드럽게 복귀).
- 멀리 있는 점은 흰색 16% 투명. devicePixelRatio 반영, resize 시 격자 다시 생성.
- 가운데에 그라디언트 글자 제목(pointer-events: none).`,
  },

  /* UI 스타일 */
  {
    id: 'menu-morph', cat: 'ui', ko: '햄버거 메뉴 모프', en: 'Hamburger Menu Morph', aka: ['Burger to X', '풀스크린 메뉴', 'Mobile Nav'],
    tech: 'CSS + JS', level: 2, hint: 'click',
    summary: '세 줄 메뉴 아이콘이 X 로 변하면서 화면 가득 메뉴가 원형으로 펼쳐져요.',
    desc: '아이콘의 세 막대 중 가운데는 사라지고, 위아래 막대는 가운데로 모이며 ±45도 회전해서 X 가 돼요. 메뉴 패널은 clip-path: circle() 의 반지름을 0 → 150% 로 키워 버튼 위치에서 퍼져 나오고, 링크들은 순서대로(--i) 살짝 늦게 올라옵니다.',
    use: '모바일 내비게이션, 포트폴리오·에이전시 전체화면 메뉴',
    tip: '닫혀 있을 때 메뉴 링크에 키보드 포커스가 가지 않도록 inert 를 쓰고, 버튼의 aria-expanded / aria-label 을 함께 바꿔 주세요.',
    html: `<div class="mm">
  <header class="mm-bar">
    <b>LOGO</b>
    <button type="button" class="burger" id="burger" aria-label="메뉴 열기" aria-expanded="false" aria-controls="mmMenu">
      <span></span><span></span><span></span>
    </button>
  </header>
  <nav class="mm-menu" id="mmMenu">
    <a href="#" style="--i: 0">Home</a>
    <a href="#" style="--i: 1">Work</a>
    <a href="#" style="--i: 2">About</a>
    <a href="#" style="--i: 3">Contact</a>
  </nav>
</div>`,
    css: `body { align-items: flex-start; }
.mm { position: relative; width: 100%; height: 100vh; overflow: hidden; }
.mm-bar { position: relative; z-index: 2; display: flex; align-items: center; justify-content: space-between; height: 64px; padding: 0 20px; }
.burger { position: relative; width: 44px; height: 44px; border: 0; border-radius: 12px; background: rgba(255, 255, 255, 0.08); cursor: pointer; }
.burger span {
  position: absolute;
  left: 12px;
  width: 20px;
  height: 2px;
  border-radius: 2px;
  background: #fff;
  transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s;
}
.burger span:nth-child(1) { top: 15px; }
.burger span:nth-child(2) { top: 21px; }
.burger span:nth-child(3) { top: 27px; }
.open .burger span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
.open .burger span:nth-child(2) { opacity: 0; transform: scaleX(0); }
.open .burger span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }
.mm-menu {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  padding: 0 32px;
  background: linear-gradient(160deg, #4c1d95, #0b0b14);
  clip-path: circle(0 at calc(100% - 42px) 32px);   /* 버튼 위치에서 시작 */
  transition: clip-path 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.open .mm-menu { clip-path: circle(150% at calc(100% - 42px) 32px); }
.mm-menu a {
  color: #fff;
  font-size: clamp(32px, 8vw, 52px);
  font-weight: 900;
  text-decoration: none;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.4s, transform 0.4s;
}
.open .mm-menu a { opacity: 1; transform: none; transition-delay: calc(0.15s + var(--i) * 0.06s); }`,
    js: `const mm = document.querySelector('.mm');
const burger = document.getElementById('burger');
const menu = document.getElementById('mmMenu');
menu.inert = true; // 닫혀 있을 땐 포커스 불가

burger.addEventListener('click', function () {
  const open = mm.classList.toggle('open');
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  menu.inert = !open;
});
menu.addEventListener('click', function (e) { e.preventDefault(); });`,
    prompt: `- 햄버거 아이콘(막대 3개)을 누르면 X 로 변하면서 전체 화면 메뉴가 열리는 내비게이션을 만들어줘.
- X 변형: 위 막대 translateY(6px) rotate(45deg), 가운데 opacity 0 + scaleX(0), 아래 translateY(-6px) rotate(-45deg).
- 메뉴 패널은 clip-path: circle(0 → 150% at 버튼 위치) 로 버튼에서 원형으로 퍼지게, 보라→검정 그라디언트 배경.
- 큰 링크 4개가 --i 순번으로 0.06초씩 늦게 아래에서 올라오며 나타나게.
- 닫혀 있을 땐 메뉴에 inert, 버튼의 aria-expanded / aria-label 갱신.`,
  },
  {
    id: 'sliding-tabs', cat: 'ui', ko: '슬라이딩 탭', en: 'Sliding Tab Indicator', aka: ['Segmented Control', '탭 인디케이터', 'Pill Tabs'],
    tech: 'JS', level: 1, hint: 'click',
    summary: '탭을 누르면 배경 알약이 통통 튀며 그 탭으로 미끄러져 가요.',
    desc: '선택 표시(알약)를 탭 버튼과 따로 하나만 두고, 누른 버튼의 offsetLeft / offsetWidth 를 읽어서 그 위치와 너비로 transform·width 를 바꿔요. 살짝 튀는 cubic-bezier(0.3, 1.3, 0.5, 1) 로 통통 튀는 느낌을 냈습니다.',
    use: '탭 메뉴, 필터(전체/디자인/개발), 월간·연간 요금 토글, 보기 방식 전환',
    tip: '폰트가 늦게 로드되면 탭 너비가 바뀌어요. document.fonts.ready 와 resize 때 위치를 다시 계산하세요. role="tablist" / aria-selected 로 접근성도 챙기세요.',
    html: `<div class="st">
  <div class="st-tabs" role="tablist" id="tabs">
    <span class="st-ind" id="ind"></span>
    <button type="button" role="tab" aria-selected="true">전체</button>
    <button type="button" role="tab" aria-selected="false">디자인</button>
    <button type="button" role="tab" aria-selected="false">개발</button>
    <button type="button" role="tab" aria-selected="false">마케팅</button>
  </div>
  <p class="st-panel" id="panel">전체 글 24개</p>
</div>`,
    css: `.st { display: flex; flex-direction: column; align-items: center; gap: 22px; }
.st-tabs {
  position: relative;
  display: flex;
  padding: 5px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
}
.st-tabs button {
  position: relative;
  z-index: 1;
  height: 40px;
  padding: 0 18px;
  border: 0;
  background: none;
  color: #9a98b3;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: color 0.3s;
}
.st-tabs button[aria-selected="true"] { color: #0b0b14; }
.st-ind {
  position: absolute;
  top: 5px;
  left: 0;
  height: 40px;
  border-radius: 999px;
  background: linear-gradient(120deg, #c4b5fd, #f9a8d4);
  transition: transform 0.4s cubic-bezier(0.3, 1.3, 0.5, 1), width 0.4s cubic-bezier(0.3, 1.3, 0.5, 1);
}
.st-panel { margin: 0; color: #c4c2dd; }`,
    js: `const tabs = document.querySelectorAll('#tabs button');
const ind = document.getElementById('ind');
const panel = document.getElementById('panel');
const counts = { '전체': 24, '디자인': 9, '개발': 11, '마케팅': 4 };

function move(btn) {
  ind.style.width = btn.offsetWidth + 'px';
  ind.style.transform = 'translateX(' + btn.offsetLeft + 'px)';
}
tabs.forEach(function (btn) {
  btn.addEventListener('click', function () {
    tabs.forEach(function (b) { b.setAttribute('aria-selected', String(b === btn)); });
    move(btn);
    panel.textContent = btn.textContent + ' 글 ' + counts[btn.textContent] + '개';
  });
});
const current = function () { return document.querySelector('#tabs [aria-selected="true"]'); };
move(current());
document.fonts.ready.then(function () { move(current()); }); // 폰트 로드 후 너비 다시
addEventListener('resize', function () { move(current()); });`,
    prompt: `- 알약 모양 배경이 선택한 탭으로 미끄러져 가는 탭 메뉴(전체/디자인/개발/마케팅)를 만들어줘.
- 표시 요소는 하나만 두고, 클릭한 버튼의 offsetLeft / offsetWidth 로 translateX 와 width 를 변경.
- transition 은 살짝 튀는 cubic-bezier(0.3, 1.3, 0.5, 1) 0.4s, 선택된 탭 글자는 어둡게.
- role="tablist", aria-selected 갱신, document.fonts.ready 와 resize 때 위치 재계산.`,
  },
  {
    id: 'carousel', cat: 'ui', ko: '캐러셀 슬라이더', en: 'Carousel Slider', aka: ['슬라이드 배너', 'Image Slider', 'Swiper'],
    tech: 'CSS + JS', level: 2, hint: 'click',
    summary: '좌우 버튼·점·스와이프로 넘기는 이미지 슬라이더. 4초마다 자동으로 넘어가요.',
    desc: '라이브러리 없이 CSS scroll-snap 으로 만들어서 터치 스와이프와 트랙패드 스크롤이 기본으로 돼요. 버튼과 점은 scrollTo 로 해당 슬라이드로 이동하고, 현재 위치는 scrollLeft 로 계산해 점에 표시합니다. 마우스를 올리면 자동 재생이 멈춰요.',
    use: '메인 배너, 고객 후기, 상품 이미지, 포트폴리오 하이라이트',
    tip: '자동 재생은 사용자가 내용을 읽기 전에 넘어가 버릴 수 있어요. 마우스를 올리거나 포커스하면 멈추고, 멈춤 버튼을 두는 게 좋아요.',
    html: `<div class="cr">
  <div class="cr-track" id="track">
    <figure class="cr-slide"><img src="assets/effects/ocean.webp" alt="바다 절벽과 등대"><figcaption>Ocean</figcaption></figure>
    <figure class="cr-slide"><img src="assets/effects/forest.webp" alt="빛이 들어오는 숲"><figcaption>Forest</figcaption></figure>
    <figure class="cr-slide"><img src="assets/effects/desert.webp" alt="노을 진 사막"><figcaption>Desert</figcaption></figure>
    <figure class="cr-slide"><img src="assets/effects/street.webp" alt="비 오는 네온 골목"><figcaption>Street</figcaption></figure>
    <figure class="cr-slide"><img src="assets/effects/mountains.webp" alt="안개 낀 산맥"><figcaption>Mountains</figcaption></figure>
  </div>
  <button type="button" class="cr-btn prev" id="prev" aria-label="이전 슬라이드">‹</button>
  <button type="button" class="cr-btn next" id="next" aria-label="다음 슬라이드">›</button>
  <div class="cr-dots" id="dots"></div>
</div>`,
    css: `.cr { position: relative; width: min(560px, 92vw); }
.cr-track {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  border-radius: 18px;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  scrollbar-width: none;
}
.cr-track::-webkit-scrollbar { display: none; }
.cr-slide { position: relative; flex: 0 0 100%; margin: 0; aspect-ratio: 16 / 10; border-radius: 18px; overflow: hidden; scroll-snap-align: center; }
.cr-slide img { display: block; width: 100%; height: 100%; object-fit: cover; }
.cr-slide figcaption {
  position: absolute;
  left: 16px;
  bottom: 14px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(6px);
  font-size: 14px;
  font-weight: 700;
}
.cr-btn {
  position: absolute;
  top: calc(50% - 32px);
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: #111;
  font-size: 26px;
  line-height: 1;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  cursor: pointer;
}
.prev { left: 10px; }
.next { right: 10px; }
.cr-dots { display: flex; justify-content: center; gap: 8px; margin-top: 12px; }
.cr-dots button { width: 8px; height: 8px; padding: 0; border: 0; border-radius: 999px; background: rgba(255, 255, 255, 0.25); cursor: pointer; transition: width 0.3s, background 0.3s; }
.cr-dots button[aria-current="true"] { width: 24px; background: #a78bfa; }`,
    js: `const track = document.getElementById('track');
const slides = Array.from(track.children);
const dots = document.getElementById('dots');
const GAP = 12;

slides.forEach(function (s, i) {
  const d = document.createElement('button');
  d.type = 'button';
  d.setAttribute('aria-label', (i + 1) + '번 슬라이드');
  d.addEventListener('click', function () { go(i); });
  dots.appendChild(d);
});

function index() { return Math.round(track.scrollLeft / (track.clientWidth + GAP)); }
function go(i) {
  const n = (i + slides.length) % slides.length;          // 끝에서 처음으로 순환
  track.scrollTo({ left: n * (track.clientWidth + GAP) });
}
function mark() {
  Array.from(dots.children).forEach(function (d, i) { d.setAttribute('aria-current', String(i === index())); });
}
document.getElementById('prev').addEventListener('click', function () { go(index() - 1); });
document.getElementById('next').addEventListener('click', function () { go(index() + 1); });
track.addEventListener('scroll', function () { requestAnimationFrame(mark); }, { passive: true });
mark();

// 자동 재생: 마우스를 올리거나 포커스하면 멈춤
let timer = setInterval(function () { go(index() + 1); }, 4000);
const box = document.querySelector('.cr');
['pointerenter', 'focusin'].forEach(function (ev) { box.addEventListener(ev, function () { clearInterval(timer); }); });`,
    prompt: `- 라이브러리 없이 이미지 캐러셀을 만들어줘. 트랙은 overflow-x: auto + scroll-snap-type: x mandatory(터치 스와이프 기본 지원), 슬라이드는 flex: 0 0 100%.
- 좌우 원형 버튼과 아래 점(현재 점은 길쭉한 보라색)으로 이동, scrollTo 로 해당 위치, 끝에서는 처음으로 순환.
- 현재 슬라이드 = round(scrollLeft / (너비 + gap)), scroll 이벤트에서 점 갱신.
- 4초 자동 재생, 마우스를 올리거나 포커스하면 정지. 슬라이드 왼쪽 아래에 반투명 캡션.`,
  },
  {
    id: 'modal-sheet', cat: 'ui', ko: '모달 · 바텀시트', en: 'Modal & Bottom Sheet', aka: ['Dialog', '팝업', 'Action Sheet'],
    tech: 'CSS + JS', level: 1, hint: 'click',
    summary: '가운데에 뜨는 확인 모달과, 아래에서 올라오는 모바일 바텀시트예요.',
    desc: 'HTML 의 <dialog> 와 showModal() 을 쓰면 배경 클릭 차단, Esc 로 닫기, 포커스 가두기가 기본으로 돼요. ::backdrop 으로 뒤를 어둡고 흐리게, [open] 일 때 애니메이션을 줬고, 바텀시트는 margin 을 아래로 붙이고 아래에서 올라오게 했습니다.',
    use: '저장·삭제 확인, 로그인 창, 공유하기, 모바일 옵션 선택',
    tip: '모달 안 첫 버튼에 포커스가 가고, 닫으면 연 버튼으로 포커스가 돌아가요(dialog 기본 동작). 바깥 클릭으로 닫기는 직접 처리해야 해요.',
    html: `<div class="ms-btns">
  <button type="button" data-open="modal">모달 열기</button>
  <button type="button" data-open="sheet">바텀시트 열기</button>
</div>

<dialog class="ms-modal" id="modal">
  <h3>저장할까요?</h3>
  <p>변경한 내용을 저장하고 닫아요.</p>
  <div class="ms-actions">
    <button type="button" data-close>취소</button>
    <button type="button" data-close class="primary">저장</button>
  </div>
</dialog>

<dialog class="ms-sheet" id="sheet">
  <span class="grip"></span>
  <h3>공유하기</h3>
  <div class="ms-grid">
    <button type="button" data-close>링크 복사</button>
    <button type="button" data-close>카카오톡</button>
    <button type="button" data-close>메시지</button>
    <button type="button" data-close>더보기</button>
  </div>
</dialog>`,
    css: `.ms-btns { display: flex; gap: 10px; }
.ms-btns button, .ms-actions button, .ms-grid button {
  height: 44px;
  padding: 0 16px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  color: inherit;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
.ms-actions .primary { border-color: transparent; background: #8b5cf6; }
dialog { padding: 22px; border: 1px solid rgba(255, 255, 255, 0.12); background: #16162a; color: #ecebf5; }
dialog::backdrop { background: rgba(0, 0, 0, 0.55); backdrop-filter: blur(3px); }
dialog h3 { margin: 0 0 6px; }
dialog p { margin: 0 0 18px; color: #9a98b3; }
.ms-modal { width: min(320px, 86vw); border-radius: 18px; }
.ms-modal[open] { animation: pop 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); }
.ms-actions { display: flex; justify-content: flex-end; gap: 8px; }
.ms-sheet { width: 100%; max-width: 100%; margin: auto 0 0; padding-top: 12px; border-radius: 22px 22px 0 0; }
.ms-sheet[open] { animation: up 0.35s cubic-bezier(0.2, 0.8, 0.2, 1); }
.grip { display: block; width: 40px; height: 4px; margin: 0 auto 14px; border-radius: 4px; background: rgba(255, 255, 255, 0.25); }
.ms-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
@keyframes pop { from { opacity: 0; transform: scale(0.92); } }
@keyframes up { from { transform: translateY(100%); } }`,
    js: `document.querySelectorAll('[data-open]').forEach(function (b) {
  b.addEventListener('click', function () { document.getElementById(b.dataset.open).showModal(); });
});

document.querySelectorAll('dialog').forEach(function (d) {
  d.addEventListener('click', function (e) {
    const r = d.getBoundingClientRect();
    const outside = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    // 배경(바깥) 클릭 또는 닫기 버튼이면 닫기
    if ((e.target === d && outside) || e.target.hasAttribute('data-close')) d.close();
  });
});`,
    prompt: `- <dialog> + showModal() 로 ① 가운데 확인 모달(제목·설명·취소/저장 버튼) ② 아래에서 올라오는 바텀시트(손잡이 막대 + 공유 버튼 2×2)를 만들어줘.
- ::backdrop 은 반투명 검정 + blur(3px). 모달은 scale(0.92) → 1 팝, 시트는 margin: auto 0 0 으로 바닥에 붙이고 translateY(100%) 에서 올라오게.
- 바깥(배경) 클릭과 data-close 버튼으로 닫기, Esc 는 dialog 기본 동작 사용.`,
  },

  /* 전환·로딩 */
  {
    id: 'preloader', cat: 'loading', ko: '페이지 프리로더', en: 'Page Preloader', aka: ['Loading Screen', '인트로 로딩', 'Counter Loader'],
    tech: 'CSS + JS', level: 2, hint: 'auto',
    summary: '0부터 100까지 숫자가 오른 뒤, 로딩 화면이 커튼처럼 위로 걷혀요.',
    desc: '화면을 덮는 로딩 레이어에서 큰 숫자와 막대가 0 → 100 으로 올라가고, 끝나면 clip-path: inset() 의 아래쪽 값을 0 → 100% 로 바꿔 레이어가 위로 말려 올라가며 본 화면이 드러나요. 데모에서는 랜덤으로 올리지만 실제로는 이미지·폰트 로딩 진행률을 연결하면 됩니다.',
    use: '포트폴리오·브랜드 사이트 첫 진입, 큰 이미지·3D 를 불러오는 페이지',
    tip: '로딩이 실제로 필요 없는데 일부러 기다리게 하면 이탈이 늘어요. 짧게(1~2초) 쓰고, 재방문 때는 건너뛰게 하세요.',
    html: `<div class="pl" id="pl">
  <span class="pl-num" id="num">0</span>
  <div class="pl-bar"><i id="bar"></i></div>
</div>
<main class="pl-page">
  <h1>Welcome</h1>
  <button type="button" id="again">다시 보기</button>
</main>`,
    css: `.pl-page { text-align: center; }
.pl-page h1 {
  margin: 0 0 16px;
  font-size: clamp(40px, 9vw, 80px);
  font-weight: 900;
  background: linear-gradient(120deg, #c4b5fd, #f9a8d4, #67e8f9);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.pl-page button { height: 40px; padding: 0 16px; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 12px; background: rgba(255, 255, 255, 0.06); color: inherit; font: inherit; font-weight: 700; cursor: pointer; }
.pl {
  position: fixed;
  inset: 0;
  z-index: 9;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 14px;
  padding: 28px;
  background: #0b0b14;
  clip-path: inset(0 0 0 0);
  transition: clip-path 0.9s cubic-bezier(0.7, 0, 0.2, 1);
}
.pl.done { clip-path: inset(0 0 100% 0); } /* 위로 말려 올라감 */
.pl-num { font-size: clamp(64px, 18vw, 160px); font-weight: 900; line-height: 0.9; letter-spacing: -0.04em; font-variant-numeric: tabular-nums; }
.pl-bar { height: 3px; background: rgba(255, 255, 255, 0.12); }
.pl-bar i { display: block; width: 0; height: 100%; background: #a78bfa; }`,
    js: `const pl = document.getElementById('pl');
const num = document.getElementById('num');
const bar = document.getElementById('bar');

function run() {
  pl.classList.remove('done');
  let n = 0;
  (function tick() {
    n = Math.min(100, n + Math.random() * 6 + 1); // 실제로는 이미지·폰트 로딩 진행률을 연결
    num.textContent = Math.floor(n);
    bar.style.width = n + '%';
    if (n < 100) setTimeout(tick, 40);
    else setTimeout(function () { pl.classList.add('done'); }, 300);
  })();
}
run();
document.getElementById('again').addEventListener('click', run);`,
    prompt: `- 화면을 덮는 로딩 화면에서 큰 숫자가 0 → 100 으로 올라가고(아래에 얇은 진행 막대), 100 이 되면 로딩 화면이 위로 말려 올라가며 본문이 드러나는 프리로더를 만들어줘.
- 숫자는 tabular-nums, 진행은 일단 랜덤 증가(실제 로딩 진행률로 바꾸기 쉽게 주석).
- 걷히는 효과: clip-path: inset(0 0 0 0) → inset(0 0 100% 0), 0.9초 cubic-bezier(0.7, 0, 0.2, 1).
- 본문에는 그라디언트 제목과 "다시 보기" 버튼.`,
  },

  /* 이미지 */
  {
    id: 'lightbox', cat: 'image', ko: '라이트박스', en: 'Lightbox Gallery', aka: ['이미지 뷰어', 'Photo Viewer', 'Gallery Modal'],
    tech: 'JS', level: 2, hint: 'click',
    summary: '썸네일을 누르면 사진이 화면 가득 열리고, 화살표·키보드·스와이프로 넘겨요.',
    desc: '<dialog> 를 화면 전체 크기로 열어 큰 사진을 보여줘요. 이전/다음 버튼, ← → 키, 좌우 스와이프로 넘기고, Esc 나 바깥 클릭으로 닫아요. 사진이 바뀔 때마다 애니메이션을 다시 걸어 살짝 확대되며 나타납니다.',
    use: '갤러리·포트폴리오, 상품 상세 사진, 후기 사진, 블로그 이미지',
    tip: '큰 원본 이미지는 열 때만 불러오고 썸네일은 작은 파일을 쓰세요. 사진마다 alt 를 꼭 넣고, 몇 번째 사진인지(1 / 6) 알려주세요.',
    html: `<div class="lb-grid" id="grid">
  <button type="button"><img src="assets/effects/forest.webp" alt="빛이 들어오는 숲"></button>
  <button type="button"><img src="assets/effects/ocean.webp" alt="바다 절벽과 등대"></button>
  <button type="button"><img src="assets/effects/desert.webp" alt="노을 진 사막"></button>
  <button type="button"><img src="assets/effects/street.webp" alt="비 오는 네온 골목"></button>
  <button type="button"><img src="assets/effects/mountains.webp" alt="안개 낀 산맥"></button>
  <button type="button"><img src="assets/effects/landscape.webp" alt="네온 도시 야경"></button>
</div>

<dialog class="lb" id="lb">
  <img id="lbImg" alt="">
  <p class="lb-count" id="lbCount"></p>
  <button type="button" class="lb-btn lb-close" id="lbClose" aria-label="닫기">×</button>
  <button type="button" class="lb-btn lb-prev" id="lbPrev" aria-label="이전 사진">‹</button>
  <button type="button" class="lb-btn lb-next" id="lbNext" aria-label="다음 사진">›</button>
</dialog>`,
    css: `.lb-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; width: min(480px, 92vw); }
.lb-grid button { aspect-ratio: 1; padding: 0; border: 0; border-radius: 10px; overflow: hidden; background: #222; cursor: zoom-in; }
.lb-grid img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
.lb-grid button:hover img { transform: scale(1.06); }
.lb { width: 100vw; height: 100vh; max-width: none; max-height: none; margin: 0; padding: 0; border: 0; background: rgba(5, 5, 10, 0.94); }
.lb[open] { display: grid; place-items: center; animation: fade 0.25s; }
#lbImg { max-width: 86vw; max-height: 78vh; border-radius: 10px; box-shadow: 0 30px 80px rgba(0, 0, 0, 0.7); animation: zoom 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); }
.lb-count { position: absolute; top: 16px; left: 0; right: 0; margin: 0; text-align: center; font-size: 13px; color: #c4c2dd; }
.lb-btn { position: absolute; width: 44px; height: 44px; border: 0; border-radius: 50%; background: rgba(255, 255, 255, 0.12); color: #fff; font-size: 26px; line-height: 1; cursor: pointer; }
.lb-btn:hover { background: rgba(255, 255, 255, 0.22); }
.lb-close { top: 10px; right: 10px; }
.lb-prev { left: 10px; top: calc(50% - 22px); }
.lb-next { right: 10px; top: calc(50% - 22px); }
@keyframes fade { from { opacity: 0; } }
@keyframes zoom { from { opacity: 0; transform: scale(0.92); } }`,
    js: `const thumbs = Array.from(document.querySelectorAll('#grid img'));
const lb = document.getElementById('lb');
const img = document.getElementById('lbImg');
let cur = 0;

function show(i) {
  cur = (i + thumbs.length) % thumbs.length;
  img.src = thumbs[cur].src;
  img.alt = thumbs[cur].alt;
  img.style.animation = 'none';
  void img.offsetWidth;          // 애니메이션 다시 시작
  img.style.animation = '';
  document.getElementById('lbCount').textContent = (cur + 1) + ' / ' + thumbs.length;
}

thumbs.forEach(function (t, i) {
  t.parentElement.addEventListener('click', function () { show(i); lb.showModal(); });
});
document.getElementById('lbPrev').addEventListener('click', function () { show(cur - 1); });
document.getElementById('lbNext').addEventListener('click', function () { show(cur + 1); });
document.getElementById('lbClose').addEventListener('click', function () { lb.close(); });
lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); }); // 바깥 클릭
lb.addEventListener('keydown', function (e) {
  if (e.key === 'ArrowLeft') show(cur - 1);
  if (e.key === 'ArrowRight') show(cur + 1);
});

// 스와이프
let sx = null;
lb.addEventListener('pointerdown', function (e) { sx = e.clientX; });
lb.addEventListener('pointerup', function (e) {
  if (sx !== null && Math.abs(e.clientX - sx) > 50) show(cur + (e.clientX < sx ? 1 : -1));
  sx = null;
});`,
    prompt: `- 3열 정사각형 썸네일 갤러리를 누르면 사진이 화면 가득 열리는 라이트박스를 만들어줘. <dialog> + showModal() 사용.
- 큰 사진은 최대 86vw × 78vh, 열리거나 바뀔 때 scale(0.92) → 1 로 살짝 확대되며 등장.
- 이전/다음 원형 버튼, ← → 키보드, 좌우 50px 이상 스와이프로 넘기기, 마지막에서 처음으로 순환.
- 위쪽 가운데에 "3 / 6" 위치 표시, Esc·× 버튼·바깥 클릭으로 닫기.`,
  },
  {
    id: 'masonry', cat: 'image', ko: '매소너리 그리드', en: 'Masonry Grid', aka: ['핀터레스트 레이아웃', 'Pinterest Grid', '벽돌 레이아웃'],
    tech: 'CSS', level: 1, hint: 'scroll',
    summary: '높이가 제각각인 사진들을 빈틈없이 벽돌처럼 쌓아요.',
    desc: 'CSS 다단(columns)으로 만들어서 JS 가 필요 없어요. 각 항목에 break-inside: avoid 를 줘서 한 장이 두 단으로 쪼개지지 않게 하고, columns: 3 140px 로 화면이 좁아지면 단 수가 자동으로 줄어듭니다.',
    use: '사진·일러스트 갤러리, 무드보드, 블로그 카드 목록, 후기 모음',
    tip: '다단 방식은 위→아래 순서로 채워져요. 왼쪽→오른쪽 순서가 중요하다면 JS 레이아웃이나 앞으로 나올 CSS grid masonry 를 쓰세요. 이미지 width/height 를 지정하면 로딩 중 흔들림이 줄어요.',
    html: `<div class="mz">
  <figure><img src="assets/effects/forest.webp" alt="숲"></figure>
  <div class="note n1">Masonry<br>Layout</div>
  <figure><img src="assets/effects/ocean.webp" alt="바다"></figure>
  <figure><img src="assets/effects/street.webp" alt="네온 골목"></figure>
  <figure><img src="assets/effects/desert.webp" alt="사막"></figure>
  <div class="note n2">CSS columns 만으로</div>
  <figure><img src="assets/effects/mountains.webp" alt="산맥"></figure>
  <figure><img src="assets/effects/landscape.webp" alt="도시 야경"></figure>
</div>`,
    css: `body { display: block; padding: 16px; }
.mz { columns: 3 140px; column-gap: 10px; }
.mz > * { break-inside: avoid; margin: 0 0 10px; border-radius: 12px; overflow: hidden; }
.mz img { display: block; width: 100%; transition: transform 0.5s; }
.mz figure:hover img { transform: scale(1.05); }
.mz .note { display: flex; align-items: flex-end; padding: 16px; font-size: 18px; font-weight: 800; line-height: 1.25; }
.n1 { height: 130px; background: linear-gradient(135deg, #8b5cf6, #ec4899); }
.n2 { height: 170px; background: linear-gradient(135deg, #0891b2, #22d3ee); color: #062a33; }`,
    js: ``,
    prompt: `- 높이가 다른 사진들과 색 카드가 섞인 핀터레스트형 매소너리 갤러리를 CSS 만으로 만들어줘.
- 컨테이너 columns: 3 140px; column-gap: 10px, 항목은 break-inside: avoid; margin-bottom: 10px; border-radius: 12px; overflow: hidden.
- 사진은 width 100%(높이는 원본 비율), 호버 시 살짝 확대. 중간중간 그라디언트 글자 카드 2개.
- 화면이 좁아지면 단 수가 자동으로 줄어들게.`,
  },

  /* 3D */
  {
    id: 'globe', cat: '3d', ko: '인터랙티브 지구본', en: 'Interactive Dot Globe', aka: ['3D Globe', '점 지구본', 'World Map Globe'],
    tech: 'Canvas', level: 3, hint: 'hover',
    summary: '점으로 된 지구가 돌면서 서울과 세계 도시를 빛나는 선으로 이어요. 드래그로 돌려 보세요.',
    desc: '피보나치 구(golden angle) 공식으로 점 900개를 구 표면에 고르게 배치하고, 매 프레임 회전 행렬을 곱한 뒤 화면에 투영해요. 앞쪽 점은 밝게, 뒤쪽 점은 흐리게 그려 입체감을 냈고, 위도·경도를 3D 좌표로 바꿔 도시를 표시한 뒤 두 점 사이를 바깥으로 부풀린 호(arc)로 이었습니다. 라이브러리 없이 Canvas 2D 만 사용해요.',
    use: '글로벌 서비스 소개, 지사·고객 분포, 데이터 연결 시각화, 테크 랜딩 히어로',
    tip: '실제 대륙 모양이 필요하면 육지 좌표 데이터나 cobe · globe.gl 같은 라이브러리를 쓰세요. 드래그용 캔버스에는 touch-action: none 이 필요해요.',
    html: `<canvas id="globe" aria-label="회전하는 점 지구본"></canvas>
<p class="gl-cap">드래그해서 돌려 보세요 · Seoul → World</p>`,
    css: `body { flex-direction: column; overflow: hidden; background: radial-gradient(circle at 50% 45%, #1e1b4b, #07070c 65%); }
#globe { width: min(92vw, 82vh); aspect-ratio: 1; cursor: grab; touch-action: none; }
#globe:active { cursor: grabbing; }
.gl-cap { margin: 0; font-size: 12px; color: #8b8fb0; }`,
    js: `const cv = document.getElementById('globe');
const ctx = cv.getContext('2d');
const N = 900;
const pts = [];
for (let i = 0; i < N; i++) {                      // 피보나치 구: 점을 표면에 고르게
  const y = 1 - (i / (N - 1)) * 2;
  const r = Math.sqrt(1 - y * y);
  const t = i * Math.PI * (3 - Math.sqrt(5));
  pts.push([Math.cos(t) * r, y, Math.sin(t) * r]);
}
function ll(lat, lon) {                             // 위도·경도 → 3D 좌표
  const a = lat * Math.PI / 180, b = -lon * Math.PI / 180;
  return [Math.cos(a) * Math.cos(b), Math.sin(a), Math.cos(a) * Math.sin(b)];
}
const seoul = ll(37.5, 127);
const cities = [ll(40.7, -74), ll(51.5, -0.1), ll(-33.9, 151.2), ll(35.7, 139.7), ll(1.35, 103.8), ll(37.8, -122.4)];

let rot = -2.2, tilt = 0.45, drag = null;
function project(p, R, cx, cy) {                   // y축 회전 → x축 기울이기 → 화면 좌표
  const cr = Math.cos(rot), sr = Math.sin(rot);
  const x = p[0] * cr - p[2] * sr;
  let z = p[0] * sr + p[2] * cr;
  const ct = Math.cos(tilt), st = Math.sin(tilt);
  const y = p[1] * ct - z * st;
  z = p[1] * st + z * ct;
  return { x: cx + x * R, y: cy - y * R, z: z };
}
function arcPoint(a, b, s) {                        // 두 도시 사이 호: 보간 → 정규화 → 바깥으로 부풀리기
  const m = [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s];
  const len = Math.hypot(m[0], m[1], m[2]);
  const k = (1 + Math.sin(Math.PI * s) * 0.25) / len;
  return [m[0] * k, m[1] * k, m[2] * k];
}

function frame(time) {
  const dpr = devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
  if (cv.width !== Math.round(w * dpr)) { cv.width = w * dpr; cv.height = h * dpr; }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  const R = w * 0.38, cx = w / 2, cy = h / 2;
  if (!drag) rot += 0.003;

  const glow = ctx.createRadialGradient(cx, cy, R * 0.85, cx, cy, R * 1.3);
  glow.addColorStop(0, 'rgba(139, 92, 246, 0.28)');
  glow.addColorStop(1, 'rgba(139, 92, 246, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(cx, cy, R * 1.3, 0, Math.PI * 2); ctx.fill();

  for (const p of pts) {                            // 앞쪽은 밝게, 뒤쪽은 흐리게
    const q = project(p, R, cx, cy);
    const front = q.z > 0;
    ctx.fillStyle = front ? 'rgba(196, 181, 253, ' + (0.3 + q.z * 0.7) + ')' : 'rgba(196, 181, 253, 0.07)';
    const s = front ? 2 : 1.4;
    ctx.fillRect(q.x - s / 2, q.y - s / 2, s, s);
  }

  ctx.lineWidth = 1.6;
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.8)';
  cities.forEach(function (c) {
    ctx.beginPath();
    let pen = false;
    for (let i = 0; i <= 48; i++) {
      const q = project(arcPoint(seoul, c, i / 48), R, cx, cy);
      if (q.z < -0.15) { pen = false; continue; }  // 지구 뒤로 넘어간 부분은 안 그림
      if (pen) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y);
      pen = true;
    }
    ctx.stroke();
  });

  [seoul].concat(cities).forEach(function (c, i) { // 도시 점 + 퍼지는 링
    const q = project(c, R, cx, cy);
    if (q.z < 0) return;
    const pulse = (time / 1400 + i * 0.27) % 1;
    ctx.strokeStyle = 'rgba(244, 114, 182, ' + (1 - pulse) + ')';
    ctx.beginPath(); ctx.arc(q.x, q.y, 3 + pulse * 12, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = i === 0 ? '#fde68a' : '#f472b6';
    ctx.beginPath(); ctx.arc(q.x, q.y, i === 0 ? 4 : 3, 0, Math.PI * 2); ctx.fill();
  });
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

cv.addEventListener('pointerdown', function (e) { drag = { x: e.clientX, y: e.clientY, rot: rot, tilt: tilt }; cv.setPointerCapture(e.pointerId); });
cv.addEventListener('pointermove', function (e) {
  if (!drag) return;
  rot = drag.rot - (e.clientX - drag.x) * 0.01;
  tilt = Math.max(-1.2, Math.min(1.2, drag.tilt + (e.clientY - drag.y) * 0.01));
});
cv.addEventListener('pointerup', function () { drag = null; });`,
    prompt: `- 라이브러리 없이 Canvas 2D 로 점으로 된 3D 지구본을 만들어줘.
- 피보나치 구(golden angle) 공식으로 점 900개를 구 표면에 배치, 매 프레임 y축 회전 + x축 기울기 행렬로 회전 후 화면에 투영. 앞쪽(z > 0) 점은 밝게, 뒤쪽은 7% 투명.
- 위도·경도 → 3D 변환 함수로 서울(노랑)과 뉴욕·런던·시드니·도쿄·싱가포르·샌프란시스코(핑크)를 표시하고, 점마다 퍼지는 링 애니메이션.
- 서울에서 각 도시로 시안색 호(arc): 두 벡터를 보간·정규화하고 sin 으로 바깥으로 25% 부풀림, 지구 뒤로 넘어간 부분은 그리지 않기.
- 자동으로 천천히 회전, 드래그하면 직접 돌리기(touch-action: none, setPointerCapture). 뒤에 보라색 대기 글로우.`,
  },
];
