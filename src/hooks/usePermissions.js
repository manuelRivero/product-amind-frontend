import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { fetchUserPermissions, clearPermissionsError as clearPermissionsErrorAction } from '../store/auth'
import { getCurrentTenant } from '../utils/tenant'

export const usePermissions = () => {
    const dispatch = useDispatch()
    const { configDetail, loadingConfig } = useSelector((state) => state.config)
    const { user, permissions, loadingPermissions, permissionsError } = useSelector((state) => state.auth)

    // Validaciones de suscripción (con protección contra carga)
    const subscriptionDetail = configDetail?.subscriptionDetail
    const isActivate = subscriptionDetail?.hasActiveSubscription ?? false
    const paymentStatus = subscriptionDetail?.subscription?.paymentStatus
    const subscription = subscriptionDetail?.subscription
    
    // Estados de pago (con protección contra carga)
    const isPaymentAuthorized = !loadingConfig && paymentStatus === 'authorized' && subscription
    const isPaymentApproved = !loadingConfig && paymentStatus === 'approved' && subscription
    const isPaymentPending = !loadingConfig && paymentStatus === 'pending' && subscription
    const isPaymentPaused = !loadingConfig && paymentStatus === 'paused' && subscription
    const isPaymentCancelled = !loadingConfig && paymentStatus === 'cancelled' && subscription
    
    // Estado de suscripción activa (con protección contra carga)
    const isSubscriptionActive = !loadingConfig && (isActivate || isPaymentApproved)
    
    // Cargar permisos del usuario cuando se hace login
    useEffect(() => {
        // Solo hacer la petición si tenemos usuario y no hay permisos cargados
        if (user?.userId && user?.token && !permissions && !loadingPermissions) {
            const tenant = getCurrentTenant(user)
            dispatch(fetchUserPermissions({ 
                userId: user.userId, 
                token: user.token,
                tenant: tenant
            }))
        }
    }, [user])

    // Función para verificar permisos de usuario
    const hasUserPermission = (resource, action) => {
        // Si hay error de permisos, no dar acceso
        if (permissionsError) {
            console.warn('Error de permisos detectado:', permissionsError)
            return false
        }
        
        if (!permissions || !permissions[resource]) return false
        return permissions[resource][action] || false
    }

    // Función para verificar permisos de suscripción
    const checkSubscriptionPermission = (permission) => {
        // Si la configuración está cargando, no dar permisos
        if (loadingConfig) {
            return false
        }
        
        const subscriptionPermissions = {
            canViewHome: true,
            canViewActivation: true,
            canViewDashboard: isSubscriptionActive,
            canViewProducts: isSubscriptionActive,
            canViewCategories: isSubscriptionActive,
            canViewOrders: isSubscriptionActive,
            canViewBanners: isSubscriptionActive,
            canViewOffers: isSubscriptionActive,
            canViewConfig: isSubscriptionActive,
            canCreateProducts: isSubscriptionActive,
            canEditProducts: isSubscriptionActive,
            canDeleteProducts: isSubscriptionActive,
            canCreateCategories: isSubscriptionActive,
            canEditCategories: isSubscriptionActive,
            canDeleteCategories: isSubscriptionActive,
            canCreateBanners: isSubscriptionActive,
            canEditBanners: isSubscriptionActive,
            canDeleteBanners: isSubscriptionActive,
            canCreateOffers: isSubscriptionActive,
            canEditOffers: isSubscriptionActive,
            canDeleteOffers: isSubscriptionActive,
            canEditConfig: isSubscriptionActive,
            canViewAnalytics: isSubscriptionActive,
            canChangePlan: isSubscriptionActive || isPaymentAuthorized,
            canViewSubscriptionDetails: subscription ? true : false,
        }
        return subscriptionPermissions[permission] || false
    }

    // Función para verificar permisos combinados (usuario + suscripción)
    const hasPermission = (resource, action) => {
        // Si hay error de permisos, solo permitir acceso básico
        if (permissionsError) {
            console.warn('Error de permisos - acceso restringido a básico:', resource, action)
            return resource === 'home' || resource === 'activation'
        }
        
        // Si la configuración está cargando, solo permitir acceso básico
        if (loadingConfig) {
            return resource === 'home' || resource === 'activation'
        }
        
        // Primero verificar si la suscripción está activa
        if (!isSubscriptionActive && resource !== 'home' && resource !== 'activation') {
            return false
        }
        
        // Luego verificar permisos de usuario
        return hasUserPermission(resource, action)
    }

    // Función para verificar permisos específicos de suscripción
    const hasSubscriptionPermission = (permission) => {
        return checkSubscriptionPermission(permission)
    }

    // Función para verificar múltiples permisos (AND)
    const hasAllPermissions = (permissionList) => {
        // Si hay error de permisos, no dar acceso
        if (permissionsError) {
            console.warn('Error de permisos - hasAllPermissions falló')
            return false
        }
        return permissionList.every(({ resource, action }) => hasPermission(resource, action))
    }

    // Función para verificar al menos un permiso (OR)
    const hasAnyPermission = (permissionList) => {
        // Si hay error de permisos, no dar acceso
        if (permissionsError) {
            console.warn('Error de permisos - hasAnyPermission falló')
            return false
        }
        return permissionList.some(({ resource, action }) => hasPermission(resource, action))
    }

    // Función para limpiar errores de permisos
    const clearPermissionsError = () => {
        dispatch(clearPermissionsErrorAction())
    }

    // Función para reintentar cargar permisos
    const retryLoadPermissions = () => {
        if (user?.userId && user?.token) {
            const tenant = getCurrentTenant(user)
            dispatch(fetchUserPermissions({ 
                userId: user.userId, 
                token: user.token,
                tenant: tenant
            }))
        }
    }

    return {
        // Estados de permisos
        permissions,
        loadingPermissions,
        permissionsError,
        
        // Estados de configuración
        loadingConfig,
        
        // Estados de suscripción
        isSubscriptionActive,
        isPaymentAuthorized,
        isPaymentApproved,
        isPaymentPending,
        isPaymentPaused,
        isPaymentCancelled,
        
        // Funciones de verificación
        hasPermission,
        hasUserPermission,
        hasSubscriptionPermission,
        hasAllPermissions,
        hasAnyPermission,
        clearPermissionsError,
        retryLoadPermissions,
        
        // Información de la suscripción
        subscriptionDetails: subscription ? {
            plan: subscription.plan,
            startDate: subscription.startDate,
            paymentStatus,
            billingCycle: subscription.plan?.billingCycle
        } : null,
        
        // Helper para verificar permisos comunes
        canView: (resource) => hasPermission(resource, 'read'),
        canCreate: (resource) => hasPermission(resource, 'create'),
        canUpdate: (resource) => hasPermission(resource, 'update'),
        canDelete: (resource) => hasPermission(resource, 'delete'),
    }
} 