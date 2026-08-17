/** tsdown config — bundles only the host half. The browser client is compiled
 * by tsc (CommonJS) and wrapped by scripts/build-client.mjs into DSH's
 * window.__ModuleLoader__.load format, so it is intentionally excluded here. */
export default {
  entry: {
    index: 'src/index.ts',
  },
  format: ['esm'],
  target: 'node20',
  clean: false,
  sourcemap: true,
  outDir: 'lib',
}
