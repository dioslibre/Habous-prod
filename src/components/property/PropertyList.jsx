import { h, Fragment } from 'preact'
import { useHistory } from 'react-router-dom'
import { useCallback, useState } from 'preact/hooks'
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
import { Workbook } from 'exceljs'

/** @jsx h */

import { dataStores, saveExcelFx } from '../../store/data'
import { propertyChanged } from '../../store/current'
import { transformOne } from '../../workers/utils'
import { $mapProjection } from '../../store/map-base'

const PropertyListAction = () => {
  const [exporting, setExporting] = useState()
  const [importing, setImporting] = useState()
  const props = useStore(dataStores.$fetchProperties)
  const parents = useStore(dataStores.$fetchParents)
  const projection = useStore($mapProjection)

  const exSave = useCallback(async () => {
    try {
      const aoa = await saveExcelFx(
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
      )
      const workbook = new Workbook()
      const sheet = workbook.addWorksheet('Propriétés')
      sheet.addRows(aoa)

      var row = sheet.getRow(1)
      row.font = {
        bold: true,
        size: 12,
      }
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFAFAD2' },
        bgColor: { argb: 'FFD8D8D8' },
      }

      autofitColumns(sheet)
      const buffer = await workbook.xlsx.writeBuffer()
      window.saveAs(new Blob([buffer]), 'Propriétés.xlsx')

      setExporting(false)
    } catch (err) {
      setExporting(false)
      console.log(err)
      alert('Erreur')
    }
  }, [props, parents, projection])

  return (
    <div className="flex flex-row">
      <BXButton
        className="shadow-lg flex-grow"
        kind={'danger'}
        disabled={false}
        size={'sm'}
      >
        {!importing ? (
          <div className="p-0">Importer</div>
        ) : (
          <BXLoading className="m-0 p-0" type="small" />
        )}
        <Upload16 slot="icon" />
      </BXButton>
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

function eachColumnInRange(ws, col1, col2, cb) {
  for (let c = col1; c <= col2; c++) {
    let col = ws.getColumn(c)
    cb(col)
  }
}
function autofitColumns(ws) {
  // no good way to get text widths
  eachColumnInRange(ws, 1, ws.columnCount, (column) => {
    let maxWidth = 10
    column.eachCell((cell) => {
      if (!cell.isMerged && cell.value) {
        // doesn't handle merged cells

        let text = ''
        if (typeof cell.value != 'object') {
          // string, number, ...
          text = cell.value.toString()
        } else if (cell.value.richText) {
          // richText
          text = cell.value.richText.reduce(
            (text, obj) => text + obj.text.toString(),
            ''
          )
        }

        // handle new lines -> don't forget to set wrapText: true
        let values = text.split(/[\n\r]+/)

        for (let value of values) {
          let width = value.length

          if (cell.font && cell.font.bold) {
            width *= 1.08 // bolding increases width
          }

          maxWidth = Math.max(maxWidth, width)
        }
      }
    })

    maxWidth += 0.71 // compensate for observed reduction
    maxWidth += 1 // buffer space

    column.width = maxWidth
  })
}
