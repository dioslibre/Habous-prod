import { h, Fragment } from 'preact'
import { useStore } from 'effector-react'
import { scaleChanged, $mapScale } from '../store/print'
import BXComboBox from 'carbon-web-components/es/components-react/combo-box/combo-box'
import BXComboBoxItem from 'carbon-web-components/es/components-react/combo-box/combo-box-item'

/** @jsx h */

export function Scale() {
  const scale = useStore($mapScale)
  const scales = [100, 200, 500, 1000, 2000, 5000, 10000, 20000]
  const labels = scales.map((e) => '1/' + e)
  return (
    <Fragment>
      <div className="mx-4 ml-16 my-auto">Echelle</div>
      <BXComboBox
        className="my-2 w-40"
        colorScheme={'light'}
        size="sm"
        trigger-content={'Echelle'}
        onSelect={(event) => scaleChanged(event?.detail?.item?.value)}
        value={scale}
      >
        {scales.map((e, index) => (
          <BXComboBoxItem key={index} value={e}>
            {labels[index]}
          </BXComboBoxItem>
        ))}
      </BXComboBox>
    </Fragment>
  )
}
