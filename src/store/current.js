import { createEvent, createStore, combine } from 'effector'
import { dataStores } from './data'
import {
  transformMultiPolygon,
  transformOne,
  getPolygonArea,
} from '../workers/utils'
import { $mapProjection } from './map-base'
import { $map } from './map'
import { LngLatBounds } from 'mapbox-gl'

export const propertyChanged = createEvent()
export const $property = createStore(null).on(propertyChanged, (_, payload) => {
  console.log(payload)
  return payload
})

export const userChanged = createEvent()
export const $user = createStore(null).on(userChanged, (_, payload) => payload)

export const $parent = createStore(null)
export const parentChanged = createEvent()

$parent.on(parentChanged, (_, payload) => {
  const map = $map?.getState()
  if (!map) return
  if (!payload) {
    map.setFilter('data-highlighted', ['in', 'parent_id'])
    map.setFilter('data-outline-highlighted', ['in', 'parent_id'])
    return payload
  }

  const coordinates = transformMultiPolygon(
    payload.geometry,
    'EPSG:3857',
    'EPSG:4326'
  )

  let bounds = coordinates
    .reduce((a, b) => b.concat(a), [])
    .reduce((a, b) => b.concat(a), [])
    .reduce(function (b, coord) {
      return b.extend(coord)
    }, new LngLatBounds(coordinates[0][0][0], coordinates[0][0][1]))

  map.fitBounds(bounds, {
    padding: 150,
  })

  map.setFilter('data-highlighted', ['in', 'parent_id', payload.id])
  map.setFilter('data-outline-highlighted', ['in', 'parent_id', payload.id])

  return payload
})

combine([$property, dataStores.$fetchParents]).watch(([property, parents]) => {
  parentChanged(parents?.data?.find((e) => e.label === property?.label))
})

export const $propertyFormatted = combine(
  $property,
  $parent,
  (property, parent) => {
    console.log('payload')

    if (!property) return null
    if (!parent) return null

    console.log('payload')

    const { data } = dataStores.$fetchAttributes.getState()
    if (!data) return null

    const [x, y] = transformOne(
      parent.pole,
      'EPSG:3857',
      $mapProjection.getState().id
    )

    return [
      {
        id: 'ID',
        text: property.title,
      },
      {
        id: 'Unité',
        text:
          (data.unit.items.find((e) => e.id === property.unitId) || {}).text ||
          '',
      },
      {
        id: 'Assiette',
        text: parent.label || '',
      },
      {
        id: 'Statut de possession',
        text: property.status,
      },
      {
        id: 'Règime',
        text: property.regime,
      },
      {
        id: 'Conservation foncière',
        text:
          (
            data.conservation.items.find(
              (e) => e.id === property.conservationId
            ) || {}
          ).text || '',
      },
      {
        id: 'Référence foncière',
        text: property.reference,
      },
      {
        id: 'Affectation',
        text:
          (data.assign.items.find((e) => e.id === property.assignId) || {})
            .text || '',
      },
      {
        id: 'Consistance',
        text:
          (data.nature.items.find((e) => e.id === property.natureId) || {})
            .text || '',
      },
      {
        id: 'Propriétaire',
        text:
          (data.owner.items.find((e) => e.id === property.ownerId) || {})
            .text || '',
      },
      {
        id: 'Superficie',
        text: Math.round((property.area + Number.EPSILON) * 100) / 100,
      },
      {
        id: 'V. Vénale',
        text: Math.round((property.venale + Number.EPSILON) * 100) / 100,
      },
      {
        id: 'V. Locative',
        text: Math.round((property.locative + Number.EPSILON) * 100) / 100,
      },
      { id: 'X/Y', text: x.toFixed(2) + '/' + y.toFixed(2) },
      { id: 'Addresse', text: property.address },
      { id: 'Note', text: property.note },
    ]
  }
)

