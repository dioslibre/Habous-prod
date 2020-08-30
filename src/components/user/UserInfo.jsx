import { h, Fragment } from 'preact'
import { useHistory } from 'react-router-dom'
import { useCallback, useEffect } from 'preact/hooks'
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
import { $userFormatted } from '../../store/current'
import AutoSizer from 'react-virtualized-auto-sizer'
import ArrowLeft16 from '@carbon/icons-react/es/arrow--left/16'
import { goToUserListChanged } from '../../store/navigate'

/** @jsx h */

const UserInfoAction = () => {
  const history = useHistory()
  const navigate = useCallback(
    (path) => goToUserListChanged(false) & history.push(path),
    [history]
  )

  return (
    <div className="flex flex-row">
      <BXButton
        className="shadow-lg flex-grow"
        kind={'primary'}
        disabled={false}
        size={'sm'}
        onClick={() => navigate('/user-edit')}
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
  )
}

function UserInfoNavigation() {
  const history = useHistory()
  const goBack = useCallback(
    () => goToUserListChanged(false) & history.goBack(),
    [history]
  )
  const user = useStore($userFormatted)

  useEffect(() => user || history.push('/'), [])

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

const roles = [
  { id: 'admin', header: 'Administrateur' },
  { id: 'guest', header: 'Invité' },
  { id: 'user', header: 'Utilisateur' },
  { id: 'super', header: 'Super Administrateur' },
]

const UserInfoMain = () => {
  const user = useStore($userFormatted)

  if (!user) return null

  return (
    <div className="p-4 bx-scrollable overflow-auto h-full w-full">
      <AutoSizer>
        {({ height, width }) => {
          return (
            <div style={{ maxHeight: height, width: width }}>
              <BXTable size={'short'} className="shadow-md">
                <BXTableBody colorScheme={'zebra'}>
                  {user
                    // .slice(1)
                    // .filter((e) => e.id !== 'Role')
                    .map((e) => (
                      <BXTableRow key={e.id}>
                        <BXTableCell className="font-bold">{e.id}</BXTableCell>
                        <BXTableCell>
                          {e.id !== 'Role'
                            ? e.text
                            : roles.find((r) => r.id === e.text).header}
                        </BXTableCell>
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

function UserInfo() {
  return (
    <SidebarPanel
      header={'Attributs | Utilisateur'}
      navigation={<UserInfoNavigation />}
      main={<UserInfoMain />}
      action={<UserInfoAction />}
    />
  )
}

export default UserInfo
