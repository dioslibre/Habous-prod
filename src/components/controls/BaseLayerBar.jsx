import { h } from 'preact'

/** @jsx h */

import { useState, useCallback } from 'preact/hooks'
import BXButton from 'carbon-web-components/es/components-react/button/button'
import Shuffle20 from '@carbon/icons-react/es/shuffle/20'
import { useStore } from 'effector-react'
import { $mapBaseLayer, baseLayerChanged } from '../../store/map-base'

export function BaseLayerBar() {
  const baseLayer = useStore($mapBaseLayer)
  const [width, setWidth] = useState(50)
  const [id, setId] = useState()

  const open = useCallback(() => {
    if (id) {
      clearTimeout(id)
      setId()
    } else setWidth(300)
  }, [id])

  const close = useCallback(() => {
    setId(setTimeout(() => setWidth(50) & setId(), 1000))
  }, [])

  return (
    <div
      onMouseLeave={close}
      onMouseEnter={open}
      className="absolute bg-white ease-in bottom-2 right-2 shadow-md z-10 flex-row flex"
      style={{ width, transition: 'width 100ms ease-out' }}
    >
      <BXButton onClick={() => setWidth(50)}>
        <Shuffle20 slot="icon" />
      </BXButton>
      {width > 50 ? (
        <BXButton
          kind={baseLayer === 'Satellite' ? 'primary' : 'ghost'}
          onClick={() => baseLayerChanged('Satellite')}
        >
          Satellite
        </BXButton>
      ) : null}
      {width > 50 ? (
        <BXButton
          kind={baseLayer === 'Carte' ? 'primary' : 'ghost'}
          onClick={() => baseLayerChanged('Carte')}
        >
          Carte
        </BXButton>
      ) : null}
      {width > 50 ? (
        <BXButton
          kind={baseLayer === 'Hybride' ? 'primary' : 'ghost'}
          onClick={() => baseLayerChanged('Hybride')}
        >
          Hybride
        </BXButton>
      ) : null}
    </div>
  )
}
