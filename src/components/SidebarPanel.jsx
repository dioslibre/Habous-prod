import { h } from 'preact'
import { memo } from 'preact/compat'

/** @jsx h */

const SidebarPanel = memo((props) => {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-blue-600 flex flex-row border border-blue-600 w-full">
        <div className="px-2 text-white my-auto text-base flex-grow">
          {props.header}
        </div>
        {props.navigation}
      </div>
      <div className="flex-grow mb-1">{props.main}</div>
      <div className="m-2 mt-1">{props.action}</div>
    </div>
  )
})

export default SidebarPanel
