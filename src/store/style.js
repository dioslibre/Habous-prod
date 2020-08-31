export default {
  version: 8,
  glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
  sources: {
    Carte: {
      type: 'raster',
      tiles: ['http://mt0.google.com/vt/lyrs=r&hl=fr&x={x}&y={y}&z={z}'],
      tileSize: 256,
    },
    Hybride: {
      type: 'raster',
      tiles: ['http://mt0.google.com/vt/lyrs=y&hl=fr&x={x}&y={y}&z={z}'],
      tileSize: 256,
    },
    Satellite: {
      type: 'raster',
      tiles: ['http://mt3.google.com/vt/lyrs=s&hl=fr&x={x}&y={y}&z={z}'],
      tileSize: 256,
    },
    data: {
      type: 'vector',
      tiles: ['http://localhost:7800/public.parents_fill/{z}/{x}/{y}.pbf'],
      tileSize: 512,
    },
    'data-centroid': {
      type: 'vector',
      tiles: ['http://localhost:7800/public.parents_pole/{z}/{x}/{y}.pbf'],
      tileSize: 512,
    },
  },
  layers: [
    {
      id: 'google',
      type: 'raster',
      source: 'Satellite',
      minzoom: 0,
      maxzoom: 24,
    },
    {
      id: 'data',
      type: 'fill',
      source: 'data',
      'source-layer': 'public.parents_fill',
      paint: {
        'fill-color': '#0f62fe',
        'fill-opacity': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          0.6,
          0.1,
        ],
      },
    },
    {
      id: 'data-highlighted',
      type: 'fill',
      source: 'data',
      'source-layer': 'public.parents_fill',
      paint: {
        'fill-color': '#da1e28',
        'fill-opacity': 0.4,
      },
      filter: ['in', 'parent_id', ''],
    },
    {
      id: 'data-outline',
      type: 'line',
      source: 'data',
      'source-layer': 'public.parents_fill',
      paint: {
        'line-color': '#0f62fe',
        'line-width': 1,
      },
    },
    {
      id: 'data-outline-highlighted',
      type: 'line',
      source: 'data',
      'source-layer': 'public.parents_fill',
      paint: {
        'line-color': '#da1e28',
        'line-width': 3,
      },
      filter: ['in', 'parent_id', ''],
    },
    {
      id: 'data-label',
      type: 'symbol',
      maxzoom: 24,
      minzoom: 15,
      source: 'data-centroid',
      'source-layer': 'public.parents_pole',
      layout: {
        'text-field': [
          'format',
          ['get', 'label'],
          {
            'font-scale': 1.3,
            'font-weight': 'bold',
          },
        ],
        'text-size': 14,
        'symbol-placement': 'point',
        'text-padding': 5,
      },
      paint: {
        'text-color': 'rgba(0,0,0,1)',
        'text-halo-color': 'rgba(200,200,200,1)',
        'text-halo-width': 1,
        'text-halo-blur': 1,
      },
    },
  ],
}
