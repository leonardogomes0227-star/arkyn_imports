// Testes do checkout e do frete: npm test (usa o esbuild que já vem com o Vite)
import { build } from 'esbuild'
import { spawnSync } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
const out = join(mkdtempSync(join(tmpdir(), 'arkyn-test-')), 'shop.test.mjs')
await build({ entryPoints: ['tests/shop.test.ts'], bundle: true, platform: 'node', format: 'esm', outfile: out, logLevel: 'error', banner: { js: "import {createRequire} from 'module';const require=createRequire(import.meta.url);" } })
process.exit(spawnSync('node', ['--test', out], { stdio: 'inherit' }).status ?? 1)
