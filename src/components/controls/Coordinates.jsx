import { h } from 'preact'

/** @jsx h */

import { useStore } from 'effector-react'
import { $centerProjected } from '../../store/map-base'

export function Coordinates() {
  const center = useStore($centerProjected)

  if (!center?.length) return

  return (
    <div
      className="absolute ease-in left-48 shadow-md z-10 flex-row flex space-x-2"
      style={{ bottom: 10 }}
    >
      <div className="mapboxgl-ctrl mapboxgl-ctrl-scale">
        X {center[0].toFixed(2)}
      </div>
      <div className="mapboxgl-ctrl mapboxgl-ctrl-scale">
        Y {center[1].toFixed(2)}
      </div>
    </div>
  )
}
