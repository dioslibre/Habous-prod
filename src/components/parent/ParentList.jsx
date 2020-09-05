import { h, Fragment } from 'preact'
import { useHistory } from 'react-router-dom'
import { useCallback, useState, useEffect } from 'preact/hooks'
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

import { dataStores, postParentsFx } from '../../store/data'
import { parentChanged } from '../../store/current'
import { resetNewParent } from '../../store/new'
import { $mapProjection } from '../../store/map-base'
import { $dat, forwardDatFile } from '../../store/upload'
import { $isSearching } from '../../store/search'
import { saveDat, transformMultiPolygon } from '../../workers/utils'
import { toast } from 'react-toastify'

const ParentListAction = () => {
  const history = useHistory()
  const navigate = useCallback((path) => history.push(path), [history])
  const [exporting, setExporting] = useState()
  const [importing, setImporting] = useState()
  const props = useStore(dataStores.$fetchProperties)
  const parents = useStore(dataStores.$fetchParents)
  const projection = useStore($mapProjection)
  const dat = useStore($dat)
  const isSearching = useStore($isSearching)

  useEffect(() => {
    document
      .getElementById('read-file')
      .addEventListener('change', forwardDatFile)
    return () =>
      document
        .getElementById('read-file')
        .removeEventListener('change', forwardDatFile)
  }, [])

  useEffect(() => {
    if (!dat) return
    if (!dat?.name?.toLowerCase().endsWith('txt')) return
    setTimeout(() => inSave(), 300)
  }, [dat])

  const exSave = useCallback(async () => {
    const data = parents.data.map((e) => {
      return {
        ...e,
        projected: transformMultiPolygon(
          e.geometry,
          'EPSG:3857',
          projection.id
        ),
      }
    })
    saveDat(data)
    setExporting(false)
  }, [parents, projection])

  const inSave = useCallback(() => {
    setImporting(true)

    const reader = new FileReader()

    reader.onload = async () => {
      try {
        const lines = reader.result.split('\n')
        let row = { geometry: [[[]]] },
          rows = []
        let count = 0,
          step = 1

        for (let index = 0; index < lines.length; index++) {
          const line = lines[index]
          if (step === 1) {
            row.label = line
            step++
            continue
          } else if (step === 2) {
            count = parseInt(line)
            step++
            continue
          }

          row.geometry[0][0].push(line.split(' ').map((e) => parseFloat(e)))
          count--

          if (!count) {
            rows.push({
              ...row,
              geometry: transformMultiPolygon(
                row.geometry,
                projection.id,
                'EPSG:3857'
              ),
            })
            row = { geometry: [[[]]] }
            step = 1
          }
        }

        const unique = rows.filter(
          (r) => !parents.data.find((e) => e.label === r.label)
        )
        await postParentsFx(unique)
        toast(`${unique.length} Assiette(s) importée(s)`, {
          type: 'info',
          position: 'bottom-left',
          autoClose: 1000,
        })
        setImporting(false)
      } catch (err) {
        toast(`Erreur`, {
          position: 'bottom-left',
          type: 'error',
          autoClose: 1000,
        })
        console.log(err)
        setImporting(false)
      }
    }

    reader.readAsText(dat)
  }, [dat, props, projection])

  return (
    <div className="flex flex-row">
      <BXButton
        className="shadow-lg flex-grow"
        kind={'primary'}
        size={'sm'}
        onClick={() => resetNewParent() & navigate('/parent-new')}
      >
        Assiette <Add16 slot="icon" />
      </BXButton>
      {isSearching ? null : (
        <BXButton
          className="shadow-lg flex-grow"
          kind={'danger'}
          disabled={importing}
          size={'sm'}
          onClick={() => document.getElementById('read-file').click()}
        >
          {!importing ? (
            <div className="p-0">Importer</div>
          ) : (
            <BXLoading className="m-0 p-0" type="small" />
          )}
          <Upload16 slot="icon" />
        </BXButton>
      )}
      <BXButton
        className="shadow-lg flex-grow"
        kind={'ghost'}
        disabled={exporting}
        size={'sm'}
        onClick={() => setExporting(true) & setTimeout(exSave, 100)}
      >
        {!exporting ? (
          <div className="p-0">Exporter</div>
        ) : (
          <BXLoading className="m-0 p-0" type="small" />
        )}
        <Download16 slot="icon" />
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
