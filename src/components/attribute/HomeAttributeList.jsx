import { h, Fragment } from 'preact'
import { useHistory } from 'react-router-dom'
import { useCallback, useEffect } from 'preact/hooks'
import { useStore } from 'effector-react'
import BXButton from 'carbon-web-components/es/components-react/button/button'
import SidebarPanel from '../SidebarPanel'
import AutoSizer from 'react-virtualized-auto-sizer'
import HeatMap32 from '@carbon/icons-react/es/heat-map/32'
import TreeView32 from '@carbon/icons-react/es/tree-view/32'
import Finance32 from '@carbon/icons-react/es/finance/32'
import Policy32 from '@carbon/icons-react/es/policy/32'
import Document32 from '@carbon/icons-react/es/document/32'
import TypePattern32 from '@carbon/icons-react/es/type-pattern/32'

/** @jsx h */

import { dataStores } from '../../store/data'
import { attributeChanged } from '../../store/current'
import ArrowLeft16 from '@carbon/icons-react/es/arrow--left/16'
import { goToAttributeListChanged } from '../../store/navigate'
import Home16 from '@carbon/icons-react/es/home/16'

// const HomeAttributeListAction = () => {
//   return (
//     <BXButton
//       className="shadow-lg float-right"
//       kind={'danger'}
//       disabled={false}
//       size={'sm'}
//       onClick={() => document.getElementById('upload-file').click()}
//     >
//       Importer <Upload16 slot="icon" />
//     </BXButton>
//   )
// }

function HomeAttributeListNavigation() {
  const history = useHistory()
  const goBack = useCallback(
    () => goToAttributeListChanged(false) & history.goBack(),
    [history]
  )

  const goHome = useCallback(
    () => goToAttributeListChanged(false) & history.push(''),
    [history]
  )

  return (
    <Fragment>
      <BXButton
        className="bg-white border-l border-blue-600"
        kind="ghost"
        size="sm"
        onClick={goHome}
      >
        <Home16 />
      </BXButton>
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

const attributes = [
  { name: 'unit', header: 'Unité', icon: HeatMap32 },
  { name: 'conservation', header: 'Conservation', icon: Policy32 },
  { name: 'assign', header: 'Affectation', icon: TreeView32 },
  { name: 'nature', header: 'Consistance', icon: TypePattern32 },
  { name: 'owner', header: 'Propriétaire', icon: Finance32 },
  { name: 'doctype', header: 'Type de Document', icon: Document32 },
]

const HomeAttributeListMain = () => {
  const history = useHistory()
  const navigate = useCallback(
    (name) => attributeChanged(name) & history.push('/attribute-list'),
    [history]
  )

  return (
    <AutoSizer>
      {({ height, width }) => {
        return (
          <div style={{ width, height }} className="bx-scrollable">
            {attributes.map((e, index) => (
              <div key={index} className="w-full flex flex-row p-2">
                <BXButton
                  className="bg-white shadow border-r-2 border-blue-600 max-w-full flex-grow"
                  kind="ghost"
                  size="lg"
                  onClick={() => navigate(e.name)}
                >
                  <div className="text-black text-base">{e.header}</div>{' '}
                  <e.icon slot="icon" />
                </BXButton>
              </div>
            ))}
          </div>
        )
      }}
    </AutoSizer>
  )
}

function HomeAttributeList() {
  const history = useHistory()
  const { data } = useStore(dataStores.$fetchAttributes)

  useEffect(() => data || history.push('/'), [])

  return (
    <SidebarPanel
      header={'Gestion des Attributs'}
      navigation={<HomeAttributeListNavigation />}
      main={<HomeAttributeListMain />}
    />
  )
}

export default HomeAttributeList
