import { h } from 'preact'

/** @jsx h */

import { useState, useCallback, useRef, useEffect } from 'preact/hooks'
import BXButton from 'carbon-web-components/es/components-react/button/button'
import Location20 from '@carbon/icons-react/es/location/20'
import { useStore } from 'effector-react'
import { $x, xChanged, $y, yChanged } from '../../store/search'
import BXInput from 'carbon-web-components/es/components-react/input/input'
import { $map } from '../../store/map'
import { $mapProjection } from '../../store/map-base'
import { transformOne } from '../../workers/utils'
import ArrowRight16 from '@carbon/icons-react/es/arrow--right/16'

export function FlyBar() {
  const [width, setWidth] = useState(50)
  const [id, setId] = useState()

  const open = useCallback(() => {
    if (id) {
      clearTimeout(id)
      setId()
    } else setWidth(460)
  }, [id])

  const close = useCallback(() => {
    setId(setTimeout(() => setWidth(50) & setId(), 5000))
  }, [])

  return (
    <div
      onMouseLeave={close}
      onMouseEnter={open}
      className="absolute bg-white ease-in top-2 left-2 shadow-md z-10 flex flex-row"
      style={{ width, transition: 'width 100ms ease-out' }}
    >
      <BXButton kind={'ghost'} onClick={() => setWidth(50)}>
        <Location20 slot="icon" />
      </BXButton>
      {width > 50 ? <X /> : null}
      {width > 50 ? <Y /> : null}
      {width > 50 ? <Go /> : null}
    </div>
  )
}

const X = () => {
  const x = useStore($x)
  const ref = useRef()

  useEffect(() => {
    if (!ref?.current) return
    let input = ref.current.shadowRoot.querySelector('.bx--text-input')
    input.focus()
  }, [ref])

  return (
    <BXInput
      ref={ref}
      className="-mt-1 mx-2"
      type="number"
      value={x}
      colorScheme={'light'}
      size="sm"
      placeholder="X"
      onInput={(event) => xChanged(event.target.value)}
    ></BXInput>
  )
}

const Y = () => {
  const y = useStore($y)
  return (
    <BXInput
      className="-mt-1 mx-2"
      type="number"
      value={y}
      colorScheme={'light'}
      size="sm"
      placeholder="Y"
      onInput={(event) => yChanged(event.target.value)}
    ></BXInput>
  )
}

const Go = () => {
  const x = useStore($x)
  const y = useStore($y)
  const map = useStore($map)
  const projection = useStore($mapProjection)

  const go = useCallback(async () => {
    if (!x || !y) return
    console.log(x, y)
    let coordinates = await transformOne(
      [parseFloat(x), parseFloat(y)],
      projection.id,
      'EPSG:4326'
    )

    const bbox = [
      [coordinates[0] - 0.001, coordinates[1] - 0.001],
      [coordinates[0] + 0.001, coordinates[1] + 0.001],
    ]

    map.fitBounds(bbox)
  }, [map, x, y, projection])

  return (
    <BXButton className="float-right" kind={'ghost'} onClick={go}>
      <ArrowRight16 slot="icon" />
    </BXButton>
  )
}
