/**
 * Verifica si el usuario tiene acceso a una feature específica del plan
 * @param {Object} planDetails - Detalles del plan de suscripción
 * @param {string} featureKey - Nombre de la feature a verificar
 * @returns {boolean} - true si la feature está habilitada, false en caso contrario
 */
export const checkFeatureAccess = (planDetails, featureKey) => {
    if (!planDetails?.features || !Array.isArray(planDetails.features)) return false
    
    const feature = planDetails.features.find(f => f.feature.name === featureKey)
    return feature?.feature?.enabled || false
}

/**
 * Obtiene la información completa de una feature específica
 * @param {Object} planDetails - Detalles del plan de suscripción
 * @param {string} featureKey - Nombre de la feature
 * @returns {Object|null} - Información de la feature o null si no existe
 */
export const getFeatureInfo = (planDetails, featureKey) => {
    if (!planDetails?.features || !Array.isArray(planDetails.features)) return null
    
    const feature = planDetails.features.find(f => f.feature.name === featureKey)
    return feature?.feature || null
}

/**
 * Obtiene todas las features disponibles en el plan
 * @param {Object} planDetails - Detalles del plan de suscripción
 * @returns {Object} - Objeto con todas las features indexadas por nombre
 */
export const getAllFeatures = (planDetails) => {
    if (!planDetails?.features || !Array.isArray(planDetails.features)) return {}
    
    const featuresObject = {}
    planDetails.features.forEach(f => {
        if (f.feature?.name) {
            featuresObject[f.feature.name] = f.feature
        }
    })
    return featuresObject
}

/**
 * Verifica si el plan tiene alguna feature habilitada
 * @param {Object} planDetails - Detalles del plan de suscripción
 * @returns {boolean} - true si hay al menos una feature habilitada
 */
export const hasAnyFeature = (planDetails) => {
    if (!planDetails?.features || !Array.isArray(planDetails.features)) return false
    return planDetails.features.some(f => f.feature?.enabled)
}

/**
 * Obtiene los límites de una feature específica
 * @param {Object} planDetails - Detalles del plan de suscripción
 * @param {string} featureKey - Nombre de la feature
 * @returns {Object|null} - Límites de la feature o null si no existe
 */
export const getFeatureLimits = (planDetails, featureKey) => {
    if (!planDetails?.features || !Array.isArray(planDetails.features)) return null
    
    const feature = planDetails.features.find(f => f.feature.name === featureKey)
    return feature?.limits || null
}

/**
 * Verifica si una feature tiene límites ilimitados
 * @param {Object} planDetails - Detalles del plan de suscripción
 * @param {string} featureKey - Nombre de la feature
 * @returns {boolean} - true si la feature tiene límites ilimitados
 */
export const isFeatureUnlimited = (planDetails, featureKey) => {
    const limits = getFeatureLimits(planDetails, featureKey)
    return limits?.unlimited || false
}

/**
 * Obtiene el límite máximo de una feature
 * @param {Object} planDetails - Detalles del plan de suscripción
 * @param {string} featureKey - Nombre de la feature
 * @returns {number|null} - Límite máximo o null si no existe
 */
export const getFeatureMaxLimit = (planDetails, featureKey) => {
    const limits = getFeatureLimits(planDetails, featureKey)
    return limits?.max || null
} 