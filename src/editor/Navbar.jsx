import { h, Fragment } from 'preact'

/** @jsx h */

import BXHeader from 'carbon-web-components/es/components-react/ui-shell/header'
import BXHeaderName from 'carbon-web-components/es/components-react/ui-shell/header-name'
import BXButton from 'carbon-web-components/es/components-react/button/button'
import { goToUserListChanged } from '../store/navigate'
import { fetchUsersFx } from '../store/data'

const Navbar = () => {
  return (
    <Fragment>
      <BXHeader style={{ backgroundColor: '#0f62fe', position: 'relative' }}>
        <BXHeaderName href="javascript:void 0" prefix="SIG">
          HABOUS
        </BXHeaderName>
        <Users />
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

export default Navbar
