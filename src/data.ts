// Vélivert — data layer: fetch GBFS, merge, Haversine, cache

import type { Station } from './config.ts'
import { INFO_URL, STATUS_URL, CACHE_TTL, CACHE_KEY } from './config.ts'

/** Haversine distance in metres */
export function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6_371_000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/** Safe fetch wrapper — prevents hang in Even WebView (pitfall #38) */
function safeFetch(url: string): Promise<{ ok: boolean; data?: any; error?: string }> {
  return new Promise((resolve) => {
    fetch(url)
      .then((r) => {
        if (!r.ok) return resolve({ ok: false, error: `HTTP ${r.status}` })
        r.json()
          .then((d) => resolve({ ok: true, data: d }))
          .catch((e) => resolve({ ok: false, error: `JSON parse: ${e.message}` }))
      })
      .catch((e) => resolve({ ok: false, error: `Fetch: ${e.message}` }))
  })
}

/** Fetch & merge station info + status */
async function fetchStations(): Promise<Station[]> {
  const [infoResult, statusResult] = await Promise.all([safeFetch(INFO_URL), safeFetch(STATUS_URL)])

  if (!infoResult.ok || !infoResult.data?.data?.stations) {
    console.error('[Vélivert] Failed to fetch station_information:', infoResult.error)
    return []
  }
  if (!statusResult.ok || !statusResult.data?.data?.stations) {
    console.error('[Vélivert] Failed to fetch station_status:', statusResult.error)
    return []
  }

  // Build status lookup
  const statusById: Record<string, any> = {}
  for (const s of statusResult.data.data.stations) {
    statusById[s.station_id] = s
  }

  // Merge
  return infoResult.data.data.stations.map((s: any) => {
    const st = statusById[s.station_id] || {}
    return {
      station_id: s.station_id,
      name: s.name,
      lat: s.lat,
      lon: s.lon,
      capacity: s.capacity || 0,
      address: s.address || 'Saint-Étienne',
      bikes_available: st.num_bikes_available || 0,
      docks_available: st.num_docks_available || 0,
      distance: 0, // computed later
    }
  })
}

/** Get cached stations, refresh if TTL expired */
export async function getStations(bridge?: any): Promise<Station[]> {
  const now = Date.now()

  // Try bridge cache first
  if (bridge?.getLocalStorage) {
    try {
      const raw = await bridge.getLocalStorage(CACHE_KEY)
      if (raw) {
        const cached = JSON.parse(raw)
        if (now - cached.timestamp < CACHE_TTL) {
          return cached.stations
        }
      }
    } catch (_) {}
  }

  // Try localStorage (dev fallback)
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) {
      const cached = JSON.parse(raw)
      if (now - cached.timestamp < CACHE_TTL) {
        return cached.stations
      }
    }
  } catch (_) {}

  // Fetch fresh
  const stations = await fetchStations()

  // Update cache
  const payload = JSON.stringify({ timestamp: now, stations })
  if (bridge?.setLocalStorage) {
    try { await bridge.setLocalStorage(CACHE_KEY, payload) } catch (_) {}
  }
  try { localStorage.setItem(CACHE_KEY, payload) } catch (_) {}

  return stations
}

/** Compute distances, filter by radius, sort, return top N */
export function nearestStations(
  stations: Station[],
  lat: number,
  lon: number,
  radius: number,
  topN: number
): Station[] {
  for (const s of stations) {
    s.distance = Math.round(haversine(lat, lon, s.lat, s.lon))
  }
  return stations
    .filter((s) => s.distance <= radius)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, topN)
}
