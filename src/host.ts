/**
 * dsh-proxy-panel host — read-only client over the local mihomo control API.
 *
 * Everything here talks to the mihomo RESTful controller bound to the loopback
 * external-controller address (default 127.0.0.1:54438 from proxy-gate). The
 * panel is read-only: no proxy mutation, no node switching, only status.
 * @module dsh-proxy-panel/host
 */

export interface ProxyStatus {
  /** Whether mihomo answered /version on the controller address. */
  running: boolean
  /** The configured loopback controller base URL. */
  controller: string
  /** Listening mixed-port (HTTP/SOCKS) reported by mihomo, when readable. */
  port: number | null
  /** Proxy group name the panel watches (e.g. Ghelper). */
  group: string
  /** Currently selected node name inside the group (e.g. 🇸🇬 新加坡). */
  activeNode: string | null
  /** Latest measured node delay in ms, when a test has been run. */
  latencyMs: number | null
  /** Brief error message when a probe fails (null when healthy). */
  error: string | null
}

function controllerBase(controller: string): string {
  return controller.replace(/\/+$/, '')
}

async function jsonOrNull<T>(base: string, path: string): Promise<T | null> {
  try {
    const res = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(3000) })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

/** Number of ms, or null when the node test timed out / failed. */
function delayValue(delay: { delay?: number }): number | null {
  return typeof delay.delay === 'number' && Number.isFinite(delay.delay) ? delay.delay : null
}

/** Aggregate a full status snapshot from the mihomo control API. */
export async function collectStatus(
  controller: string,
  group = 'Ghelper',
): Promise<ProxyStatus> {
  const base = controllerBase(controller)
  const version = await jsonOrNull<{ version: string }>(base, '/version')
  if (version === null) {
    return {
      running: false,
      controller,
      port: null,
      group,
      activeNode: null,
      latencyMs: null,
      error: 'mihomo control API unreachable',
    }
  }
  const proxies = await jsonOrNull<{ proxies: Record<string, unknown> }>(base, '/proxies')
  const configs = await jsonOrNull<{ 'mixed-port'?: number }>(base, '/configs')
  const g = proxies?.proxies?.[group] as
    | { now?: string; history?: Array<{ delay?: number }> }
    | undefined
  const activeNode = g?.now ?? null
  const latencyMs = activeNode ? delayValue(g?.history?.at(-1) as { delay?: number } | undefined ?? {}) : null
  return {
    running: true,
    controller,
    port: configs?.['mixed-port'] ?? null,
    group,
    activeNode,
    latencyMs,
    error: null,
  }
}

/** Trigger a fresh latency test on the group and return the measured node delay. */
export async function measureLatency(
  controller: string,
  group = 'Ghelper',
): Promise<{ activeNode: string | null; latencyMs: number | null; error: string | null }> {
  const base = controllerBase(controller)
  const proxies = await jsonOrNull<{ proxies: Record<string, unknown> }>(base, '/proxies')
  const g = proxies?.proxies?.[group] as { now?: string } | undefined
  const activeNode = g?.now ?? null
  if (activeNode === null) {
    return { activeNode: null, latencyMs: null, error: `group ${group} not found` }
  }
  const probeUrl = `https://www.gstatic.com/generate_204`
  const delay = await jsonOrNull<{ delay?: number }>(
    base,
    `/proxies/${encodeURIComponent(group)}/delay?timeout=5000&url=${encodeURIComponent(probeUrl)}`,
  )
  const latencyMs = delayValue(delay ?? {})
  return { activeNode, latencyMs, error: latencyMs === null ? 'latency test timed out' : null }
}
