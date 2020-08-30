import { h } from 'preact'
import Viewport from '../editor/Viewport'
import { BrowserRouter } from 'react-router-dom'
import Navbar from '../editor/Navbar'
import Sidebar from '../editor/Sidebar'
import Searchbar from '../editor/Searchbar'

/** @jsx h */

function Editor() {
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
