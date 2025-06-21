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
                console.log("auth route", prop)
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
        <Redirect from="/" to="/auth/login" />
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
    console.log("auth routes")
    // styles
    const classes = useStyles()

    return <div className={classes.wrapper}>{switchRoutes}</div>
}
