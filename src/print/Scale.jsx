import { h, Fragment } from 'preact'
import { useStore } from 'effector-react'
import { scaleChanged, $mapScale } from '../store/print'
import BXDropdown from 'carbon-web-components/es/components-react/dropdown/dropdown'
import BXDropdownItem from 'carbon-web-components/es/components-react/dropdown/dropdown-item'

/** @jsx h */

export function Scale() {
  const scale = useStore($mapScale)
  const scales = [100, 200, 500, 1000, 2000, 5000, 10000, 20000]
  const labels = scales.map((e) => '1/' + e)
  return (
    <Fragment>
      <div className="mx-4 ml-16 my-auto">Echelle</div>
      <BXDropdown
        className="my-2 w-40"
        colorScheme={'light'}
        size="sm"
        trigger-content={'Echelle'}
        onSelect={(event) => scaleChanged(event?.detail?.item?.value)}
        value={scale}
      >
        <BXDropdownItem>Echelle</BXDropdownItem>
        {scales.map((e, index) => (
          <BXDropdownItem key={index} value={e}>
            {labels[index]}
          </BXDropdownItem>
        ))}
      </BXDropdown>
    </Fragment>
  )
}
