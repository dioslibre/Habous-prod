import { h, Fragment } from 'preact'
import { useHistory } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'preact/hooks'
import BXButton from 'carbon-web-components/es/components-react/button/button'
import SidebarPanel from '../SidebarPanel'
import Print16 from '@carbon/icons-react/es/printer/16'
import Edit16 from '@carbon/icons-react/es/edit/16'
import TrashCan16 from '@carbon/icons-react/es/trash-can/16'
import ArrowRight16 from '@carbon/icons-react/es/arrow--right/16'
import { useStore } from 'effector-react'
import { $propertyFormatted, $property } from '../../store/current'
import AutoSizer from 'react-virtualized-auto-sizer'
import ArrowLeft16 from '@carbon/icons-react/es/arrow--left/16'
import { goToPrintChanged } from '../../store/navigate'
import { dataStores, savePropertyFx, fetchPropertiesFx } from '../../store/data'
import BXLoading from 'carbon-web-components/es/components-react/loading/loading'
import { $searchCombinded } from '../../store/search'
import Close20 from '@carbon/icons-react/es/close/20'
import Checkmark20 from '@carbon/icons-react/es/checkmark/20'
import { isUser, isAdmin } from '../../store/auth'

/** @jsx h */

const PropertyInfoAction = () => {
  const { pending } = useStore(dataStores.$saveProperty)
  const [remove, setRemove] = useState(false)
  const history = useHistory()
  const navigate = useCallback((path) => history.push(path), [history])
  const property = useStore($property)

  const save = useCallback(async () => {
    await savePropertyFx({ ...property, deleted: true })
    fetchPropertiesFx($searchCombinded.getState())
    history.goBack()
  }, [property, history])

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-row">
        {isUser() ? (
          <BXButton
            className="shadow-lg flex-grow"
            kind={'primary'}
            size={'sm'}
            onClick={() => navigate('/property-edit')}
          >
            Modifier <Edit16 slot="icon" />
          </BXButton>
        ) : null}
        <BXButton
          className="shadow-lg flex-grow"
          kind={'ghost'}
          size={'sm'}
          onClick={() => goToPrintChanged(true)}
        >
          Imprimer <Print16 slot="icon" />
        </BXButton>
        {remove ? (
          <Fragment>
            <BXButton size={'sm'} kind="ghost" onClick={() => setRemove(false)}>
              <Close20 />
            </BXButton>
            <BXButton size={'sm'} kind="ghost" onClick={save}>
              <div className="text-red-600">
                {pending ? (
                  <BXLoading className="left-5 absolute" type="small" />
                ) : (
                  <Checkmark20 />
                )}
              </div>
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
          onClick={() => navigate('/property-document')}
        >
          Documents <ArrowRight16 slot="icon" />
        </BXButton>
      </div>
    </div>
  )
}

function PropertyInfoNavigation() {
  const history = useHistory()
  const navigate = useCallback(() => history.push('/parent-info'), [history])
  const goBack = useCallback(() => history.push('/'), [history])
  const property = useStore($property)

  useEffect(() => property || history.push('/'), [])

  return (
    <Fragment>
      <BXButton
        className="bg-white border-l border-blue-600"
        kind="ghost"
        size="sm"
        onClick={navigate}
      >
        Assiette
      </BXButton>
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

const PropertyInfoMain = () => {
  const [id, setId] = useState()
  const history = useHistory()
  const property = useStore($propertyFormatted)
  const { pending: pending1 } = useStore(dataStores.$fetchProperties)
  const { pending: pending2 } = useStore(dataStores.$fetchParents)

  useEffect(() => {
    if (pending1 || pending2) return
    if (!property) {
      setId(setTimeout(() => history.push('/property-list'), 500))
      return
    }
    // if (property && id) clearTimeout(id) & setId()
  }, [history, property, pending1, pending2])

  useEffect(() => {
    if (pending1 || pending2) return
    if (!id) return
    if (property) clearTimeout(id) & setId()
  }, [id, property, pending1, pending2])

  if (pending1 || pending2)
    return <BXLoading className="absolute top-20 left-20" type="regular" />

  if (!property) {
    return <BXLoading className="absolute top-20 left-20" type="regular" />
  }

  return (
    <div className="p-4 bx-scrollable overflow-auto h-full w-full">
      <AutoSizer>
        {({ height, width }) => {
          return (
            <div style={{ maxHeight: height, width: width }}>
              <table size={'short'} className="shadow-md mt-0">
                <tr>
                  <th>
                    <div className="font-bold text-base">{property[0].id}</div>
                  </th>
                  <th>
                    <div className="font-bold text-base">
                      {property[0].text}
                    </div>
                  </th>
                </tr>
                {property
                  .slice(1)
                  .filter((e) => e.text.length || e.text > 0)
                  .map((e) => (
                    <tr key={e.id}>
                      <td className="font-bold">{e.id}</td>
                      <td>{e.text}</td>
                    </tr>
                  ))}
              </table>
            </div>
          )
        }}
      </AutoSizer>
    </div>
  )
}

function PropertyInfo() {
  return (
    <SidebarPanel
      header={'Attributs | Propriété'}
      navigation={<PropertyInfoNavigation />}
      main={<PropertyInfoMain />}
      action={<PropertyInfoAction />}
    />
  )
}

export default PropertyInfo
