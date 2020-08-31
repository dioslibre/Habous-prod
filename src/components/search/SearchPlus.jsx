import { h } from 'preact'
// import { useCallback } from 'preact/hooks'
import BXRadioButtonGroup from 'carbon-web-components/es/components-react/radio-button/radio-button-group'
import BXInput from 'carbon-web-components/es/components-react/input/input'
import BXNumberInput from 'carbon-web-components/es/components-react/number-input/number-input'
import BXButton from 'carbon-web-components/es/components-react/button/button'
import { useStore } from 'effector-react'
import {
  searchStores,
  searchEvents,
  $isAdvancedSearching,
} from '../../store/search'
import { dataStores } from '../../store/data'
import BXMultiSelect from 'carbon-web-components/es/components-react/multi-select/multi-select'
import BXCheckbox from 'carbon-web-components/es/components-react/checkbox/checkbox'
import BXMultiSelectItem from 'carbon-web-components/es/components-react/multi-select/multi-select-item'
import { useState, useCallback } from 'preact/hooks'

/** @jsx h */

const SearchPlus = () => {
  const { data } = useStore(dataStores.$fetchAttributes)
  const searching = useStore($isAdvancedSearching)
  const [isOpen, setOpen] = useState(false)
  const [id, setId] = useState()

  const open = useCallback(() => {
    if (id) {
      clearTimeout(id)
      setId()
    } else setOpen(true)
  }, [id])

  const close = useCallback(() => {
    setId(setTimeout(() => setOpen(false) & setId(), 300))
  }, [])

  return (
    <div className="relative ml-4 mr-auto">
      <BXButton
        className="m-2 w-40 shadow-md"
        kind={searching ? 'danger' : undefined}
        size="sm"
        onMouseLeave={close}
        onMouseEnter={open}
      >
        <div className="mx-auto whitespace-no-wrap">Recherche Avancée</div>
      </BXButton>
      <div
        style={{ transition: 'height 100ms ease-out' }}
        className={`absolute flex-grow ${
          isOpen ? 'h-96' : 'h-0'
        } py-2 bg-transparent flex-col flex w-80 z-20 right-0`}
        onMouseEnter={open}
        onMouseLeave={close}
      >
        <div
          className={`${
            isOpen ? 'p-2' : 'p-0'
          } bg-white right-0 bx-scrollable shadow-lg overflow-y-auto`}
        >
          <AttributeMulti value={'unit'} data={data} />
          <Regime />
          <Status />
          {['conservation', 'assign', 'nature', 'owner'].map((key) => (
            <AttributeMulti key={key} value={key} data={data} />
          ))}
          {[
            { id: 'area', header: 'Superficie' },
            { id: 'venale', header: 'Valeur Vénale' },
            { id: 'locative', header: 'Valeur Locative' },
          ].map(({ id, header }) => (
            <Numbers key={id} id={id} header={header} />
          ))}
          <Addresse />
          <Note />
        </div>
      </div>
    </div>
  )
}

const Status = () => {
  const status = useStore(searchStores.status) || {}
  return (
    <div className="flex flex-col mt-3">
      <div className="mx-2">Statut de possession</div>
      <div className="my-2 ml-4" orientation="horizontal" value={status}>
        {['En possession', 'Vendue'].map((r) => (
          <BXCheckbox
            className="mr-4"
            key={r}
            labelText={r}
            onChange={(event) => {
              const newStatus = { ...status }
              newStatus[r] = event.target.checked
              searchEvents.statusChanged(newStatus)
            }}
            id={r}
            value={status[r]}
          />
        ))}
      </div>
    </div>
  )
}

const AttributeMulti = ({ value, data }) => {
  const attrib = useStore(searchStores[value + 'Ids']) || []
  return (
    <div className="shadow-md mx-2 my-3">
      <BXMultiSelect
        colorScheme={'light'}
        trigger-content={data[value].header + 's'}
        size={'sm'}
        onSelect={(event) => {
          const element = event.detail.item
          const v = parseInt(element.value)
          const index = attrib.indexOf(v)
          const newAttrib = [...attrib]
          if (index > -1) {
            newAttrib.splice(index, 1)
          } else {
            newAttrib.push(v)
          }
          searchEvents[value + 'IdsChanged'](newAttrib)
        }}
        value={attrib?.join(',') || ''}
      >
        {data[value].items.map((e) => (
          <BXMultiSelectItem key={e.id} value={e.id + ''}>
            {e.text}
          </BXMultiSelectItem>
        ))}
      </BXMultiSelect>
    </div>
  )
}

const Numbers = ({ id, header }) => {
  return (
    <div className="mx-2">
      <div className="mt-4 w-1/2">{header}</div>
      <div className="flex flex-row" key={id}>
        <div className="shadow-md flex-grow">
          <NumbersMin id={id} />
        </div>
        <div className="w-4"></div>
        <div className="shadow-md flex-grow">
          <NumbersMax id={id} />
        </div>
      </div>
    </div>
  )
}

export default SearchPlus

const Regime = () => {
  const regime = useStore(searchStores.regime) || {}
  return (
    <div className="flex flex-col mt-3" key={'prop-regime'}>
      <div className="mx-2">Règime foncier</div>
      <BXRadioButtonGroup
        className="my-2 ml-4 flex flex-row flex-wrap items-center"
        orientation="horizontal"
        value={regime}
      >
        {['Titre foncier', 'Réquisition', 'Non immatriculé'].map((r) => (
          <BXCheckbox
            className="mr-4"
            key={r}
            labelText={r}
            onChange={(event) => {
              const newRegime = { ...regime }
              newRegime[r] = event.target.checked
              searchEvents.regimeChanged(newRegime)
            }}
            id={r}
            value={regime[r]}
          />
        ))}
      </BXRadioButtonGroup>
    </div>
  )
}

const Note = () => {
  const note = useStore(searchStores.note)
  return (
    <div className="mx-2">
      <div className="mt-4">Note</div>
      <div className="mb-4 shadow-md">
        <BXInput
          value={note}
          colorScheme={'light'}
          size="sm"
          placeholder="Note"
          onInput={(event) => searchEvents['noteChanged'](event.target.value)}
        />
      </div>
    </div>
  )
}

const Addresse = () => {
  const address = useStore(searchStores.address)
  return (
    <div className="mx-2">
      <div className="mt-4">Addresse</div>
      <div className="shadow-md">
        <BXInput
          value={address}
          colorScheme={'light'}
          size="sm"
          placeholder="Adresse"
          onInput={(event) =>
            searchEvents['addressChanged'](event.target.value)
          }
        ></BXInput>
      </div>
    </div>
  )
}

function NumbersMax({ id }) {
  const value = useStore(searchStores[id + 'Max'])
  return (
    <BXInput
      type="number"
      size="sm"
      allowEmpty={true}
      hideLabel={true}
      placeholder={'Max'}
      colorScheme={'light'}
      value={value}
      onInput={(event) =>
        searchEvents[id + 'MaxChanged'](
          (event?.target?.value && parseFloat(event?.target?.value)) ||
            event?.target?.value
        )
      }
    />
  )
}

function NumbersMin({ id }) {
  const value = useStore(searchStores[id + 'Min'])
  return (
    <BXInput
      type="number"
      size="sm"
      allowEmpty={true}
      hideLabel={true}
      placeholder={'Min'}
      colorScheme={'light'}
      value={value}
      onInput={(event) =>
        searchEvents[id + 'MinChanged'](
          (event?.target?.value && parseFloat(event?.target?.value)) ||
            event?.target?.value
        )
      }
    />
  )
}
