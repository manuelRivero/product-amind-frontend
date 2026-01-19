import client from "api/client";

export const login = (data) => {
    console.log("Login API call with data:", data)
    return client.post(`api/auth/admin`, data)
}

export const getUserPermissions = (userId, token, tenant) => {
    return client.get(`api/user/${userId}/permissions`, {
        headers: {
            'x-token': token,
        },
        params: {
            tenant: tenant
        }
    })
}

export const requestPasswordReset = ({ email, tenant }) => {
    return client.post(`api/auth/password-reset/request`, { email }, {
        params: {
            tenant,
        },
    })
}

export const validatePasswordResetToken = ({ token, tenant }) => {
    return client.get(`api/auth/password-reset`, {
        params: {
            token,
            tenant,
        },
    })
}

export const confirmPasswordReset = ({ token, newPassword, tenant }) => {
    return client.post(`api/auth/password-reset`, { token, newPassword }, {
        params: {
            tenant,
        },
    })
}