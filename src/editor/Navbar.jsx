import { h, Fragment } from 'preact'

/** @jsx h */

import BXHeader from 'carbon-web-components/es/components-react/ui-shell/header'
import BXHeaderName from 'carbon-web-components/es/components-react/ui-shell/header-name'
import BXButton from 'carbon-web-components/es/components-react/button/button'
import { goToUserListChanged } from '../store/navigate'
import { fetchUsersFx } from '../store/data'
import { isSuper, $session, sessionChanged } from '../store/auth'
import Logout20 from '@carbon/icons-react/es/logout/20'
import { useStore } from 'effector-react'

const Navbar = () => {
  return (
    <Fragment>
      <BXHeader style={{ backgroundColor: '#0f62fe', position: 'relative' }}>
        <BXHeaderName href="javascript:void 0" prefix="SIG">
          HABOUS
        </BXHeaderName>
        {isSuper() ? <Users /> : null}
        <Logout />
      </BXHeader>
    </Fragment>
  )
}

const Users = () => {
  return (
    <BXButton
      className="m-2 w-48 shadow-md ml-auto bg-white"
      size={'sm'}
      kind="ghost"
      onClick={() => fetchUsersFx() & goToUserListChanged(true)}
    >
      <div className="mx-auto whitespace-no-wrap">Gestion des Utilisateurs</div>
    </BXButton>
  )
}

const Logout = () => {
  const user = useStore($session)
  if (!user) return null
  return (
    <Fragment>
      <div className="ml-4 whitespace-no-wrap text-white">{user.name}</div>
      <BXButton
        className="min-w-0 shadow-md ml-4 bg-white"
        size={'large'}
        kind="danger"
        onClick={() => sessionChanged(null)}
      >
        <Logout20 slot="icon" />
      </BXButton>
    </Fragment>
  )
}

export default Navbar
