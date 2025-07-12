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