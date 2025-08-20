import React from 'react'
// core components
import Admin from 'layouts/Admin.js'
import Auth from 'layouts/Auth'
import TenantError from 'views/TenantError'

import { Route, Switch, Redirect } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { hasValidTenant } from 'utils/tenant'

export default function Router() {
    const { user } = useSelector((state) => state.auth)
    
    // Verificar si hay un tenant válido
    const validTenant = hasValidTenant()
    
    // Si no hay tenant válido, mostrar pantalla de error
    if (!validTenant) {
        return <TenantError />
    }
    
    return (
        <Switch>
            {user ? (
                <>
                    <Route path="/admin" component={Admin} />
                    <Redirect from="/" to="/admin" />
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
