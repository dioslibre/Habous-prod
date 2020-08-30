import { h, Fragment } from 'preact'
import { useHistory } from 'react-router-dom'
import { useCallback, useEffect } from 'preact/hooks'
import BXButton from 'carbon-web-components/es/components-react/button/button'
import SidebarPanel from '../SidebarPanel'
import Edit16 from '@carbon/icons-react/es/edit/16'
import TrashCan16 from '@carbon/icons-react/es/trash-can/16'
import BXTable from 'carbon-web-components/es/components-react/data-table/table'
import BXTableBody from 'carbon-web-components/es/components-react/data-table/table-body'
import BXTableRow from 'carbon-web-components/es/components-react/data-table/table-row'
import BXTableCell from 'carbon-web-components/es/components-react/data-table/table-cell'
import { useStore } from 'effector-react'
import { $parentFormatted, $parent } from '../../store/current'
import AutoSizer from 'react-virtualized-auto-sizer'
import Add16 from '@carbon/icons-react/es/add/16'
import ArrowLeft16 from '@carbon/icons-react/es/arrow--left/16'
import ArrowRight16 from '@carbon/icons-react/es/arrow--right/16'
import { dataStores } from '../../store/data'
import BXLoading from 'carbon-web-components/es/components-react/loading/loading'
import { newPropertyEvents } from '../../store/new'

/** @jsx h */

const ParentInfoAction = () => {
  const history = useHistory()
  const navigate = useCallback((path) => history.push(path), [history])

  return (
    <div className="flex flex-col w-full">
      <div className="flex flexRow">
        <BXButton
          className="shadow-lg flex-grow"
          kind={'primary'}
          disabled={false}
          size={'sm'}
          onClick={() =>
            newPropertyEvents.labelChanged($parent.getState().label) &
            navigate('/property-new')
          }
        >
          Propriété <Add16 slot="icon" />
        </BXButton>
        <BXButton
          className="shadow-lg flex-grow"
          kind={'primary'}
          disabled={false}
          size={'sm'}
          onClick={() => navigate('/parent-edit')}
        >
          Modifier <Edit16 slot="icon" />
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
  const parent = useStore($parentFormatted)

  const { pending: pending1 } = useStore(dataStores.$fetchProperties)
  const { pending: pending2 } = useStore(dataStores.$fetchParents)

  if (pending1 || pending2)
    return <BXLoading className="absolute top-20 left-20" type="regular" />

  return (
    <div className="p-4 bx-scrollable overflow-auto h-full w-full">
      <AutoSizer>
        {({ height, width }) => {
          return (
            <div style={{ maxHeight: height, width: width }}>
              <Fragment>
                <BXTable size={'short'} className="shadow-md">
                  <BXTableBody colorScheme={'zebra'}>
                    <BXTableRow>
                      <BXTableCell className="font-bold text-base">
                        {parent[0].id}
                      </BXTableCell>
                      <BXTableCell className="font-bold text-base">
                        {parent[0].text}
                      </BXTableCell>
                    </BXTableRow>
                    {parent.slice(1, 3).map((e) => (
                      <BXTableRow key={e.id}>
                        <BXTableCell className="font-bold">{e.id}</BXTableCell>
                        <BXTableCell>{e.text}</BXTableCell>
                      </BXTableRow>
                    ))}
                  </BXTableBody>
                </BXTable>
                {parent[4].text.map((e, index) => (
                  <Fragment key={index}>
                    <BXTable size={'short'} className="shadow-md mt-8">
                      <BXTableBody colorScheme={'zebra'}>
                        <BXTableRow>
                          <BXTableCell className="text-base font-bold">
                            Polygone
                          </BXTableCell>
                          <BXTableCell className="text-base font-bold">
                            P{index + 1}
                          </BXTableCell>
                        </BXTableRow>
                        <BXTableRow>
                          <BXTableCell className="text-base font-bold">
                            X
                          </BXTableCell>
                          <BXTableCell className="text-base font-bold">
                            Y
                          </BXTableCell>
                        </BXTableRow>
                        {e.map((c, jindex) => (
                          <BXTableRow key={jindex}>
                            <BXTableCell className="py-0">{c[0]}</BXTableCell>
                            <BXTableCell className="py-0">{c[1]}</BXTableCell>
                          </BXTableRow>
                        ))}
                      </BXTableBody>
                    </BXTable>
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
  const history = useHistory()
  const parent = useStore($parent)
  useEffect(() => parent || history.push('/parent-list'), [parent])

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
