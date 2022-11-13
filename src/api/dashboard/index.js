import client from 'api/client'

export const getSalesStats = (access, from) => {
    return client.get(`api/sale/byDate`, {
        params: {
            from,
        },
        headers:{
            "x-token": access
        }
    })
}

export const getUSers = (access) => {
    return client.get(`api/user`, {
        params: {
            from: 'week',
        },
        headers:{
            "x-token": access
        }
    })
}

export const getDailySales = (access) => {
    return client.get(`api/sale/dailySales`, {
        headers:{
            "x-token": access
        }
    })
}
