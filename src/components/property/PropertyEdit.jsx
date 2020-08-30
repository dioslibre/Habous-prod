import { h, Fragment } from 'preact'
import { useCallback, useEffect } from 'preact/hooks'
import BXButton from 'carbon-web-components/es/components-react/button/button'
import SidebarPanel from '../SidebarPanel'
import Close16 from '@carbon/icons-react/es/close/16'
import Checkmark16 from '@carbon/icons-react/es/checkmark/16'
import { useStore } from 'effector-react'
import { $propertyFormatted } from '../../store/current'
import AutoSizer from 'react-virtualized-auto-sizer'
import ArrowLeft16 from '@carbon/icons-react/es/arrow--left/16'
import BXInput from 'carbon-web-components/es/components-react/input/input'
import BXRadioButtonGroup from 'carbon-web-components/es/components-react/radio-button/radio-button-group'
import BXRadioButton from 'carbon-web-components/es/components-react/radio-button/radio-button'
import BXComboBox from 'carbon-web-components/es/components-react/combo-box/combo-box'
import BXTextarea from 'carbon-web-components/es/components-react/textarea/textarea'
import BXComboBoxItem from 'carbon-web-components/es/components-react/combo-box/combo-box-item'
import BXLoading from 'carbon-web-components/es/components-react/loading/loading'
import BXNumberInput from 'carbon-web-components/es/components-react/number-input/number-input'
import { dataStores, savePropertyFx } from '../../store/data'
import {
  editPropertyStores,
  editPropertyEvents,
  $editProperty,
} from '../../store/edit'
import { useHistory } from 'react-router-dom'
import { searchEvents } from '../../store/search'

/** @jsx h */

const PropertyEditAction = () => {
  const history = useHistory()
  const goBack = useCallback(() => history.goBack(), [history])
  const property = useStore($editProperty)
  const { pending } = useStore(dataStores.$saveProperty)

  const save = useCallback(async () => {
    await savePropertyFx(property)
    searchEvents.labelChanged('')
    searchEvents.labelChanged(parent.label)
    history.goBack()
  }, [property, history])

  return (
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
        kind={'danger'}
        disabled={pending}
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
  )
}

