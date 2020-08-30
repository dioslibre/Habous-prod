import { h } from 'preact'

/** @jsx h */

import { useEffect, useRef } from 'preact/hooks'
import { divLoaded, $map } from '../store/map'

function Map() {
  const ref = useRef()

  useEffect(() => {
    return () => $map.getState().remove()
  }, [])

  useEffect(() => {
    if (ref.current) setTimeout(() => divLoaded('map'))
  }, [ref])

  return <div ref={ref} id="map" className="h-full" />
}

export default Map
