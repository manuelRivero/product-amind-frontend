import React from 'react'
import PropTypes from 'prop-types'
// core components
import Admin from 'layouts/Admin.js'
import Auth from 'layouts/Auth'
import TenantError from 'views/TenantError'

import { Route, Switch, Redirect, useLocation, useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { hasValidTenant } from 'utils/tenant'

// Componente Redirect personalizado que preserva query parameters
const RedirectWithQuery = ({ to }) => {
    const location = useLocation()
    const history = useHistory()
    
    
    React.useEffect(() => {
        // Preservar los query parameters si existen
        const newPath = to + (location.search || '')
        history.replace(newPath)
    }, [to, location.search, history]) // Incluir dependencias necesarias
    
    return null
}

RedirectWithQuery.propTypes = {
    to: PropTypes.string.isRequired,
}

export default function Router() {
    const { user } = useSelector((state) => state.auth)
    
    // Verificar si hay un tenant válido
    const validTenant = hasValidTenant()
    
    // Si no hay tenant válido, mostrar pantalla de error
    if (!validTenant) {
        return <TenantError />
    }
    
    return (
        <>
            <Switch>
                {user ? (
                    <>
                    {console.log("user routes")}
                        <Route path="/admin" component={Admin} />
                        <Route exact path="/">
                            <RedirectWithQuery from="/" to="/admin/inicio" />
                        </Route>
                    </>
                ) : (
                    <>
                        <Route path="/auth" component={Auth} />
                        <Redirect from="/" to="/auth/login" />
                    </>
                )}
            </Switch>
        </>
    )
}
