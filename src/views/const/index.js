// Constantes para mensajes de suscripción
export const SUBSCRIPTION_MESSAGES = {
    CANCEL: {
        title: '¿Estás seguro de que quieres cancelar tu suscripción?',
        description: 'Al cancelar tu suscripción:',
        consequences: [
            'Tu tienda se desactivará inmediatamente',
            'No podrás acceder a las funciones de administración',
            'Los productos no estarán disponibles para tus clientes',
            'Perderás acceso al dashboard y reportes',
            'Tendrás que reactivar la suscripción para continuar operando'
        ],
        warning: 'Esta acción no se puede deshacer automáticamente. Contacta a soporte si necesitas reactivar tu cuenta.',
        confirmText: 'Sí, cancelar suscripción',
        cancelText: 'No, mantener activa'
    },
    PAUSE: {
        title: '¿Estás seguro de que quieres pausar tu suscripción?',
        description: 'Al pausar tu suscripción:',
        consequences: [
            'Tu tienda se desactivará temporalmente',
            'No podrás acceder a las funciones de administración',
            'Los productos no estarán disponibles para tus clientes',
            'No se realizarán más cobros hasta que reactives',
            'Puedes reactivar en cualquier momento desde esta sección'
        ],
        warning: 'La pausa es temporal y puedes reactivar cuando quieras. No perderás tu configuración.',
        confirmText: 'Sí, pausar suscripción',
        cancelText: 'No, mantener activa'
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
    CANCEL: 'cancel',
    PAUSE: 'pause',
    RESUME: 'resume',
    CHANGE_PLAN: 'change_plan',
    CHANGE_PLAN_INITIAL: 'change_plan_initial'
};

// Constantes para tipos de planes
export const PLAN_TYPES = {
    BASIC: 'basic',
    PROFESSIONAL: 'professional',
    ENTERPRISE: 'enterprise'
}; 