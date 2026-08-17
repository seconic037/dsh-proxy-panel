window.__ModuleLoader__.load({ id: "dsh-proxy-panel", factory: (require) => {
var __modules = Object.create(null); var __cache = Object.create(null);
__modules["./index.js"] = function(module, exports, require, __load_) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.name = void 0;
exports.apply = apply;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * dsh-proxy-panel client — real-time proxy status panel for Settings.
 * Polls the host /_dsh/proxy-panel/status route every REFRESH_MS ms and
 * renders mihomo run state, port, active node and latency. Read-only.
 * @module dsh-proxy-panel/client
 */
const react_1 = require("react");
const STATUS_ROUTE = '/_dsh/proxy-panel/status';
const REFRESH_MS = 5000;
function ProxyPanel(_props) {
    const [status, setStatus] = (0, react_1.useState)(null);
    const [testing, setTesting] = (0, react_1.useState)(false);
    const load = (0, react_1.useCallback)(async () => {
        try {
            const res = await fetch(STATUS_ROUTE, { credentials: 'same-origin' });
            if (!res.ok) {
                setStatus({ running: false, controller: STATUS_ROUTE, port: null, group: '', activeNode: null, latencyMs: null, error: `HTTP ${res.status}` });
                return;
            }
            setStatus((await res.json()));
        }
        catch {
            setStatus({ running: false, controller: STATUS_ROUTE, port: null, group: '', activeNode: null, latencyMs: null, error: '网络错误' });
        }
    }, []);
    (0, react_1.useEffect)(() => {
        void load();
        const timer = setInterval(() => { void load(); }, REFRESH_MS);
        return () => clearInterval(timer);
    }, [load]);
    const testLatency = async () => {
        setTesting(true);
        try {
            const res = await fetch(`${STATUS_ROUTE}?action=latency`, { credentials: 'same-origin' });
            if (res.ok)
                setStatus((await res.json()));
        }
        finally {
            setTesting(false);
        }
    };
    const running = status?.running === true;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "pp-wrap", children: [(0, jsx_runtime_1.jsxs)("div", { className: "pp-head", children: [(0, jsx_runtime_1.jsx)("span", { className: "pp-title", children: "\u4EE3\u7406\u72B6\u6001 (mihomo)" }), (0, jsx_runtime_1.jsx)("span", { className: `pp-status ${running ? 'ok' : 'down'}`, children: running ? '运行中' : '未运行' })] }), status?.error && !running ? ((0, jsx_runtime_1.jsxs)("p", { className: "pp-error", children: [status.error, " \u2014 \u68C0\u67E5 proxy-gate \u662F\u5426\u5DF2\u901A\u8FC7 systemd \u542F\u52A8"] })) : null, (0, jsx_runtime_1.jsxs)("div", { className: "pp-grid", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { children: "\u76D1\u542C\u7AEF\u53E3" }), (0, jsx_runtime_1.jsx)("strong", { children: status?.port ?? '—' })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { children: "\u4EE3\u7406\u7EC4" }), (0, jsx_runtime_1.jsx)("strong", { children: status?.group || '—' })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { children: "\u5F53\u524D\u8282\u70B9" }), (0, jsx_runtime_1.jsx)("strong", { children: running ? (status?.activeNode ?? '—') : '—' })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { children: "\u5EF6\u8FDF" }), (0, jsx_runtime_1.jsx)("strong", { children: status?.latencyMs != null ? `${status.latencyMs} ms` : '—' })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "pp-actions", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => void testLatency(), disabled: testing || !running, children: testing ? '测试中…' : '测延迟' }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => void load(), children: "\u5237\u65B0" })] }), (0, jsx_runtime_1.jsx)("style", { children: `
.pp-wrap{display:grid;gap:12px;max-width:640px}
.pp-head{display:flex;align-items:center;justify-content:space-between}
.pp-title{font-size:15px;font-weight:600}
.pp-status{padding:2px 10px;border-radius:999px;font-size:12px}
.pp-status.ok{background:#0f02;color:#1a7f4b}
.pp-status.down{background:#f001;color:#c0392b}
.pp-error{margin:0;color:#c0392b;font-size:12px}
.pp-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.pp-grid>div{padding:10px;border-radius:9px;background:var(--dsw-alias-bg-layer-2);display:grid;gap:4px}
.pp-grid span{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--dsw-alias-label-secondary)}
.pp-grid strong{font-size:14px}
.pp-actions{display:flex;gap:8px}
.pp-actions button{padding:6px 14px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:transparent;color:inherit;font:inherit;cursor:pointer}
.pp-actions button:disabled{opacity:.5;cursor:default}
` })] }));
}
/** Register the panel as its own Settings section. */
function apply(ctx) {
    ctx.slots.inject('settings.section', () => ctx.slots.register({ name: 'settings.section', id: 'proxy-panel', order: 99, label: () => '代理状态' }, ProxyPanel));
}
exports.name = 'dsh-proxy-panel';
};
function __resolve(from, request) {
  if (!request.startsWith(".")) return request;
  var parts = from.slice(2).split("/"); parts.pop();
  for (var part of request.split("/")) { if (part === "." || part === "") continue; if (part === "..") parts.pop(); else parts.push(part); }
  return "./" + parts.join("/");
}
function __load(id) {
  if (__modules[id] === undefined) return require(id);
  if (__cache[id] !== undefined) return __cache[id].exports;
  var module = __cache[id] = { exports: {} };
  __modules[id](module, module.exports, require, function(request) { var resolved = __resolve(id, request); return __modules[resolved] === undefined ? require(request) : __load(resolved); });
  return module.exports;
}
return __load("./index.js"); } });
