import { createEvent, createStore, combine } from 'effector'
import { transformOne } from '../workers/utils'

export const viewChanged = createEvent()
export const $mapView = createStore({ center: [-8.33, 32.56], zoom: 12 }).on(
  viewChanged,
  (_, payload) => payload
)

export const baseLayerChanged = createEvent()
export const $mapBaseLayer = createStore('Satellite').on(
  baseLayerChanged,
  (_, payload) => payload
)

export const $dpi = createStore(getScreenDPI())

function getScreenDPI() {
  const el = document.createElement('div')
  el.style = 'width: 1cm;'
  document.body.appendChild(el)
  const dpi = el.offsetWidth
  document.body.removeChild(el)

  return dpi
}

export const projectionChanged = createEvent()
export const $mapProjection = createStore({
  id: 'EPSG:26191',
  name: 'Nord',
  bounds: [
    [-13.24, 27.66], // Southwest coordinates
    [-1.01, 35.97], // Northeast coordinates
  ],
}).on(projectionChanged, (_, payload) => payload)

export const centerChanged = createEvent()
export const $centerProjected = createStore([0, 0]).on(
  centerChanged,
  (_, payload) => payload
)
combine([$mapView, $mapProjection]).watch(([view, projection]) => {
  centerChanged(transformOne(view.center, 'EPSG:4326', projection.id))
})

$centerProjected.watch(console.log)
