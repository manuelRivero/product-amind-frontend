import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
    addCoupon as addCouponRequest,
    checkProduct,
    finishCoupon as finishCouponRequest,
    getCoupons as getCouponsRequest,
    updateCoupon as updateCouponRequest,
    deleteCoupon as deleteCouponRequest
} from '../../api/coupons'

export const addCoupon = createAsyncThunk(
    'post/add-coupon',
    async (args, { rejectWithValue }) => {
        console.log('args', args)
        try {
            const response = await addCouponRequest(args)
            return response
        } catch (error) {
            console.log('thunk error', error)
            return rejectWithValue(error.response.data)
        }
    }
)

export const updateCoupon = createAsyncThunk(
    'put/edit-coupon',
    async (args, { rejectWithValue }) => {
        console.log('args', args)
        try {
            const response = await updateCouponRequest(args.data, args.id)
            return response
        } catch (error) {
            console.log('thunk error', error)
            return rejectWithValue(error.response.data)
        }
    }
)

export const getCoupons = createAsyncThunk(
    'get/coupons',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getCouponsRequest()
            return response
        } catch (error) {
            console.log('thunk error', error)
            return rejectWithValue(error.response.data)
        }
    }
)

export const getCouponDetail = createAsyncThunk(
    'get/coupon-detail',
    async (args, { rejectWithValue }) => {
        try {
            const response = await getCouponsRequest(args.id)
            return response
        } catch (error) {
            console.log('thunk error', error)
            return rejectWithValue(error.response.data)
        }
    }
)

export const checkProductInCoupon = createAsyncThunk(
    'get/check-product',
    async (args, { rejectWithValue }) => {
        console.log("thunk id", args.id)
        try {
            const response = await checkProduct(args.id)
            return response
        } catch (error) {
            console.log('thunk error', error)
            return rejectWithValue(error.response.data)
        }
    }
)

export const finishCoupon = createAsyncThunk(
    'get/finish-coupon',
    async (args, { rejectWithValue }) => {
        try {
            const response = await finishCouponRequest(args.id)
            return response
        } catch (error) {
            console.log('thunk error', error)
            return rejectWithValue(error.response.data)
        }
    }
)

export const deleteCoupon = createAsyncThunk(
    'get/delete-coupon',
    async (args, { rejectWithValue }) => {
        try {
            const response = await deleteCouponRequest(args.id)
            return response
        } catch (error) {
            console.log('thunk error', error)
            return rejectWithValue(error.response.data)
        }
    }
)

const initialState = {
    couponDetail: null,
    loadingCouponDetail: false,
    errorCouponDetail: false,
    coupons: undefined,
    loadingCoupons: true,
    errorCoupons: false,
}

export const couponSlice = createSlice({
    name: 'coupons',
    initialState,
    reducers: {
        setLoadingCouponDetailOff: (state) => {
            state.loadingCouponDetail = false
        },
        resetCouponDetail: (state) => {
            state.couponDetail = null
        },
    },
    extraReducers: {
        [deleteCoupon.fulfilled]: (state, action) => {
            const id = action.payload.data.coupon._id
            state.coupons = [...state.coupons.filter((coupon) => coupon._id !== id)]
        },
        [finishCoupon.fulfilled]: (state, action) => {
            const id = action.payload.data.coupon._id
            const targetCoupon = state.coupons.findIndex((coupon) => coupon._id === id);
            if (targetCoupon) {
                state.coupons[targetCoupon].isActive = false
            }
        },
        [getCoupons.pending]: (state) => {
            state.loadingCoupons = true
        },
        [getCoupons.fulfilled]: (state, action) => {
            console.log('fulfilled', state, action)
            state.loadingCoupons = false
            state.coupons = action.payload.data.coupons
        },
        [getCoupons.rejected]: (state) => {
            state.loadingCoupons = false
            state.errorCoupons = true
        },
        [getCouponDetail.pending]: (state) => {
            state.loadingCouponDetail = true
        },
        [getCouponDetail.fulfilled]: (state, action) => {
            console.log('fulfilled', state, action)
            state.loadingCouponDetail = false
            state.couponDetail = action.payload.data.coupons[0]
        },
        [getCouponDetail.rejected]: (state) => {
            state.loadingCouponDetail = false
        },
    },
})

export const { setLoadingCouponDetailOff, resetCouponDetail } = couponSlice.actions

export default couponSlice.reducer
