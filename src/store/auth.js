import { createEvent, createStore, combine } from 'effector'

export const emailChanged = createEvent()
export const $email = createStore('super').on(
  emailChanged,
  (_, payload) => payload
)

export const passwordChanged = createEvent()
export const $password = createStore('super').on(
  passwordChanged,
  (_, payload) => payload
)

export const sessionChanged = createEvent()
export const $session = createStore(localStorage.getItem('session') || null).on(
  sessionChanged,
  (_, payload) => payload
)

export const saveSessionChanged = createEvent()
export const $saveSession = createStore(
  localStorage.getItem('saveSession') || null
).on(saveSessionChanged, (_, payload) => {
  localStorage.setItem('saveSession', payload)
  return payload
})

combine($saveSession, $session).watch(([saveSession, session]) => {
  if (saveSession && session) localStorage.setItem('session', session)
})

export const tokenChanged = createEvent()
export const $token = createStore(localStorage.getItem('token' || null)).on(
  tokenChanged,
  (_, payload) => {
    localStorage.setItem('token', payload)
    return payload
  }
)
