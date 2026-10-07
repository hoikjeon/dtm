/* DTM bridge — 동기화 프록시가 미리보기 페이지의 <head>에 인라인으로 주입하는 스크립트.
   스크롤 위치와 페이지 이동을 부모(DTM 도구)에 알리고, 부모가 보내는 명령을 따릅니다.
   실행 직후 자기 <script> 태그를 지워서 React/Next.js 하이드레이션에 영향을 주지 않습니다. */
(function () {
  var self = document.currentScript;
  if (self && self.parentNode) self.parentNode.removeChild(self);
  if (window.parent === window || window.__dtmBridge) return;
  window.__dtmBridge = true;

  function send(msg) {
    msg.__dtm = 1;
    try { window.parent.postMessage(msg, '*'); } catch (e) { /* 무시 */ }
  }
  function currentPath() { return location.pathname + location.search; }
  function maxScroll() {
    var d = document.scrollingElement || document.documentElement;
    return Math.max(0, d.scrollHeight - window.innerHeight);
  }

  // 스크롤: 기기마다 페이지 길이가 다르므로 절대값 대신 비율(0~1)로 주고받습니다.
  var quietUntil = 0;
  var queued = false;
  window.addEventListener('scroll', function () {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () {
      queued = false;
      if (performance.now() < quietUntil) return; // 다른 화면이 보낸 스크롤의 메아리는 무시
      var m = maxScroll();
      send({ type: 'scroll', ratio: m ? window.scrollY / m : 0 });
    });
  }, { passive: true });

  // 페이지 이동: SPA(pushState) 이동과 일반 이동을 모두 감지
  var lastPath = currentPath();
  function checkNav() {
    var p = currentPath();
    if (p === lastPath) return;
    lastPath = p;
    send({ type: 'nav', path: p });
  }
  ['pushState', 'replaceState'].forEach(function (k) {
    var orig = history[k];
    history[k] = function () {
      var r = orig.apply(this, arguments);
      setTimeout(checkNav, 0);
      return r;
    };
  });
  window.addEventListener('popstate', function () { setTimeout(checkNav, 0); });
  setInterval(checkNav, 700);

  window.addEventListener('message', function (e) {
    if (e.source !== window.parent) return;
    var m = e.data;
    if (!m || m.__dtm !== 1) return;
    if (m.type === 'scrollTo' && typeof m.ratio === 'number') {
      quietUntil = performance.now() + 150;
      window.scrollTo({ top: Math.round(m.ratio * maxScroll()), behavior: 'instant' });
    } else if (m.type === 'navigate' && typeof m.path === 'string' && m.path.charAt(0) === '/' && m.path.charAt(1) !== '/') {
      if (m.path !== currentPath()) {
        lastPath = m.path;
        location.assign(m.path);
      }
    }
  });

  function hello() { send({ type: 'hello', path: currentPath() }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hello);
  else hello();
})();
