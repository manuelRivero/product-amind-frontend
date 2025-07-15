// Constantes para mensajes de suscripción
export const SUBSCRIPTION_MESSAGES = {
    CANCEL: {
        title: '¿Estás seguro de que quieres cancelar tu suscripción?',
        description: 'Al cancelar tu suscripción:',
        consequences: [
            "Tu tienda quedará inactiva.",
            "No podrás acceder a la administración ni a las ventas.",
            "Tus clientes no podrán comprar en tu tienda."
        ],
        warning: "Esta acción es irreversible.",
        confirmText: "Cancelar",
        cancelText: "Volver"
    },
    PAUSE: {
        title: "¿Pausar suscripción?",
        description: "Puedes pausar tu suscripción temporalmente. Durante la pausa, tu tienda no estará disponible para tus clientes.",
        consequences: [
            "Tu tienda quedará temporalmente inactiva.",
            "No perderás la configuración ni los datos de tu tienda.",
            "Podrás reactivarla en cualquier momento."
        ],
        warning: "Podrás reactivar tu suscripción cuando lo desees.",
        confirmText: "Pausar",
        cancelText: "Volver"
    },
    RESUME: {
        title: "¿Reactivar suscripción?",
        description: "Al reactivar tu suscripción, tu tienda volverá a estar activa y podrás acceder a todas las funciones.",
        benefits: [
            "Recuperarás el acceso completo a la plataforma.",
            "Tus clientes podrán volver a comprar en tu tienda.",
            "No perderás la configuración ni los datos de tu tienda."
        ],
        warning: "La reactivación puede demorar unos minutos en reflejarse.",
        confirmText: "Reactivar",
        cancelText: "Cancelar"
    }
};

// Constantes para mensajes de cambio de plan
export const PLAN_CHANGE_MESSAGES = {
    UPGRADE: {
        title: '¿Cambiar a un plan superior?',
        description: 'Al cambiar a un plan superior:',
        benefits: [
            'Tendrás acceso a más productos',
            'Podrás crear más banners',
            'Podrás crear más promociones',
            'Tendrás más funcionalidades disponibles',
            'El cambio se aplicará inmediatamente'
        ],
        warning: 'El nuevo plan se activará inmediatamente.',
        confirmText: 'Sí, cambiar plan',
        cancelText: 'Mantener plan actual'
    },
    DOWNGRADE: {
        title: '¿Cambiar a un plan con menos capacidad?',
        description: 'Al cambiar a un plan con menos capacidad:',
        consequences: [
            'Todas las funciones del admin seguirán disponibles',
            'Podrás seguir creando productos, banners y promociones',
            'El límite será en la cantidad que puedes manejar',
            'Si excedes los límites, algunas opciones se deshabilitarán temporalmente',
            'Puedes volver a cambiar de plan en cualquier momento'
        ],
        warning: 'No perderás tu información existente. Solo se aplicarán límites en nuevas creaciones.',
        confirmText: 'Sí, cambiar plan',
        cancelText: 'Mantener plan actual'
    },
    SAME_PLAN: {
        title: '¿Cambiar al mismo plan?',
        description: 'Estás seleccionando el mismo plan que tienes actualmente.',
        message: 'No hay cambios en tu suscripción actual.',
        confirmText: 'Entendido',
        cancelText: 'Cancelar'
    },
    INITIAL: {
        title: '¿Quieres cambiar tu plan de suscripción?',
        description: 'Puedes cambiar tu plan en cualquier momento:',
        benefits: [
            'Mantendrás todas tus funciones de administración',
            'Podrás seguir creando productos, banners y promociones',
            'Los cambios se aplicarán inmediatamente',
            'Puedes volver a cambiar cuando quieras',
            'No perderás tu información existente'
        ],
        warning: 'Al cambiar de plan, mantendrás acceso a todas las funciones del admin. Solo cambiarán los límites de cantidad.',
        confirmText: 'Sí, ver planes disponibles',
        cancelText: 'No, mantener plan actual'
    }
};

// Constantes para estados de suscripción
export const SUBSCRIPTION_STATUS = {
    ACTIVE: 'active',
    PAUSED: 'paused',
    CANCELLED: 'cancelled',
    PENDING: 'pending',
    AUTHORIZED: 'authorized'
};

// Constantes para tipos de acciones
export const ACTION_TYPES = {
    CANCEL: "CANCEL",
    PAUSE: "PAUSE",
    CHANGE_PLAN: "CHANGE_PLAN",
    CHANGE_PLAN_INITIAL: "CHANGE_PLAN_INITIAL",
    RESUME: "RESUME"
};

// Constantes para tipos de planes
export const PLAN_TYPES = {
    BASIC: 'basic',
    PROFESSIONAL: 'professional',
    ENTERPRISE: 'enterprise'
};

// Constantes para funcionalidades no disponibles
export const UNAVAILABLE_FEATURE_FALLBACK = {
    title: "Esta funcionalidad aún no está disponible",
    paragraphs: [
        "Sabemos que esta funcionalidad puede marcar una gran diferencia en tu tienda, por eso estamos trabajando para incluirlo muy pronto en nuestros planes.",
        "En este momento, todavía no forma parte de ningún plan activo.",
        "Si te interesa acceder a esta herramienta o querés influir en cómo la priorizamos, <strong>nos encantaría escucharte</strong>."
    ],
    cta: {
        label: "👉 Contanos cómo te gustaría usar esta funcionalidad",
        href: "/contacto"
    }
}; 