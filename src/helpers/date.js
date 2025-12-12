import moment from 'moment-timezone'

/**
 * Formatea una fecha a la zona horaria de Argentina (America/Argentina/Buenos_Aires)
 * La fecha se asume que viene en UTC desde el backend
 * @param {string|Date} date - La fecha a formatear (en UTC)
 * @param {string} format - El formato de salida (por defecto: 'DD-MM-YYYY HH:mm:ss A')
 * @returns {string} La fecha formateada en la zona horaria de Argentina
 */
export const formatDateToArgentina = (date, format = 'DD-MM-YYYY HH:mm:ss A') => {
    if (!date) return ''
    
    // Primero parseamos la fecha como UTC, luego la convertimos a la zona horaria de Argentina
    return moment.utc(date)
        .tz('America/Argentina/Buenos_Aires')
        .format(format)
}

