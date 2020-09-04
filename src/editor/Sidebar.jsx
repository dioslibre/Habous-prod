import { h } from 'preact'
// import { useCallback } from 'preact/hooks'
// import { memo } from 'preact/compat'

/** @jsx h */
// import Header from './components/Header'
import { Route, withRouter, Switch, useHistory } from 'react-router-dom'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import PropertyList from '../components/property/PropertyList'
import ParentInfo from '../components/parent/ParentInfo'
import ParentEdit from '../components/parent/ParentEdit'
import PropertyEdit from '../components/property/PropertyEdit'
import PropertyInfo from '../components/property/PropertyInfo'
import PropertyDocList from '../components/property/PropertyDocList'
import ParentDocList from '../components/parent/ParentDocList'
import ParentList from '../components/parent/ParentList'
import Print from '../pages/Print'
import ParentDocInfo from '../components/parent/ParentDocInfo'
import ParentDocEdit from '../components/parent/ParentDocEdit'
import PropertyDocInfo from '../components/property/PropertyDocInfo'
import PropertyDocEdit from '../components/property/PropertyDocEdit'
import { useCallback, useEffect } from 'preact/hooks'
import { $goToAttributeList, $goToUserList } from '../store/navigate'
import { useStore } from 'effector-react'
import HomeAttributeList from '../components/attribute/HomeAttributeList'
import AttributeList from '../components/attribute/AttributeList'
import UserList from '../components/user/UserList'
import UserEdit from '../components/user/UserEdit'
import PropertyNew from '../components/property/PropertyNew'
import ParentNew from '../components/parent/ParentNew'
import UserNew from '../components/user/UserNew'

const Sidebar = ({ location }) => {
  const history = useHistory()
  const goToAttributeList = useStore($goToAttributeList)
  const goToUserList = useStore($goToUserList)

  const navigate = useCallback((path) => history.push(path), [history])

  // const navigate = useCallback(() => history.push(), [
  //   history,
  // ])

  useEffect(() => goToAttributeList && navigate('/home-attribute-list'), [
    goToAttributeList,
  ])
  useEffect(() => goToUserList && navigate('/user-list'), [goToUserList])

  return (
    <div className="m-0 p-0 w-92 flex flex-col">
      <TransitionGroup className="transition-group h-full">
        <CSSTransition
          key={location.key}
          timeout={{ enter: 300, exit: 300 }}
          classNames="fast"
        >
          <div className="route-div h-full">
            <div className="flex flex-col h-full">
              <Switch location={location}>
                <Route exact path="/" component={PropertyList} />
                <Route
                  path="/home-attribute-list"
                  component={HomeAttributeList}
                />
                <Route path="/attribute-list" component={AttributeList} />
                <Route path="/user-list" component={UserList} />
                <Route path="/property-list" component={PropertyList} />
                <Route path="/parent-list" component={ParentList} />
                <Route path="/parent-info" component={ParentInfo} />
                <Route path="/parent-edit" component={ParentEdit} />
                <Route path="/parent-new" component={ParentNew} />
                <Route path="/property-new" component={PropertyNew} />
                <Route path="/property-edit" component={PropertyEdit} />
                <Route path="/property-info" component={PropertyInfo} />
                <Route path="/user-new" component={UserNew} />
                <Route path="/user-edit" component={UserEdit} />
                <Route path="/property-document" component={PropertyDocList} />
                <Route path="/parent-document" component={ParentDocList} />
                <Route
                  path="/property-document-info"
                  component={PropertyDocInfo}
                />
                <Route
                  path="/property-document-edit"
                  component={PropertyDocEdit}
                />
                <Route path="/parent-document-info" component={ParentDocInfo} />
                <Route path="/parent-document-edit" component={ParentDocEdit} />
                <Route path="/print" component={Print} />
                <Route path="*" component={PropertyList} />
              </Switch>
            </div>
          </div>
        </CSSTransition>
      </TransitionGroup>
    </div>
  )
}

export default withRouter(Sidebar)
