# CPU-only, disposable local inference benchmark image.
# Tool and runtime versions are pinned; the model tag's resolved digest is logged per run.
FROM node:22-bookworm-slim AS node-runtime

FROM ollama/ollama:0.40.17
ENV DEBIAN_FRONTEND=noninteractive \
    OLLAMA_MODELS=/models \
    OLLAMA_HOST=127.0.0.1:11434 \
    OLLAMA_NUM_PARALLEL=1 \
    FORGE_AUTO_UPDATE=0
RUN apt-get update && apt-get install -y --no-install-recommends \
    bash curl ca-certificates git libstdc++6 libatomic1 tini \
    && rm -rf /var/lib/apt/lists/*
COPY --from=node-runtime /usr/local/bin/node /usr/local/bin/node
COPY --from=node-runtime /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx \
    && node --version && npm --version
RUN npm install -g --no-audit --no-fund \
    @aglegg/forge-harness@0.2.2 \
    @openai/codex@0.171.0 \
    @opencode/cli@2.4.1
RUN mkdir -p /models /opt/bench \
    && (ollama serve >/tmp/ollama-build.log 2>&1 & server=$!; \
        for i in $(seq 1 40); do curl --silent --fail http://127.0.0.1:11434/api/tags >/dev/null && break; sleep 2; done; \
        ollama pull qwen2.5-coder:1.5b; result=$?; kill "$server" || true; exit "$result")
COPY benchmarks/remote/agent-entrypoint.sh /opt/bench/agent-entrypoint.sh
WORKDIR /work
ENTRYPOINT ["/usr/bin/tini", "--", "/bin/bash", "/opt/bench/agent-entrypoint.sh"]
