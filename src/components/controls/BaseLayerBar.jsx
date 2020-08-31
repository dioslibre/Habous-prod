import { h } from 'preact'

/** @jsx h */

import { useState, useCallback } from 'preact/hooks'
import BXButton from 'carbon-web-components/es/components-react/button/button'
import Shuffle20 from '@carbon/icons-react/es/shuffle/20'
export function BaseLayerBar() {
  const [width, setWidth] = useState(50)
  const [id, setId] = useState()

  const open = useCallback(() => {
    if (id) {
      clearTimeout(id)
      setId()
    } else setWidth(400)
  }, [id])

  const close = useCallback(() => {
    setId(setTimeout(() => setWidth(50) & setId(), 1000))
  }, [])

  return (
    <div
      onMouseLeave={close}
      onMouseEnter={open}
      className="absolute bg-white ease-in bottom-2 right-2 shadow-md z-10"
      style={{ width, transition: 'width 100ms ease-out' }}
    >
      <BXButton kind={'ghost'} onClick={() => setWidth(50)}>
        <Shuffle20 />
      </BXButton>
    </div>
  )
}
