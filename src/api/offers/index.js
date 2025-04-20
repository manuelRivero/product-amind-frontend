import client from 'api/client'

export const addOffer = (data) => {
    return client.post(`api/offers/add-offer`, data)
}

export const updateOffer = (data, id) => {
    return client.put(`api/offers/update-offer/${id}`, data)
}

export const finishOffer = (id) => {
    return client.put(`api/offers/finish-offer/${id}`)
}
export const deleteOffer = (id) => {
    return client.delete(`api/offers/delete-offer/${id}`)
}

export const getOffer = () => {
    return client.get(`api/offers/get-offers-admin`)
}


export const getOfferDetail = (id) => {
    return client.get(`api/offers/get-offers-detail-admin/${id}`)
}

export const checkProduct = (id) => {
    return client.get(`api/offers/check-product-in-offer/${id}`)
}
