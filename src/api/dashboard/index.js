import client from 'api/client'

export const getSalesStats = (access) => {
    return client.get(`api/sale/byDate`, {
        params: {
            from: 'week',
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
