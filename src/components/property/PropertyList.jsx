import { h, Fragment } from 'preact'
import { useHistory } from 'react-router-dom'
import { useCallback } from 'preact/hooks'
import { useStore } from 'effector-react'
import { memo } from 'preact/compat'
import BXButton from 'carbon-web-components/es/components-react/button/button'
import BXLoading from 'carbon-web-components/es/components-react/loading/loading'
import SidebarPanel from '../SidebarPanel'
import CharacterPatterns16 from '@carbon/icons-react/es/character-patterns/16'
import VirtualScroll from '../../library/VirtualScroll'
import AutoSizer from 'react-virtualized-auto-sizer'
import Download16 from '@carbon/icons-react/es/download/16'
import Upload16 from '@carbon/icons-react/es/upload/16'

/** @jsx h */

import { dataStores } from '../../store/data'
import { propertyChanged } from '../../store/current'
import { goToPrintChanged } from '../../store/navigate'

const PropertyListAction = () => {
  return (
    <div className="flex flex-row">
      <BXButton
        className="shadow-lg flex-grow"
        kind={'danger'}
        disabled={false}
        size={'sm'}
      >
        Importer <Upload16 slot="icon" />
      </BXButton>
      <BXButton
        className="shadow-lg flex-grow"
        kind={'ghost'}
        disabled={false}
        size={'sm'}
        onClick={() => goToPrintChanged(true)}
      >
        Exporter <Download16 slot="icon" />
      </BXButton>
    </div>
  )
}

function PropertyListNavigation() {
  const history = useHistory()
  const navigate = useCallback(() => history.push('/parent-list'), [history])
  const { data, error, pending } = useStore(dataStores.$fetchProperties)

  if (error) return null

  return (
    <Fragment>
      <BXButton kind="ghost" className="w-20 bg-white" size="sm">
        {error ? null : !data || pending ? (
          <BXLoading className="left-5 absolute" type="small" />
        ) : (
          <div className="px-2 absolute text-blue-600 my-auto text-base">
            {data.length}
          </div>
        )}
      </BXButton>
      <BXButton
        className="bg-white border-l border-blue-600"
        kind="ghost"
        size="sm"
      >
        <CharacterPatterns16 />
      </BXButton>
      <BXButton
        className="bg-white border-l border-blue-600"
        kind="ghost"
        size="sm"
        onClick={navigate}
      >
        Assiettes
      </BXButton>
    </Fragment>
  )
}

const PropertyItem = memo(({ index, row }) => {
  const history = useHistory()
  const navigate = useCallback(() => {
    propertyChanged(row)
    history.push('/property-info')
  }, [history])

  const { data } = useStore(dataStores.$fetchAttributes)

  if (!data) return null

  return (
    <div className="w-full flex flex-row  p-2">
      <BXButton
        key={index}
        className="bg-white shadow border-r-2 border-blue-600 max-w-full flex-grow"
        kind="ghost"
        size="large"
        onClick={navigate}
      >
        <div>
          <p className="text-base text-black font-bold" mb-1>
            ID {row.title}
          </p>
          <p className="text-black text-base">
            Unité{' '}
            {(data.unit.items.find((e) => e.id === row.unitId) || {}).text ||
              '-'}
          </p>
        </div>
      </BXButton>
    </div>
  )
})

const PropertyListMain = ({ item }) => {
  const { data, error, pending } = useStore(dataStores.$fetchProperties)

  if (error || data?.length === 0) return null

  if (!data || pending)
    return <BXLoading className="absolute top-20 left-24" type="regular" />

  return (
    <AutoSizer>
      {({ height, width }) => {
        return (
          <VirtualScroll
            items={data}
            width={width}
            height={height}
            getChildHeight={useCallback(() => 76, [])}
            Item={item}
          />
        )
      }}
    </AutoSizer>
  )
}

function PropertyList() {
  return (
    <SidebarPanel
      header={'Propriétés'}
      navigation={<PropertyListNavigation />}
      main={<PropertyListMain item={PropertyItem} />}
      action={<PropertyListAction />}
    />
  )
}

export default PropertyList
