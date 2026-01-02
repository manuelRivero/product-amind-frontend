// Constantes para manejo de errores de verificación de token
export const ERROR_MESSAGES = {
  TOKEN_INVALID_EXPIRED: 'Token inválido o expirado',
  TOKEN_NOT_FOUND: 'Token no encontrado',
  TOKEN_ALREADY_USED: 'Token ya ha sido utilizado',
};

export const USER_FRIENDLY_MESSAGES = {
  [ERROR_MESSAGES.TOKEN_INVALID_EXPIRED]: 'Tu token de verificación ha expirado o es inválido. Te hemos enviado un nuevo email con un enlace de verificación actualizado.',
  [ERROR_MESSAGES.TOKEN_NOT_FOUND]: 'No se encontró el token de verificación. Te hemos enviado un nuevo email con un enlace de verificación.',
  [ERROR_MESSAGES.TOKEN_ALREADY_USED]: 'Este token ya ha sido utilizado. Te hemos enviado un nuevo email con un enlace de verificación.',
};






