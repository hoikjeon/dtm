#!/usr/bin/env node
/* 샷 도감 영상(assets/raw/shots/video/*.mp4)을 assets/shots/ 로 복사하고,
   영상의 한 장면을 포스터 이미지(WebP)로 뽑아 assets/shots/<이름>.webp 로 저장합니다.
   ffmpeg 없이, 설치된 Google Chrome(playwright-core)으로 영상을 열어 캔버스로 캡처해요.

   사용법: node scripts/video-posters.mjs            (전체)
           node scripts/video-posters.mjs push-in    (하나만) */
import { chromium } from 'playwright-core';
import { copyFile, readdir, writeFile, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'assets/raw/shots/video');
const OUT = join(ROOT, 'assets/shots');
const AT = 0.4; // 몇 초 지점을 포스터로 쓸지 (0.4초: 첫 프레임의 어색함을 피함)
const AT_BY_NAME = { pan: 4.6 }; // 팬은 끝쪽에서 인물이 드러나므로 뒤쪽 장면을 포스터로

const only = process.argv[2];
const files = (await readdir(SRC)).filter((f) => f.endsWith('.mp4') && (!only || f === only + '.mp4'));

const browser = await chromium.launch({ channel: 'chrome' }); // H.264 재생을 위해 정식 Chrome 사용
const page = await browser.newPage();
await page.setContent('<video id="v" muted playsinline></video><canvas id="c"></canvas>');

for (const f of files) {
  const name = f.replace(/\.mp4$/, '');
  await copyFile(join(SRC, f), join(OUT, f));
  const b64 = (await readFile(join(SRC, f))).toString('base64');
  const dataUrl = await page.evaluate(async ({ b64, at }) => {
    const v = document.getElementById('v');
    const blob = await (await fetch('data:video/mp4;base64,' + b64)).blob();
    v.src = URL.createObjectURL(blob);
    await new Promise((r, j) => { v.onloadeddata = r; v.onerror = () => j(new Error('영상을 열 수 없어요')); });
    v.currentTime = Math.min(at, v.duration - 0.1);
    await new Promise((r) => { v.onseeked = r; });
    const c = document.getElementById('c');
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext('2d').drawImage(v, 0, 0);
    return c.toDataURL('image/webp', 0.82);
  }, { b64, at: AT_BY_NAME[name] ?? AT });
  await writeFile(join(OUT, name + '.webp'), Buffer.from(dataUrl.split(',')[1], 'base64'));
  console.log(`  ${name}.mp4 + ${name}.webp`);
}
await browser.close();
