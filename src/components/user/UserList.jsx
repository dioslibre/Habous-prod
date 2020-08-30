import { h, Fragment } from 'preact'
import { useHistory } from 'react-router-dom'
import { useCallback } from 'preact/hooks'
import { useStore } from 'effector-react'
import { memo } from 'preact/compat'
import BXButton from 'carbon-web-components/es/components-react/button/button'
import BXLoading from 'carbon-web-components/es/components-react/loading/loading'
import SidebarPanel from '../SidebarPanel'
import CharacterPatterns16 from '@carbon/icons-react/es/character-patterns/16'
import ArrowRight16 from '@carbon/icons-react/es/arrow--right/16'
import VirtualScroll from '../../library/VirtualScroll'
import AutoSizer from 'react-virtualized-auto-sizer'
import Home16 from '@carbon/icons-react/es/home/16'

/** @jsx h */

import { dataStores } from '../../store/data'
import { userChanged } from '../../store/current'
import ArrowLeft16 from '@carbon/icons-react/es/arrow--left/16'
import { goToUserListChanged } from '../../store/navigate'

function UserListNavigation() {
  const history = useHistory()
  const goBack = useCallback(
    () => goToUserListChanged(false) & history.goBack(),
    [history]
  )
  const goHome = useCallback(
    () => goToUserListChanged(false) & history.push('/'),
    [history]
  )

  const { data, error, pending } = useStore(dataStores.$fetchUsers)

  if (error) return null

  return (
    <Fragment>
      <BXButton kind="ghost" className="w-16 bg-white" size="sm">
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
        onClick={goHome}
      >
        <Home16 />
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

const roles = [
  { id: 'admin', header: 'Administrateur' },
  { id: 'guest', header: 'Invité' },
  { id: 'user', header: 'Utilisateur' },
  { id: 'super', header: 'Super Administrateur' },
]

const UserItem = memo(({ index, row }) => {
  const history = useHistory()
  const navigate = useCallback(() => {
    userChanged(row)
    history.push('/user-info')
  }, [history])

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
            {row.name}
          </p>
          <p className="text-black text-base">
            {roles.find((r) => r.id === row.role).header}
          </p>
        </div>
      </BXButton>
    </div>
  )
})

const UserListMain = ({ item }) => {
  const { data, error, pending } = useStore(dataStores.$fetchUsers)

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

function UserList() {
  return (
    <SidebarPanel
      header={'Utilisateurs'}
      navigation={<UserListNavigation />}
      main={<UserListMain item={UserItem} />}
    />
  )
}

export default UserList
