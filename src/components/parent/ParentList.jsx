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
import Add16 from '@carbon/icons-react/es/add/16'
import Download16 from '@carbon/icons-react/es/download/16'
import Upload16 from '@carbon/icons-react/es/upload/16'

/** @jsx h */

import { dataStores } from '../../store/data'
import { parentChanged } from '../../store/current'

const ParentListAction = () => {
  return (
    <div className="flex flex-row">
      <BXButton
        className="shadow-lg flex-grow"
        kind={'primary'}
        disabled={false}
        size={'sm'}
      >
        Assiette <Add16 slot="icon" />
      </BXButton>
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
      >
        Exporter <Download16 slot="icon" />
      </BXButton>
    </div>
  )
}

function ParentListNavigation() {
  const history = useHistory()
  const navigate = useCallback(() => history.push('/property-list'), [history])
  const { data, error, pending } = useStore(dataStores.$fetchParents)

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
        Propriétés
      </BXButton>
    </Fragment>
  )
}

const ParentItem = memo(({ index, row }) => {
  const history = useHistory()
  const navigate = useCallback(() => {
    parentChanged(row)
    history.push('/parent-info')
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
            ID {row.label}
          </p>
          <p className="text-black text-base">{row.length} Propriété(s)</p>
        </div>
      </BXButton>
    </div>
  )
})

const ParentListMain = ({ item }) => {
  const { data, error, pending } = useStore(dataStores.$fetchParents)

  if (error || data?.length === 0) return null

  if (!data || pending)
    return <BXLoading className="absolute top-20 left-20" type="regular" />

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

function ParentList() {
  return (
    <SidebarPanel
      header={'Assiettes'}
      navigation={<ParentListNavigation />}
      main={<ParentListMain item={ParentItem} />}
      action={<ParentListAction />}
    />
  )
}

export default ParentList
