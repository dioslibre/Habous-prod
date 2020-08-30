import { h } from 'preact'
import Map from './Map'
import PrintInfo from './Info'

/** @jsx h */

export default function Viewport() {
  return (
    <div className="flex-grow flex flex-row mx-12">
      <PrintInfo />
      <Map />
    </div>
  )
}
