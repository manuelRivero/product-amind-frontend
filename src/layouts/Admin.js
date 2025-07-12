import React from 'react'
import { Switch, Route } from 'react-router-dom'
// creates a beautiful scrollbar
import PerfectScrollbar from 'perfect-scrollbar'
import 'perfect-scrollbar/css/perfect-scrollbar.css'
// @material-ui/core components
import { makeStyles } from '@material-ui/core/styles'
// core components
import Navbar from 'components/Navbars/Navbar.js'
import Sidebar from 'components/Sidebar/Sidebar.js'
// import FixedPlugin from 'components/FixedPlugin/FixedPlugin.js'

import { dashboardRoutes } from 'routes.js'

import styles from 'assets/jss/material-dashboard-react/layouts/adminStyle.js'
import { getConfigRequest, setStoreTenant } from '../store/config'
import { useDispatch, useSelector } from 'react-redux'
import LoadinScreen from '../components/LoadingScreen'
import { usePermissions } from '../hooks/usePermissions'
import PermissionError from '../components/PermissionError'

let ps

const mainRoutes = dashboardRoutes.map((prop, key) => {
    if (prop.layout === '/admin') {
        return (
            <Route
                exact
                path={prop.layout + prop.path}
                component={prop.component}
                key={key}
            ></Route>
        )
    }
    return null
})

const childRoutes = dashboardRoutes.map((prop) => {
    return prop.childrens
        ? prop.childrens.map((e, i) => {
              // console.log("e", prop.layout + prop.path + e.path)
              return (
                  <Route
                      path={prop.layout + prop.path + e.path}
                      component={e.component}
                      key={`child-${e.path}-${i}`}
                  />
              )
          })
        : null
})

const useStyles = makeStyles(styles)

