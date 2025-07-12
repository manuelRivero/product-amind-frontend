import React from 'react'
import { usePermissions } from '../../hooks/usePermissions'
import ProtectedRoute from '../ProtectedRoute'
import PermissionButton from '../PermissionButton'
import PermissionError from '../PermissionError'

const PermissionExample = () => {
    const { 
        hasPermission, 
        canView, 
        canCreate, 
        canUpdate, 
        canDelete,
        isSubscriptionActive,
        permissions,
        loadingPermissions,
        permissionsError,
        retryLoadPermissions
    } = usePermissions()

    if (loadingPermissions) {
        return <div>Cargando permisos...</div>
    }

    return (
        <div style={{ padding: '20px' }}>
            <h2>Ejemplo de Uso de Permisos</h2>
            
            {/* Mostrar error de permisos si existe */}
            {permissionsError && (
                <PermissionError 
                    message="Error al cargar permisos de usuario"
                    showDetails={true}
                    showRetry={true}
                    style={{ marginBottom: '20px' }}
                />
            )}
            
            {/* Información de estado */}
            <div style={{ marginBottom: '20px' }}>
                <h3>Estado de Suscripción</h3>
                <p>Suscripción activa: {isSubscriptionActive ? '✅ Sí' : '❌ No'}</p>
                <p>Permisos cargados: {permissions ? '✅ Sí' : '❌ No'}</p>
                <p>Error de permisos: {permissionsError ? '❌ Sí' : '✅ No'}</p>
            </div>

            {/* Verificación de permisos específicos */}
            <div style={{ marginBottom: '20px' }}>
                <h3>Verificación de Permisos</h3>
                <p>Puede ver productos: {canView('products') ? '✅ Sí' : '❌ No'}</p>
                <p>Puede crear productos: {canCreate('products') ? '✅ Sí' : '❌ No'}</p>
                <p>Puede editar productos: {canUpdate('products') ? '✅ Sí' : '❌ No'}</p>
                <p>Puede eliminar productos: {canDelete('products') ? '✅ Sí' : '❌ No'}</p>
            </div>

            {/* Botones con permisos */}
            <div style={{ marginBottom: '20px' }}>
                <h3>Botones con Permisos</h3>
                
                <PermissionButton 
                    requiredPermissions={[{ resource: 'products', action: 'create' }]}
                    requiredSubscription={true}
                    color="primary"
                    style={{ marginRight: '10px' }}
                >
                    Crear Producto
                </PermissionButton>

                <PermissionButton 
                    requiredPermissions={[{ resource: 'products', action: 'update' }]}
                    requiredSubscription={true}
                    color="info"
                    style={{ marginRight: '10px' }}
                >
                    Editar Producto
                </PermissionButton>

                <PermissionButton 
                    requiredPermissions={[{ resource: 'products', action: 'delete' }]}
                    requiredSubscription={true}
                    color="danger"
                >
                    Eliminar Producto
                </PermissionButton>
            </div>

            {/* Contenido protegido */}
            <div style={{ marginBottom: '20px' }}>
                <h3>Contenido Protegido</h3>
                
                <ProtectedRoute 
                    requiredPermissions={[{ resource: 'products', action: 'read' }]}
                    requiredSubscription={true}
                    fallbackComponent={
                        <div style={{ 
                            padding: '20px', 
                            backgroundColor: '#f8f9fa', 
                            border: '1px solid #dee2e6',
                            borderRadius: '4px'
                        }}>
                            <p>No tienes permisos para ver esta sección.</p>
                            <p>Activa tu suscripción para acceder a todas las funciones.</p>
                        </div>
                    }
                >
                    <div style={{ 
                        padding: '20px', 
                        backgroundColor: '#d4edda', 
                        border: '1px solid #c3e6cb',
                        borderRadius: '4px'
                    }}>
                        <h4>Lista de Productos</h4>
                        <p>Este contenido solo es visible si tienes permisos de lectura en productos y tu suscripción está activa.</p>
                        <ul>
                            <li>Producto 1</li>
                            <li>Producto 2</li>
                            <li>Producto 3</li>
                        </ul>
                    </div>
                </ProtectedRoute>
            </div>

            {/* Botón para reintentar permisos */}
            <div style={{ marginBottom: '20px' }}>
                <h3>Acciones de Permisos</h3>
                <button 
                    onClick={retryLoadPermissions}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '10px'
                    }}
                >
                    Reintentar Cargar Permisos
                </button>
            </div>

            {/* Debug de permisos */}
            <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa' }}>
                <h4>Debug de Permisos</h4>
                <pre style={{ fontSize: '12px' }}>
                    {JSON.stringify({
                        permissions,
                        permissionsError,
                        isSubscriptionActive
                    }, null, 2)}
                </pre>
            </div>
        </div>
    )
}

export default PermissionExample 