import { h, Fragment } from 'preact'
import { useCallback, useEffect } from 'preact/hooks'
import BXButton from 'carbon-web-components/es/components-react/button/button'
import SidebarPanel from '../SidebarPanel'
import Close16 from '@carbon/icons-react/es/close/16'
import Checkmark16 from '@carbon/icons-react/es/checkmark/16'
import { useStore } from 'effector-react'
import { $userFormatted } from '../../store/current'
import ArrowLeft16 from '@carbon/icons-react/es/arrow--left/16'
import BXInput from 'carbon-web-components/es/components-react/input/input'
import BXDropdown from 'carbon-web-components/es/components-react/dropdown/dropdown'
import BXDropdownItem from 'carbon-web-components/es/components-react/dropdown/dropdown-item'
import { dataStores, fetchUsersFx, registerUserFx } from '../../store/data'
import { newUserStores, newUserEvents, $newUser } from '../../store/new'
import { useHistory } from 'react-router-dom'
import BXLoading from 'carbon-web-components/es/components-react/loading/loading'

/** @jsx h */

const UserNewAction = () => {
  const history = useHistory()
  const goBack = useCallback(() => history.goBack(), [history])

  const userNew = useStore($newUser)
  const { pending, data } = useStore(dataStores.$patchDocument)

  console.log(data)

  const save = useCallback(async () => {
    await registerUserFx(userNew)
    await fetchUsersFx()
    history.goBack()
  }, [userNew, history])

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

function UserNewNavigation() {
  const history = useHistory()
  const goBack = useCallback(() => history.goBack(), [history])
  const user = useStore($userFormatted)

  useEffect(() => user || history.push('/user-lists'), [])

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

const UserNewMain = () => {
  const user = useStore($userFormatted)

  if (!user) return null

  return (
    <div className="p-2 bx-scrollable overflow-auto h-full w-full">
      <Name />
      <Email />
      <Password />
      <RoleCombo data={roles} />
    </div>
  )
}

function UserNew() {
  return (
    <SidebarPanel
      header={'Newion | Utilisateur'}
      navigation={<UserNewNavigation />}
      main={<UserNewMain />}
      action={<UserNewAction />}
    />
  )
}

export default UserNew

function Email() {
  const value = useStore(newUserStores.email)
  return (
    <div className="flex flex-row mx-4 my-3">
      <div className="mr-auto mt-4 my-auto whitespace-wrap">Email/Login</div>
      <div className="shadow-md p-0 my-auto w-4/6">
        <BXInput
          value={value}
          colorScheme={'light'}
          size="sm"
          placeholder="Email/Login"
          onInput={(event) => newUserEvents['emailChanged'](event.target.value)}
        />
      </div>
    </div>
  )
}

function Password() {
  const value = useStore(newUserStores.password)
  return (
    <div className="flex flex-row mx-4 my-3">
      <div className="mr-auto mt-4 my-auto whitespace-wrap">Mot de Passe</div>
      <div className="shadow-md p-0 my-auto w-4/6">
        <BXInput
          type="password"
          value={value}
          colorScheme={'light'}
          size="sm"
          placeholder="Mot de Passe"
          onInput={(event) =>
            newUserEvents['passwordChanged'](event.target.value)
          }
        />
      </div>
    </div>
  )
}

function RoleCombo({ data }) {
  const role = useStore(newUserStores.role)
  return (
    <div className="flex mx-4 my-4 flex-row">
      <div className="mr-auto my-auto">Role</div>
      <div className="shadow-md w-4/6">
        <BXDropdown
          colorScheme={'light'}
          trigger-content={'Role'}
          size={'sm'}
          onSelect={(event) =>
            newUserEvents.roleChanged(event?.detail?.item?.value)
          }
          value={role}
        >
          <BXDropdownItem>Role</BXDropdownItem>
          {data.map((e) => (
            <BXDropdownItem key={e.id} value={e.id}>
              {e.header}
            </BXDropdownItem>
          ))}
        </BXDropdown>
      </div>
    </div>
  )
}

function Name() {
  const value = useStore(newUserStores.name)
  return (
    <div className="flex mx-4 my-3 flex-row">
      <div className="mr-auto mt-4 my-auto">Nom</div>
      <div className="shadow-md w-4/6">
        <BXInput
          value={value}
          colorScheme={'light'}
          size="sm"
          placeholder="ID"
          onInput={(event) => newUserEvents['nameChanged'](event.target.value)}
        ></BXInput>
      </div>
    </div>
  )
}
