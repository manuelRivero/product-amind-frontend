import client from 'api/client'

export const getSalesStats = (access, from) => {
    // console.log("from", from)
    return client.get(`api/sale/dailySales?from=${from}`, {
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

export const getMonthlySales = (access, date) => {
    return client.get(`api/sale/monthlySales?date=${date}`, {
        headers: {
            'x-token': access,
        },
    })
}

export const getTopProducts = (access, page, date) => {
    return client.get(`api/products/topProducts?page=${page}&date=${date}`, {
        headers: {
            'x-token': access,
        },
    })
}

export const getNotifications = (access, page, tenant) => {
    return client.get(`api/notifications`, {
        params: { page, tenant },
        headers: {
            'x-token': access,
        },
    })
}
