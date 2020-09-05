import { createEvent, createStore, combine } from 'effector'
import { setTokenFx } from './data'

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
export const $session = createStore(
  JSON.parse(localStorage.getItem('session') || 'null')
).on(sessionChanged, (_, payload) => {
  if (payload) localStorage.setItem('session', JSON.stringify(payload))
  else localStorage.removeItem('session')
  return payload
})
$session.watch(
  (state) => state?.token && setTokenFx(state.token) & console.log(state)
)

export const tokenChanged = createEvent()
export const $token = createStore(null).on(tokenChanged, (_, payload) => {
  localStorage.setItem('token', payload)
  return payload
})

export const isSuper = () => $session.getState()?.role === 'super'
export const isAdmin = () => isSuper() || $session.getState()?.role === 'admin'
export const isUser = () => !isGuest()
export const isGuest = () => $session.getState()?.role === 'guest'