export const $parentFormatted = combine(
  $mapProjection,
  $parent,
  (projection, parent) => {
    if (!parent) return null

    const multi = transformMultiPolygon(
      parent.geometry,
      'EPSG:3857',
      projection.id
    )

    return [
      {
        id: 'ID',
        text: parent.label,
      },
      {
        id: 'Propriétés',
        text: parent.length,
      },
      {
        id: 'Polygones',
        text: parent.geometry.length,
      },
      {
        id: 'Superficie Totale (M²)',
        text: parent.geometry
          .map((e) => getPolygonArea(e[0]))
          .reduce((a, b) => a + b)
          .toFixed(2),
      },
      {
        id: 'coordinates',
        text: multi
          .map((a) =>
            a[0].map((b) => b.map((x) => x.toFixed(2)).join(' ')).join('\n')
          )
          .join('\n0 0\n'),
      },
      {
        id: 'coordinates-text',
        text: multi.map((a) => a[0].map((b) => b.map((x) => x.toFixed(2)))),
      },
    ]
  }
)

// $property.watch(console.log)
// $parent.watch(console.log)
// $propertyFormatted.watch(console.log)
// $parentFormatted.watch(console.log)

export const propertyDocChanged = createEvent()
export const $propertyDoc = createStore(null).on(
  propertyDocChanged,
  (_, payload) => payload
)

export const parentDocChanged = createEvent()
export const $parentDoc = createStore(null).on(
  parentDocChanged,
  (_, payload) => payload
)

export const $propertyDocFormatted = combine(
  $propertyDoc,
  dataStores.$fetchAttributes,
  (doc, attributes) => {
    if (!doc) return null
    const { data } = attributes
    if (!data) return null

    const kb = doc.size / 1024
    const mb = doc.size / (1024 * 1024)

    return [
      {
        id: 'Nom',
        text: doc.name,
      },
      {
        id: 'Type',
        text:
          (data.doctype.items.find((e) => e.id === doc.docTypeId) || {}).text ||
          'Autre Type',
      },
      {
        id: 'Taille',
        text: mb > 1 ? mb.toFixed(2) + ' MB' : kb.toFixed(2) + ' KB',
      },
    ]
  }
)

export const $userFormatted = combine($user, (user) => {
  if (!user) return null

  return [
    {
      id: 'Nom',
      text: user.name,
    },
    {
      id: 'Role',
      text: user.role,
    },
    {
      id: 'Email/Login',
      text: user.email,
    },
  ]
})

export const $parentDocFormatted = combine(
  $parentDoc,
  dataStores.$fetchAttributes,
  (doc, attributes) => {
    if (!doc) return null
    const { data } = attributes
    if (!data) return null

    const kb = doc.size / 1024
    const mb = doc.size / (1024 * 1024)

    return [
      {
        id: 'Nom',
        text: doc.name,
      },
      {
        id: 'Type',
        text:
          (data.doctype.items.find((e) => e.id === doc.docTypeId) || {}).text ||
          '',
      },
      {
        id: 'Taille',
        text: mb > 1 ? mb.toFixed(2) + ' MB' : kb.toFixed(2) + ' KB',
      },
    ]
  }
)

export const attributeChanged = createEvent()
export const $attribute = createStore(null).on(
  attributeChanged,
  (_, payload) => payload
)

export const attributeElementChanged = createEvent()
export const $attributeElement = createStore(null).on(
  attributeChanged,
  (_, payload) => payload
)

dataStores['$fetchParents'].watch((parents) => {
  parentDocChanged(null)
  const { data, pending } = parents
  if (!data || pending) return

  // console.log(data.length)

  if (data.length === 1) {
    parentChanged(data[0])
    return
  }

  if (!$parent.getState()) return
  parentChanged(data.find((e) => e.id === $parent.getState().id))
})

dataStores['$fetchProperties'].watch((properties) => {
  propertyDocChanged(null)
  const { data, pending } = properties
  if (!data || pending) return

  if (data.length === 1) {
    propertyChanged(data[0])
    return
  }

  if (!$property.getState()) return
  propertyChanged(data.find((e) => e.id === $property.getState().id))
})

dataStores['$fetchParentDocuments'].watch((docs) => {
  const { data, pending } = docs
  if (!data || pending) return
  if (!$parentDoc.getState()) return

  parentDocChanged(data.find((e) => e.id === $parentDoc.getState().id))
})

dataStores['$fetchPropertyDocuments'].watch((docs) => {
  const { data, pending } = docs
  if (!data || pending) return
  if (!$propertyDoc.getState()) return

  propertyDocChanged(data.find((e) => e.id === $propertyDoc.getState().id))
})

dataStores['$fetchUsers'].watch((users) => {
  const { data, pending } = users
  if (!data || pending) return
  if (!$user.getState()) return

  userChanged(data.find((e) => e.id === $user.getState().id))
})
