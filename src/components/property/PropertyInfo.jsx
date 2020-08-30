import { h, Fragment } from 'preact'
import { useHistory } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'preact/hooks'
import BXButton from 'carbon-web-components/es/components-react/button/button'
import SidebarPanel from '../SidebarPanel'
import Print16 from '@carbon/icons-react/es/printer/16'
import Edit16 from '@carbon/icons-react/es/edit/16'
import TrashCan16 from '@carbon/icons-react/es/trash-can/16'
import BXTable from 'carbon-web-components/es/components-react/data-table/table'
import ArrowRight16 from '@carbon/icons-react/es/arrow--right/16'
import BXTableBody from 'carbon-web-components/es/components-react/data-table/table-body'
import BXTableRow from 'carbon-web-components/es/components-react/data-table/table-row'
import BXTableCell from 'carbon-web-components/es/components-react/data-table/table-cell'
import { useStore } from 'effector-react'
import { $propertyFormatted, $property } from '../../store/current'
import AutoSizer from 'react-virtualized-auto-sizer'
import ArrowLeft16 from '@carbon/icons-react/es/arrow--left/16'
import { goToPrintChanged } from '../../store/navigate'
import { dataStores } from '../../store/data'
import BXLoading from 'carbon-web-components/es/components-react/loading/loading'

/** @jsx h */

const PropertyInfoAction = () => {
  const history = useHistory()
  const navigate = useCallback((path) => history.push(path), [history])

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-row">
        <BXButton
          className="shadow-lg flex-grow"
          kind={'primary'}
          disabled={false}
          size={'sm'}
          onClick={() => navigate('/property-edit')}
        >
          Modifier <Edit16 slot="icon" />
        </BXButton>
        <BXButton
          className="shadow-lg flex-grow"
          kind={'ghost'}
          disabled={false}
          size={'sm'}
          onClick={() => goToPrintChanged(true)}
        >
          Imprimer <Print16 slot="icon" />
        </BXButton>
        <BXButton
          className="shadow-lg flex-grow"
          kind={'danger'}
          disabled={false}
          size={'sm'}
        >
          Supprimer <TrashCan16 slot="icon" />
        </BXButton>
      </div>
      <div className="flex flex-row">
        <BXButton
          className="shadow-lg flex-grow max-w-full"
          disabled={false}
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
  const goBack = useCallback(() => history.goBack(), [history])
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
              <BXTable size={'short'} className="shadow-md">
                <BXTableBody colorScheme={'zebra'}>
                  <BXTableRow>
                    <BXTableCell>
                      <div className="font-bold text-base">ID</div>
                    </BXTableCell>
                    <BXTableCell>
                      <div className="font-bold text-base">
                        {property[0].text}
                      </div>
                    </BXTableCell>
                  </BXTableRow>
                  {property
                    .slice(1)
                    .filter((e) => e.text.length || e.text > 0)
                    .map((e) => (
                      <BXTableRow key={e.id}>
                        <BXTableCell className="font-bold">{e.id}</BXTableCell>
                        <BXTableCell>{e.text}</BXTableCell>
                      </BXTableRow>
                    ))}
                </BXTableBody>
              </BXTable>
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
