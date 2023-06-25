import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
    getSales as getSalesRequest,
    changeSaleStatus as changeSaleStatusRequest,
    createSale as createSaleRequest
} from 'api/sales'

const initialState = {
    salesData: null,
    loadingSalesData: true,
    loadingChangeStatus: null,
    loadingCreateSale: false,
    createSaleSuccess: false
}

export const getSales = createAsyncThunk(
    'get/sales',
    async (args, { rejectWithValue }) => {
        try {
            const response = await getSalesRequest(args.access, args.filters)
            return response
        } catch (error) {
            console.log('error', error)
            return rejectWithValue(error.response.data)
        }
    }
)

export const changeSalesStatus = createAsyncThunk(
    'put/sales',
    async (args, { rejectWithValue }) => {
        try {
            console.log("put sales")
            const response = await changeSaleStatusRequest(
                args.access,
                args.id,
                args.status,
                args.paymentMethod
            )
            return response
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const createSale = createAsyncThunk(
    'post/sales',
    async (args, { rejectWithValue }) => {
        try {
            const response = await createSaleRequest(
                args.access,
                args.saleData
            )
            return response
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const salesSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        resetCreateSaleSuccess : (state)=>{
            state.createSaleSuccess = false
        }
    },
    extraReducers: {
        [getSales.pending]: (state) => {
            state.loadingSalesData = true
        },
        [getSales.fulfilled]: (state, action) => {
            state.loadingSalesData = false
            state.salesData = {sales:action.payload.data.sales}
        },
        [getSales.rejected]: (state) => {
            state.loadingSalesData = false
        },
        [changeSalesStatus.pending]: (state, action) => {
            console.log("action", action)
            state.loadingChangeStatus = action.meta.arg.id
        },
        [changeSalesStatus.fulfilled]: (state, action) => {
            state.loadingChangeStatus = null
            const { id, status } = action.payload.data
            const targetIndex = state.salesData.sales.findIndex(
                (e) => e._id === id
            )
            console.log("target", state.salesData.sales[targetIndex] )
            state.salesData.sales[targetIndex].status = status
        },
        [changeSalesStatus.rejected]: (state) => {
            state.loadingChangeStatus = null
        },
        [createSale.pending]: (state) => {
            state.loadingCreateSale = true
        },
        [createSale.fulfilled]: (state) => {
            state.loadingCreateSale = false
            state.createSaleSuccess = true
        },
        [createSale.rejected]: (state) => {
            state.loadingCreateSale = false
        },
    },
})
export const { resetCreateSaleSuccess } = salesSlice.actions

export default salesSlice.reducer
