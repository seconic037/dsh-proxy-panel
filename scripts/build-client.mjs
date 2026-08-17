/**
 * dsh-proxy-panel client bundler: wraps the tsc-emitted CommonJS client into
 * DSH's window.__ModuleLoader__.load({ id, factory }) module table so the DSH
 * web client can mount it as a browser settings-section plugin.
 * @module scripts/build-client
 */
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(new URL('../package.json', import.meta.url)))
const compiledRoot = join(root, '.client-build')
const outputPath = join(root, 'lib', 'client.js')
const PLUGIN_ID = 'dsh-proxy-panel'

/** Collect *.js files recursively, returning paths relative to compiledRoot. */
async function collect(base) {
  const out = []
  for (const entry of await readdir(base, { withFileTypes: true })) {
    const abs = join(base, entry.name)
    const rel = abs.replace(compiledRoot + '/', '')
    if (entry.isDirectory()) out.push(...await collect(abs))
    else if (rel.endsWith('.js')) out.push(rel)
  }
  return out
}

const compiledFiles = (await collect(compiledRoot)).sort((a, b) => a.localeCompare(b))

const lines = []
function push(chunk) { lines.push(chunk) }

push(`window.__ModuleLoader__.load({ id: "${PLUGIN_ID}", factory: (require) => {`)
push('var __modules = Object.create(null); var __cache = Object.create(null);')
for (const rel of compiledFiles) {
  const moduleId = `./${rel}`
  // Local relative imports inside the compiled module route through __load_;
  // host package imports stay on require.
  let source = await readFile(join(compiledRoot, rel), 'utf8')
  source = source.replace(/\n?\/\/# sourceMappingURL=.*$/u, '')
  source = source.replace(/\brequire(?=\(["']\.\.?\/)/gu, '__load_')
  push(`__modules[${JSON.stringify(moduleId)}] = function(module, exports, require, __load_) {`)
  push(source)
  push('};')
}
for (const line of [
  'function __resolve(from, request) {',
  '  if (!request.startsWith(".")) return request;',
  '  var parts = from.slice(2).split("/"); parts.pop();',
  '  for (var part of request.split("/")) { if (part === "." || part === "") continue; if (part === "..") parts.pop(); else parts.push(part); }',
  '  return "./" + parts.join("/");',
  '}',
  'function __load(id) {',
  '  if (__modules[id] === undefined) return require(id);',
  '  if (__cache[id] !== undefined) return __cache[id].exports;',
  '  var module = __cache[id] = { exports: {} };',
  '  __modules[id](module, module.exports, require, function(request) { var resolved = __resolve(id, request); return __modules[resolved] === undefined ? require(request) : __load(resolved); });',
  '  return module.exports;',
  '}',
  'return __load("./index.js"); } });',
  '',
]) push(line)
const wrapped = lines.join('\n')

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, wrapped)
console.log(`built ${outputPath} (${wrapped.length} bytes, ${compiledFiles.length} module(s))`)
