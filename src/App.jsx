import { h } from 'preact'

/** @jsx h */

import { Route, withRouter, Switch, useHistory } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import Editor from './pages/Editor'
import Auth from './pages/Auth'
import Print from './pages/Print'
import { useCallback, useEffect } from 'preact/hooks'
import { useStore } from 'effector-react'
import { $session } from './store/auth'
import { $goToPrint } from './store/navigate'
import { fetchAttributesFx } from './store/data'

const App = ({ location }) => {
  const history = useHistory()
  const goToPrint = useStore($goToPrint)
  const user = useStore($session)

  const navigate = useCallback((path) => history.push(path), [history])

  useEffect(() => {
    if (!user) navigate('/')
    else fetchAttributesFx() & navigate('/editor')
  }, [user])

  useEffect(() => goToPrint && navigate('/print'), [goToPrint])

  const key = location.pathname.split('/')[1]

  return (
    <div className="h-full">
      <TransitionGroup className="transition-group h-full">
        <CSSTransition
          key={key}
          timeout={{ enter: 500, exit: 500 }}
          classNames="fast"
        >
          <div className="route-div h-full flex flex-col">
            <Switch location={location}>
              <Route exact path="/" component={Auth} />
              <Route path="/editor" component={Editor} />
              <Route path="/print" component={Print} />
            </Switch>
          </div>
        </CSSTransition>
      </TransitionGroup>
      <ToastContainer />
    </div>
  )
}
export default withRouter(App)
