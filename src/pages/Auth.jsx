import { h } from 'preact'
import { useEffect, useCallback, useRef } from 'preact/hooks'
import { useHistory } from 'react-router-dom'
import emblem from '../emblem.png'
import BXInput from 'carbon-web-components/es/components-react/input/input'
import { $login, loginChanged, passwordChanged, $password } from '../store/auth'
import { useStore } from 'effector-react'
import BXButton from 'carbon-web-components/es/components-react/button/button'
import Login20 from '@carbon/icons-react/es/login/20'
import User20 from '@carbon/icons-react/es/user/20'
import Password20 from '@carbon/icons-react/es/password/20'
import logo from '../logo.png'

/** @jsx h */

function Auth() {
  const history = useHistory()
  const navigate = useCallback(() => history.push('/editor'), [history])

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
          <img
            className="mx-auto mb-4"
            src={emblem}
            alt="Royaume du Maroc"
            width="300"
            height="300"
          />
          <div className="text-lg text-center">
            <p className="">المملكة المغربية</p>
            <p>وزارة الأوقاف والشؤون الاسلامية</p>
            <p>نظارة أوقاف الدار البيضاء</p>
            <p>مصلحة الإستثمار و المحافظة على الأوقاف</p>
          </div>
          <Login />
          <Password />
          <BXButton
            className="mt-4 mx-auto w-40"
            disabled={false}
            onClick={navigate}
          >
            Se Connecter <Login20 slot="icon" />
          </BXButton>
        </div>
      </div>
    </div>
  )
}

function Login() {
  const ref = useRef()
  const value = useStore($login)

  useEffect(() => {
    if (!ref?.current) return
    let input = ref.current.shadowRoot.querySelector('.bx--text-input')
    input.focus()
  }, [ref])

  return (
    <div className="shadow-md flex flex-row my-2">
      <BXButton disabled={true} size="sm" className="h-10 w-12 min-w-0 mt-3">
        <User20 slot="icon" />
      </BXButton>
      <BXInput
        ref={ref}
        value={value}
        colorScheme={'light'}
        placeholder="Login"
        onInput={(event) => loginChanged(event.target.value)}
      ></BXInput>
    </div>
  )
}

function Password() {
  const value = useStore($password)
  return (
    <div className="shadow-md flex flex-row my-2">
      <BXButton disabled={true} size="sm" className="h-10 w-12 min-w-0 mt-3">
        <Password20 slot="icon" />
      </BXButton>
      <BXInput
        value={value}
        colorScheme={'light'}
        placeholder="Mot de Passe"
        onInput={(event) => passwordChanged(event.target.value)}
      ></BXInput>
    </div>
  )
}

export default Auth
