import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { addOffer as addOfferRequest } from '../../api/offers'
// api

export const addOffer = createAsyncThunk(
    '/get/add-offer',
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

const initialState = {
    loadingAddOffer: false,
    errorAddOffer: false,
    successAddOffer: false,
}

export const offerSlice = createSlice({
    name: 'offers',
    initialState,
    reducers: {
        resetSuccess: (state) => {
            state.successAddOffer = false
        }
    },
    extraReducers: {
        [addOffer.pending]: (state) => {
            console.log('pending')
            state.loadingAddOffer = true
        },
        [addOffer.fulfilled]: (state, action) => {
            console.log('fulfilled', state, action)

            state.loadingAddOffer = false
            state.successAddOffer = true
        },
        [addOffer.rejected]: (state) => {
            console.log('rejected')
            state.loadingAddOffer = false
        },
    },
})
export const { resetSuccess } = offerSlice.actions;

export default offerSlice.reducer
