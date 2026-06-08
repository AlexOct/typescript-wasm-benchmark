---
name: add-benchmark-example
description: Use when adding a feature, example, benchmark, algorithm, or demo case to this TypeScript WASM benchmark project.
---

# Add Benchmark Example

## Overview

Add examples by following the existing TypeScript/WASM benchmark integration points. Keep benchmark timing clean so results compare algorithm logic rather than setup noise.

## Integration Points

Touch only the files needed for the example:

- `src/ts-algorithms.ts` for TypeScript logic.
- `src/cpp/array_processor.cpp` for C++/WASM logic.
- `build-wasm.js` for exported C++ functions.
- `src/wasm-algorithms.ts` for WASM wrappers and memory handling.
- `src/benchmark.ts` for data generation and benchmark registration.
- `src/main.ts` only when result-card display needs explicit function names.

## Benchmark Rules

- Add both TypeScript and WASM implementations unless the request is explicitly TS-only.
- Keep hot loops free of unrelated allocations, logging, object creation, and avoid `BigInt` unless the workload requires it.
- Use flat typed arrays for data passed to WASM.
- Separate pure-compute timing from end-to-end allocation/copy timing when transfer cost matters.
- Add explicit `tsFuncName` and `wasmFuncName` metadata when benchmark names contain punctuation, mode suffixes, or wording that cannot convert cleanly to function names.

## Verification

Run before claiming completion:

```bash
pnpm exec tsc --noEmit
pnpm run build:wasm
pnpm run build
```

If the UI changed, start Vite and at least confirm the page returns HTTP 200. Do not claim full browser UI verification unless you actually used the page in a browser.

## Publish Handoff

If the user asks to upload, publish, deploy, update GitHub, or refresh the live/online demo, use the project publish workflow after local verification. Do not stop at “local build passed.”

## Secret Safety

Never stage or commit `.env*`, credentials, tokens, local settings, editor config, `.claude/` content outside shared skills, or untracked planning docs unless explicitly requested. Before publishing, scan tracked changes for common secret strings such as `API_KEY`, `SECRET`, `TOKEN`, `PASSWORD`, `OPENAI`, `ANTHROPIC`, and `sk-`.

## Common Mistakes

| Mistake | Fix |
|---|---|
| Adding only TypeScript logic | Mirror it in C++ and the WASM wrapper. |
| Polluting the measured hot loop | Move setup into `prepare` or add a separate end-to-end benchmark. |
| Forgetting WASM exports | Update `build-wasm.js`. |
| Broken result-card function labels | Add explicit function-name metadata. |
| Assuming the live demo updated | Verify deployment or the live page after publishing. |
