const envUrl = process.env.EXPO_PUBLIC_API_URL

export const API_URL = envUrl || (
  typeof window !== 'undefined'
    ? window.location.origin
    : 'http://localhost:8055'
)
