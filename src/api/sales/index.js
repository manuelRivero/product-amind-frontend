import client from 'api/client'

export const getSales = (access, filters, page, from, to) => {
    const handleFilters = () => {
        let filterQuery = ''
        Object.keys(filters).map( (key, index) => {
            if(index === 0){
                filterQuery = filterQuery + `?${key}=${filters[key]}`
            } else {
                filterQuery = filterQuery + `&${key}=${filters[key]}`
            }
        })
        return filterQuery
    }
    return client.get(`api/sale${handleFilters()}`, {
        params: {
            page,
            from,
            to,
        },
        headers: {
            'x-token': access,
        },
    })
}

export const getSale = (access, id) => {
    return client.get(`api/sale/detail`, {
        params:{
            id
        },
        headers: {
            'x-token': access,
        },
    })
}

export const changeSaleStatus = (id, status, paymentMethod, reason) =>{
    
    return client.put(`api/sale/edit`, {
        id,
        status,
        paymentMethod : paymentMethod ? paymentMethod : null,
        reason: reason ? reason : null
    })
}

export const createSale = (access, saleData) => {

    return client.post(`api/sale/from-admin`, {
        ...saleData
    },{
        headers: {
            'x-token': access,
        },
    })

}

export const getPendingSales = (access, page, deliveryType = null) => {
    const params = { page }
    if (deliveryType) {
        params.deliveryType = deliveryType
    }
    return client.get(`api/sale/pending-sales`, {
        params,
        headers: {
            'x-token': access,
        },
    })
}