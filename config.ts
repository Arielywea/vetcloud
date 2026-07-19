const envUrl = process.env.EXPO_PUBLIC_API_URL

let hostname = 'localhost'

try {
  if (typeof window !== 'undefined') {
    hostname = window.location.hostname
  }
} catch (e) {}

export const API_URL = envUrl || `http://${hostname}:8055`

export const DIRECTUS_CONFIG = {
  url: API_URL,
} as const
