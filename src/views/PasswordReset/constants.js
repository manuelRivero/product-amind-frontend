export const RESET_ROUTES = {
    REQUEST: '/auth/forgot-password',
    RESET: '/auth/password-reset',
    SUCCESS: '/auth/password-reset/success',
}

export const PASSWORD_RULES_TEXT =
    'La contraseña debe tener al menos 8 caracteres, incluir una letra y un número.'

export const PASSWORD_RESET_COPY = {
    requestTitle: 'Olvidé mi contraseña',
    requestDescription:
        'Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.',
    requestSuccess:
        'Si el email existe, enviaremos un enlace de restablecimiento. Revisa tu bandeja de entrada.',
    requestCta: 'Volver a iniciar sesión',
    resetTitle: 'Restablecer contraseña',
    resetDescription: 'Define una nueva contraseña para tu cuenta.',
    validating: 'Validando el enlace de restablecimiento...',
    invalidTitle: 'Enlace no válido',
    invalidDescription:
        'El enlace de restablecimiento no es válido o ya expiró. Solicita uno nuevo para continuar.',
    invalidCta: 'Pedir nuevo correo',
    successTitle: 'Contraseña actualizada',
    successDescription:
        'Tu contraseña fue actualizada correctamente. Ya puedes iniciar sesión.',
    successCta: 'Iniciar sesión',
}

export const TOKEN_ERROR_MESSAGES = {
    TOKEN_INVALID: 'El enlace no es válido. Solicita uno nuevo.',
    TOKEN_EXPIRED: 'El enlace expiró. Solicita uno nuevo.',
    TOKEN_USED: 'Este enlace ya fue utilizado. Solicita uno nuevo.',
}
