/* eslint-disable no-undef */
// Must be the first import
// import 'preact/debug'

// Or if you just want the devtools bridge (~240B) without other
// debug code (useful for production sites)
import 'preact/devtools'

import { h, render } from 'preact'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

/** @jsx h */

render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('root')
)

if (module.hot) {
  module.hot.accept()
}
