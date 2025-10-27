import { useSelector } from 'react-redux'
import { 
    checkFeatureAccess, 
    getFeatureInfo, 
    getAllFeatures, 
    hasAnyFeature,
    getFeatureLimits,
    isFeatureUnlimited,
    getFeatureMaxLimit,
    getFeatureType,
    isBinaryFeature,
    isCountableFeature
} from '../utils/planPermissions'

/**
 * Hook personalizado para acceder a los permisos del plan de suscripción
 * @returns {Object} - Objeto con funciones y datos de permisos
 */
export const usePlanPermissions = () => {
    const { planDetails } = useSelector((state) => state.config)
    
    /**
     * Verifica si el usuario tiene acceso a una feature específica
     * @param {string} featureKey - Nombre de la feature
     * @returns {boolean} - true si tiene acceso
     */
    const hasFeature = (featureKey) => checkFeatureAccess(planDetails, featureKey)
    
    /**
     * Obtiene la información completa de una feature
     * @param {string} featureKey - Nombre de la feature
     * @returns {Object|null} - Información de la feature
     */
    const getFeature = (featureKey) => getFeatureInfo(planDetails, featureKey)
    
    /**
     * Obtiene todas las features del plan
     * @returns {Object} - Todas las features indexadas por nombre
     */
    const features = getAllFeatures(planDetails)
    
    /**
     * Verifica si el plan tiene alguna feature habilitada
     * @returns {boolean} - true si tiene al menos una feature
     */
    const hasAnyFeatureEnabled = hasAnyFeature(planDetails)
    
    /**
     * Obtiene los límites de una feature específica
     * @param {string} featureKey - Nombre de la feature
     * @returns {Object|null} - Límites de la feature
     */
    const getLimits = (featureKey) => getFeatureLimits(planDetails, featureKey)
    
    /**
     * Verifica si una feature tiene límites ilimitados
     * @param {string} featureKey - Nombre de la feature
     * @returns {boolean} - true si tiene límites ilimitados
     */
    const isUnlimited = (featureKey) => isFeatureUnlimited(planDetails, featureKey)
    
    /**
     * Obtiene el límite máximo de una feature
     * @param {string} featureKey - Nombre de la feature
     * @returns {number|null} - Límite máximo
     */
    const getMaxLimit = (featureKey) => getFeatureMaxLimit(planDetails, featureKey)
    
    /**
     * Obtiene el tipo de feature
     * @param {string} featureKey - Nombre de la feature
     * @returns {string|null} - Tipo de feature
     */
    const getType = (featureKey) => getFeatureType(planDetails, featureKey)
    
    /**
     * Verifica si una feature es binary
     * @param {string} featureKey - Nombre de la feature
     * @returns {boolean} - true si es binary
     */
    const isBinary = (featureKey) => isBinaryFeature(planDetails, featureKey)
    
    /**
     * Verifica si una feature es countable
     * @param {string} featureKey - Nombre de la feature
     * @returns {boolean} - true si es countable
     */
    const isCountable = (featureKey) => isCountableFeature(planDetails, featureKey)
    
    return {
        hasFeature,
        getFeature,
        features,
        hasAnyFeatureEnabled,
        getLimits,
        isUnlimited,
        getMaxLimit,
        getType,
        isBinary,
        isCountable,
        planDetails,
        isPlanLoaded: !!planDetails
    }
} 