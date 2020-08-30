import { h } from 'preact'
import { useEffect } from 'preact/hooks'

/** @jsx h */

function ParentNew() {
  useEffect(() => setTimeout(() => history.push('/parent-document'), 2000), [])

  return <div>ParentPolygon Page</div>
}

export default ParentNew
