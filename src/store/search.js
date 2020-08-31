import { createEvent, createStore, combine } from 'effector'
import { dataStores, fetchParentsFx, fetchPropertiesFx } from './data'
import { parentChanged, propertyChanged } from './current'

const searchNames = [
  'label',
  'status',
  'reference',
  'conservationIds',
  'unitId',
  'unitIds',
  'title',
  'assignIds',
  'natureIds',
  'ownerIds',
  'areaMin',
  'areaMax',
  'venaleMin',
  'venaleMax',
  'regime',
  'locativeMin',
  'locativeMax',
  'address',
  'note',
]

const searchEvents = {}
searchNames.forEach((name) => (searchEvents[name + 'Changed'] = createEvent()))

const searchStores = {}
searchNames.forEach((name) => {
  searchStores[name] = createStore(null).on(
    searchEvents[name + 'Changed'],
    (_, payload) => {
      parentChanged(null)
      propertyChanged(null)
      return payload
    }
  )
  // searchStores[name].watch(console.log)
})

const $searchCombinded = combine(searchStores)

$searchCombinded.watch(fetchPropertiesFx)
$searchCombinded.watch(console.log)

export const $isSearching = $searchCombinded.map((state) => {
  return (
    Object.values(state)
      // .filter((e) => ['label', 'reference', 'unitId', 'title'].includes(e))
      .findIndex((v) => v?.length || v > 0) > -1
  )
})

export const $isAdvancedSearching = $searchCombinded.map((state) => {
  return (
    Object.values(state)
      .filter((e) => ['label', 'reference', 'unitId', 'title'].includes(e))
      .findIndex((v) => v?.length || v > 0) > -1
  )
})

dataStores['$labels'].watch((data) => {
  // if (!data) return

  // const ids = Object.keys(data).map((id) => parseInt(id))

  // const filter = ['in', 'label', ...ids]
  // $map?.getState()?.setFilter('data', filter)

  fetchParentsFx({
    data,
    isSearching: $isSearching.getState(),
    label: $searchCombinded.getState().label,
  })
})

const xChanged = createEvent()
const $x = createStore(null).on(xChanged, (store, payload) => payload)

const yChanged = createEvent()
const $y = createStore(null).on(yChanged, (store, payload) => payload)

export {
  searchEvents,
  searchStores,
  $searchCombinded,
  xChanged,
  yChanged,
  $x,
  $y,
}
