import client from 'api/client'

export const getProducts = (access, filters) => {
    const handleFilters = () => {
        let filterQuery = ''
        Object.keys(filters).map((key, index) => {
            if (index === 0) {
                filterQuery = filterQuery + `?${key}=${filters[key]}`
            } else {
                filterQuery = filterQuery + `&${key}=${filters[key]}`
            }
        })
        return filterQuery
    }
    return client.get(`api/products/admin-products${handleFilters()}`, {
        headers: {
            'x-token': access,
        },
    })
}

export const getProductDetail = (access, id) => {
    return client.get(`api/products/detail?id=${id}`, {
        headers: {
            'x-token': access,
        },
    })
}

export const deleteProduct = (access, id) => {
    return client.delete(`api/products/delete/${id}`, {
        headers: {
            'x-token': access,
        },
    })
}

export const getProductsTemplateExcel = (access) => {
    // console.log("getProductsTemplateExcel")
    return client.get(`api/products/get-excel-template`, {
        responseType: 'blob',
        headers: {
            'x-token': access,
        },
    })
}

export const uploadExcel = (access, form) => {
    return client.post(`api/products/productsExcel`, form, {
        headers: {
            'x-token': access,
        },
    })
}
export const uploadZip = (access, form) => {
    return client.post(`api/products/productsImages`, form, {
        headers: {
            'x-token': access,
        },
    })
}

export const uploadProduct = (access, data) => {
    console.log(data, '.......')

    return client.post(`api/products`, data, {
        headers: {
            'x-token': access,
        },
    })
}

export const editProduct = (access, data, id) => {
    return client.put(`api/products/edit/${id}`, data, {
        headers: {
            'x-token': access,
        },
    })
}

export const searchColors = (access, query) => {
    return client.get(`/api/colors/search?q=${query}`, {
        headers: {
            'x-token': access,
        },
    })
}

export const createColor = (access, data) => {
    return client.post(`/api/colors`, data, {
        headers: {
            'x-token': access,
        },
    })
}

export const searchSizes = (access, query) => {
    return client.get(`/api/sizes/search?q=${query}`, {
        headers: {
            'x-token': access,
        },
    })
}

export const createSize = (access, data) => {
    return client.post(`/api/sizes`, data, {
        headers: {
            'x-token': access,
        },
    })
}

export const getProductsWithoutStock = (access, params = {}) => {
    const { page = 0, limit = 10, stock = 0 } = params
    const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        stock: stock.toString(),
    })
    return client.get(`api/products/without-stock?${queryParams.toString()}`, {
        headers: {
            'x-token': access,
        },
    })
}

export const getTopSellingProducts = (access, params = {}) => {
    const { page = 0, limit = 10, month, year, startDate, endDate } = params
    const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    })
    
    if (month && year) {
        queryParams.append('month', month.toString())
        queryParams.append('year', year.toString())
    } else if (startDate && endDate) {
        queryParams.append('startDate', startDate)
        queryParams.append('endDate', endDate)
    }
    
    return client.get(`api/products/top-selling?${queryParams.toString()}`, {
        headers: {
            'x-token': access,
        },
    })
}

export const applyInflationAdjustment = (access, data) => {
    return client.put(`api/products/adjust-prices`, data, {
        headers: {
            'x-token': access,
        },
    })
}