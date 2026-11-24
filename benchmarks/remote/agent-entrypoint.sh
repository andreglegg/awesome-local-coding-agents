#!/usr/bin/env bash
set -euo pipefail

: "${BENCH_AGENT:?BENCH_AGENT required}"
: "${BENCH_PROMPT:?BENCH_PROMPT required}"

export HOME=/tmp/benchmark-home
export OLLAMA_MODELS=/models
export OLLAMA_HOST=127.0.0.1:11434
export FORGE_AUTO_UPDATE=0
export OLLAMA_CONTEXT_LENGTH=8192
mkdir -p "$HOME"
git config --global --add safe.directory /work

ollama serve >/tmp/benchmark-ollama.log 2>&1 &
server=$!
trap 'kill "$server" 2>/dev/null || true' EXIT
ready=0
for _ in $(seq 1 90); do
  if curl -fsS http://127.0.0.1:11434/api/tags >/dev/null 2>&1; then ready=1; break; fi
  sleep 2
done
if [[ "$ready" != 1 ]]; then
  echo "Ollama startup failed" >&2
  tail -80 /tmp/benchmark-ollama.log >&2
  exit 78
fi

echo "Benchmark environment: agent=$BENCH_AGENT, network=none, model=qwen2.5-coder:1.5b"
ollama --version
ollama list
case "$BENCH_AGENT" in
  forge)
    forge --version
    exec_timeout=780
    timeout "$exec_timeout" forge run "$BENCH_PROMPT" --yes \
      --url http://127.0.0.1:11434/v1 --model qwen2.5-coder:1.5b \
      --context 8192 --max-tokens 1024 --max-turns 10
    ;;
  codex-cli)
    codex --version
    timeout 780 codex exec --oss --local-provider ollama \
      --skip-git-repo-check -m qwen2.5-coder:1.5b \
      --sandbox workspace-write "$BENCH_PROMPT"
    ;;
  opencode)
    opencode --version
    mkdir -p "$HOME/.config/opencode"
    printf '%s\n' '{"permission":{"edit":"allow","bash":"allow"}}' > "$HOME/.config/opencode/opencode.json"
    timeout 780 opencode run --model ollama/qwen2.5-coder:1.5b "$BENCH_PROMPT"
    ;;
  *)
    echo "Unsupported agent: $BENCH_AGENT" >&2
    exit 64
    ;;
esac
