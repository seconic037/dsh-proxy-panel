/**
 * dsh-proxy-panel client — real-time proxy status panel for Settings.
 * Polls the host /_dsh/proxy-panel/status route every REFRESH_MS ms and
 * renders mihomo run state, port, active node and latency. Read-only.
 * @module dsh-proxy-panel/client
 */

import { useState, useEffect, useCallback } from 'react'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'

const STATUS_ROUTE = '/_dsh/proxy-panel/status'
const REFRESH_MS = 5000

interface ProxyStatus {
  running: boolean
  controller: string
  port: number | null
  group: string
  activeNode: string | null
  latencyMs: number | null
  error: string | null
}

type PanelProps = PropsRuntime<'settings.section'>

function ProxyPanel(_props: PanelProps): JSX.Element {
  const [status, setStatus] = useState<ProxyStatus | null>(null)
  const [testing, setTesting] = useState(false)

  const load = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch(STATUS_ROUTE, { credentials: 'same-origin' })
      if (!res.ok) {
        setStatus({ running: false, controller: STATUS_ROUTE, port: null, group: '', activeNode: null, latencyMs: null, error: `HTTP ${res.status}` })
        return
      }
      setStatus((await res.json()) as ProxyStatus)
    } catch {
      setStatus({ running: false, controller: STATUS_ROUTE, port: null, group: '', activeNode: null, latencyMs: null, error: '网络错误' })
    }
  }, [])

  useEffect(() => {
    void load()
    const timer = setInterval(() => { void load() }, REFRESH_MS)
    return () => clearInterval(timer)
  }, [load])

  const testLatency = async (): Promise<void> => {
    setTesting(true)
    try {
      const res = await fetch(`${STATUS_ROUTE}?action=latency`, { credentials: 'same-origin' })
      if (res.ok) setStatus((await res.json()) as ProxyStatus)
    } finally {
      setTesting(false)
    }
  }

  const running = status?.running === true
  return (
    <div className="pp-wrap">
      <div className="pp-head">
        <span className="pp-title">代理状态 (mihomo)</span>
        <span className={`pp-status ${running ? 'ok' : 'down'}`}>{running ? '运行中' : '未运行'}</span>
      </div>
      {status?.error && !running ? (
        <p className="pp-error">{status.error} — 检查 proxy-gate 是否已通过 systemd 启动</p>
      ) : null}
      <div className="pp-grid">
        <div>
          <span>监听端口</span>
          <strong>{status?.port ?? '—'}</strong>
        </div>
        <div>
          <span>代理组</span>
          <strong>{status?.group || '—'}</strong>
        </div>
        <div>
          <span>当前节点</span>
          <strong>{running ? (status?.activeNode ?? '—') : '—'}</strong>
        </div>
        <div>
          <span>延迟</span>
          <strong>{status?.latencyMs != null ? `${status.latencyMs} ms` : '—'}</strong>
        </div>
      </div>
      <div className="pp-actions">
        <button type="button" onClick={() => void testLatency()} disabled={testing || !running}>
          {testing ? '测试中…' : '测延迟'}
        </button>
        <button type="button" onClick={() => void load()}>刷新</button>
      </div>
      <style>{`
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
`}</style>
    </div>
  )
}

/** Register the panel as its own Settings section. */
export const inject = ['slots', 'settings']

export function apply(ctx: ClientContext): void {
  ctx.slots.inject('settings.section', () => ctx.slots.register(
    { name: 'settings.section', id: 'proxy-panel', order: 99, label: () => '代理状态' },
    ProxyPanel,
  ))
}

export const name = 'dsh-proxy-panel'
