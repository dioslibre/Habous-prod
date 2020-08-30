import { h } from 'preact'
// import { useCallback } from 'preact/hooks'
// import { memo } from 'preact/compat'

/** @jsx h */

import { searchStores, searchEvents } from '../store/search'
import { fetchAttributesFx, dataStores } from '../store/data'
import { useEffect } from 'preact/hooks'
import { memo } from 'preact/compat'
import { useStore } from 'effector-react'
import BXLoading from 'carbon-web-components/es/components-react/loading/loading'
import BXSearch from 'carbon-web-components/es/components-react/search/search'
import BXCombo from 'carbon-web-components/es/components-react/combo-box/combo-box'
import BXComboItem from 'carbon-web-components/es/components-react/combo-box/combo-box-item'
import SearchPlus from '../components/search/SearchPlus'
import BXButton from 'carbon-web-components/es/components-react/button/button'
import { goToAttributeListChanged } from '../store/navigate'

const SearchReference = () => {
  const data = useStore(searchStores.reference)

  return (
    <div className="m-2 w-56 shadow-lg">
      <BXSearch
        colorScheme={'light'}
        placeholder={'Référence foncière'}
        value={data}
        size={'sm'}
        onInput={(event) =>
          searchEvents['referenceChanged'](event.detail.value)
        }
      />
    </div>
  )
}

const SearchTitle = () => {
  const data = useStore(searchStores.title)

  return (
    <div className="m-2 w-40 shadow-lg">
      <BXSearch
        colorScheme={'light'}
        placeholder={'ID'}
        value={data}
        size={'sm'}
        onInput={(event) => searchEvents['titleChanged'](event.detail.value)}
      />
    </div>
  )
}

const SearchLabel = () => {
  const data = useStore(searchStores.label)

  return (
    <div className="m-2 w-40 shadow-lg">
      <BXSearch
        colorScheme={'light'}
        placeholder={'Assiette'}
        value={data}
        size={'sm'}
        onInput={(event) => searchEvents['labelChanged'](event.detail.value)}
      />
    </div>
  )
}

const SearchUnit = memo(({ units }) => {
  const value = useStore(searchStores.unitId)

  return (
    <div className="m-2 w-56 shadow-lg">
      <BXCombo
        colorScheme={'light'}
        trigger-content={'Unité'}
        size={'sm'}
        onSelect={(event) =>
          searchEvents['unitIdChanged'](event?.detail?.item?.value)
        }
        value={value}
      >
        {units.map((e) => (
          <BXComboItem key={e.id} value={e.id}>
            <div className="text-sm">{e.text}</div>
          </BXComboItem>
        ))}
      </BXCombo>
    </div>
  )
})

const Attributes = () => {
  return (
    // <div >
    <BXButton
      className="m-2 w-40 shadow-md"
      size={'sm'}
      onClick={() => goToAttributeListChanged(true)}
    >
      <div className="whitespace-no-wrap">Gestion des Attributs</div>
    </BXButton>
    // </div>
  )
}

export const Sidebar = () => {
  const { data } = useStore(dataStores.$fetchAttributes)

  useEffect(() => {
    if (!data?.unit) fetchAttributesFx()
  }, [])

  if (!data?.unit)
    return (
      <BXLoading
        className="mx-auto my-2 top-20 left-20"
        type="small"
        inactive={true}
      />
    )

  return (
    <div className="m-0 p-0 w-full flex flex-row overflow-y-visible">
      <SearchLabel />
      <SearchReference />
      <SearchUnit units={data.unit.items} />
      <SearchTitle />
      <SearchPlus />
      <Attributes />
    </div>
  )
}

export default Sidebar