export default function Admin({ ...rest }) {
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const { configDetail, error: configError, errorDetails } = useSelector((state) => state.config)
    const { 
        isSubscriptionActive, 
        isPaymentAuthorized, 
        loadingConfig: loadingConfigPermissions,
        permissionsError,
        hasUserPermission
    } = usePermissions()
    // styles
    const classes = useStyles()
    // ref to help us initialize PerfectScrollbar on windows devices
    const mainPanel = React.createRef()
    // states and functions
    const [tenant, setTenant] = React.useState(null)
    const [loadingTenant, setLoadingTenant] = React.useState(true)
    const [loadingConfig, setLoadingConfig] = React.useState(true)
    const [configRequested, setConfigRequested] = React.useState(false)
    const [color] = React.useState('blue')
    const [mobileOpen, setMobileOpen] = React.useState(false)
    const [error, setError] = React.useState(null)

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen)
    }

    const resizeFunction = () => {
        if (window.innerWidth >= 960) {
            setMobileOpen(false)
        }
    }
    const handleDashboardRoutes = () => {
        return dashboardRoutes.filter((prop) => {
            // Verificar si es una ruta de admin
            const isAdminRoute = prop.layout === '/admin'
            
            // Verificar suscripción activa
            const hasSubscription = !prop.needConfig || (prop.needConfig && isSubscriptionActive)
            
            // Verificar permisos de usuario
            let hasPermission = true
            if (prop.permission) {
                hasPermission = hasUserPermission(prop.permission.resource, prop.permission.action)
            }
            
            return isAdminRoute && hasSubscription && hasPermission
        })
    }
    React.useEffect(() => {
        if(mainPanel.current === null) {
            return
        }
        if (navigator.platform.indexOf('Win') > -1) {
            ps = new PerfectScrollbar(mainPanel.current, {
                suppressScrollX: true,
                suppressScrollY: false,
            })
            document.body.style.overflow = 'hidden'
        }
        window.addEventListener('resize', resizeFunction)
        // Specify how to clean up after this effect:
        return function cleanup() {
            if (navigator.platform.indexOf('Win') > -1) {
                ps.destroy()
            }
            window.removeEventListener('resize', resizeFunction)
        }
    }, [mainPanel])

    React.useEffect(() => {
        const verifyTenant = async () => {
            try {
                // Use fetch to verify if the subdomain exists
                setLoadingTenant(true)
                setError(null) // Reset error state
                const response = await fetch(
                    `/tenant/verify-tenant-admin?subdomain=${subdomain}`
                )
                console.log('parseResponse', response)
                if (response.ok) {
                    console.log('valid subdomain')
                    setTenant(subdomain)
                    dispatch(setStoreTenant(subdomain))
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
                }
            } catch (error) {
                console.error('Error fetching tenant:', error)
                setError({
                    type:'tenant',
                    message: 'Hubo un error cargando la configuración de su tienda, por favor refresque la pagina, si el problema persiste contactese con soporte.',
                })
                setTenant(null)
            } finally {
                setLoadingTenant(false)
            }
        }
        const subdomain = window.location.hostname.split('.')[0]
        if (subdomain) {
            verifyTenant(subdomain)
        } else {
            console.error('Tenant not found')
            setError({
                type:'tenant',
                message: 'No se pudo identificar la tienda. Verifique la URL e intente nuevamente.',
            })
            setLoadingTenant(false)
        }
    }, [])

    const getConfig = React.useCallback(async () => {
        try {
            if (!user?.token) {
                throw new Error('No hay token de usuario disponible')
            }
            if (configRequested) {
                return // Evitar llamadas duplicadas
            }
            setConfigRequested(true)
            setLoadingConfig(true)
            setError(null) // Reset error state
            await dispatch(getConfigRequest({ access: user.token }))
        } catch (error) {
            console.error('Error fetching config:', error)
            setError({
                type:'config',
                message: 'Hubo un error cargando la configuración de su tienda, por favor refresque la pagina, si el problema persiste contactese con soporte.',
            })
        } finally {
            setLoadingConfig(false)
        }
    }, [user?.token, dispatch, configRequested])

    React.useEffect(() => {
        // Only get config if tenant is loaded and user has token
        if (tenant && user?.token) {
            getConfig()
        }
    }, [tenant, user?.token, getConfig])

    // Handle config errors from Redux store
    React.useEffect(() => {
        if (configError && errorDetails) {
            setError({
                type: 'config',
                message: errorDetails.message || 'Hubo un error cargando la configuración de su tienda, por favor refresque la pagina, si el problema persiste contactese con soporte.',
            })
        }
    }, [configError, errorDetails])



    if (loadingTenant || loadingConfig || loadingConfigPermissions) {
        return <LoadinScreen />
    }

    if (error) {
        return (
            <div className={classes.wrapper}>
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100vh',
                    padding: '20px',
                    textAlign: 'center'
                }}>
                    <h2 style={{ color: '#f44336', marginBottom: '20px' }}>
                        {error.type === 'tenant' ? 'Error de Conexión' : 'Error de Configuración'}
                    </h2>
                    <p style={{ marginBottom: '30px', fontSize: '16px' }}>
                        {error.message}
                    </p>
                    <button 
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#1976d2',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        Refrescar Página
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className={classes.wrapper}>
            <Sidebar
                routes={handleDashboardRoutes()}
                handleDrawerToggle={handleDrawerToggle}
                open={mobileOpen}
                color={color}
                {...rest}
            />
            <div className={classes.mainPanel} ref={mainPanel}>
                <Navbar
                    routes={handleDashboardRoutes()}
                    handleDrawerToggle={handleDrawerToggle}
                    {...rest}
                />
                {/* On the /maps route we want the map to be on full screen - this is not possible if the content and conatiner classes are present because they have some paddings which would make the map smaller */}
                <div className={classes.content}>
                    <div className={classes.container}>
                        {/* {console.log("childRoutes", childRoutes)} */}
                        {tenant && !error && (
                            <>
                                <Switch>
                                    {mainRoutes}
                                    {childRoutes}
                                </Switch>
                                {/* Mensaje cuando no hay suscripción activa */}
                                {configDetail && !isSubscriptionActive && configDetail?.subscriptionDetail?.subscription && (
                                    <div style={{
                                        position: 'fixed',
                                        bottom: '20px',
                                        right: '20px',
                                        backgroundColor: '#fff3cd',
                                        border: '1px solid #ffeaa7',
                                        borderRadius: '8px',
                                        padding: '15px',
                                        maxWidth: '300px',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                        zIndex: 1000
                                    }}>
                                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                                            ⚠️ Suscripción pendiente
                                        </div>
                                        <div style={{ fontSize: '14px' }}>
                                            {isPaymentAuthorized 
                                                ? 'Tu pago está autorizado. Espera a que se procese.'
                                                : 'Activa tu suscripción para acceder a todas las funciones.'
                                            }
                                        </div>
                                    </div>
                                )}
                                
                                {/* Mensaje de error de permisos */}
                                {permissionsError && (
                                    <div style={{
                                        position: 'fixed',
                                        top: '20px',
                                        right: '20px',
                                        zIndex: 1001
                                    }}>
                                        <PermissionError 
                                            message="Error al cargar permisos"
                                            showDetails={false}
                                            showRetry={true}
                                            style={{ maxWidth: '350px' }}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
