import React from 'react'
import PropTypes from 'prop-types'
import { usePermissions } from '../../hooks/usePermissions'
import Button from '../CustomButtons/Button'

const PermissionError = ({ 
    message = 'Error al cargar permisos',
    showRetry = true,
    showDetails = false,
    style = {} 
}) => {
    const { permissionsError, retryLoadPermissions, clearPermissionsError } = usePermissions()

    const handleRetry = () => {
        clearPermissionsError()
        retryLoadPermissions()
    }

    const handleDismiss = () => {
        clearPermissionsError()
    }

    return (
        <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '8px',
            padding: '15px',
            margin: '10px 0',
            ...style
        }}>
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '10px'
            }}>
                <div style={{ fontWeight: 'bold', color: '#856404' }}>
                    ⚠️ {message}
                </div>
                <button 
                    onClick={handleDismiss}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '18px',
                        cursor: 'pointer',
                        color: '#856404'
                    }}
                >
                    ×
                </button>
            </div>
            
            {showDetails && permissionsError && (
                <div style={{ 
                    fontSize: '12px', 
                    color: '#856404',
                    marginBottom: '10px',
                    fontFamily: 'monospace'
                }}>
                    {permissionsError}
                </div>
            )}
            
            {showRetry && (
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Button 
                        color="warning" 
                        size="sm"
                        onClick={handleRetry}
                    >
                        Reintentar
                    </Button>
                    <Button 
                        color="info" 
                        size="sm"
                        onClick={() => window.location.reload()}
                    >
                        Recargar Página
                    </Button>
                </div>
            )}
        </div>
    )
}

PermissionError.propTypes = {
    message: PropTypes.string,
    showRetry: PropTypes.bool,
    showDetails: PropTypes.bool,
    style: PropTypes.object
}

PermissionError.defaultProps = {
    message: 'Error al cargar permisos',
    showRetry: true,
    showDetails: false,
    style: {}
}

export default PermissionError 