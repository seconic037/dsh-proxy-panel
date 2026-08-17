/**
 * dsh-proxy-panel client — real-time proxy status panel for Settings.
 * Polls the host /_dsh/proxy-panel/status route every REFRESH_MS ms and
 * renders mihomo run state, port, active node and latency. Read-only.
 * @module dsh-proxy-panel/client
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
/** Register the panel as its own Settings section. */
export declare function apply(ctx: ClientContext): void;
export declare const name = "dsh-proxy-panel";
