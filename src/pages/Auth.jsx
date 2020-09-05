import { h, Fragment } from 'preact'
import { useEffect, useCallback, useRef } from 'preact/hooks'
import { useHistory } from 'react-router-dom'
import BXInput from 'carbon-web-components/es/components-react/input/input'
import {
  $email,
  emailChanged,
  passwordChanged,
  $password,
  sessionChanged,
} from '../store/auth'
import { useStore } from 'effector-react'
import BXButton from 'carbon-web-components/es/components-react/button/button'
import Login20 from '@carbon/icons-react/es/login/20'
import User20 from '@carbon/icons-react/es/user/20'
import Password20 from '@carbon/icons-react/es/password/20'
import logo from '../logo.png'
import { fetchUserFx, dataStores } from '../store/data'
import BXLoading from 'carbon-web-components/es/components-react/loading/loading'
import { toast } from 'react-toastify'

/** @jsx h */

function Auth() {
  return (
    <div className="h-full flex-row flex">
      <div className="h-full w-1/2 bg-blue-600 flex items-center">
        <div className="mx-auto flex flex-col">
          <img
            className="mx-auto mb-4"
            src={logo}
            alt="Royaume du Maroc"
            width="300"
            height="300"
          />
          <div className="text-6xl text-white mx-auto">SIG-HABOUS</div>
        </div>
      </div>
      <div className="h-full w-1/2 flex items-center">
        <div className="flex flex-col w-4/6 mx-auto">
          <Email />
          <Password />
          <Login />
        </div>
      </div>
    </div>
  )
}

function Email() {
  const { pending } = useStore(dataStores.$fetchUser)
  const ref = useRef()
  const value = useStore($email)

  useEffect(() => {
    if (!ref?.current) return
    let input = ref.current.shadowRoot.querySelector('.bx--text-input')
    input.focus()
  }, [ref])

  return (
    <div className="shadow-md flex flex-row my-2">
      <div
        disabled={true}
        size="sm"
        className="h-10 bg-blue-600 w-12 min-w-0 mt-3"
      >
        <User20 className="mx-auto mt-3 text-white" />
      </div>
      <BXInput
        ref={ref}
        disabled={pending}
        value={value}
        colorScheme={'light'}
        placeholder="Login"
        onInput={(event) => emailChanged(event.target.value)}
      ></BXInput>
    </div>
  )
}

function Password() {
  const { pending } = useStore(dataStores.$fetchUser)
  const value = useStore($password)

  return (
    <div className="shadow-md flex flex-row my-2">
      <div
        disabled={true}
        size="sm"
        className="h-10 bg-blue-600 w-12 min-w-0 mt-3"
      >
        <Password20 className="mx-auto mt-3 text-white" />
      </div>
      <BXInput
        type="password"
        value={value}
        disabled={pending}
        colorScheme={'light'}
        placeholder="Mot de Passe"
        onInput={(event) => passwordChanged(event.target.value)}
      ></BXInput>
    </div>
  )
}

function Login() {
  const history = useHistory()
  const navigate = useCallback(() => history.push('/editor'), [history])
  const email = useStore($email)
  const password = useStore($password)
  const { pending } = useStore(dataStores.$fetchUser)

  const login = useCallback(async () => {
    const user = await fetchUserFx({ email, password })
    if (user) sessionChanged(user) & navigate()
    else toast('Erreur Login', { type: 'error', autoClose: 2000 })
  }, [email, password])

  return (
    <BXButton
      size={'large'}
      disabled={pending}
      className="mt-4 mx-auto w-56"
      onClick={login}
    >
      {pending ? (
        <BXLoading className="left-5 absolute" type="small" />
      ) : (
        <Fragment>
          Se Connecter <Login20 slot="icon" />
        </Fragment>
      )}
    </BXButton>
  )
}

export default Auth
