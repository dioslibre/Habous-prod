import { h, Fragment, createRef } from 'preact'
import { useHistory } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'preact/hooks'
import BXButton from 'carbon-web-components/es/components-react/button/button'
import SidebarPanel from '../SidebarPanel'
import Edit16 from '@carbon/icons-react/es/edit/16'
import TrashCan16 from '@carbon/icons-react/es/trash-can/16'
import BXTable from 'carbon-web-components/es/components-react/data-table/table'
import BXTableBody from 'carbon-web-components/es/components-react/data-table/table-body'
import BXTableRow from 'carbon-web-components/es/components-react/data-table/table-row'
import BXTableCell from 'carbon-web-components/es/components-react/data-table/table-cell'
import { useStore } from 'effector-react'
import {
  $parentDocFormatted,
  $parentDoc,
  $parentFormatted,
} from '../../store/current'
import AutoSizer from 'react-virtualized-auto-sizer'
import ArrowLeft16 from '@carbon/icons-react/es/arrow--left/16'
import Download16 from '@carbon/icons-react/es/download/16'
import { toast } from 'react-toastify'
import { patchDocumentFx, fetchParentDocumentsFx } from '../../store/data'
import Close20 from '@carbon/icons-react/es/close/20'
import Checkmark20 from '@carbon/icons-react/es/checkmark/20'

/** @jsx h */

const ParentDocInfoAction = () => {
  const [remove, setRemove] = useState(false)
  const history = useHistory()
  const navigate = useCallback((path) => history.push(path), [history])
  const doc = useStore($parentDoc)

  const download = (file) => {
    const ref = createRef()
    let request = new XMLHttpRequest()
    request.open(
      'GET',
      `http://localhost:3000/api/document/child_doc/${file.id}`
    )
    request.responseType = 'blob'

    // upload progress event
    request.addEventListener('progress', function (e) {
      // upload progress as percentage
      let completed = e.loaded / e.total
      if (!ref.current) {
        ref.current = toast(file.name, {
          progress: completed,
          position: 'bottom-left',
        })
      } else {
        toast.update(ref.current, {
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
      })
    })

    // request finished event
    request.addEventListener('load', function () {
      // HTTP status message (200, 404 etc)
      // console.log(request.status)
      window.saveAs(request.response, file.name)

      // request.response holds response from the server
      // console.log(request.response)

      toast.dismiss(ref.current)
    })

    // send POST request to server
    request.send()
  }

  const save = useCallback(async () => {
    await patchDocumentFx({ model: 'child', data: { ...doc, deleted: true } })
    fetchParentDocumentsFx(doc.ownerId)
    history.goBack()
  }, [doc, history])

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-row">
        <BXButton
          className="shadow-lg flex-grow"
          kind={'primary'}
          disabled={false}
          size={'sm'}
          onClick={() => navigate('/parent-document-edit')}
        >
          Modifier <Edit16 slot="icon" />
        </BXButton>
        <BXButton
          className="shadow-lg flex-grow"
          kind={'ghost'}
          disabled={false}
          size={'sm'}
          onClick={() => download(doc)}
        >
          Télécharger <Download16 slot="icon" />
        </BXButton>
        {remove ? (
          <Fragment>
            <BXButton size={'sm'} kind="ghost" onClick={() => setRemove(false)}>
              <Close20 />
            </BXButton>
            <BXButton size={'sm'} kind="ghost" onClick={save}>
              <div className="text-red-600">
                <Checkmark20 />
              </div>
            </BXButton>
          </Fragment>
        ) : (
          <BXButton
            className="shadow-lg flex-grow"
            kind={'danger'}
            disabled={false}
            size={'sm'}
            onClick={() => setRemove(true)}
          >
            Supprimer <TrashCan16 slot="icon" />
          </BXButton>
        )}
      </div>
    </div>
  )
}

function ParentDocInfoNavigation() {
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

const ParentDocInfoMain = () => {
  const doc = useStore($parentDoc)
  const parent = useStore($parentFormatted)
  const docF = useStore($parentDocFormatted)

  useEffect(() => doc || history.push('/parent-info'), [doc])

  return (
    <div className="p-4 bx-scrollable overflow-auto h-full w-full">
      <AutoSizer>
        {({ height, width }) => {
          return (
            <div style={{ height: height, width: width }}>
              <div style={{ height: 300 }}>
                <img
                  className="mx-auto my-auto"
                  src={
                    doc.src ||
                    `https://placehold.co/300?text=${doc.name.split('.').pop()}`
                  }
                  width={300}
                  alt=""
                />
              </div>
              <BXTable size={'short'} className="shadow-md mt-4">
                <BXTableBody colorScheme={'zebra'}>
                  <BXTableRow>
                    <BXTableCell className="font-bold text-base">
                      Unité
                    </BXTableCell>
                    <BXTableCell className="font-bold text-base">
                      {parent.find((e) => e.id === 'Unité').text}
                    </BXTableCell>
                  </BXTableRow>
                  <BXTableRow>
                    <BXTableCell className="font-bold text-base">
                      ID
                    </BXTableCell>
                    <BXTableCell className="font-bold text-base">
                      {parent.find((e) => e.id === 'ID').text}
                    </BXTableCell>
                  </BXTableRow>
                  <BXTableRow>
                    <BXTableCell className="font-bold text-base">
                      {docF[0].id}
                    </BXTableCell>
                    <BXTableCell className="font-bold text-base">
                      {docF[0].text}
                    </BXTableCell>
                  </BXTableRow>
                  {docF.slice(1).map((e) => (
                    <BXTableRow key={e.id}>
                      <BXTableCell className="font-bold">{e.id}</BXTableCell>
                      <BXTableCell>{e.text}</BXTableCell>
                    </BXTableRow>
                  ))}
                </BXTableBody>
              </BXTable>
            </div>
          )
        }}
      </AutoSizer>
    </div>
  )
}

function ParentDocInfo() {
  return (
    <SidebarPanel
      header={'Attributs | Document | Assiette'}
      navigation={<ParentDocInfoNavigation />}
      main={<ParentDocInfoMain />}
      action={<ParentDocInfoAction />}
    />
  )
}

export default ParentDocInfo
