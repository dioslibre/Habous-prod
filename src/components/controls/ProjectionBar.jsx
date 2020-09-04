import { h } from 'preact'

/** @jsx h */

import { useState, useCallback } from 'preact/hooks'
import BXButton from 'carbon-web-components/es/components-react/button/button'
import Map20 from '@carbon/icons-react/es/map/20'
import { useStore } from 'effector-react'
import { $mapProjection, projectionChanged } from '../../store/map-base'

export const South = {
  id: 'EPSG:26192',
  name: 'Sud',
  bounds: [
    [-13.1, 27.67],
    [-3.5, 31.5],
  ],
}

export const North = {
  id: 'EPSG:26191',
  name: 'Nord',
  bounds: [
    [-9.75, 31.5],
    [-1.01, 35.97], // Northeast coordinates
  ],
}

export function ProjectionBar() {
  const projection = useStore($mapProjection)
  const [width, setWidth] = useState(50)
  const [id, setId] = useState()

  const open = useCallback(() => {
    if (id) {
      clearTimeout(id)
      setId()
    } else setWidth(200)
  }, [id])

  const close = useCallback(() => {
    setId(setTimeout(() => setWidth(50) & setId(), 1000))
  }, [])

  return (
    <div
      onMouseLeave={close}
      onMouseEnter={open}
      className="absolute bg-white ease-in top-2 right-2 shadow-md z-10 flex flex-row"
      style={{ width, transition: 'width 100ms ease-out' }}
    >
      <BXButton onClick={() => setWidth(50)}>
        <Map20 slot="icon" />
      </BXButton>
      {width > 50 ? (
        <BXButton
          kind={projection.name === 'Sud' ? 'ghost' : 'primary'}
          onClick={() => projectionChanged(North)}
        >
          Nord
        </BXButton>
      ) : null}
      {width > 50 ? (
        <BXButton
          kind={projection.name === 'Nord' ? 'ghost' : 'primary'}
          onClick={() => projectionChanged(South)}
        >
          Sud
        </BXButton>
      ) : null}
    </div>
  )
}
