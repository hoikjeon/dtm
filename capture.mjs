/* DTM 캡처 — 보이지 않는 Chrome 으로 각 기기 크기의 화면을 찍어 원하는 폴더에 저장합니다. */
import { execFile } from 'node:child_process';
import { stat, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { isAbsolute, join } from 'node:path';

// 기본은 레티나 2배. 결과 폭이 4K(4000px)를 넘으면 1배로 저장 (예: Full HD → 3840px, 4K → 3840px)
const JPEG = { type: 'jpeg', quality: 92 }; // 캡처 파일 형식: JPG

export const scaleFor = (w) => (w * 2 > 4000 ? 1 : 2);
const SETTLE_MS = 800;           // 로드 후 애니메이션·폰트가 자리잡을 시간
const savedDirs = new Set();     // 이번 실행에서 캡처를 저장한 폴더만 "폴더 열기" 허용

let browserPromise = null;
function getBrowser() {
  if (!browserPromise) {
    browserPromise = import('playwright-core')
      .then(({ chromium }) => chromium.launch({ channel: 'chrome' }))
      .catch((err) => {
        browserPromise = null;
        throw new Error(`캡처용 Chrome 을 실행하지 못했어요. Google Chrome 이 설치돼 있는지 확인해 주세요. (${err.message.split('\n')[0]})`);
      });
  }
  return browserPromise;
}

export async function closeBrowser() {
  if (!browserPromise) return;
  try { await (await browserPromise).close(); } catch { /* 이미 종료됨 */ }
}

// macOS Finder 폴더 선택 창. 취소하면 null. 창 안의 "새로운 폴더" 버튼으로 폴더를 만들 수 있어요.
export function pickFolder(current) {
  if (process.platform !== 'darwin') return Promise.reject(new Error('폴더 선택 창은 macOS 에서만 지원해요.'));
  const start = current && isAbsolute(current) ? current : join(homedir(), 'Pictures');
  const script = [
    'on run argv',
    '  activate',
    '  try',
    '    set startDir to POSIX file (item 1 of argv)',
    '    set f to choose folder with prompt "캡처를 저장할 폴더를 고르세요 (새로운 폴더 버튼으로 만들 수 있어요)" default location startDir',
    '  on error number -128',
    '    return ""',
    '  end try',
    '  return POSIX path of f',
    'end run',
  ];
  const args = script.flatMap((line) => ['-e', line]).concat(start);
  return new Promise((resolve, reject) => {
    execFile('osascript', args, { timeout: 5 * 60 * 1000 }, (err, stdout) => {
      if (err) return reject(new Error('폴더 선택 창을 열지 못했어요.'));
      const path = stdout.trim().replace(/\/$/, '');
      resolve(path || null);
    });
  });
}

export function openFolder(path) {
  if (!savedDirs.has(path)) return Promise.reject(new Error('캡처를 저장한 폴더만 열 수 있어요.'));
  return new Promise((resolve, reject) => {
    execFile('open', [path], (err) => (err ? reject(err) : resolve()));
  });
}

const pad = (n) => String(n).padStart(2, '0');
function stamp(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
}
const safeName = (s) => String(s).replace(/[^\w.-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'site';

/**
 * @param {{ url: string, folder: string, fullPage?: boolean, overview?: boolean,
 *           shots: { name: string, label: string, w: number, h: number }[] }} opts
 */
export async function capture({ url, folder, fullPage = false, overview = false, shots }) {
  const u = new URL(url);
  if (!/^https?:$/.test(u.protocol)) throw new Error('http/https 주소만 캡처할 수 있어요.');
  if (!folder || !isAbsolute(folder)) throw new Error('저장할 폴더를 먼저 선택해 주세요.');
  const info = await stat(folder).catch(() => null);
  if (!info?.isDirectory()) throw new Error(`폴더를 찾을 수 없어요: ${folder}`);
  if (!Array.isArray(shots) || !shots.length || shots.length > 6) throw new Error('캡처할 화면이 없어요.');
  for (const s of shots) {
    if (!(s.w >= 200 && s.w <= 4000 && s.h >= 200 && s.h <= 6000)) throw new Error(`화면 크기가 올바르지 않아요: ${s.w}×${s.h}`);
  }

  // 하위 폴더 없이 고른 폴더에 사진만 저장. 이름: 사이트_날짜-시간_기기-크기.jpg
  const dir = folder;
  const prefix = `${safeName(u.host)}_${stamp()}`;
  savedDirs.add(dir);

  const browser = await getBrowser();
  const results = await Promise.all(shots.map(async (s) => {
    const context = await browser.newContext({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: scaleFor(s.w) });
    try {
      const page = await context.newPage();
      await page.goto(url, { waitUntil: 'load', timeout: 30000 });
      await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
      await page.waitForTimeout(SETTLE_MS);
      const jpg = await page.screenshot({ ...JPEG, fullPage, animations: 'disabled' });
      const file = await saveUnique(dir, `${prefix}_${safeName(s.name)}-${s.w}x${s.h}${fullPage ? '-full' : ''}`, jpg);
      return { ...s, file, jpg };
    } catch (err) {
      throw new Error(`${s.label} 캡처 실패: ${err.message.split('\n')[0]}`);
    } finally {
      await context.close();
    }
  }));

  const files = results.map((r) => r.file);
  if (overview && results.length > 1) {
    files.push(await saveUnique(dir, `${prefix}_overview`, await renderOverview(browser, u.href, results)));
  }
  return { dir, files };
}

// 같은 이름이 있으면 덮어쓰지 않고 -2, -3 … 을 붙임
async function saveUnique(dir, base, data) {
  for (let n = 1; ; n++) {
    const file = `${base}${n > 1 ? `-${n}` : ''}.jpg`;
    try {
      await writeFile(join(dir, file), data, { flag: 'wx' });
      return file;
    } catch (err) {
      if (err.code !== 'EEXIST') throw err;
    }
  }
}

// 캡처한 화면들을 DTM 처럼 나란히 놓은 합본 이미지 (픽셀 스타일)
async function renderOverview(browser, url, results) {
  const k = 0.5; // 합본 안에서의 축소 비율 (원래 크기 비율은 유지)
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
  const cards = results.map((r) => `
    <figure>
      <figcaption><b>${esc(r.label)}</b><span>${r.w}×${r.h}</span></figcaption>
      <img src="data:image/jpeg;base64,${r.jpg.toString('base64')}" style="width:${Math.round(r.w * k)}px">
    </figure>`).join('');
  const html = `<!doctype html><meta charset="utf-8">
<style>
  @import url('https://cdn.jsdelivr.net/gh/MonadABXY/mona-font/web/mona.css');
  @import url('https://cdn.jsdelivr.net/npm/galmuri@latest/dist/galmuri.css');
  body { margin: 0; background: #f4f4ef; font: 14px "Mona12 Text KR", Mona12, sans-serif; color: #111; }
  #sheet { display: inline-block; padding: 40px 48px 56px;
    background-color: #f4f4ef;
    background-image: linear-gradient(rgba(17,17,17,.055) 1px, transparent 1px), linear-gradient(90deg, rgba(17,17,17,.055) 1px, transparent 1px);
    background-size: 8px 8px; }
  header { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; }
  .tag { padding: 6px 12px; border: 3px solid #111; background: #f7c548; box-shadow: 4px 4px 0 #111; font-family: Galmuri11; font-weight: 700; }
  .url { font-size: 14px; }
  .row { display: flex; align-items: flex-start; gap: 32px; }
  figure { margin: 0; }
  figcaption { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
  figcaption b { font-family: Galmuri11; font-weight: 700; }
  figcaption span { color: #74746c; }
  img { display: block; border: 3px solid #111; box-shadow: 6px 6px 0 rgba(17,17,17,.32); background: #fff; }
</style>
<div id="sheet">
  <header><span class="tag">DTM Preview</span><span class="url">${esc(url)}</span></header>
  <div class="row">${cards}</div>
</div>`;
  const sheetW = results.reduce((sum, r) => sum + r.w * k + 32, 96);
  const context = await browser.newContext({ viewport: { width: 1200, height: 800 }, deviceScaleFactor: scaleFor(sheetW) });
  try {
    const page = await context.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    return await page.locator('#sheet').screenshot(JPEG);
  } finally {
    await context.close();
  }
}
