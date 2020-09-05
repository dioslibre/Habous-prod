/* eslint-disable no-prototype-builtins */
import { createStore, createEffect } from 'effector'
import { wrap } from 'comlink'

const database = new Worker('../workers/database.js')
const db = wrap(database)

//#region attributes
export const fetchAttributesFx = createEffect({
  handler: db.fetchAttributes,
})
export const createAttributeFx = createEffect({
  handler: db.createAttribute,
})
createAttributeFx.done.watch(() => fetchAttributesFx())
export const editAttributeFx = createEffect({
  handler: db.editAttribute,
})
editAttributeFx.done.watch(() => fetchAttributesFx())
//#endregion

//#region property
export const fetchPropertiesFx = createEffect({
  handler: db.fetchProperties,
})

export const postPropertiesFx = createEffect({
  handler: db.postProperties,
})

export const savePropertyFx = createEffect({
  handler: db.saveProperty,
})
//#endregion

//#region parent
export const fetchParentsFx = createEffect({
  handler: db.fetchParents,
})

export const postParentsFx = createEffect({
  handler: db.postParents,
})

export const saveParentFx = createEffect({
  handler: db.saveParent,
})
//#endregion

//#region auth
export const fetchUserFx = createEffect({
  handler: db.fetchUser,
})
export const fetchUsersFx = createEffect({
  handler: db.fetchUsers,
})

export const registerUserFx = createEffect({
  handler: db.registerUser,
})

export const updateUserFx = createEffect({
  handler: db.updateUser,
})
//#endregion

export const getColorPaletteForAttributesFx = createEffect({
  handler: db.getColorPaletteForAttributes,
})
//#endregion

//#region documents
export const fetchPropertyDocumentsFx = createEffect({
  handler: (id) => db.fetchDocuments({ model: 'child', id }),
})
export const fetchParentDocumentsFx = createEffect({
  handler: (id) => db.fetchDocuments({ model: 'parent', id }),
})
export const patchDocumentFx = createEffect({
  handler: db.patchDocument,
})
//#endregion

export const setTokenFx = createEffect({
  handler: db.setToken,
})

export const events = {
  fetchAttributesFx,
  fetchPropertiesFx,
  fetchPropertyDocumentsFx,
  fetchParentDocumentsFx,
  fetchParentsFx,
  editAttributeFx,
  createAttributeFx,
  setTokenFx,
  savePropertyFx,
  saveParentFx,
  updateUserFx,
  registerUserFx,
  patchDocumentFx,
  fetchUsersFx,
  fetchUserFx,
  getColorPaletteForAttributesFx,
}

export const dataStores = {}
for (const key in events) {
  if (events.hasOwnProperty(key)) {
    const event = events[key]
    const store = createStore({ data: null, error: false, pending: false })

    store.on(event.pending, (s, pending) => {
      // console.log(`${key} is pending?: ${pending ? 'yes' : 'no'}`)
      return { ...s, pending }
    })

    store.on(event.done, (s, { result }) => {
      // console.log(`${key} is done`)
      if (
        !((key.includes('Attributes') || key.includes('Properties')) && !result)
      ) {
        return { s, data: result }
      }
      setTimeout(event, 500)
      return s
    })

    store.on(event.fail, (s) => {
      // console.log(`${key} failed'`)
      return { ...s, error: true }
    })

    const name = '$' + key.substr(0, key.length - 2)
    dataStores[name] = store
  }
}

dataStores['$labels'] = createStore(null).on(
  fetchPropertiesFx.doneData,
  (state, payload) => {
    if (!payload?.length) return {}

    const groups = payload.reduce((r, a) => {
      r[a.label] = [...(r[a.label] || []), a]
      return r
    }, {})

    const data = {}
    Object.keys(groups).forEach((key) => {
      data[key] = groups[key].length
    })

    console.log(data)

    return data
  }
)
