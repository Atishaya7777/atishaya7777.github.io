// Patches v1-source/astro.config.mjs to add base: '/v1'
// Run from the repo root: node scripts/patch-v1-config.mjs
import { readFileSync, writeFileSync } from 'fs';

const path = 'v1-source/astro.config.mjs';
let src = readFileSync(path, 'utf8');

if (src.includes("base: '/v1'")) {
  console.log('Already patched, skipping.');
  process.exit(0);
}

// Insert base: '/v1' as the first key inside defineConfig({ ... })
src = src.replace(
  /defineConfig\s*\(\s*\{/,
  "defineConfig({\n  base: '/v1',"
);

writeFileSync(path, src);
console.log('Patched', path);
