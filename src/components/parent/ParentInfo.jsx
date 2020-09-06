import { h, Fragment } from 'preact'
import { useHistory } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'preact/hooks'
import BXButton from 'carbon-web-components/es/components-react/button/button'
import SidebarPanel from '../SidebarPanel'
import Edit16 from '@carbon/icons-react/es/edit/16'
import TrashCan16 from '@carbon/icons-react/es/trash-can/16'
import { useStore } from 'effector-react'
import { $parentFormatted, $parent } from '../../store/current'
import AutoSizer from 'react-virtualized-auto-sizer'
import Add16 from '@carbon/icons-react/es/add/16'
import ArrowLeft16 from '@carbon/icons-react/es/arrow--left/16'
import ArrowRight16 from '@carbon/icons-react/es/arrow--right/16'
import { dataStores, saveParentFx, fetchPropertiesFx } from '../../store/data'
import BXLoading from 'carbon-web-components/es/components-react/loading/loading'
import { newPropertyEvents } from '../../store/new'
import { $searchCombinded } from '../../store/search'
import { $map } from '../../store/map'
import { updateTiles } from '../../workers/utils'
import Close20 from '@carbon/icons-react/es/close/20'
import Checkmark20 from '@carbon/icons-react/es/checkmark/20'
import { isAdmin, isUser } from '../../store/auth'

/** @jsx h */

const ParentInfoAction = () => {
  const { pending } = useStore(dataStores.$saveParent)
  const [remove, setRemove] = useState(false)
  const history = useHistory()
  const parent = useStore($parent)
  const navigate = useCallback((path) => history.push(path), [history])

  const save = useCallback(async () => {
    await saveParentFx({ ...parent, deleted: true })
    await fetchPropertiesFx($searchCombinded.getState())
    updateTiles($map.getState())
    history.goBack()
  }, [parent, history])

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-row">
        {isAdmin() ? (
          <BXButton
            className="shadow-lg flex-grow"
            kind={'primary'}
            size={'sm'}
            onClick={() =>
              newPropertyEvents.labelChanged($parent.getState().label) &
              navigate('/property-new')
            }
          >
            Propriété <Add16 slot="icon" />
          </BXButton>
        ) : null}
        {isUser() ? (
          <BXButton
            className="shadow-lg flex-grow"
            kind={'ghost'}
            size={'sm'}
            onClick={() => navigate('/parent-edit')}
          >
            Modifier <Edit16 slot="icon" />
          </BXButton>
        ) : null}
        {remove ? (
          <Fragment>
            <BXButton size={'sm'} kind="ghost" onClick={() => setRemove(false)}>
              <Close20 />
            </BXButton>
            <BXButton size={'sm'} kind="ghost" onClick={save}>
              {pending ? (
                <BXLoading className="left-2 absolute" type="small" />
              ) : (
                <div className="text-red-600">
                  <Checkmark20 />
                </div>
              )}
            </BXButton>
          </Fragment>
        ) : isAdmin() ? (
          <BXButton
            className="shadow-lg flex-grow"
            kind={'danger'}
            size={'sm'}
            onClick={() => setRemove(true)}
          >
            Supprimer <TrashCan16 slot="icon" />
          </BXButton>
        ) : null}
      </div>
      <div className="flex flex-row">
        <BXButton
          className="shadow-lg flex-grow max-w-full"
          size={'sm'}
          onClick={() => navigate('/parent-document')}
        >
          Documents <ArrowRight16 slot="icon" />
        </BXButton>
      </div>
    </div>
  )
}

function ParentInfoNavigation() {
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

const ParentInfoMain = () => {
  const [id, setId] = useState()
  const history = useHistory()
  const parent = useStore($parentFormatted)
  const { pending: pending1 } = useStore(dataStores.$fetchProperties)
  const { pending: pending2 } = useStore(dataStores.$fetchParents)

  useEffect(() => {
    if (pending1 || pending2) return
    if (!parent) {
      setId(setTimeout(() => history.push('/parent-list'), 500))
      return
    }
    // if (parent && id) clearTimeout(id) & setId()
  }, [history, parent, pending1, pending2])

  useEffect(() => {
    if (pending1 || pending2) return
    if (!id) return
    if (parent) clearTimeout(id) & setId()
  }, [id, parent, pending1, pending2])

  if (pending1 || pending2)
    return <BXLoading className="absolute top-20 left-20" type="regular" />

  if (!parent) {
    return <BXLoading className="absolute top-20 left-20" type="regular" />
  }

  return (
    <div className="p-4 bx-scrollable overflow-auto h-full w-full">
      <AutoSizer>
        {({ height, width }) => {
          return (
            <div style={{ maxHeight: height, width: width }}>
              <Fragment>
                <table size={'short'} className="shadow-md mt-0">
                  <tr>
                    <th className="font-bold text-base">{parent[0].id}</th>
                    <th className="font-bold text-base">{parent[0].text}</th>
                  </tr>
                  {parent.slice(1, 4).map((e) => (
                    <tr key={e.id}>
                      <td className="font-bold">{e.id}</td>
                      <td>{e.text}</td>
                    </tr>
                  ))}
                </table>
                {parent[5].text.map((e, index) => (
                  <Fragment key={index}>
                    <table size={'short'} className="shadow-md mt-8">
                      <tr>
                        <th className="text-base font-bold">Polygone</th>
                        <th className="text-base font-bold">P{index + 1}</th>
                      </tr>
                      <tr>
                        <td className="text-base font-bold">X</td>
                        <td className="text-base font-bold">Y</td>
                      </tr>
                      {e.map((c, jindex) => (
                        <tr key={jindex}>
                          <td className="font-bold">{c[0]}</td>
                          <td>{c[1]}</td>
                        </tr>
                      ))}
                    </table>
                  </Fragment>
                ))}
              </Fragment>
            </div>
          )
        }}
      </AutoSizer>
    </div>
  )
}

function ParentInfo() {
  return (
    <SidebarPanel
      header={'Attributs | Assiette'}
      navigation={<ParentInfoNavigation />}
      main={<ParentInfoMain />}
      action={<ParentInfoAction />}
    />
  )
}

export default ParentInfo
