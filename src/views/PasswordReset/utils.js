import { TOKEN_ERROR_MESSAGES } from './constants'

export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/

export const getTokenFromSearch = (search) => {
    if (!search) return ''
    const params = new URLSearchParams(search)
    return params.get('token') || ''
}

export const getResetTokenErrorMessage = (code) => {
    if (!code) return TOKEN_ERROR_MESSAGES.TOKEN_INVALID
    return TOKEN_ERROR_MESSAGES[code] || TOKEN_ERROR_MESSAGES.TOKEN_INVALID
}

export const getApiErrorMessage = (error, fallback) => {
    const apiMessage = error?.response?.data?.message
    if (apiMessage && typeof apiMessage === 'string') {
        return apiMessage
    }
    return fallback
}
