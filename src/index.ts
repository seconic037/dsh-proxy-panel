/**
 * dsh-proxy-panel — real-time proxy (mihomo) status panel for the web profile.
 *
 * Host half only: it registers a read-only /_dsh/proxy-panel/status route on
 * the DSH webServer, backed by the local mihomo control API. The browser client
 * (./client) polls that route every few seconds to render the active node,
 * latency, run state and port. No proxy mutation is exposed.
 * @module dsh-proxy-panel
 */

import type {} from '@deepseek-ai/dsh-host-webserver'
import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { collectStatus, measureLatency } from './host.js'

/** Status route served to the browser Settings panel. */
export const STATUS_ROUTE = '/_dsh/proxy-panel/status'

export interface Config {
  /** mihomo RESTful controller base URL. */
  controller: string
  /** Proxy group the panel watches. */
  group: string
}

export const Config = z.object({
  controller: z.string().default('http://127.0.0.1:54438'),
  group: z.string().default('Ghelper'),
})

function json(res: { writeHead: (code: number, head: Record<string, string>) => void; end: (b: string) => void }, data: unknown): void {
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(data))
}

/** Attach the status route whenever a webServer service is present. */
export function apply(ctx: Context, config: Config): void {
  ctx.inject(['webServer'], (webCtx) => {
    webCtx.effect(() => {
      const dispose = webCtx.webServer.register({
        kind: 'exact',
        path: STATUS_ROUTE,
        handler: async (req, res) => {
          const url = new URL(req.url ?? '/', 'http://127.0.0.1')
          if (url.searchParams.get('action') === 'latency') {
            const latency = await measureLatency(config.controller, config.group)
            json(res, latency)
            return
          }
          const status = await collectStatus(config.controller, config.group)
          json(res, status)
        },
      })
      return dispose
    })
  })
}

export const name = 'dsh-proxy-panel'
export const inject: string[] = []
