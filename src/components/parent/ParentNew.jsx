import { h, Fragment } from 'preact'
import { useCallback } from 'preact/hooks'
import BXButton from 'carbon-web-components/es/components-react/button/button'
import SidebarPanel from '../SidebarPanel'
import Close16 from '@carbon/icons-react/es/close/16'
import Checkmark16 from '@carbon/icons-react/es/checkmark/16'
import { useStore } from 'effector-react'
import ArrowLeft16 from '@carbon/icons-react/es/arrow--left/16'
import BXInput from 'carbon-web-components/es/components-react/input/input'
import BXTextarea from 'carbon-web-components/es/components-react/textarea/textarea'
import { newParentStores, newParentEvents, $newParent } from '../../store/new'
import { useHistory } from 'react-router-dom'
import { dataStores, saveParentFx, fetchPropertiesFx } from '../../store/data'
import BXLoading from 'carbon-web-components/es/components-react/loading/loading'
import { transformMultiPolygon, updateTiles } from '../../workers/utils'
import { $mapProjection } from '../../store/map-base'
import { $map } from '../../store/map'
import { $searchCombinded } from '../../store/search'

/** @jsx h */

const ParentNewAction = () => {
  const history = useHistory()
  const goBack = useCallback(() => history.goBack(), [history])
  const parent = useStore($newParent)
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
    await fetchPropertiesFx($searchCombinded.getState())
    updateTiles($map.getState())
    history.goBack()
  }, [parent, history])

  return (
    <div className="flex flex-row">
      <BXButton
        className="shadow-lg flex-grow"
        kind={'ghost'}
        size={'sm'}
        onClick={goBack}
      >
        Annuler <Close16 slot="icon" />
      </BXButton>
      <BXButton
        className="shadow-lg flex-grow"
        kind={'danger'}
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

function ParentNewNavigation() {
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

const ParentNewMain = () => {
  return (
    <div className="p-2 bx-scrollable overflow-auto h-full w-full">
      <Label />
      <Coordinates />
    </div>
  )
}

function ParentNew() {
  return (
    <SidebarPanel
      header={'Nouvelle Assiette'}
      navigation={<ParentNewNavigation />}
      main={<ParentNewMain />}
      action={<ParentNewAction />}
    />
  )
}

export default ParentNew

function Coordinates() {
  const value = useStore(newParentStores.geometry)
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
            newParentEvents.geometryChanged(event.target.value)
          }
        ></BXTextarea>
      </div>
    </div>
  )
}

function Label() {
  const value = useStore(newParentStores.label)
  return (
    <div className="flex mx-4 my-3 flex-row">
      <div className="mr-auto mt-4 my-auto">ID</div>
      <div className="shadow-md w-4/6">
        <BXInput
          value={value}
          colorScheme={'light'}
          size="sm"
          placeholder="ID"
          onInput={(event) => newParentEvents.labelChanged(event.target.value)}
        ></BXInput>
      </div>
    </div>
  )
}
