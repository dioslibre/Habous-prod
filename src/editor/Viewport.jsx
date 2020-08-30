import { h } from 'preact'
import Map from './Map'

/** @jsx h */

const Viewport = () => {
  return (
    <div className="flex-grow m-0 p-0">
      <Map />
    </div>
  )
}

export default Viewport
