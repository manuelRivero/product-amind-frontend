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
    // styles
    const classes = useStyles()
    // ref to help us initialize PerfectScrollbar on windows devices
    const mainPanel = React.createRef()
    // states and functions
    const [tenant, setTenant] = React.useState(null)
    const [loadingTenant, setLoadingTenant] = React.useState(true)
    const [loadingConfig, setLoadingConfig] = React.useState(true)
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
            // Usar la misma lógica de validación que en Activation
            const subscriptionDetail = configDetail?.subscriptionDetail
            const isActivate = subscriptionDetail?.hasActiveSubscription ?? false
            const paymentStatus = subscriptionDetail?.subscription?.paymentStatus
            const subscription = subscriptionDetail?.subscription
            
            // Validaciones según el estado real del pago
            const isPaymentApproved = paymentStatus === 'approved' && subscription
            
            // La suscripción está realmente activa solo si está aprobada o si hasActiveSubscription es true
            const isSubscriptionActive = isActivate || isPaymentApproved

            return (
                prop.layout === '/admin' &&
                (!prop.needConfig || (prop.needConfig && isSubscriptionActive))
            )
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

    React.useEffect(() => {
        const getConfig = async () => {
            try {
                if (!user?.token) {
                    throw new Error('No hay token de usuario disponible')
                }
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
        }

        // Only get config if tenant is loaded and user has token
        if (tenant && user?.token) {
            getConfig()
        }
    }, [tenant, user?.token])

    // Handle config errors from Redux store
    React.useEffect(() => {
        if (configError && errorDetails) {
            setError({
                type: 'config',
                message: errorDetails.message || 'Hubo un error cargando la configuración de su tienda, por favor refresque la pagina, si el problema persiste contactese con soporte.',
            })
        }
    }, [configError, errorDetails])

    console.log('loadingTenant', loadingTenant)
    console.log('loadingConfig', loadingConfig)
    
    // Debug info para validación de suscripción
    if (configDetail) {
        const subscriptionDetail = configDetail?.subscriptionDetail
        const isActivate = subscriptionDetail?.hasActiveSubscription ?? false
        const paymentStatus = subscriptionDetail?.subscription?.paymentStatus
        const isPaymentApproved = paymentStatus === 'approved' && subscriptionDetail?.subscription
        const isSubscriptionActive = isActivate || isPaymentApproved
        
        console.log('Subscription Debug:', {
            hasActiveSubscription: isActivate,
            paymentStatus: paymentStatus,
            isPaymentApproved: isPaymentApproved,
            isSubscriptionActive: isSubscriptionActive,
            routesFiltered: dashboardRoutes.filter(prop => 
                prop.layout === '/admin' && 
                (!prop.needConfig || (prop.needConfig && isSubscriptionActive))
            ).length,
            availableRoutes: dashboardRoutes.filter(prop => 
                prop.layout === '/admin' && 
                (!prop.needConfig || (prop.needConfig && isSubscriptionActive))
            ).map(route => route.name)
        })
    }

    if (loadingTenant || loadingConfig) {
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
                                {configDetail && (() => {
                                    const subscriptionDetail = configDetail?.subscriptionDetail
                                    const isActivate = subscriptionDetail?.hasActiveSubscription ?? false
                                    const paymentStatus = subscriptionDetail?.subscription?.paymentStatus
                                    const isPaymentApproved = paymentStatus === 'approved' && subscriptionDetail?.subscription
                                    const isSubscriptionActive = isActivate || isPaymentApproved
                                    
                                    if (!isSubscriptionActive && subscriptionDetail?.subscription) {
                                        return (
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
                                                    {paymentStatus === 'authorized' 
                                                        ? 'Tu pago está autorizado. Espera a que se procese.'
                                                        : 'Activa tu suscripción para acceder a todas las funciones.'
                                                    }
                                                </div>
                                            </div>
                                        )
                                    }
                                    return null
                                })()}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
