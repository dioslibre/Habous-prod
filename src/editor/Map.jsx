import { h } from 'preact'

/** @jsx h */

import { useEffect, useRef } from 'preact/hooks'
import { divLoaded, $map } from '../store/map'
import { FlyBar } from '../components/controls/FlyBar'
import { ProjectionBar } from '../components/controls/ProjectionBar'
import { BaseLayerBar } from '../components/controls/BaseLayerBar'

function Map() {
  const ref = useRef()

  useEffect(() => {
    return () => $map.getState().remove()
  }, [])

  useEffect(() => {
    if (ref.current) setTimeout(() => divLoaded('map'))
  }, [ref])

  return (
    <div ref={ref} id="map" className="h-full relative">
      <FlyBar />
      <ProjectionBar />
      <BaseLayerBar />
    </div>
  )
}

export default Map
