import { createStore, createEvent } from 'effector'

export const goToAttributeListChanged = createEvent()
export const $goToAttributeList = createStore(false).on(
  goToAttributeListChanged,
  (_, payload) => payload
)

export const goToPrintChanged = createEvent()
export const $goToPrint = createStore(false).on(
  goToPrintChanged,
  (_, payload) => payload
)

export const goToUserListChanged = createEvent()
export const $goToUserList = createStore(false).on(
  goToUserListChanged,
  (_, payload) => payload
)
