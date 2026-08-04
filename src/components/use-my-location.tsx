"use client"

import { useState } from "react"

/**
 * Detect the user's current location using the browser's built-in Geolocation
 * API — this is free and needs no paid maps key. We then try a best-effort
 * reverse-geocode via OpenStreetMap's free Nominatim endpoint to turn the
 * coordinates into a human address; if that's unavailable we fall back to the
 * raw coordinates. Nothing here incurs a cost.
 */
export function useMyLocation() {
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState("")

  function detect(onResolved: (label: string, coords: { lat: number; lng: number }) => void) {
    setError("")
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Location isn't supported on this device.")
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        let label = `My location (${lat.toFixed(4)}, ${lng.toFixed(4)})`
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
            { headers: { Accept: "application/json" } }
          )
          if (res.ok) {
            const data = await res.json()
            if (data?.display_name) label = String(data.display_name).split(",").slice(0, 3).join(",").trim()
          }
        } catch {
          // Keep the coordinate label — reverse geocoding is optional.
        }
        onResolved(label, { lat, lng })
        setLocating(false)
      },
      (geoError) => {
        setError(
          geoError.code === geoError.PERMISSION_DENIED
            ? "Location permission was blocked. You can type your address instead."
            : "Couldn't get your location. Type your address instead."
        )
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return { locating, error, detect }
}
