import { h } from 'preact'

/** @jsx h */

import { useEffect, useRef, useState } from 'preact/hooks'
import { divLoaded, $map, $mapPositions } from '../store/print'
import AutoSizer from 'react-virtualized-auto-sizer'
import { Axis } from '../library/Axis'
import { useStore } from 'effector-react'

const MapContainer = () => {
  const [loaded, setLoaded] = useState()
  const positions = useStore($mapPositions)

  useEffect(() => setLoaded(true), [])

  return (
    <div className="flex-grow">
      <Map />
      {loaded ? (
        <AutoSizer>
          {({ height, width }) => {
            return (
              <div className="h-full relative">
                <LeftAxis positions={positions.left} height={height} />
                <TopAxis positions={positions.top} width={width} />
              </div>
            )
          }}
        </AutoSizer>
      ) : null}
    </div>
  )
}

export default MapContainer

const Map = () => {
  const ref = useRef()

  useEffect(() => {
    return () => $map.getState().remove()
  }, [])

  useEffect(() => {
    if (ref.current) setTimeout(() => divLoaded('print-map'))
  }, [ref])

  return (
    <div
      ref={ref}
      id="print-map"
      style={{
        position: 'absolute',
        left: 60,
        top: 48,
        right: 0,
        bottom: 0,
      }}
    />
  )
}

const LeftAxis = ({ height, positions }) => {
  if (!positions) return null
  return (
    <div className="absolute top-12 left-0">
      <Axis
        position="left"
        format="d"
        max={positions[1]}
        min={positions[0]}
        width="60"
        height={height - 50}
      />
    </div>
  )
}

const TopAxis = ({ width, positions }) => {
  if (!positions) return null
  return (
    <div className="absolute" style={{ left: 60 }}>
      <Axis
        position="top"
        format="d"
        max={positions[1]}
        min={positions[0]}
        width={width - 60}
        height="48"
      />
    </div>
  )
}
