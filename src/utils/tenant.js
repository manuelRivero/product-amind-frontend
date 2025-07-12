/**
 * Obtiene el tenant del subdominio de la URL
 * @returns {string} El tenant/subdominio
 */
export const getTenantFromHostname = () => {
    const hostname = window.location.hostname
    
    // Obtener el subdominio (primer elemento antes del primer punto)
    const parts = hostname.split('.')
    let tenant = parts[0]
    
    // Eliminar el sufijo "-admin" si existe
    if (tenant.endsWith('-admin')) {
        tenant = tenant.replace('-admin', '')
    }
    
    return tenant
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