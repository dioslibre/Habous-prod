import { h, Fragment } from 'preact'
import { useHistory } from 'react-router-dom'
import { useCallback, useState } from 'preact/hooks'
import { goToPrintChanged } from '../store/navigate'
import BXButton from 'carbon-web-components/es/components-react/button/button'
import Close16 from '@carbon/icons-react/es/close/16'
import Printer16 from '@carbon/icons-react/es/printer/16'
import { useStore } from 'effector-react'
import { $property } from '../store/current'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import BXLoading from 'carbon-web-components/es/components-react/loading/loading'

/** @jsx h */

export function PrintActions() {
  const history = useHistory()
  const navigate = useCallback(
    () => goToPrintChanged(false) & history.push('/editor/property-info'),
    [history]
  )
  const [done, setDone] = useState(true)
  const [closing, setClosing] = useState(false)
  const property = useStore($property)

  const print = useCallback(() => {
    setDone(false)
    setTimeout(() => {
      // eslint-disable-next-line no-undef
      html2canvas(document.getElementById('print')).then((canvas) => {
        const pdf = new jsPDF('l', 'mm', 'a4')
        var imgData = canvas.toDataURL('image/jpg')
        let pdfWidth = pdf.internal.pageSize.getWidth()
        let pdfHeight = pdf.internal.pageSize.getHeight()
        pdf.addImage(imgData, 'jpg', 0, 0, pdfWidth, pdfHeight)
        let name = `U${property.unitId}/${property.title}`
        pdf.save(name + '.pdf')
        setDone(true)
      })
    }, 500)
  }, [property])
  return (
    <Fragment>
      <BXButton
        className="bg-white w-40 h-4 mt-2 ml-16"
        kind={'secondary'}
        size={'sm'}
        onClick={() => setClosing(true) & navigate()}
      >
        <Fragment>
          {!closing ? (
            <div className="p-0">Fermer</div>
          ) : (
            <BXLoading className="m-0 p-0" type="small" />
          )}
          <Close16 slot="icon" />
        </Fragment>
      </BXButton>
      <BXButton
        onClick={print}
        className="w-40 h-4 mt-2"
        disabled={!done}
        size={'sm'}
      >
        <Fragment>
          {done ? (
            <div className="p-0">Imprimer</div>
          ) : (
            <BXLoading className="m-0 p-0" type="small" />
          )}
          <Printer16 slot="icon" />
        </Fragment>
      </BXButton>
    </Fragment>
  )
}
