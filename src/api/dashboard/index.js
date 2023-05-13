import client from 'api/client'

export const getSalesStats = (access, from) => {
    return client.get(`api/sale/byDate`, {
        params: {
            from,
        },
        headers: {
            'x-token': access,
        },
    })
}

export const getUSers = (access) => {
    return client.get(`api/user`, {
        params: {
            from: 'week',
        },
        headers: {
            'x-token': access,
        },
    })
}

export const getDailySales = (access) => {
    return client.get(`api/sale/dailySales`, {
        headers: {
            'x-token': access,
        },
    })
}
export const getMonthlySales = (access, date) => {
    return client.get(`api/sale/monthlySales?date=${date}`, {
        headers: {
            'x-token': access,
        },
    })
}

export const getTopProducts = (access, page) => {
    return client.get(`api/products/topProducts?page=${page}`, {
        headers: {
            'x-token': access,
        },
    })
}

export const getNotifications = (access, page) => {
    return client.get(`api/notifications`, {
        params: { page },
        headers: {
            'x-token': access,
        },
    })
}
