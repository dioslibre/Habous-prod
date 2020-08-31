import { h, Fragment } from 'preact'
import { useCallback } from 'preact/hooks'
import BXButton from 'carbon-web-components/es/components-react/button/button'
import SidebarPanel from '../SidebarPanel'
import Close16 from '@carbon/icons-react/es/close/16'
import Checkmark16 from '@carbon/icons-react/es/checkmark/16'
import { useStore } from 'effector-react'
import AutoSizer from 'react-virtualized-auto-sizer'
import ArrowLeft16 from '@carbon/icons-react/es/arrow--left/16'
import BXInput from 'carbon-web-components/es/components-react/input/input'
import BXRadioButtonGroup from 'carbon-web-components/es/components-react/radio-button/radio-button-group'
import BXRadioButton from 'carbon-web-components/es/components-react/radio-button/radio-button'
import BXDropdown from 'carbon-web-components/es/components-react/dropdown/dropdown'
import BXTextarea from 'carbon-web-components/es/components-react/textarea/textarea'
import BXDropdownItem from 'carbon-web-components/es/components-react/dropdown/dropdown-item'
import BXNumberInput from 'carbon-web-components/es/components-react/number-input/number-input'
import { dataStores, fetchPropertiesFx, savePropertyFx } from '../../store/data'
import {
  newPropertyStores,
  newPropertyEvents,
  $newProperty,
} from '../../store/new'
import { useHistory } from 'react-router-dom'
import BXLoading from 'carbon-web-components/es/components-react/loading/loading'

/** @jsx h */

const PropertyNewAction = () => {
  const history = useHistory()
  const goBack = useCallback(() => history.goBack(), [history])
  const property = useStore($newProperty)
  const { pending } = useStore(dataStores.$saveProperty)

  const save = useCallback(async () => {
    await savePropertyFx(property)
    fetchPropertiesFx({ label: property.label })
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

function PropertyNewNavigation() {
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

const PropertyNewMain = () => {
  const { data } = useStore(dataStores.$fetchAttributes)

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

function PropertyNew() {
  return (
    <SidebarPanel
      header={'Nouvelle Propriété'}
      navigation={<PropertyNewNavigation />}
      main={<PropertyNewMain />}
      action={<PropertyNewAction />}
    />
  )
}

export default PropertyNew

function Reference() {
  const value = useStore(newPropertyStores.reference)
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
          onChange={(event) =>
            newPropertyEvents['referenceChanged'](event?.detail?.value)
          }
        />
      </div>
    </div>
  )
}

function Regime() {
  const value = useStore(newPropertyStores.regime)
  return (
    <div className="flex flex-col mt-3" key={'prop-regime'}>
      <div className="mx-4">Règime foncier</div>
      <BXRadioButtonGroup
        className="my-2 ml-4 flex flex-row flex-wrap items-center"
        orientation="horizontal"
        name={'regime'}
        value={value}
        onChange={(event) =>
          newPropertyEvents['regimeChanged'](event?.detail?.value)
        }
      >
        {['Titre foncier', 'Réquisition', 'Non immatriculé'].map((r) => (
          <BXRadioButton
            className="mr-3 mb-2"
            key={'p-new-' + r}
            value={r}
            labelText={r}
          />
        ))}
      </BXRadioButtonGroup>
    </div>
  )
}

function Status() {
  const value = useStore(newPropertyStores.status)
  return (
    <div className="flex flex-col mt-3">
      <div className="mx-4">Statut de possession</div>
      <BXRadioButtonGroup
        className="my-2 ml-4"
        orientation="horizontal"
        value={value}
        name="status"
        onChange={(event) =>
          newPropertyEvents['statusChanged'](event?.detail?.value)
        }
      >
        {['En possession', 'Vendue'].map((r) => (
          <BXRadioButton
            className="mr-3"
            key={'p-new-' + r}
            value={r}
            labelText={r}
          />
        ))}
      </BXRadioButtonGroup>
    </div>
  )
}

function AttributeCombo({ value, data }) {
  const attrib = useStore(newPropertyStores[value + 'Id'])
  return (
    <div className="flex mx-4 my-3 flex-row">
      <div className="mr-auto my-auto">{data[value].header}</div>
      <div className="shadow-md w-4/6">
        <BXDropdown
          colorScheme={'light'}
          trigger-content={data[value].header}
          size={'sm'}
          onSelect={(event) =>
            newPropertyEvents[value + 'IdChanged'](event?.detail?.item?.value)
          }
          value={attrib}
        >
          <BXDropdownItem>{data[value].header}</BXDropdownItem>
          {data[value].items.map((e) => (
            <BXDropdownItem key={e.id} value={e.id}>
              {e.text}
            </BXDropdownItem>
          ))}
        </BXDropdown>
      </div>
    </div>
  )
}

function Numbers({ header, id }) {
  const value = useStore(newPropertyStores[id])
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
            newPropertyEvents[id + 'Changed'](parseFloat(event.target.value))
          }
        />
      </div>
    </div>
  )
}

function Address() {
  const value = useStore(newPropertyStores.address)
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
            newPropertyEvents['addressChanged'](event.target.value)
          }
        ></BXTextarea>
      </div>
    </div>
  )
}

function Note() {
  const value = useStore(newPropertyStores.note)
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
            newPropertyEvents['noteChanged'](event.target.value)
          }
        ></BXTextarea>
      </div>
    </div>
  )
}

function Title() {
  const value = useStore(newPropertyStores.title)
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
            newPropertyEvents['titleChanged'](event.target.value)
          }
        ></BXInput>
      </div>
    </div>
  )
}
