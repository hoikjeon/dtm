#!/usr/bin/env python3
"""Codex 가 만든 원본 이미지(assets/raw)와 SVG 아이콘(assets/icons)을 앱에서 쓰는 형태로 변환합니다.

- 아이콘 PNG: 배경 제거(가장자리에서 이어진 흰색/마젠타 영역만) → 여백 정리 → 정사각형 → 축소
- hero: 3:2 로 맞춰 축소
- SVG 아이콘: assets/icons.js 하나로 묶어서 file:// 로 열어도 동작하게 함
- 웹 효과 도감 이미지(assets/raw/effects/*.png): 1600px WebP 로 변환 → assets/effects/

사용법: python3 scripts/build-assets.py   (Pillow 필요)
"""
from collections import deque
from pathlib import Path
import json
import re

from PIL import Image, ImageEnhance

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "assets" / "raw"
OUT = ROOT / "assets"

ICON_SIZES = {"logo": 160, "device-desktop": 96, "device-tablet": 96, "device-mobile": 96}
HERO_WIDTH = 1500


def remove_background(img: Image.Image, tol: int = 40) -> Image.Image:
    """이미 투명하면 그대로, 아니면 테두리와 이어진 배경색 영역만 투명하게."""
    img = img.convert("RGBA")
    w, h = img.size
    px = img.load()
    corners = [px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1]]
    if all(c[3] < 16 for c in corners):
        return img

    bg = max(set(c[:3] for c in corners), key=lambda c: sum(1 for k in corners if k[:3] == c))
    near = lambda c: c[3] > 0 and sum(abs(c[i] - bg[i]) for i in range(3)) <= tol * 3
    seen = bytearray(w * h)
    q = deque()
    for x in range(w):
        q.extend(((x, 0), (x, h - 1)))
    for y in range(h):
        q.extend(((0, y), (w - 1, y)))
    while q:
        x, y = q.popleft()
        i = y * w + x
        if seen[i]:
            continue
        seen[i] = 1
        if not near(px[x, y]):
            continue
        px[x, y] = (0, 0, 0, 0)
        if x > 0: q.append((x - 1, y))
        if x < w - 1: q.append((x + 1, y))
        if y > 0: q.append((x, y - 1))
        if y < h - 1: q.append((x, y + 1))
    return img


def square_icon(img: Image.Image, size: int, margin: float = 0.04) -> Image.Image:
    box = img.getchannel("A").point(lambda a: 255 if a > 24 else 0).getbbox()
    if box:
        img = img.crop(box)
    side = int(max(img.size) * (1 + margin * 2))
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(img, ((side - img.width) // 2, (side - img.height) // 2), img)
    return canvas.resize((size, size), Image.LANCZOS)


def build_rasters() -> None:
    for name, size in ICON_SIZES.items():
        src = RAW / f"{name}.png"
        if not src.exists():
            print(f"  skip {name} (원본 없음)")
            continue
        icon = square_icon(remove_background(Image.open(src)), size)
        icon.save(OUT / f"{name}.png", optimize=True)
        print(f"  {name}.png  {size}px")
        if name == "logo":
            square_icon(remove_background(Image.open(src)), 64).save(OUT / "favicon.png", optimize=True)
            print("  favicon.png  64px")

    src = RAW / "hero.png"
    if src.exists():
        img = Image.open(src).convert("RGB")
        w, h = img.size
        target = 3 / 2
        if w / h > target:
            nw = int(h * target)
            img = img.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
        else:
            nh = int(w / target)
            img = img.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
        img = img.resize((HERO_WIDTH, int(HERO_WIDTH / target)), Image.LANCZOS)
        img.save(OUT / "hero.png", optimize=True)
        print(f"  hero.png  {img.size[0]}x{img.size[1]}")


def build_icons_js() -> None:
    icons = {}
    for svg in sorted((OUT / "icons").glob("*.svg")):
        text = svg.read_text(encoding="utf-8")
        text = re.sub(r"<\?xml[^>]*>|<!--.*?-->", "", text, flags=re.S)
        text = re.sub(r">\s+<", "><", text).strip()
        text = text.replace("<svg ", '<svg aria-hidden="true" focusable="false" ', 1)
        icons[svg.stem] = text
    body = json.dumps(icons, ensure_ascii=False, indent=1)
    (OUT / "icons.js").write_text(
        "/* 자동 생성 파일 — scripts/build-assets.py 가 assets/icons/*.svg 로 만듭니다. 직접 수정하지 마세요. */\n"
        f"window.DTM_ICONS = {body};\n",
        encoding="utf-8",
    )
    print(f"  icons.js  ({len(icons)}개: {', '.join(icons)})")


EFFECTS_RAW = RAW / "effects"
EFFECTS_OUT = OUT / "effects"
EFFECTS_WIDTH = 1600


def build_effects() -> None:
    if not EFFECTS_RAW.exists():
        return
    EFFECTS_OUT.mkdir(exist_ok=True)
    for src in sorted(EFFECTS_RAW.glob("*.png")):
        img = Image.open(src).convert("RGB")
        if img.width > EFFECTS_WIDTH:
            img = img.resize((EFFECTS_WIDTH, round(img.height * EFFECTS_WIDTH / img.width)), Image.LANCZOS)
        img.save(EFFECTS_OUT / f"{src.stem}.webp", quality=82, method=6)
        print(f"  effects/{src.stem}.webp  {img.size[0]}x{img.size[1]}")
        if src.stem == "landscape":
            # 전후 비교 슬라이더용 "보정 전" 사진: 같은 구도에서 색·대비·밝기를 낮춤
            before = ImageEnhance.Color(img).enhance(0.18)
            before = ImageEnhance.Contrast(before).enhance(0.72)
            before = ImageEnhance.Brightness(before).enhance(0.82)
            before.save(EFFECTS_OUT / "landscape-before.webp", quality=82, method=6)
            print("  effects/landscape-before.webp  (보정 전 버전)")


SHOTS_RAW = RAW / "shots"
SHOTS_OUT = OUT / "shots"
SHOT_RENAME = {"ref-hero": "full"}  # 기준 주인공 이미지 = 풀 샷 예시
SHOT_LETTERBOX = {"anamorphic"}  # 시네마스코프(2.39:1) 이미지는 잘리지 않게 위아래 검은 띠를 붙여 16:9 로


def build_shots() -> None:
    """샷 도감 이미지: assets/raw/shots/*.png → assets/shots/*.webp (영상 포스터는 scripts/video-posters.mjs)."""
    if not SHOTS_RAW.exists():
        return
    SHOTS_OUT.mkdir(exist_ok=True)
    for src in sorted(SHOTS_RAW.glob("*.png")):
        img = Image.open(src).convert("RGB")
        if img.width > EFFECTS_WIDTH:
            img = img.resize((EFFECTS_WIDTH, round(img.height * EFFECTS_WIDTH / img.width)), Image.LANCZOS)
        if src.stem in SHOT_LETTERBOX and img.width / img.height > 16 / 9 + 0.01:
            frame = Image.new("RGB", (img.width, round(img.width * 9 / 16)), "black")
            frame.paste(img, (0, (frame.height - img.height) // 2))
            img = frame
        name = SHOT_RENAME.get(src.stem, src.stem)
        img.save(SHOTS_OUT / f"{name}.webp", quality=82, method=6)
        print(f"  shots/{name}.webp  {img.size[0]}x{img.size[1]}")


if __name__ == "__main__":
    print("assets 빌드")
    build_rasters()
    build_icons_js()
    build_effects()
    build_shots()
