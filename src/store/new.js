/* eslint-disable no-prototype-builtins */
import { createEvent, createStore, combine } from 'effector'

const newPropertyNames = [
  'id',
  'reference',
  'regime',
  'status',
  'unitId',
  'conservationId',
  'title',
  'label',
  'assignId',
  'natureId',
  'ownerId',
  'area',
  'venale',
  'locative',
  'address',
  'note',
]

const newPropertyEvents = {}
newPropertyNames.forEach(
  (name) => (newPropertyEvents[name + 'Changed'] = createEvent())
)

const newPropertyStores = {}
newPropertyNames.forEach((name) => {
  newPropertyStores[name] = createStore(null).on(
    newPropertyEvents[name + 'Changed'],
    (_, payload) => payload
  )
  newPropertyStores[name].watch(console.log)
})

const $newProperty = combine(newPropertyStores)

// $newProperty.watch(console.log)

const newParentNames = ['id', 'label', 'geometry']

const newParentEvents = {}
newParentNames.forEach(
  (name) => (newParentEvents[name + 'Changed'] = createEvent())
)

const newParentStores = {}
newParentNames.forEach((name) => {
  newParentStores[name] = createStore(null).on(
    newParentEvents[name + 'Changed'],
    (_, payload) => payload
  )
  // newParentStores[name].watch(console.log)
})

const $newParent = combine(newParentStores)
// $newParent.watch(console.log)

const newUserNames = ['id', 'name', 'role', 'email', 'password']

const newUserEvents = {}
newUserNames.forEach(
  (name) => (newUserEvents[name + 'Changed'] = createEvent())
)

const newUserStores = {}
newUserNames.forEach((name) => {
  newUserStores[name] = createStore(null).on(
    newUserEvents[name + 'Changed'],
    (_, payload) => payload
  )
  newUserStores[name].watch(console.log)
})

const $newUser = combine(newUserStores)

const resetNewProperty = () => {
  for (const key in newPropertyStores) {
    if (newPropertyStores.hasOwnProperty(key)) {
      const e = newPropertyStores[key]
      e.reset()
    }
  }
}

const resetNewParent = () => {
  for (const key in newParentStores) {
    if (newParentStores.hasOwnProperty(key)) {
      const e = newParentStores[key]
      e.reset()
    }
  }
}

const resetNewUser = () => {
  for (const key in newUserStores) {
    if (newUserStores.hasOwnProperty(key)) {
      const e = newUserStores[key]
      e.reset()
    }
  }
}

export {
  $newUser,
  newUserEvents,
  newUserStores,
  $newParent,
  $newProperty,
  newParentStores,
  newPropertyStores,
  newParentEvents,
  newPropertyEvents,
  resetNewParent,
  resetNewUser,
  resetNewProperty,
}
