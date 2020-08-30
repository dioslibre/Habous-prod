import { h, Fragment } from 'preact'
import { useHistory } from 'react-router-dom'
import { useCallback, useEffect } from 'preact/hooks'
import BXButton from 'carbon-web-components/es/components-react/button/button'
import SidebarPanel from '../SidebarPanel'
import { useStore } from 'effector-react'
import { $propertyDoc } from '../../store/current'
import {
  editDocumentStores,
  editDocumentEvents,
  $editDocument,
} from '../../store/edit'
import AutoSizer from 'react-virtualized-auto-sizer'
import ArrowLeft16 from '@carbon/icons-react/es/arrow--left/16'
import BXComboBox from 'carbon-web-components/es/components-react/combo-box/combo-box'
import BXComboBoxItem from 'carbon-web-components/es/components-react/combo-box/combo-box-item'
import {
  dataStores,
  patchDocumentFx,
  fetchPropertyDocumentsFx,
} from '../../store/data'
import BXTextarea from 'carbon-web-components/es/components-react/textarea/textarea'
import BXLoading from 'carbon-web-components/es/components-react/loading/loading'
import Checkmark16 from '@carbon/icons-react/es/checkmark/16'
import Close16 from '@carbon/icons-react/es/close/16'

/** @jsx h */

const PropertyDocEditAction = () => {
  const history = useHistory()
  const goBack = useCallback(() => history.goBack(), [history])

  const docEdit = useStore($editDocument)
  const { pending, data } = useStore(dataStores.$patchDocument)

  console.log(data)

  const save = useCallback(async () => {
    await patchDocumentFx({ model: 'child', data: docEdit })
    fetchPropertyDocumentsFx(docEdit.ownerId)
    history.goBack()
  }, [docEdit, history])

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-row">
        <BXButton
          className="shadow-lg flex-grow"
          kind={'ghost'}
          disabled={false}
          size={'sm'}
          onClick={goBack}
        >
          Annuler <Close16 slot="icon" />
        </BXButton>
        <BXButton
          className="shadow-lg flex-grow"
          kind={'primary'}
          disabled={false}
          size={'sm'}
          onClick={save}
        >
          {pending ? (
            <BXLoading className="left-5 absolute" type="small" />
          ) : (
            <Fragment>
              Enregistrer <Checkmark16 slot="icon" />
            </Fragment>
          )}
        </BXButton>
      </div>
    </div>
  )
}

function PropertyDocEditNavigation() {
  const history = useHistory()
  const goBack = useCallback(() => history.goBack(), [history])

  return (
    <Fragment>
      <BXButton
        className="bg-white border-l border-blue-600"
        kind="ghost"
        size="sm"
        onClick={goBack}
      >
        <ArrowLeft16 />
      </BXButton>
    </Fragment>
  )
}

const PropertyDocEditMain = () => {
  const history = useHistory()
  const { data } = useStore(dataStores.$fetchAttributes)
  const doc = useStore($propertyDoc)

  useEffect(() => doc || history.push('/parent-info'), [doc])

  return (
    <div className="p-4 bx-scrollable overflow-auto h-full w-full">
      <AutoSizer>
        {({ height, width }) => {
          return (
            <div style={{ maxHeight: height, width: width }}>
              <img
                className="mx-auto my-auto"
                src={
                  doc.src ||
                  `https://placehold.co/300?text=${doc.name.split('.').pop()}`
                }
                width={300}
                height={300}
                alt=""
              />

              <Title />
              <AttributeCombo value={'doctype'} data={data} />
            </div>
          )
        }}
      </AutoSizer>
    </div>
  )
}

function AttributeCombo({ value, data }) {
  const attrib = useStore(editDocumentStores['docTypeId'])
  return (
    <div className="flex mx-4 my-4 flex-col">
      <div className="mr-auto mb-2">Type</div>
      <div className="shadow-md w-full">
        <BXComboBox
          colorScheme={'light'}
          trigger-content={data[value].header}
          size={'sm'}
          onSelect={(event) =>
            console.log(event) &
            editDocumentEvents['docTypeIdChanged'](
              parseInt(event?.detail?.item?.id || 0)
            )
          }
          value={attrib}
        >
          {data[value].items.map((e) => (
            <BXComboBoxItem id={e.id} key={e.id} value={e.id}>
              {e.text}
            </BXComboBoxItem>
          ))}
        </BXComboBox>
      </div>
    </div>
  )
}

function Title() {
  const value = useStore(editDocumentStores.name)
  return (
    <div className="flex mx-4 my-4 flex-col">
      <div className="mr-auto">Nom</div>
      <div className="shadow-md w-full p-0 m-0">
        <BXTextarea
          rows={2}
          value={value}
          colorScheme={'light'}
          size="sm"
          placeholder="Nom"
          onInput={(event) =>
            editDocumentEvents['nameChanged'](event.target.value)
          }
        ></BXTextarea>
      </div>
    </div>
  )
}

function PropertyDocEdit() {
  return (
    <SidebarPanel
      header={'Edition | Document | Propriété'}
      navigation={<PropertyDocEditNavigation />}
      main={<PropertyDocEditMain />}
      action={<PropertyDocEditAction />}
    />
  )
}

export default PropertyDocEdit
