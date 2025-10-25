export const COUPON_TYPES = {
    PERCENTAGE: 'percentage',
    FIXED: 'fixed'
}

export const COUPON_TYPE_LABELS = {
    [COUPON_TYPES.PERCENTAGE]: 'Porcentaje',
    [COUPON_TYPES.FIXED]: 'Monto fijo'
}

export const COUPON_STATUS = {
    PENDING: 'pending',
    ACTIVE: 'active',
    EXPIRED: 'expired'
}

export const COUPON_STATUS_LABELS = {
    [COUPON_STATUS.PENDING]: 'Pendiente',
    [COUPON_STATUS.ACTIVE]: 'Activo',
    [COUPON_STATUS.EXPIRED]: 'Expirado'
}

export const COUPON_STATUS_COLORS = {
    [COUPON_STATUS.PENDING]: '#FFA726', // Orange
    [COUPON_STATUS.ACTIVE]: '#66BB6A',  // Green
    [COUPON_STATUS.EXPIRED]: '#EF5350'  // Red
}

export const DEFAULT_COUPON_VALUES = {
    code: '',
    name: '',
    description: '',
    type: COUPON_TYPES.PERCENTAGE,
    value: 0,
    minimumAmount: 0,
    maximumDiscount: 0,
    usageLimit: 0,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    applicableProducts: [],
    applicableCategories: [],
    excludedProducts: [],
    userRestrictions: {
        firstTimeOnly: false,
        specificUsers: [],
        maxUsesPerUser: 1
    }
}
