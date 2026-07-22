// Vélivert — main entry point: bridge, CLICK_EVENT, refresh

import { waitForEvenAppBridge } from '@evenrealities/even_hub_sdk'
import { getStations, nearestStations } from './data.ts'
import type { Station } from './config.ts'
import { DEFAULT_RADIUS } from './config.ts'
import { updateG2Display } from './display/index.ts'

let bridge: any = null
let currentStations: Station[] = []
let currentLat = 0
let currentLon = 0
let currentRadius = DEFAULT_RADIUS

async function main() {
  console.log('[Vélivert] Starting...')
  bridge = await waitForEvenAppBridge()
  console.log('[Vélivert] Bridge connected ✓')

  // Expose bridge to companion UI (index.html inline script)
  ;(window as any).__bridge = bridge

  // Listen for G2 click → refresh
  bridge.addEventListener('CLICK_EVENT', (event: any) => {
    // Protobuf zero-value quirk: CLICK_EVENT field may be undefined
    const et = event?.listEvent?.eventType ?? 0
    if (et !== 0) return // 0 = CLICK_EVENT
    console.log('[Vélivert] CLICK_EVENT → refresh')
    refreshData()
  })

  // Listen for position updates from companion UI
  ;(window as any).__updatePosition = (lat: number, lon: number, radius: number) => {
    currentLat = lat
    currentLon = lon
    currentRadius = radius
    refreshData()
  }

  // Listen for direct G2 update calls from companion UI
  ;(window as any).__updateG2Direct = (stations: Station[]) => {
    updateG2Display(bridge, stations)
  }
}

async function refreshData() {
  if (currentLat === 0 && currentLon === 0) return

  try {
    const stations = await getStations(bridge)
    if (stations.length === 0) {
      updateG2Display(bridge, [])
      return
    }

    currentStations = nearestStations(stations, currentLat, currentLon, currentRadius, 3)
    updateG2Display(bridge, currentStations)
  } catch (e) {
    console.error('[Vélivert] Refresh error:', e)
  }
}

main()
