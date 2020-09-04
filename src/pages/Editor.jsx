import { h } from 'preact'
import Viewport from '../editor/Viewport'
import { BrowserRouter, useHistory } from 'react-router-dom'
import Navbar from '../editor/Navbar'
import Sidebar from '../editor/Sidebar'
import Searchbar from '../editor/Searchbar'
import { $session } from '../store/auth'
import { useStore } from 'effector-react'
import { useCallback, useEffect } from 'preact/hooks'
import { fetchAttributesFx, fetchPropertiesFx } from '../store/data'

/** @jsx h */

function Editor() {
  const history = useHistory()
  const user = useStore($session)

  const navigate = useCallback(() => history.push('/'), [history])

  useEffect(async () => {
    if (!user.token) navigate()

    await fetchAttributesFx()
    await fetchPropertiesFx()
  }, [user])

  return (
    <div className="flex-grow flex flex-col">
      <Navbar />
      <Searchbar />
      <div className="flex-grow w-full flex flex-row">
        <Viewport />
        <BrowserRouter basename="/editor">
          <Sidebar />
        </BrowserRouter>
      </div>
    </div>
  )
}

export default Editor
