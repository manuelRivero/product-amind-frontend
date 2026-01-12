// Constantes para tipos de anuncios
export const ANNOUNCEMENT_TYPES = {
    info: {
        label: 'Información',
        icon: 'ℹ️',
        color: '#2196F3'
    },
    warning: {
        label: 'Advertencia',
        icon: '⚠️',
        color: '#FF9800'
    },
    success: {
        label: 'Éxito',
        icon: '✅',
        color: '#4CAF50'
    },
    error: {
        label: 'Error',
        icon: '❌',
        color: '#F44336'
    },
    update: {
        label: 'Actualización',
        icon: '🔄',
        color: '#00BCD4'
    }
}

// Constantes para prioridades
export const PRIORITIES = {
    urgent: {
        label: 'Urgente',
        color: '#F44336',
        backgroundColor: '#ffebee'
    },
    high: {
        label: 'Alta',
        color: '#FF9800',
        backgroundColor: '#fff3e0'
    },
    medium: {
        label: 'Media',
        color: '#FFC107',
        backgroundColor: '#fffde7'
    },
    low: {
        label: 'Baja',
        color: '#9E9E9E',
        backgroundColor: '#f5f5f5'
    }
}

// Mensajes de la interfaz
export const MESSAGES = {
    title: 'Anuncios Informativos',
    noAnnouncements: 'No hay anuncios disponibles',
    loading: 'Cargando anuncios...',
    error: 'Error al cargar los anuncios',
    errorRetry: 'Reintentar',
    position: 'Anuncio {current} de {total}',
    previous: 'Anterior',
    next: 'Siguiente',
    close: 'Cerrar',
    markAsRead: 'Marcar como leído',
    published: 'Publicado',
    expires: 'Expira',
    attachments: 'Archivos adjuntos',
    download: 'Descargar',
    read: 'Leído',
    unread: 'No leído'
}

// Mensajes de error
export const ERROR_MESSAGES = {
    loadError: 'Error al cargar los anuncios. Por favor, intenta de nuevo.',
    markReadError: 'Error al marcar el anuncio como leído.',
    networkError: 'Error de conexión. Verifica tu conexión a internet.',
    serverError: 'Error del servidor. Por favor, intenta más tarde.',
    unauthorized: 'No tienes permisos para ver los anuncios.',
    notFound: 'Anuncio no encontrado.'
}



