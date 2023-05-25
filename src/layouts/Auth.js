import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import 'perfect-scrollbar/css/perfect-scrollbar.css'
// @material-ui/core components
import { makeStyles } from '@material-ui/core/styles'

import { authRoutes } from 'routes.js'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

const switchRoutes = (
    <Switch>
        {authRoutes.map((prop, key) => {
            if (prop.layout === '/auth') {
                return (
                    <Route
                        path={prop.layout + prop.path}
                        component={prop.component}
                        key={key}
                    />
                )
            }
            return null
        })}
        <Redirect from="/auth" to="/auth/login" />
        <Redirect from="/admin" to="/admin/dashboard" />
    </Switch>
)

const useStyles = makeStyles({
    wrapper: {
        minHeight: '100vh',
        display: 'grid',
        placeContent: 'center',
        overflow: 'auto',
    },
})

export default function Auth() {
    //router
    const history = useHistory();
    // styles
    const classes = useStyles()
    // redux 
    const {user} = useSelector(state => state.auth)

if(user){
    history.push('/admin/')
}
    return <div className={classes.wrapper}>{switchRoutes}</div>
}
