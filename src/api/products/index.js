import client from 'api/client'

export const getProducts = (access, filters) => {
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
    return client.get(`api/products/admin-products${handleFilters()}`, {
        headers: {
            'x-token': access,
        },
    })
}
