import React from 'react'
// core components
import Admin from 'layouts/Admin.js'
import Auth from 'layouts/Auth'

import { Route, Switch, Redirect } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function Router() {
    const { user } = useSelector((state) => state.auth)
    return (
        <Switch>
            {user ? (
                <>
                    <Route path="/admin" component={Admin} />
                </>
            ) : (
                <>
                    <Route path="/auth" component={Auth} />
                    <Redirect from="/" to="/auth/login" />
                </>
            )}
        </Switch>
    )
}
