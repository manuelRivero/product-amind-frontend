/**
 * Verifica si el usuario tiene acceso a una feature específica del plan
 * @param {Object} planDetails - Detalles del plan de suscripción
 * @param {string} featureKey - Clave de la feature a verificar
 * @returns {boolean} - true si la feature está habilitada, false en caso contrario
 */
export const checkFeatureAccess = (planDetails, featureKey) => {
    if (!planDetails?.features) return false
    return planDetails.features[featureKey]?.enabled || false
}

/**
 * Obtiene la información completa de una feature específica
 * @param {Object} planDetails - Detalles del plan de suscripción
 * @param {string} featureKey - Clave de la feature
 * @returns {Object|null} - Información de la feature o null si no existe
 */
export const getFeatureInfo = (planDetails, featureKey) => {
    if (!planDetails?.features) return null
    return planDetails.features[featureKey] || null
}

/**
 * Obtiene todas las features disponibles en el plan
 * @param {Object} planDetails - Detalles del plan de suscripción
 * @returns {Object} - Objeto con todas las features
 */
export const getAllFeatures = (planDetails) => {
    return planDetails?.features || {}
}

/**
 * Verifica si el plan tiene alguna feature habilitada
 * @param {Object} planDetails - Detalles del plan de suscripción
 * @returns {boolean} - true si hay al menos una feature habilitada
 */
export const hasAnyFeature = (planDetails) => {
    if (!planDetails?.features) return false
    return Object.values(planDetails.features).some(feature => feature.enabled)
} 