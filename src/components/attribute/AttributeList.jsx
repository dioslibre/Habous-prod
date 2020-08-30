import { h, Fragment } from 'preact'
import { useHistory } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'preact/hooks'
import { useStore } from 'effector-react'
import { memo } from 'preact/compat'
import BXButton from 'carbon-web-components/es/components-react/button/button'
import BXLoading from 'carbon-web-components/es/components-react/loading/loading'
import SidebarPanel from '../SidebarPanel'
import VirtualScroll from '../../library/VirtualScroll'
import AutoSizer from 'react-virtualized-auto-sizer'

/** @jsx h */

import {
  dataStores,
  editAttributeFx,
  createAttributeFx,
} from '../../store/data'
import { $attribute } from '../../store/current'
import ArrowLeft16 from '@carbon/icons-react/es/arrow--left/16'
import TrashCan16 from '@carbon/icons-react/es/trash-can/20'
import Edit16 from '@carbon/icons-react/es/edit/20'
import Checkmark20 from '@carbon/icons-react/es/checkmark/20'
import Close20 from '@carbon/icons-react/es/close/20'
import Add16 from '@carbon/icons-react/es/add/16'
import BXInput from 'carbon-web-components/es/components-react/input/input'

const attributes = [
  { name: 'unit', header: 'Unité' },
  { name: 'conservation', header: 'Conservation' },
  { name: 'assign', header: 'Affectation' },
  { name: 'nature', header: 'Consistance' },
  { name: 'owner', header: 'Propriétaire' },
  { name: 'doctype', header: 'Type de Document' },
]

const AttributeListAction = () => {
  const name = useStore($attribute)
  return (
    <BXButton
      className="shadow-lg float-right"
      kind={'danger'}
      disabled={false}
      size={'sm'}
      onClick={() =>
        createAttributeFx({ model: name, data: { text: 'Nouvel Element' } })
      }
    >
      {attributes.find((e) => e.name === name).header} <Add16 slot="icon" />
    </BXButton>
  )
}

function AttributeListNavigation() {
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

const PropertyItem = memo(({ row }) => {
  const name = useStore($attribute)
  const [hover, setHover] = useState(false)
  const [edit, setEdit] = useState(false)
  const [remove, setRemove] = useState(false)
  const [text, setText] = useState(row.text)

  if (edit)
    return (
      <div className="shadow flex flex-row m-2 bg-white border-r-2 border-blue-600">
        <div className="shadow-md h-14 flex-grow pt-1 px-2 m-0">
          <BXInput
            value={text}
            colorScheme={'light'}
            size="sm"
            placeholder="Nom"
            onInput={(event) => setText(event.target.value)}
          ></BXInput>
        </div>
        <Fragment>
          <BXButton kind="ghost" onClick={() => setEdit(false)}>
            <Close20 />
          </BXButton>
          <BXButton
            kind="ghost"
            onClick={() =>
              editAttributeFx({ model: name, data: { ...row, text } })
            }
          >
            <div className="text-red-600">
              <Checkmark20 />
            </div>
          </BXButton>
        </Fragment>
      </div>
    )

  if (remove)
    return (
      <div className="shadow flex flex-row m-2 bg-white border-r-2 border-blue-600">
        <div className="pl-2 text-black text-base my-auto flex-grow">
          {row.text}
        </div>
        <Fragment>
          <BXButton kind="ghost" onClick={() => setRemove(false)}>
            <Close20 />
          </BXButton>
          <BXButton
            kind="ghost"
            onClick={() =>
              editAttributeFx({ model: name, data: { ...row, deleted: true } })
            }
          >
            <div className="text-red-600">
              <Checkmark20 />
            </div>
          </BXButton>
        </Fragment>
      </div>
    )

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="shadow flex flex-row m-2 h-12 bg-white border-r-2 border-blue-600"
    >
      <div
        style={{
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
        className="pl-2 text-black text-base my-auto flex-grow"
      >
        {row.text}
      </div>
      {hover ? (
        <Fragment>
          <BXButton kind="ghost" onClick={() => setEdit(true)}>
            <Edit16 />
          </BXButton>
          <BXButton kind="ghost" onClick={() => setRemove(true)}>
            <div className="text-red-600">
              <TrashCan16 />
            </div>
          </BXButton>
        </Fragment>
      ) : null}
    </div>
  )
})

const AttributeListMain = ({ item }) => {
  const name = useStore($attribute)
  const { data, pending } = useStore(dataStores.$fetchAttributes)

  if (!name) return null
  if (!data || pending)
    return <BXLoading className="absolute top-20 left-20" type="regular" />

  return (
    <AutoSizer>
      {({ height, width }) => {
        return (
          <VirtualScroll
            items={data[name].items}
            width={width}
            height={height}
            getChildHeight={useCallback(() => 60, [])}
            Item={item}
          />
        )
      }}
    </AutoSizer>
  )
}

function AttributeList() {
  const name = useStore($attribute)
  const history = useHistory()

  useEffect(() => name || history.push('/'), [])

  return (
    <SidebarPanel
      header={`Attributs | ${attributes.find((e) => e.name === name).header}`}
      navigation={<AttributeListNavigation />}
      main={<AttributeListMain item={PropertyItem} />}
      action={<AttributeListAction />}
    />
  )
}

export default AttributeList
