// Vélivert — types & configuration

export interface Station {
  station_id: string
  name: string
  lat: number
  lon: number
  capacity: number
  address: string
  bikes_available: number
  docks_available: number
  distance: number
}

export const INFO_URL = 'https://api.saint-etienne-metropole.fr/velivert/api/station_information.json'
export const STATUS_URL = 'https://api.saint-etienne-metropole.fr/velivert/api/station_status.json'
export const CACHE_TTL = 60_000 // ms (GBFS TTL is 60s)
export const CACHE_KEY = 'velivert-cache'
export const DEFAULT_RADIUS = 1000 // m
export const MIN_RADIUS = 300
export const MAX_RADIUS = 3000
export const RADIUS_STEP = 100
export const TOP_N = 3
export const GEOLOC_TIMEOUT = 8_000 // ms
export const APP_VERSION = '1.0.1'
