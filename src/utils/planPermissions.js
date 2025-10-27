/**
 * Verifica si un plan es gratuito
 * @param {Object} plan - Plan a verificar
 * @returns {boolean} - true si el plan es gratuito, false en caso contrario
 */
export const isFreePlan = (plan) => {
    if (!plan) return false
    return plan.freePlan === true || plan.price === 0
}

/**
 * Verifica si un plan requiere pago
 * @param {Object} plan - Plan a verificar
 * @returns {boolean} - true si el plan requiere pago, false en caso contrario
 */
export const requiresPayment = (plan) => {
    return !isFreePlan(plan)
}

/**
 * Verifica si el usuario tiene acceso a una feature específica del plan
 * @param {Object} planDetails - Detalles del plan de suscripción
 * @param {string} featureKey - Nombre de la feature a verificar
 * @returns {boolean} - true si la feature está habilitada, false en caso contrario
 */
export const checkFeatureAccess = (planDetails, featureKey) => {
    try {
        if (!planDetails?.features || !Array.isArray(planDetails.features)) return false
        
        const feature = planDetails.features.find(f => f.feature?.name === featureKey)
        if (!feature?.feature?.enabled) return false
        
        // Para features binary, si está habilitada, tiene acceso completo
        if (feature.feature.featureType === 'binary') {
            return true
        }
        
        // Para features countable, verificar límites
        const limits = feature.limits
        if (!limits) return true // Si no hay límites, tiene acceso
        
        // Si es ilimitado, tiene acceso completo
        if (limits.unlimited === true) return true
        
        // Si max es 0 (sin límites permitidos), no tiene acceso
        if (limits.max === 0) return false
        
        return true
    } catch (error) {
        console.error('Error in checkFeatureAccess:', error)
        return false
    }
}

/**
 * Obtiene la información completa de una feature específica
 * @param {Object} planDetails - Detalles del plan de suscripción
 * @param {string} featureKey - Nombre de la feature
 * @returns {Object|null} - Información de la feature o null si no existe
 */
export const getFeatureInfo = (planDetails, featureKey) => {
    try {
        if (!planDetails?.features || !Array.isArray(planDetails.features)) return null
        
        console.log('feature', featureKey, planDetails.features)
        console.log('target feature', planDetails.features.find(f => f.feature?.name === featureKey))
        const feature = planDetails.features.find(f => f.feature?.name === featureKey)
        return feature?.feature || null
    } catch (error) {
        console.error('Error in getFeatureInfo:', error)
        return null
    }
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

/**
 * Obtiene el tipo de feature (binary o countable)
 * @param {Object} planDetails - Detalles del plan de suscripción
 * @param {string} featureKey - Nombre de la feature
 * @returns {string|null} - Tipo de feature o null si no existe
 */
export const getFeatureType = (planDetails, featureKey) => {
    if (!planDetails?.features || !Array.isArray(planDetails.features)) return null
    
    const feature = planDetails.features.find(f => f.feature?.name === featureKey)
    return feature?.feature?.featureType || null
}

/**
 * Verifica si una feature es de tipo binary
 * @param {Object} planDetails - Detalles del plan de suscripción
 * @param {string} featureKey - Nombre de la feature
 * @returns {boolean} - true si es binary, false en caso contrario
 */
export const isBinaryFeature = (planDetails, featureKey) => {
    return getFeatureType(planDetails, featureKey) === 'binary'
}

/**
 * Verifica si una feature es de tipo countable
 * @param {Object} planDetails - Detalles del plan de suscripción
 * @param {string} featureKey - Nombre de la feature
 * @returns {boolean} - true si es countable, false en caso contrario
 */
export const isCountableFeature = (planDetails, featureKey) => {
    return getFeatureType(planDetails, featureKey) === 'countable'
} 