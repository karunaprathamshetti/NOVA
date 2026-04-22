"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import createGlobe from "cobe"

interface LiveMarker {
  id: string
  location: [number, number]
}

interface GlobeLiveProps {
  markers?: LiveMarker[]
  className?: string
  speed?: number
}

const defaultMarkers: LiveMarker[] = [
  { id: "sf", location: [37.78, -122.44] },
  { id: "london", location: [51.51, -0.13] },
  { id: "tokyo", location: [35.68, 139.65] },
  { id: "paris", location: [48.86, 2.35] },
  { id: "sydney", location: [-33.87, 151.21] },
  { id: "nyc", location: [40.71, -74.01] },
  { id: "mumbai", location: [19.07, 72.87] },
  { id: "dubai", location: [25.20, 55.27] },
]

export function GlobeLive({
  markers = defaultMarkers,
  className = "",
  speed = 0.003,
}: GlobeLiveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const isPausedRef = useRef(false)
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY }
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing"
    isPausedRef.current = true
  }, [])

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
    }
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = "grab"
    isPausedRef.current = false
  }, [])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        }
      }
    }
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [handlePointerUp])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    let globe: ReturnType<typeof createGlobe> | null = null
    let animationId: number
    let phi = 0

    function init() {
      const width = canvas.offsetWidth
      if (width === 0 || globe) return

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width, 
        height: width,
        phi: 0, 
        theta: 0.2, 
        dark: 1, 
        diffuse: 1.5,
        mapSamples: 16000, 
        mapBrightness: 6,
        baseColor: [0.1, 0.08, 0.09], 
        markerColor: [0.75, 0.48, 0.45], 
        glowColor: [0.2, 0.15, 0.16], 
        markerElevation: 0.01,
        markers: markers.map((m) => ({ location: m.location, size: 0.02, id: m.id })),
        arcs: [], 
        arcColor: [0.75, 0.48, 0.45],
        arcWidth: 0.5, 
        arcHeight: 0.25, 
        opacity: 0.7,
      })

      function animate() {
        if (!isPausedRef.current) phi += speed
        if (globe) {
          globe.update({
            phi: phi + phiOffsetRef.current + dragOffset.current.phi,
            theta: 0.2 + thetaOffsetRef.current + dragOffset.current.theta,
          })
        }
        animationId = requestAnimationFrame(animate)
      }
      animate()
      setTimeout(() => canvas && (canvas.style.opacity = "1"))
    }

    if (canvas.offsetWidth > 0) {
      init()
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro.disconnect()
          init()
        }
      })
      ro.observe(canvas)
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      if (globe) globe.destroy()
    }
  }, [markers, speed])

  return (
    <div className={`relative aspect-square select-none ${className}`}>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          width: "100%", height: "100%", cursor: "grab", opacity: 0,
          transition: "opacity 1.2s ease", borderRadius: "50%", touchAction: "none",
        }}
      />
    </div>
  )
}