function PropertyEditNavigation() {
  const history = useHistory()
  const goBack = useCallback(() => history.goBack(), [history])
  const property = useStore($propertyFormatted)

  useEffect(() => property || history.push('/'), [])

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

const PropertyEditMain = () => {
  const { data } = useStore(dataStores.$fetchAttributes)
  const property = useStore($propertyFormatted)

  if (!property) return null

  return (
    <div className="p-2 bx-scrollable overflow-auto h-full w-full">
      <AutoSizer>
        {({ height, width }) => {
          return (
            <div style={{ maxHeight: height, width: width }}>
              <AttributeCombo value={'unit'} data={data} />
              <Title />
              <Reference />
              <Regime />
              <Status />
              {['conservation', 'assign', 'nature', 'owner'].map((key) => (
                <AttributeCombo key={key} value={key} data={data} />
              ))}
              {[
                { id: 'area', header: 'Superficie' },
                { id: 'venale', header: 'V. Vénale' },
                { id: 'locative', header: 'V. Locative' },
              ].map(({ id, header }) => (
                <Numbers key={id} id={id} header={header} />
              ))}
              <Address />
              <Note />
            </div>
          )
        }}
      </AutoSizer>
    </div>
  )
}

function PropertyEdit() {
  return (
    <SidebarPanel
      header={'Edition | Propriété'}
      navigation={<PropertyEditNavigation />}
      main={<PropertyEditMain />}
      action={<PropertyEditAction />}
    />
  )
}

export default PropertyEdit

function Reference() {
  const value = useStore(editPropertyStores.reference)
  return (
    <div className="flex flex-row mx-4 my-3">
      <div className="mr-auto mt-4 my-auto whitespace-wrap">
        Référence foncière
      </div>
      <div className="shadow-md p-0 my-auto w-4/5">
        <BXInput
          value={value}
          colorScheme={'light'}
          size="sm"
          placeholder="Référence foncière"
        />
      </div>
    </div>
  )
}

function Regime() {
  const value = useStore(editPropertyStores.regime)
  return (
    <div className="flex flex-col mt-3" key={'prop-regime'}>
      <div className="mx-4">Règime foncier</div>
      <BXRadioButtonGroup
        className="my-2 ml-4 flex flex-row flex-wrap items-center"
        orientation="horizontal"
        name={'regime'}
        value={value}
        onChange={(event) =>
          editPropertyEvents['regimeChanged'](event?.detail?.value)
        }
      >
        {['Titre foncier', 'Réquisition', 'Non immatriculé'].map((r) => (
          <BXRadioButton
            className="mr-3 mb-2"
            key={'p-edit-' + r}
            value={r}
            labelText={r}
          />
        ))}
      </BXRadioButtonGroup>
    </div>
  )
}

function Status() {
  const value = useStore(editPropertyStores.status)
  return (
    <div className="flex flex-col mt-3">
      <div className="mx-4">Statut de possession</div>
      <BXRadioButtonGroup
        className="my-2 ml-4"
        orientation="horizontal"
        value={value}
        name="status"
        onChange={(event) =>
          editPropertyEvents['statusChanged'](event?.detail?.value)
        }
      >
        {['En possession', 'Vendue'].map((r) => (
          <BXRadioButton
            className="mr-3"
            key={'p-edit-' + r}
            value={r}
            labelText={r}
          />
        ))}
      </BXRadioButtonGroup>
    </div>
  )
}

function AttributeCombo({ value, data }) {
  const attrib = useStore(editPropertyStores[value + 'Id'])
  return (
    <div className="flex mx-4 my-3 flex-row">
      <div className="mr-auto my-auto">{data[value].header}</div>
      <div className="shadow-md w-4/6">
        <BXComboBox
          colorScheme={'light'}
          trigger-content={data[value].header}
          size={'sm'}
          onSelect={(event) =>
            editPropertyEvents[value + 'IdChanged'](event?.detail?.item?.id)
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

function Numbers({ header, id }) {
  const value = useStore(editPropertyStores[id])
  return (
    <div className="flex mx-4 my-3 flex-row" key={id}>
      <div className="mt-4 mr-auto">{header}</div>
      <div className="shadow-md w-4/6">
        <BXNumberInput
          size="sm"
          allowEmpty={true}
          hideLabel={true}
          placeholder={header}
          colorScheme={'light'}
          value={(value && Math.floor(value * 100) / 100.0) || ''}
          onInput={(event) =>
            editPropertyEvents[id + 'Changed'](parseFloat(event.target.value))
          }
        />
      </div>
    </div>
  )
}

function Address() {
  const value = useStore(editPropertyStores.address)
  return (
    <div className="mx-4">
      <div className="mt-4">Addresse</div>
      <div className="shadow-md">
        <BXTextarea
          rows={2}
          value={value}
          colorScheme={'light'}
          size="sm"
          placeholder="Adresse"
          onInput={(event) =>
            editPropertyEvents['addressChanged'](event.target.value)
          }
        ></BXTextarea>
      </div>
    </div>
  )
}

function Note() {
  const value = useStore(editPropertyStores.note)
  return (
    <div className="mx-4">
      <div className="mt-4">Note</div>
      <div className="mb-4 shadow-md">
        <BXTextarea
          rows={2}
          value={value}
          colorScheme={'light'}
          size="sm"
          placeholder="Note"
          onInput={(event) =>
            editPropertyEvents['noteChanged'](event.target.value)
          }
        ></BXTextarea>
      </div>
    </div>
  )
}

function Title() {
  const value = useStore(editPropertyStores.title)
  return (
    <div className="flex mx-4 my-3 flex-row">
      <div className="mr-auto mt-4 my-auto">ID</div>
      <div className="shadow-md w-4/6">
        <BXInput
          value={value}
          colorScheme={'light'}
          size="sm"
          placeholder="ID"
          onInput={(event) =>
            editPropertyEvents['titleChanged'](event.target.value)
          }
        ></BXInput>
      </div>
    </div>
  )
}
