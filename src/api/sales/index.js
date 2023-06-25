import client from 'api/client'

export const getSales = (access, filters) => {
    console.log("access", access)
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
        headers: {
            'x-token': access,
        },
    })
}

export const changeSaleStatus = (access, id, status, paymentMethod) =>{
    
    return client.put(`api/sale/edit`, {
        id,
        status,
        paymentMethod : paymentMethod ? paymentMethod : null
    },{
        headers: {
            'x-token': access,
        },
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
