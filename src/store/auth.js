import { createEvent, createStore } from 'effector'

export const loginChanged = createEvent()
export const $login = createStore(null).on(
  loginChanged,
  (_, payload) => payload
)

export const passwordChanged = createEvent()
export const $password = createStore(null).on(
  passwordChanged,
  (_, payload) => payload
)

export const tokenChanged = createEvent()
export const $token = createStore(localStorage.getItem('token' || null)).on(
  tokenChanged,
  (_, payload) => {
    localStorage.setItem('token', payload)
    return payload
  }
)
