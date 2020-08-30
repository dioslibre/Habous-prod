import { createEvent, createStore, combine } from 'effector'
import { $propertyDoc, $parent, $property, $parentDoc, $user } from './current'
import { transformMultiPolygon } from '../workers/utils'
import { $mapProjection } from './map-base'

const editPropertyNames = [
  'id',
  'reference',
  'regime',
  'status',
  'unitId',
  'conservationId',
  'title',
  'assignId',
  'natureId',
  'ownerId',
  'area',
  'venale',
  'locative',
  'address',
  'note',
]

const editPropertyEvents = {}
editPropertyNames.forEach(
  (name) => (editPropertyEvents[name + 'Changed'] = createEvent())
)

const editPropertyStores = {}
editPropertyNames.forEach((name) => {
  editPropertyStores[name] = createStore(null).on(
    editPropertyEvents[name + 'Changed'],
    (_, payload) => payload
  )
  // editPropertyStores[name].watch(console.log)
})

const $editProperty = combine(editPropertyStores)

// $editProperty.watch(console.log)

const editParentNames = ['id', 'label', 'geometry']

const editParentEvents = {}
editParentNames.forEach(
  (name) => (editParentEvents[name + 'Changed'] = createEvent())
)

const editParentStores = {}
editParentNames.forEach((name) => {
  editParentStores[name] = createStore(null).on(
    editParentEvents[name + 'Changed'],
    (_, payload) => payload
  )
  // editParentStores[name].watch(console.log)
})

const $editParent = combine(editParentStores)
// $editParent.watch(console.log)

const editUserNames = ['id', 'name', 'role', 'email', 'password']

const editUserEvents = {}
editUserNames.forEach(
  (name) => (editUserEvents[name + 'Changed'] = createEvent())
)

const editUserStores = {}
editUserNames.forEach((name) => {
  editUserStores[name] = createStore(null).on(
    editUserEvents[name + 'Changed'],
    (_, payload) => payload
  )
  // editUserStores[name].watch(console.log)
})

const $editUser = combine(editUserStores)
// $editParent.watch(console.log)

const editDocumentNames = ['id', 'name', 'docTypeId', 'ownerId']

const editDocumentEvents = {}
editDocumentNames.forEach(
  (name) => (editDocumentEvents[name + 'Changed'] = createEvent())
)

const editDocumentStores = {}
editDocumentNames.forEach((name) => {
  editDocumentStores[name] = createStore(null).on(
    editDocumentEvents[name + 'Changed'],
    (_, payload) => payload
  )
  // editDocumentStores[name].watch(console.log)
})

const $editDocument = combine(editDocumentStores)

// $editDocument.watch(console.log)

$property.watch(
  (state) =>
    state &&
    editPropertyNames.forEach((name) =>
      editPropertyEvents[name + 'Changed'](state[name])
    )
)

combine($parent, $mapProjection).watch(([state, projection]) => {
  if (!state) return
  editParentEvents.labelChanged(state.label)
  editParentEvents.idChanged(state.id)
  const coords = transformMultiPolygon(
    state.geometry,
    'EPSG:3857',
    projection.id
  )
    .map((a) =>
      a[0].map((b) => b.map((x) => x.toFixed(2)).join(' ')).join('\n')
    )
    .join('\n0 0\n')
  editParentEvents.geometryChanged(coords)
})

$user.watch(
  (state) =>
    state &&
    editUserNames.forEach((name) =>
      editUserEvents[name + 'Changed'](state[name])
    )
)

$propertyDoc.watch(
  (state) =>
    state &&
    editDocumentNames.forEach((name) =>
      editDocumentEvents[name + 'Changed'](state[name])
    )
)

$parentDoc.watch(
  (state) =>
    state &&
    editDocumentNames.forEach((name) =>
      editDocumentEvents[name + 'Changed'](state[name])
    )
)

export {
  $editUser,
  editUserEvents,
  editUserStores,
  $editParent,
  $editProperty,
  $editDocument,
  editDocumentEvents,
  editDocumentStores,
  editParentStores,
  editPropertyStores,
  editParentEvents,
  editPropertyEvents,
}
