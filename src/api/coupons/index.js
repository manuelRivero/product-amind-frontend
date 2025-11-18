import client from 'api/client'

export const addCoupon = (data) => {
    return client.post(`api/coupons`, data)
}

export const updateCoupon = (data, id) => {
    return client.put(`api/coupons/${id}`, data)
}

export const finishCoupon = (id) => {
    return client.put(`api/coupons/finish-coupon/${id}`)
}

export const deleteCoupon = (id) => {
    return client.delete(`api/coupons/${id}`)
}

export const getCoupons = () => {
    return client.get(`api/coupons/`)
}

export const getCouponDetail = (id) => {
    return client.get(`api/coupons/${id}`)
}

export const checkProduct = (id) => {
    return client.get(`api/coupons/check-product-in-coupon/${id}`)
}
