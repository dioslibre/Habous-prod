import { createStore, createEvent, combine } from 'effector'
import style from './style'
import { Map, ScaleControl } from 'mapbox-gl'
import { getZoomForResolution, transformOne } from '../workers/utils'
import { viewChanged, $dpi, $mapView, $mapProjection } from './map-base'
import { $property, $parent } from './current'

export const divLoaded = createEvent()

export const $mapLoaded = createStore(null).on(
  viewChanged,
  (store, payload) => payload
)

export const dateChanged = createEvent()
export const $date = createStore(new Date().toLocaleDateString()).on(
  dateChanged,
  (store, payload) => payload
)

export const scaleChanged = createEvent()
export const $mapScale = createStore(1000).on(
  scaleChanged,
  (store, payload) => payload
)

export const positionsChanged = createEvent()
export const $mapPositions = createStore({}).on(
  positionsChanged,
  (store, payload) => payload
)

export const $map = createStore(null).on(divLoaded, (_, id) => {
  const map = new Map({
    accessToken:
      'pk.eyJ1Ijoic25pcHIiLCJhIjoiY2pnd3B1Z2xkMGVzbzJ3b2JpdHA3MTgwbSJ9.zyxsmob18-mVbSBsnHUBqw',
    container: id,
    style,
    center: $mapView.getState().center,
    zoom: $mapView.getState().zoom,
    preserveDrawingBuffer: true,
    maxBounds: $mapProjection.getState().bounds,
    scrollZoom: false,
  })

  const scale = new ScaleControl({
    maxWidth: $dpi.getState() * 4,
    unit: 'metric',
  })

  map.addControl(scale)

  map.on('load', () => {
    map.setFilter('data-highlighted', [
      'in',
      'parent_id',
      $parent.getState().id,
    ])
    map.setFilter('data-outline-highlighted', [
      'in',
      'parent_id',
      $parent.getState().id,
    ])
  })

  map.on('dragend', () => {
    map.resize()
    viewChanged({ center: map.getCenter(), zoom: map.getZoom() })
  })

  map.on('zoomend', () => {
    map.resize()
    viewChanged({ center: map.getCenter(), zoom: map.getZoom() })
  })

  return map
})

combine([$map, $mapScale, $dpi]).watch(([map, scale, dpi]) => {
  if (!map) return
  const z = getZoomForResolution(scale, dpi)
  map.setZoom(z)
})

combine([$map, $mapProjection]).watch(([map, projection]) => {
  if (!map) return
  console.log('here')
  const px = map.getContainer().clientWidth
  const py = map.getContainer().clientHeight
  const tr = map.unproject([px, 0])
  const bl = map.unproject([0, py])

  const topright = transformOne([tr.lng, tr.lat], 'EPSG:4326', projection.id)
  const bottomleft = transformOne([bl.lng, bl.lat], 'EPSG:4326', projection.id)

  // const angle = getRotation(view.center, projection.id)
  // console.log(angle)
  // map.rotateTo(angle)

  positionsChanged({
    left: [bottomleft[1], topright[1]].map(Math.floor),
    top: [bottomleft[0], topright[0]].map(Math.floor),
  })
})
