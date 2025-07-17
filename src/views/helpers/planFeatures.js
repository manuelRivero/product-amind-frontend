// Constants for feature types and their limitation keys
export const FEATURE_LIMITATION_TYPES = {
  PRODUCTS: 'maxProducts',
  CATEGORIES: 'maxCategories',
  ANALYTICS: 'retentionDays',
  OFFERS: 'maxActiveOffers',
  BANNERS: 'maxBanners',
}

// Feature configuration mapping
export const FEATURE_CONFIG = {
  createProducts: {
    limitationKey: FEATURE_LIMITATION_TYPES.PRODUCTS,
    limitationText: (limit) => `Gestiona hasta ${limit} ${limit === 1 ? 'producto' : 'productos'}`,
    unlimitedText: 'Productos ilimitados',
  },
  createCategories: {
    limitationKey: FEATURE_LIMITATION_TYPES.CATEGORIES,
    limitationText: (limit) => `Organiza hasta ${limit} ${limit === 1 ? 'categoría' : 'categorías'}`,
    unlimitedText: 'Categorías ilimitadas',
  },
  analytics: {
    limitationKey: FEATURE_LIMITATION_TYPES.ANALYTICS,
    limitationText: (limit) => `Datos por ${limit} ${limit === 1 ? 'día' : 'días'}`,
    unlimitedText: 'Datos ilimitados',
  },
  themeCustomization: {
    limitationKey: null,
    limitationText: null,
    unlimitedText: null,
  },
  offers: {
    limitationKey: FEATURE_LIMITATION_TYPES.OFFERS,
    limitationText: (limit) => `Mantén hasta ${limit} ${limit === 1 ? 'promoción activa' : 'promociones activas'}`,
    unlimitedText: 'Promociones ilimitadas',
  },
  banners: {
    limitationKey: FEATURE_LIMITATION_TYPES.BANNERS,
    limitationText: (limit) => `Gestiona hasta ${limit} ${limit === 1 ? 'banner' : 'banners'}`,
    unlimitedText: 'Banners ilimitados',
  },
}

// Utility function to get limitation text for a feature
export const getFeatureLimitationText = (featureKey, feature) => {
  const config = FEATURE_CONFIG[featureKey]
  
  if (!config || !config.limitationKey) {
    return null
  }

  const limits = feature.limits
  if (!limits) {
    return null
  }

  if (limits.unlimited) {
    return config.unlimitedText
  }

  const limitValue = limits[config.limitationKey]
  if (limitValue !== undefined && limitValue !== null) {
    return config.limitationText(limitValue)
  }

  return null
}

// Utility function to check if a feature has limitations
export const hasFeatureLimitations = (featureKey, feature) => {
  const config = FEATURE_CONFIG[featureKey]
  return config && config.limitationKey && feature.limits
}

// Utility function to get enabled features from a plan
export const getEnabledFeatures = (plan) => {
  if (!plan.features) {
    return []
  }

  return Object.entries(plan.features)
    .filter(([, feature]) => feature.enabled)
    .map(([key, feature]) => ({ key, ...feature }))
}

// Utility function to check if a plan has a specific feature enabled
export const isFeatureEnabled = (plan, featureKey) => {
  return plan.features?.[featureKey]?.enabled || false
} 

// Utility function to format billing cycle text
export const formatBillingCycle = (billingCycle) => {
  if (!billingCycle || !billingCycle.frequency || !billingCycle.frequencyType) {
    return null
  }

  const { frequency, frequencyType } = billingCycle

  const frequencyTypeMap = {
    days: frequency === 1 ? 'día' : 'días',
    months: frequency === 1 ? 'mes' : 'meses',
    years: frequency === 1 ? 'año' : 'años',
  }

  const typeText = frequencyTypeMap[frequencyType]
  if (!typeText) {
    return null
  }

  return `cada ${frequency} ${typeText}`
} 

