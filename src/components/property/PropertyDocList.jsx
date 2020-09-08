import { h, Fragment, createRef } from 'preact'
import { useHistory } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'preact/hooks'
import { useStore } from 'effector-react'
import { memo } from 'preact/compat'
import BXButton from 'carbon-web-components/es/components-react/button/button'
import BXLoading from 'carbon-web-components/es/components-react/loading/loading'
import SidebarPanel from '../SidebarPanel'
import VirtualScroll from '../../library/VirtualScroll'
import AutoSizer from 'react-virtualized-auto-sizer'
import Upload16 from '@carbon/icons-react/es/upload/16'
import { toast } from 'react-toastify'

/** @jsx h */

import { dataStores, fetchPropertyDocumentsFx } from '../../store/data'
import { $property, propertyDocChanged } from '../../store/current'
import ArrowLeft16 from '@carbon/icons-react/es/arrow--left/16'
import { $toUpload, forwardFiles, toUploadChanged } from '../../store/upload'
import { $session } from '../../store/auth'

const PropertyDocListAction = () => {
  const files = useStore($toUpload)
  const user = useStore($session)
  const [elRefs, setElRefs] = useState(
    Array(files.length)
      .fill()
      .map(() => createRef())
  )
  const [count, setCount] = useState()

  useEffect(() => {
    document
      .getElementById('upload-file')
      .addEventListener('change', forwardFiles)
    return () =>
      document
        .getElementById('upload-file')
        .removeEventListener('change', forwardFiles)
  }, [])

  useEffect(() => {
    // add or remove refs
    setElRefs(() =>
      Array(files.length)
        .fill()
        .map(() => createRef())
    )
  }, [files])

  useEffect(() => {
    if (!elRefs?.length) return
    const filesToUpload = $toUpload.getState()
    const id = $property.getState().id
    for (let index = 0; index < elRefs.length; index++) {
      const ref = elRefs[index]
      const file = filesToUpload[index]
      console.log(file.size)
      upload(file, ref, id, user.token)
    }
  }, [elRefs, user])

  useEffect(() => {
    console.log('count', count)
    if (count === undefined) return
    if (count === elRefs.length) {
      setElRefs([])
      toUploadChanged([])
      setCount()
    }
  }, [count, elRefs])

  const upload = (file, ref, id, token) => {
    let data = new FormData()
    data.append('document', file)

    let request = new XMLHttpRequest()
    request.open('POST', `http://localhost:3000/api/document/child_doc/${id}`)
    request.setRequestHeader('Authorization', `Token ${token}`)

    // upload progress event
    request.upload.addEventListener('progress', function (e) {
      // upload progress as percentage
      let completed = e.loaded / e.total
      if (!ref.current) {
        ref.current = toast(file.name, {
          type: 'info',
          progress: completed,
          position: 'bottom-left',
        })
      } else {
        toast.update(ref.current, {
          type: 'info',
          progress: completed,
          position: 'bottom-left',
          render: file.name + ' (' + (completed * 100).toFixed(2) + '%)',
        })
      }
    })

    request.addEventListener('error', () => {
      toast.update(ref.current, {
        position: 'bottom-left',
        type: 'error',
        render: file.name + ' - Erreur',
      })
    })

    // request finished event
    request.addEventListener('load', function () {
      setTimeout(() => toast.dismiss(ref.current), 1000)
      setCount((c) => (c ? c + 1 : 1))
      fetchPropertyDocumentsFx(id)
    })

    // send POST request to server
    request.send(data)
  }

  return (
    <BXButton
      className="shadow-lg float-right w-1/2"
      kind={'danger'}
      size={'sm'}
      onClick={() => document.getElementById('upload-file').click()}
    >
      Importer <Upload16 slot="icon" />
    </BXButton>
  )
}

function PropertyDocListNavigation() {
  const history = useHistory()
  const goBack = useCallback(() => history.goBack(), [history])

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

const PropertyItem = memo(({ index, row }) => {
  const history = useHistory()
  const navigate = useCallback(() => {
    propertyDocChanged(row)
    history.push('/property-document-info')
  }, [history])

  const { data } = useStore(dataStores.$fetchAttributes)

  if (!data) return null

  return (
    <div className="w-full flex flex-row p-2">
      <BXButton
        key={index}
        className="bg-white shadow border-r-2 border-blue-600 max-w-full flex-grow"
        kind="ghost"
        size="large"
        onClick={navigate}
      >
        <div className="flex-row flex">
          <img
            src={
              row.src ||
              `https://placehold.co/60?text=${row.name.split('.').pop()}`
            }
            width={60}
            height={60}
            alt=""
          />
          <div className="ml-4 flex-row">
            <div
              style={{
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
              className="text-base text-black font-bold mb-2 w-56"
            >
              {row.name}
            </div>
            <p className="text-black text-base">
              {(data.doctype.items.find((e) => e.id === row.docTypeId) || {})
                .text || 'Autre Type'}
            </p>
          </div>
        </div>
      </BXButton>
    </div>
  )
})

const PropertyDocListMain = ({ item }) => {
  const { data, error, pending } = useStore(dataStores.$fetchPropertyDocuments)

  if (error || data?.length === 0) return null

  if (!data || pending)
    return <BXLoading className="absolute top-20 left-20" type="regular" />

  return (
    <AutoSizer>
      {({ height, width }) => {
        return (
          <VirtualScroll
            items={data}
            width={width}
            height={height}
            getChildHeight={useCallback(() => 100, [])}
            Item={item}
          />
        )
      }}
    </AutoSizer>
  )
}

function PropertyDocList() {
  const history = useHistory()
  const property = useStore($property)

  useEffect(
    () =>
      property ? fetchPropertyDocumentsFx(property.id) : history.push('/'),
    [property, history]
  )

  return (
    <SidebarPanel
      header={'Documents | Propriété'}
      navigation={<PropertyDocListNavigation />}
      main={<PropertyDocListMain item={PropertyItem} />}
      action={<PropertyDocListAction />}
    />
  )
}

export default PropertyDocList
