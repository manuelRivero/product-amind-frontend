import React from 'react'
import PropTypes from 'prop-types'
import { usePermissions } from '../../hooks/usePermissions'
import { useHistory } from 'react-router-dom'
import PermissionError from '../PermissionError'

const ProtectedRoute = ({ 
    children, 
    requiredPermissions = [], 
    requiredSubscription = false,
    fallbackComponent = null,
    redirectTo = '/admin/mercado-pago'
}) => {
    const { 
        hasPermission, 
        hasAllPermissions, 
        isSubscriptionActive, 
        loadingPermissions,
        loadingConfig,
        permissionsError 
    } = usePermissions()
    const history = useHistory()

    // Si está cargando permisos o configuración, mostrar loading
    if (loadingPermissions || loadingConfig) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <div>Cargando configuración...</div>
            </div>
        )
    }

    // Si hay error de permisos, mostrar error
    if (permissionsError) {
        return (
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                padding: '20px'
            }}>
                <h3>Error de permisos</h3>
                <PermissionError 
                    message="No se pudieron cargar los permisos"
                    showDetails={true}
                    showRetry={true}
                    style={{ maxWidth: '500px' }}
                />
            </div>
        )
    }

    // Verificar si requiere suscripción activa
    if (requiredSubscription && !isSubscriptionActive) {
        if (fallbackComponent) {
            return fallbackComponent
        }
        history.push(redirectTo)
        return null
    }

    // Verificar permisos específicos
    if (requiredPermissions.length > 0) {
        const hasRequiredPermissions = hasAllPermissions(requiredPermissions)
        
        if (!hasRequiredPermissions) {
            if (fallbackComponent) {
                return fallbackComponent
            }
            history.push(redirectTo)
            return null
        }
    }

    return children
}

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    requiredPermissions: PropTypes.arrayOf(
        PropTypes.shape({
            resource: PropTypes.string.isRequired,
            action: PropTypes.string.isRequired
        })
    ),
    requiredSubscription: PropTypes.bool,
    fallbackComponent: PropTypes.node,
    redirectTo: PropTypes.string
}

ProtectedRoute.defaultProps = {
    requiredPermissions: [],
    requiredSubscription: false,
    fallbackComponent: null,
    redirectTo: '/admin/mercado-pago'
}

export default ProtectedRoute 