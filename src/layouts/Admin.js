import React from 'react'
import PropTypes from 'prop-types'
import { Switch, Route, useLocation, useHistory } from 'react-router-dom'
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
import { IconButton } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import moment from 'moment'
import socketService from '../services/socket'
import AnnouncementModal from '../components/AnnouncementModal'
import { fetchAnnouncements, fetchUnreadCount, openAnnouncementsModal } from '../store/announcements'

const useStyles = makeStyles(styles)

// Componente Redirect personalizado que preserva query parameters
const RedirectWithQuery = ({ to }) => {
    const location = useLocation()
    const history = useHistory()
    
    React.useEffect(() => {
        // Preservar los query parameters si existen
        const newPath = to + (location.search || '')
        history.replace(newPath)
    }, [to, location.search, history])
    
    return null
}

RedirectWithQuery.propTypes = {
    to: PropTypes.string.isRequired
}

export default function Admin({ ...rest }) {
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const { configDetail, error: configError, errorDetails } = useSelector((state) => state.config)
    const { announcements, loadingAnnouncements, isModalOpen, hasBeenClosedManually, pagination } = useSelector((state) => state.announcements)
    const {
        loadingConfig: loadingConfigPermissions,
        permissionsError,
        hasUserPermission
    } = usePermissions()

    const isVerified = configDetail?.isVerified
    console.log("isVerified", isVerified)

    // Nueva lógica de validación de estados de suscripción (igual que en Activation)
    const paymentStatus = configDetail?.paymentStatus
    const preapprovalStatus = configDetail?.preapprovalStatus
    const mercadoPagoMarketplaceAccessToken = configDetail?.mercadoPagoMarketplaceAccessToken
    const mercadoPagoMarketplaceTokenExpiresAt = moment(configDetail?.mercadoPagoMarketplaceTokenExpiresAt).isAfter(moment())
    // Tomar el último status de userActionHistory (ordenado por fecha ascendente)
    const lastStatusObj = Array.isArray(configDetail?.userActionHistory) && configDetail.userActionHistory.length > 0
        ? configDetail.userActionHistory[configDetail.userActionHistory.length - 1]
        : null;
    const lastStatus = lastStatusObj?.action;

    // Flags de estado (igual que en Activation)
    const isPaymentApproved = (preapprovalStatus === 'authorized' && paymentStatus === 'approved');
    const isPaymentPending = (preapprovalStatus === 'authorized' && paymentStatus === 'pending');
    const isPaymentPaused = (preapprovalStatus === 'paused' || paymentStatus === 'paused' || lastStatus === 'paused');
    const isPaymentCancelled = (preapprovalStatus === 'cancelled' || paymentStatus === 'cancelled' || lastStatus === 'cancelled');
    const isSubscriptionActive = (isPaymentApproved || isPaymentPaused || isPaymentPending) && !isPaymentCancelled;

    // Obtener la última acción del usuario
    const currentUserAction = configDetail?.currentUserAction

    // Función para obtener el mensaje de la acción del usuario
    const getUserActionMessage = () => {
        if (!currentUserAction || currentUserAction.status === 'completed') {
            return null
        }

        const actionMessages = {
            pause: {
                pending: 'Tu solicitud de pausar la suscripción está siendo procesada. Por favor aguarda...',
                failed: 'No se pudo pausar la suscripción. Inténtalo nuevamente.'
            },
            cancel: {
                pending: 'Tu solicitud de cancelar la suscripción está siendo procesada. Por favor aguarda...',
                failed: 'No se pudo cancelar la suscripción. Inténtalo nuevamente.'
            },
            resume: {
                pending: 'Tu solicitud de reactivar la suscripción está siendo procesada. Por favor aguarda...',
                failed: 'No se pudo reactivar la suscripción. Inténtalo nuevamente.'
            },
            change_plan: {
                pending: 'Tu solicitud de cambiar de plan está siendo procesada. Por favor aguarda...',
                failed: 'No se pudo cambiar el plan. Inténtalo nuevamente.'
            },
            create: {
                pending: 'Tu solicitud de crear la suscripción está siendo procesada. Por favor aguarda...',
                failed: 'No se pudo crear la suscripción. Inténtalo nuevamente.'
            }
        }

        return actionMessages[currentUserAction.action]?.[currentUserAction.status] || null
    }

    const userActionMessage = getUserActionMessage()

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
    const [showUserActionBanner, setShowUserActionBanner] = React.useState(true)

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen)
    }

    const filteredRoutes = React.useMemo(() => {
        return dashboardRoutes.filter((prop) => {
            // Verificar si es una ruta de admin
            const isAdminRoute = prop.layout === '/admin'
            console.log("path", prop.path)

            // Si el usuario no está verificado, solo mostrar la ruta admin/inicio
            if (!isVerified) {
                console.log('entró al if')
                return isAdminRoute && prop.path === '/inicio'
            }

            // Si la suscripción está pausada o cancelada, solo mostrar la ruta de activación
            if (isPaymentPaused || isPaymentCancelled || (!mercadoPagoMarketplaceAccessToken && !mercadoPagoMarketplaceTokenExpiresAt)) {
                return isAdminRoute && prop.path === '/mercado-pago'
            }

            if (isPaymentPending) {
                return isAdminRoute && prop.path === '/mercado-pago'
            }

            // Si el pago está aprobado pero la suscripción no está activa, mostrar todas las rutas
            if (isPaymentApproved && !isSubscriptionActive) {
                const hasPermission = !prop.permission || hasUserPermission(prop.permission.resource, prop.permission.action)
                return isAdminRoute && hasPermission
            }

            // Verificar suscripción activa usando las validaciones reales
            const hasSubscription = !prop.needConfig || (prop.needConfig && isSubscriptionActive)

            // Verificar permisos de usuario
            let hasPermission = true
            if (prop.permission) {
                hasPermission = hasUserPermission(prop.permission.resource, prop.permission.action)
            }

            return isAdminRoute && hasSubscription && hasPermission
        })
    }, [isVerified, isPaymentPaused, isPaymentCancelled, isPaymentApproved, isSubscriptionActive, hasUserPermission])

    // Crear rutas filtradas para el Switch
    const filteredMainRoutes = React.useMemo(() => {
        return filteredRoutes.map((prop, key) => {
            // Manejar la ruta raíz correctamente
            const routePath = prop.path;
            console.log("routePath", routePath)
            return (
                <Route
                    exact
                    path={`${prop.layout}${routePath}`}
                    component={prop.component}
                    key={key}
                />
            )
        })
    }, [filteredRoutes])

    console.log("filteredMainRoutes", filteredMainRoutes)
    const filteredChildRoutes = React.useMemo(() => {
        return filteredRoutes.map((prop) => {
            return prop.childrens
                ? prop.childrens.map((e, i) => {
                    return (
                        <Route
                            path={prop.path + e.path}
                            component={e.component}
                            key={`child-${e.path}-${i}`}
                        />
                    )
                })
                : null
        }).filter(Boolean)
    }, [filteredRoutes])


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
                    type: 'tenant',
                    message: 'Hubo un error cargando la configuración de su tienda, por favor refresque la pagina, si el problema persiste contactese con soporte.',
                })
                setTenant(null)
            } finally {
                setLoadingTenant(false)
            }
        }
        const subdomain = window.location.hostname.split('.')[0]
        console.log('subdomain', subdomain)
        if (subdomain) {
            verifyTenant(subdomain)
        } else {
            console.error('Tenant not found')
            setError({
                type: 'tenant',
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
                type: 'config',
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

    // Socket.IO connection management
    React.useEffect(() => {
        // Conectar Socket.IO cuando el usuario esté autenticado y el tenant esté cargado
        if (tenant && user?.token) {
            console.log('Iniciando conexión Socket.IO...')
            socketService.connect(user.token)

            // Solicitar permiso para notificaciones del navegador (deshabilitado)
            // socketService.requestNotificationPermission()
        }

        // Cleanup: desconectar al desmontar o cuando cambie el usuario/tenant
        return () => {
            if (socketService.getConnectionStatus()) {
                console.log('Desconectando Socket.IO...')
                socketService.disconnect()
            }
        }
    }, [tenant, user?.token])

    // Fetch automático de anuncios al montar el layout
    React.useEffect(() => {
        if (tenant && user?.token) {
            dispatch(fetchAnnouncements({ page: 0, limit: 10 }))
            dispatch(fetchUnreadCount())
        }
    }, [tenant, user?.token, dispatch])

    // Abrir modal automáticamente si hay anuncios no leídos (solo si no fue cerrado manualmente)
    React.useEffect(() => {
        // Usar pagination.unread si está disponible (más confiable), sino filtrar anuncios
        const unreadCountFromPagination = pagination?.unread ?? 0
        const hasUnread = unreadCountFromPagination > 0 || announcements.some(ann => !ann.isRead)
        
        if (
            !loadingAnnouncements &&
            hasUnread &&
            !isModalOpen &&
            !hasBeenClosedManually
        ) {
            dispatch(openAnnouncementsModal())
        }
    }, [loadingAnnouncements, announcements, pagination, isModalOpen, hasBeenClosedManually, dispatch])


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
                routes={filteredRoutes}
                handleDrawerToggle={handleDrawerToggle}
                open={mobileOpen}
                color={color}
                {...rest}
            />
            <div className={classes.mainPanel} ref={mainPanel} id="main-panel" >
                <Navbar
                    routes={filteredRoutes}
                    handleDrawerToggle={handleDrawerToggle}
                    {...rest}
                />
                {/* On the /maps route we want the map to be on full screen - this is not possible if the content and conatiner classes are present because they have some paddings which would make the map smaller */}
                <div className={classes.content}>
                    <div className={classes.container}>
                        {/* {console.log("childRoutes", childRoutes)} */}
                        {tenant && !error && (
                            <>
                                {console.log("filteredMainRoutes", filteredMainRoutes)}
                                <Switch>
                                    {filteredMainRoutes}
                                    {filteredChildRoutes}
                                    {/* Ruta catch-all para rutas inexistentes - debe ir al final */}
                                    <Route path="*">
                                        <RedirectWithQuery to="/admin/inicio" />
                                    </Route>
                                </Switch>
                                {/* Mensaje cuando no hay suscripción activa */}

                                {/* Mensaje de acción del usuario */}
                                {userActionMessage && showUserActionBanner && (
                                    <div style={{
                                        position: 'fixed',
                                        top: '20px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        backgroundColor: currentUserAction?.status === 'failed' ? '#ffebee' : '#e3f2fd',
                                        color: currentUserAction?.status === 'failed' ? '#c62828' : '#1565c0',
                                        borderRadius: '8px',
                                        padding: '15px',
                                        maxWidth: '400px',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                        zIndex: 1002,
                                        border: `1px solid ${currentUserAction?.status === 'failed' ? '#ef5350' : '#42a5f5'}`
                                    }}>
                                        <div style={{
                                            fontWeight: 'bold',
                                            marginBottom: '5px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            {currentUserAction?.status === 'failed' ? 'Error' : 'Procesando...'}
                                            <IconButton
                                                onClick={() => setShowUserActionBanner(false)}
                                                size="small"
                                                style={{ padding: 4 }}
                                            >
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </div>
                                        <div style={{ fontSize: '14px' }}>
                                            {userActionMessage}
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
            <AnnouncementModal />
        </div>
    )
}
