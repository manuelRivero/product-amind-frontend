import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
    addOffer as addOfferRequest,
    checkProduct,
    finishOffer as finishOfferRequest,
    getOffer as getOfferRequest,
    updateOffer as updateOfferRequest,
    deleteOffer as deleteOfferRequest
} from '../../api/offers'
// api

export const addOffer = createAsyncThunk(
    'post/add-offer',
    async (args, { rejectWithValue }) => {
        console.log('args', args)
        try {
            const response = await addOfferRequest(args)
            return response
        } catch (error) {
            console.log('thunk error')
            return rejectWithValue(error.response.data)
        }
    }
)
export const updateOffer = createAsyncThunk(
    'put/edit-offer',
    async (args, { rejectWithValue }) => {
        console.log('args', args)
        try {
            const response = await updateOfferRequest(args.data, args.id)
            return response
        } catch (error) {
            console.log('thunk error')
            return rejectWithValue(error.response.data)
        }
    }
)
export const getOffers = createAsyncThunk(
    'get/offers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getOfferRequest()
            return response
        } catch (error) {
            console.log('thunk error')
            return rejectWithValue(error.response.data)
        }
    }
)

export const getOfferDetail = createAsyncThunk(
    'get/offers-detail',
    async (args, { rejectWithValue }) => {
        try {
            const response = await getOfferRequest(args.id)
            return response
        } catch (error) {
            console.log('thunk error')
            return rejectWithValue(error.response.data)
        }
    }
)
export const checkProductInOffer = createAsyncThunk(
    'get/check-product',
    async (args, { rejectWithValue }) => {
        console.log("thunk id",args.id)
        try {
            const response = await checkProduct(args.id)
            return response
        } catch (error) {
            console.log('thunk error')
            return rejectWithValue(error.response.data)
        }
    }
)

export const finishOffer = createAsyncThunk(
    'get/finish-offer',
    async (args, { rejectWithValue }) => {
        try {
            const response = await finishOfferRequest(args.id)
            return response
        } catch (error) {
            console.log('thunk error')
            return rejectWithValue(error.response.data)
        }
    }
)

export const deleteOffer = createAsyncThunk(
    'get/delete-offer',
    async (args, { rejectWithValue }) => {
        try {
            const response = await deleteOfferRequest(args.id)
            return response
        } catch (error) {
            console.log('thunk error')
            return rejectWithValue(error.response.data)
        }
    }
)

const initialState = {
    offerDetail: null,
    loadingOfferDetail: false,
    errorOfferDetail: false,
    offers: undefined,
    loadingOffers: true,
    errorOffers: false,
}

export const offerSlice = createSlice({
    name: 'offers',
    initialState,
    reducers: {
        setLoadingOfferDetailOff: (state) => {
            state.loadingOfferDetail = false
        },
        resetOfferDetail: (state) => {
            state.offerDetail = null
        },
    },
    extraReducers: {
        [deleteOffer.fulfilled]: (state, action) => {
            const id = action.payload.data.offer._id
            state.offers = [...state.offers.filter((offer)=> offer._id !== id)]
        },
        [finishOffer.fulfilled]: (state, action) => {
            const id = action.payload.data.offer._id
            const targetOffer = state.offers.findIndex((offer)=> offer._id === id);
            if(targetOffer){
                state.offers[targetOffer].isActive = false
            }
        },
        [getOffers.pending]: (state) => {
            state.loadingOffers = true
        },
        [getOffers.fulfilled]: (state, action) => {
            console.log('fulfilled', state, action)

            state.loadingOffers = false
            state.offers = action.payload.data.offers
        },
        [getOffers.rejected]: (state) => {
            state.loadingOffers = false
            state.errorOffers = true
        },
        [getOfferDetail.pending]: (state) => {
            state.loadingOfferDetail = true
        },
        [getOfferDetail.fulfilled]: (state, action) => {
            console.log('fulfilled', state, action)

            state.loadingOfferDetail = false
            state.offerDetail = action.payload.data.offers[0]
        },
        [getOfferDetail.rejected]: (state) => {
            state.loadingOfferDetail = false
        },
    },
})
export const { setLoadingOfferDetailOff, resetOfferDetail } = offerSlice.actions

export default offerSlice.reducer