// Feature detailed information for tooltips and modals
export const FEATURE_DETAILED_INFO = {
  createProducts: {
    tooltip: "Agrega productos a tu catálogo para vender en tu tienda online",
    modal: {
      title: "Crear Productos",
      description: "La base de tu tienda online. Sin productos, no hay ventas.",
      benefits: [
        "Catálogo completo de productos",
        "Gestión de inventario",
        "Fotos y descripciones detalladas",
        "Categorización automática"
      ],
      withoutFeature: [
        "No puedes vender productos",
        "Sin catálogo visible",
        "Imposible gestionar inventario",
        "Sin información de productos"
      ],
      examples: [
        "Agregar 50 productos de ropa",
        "Gestionar stock en tiempo real",
        "Subir fotos profesionales"
      ]
    }
  },
  createCategories: {
    tooltip: "Organiza tus productos en categorías para una mejor experiencia de compra",
    modal: {
      title: "Crear Categorías",
      description: "Organiza tu tienda de manera profesional para que los clientes encuentren lo que buscan.",
      benefits: [
        "Navegación intuitiva",
        "Búsqueda mejorada",
        "Experiencia de compra profesional",
        "Organización automática"
      ],
      withoutFeature: [
        "Productos desordenados",
        "Difícil navegación",
        "Experiencia de usuario pobre",
        "Sin organización clara"
      ],
      examples: [
        "Categoría 'Ropa de Mujer'",
        "Subcategoría 'Vestidos'",
        "Filtros automáticos"
      ]
    }
  },
  analytics: {
    tooltip: "Obtén insights detallados sobre el rendimiento de tu tienda y comportamiento de tus clientes",
    modal: {
      title: "Analytics Avanzado",
      description: "Conoce a tus clientes y optimiza tu tienda con datos reales.",
      benefits: [
        "Métricas de ventas detalladas",
        "Comportamiento de clientes",
        "Productos más populares",
        "Optimización basada en datos"
      ],
      withoutFeature: [
        "Sin datos de rendimiento",
        "Decisiones sin fundamento",
        "Imposible optimizar",
        "Sin insights de clientes"
      ],
      examples: [
        "Ver productos más vendidos",
        "Analizar tráfico por hora",
        "Identificar clientes recurrentes"
      ]
    }
  },
  themeCustomization: {
    tooltip: "Personaliza tu tienda con la identidad de tu marca para crear una experiencia única",
    modal: {
      title: "Personalización de Tema",
      description: "Haz que tu tienda se vea única y profesional con tu identidad de marca.",
      benefits: [
        "Identidad de marca única",
        "Experiencia personalizada",
        "Confianza del cliente",
        "Diferenciación competitiva"
      ],
      withoutFeature: [
        "Aspecto genérico",
        "Sin identidad de marca",
        "Menos confianza del cliente",
        "Difícil diferenciación"
      ],
      examples: [
        "Logo personalizado",
        "Colores de tu marca",
        "Tipografías únicas"
      ]
    }
  },
  offers: {
    tooltip: "Crea promociones y descuentos para aumentar las ventas y fidelizar clientes",
    modal: {
      title: "Gestión de Promociones",
      description: "Atrae más clientes y aumenta las ventas con promociones estratégicas.",
      benefits: [
        "Aumento de ventas",
        "Fidelización de clientes",
        "Limpieza de inventario",
        "Estrategias de marketing"
      ],
      withoutFeature: [
        "Sin estrategias de descuento",
        "Menos atracción de clientes",
        "Inventario estancado",
        "Sin herramientas de marketing"
      ],
      examples: [
        "Descuento del 20% en ropa",
        "2x1 en productos seleccionados",
        "Envío gratis en compras mayores a $50"
      ]
    }
  },
  banners: {
    tooltip: "Crea banners promocionales para destacar ofertas y productos especiales",
    modal: {
      title: "Gestión de Banners",
      description: "Destaca tus promociones y productos más importantes con banners atractivos.",
      benefits: [
        "Mayor visibilidad de ofertas",
        "Comunicación directa con clientes",
        "Aumento de conversiones",
        "Marketing visual efectivo"
      ],
      withoutFeature: [
        "Sin destacado de ofertas",
        "Menos visibilidad",
        "Comunicación limitada",
        "Sin marketing visual"
      ],
      examples: [
        "Banner de Black Friday",
        "Destacar productos nuevos",
        "Promociones de temporada"
      ]
    }
  }
}

// Utility function to get feature tooltip from dynamic data
export const getFeatureTooltip = (featureKey, feature) => {
  return feature?.description || null
}

// Utility function to get feature modal info from dynamic data
export const getFeatureModalInfo = (featureKey, feature) => {
  if (!feature?.extendedDescription) {
    return null
  }
  const { extendedDescription } = feature
  return {
    title: feature.title || 'Función',
    headline: extendedDescription.headline || '',
    description: extendedDescription.intro || feature.description || '',
    benefits: extendedDescription.benefits || [],
    withoutFeature: extendedDescription.lossReasons || [],
    closing: extendedDescription.closing || null,
  }
} 