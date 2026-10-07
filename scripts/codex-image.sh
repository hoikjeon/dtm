#!/usr/bin/env bash
# Codex CLI 로 이미지를 생성해 지정한 경로에 저장합니다. (안티그래비티 터미널에서 호출)
#
# 사용법: scripts/codex-image.sh "<이미지 프롬프트>" <저장 경로.png> [참조 이미지.png]
#   예)   scripts/codex-image.sh "neon city at dusk, 16:9" assets/raw/effects/landscape.png
#         scripts/codex-image.sh "low angle shot of her" assets/raw/shots/low-angle.png assets/raw/shots/ref-hero.png
#   참조 이미지를 주면 같은 인물·장소를 유지하도록 함께 첨부합니다.
#
# - codex 가 PATH 에 없으면 안티그래비티/VS Code 의 OpenAI 확장 안에 든 CLI 를 찾아 씁니다.
# - Codex 는 생성 이미지를 ~/.codex/generated_images/<세션 id>/ 에 저장하므로,
#   이번 실행의 세션 폴더에 생긴 이미지를 지정한 경로로 복사합니다(동시에 여러 개 실행해도 안전).
set -euo pipefail

PROMPT="${1:?프롬프트를 입력하세요}"
OUT="${2:?저장 경로를 입력하세요}"
REF="${3:-}"
[[ -z "$REF" || -f "$REF" ]] || { echo "참조 이미지를 찾을 수 없어요: $REF" >&2; exit 1; }
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GEN_DIR="$HOME/.codex/generated_images"

CODEX="$(command -v codex || true)"
if [[ -z "$CODEX" ]]; then
  CODEX="$(ls -t "$HOME"/.antigravity-ide/extensions/openai.chatgpt-*/bin/*/codex \
                 "$HOME"/.antigravity/extensions/openai.chatgpt-*/bin/*/codex \
                 "$HOME"/.vscode/extensions/openai.chatgpt-*/bin/*/codex 2>/dev/null | head -1 || true)"
fi
[[ -x "$CODEX" ]] || { echo "codex CLI 를 찾을 수 없어요" >&2; exit 1; }

mkdir -p "$(dirname "$OUT")" "$GEN_DIR"
EVENTS="$(mktemp)"

cd "$ROOT"
# --json 으로 이번 실행의 세션(thread) id 를 받아서, 그 세션 폴더의 이미지만 가져옵니다.
# (여러 개를 동시에 실행해도 서로의 이미지를 집어오지 않도록)
"$CODEX" exec --skip-git-repo-check -s read-only --json \
  "이미지 생성 도구(image generation)를 사용해서 아래 이미지를 정확히 1장 만들어줘. 파일 작업이나 코드 작성은 하지 말고, 이미지만 생성하고 끝내.

$PROMPT" ${REF:+-i "$REF"} </dev/null > "$EVENTS"

THREAD="$(grep -o '"thread_id":"[^"]*"' "$EVENTS" | head -1 | cut -d'"' -f4 || true)"
rm -f "$EVENTS"
[[ -n "$THREAD" ]] || { echo "Codex 세션 id 를 찾지 못했어요" >&2; exit 1; }

NEW="$(ls -t "$GEN_DIR/$THREAD"/*.png 2>/dev/null | head -1 || true)"
[[ -n "$NEW" ]] || { echo "생성된 이미지를 찾지 못했어요 (세션 $THREAD)" >&2; exit 1; }

cp "$NEW" "$OUT"
echo "저장: $OUT  (원본: $NEW)"
