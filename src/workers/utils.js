import proj4 from 'proj4'

proj4.defs(
  'EPSG:26191',
  '+proj=lcc +lat_1=33.3 +lat_0=33.3 +lon_0=-5.4 +k_0=0.999625769 +x_0=500000 +y_0=300000 +a=6378249.2 +b=6356515 +towgs84=31,146,47,0,0,0,0 +units=m +no_defs'
)
proj4.defs(
  'EPSG:26192',
  '+proj=lcc +lat_1=29.7 +lat_0=29.7 +lon_0=-5.4 +k_0=0.9996155960000001 +x_0=500000 +y_0=300000 +a=6378249.2 +b=6356515 +towgs84=31,146,47,0,0,0,0 +units=m +no_defs'
)

function getPolygonArea(vertices) {
  var total = 0

  for (var i = 0, l = vertices.length; i < l; i++) {
    var addX = vertices[i][0]
    var addY = vertices[i == vertices.length - 1 ? 0 : i + 1][1]
    var subX = vertices[i == vertices.length - 1 ? 0 : i + 1][0]
    var subY = vertices[i][1]

    total += addX * addY * 0.5
    total -= subX * subY * 0.5
  }

  return Math.abs(total)
}

const getCentroid = (pts) => {
  var first = pts[0],
    last = pts[pts.length - 1]
  if (first[0] != last[0] || first[1] != last[1]) pts.push(first)
  var twicearea = 0,
    x = 0,
    y = 0,
    nPts = pts.length,
    p1,
    p2,
    f
  for (var i = 0, j = nPts - 1; i < nPts; j = i++) {
    p1 = pts[i]
    p2 = pts[j]
    f = p1[0] * p2[1] - p2[0] * p1[1]
    twicearea += f
    x += (p1[0] + p2[0]) * f
    y += (p1[1] + p2[1]) * f
  }
  f = twicearea * 3
  return [x / f, y]
}

const getRotation = (point, projection) => {
  try {
    const A1 = proj4('EPSG:4326', 'EPSG:3857', [
        point.lng + 0.0005,
        point.lat + 0.0005,
      ]),
      A2 = [A1[0] + 10, A1[1] + 10],
      B1 = proj4('EPSG:3857', projection, A1),
      B2 = proj4('EPSG:3857', projection, A2)

    var dAx = A2[0] - A1[0]
    var dAy = A2[1] - A1[1]
    var dBx = B2[0] - B1[0]
    var dBy = B2[1] - B1[1]
    var angle = Math.atan2(dAx * dBy - dAy * dBx, dAx * dBx + dAy * dBy)
    if (angle < 0) {
      angle = angle * -1
    }
    var degree_angle = angle * (180 / Math.PI)
    return degree_angle
  } catch (err) {
    return 0
  }
}

const getZoomForResolution = (scale, dpi) => {
  const resolution = (scale * 2.45) / 100 / dpi
  return (
    Math.log(156543.03390625) * Math.LOG2E - Math.log(resolution) * Math.LOG2E
  )
}

function getPositions(point, h, projection, length, dpi) {
  const projected = proj4(projection, point)
  const resolution = (length * 10) / 100 / dpi

  const hmax = {
    value: Math.floor((projected[0] + h) / length) * length,
  }
  hmax.left = (hmax.value - projected[0]) / resolution
  const hmin = {
    value: hmax.value - length,
  }
  hmin.left = (hmin.value - projected[0]) / resolution

  const vmax = {
    value: Math.floor(projected[1] / length) * length,
  }
  vmax.left = (-vmax.value + projected[1]) / resolution
  const vmin = {
    value: vmax.value - length,
  }
  vmin.left = (-vmin.value + projected[1]) / resolution

  return {
    hmax,
    hmin,
    vmax,
    vmin,
  }
}

const transformMultiPolygon = (coords, from, to) => {
  const transformed = coords.map((a) =>
    a.map((e) =>
      e.map((v) => {
        return proj4(from, to, v)
      })
    )
  )
  return transformed
}

const transformArray = (a, from, to) => {
  return a.map((v) => proj4(from, to, v))
}

const transformOne = (v, from, to) => {
  return proj4(from, to, v)
}

const updateTiles = (map) => {
  map.getSource('data').tiles = [
    'http://localhost:7800/public.parents_fill/{z}/{x}/{y}.pbf?update=' +
      Math.random(),
  ]
  map.style.sourceCaches['data'].clearTiles()
  map.style.sourceCaches['data'].update(map.transform)

  map.getSource('data-centroid').tiles = [
    'http://localhost:7800/public.parents_pole/{z}/{x}/{y}.pbf?update=' +
      Math.random(),
  ]
  map.style.sourceCaches['data-centroid'].clearTiles()
  map.style.sourceCaches['data-centroid'].update(map.transform)

  map.triggerRepaint()
}

const setLayerSource = (map, layerId, source, sourceLayer) => {
  if (!map) return
  const oldLayers = map.getStyle().layers
  const layerIndex = oldLayers.findIndex((l) => l.id === layerId)
  const layerDef = oldLayers[layerIndex]
  const before = oldLayers[layerIndex + 1] && oldLayers[layerIndex + 1].id
  layerDef.source = source
  if (sourceLayer) {
    layerDef['source-layer'] = sourceLayer
  }
  map.removeLayer(layerId)
  map.addLayer(layerDef, before)
}

export {
  setLayerSource,
  getPolygonArea,
  updateTiles,
  getCentroid,
  getPositions,
  getRotation,
  transformOne,
  transformArray,
  transformMultiPolygon,
  getZoomForResolution,
}
