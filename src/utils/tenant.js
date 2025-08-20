/**
 * Obtiene el tenant del subdominio de la URL
 * @returns {string} El tenant/subdominio
 */
export const getTenantFromHostname = () => {
    const hostname = window.location.hostname
    
    // Casos especiales para desarrollo local
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return ''
    }
    
    // Nueva estructura: subdominio.admin.tiendapro.com.ar
    const parts = hostname.split('.')
    
    // Verificar si tenemos al menos 4 partes (subdominio.admin.tiendapro.com.ar)
    if (parts.length >= 4) {
        // El tenant es el primer elemento (subdominio)
        let tenant = parts[0]
        
        // Verificar que el tenant no esté vacío
        if (!tenant || tenant.trim() === '') {
            return ''
        }
        
        // Eliminar el sufijo "-admin" si existe
        if (tenant.endsWith('-admin')) {
            tenant = tenant.replace('-admin', '')
        }
        
        return tenant
    }
    
    // Fallback para la estructura anterior si es necesario
    if (parts.length >= 1) {
        let tenant = parts[0]
        
        // Verificar que el tenant no esté vacío
        if (!tenant || tenant.trim() === '') {
            return ''
        }
        
        // Eliminar el sufijo "-admin" si existe
        if (tenant.endsWith('-admin')) {
            tenant = tenant.replace('-admin', '')
        }
        
        return tenant
    }
    
    return ''
}

/**
 * Obtiene el tenant del usuario actual
 * @param {Object} user - El usuario actual
 * @returns {string} El tenant
 */
export const getCurrentTenant = (user = null) => {
    // Si tenemos un usuario con tenant, usarlo
    if (user?.tenant) {
        return user.tenant
    }
    
    // Si no, obtener del subdominio
    return getTenantFromHostname()
}

/**
 * Obtiene el tenant para el login (del subdominio)
 * @returns {string} El tenant para el login
 */
export const getTenantForLogin = () => {
    return getTenantFromHostname()
}

/**
 * Verifica si hay un tenant válido en la URL
 * @returns {boolean} True si hay un tenant válido
 */
export const hasValidTenant = () => {
    const tenant = getTenantFromHostname()
    return tenant && tenant.trim() !== ''
} 