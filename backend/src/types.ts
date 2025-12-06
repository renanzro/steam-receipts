import type { SteamPlayer } from './lib/steam-api.js'

// Extend Hono's context to include our custom variables
declare module 'hono' {
  interface ContextVariableMap {
    steamId: string
    player?: SteamPlayer
  }
}
