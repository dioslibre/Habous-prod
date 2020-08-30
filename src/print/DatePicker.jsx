import { h, Fragment } from 'preact'
import { useStore } from 'effector-react'
import { $date, dateChanged } from '../store/print'
import BXInput from 'carbon-web-components/es/components-react/input/input'

/** @jsx h */

export function DatePicker() {
  const date = useStore($date)

  return (
    <Fragment>
      <div className="mx-4 my-auto">Date</div>
      <BXInput
        className="-mt-1 w-40"
        value={date}
        colorScheme={'light'}
        size="sm"
        placeholder="Note"
        onInput={(event) => dateChanged(event.target.value)}
      />
    </Fragment>
  )
}
