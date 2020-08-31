import { createStore, createEvent } from 'effector'
import style from './style'
import { Map, ScaleControl } from 'mapbox-gl'
import { viewChanged, $mapView, $mapProjection, $dpi } from './map-base'
import { searchEvents } from './search'

export const divLoaded = createEvent()
const cursorChanged = createEvent()
const hoveredChanged = createEvent()

export const $mapLoaded = createStore(null).on(
  viewChanged,
  (store, payload) => payload
)

export const $hovered = createStore(null).on(
  hoveredChanged,
  (store, payload) => {
    const map = $map.getState()
    if (!map) return
    if (store && store === payload) return store
    if (store && store !== payload) {
      map.setFeatureState(
        {
          source: 'data',
          sourceLayer: 'public.parents_fill',
          id: store,
        },
        { hover: false }
      )
    }
    if (payload)
      map.setFeatureState(
        {
          source: 'data',
          sourceLayer: 'public.parents_fill',
          id: payload,
        },
        { hover: true }
      )
    return payload
  }
)

export const $mapCursor = createStore(null).on(
  cursorChanged,
  (store, payload) => {
    const coordinates = payload.lngLat.wrap()
    return [coordinates.lng, coordinates.lat]
  }
)

const onMouseMove = (e) => e.features[0] && hoveredChanged(e.features[0].id)
const onMouseLeave = () => hoveredChanged()
const onMouseClick = (e, map) => {
  const bbox = [
    [e.point.x - 5, e.point.y - 5],
    [e.point.x + 5, e.point.y + 5],
  ]
  const features = map.queryRenderedFeatures(bbox, {
    layers: ['data'],
  })

  if (!features.length) {
    // map.setFilter('data-highlighted', ['in', 'parent_id'])
    // map.setFilter('data-outline-highlighted', ['in', 'parent_id'])
    searchEvents.labelChanged(null)
    return
  }

  // const filter = [features[0]].reduce(
  //   function (memo, feature) {
  //     memo.push(feature.properties.parent_id)
  //     return memo
  //   },
  //   ['in', 'parent_id']
  // )

  // map.setFilter('data-highlighted', filter)
  // map.setFilter('data-outline-highlighted', filter)

  searchEvents.labelChanged(features[0].properties.label)
}

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
  })

  const scale = new ScaleControl({
    maxWidth: $dpi.getState() * 4,
    unit: 'metric',
  })

  map.addControl(scale)

  map.on('mousemove', cursorChanged)

  map.on('load', () => {
    map.on('mousemove', 'data', onMouseMove)
    map.on('mouseleave', 'data', onMouseLeave)
    map.on('click', ((map) => (e) => onMouseClick(e, map))(map))
    // viewChanged(true) // lost a lot hours over this shit
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
