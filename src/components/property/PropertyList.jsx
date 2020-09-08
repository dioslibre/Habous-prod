import { h, Fragment } from 'preact'
import { useHistory } from 'react-router-dom'
import { useCallback, useState, useEffect } from 'preact/hooks'
import { useStore } from 'effector-react'
import { memo } from 'preact/compat'
import BXButton from 'carbon-web-components/es/components-react/button/button'
import BXLoading from 'carbon-web-components/es/components-react/loading/loading'
import SidebarPanel from '../SidebarPanel'
import VirtualScroll from '../../library/VirtualScroll'
import AutoSizer from 'react-virtualized-auto-sizer'
import Download16 from '@carbon/icons-react/es/download/16'
import Upload16 from '@carbon/icons-react/es/upload/16'
import { forwardExcelFile, $excel } from '../../store/upload'

/** @jsx h */

import { dataStores, postPropertiesFx } from '../../store/data'
import { propertyChanged } from '../../store/current'
import { transformOne, saveExcel } from '../../workers/utils'
import { $mapProjection } from '../../store/map-base'
import { Workbook } from 'exceljs'
import { $isSearching } from '../../store/search'
import { toast } from 'react-toastify'

const PropertyListAction = () => {
  const [exporting, setExporting] = useState()
  const [importing, setImporting] = useState()
  const props = useStore(dataStores.$fetchProperties)
  const { data } = useStore(dataStores.$fetchAttributes)
  const parents = useStore(dataStores.$fetchParents)
  const projection = useStore($mapProjection)
  const excel = useStore($excel)
  const isSearching = useStore($isSearching)

  useEffect(() => {
    document
      .getElementById('read-file')
      .addEventListener('change', forwardExcelFile)
    return () =>
      document
        .getElementById('read-file')
        .removeEventListener('change', forwardExcelFile)
  }, [])

  useEffect(() => {
    console.log(excel)
    if (!excel) return
    if (!excel?.name?.toLowerCase().endsWith('xlsx')) return
    setTimeout(() => inSave(), 300)
  }, [excel])

  const exSave = useCallback(async () => {
    const all =
      props.data
        .map((e) => {
          if (!e.label) return null
          const parent = parents.data.find((p) => p.label === e.label)
          if (!parent) return null

          return {
            ...e,
            projected: transformOne(parent.pole, 'EPSG:3857', projection.id),
          }
        })
        .filter((e) => e) || []

    await saveExcel(all, data)
    setExporting(false)
  }, [props, parents, projection])

  const inSave = useCallback(() => {
    setImporting(true)

    const reader = new FileReader()

    reader.onload = () => {
      const buffer = reader.result
      const properties = []
      const wb = new Workbook()
      wb.xlsx
        .load(buffer)
        .then(async (workbook) => {
          const sheet = workbook.getWorksheet(1)
          sheet.eachRow((row, rowIndex) => {
            if (rowIndex === 1) return
            const values = row.values
            const property = {
              unitId:
                (data.unit.items.find((v) => v.text === values[1]) || {}).id ||
                0,
              title: values[2],
              label: values[3],
              status: values[4],
              regime: values[5],
              reference: values[6],
              conservationId:
                (
                  data.conservation.items.find((v) => v.text === values[7]) ||
                  {}
                ).id || '',
              assignId:
                (data.assign.items.find((v) => v.text === values[8]) || {})
                  .id || '',
              natureId:
                (data.nature.items.find((v) => v.text === values[9]) || {})
                  .id || '',
              ownerId:
                (data.owner.items.find((v) => v.text === values[10]) || {})
                  .id || '',
              area: parseFloat(values[11]),
              venale: parseFloat(values[12]),
              locative: parseFloat(values[13]),
              address: values[16],
              note: values[17],
            }
            const duplicate = props.data.find(
              (e) =>
                (e.unitId === property.unitId && e.title === property.title) ||
                e.reference === property.reference
            )
            if (!duplicate) properties.push(property)
          })
          if (properties.length) await postPropertiesFx(properties)
          toast(`${properties.length} Propriété(s) importée(s)`, {
            type: 'info',
            position: 'bottom-left',
            delay: 1,
          })
          setImporting(false)
        })
        .catch((err) => {
          toast(`Erreur`, {
            position: 'bottom-left',
            type: 'error',
          })
          console.log(err)
          setImporting(false)
        })
    }

    reader.readAsArrayBuffer(excel)
  }, [excel, props])

  return (
    <div className="w-full">
      {isSearching ? null : (
        <BXButton
          className="shadow-lg w-1/2 float-right"
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
        className="shadow-lg w-1/2 float-right"
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

function PropertyListNavigation() {
  const history = useHistory()
  const navigate = useCallback(() => history.push('/parent-list'), [history])
  const { data, pending } = useStore(dataStores.$fetchProperties)

  return (
    <Fragment>
      <BXButton kind="ghost" className="w-20 bg-white" size="sm">
        {pending ? (
          <BXLoading className="left-5 absolute" type="small" />
        ) : (
          <div className="px-2 absolute text-blue-600 my-auto text-base">
            {data?.length || 0}
          </div>
        )}
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
  const { data, pending } = useStore(dataStores.$fetchProperties)

  if (data?.length === 0) return null

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
