import React from 'react'
import PropTypes from 'prop-types'
import { usePermissions } from '../../hooks/usePermissions'
import Button from '../CustomButtons/Button'

const PermissionButton = ({ 
    children, 
    requiredPermissions = [], 
    requiredSubscription = false,
    fallbackComponent = null,
    disabled = false,
    ...buttonProps 
}) => {
    const { 
        hasAllPermissions, 
        isSubscriptionActive, 
        loadingPermissions,
        loadingConfig
    } = usePermissions()

    // Si está cargando, mostrar botón deshabilitado
    if (loadingPermissions || loadingConfig) {
        return (
            <Button disabled {...buttonProps}>
                {children}
            </Button>
        )
    }

    // Verificar si requiere suscripción activa
    if (requiredSubscription && !isSubscriptionActive) {
        if (fallbackComponent) {
            return fallbackComponent
        }
        return null
    }

    // Verificar permisos específicos
    if (requiredPermissions.length > 0) {
        const hasRequiredPermissions = hasAllPermissions(requiredPermissions)
        
        if (!hasRequiredPermissions) {
            if (fallbackComponent) {
                return fallbackComponent
            }
            return null
        }
    }

    return (
        <Button disabled={disabled} {...buttonProps}>
            {children}
        </Button>
    )
}

PermissionButton.propTypes = {
    children: PropTypes.node.isRequired,
    requiredPermissions: PropTypes.arrayOf(
        PropTypes.shape({
            resource: PropTypes.string.isRequired,
            action: PropTypes.string.isRequired
        })
    ),
    requiredSubscription: PropTypes.bool,
    fallbackComponent: PropTypes.node,
    disabled: PropTypes.bool
}

PermissionButton.defaultProps = {
    requiredPermissions: [],
    requiredSubscription: false,
    fallbackComponent: null,
    disabled: false
}

export default PermissionButton 