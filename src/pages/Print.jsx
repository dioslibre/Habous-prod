import { h } from 'preact'
import { PrintActions } from './../print/Actions'
import Footer from './../print/Footer'
import { useEffect } from 'preact/hooks'
import Header from '../print/Header'
import Viewport from '../print/Viewport'
import { FullScreen, useFullScreenHandle } from 'react-full-screen'
import { Scale } from '../print/Scale'
import { DatePicker } from '../print/DatePicker'

/** @jsx h */

function PrintContent() {
  return (
    <div className="flex flex-col w-screen h-screen bg-white">
      <div className="mx-auto flex flex-row">
        <DatePicker />
        <Scale />
        <PrintActions />
      </div>
      <div
        id="print"
        style={{
          height: '20.9cm',
          width: '29.7cm',
          margin: 'auto',
        }}
        className="flex flex-col"
      >
        <Header />
        <Viewport />
        <Footer />
      </div>
    </div>
  )
}

function Print() {
  const handle = useFullScreenHandle()

  useEffect(() => {
    handle.enter()
    return handle.exit
  }, [])
  return (
    <FullScreen handle={handle}>
      <PrintContent />
    </FullScreen>
  )
}

export default Print
