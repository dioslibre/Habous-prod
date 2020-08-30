import { h, Fragment } from 'preact'
import { useCallback, useEffect } from 'preact/hooks'
import BXButton from 'carbon-web-components/es/components-react/button/button'
import SidebarPanel from '../SidebarPanel'
import Close16 from '@carbon/icons-react/es/close/16'
import Checkmark16 from '@carbon/icons-react/es/checkmark/16'
import { useStore } from 'effector-react'
import { $parentFormatted } from '../../store/current'
import ArrowLeft16 from '@carbon/icons-react/es/arrow--left/16'
import BXInput from 'carbon-web-components/es/components-react/input/input'
import BXTextarea from 'carbon-web-components/es/components-react/textarea/textarea'
import {
  editParentStores,
  editParentEvents,
  $editParent,
} from '../../store/edit'
import { useHistory } from 'react-router-dom'
import { dataStores, saveParentFx } from '../../store/data'
import BXLoading from 'carbon-web-components/es/components-react/loading/loading'
import { transformMultiPolygon, updateTiles } from '../../workers/utils'
import { $mapProjection } from '../../store/map-base'
import { $map } from '../../store/map'
import { searchEvents } from '../../store/search'

/** @jsx h */

const ParentEditAction = () => {
  const history = useHistory()
  const goBack = useCallback(() => history.goBack(), [history])
  const parent = useStore($editParent)
  const { pending } = useStore(dataStores.$saveParent)

  const save = useCallback(async () => {
    let geometry = parent.geometry.split('0 0\n').map((e) => [
      e
        .split('\n')
        .map((v) => v.split(' ').map((e) => parseFloat(e)))
        .filter((f) => f.length === 2),
    ])
    for (let index = 0; index < geometry.length; index++) {
      const element = geometry[index]
      if (element[0].length < 3) {
        alert('Erreur : Coordonnées Invalides')
        return
      }
    }
    geometry = transformMultiPolygon(
      geometry,
      $mapProjection.getState().id,
      'EPSG:3857'
    )
    await saveParentFx({ ...parent, geometry })
    searchEvents.labelChanged('')
    searchEvents.labelChanged(parent.label)
    updateTiles($map.getState())
    history.goBack()
  }, [parent, history])

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
        disabled={false}
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

function ParentEditNavigation() {
  const history = useHistory()
  const goBack = useCallback(() => history.goBack(), [history])
  const parent = useStore($parentFormatted)

  useEffect(() => parent || history.push('/'), [])

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

const ParentEditMain = () => {
  const { pending: pending1 } = useStore(dataStores.$fetchProperties)
  const { pending: pending2 } = useStore(dataStores.$fetchParents)

  if (pending1 || pending2)
    return <BXLoading className="absolute top-20 left-20" type="regular" />

  return (
    <div className="p-2 bx-scrollable overflow-auto h-full w-full">
      <Label />
      <Coordinates />
    </div>
  )
}

function ParentEdit() {
  return (
    <SidebarPanel
      header={'Edition | Propriété'}
      navigation={<ParentEditNavigation />}
      main={<ParentEditMain />}
      action={<ParentEditAction />}
    />
  )
}

export default ParentEdit

function Coordinates() {
  const value = useStore(editParentStores.geometry)
  return (
    <div className="mx-4">
      <div className="mt-4">Coordonnées</div>
      <div className="mb-4 shadow-md text-lg">
        <BXTextarea
          className=""
          rows={15}
          value={value}
          colorScheme={'light'}
          size="sm"
          placeholder="Note"
          onInput={(event) =>
            editParentEvents.geometryChanged(event.target.value)
          }
        ></BXTextarea>
      </div>
    </div>
  )
}

function Label() {
  const value = useStore(editParentStores.label)
  return (
    <div className="flex mx-4 my-3 flex-row">
      <div className="mr-auto mt-4 my-auto">ID</div>
      <div className="shadow-md w-4/6">
        <BXInput
          value={value}
          colorScheme={'light'}
          size="sm"
          placeholder="ID"
          onInput={(event) => editParentEvents.labelChanged(event.target.value)}
        ></BXInput>
      </div>
    </div>
  )
}
