import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import 'perfect-scrollbar/css/perfect-scrollbar.css'
// @material-ui/core components
import { makeStyles } from '@material-ui/core/styles'

import { authRoutes } from 'routes.js'

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
    // styles
    const classes = useStyles()

    return <div className={classes.wrapper}>{switchRoutes}</div>
}
