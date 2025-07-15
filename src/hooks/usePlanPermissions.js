import { useSelector } from 'react-redux'
import { checkFeatureAccess, getFeatureInfo, getAllFeatures, hasAnyFeature } from '../utils/planPermissions'

/**
 * Hook personalizado para acceder a los permisos del plan de suscripción
 * @returns {Object} - Objeto con funciones y datos de permisos
 */
export const usePlanPermissions = () => {
    const { planDetails } = useSelector((state) => state.config)
    
    /**
     * Verifica si el usuario tiene acceso a una feature específica
     * @param {string} featureKey - Clave de la feature
     * @returns {boolean} - true si tiene acceso
     */
    const hasFeature = (featureKey) => checkFeatureAccess(planDetails, featureKey)
    
    /**
     * Obtiene la información completa de una feature
     * @param {string} featureKey - Clave de la feature
     * @returns {Object|null} - Información de la feature
     */
    const getFeature = (featureKey) => getFeatureInfo(planDetails, featureKey)
    
    /**
     * Obtiene todas las features del plan
     * @returns {Object} - Todas las features
     */
    const features = getAllFeatures(planDetails)
    
    /**
     * Verifica si el plan tiene alguna feature habilitada
     * @returns {boolean} - true si tiene al menos una feature
     */
    const hasAnyFeatureEnabled = hasAnyFeature(planDetails)
    
    return {
        hasFeature,
        getFeature,
        features,
        hasAnyFeatureEnabled,
        planDetails,
        isPlanLoaded: !!planDetails
    }
} 