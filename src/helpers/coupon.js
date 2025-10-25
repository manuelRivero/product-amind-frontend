import moment from 'moment'
import { COUPON_STATUS, COUPON_STATUS_COLORS, COUPON_TYPE_LABELS } from '../const/coupons'

/**
 * Get the status of a coupon based on its validity dates
 * @param {string|Date} validFrom - Start date of the coupon
 * @param {string|Date} validUntil - End date of the coupon
 * @returns {string} Status of the coupon
 */
export const getCouponStatus = (validFrom, validUntil) => {
    const now = moment()
    const start = moment(validFrom)
    const end = moment(validUntil)
    
    if (now.isBefore(start)) {
        return COUPON_STATUS.PENDING
    } else if (now.isAfter(end)) {
        return COUPON_STATUS.EXPIRED
    } else {
        return COUPON_STATUS.ACTIVE
    }
}

/**
 * Get the color for a coupon status
 * @param {string|Date} validFrom - Start date of the coupon
 * @param {string|Date} validUntil - End date of the coupon
 * @returns {string} Color code for the status
 */
export const getCouponStatusColor = (validFrom, validUntil) => {
    const status = getCouponStatus(validFrom, validUntil)
    return COUPON_STATUS_COLORS[status]
}

/**
 * Format coupon value based on its type
 * @param {string} type - Type of coupon (percentage or fixed)
 * @param {number} value - Value of the coupon
 * @returns {string} Formatted value string
 */
export const formatCouponValue = (type, value) => {
    if (type === 'percentage') {
        return `${value}%`
    } else {
        return `$${value.toLocaleString()}`
    }
}

/**
 * Get the label for coupon type
 * @param {string} type - Type of coupon
 * @returns {string} Human-readable label
 */
export const getCouponTypeLabel = (type) => {
    return COUPON_TYPE_LABELS[type] || type
}

/**
 * Validate coupon data
 * @param {Object} couponData - Coupon data to validate
 * @returns {Object} Validation result with errors
 */
export const validateCouponData = (couponData) => {
    const errors = {}

    if (!couponData.code || couponData.code.trim() === '') {
        errors.code = 'El código del cupón es requerido'
    }

    if (!couponData.name || couponData.name.trim() === '') {
        errors.name = 'El nombre del cupón es requerido'
    }

    if (!couponData.value || couponData.value <= 0) {
        errors.value = 'El valor del cupón debe ser mayor a 0'
    }

    if (couponData.type === 'percentage' && couponData.value > 100) {
        errors.value = 'El porcentaje no puede ser mayor a 100%'
    }

    if (!couponData.validFrom) {
        errors.validFrom = 'La fecha de inicio es requerida'
    }

    if (!couponData.validUntil) {
        errors.validUntil = 'La fecha de finalización es requerida'
    }

    if (couponData.validFrom && couponData.validUntil) {
        const start = moment(couponData.validFrom)
        const end = moment(couponData.validUntil)
        
        if (end.isBefore(start)) {
            errors.validUntil = 'La fecha de finalización debe ser posterior a la fecha de inicio'
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    }
}

/**
 * Generate a unique coupon code
 * @param {string} prefix - Optional prefix for the code
 * @param {number} length - Length of the random part
 * @returns {string} Generated coupon code
 */
export const generateCouponCode = (prefix = '', length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = prefix.toUpperCase()
    
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    
    return result
}

/**
 * Check if a coupon is currently valid
 * @param {Object} coupon - Coupon object
 * @returns {boolean} True if coupon is valid
 */
export const isCouponValid = (coupon) => {
    if (!coupon) return false
    
    const now = moment()
    const start = moment(coupon.validFrom)
    const end = moment(coupon.validUntil)
    
    return now.isBetween(start, end, null, '[]') // inclusive of start and end
}

/**
 * Calculate discount amount for a given price
 * @param {Object} coupon - Coupon object
 * @param {number} price - Original price
 * @returns {number} Discount amount
 */
export const calculateDiscount = (coupon, price) => {
    if (!isCouponValid(coupon) || price < coupon.minimumAmount) {
        return 0
    }

    let discount = 0
    
    if (coupon.type === 'percentage') {
        discount = (price * coupon.value) / 100
        if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
            discount = coupon.maximumDiscount
        }
    } else {
        discount = coupon.value
    }
    
    return Math.min(discount, price) // Discount can't exceed the price
}
