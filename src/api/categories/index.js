import client from 'api/client'

export const getCategories = (access, filters, limit = 10, ids=[]) => {
    console.log("api", access, filters, limit, ids)
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
    console.log('handleFilters', handleFilters())
    return client.get(
        `api/categories/get-categories${handleFilters()}`,
        {
            params:{
                limit,
                ids
            },
        }
    )
}

export const addCategory = (access, data) => {
    return client.post(`api/categories/create-category`, data, {
        headers: {
            'x-token': access,
        },
    })
}

export const editCategory = (access, data, id) => {
    return client.put(`api/categories/update-category/${id}`, data, {
        headers: {
            'x-token': access,
        },
    })
}

export const getCategoryDetail = (access, id) => {
    return client.get(`api/categories/get-category-detail-admin/${id}`, {
        headers: {
            'x-token': access,
        },
    })
}
