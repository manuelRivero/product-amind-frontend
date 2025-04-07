import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
    getSales as getSalesRequest,
    getSale as getSaleRequest,
    changeSaleStatus as changeSaleStatusRequest,
    createSale as createSaleRequest
} from 'api/sales'

const initialState = {
    salesData: null,
    loadingSalesData: true,
    loadingChangeStatus: null,
    loadingCreateSale: false,
    createSaleSuccess: false,
    saleData:null,
    loadingSaleData:true,
    loadingSaleDetailStatus: false
}

export const getSales = createAsyncThunk(
    'get/sales',
    async (args, { rejectWithValue }) => {
        try {
            const response = await getSalesRequest(args.access, args.filters, args.page, args.dateFrom, args.dateTo)
            return response
        } catch (error) {
            console.log('error', error)
            return rejectWithValue(error.response.data)
        }
    }
)

export const getSale = createAsyncThunk(
    'get/sale-detail',
    async (args, { rejectWithValue }) => {
        try {
            const response = await getSaleRequest(args.access, args.id)
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

export const changeDetailSalesStatus = createAsyncThunk(
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
            state.salesData = {sales:action.payload.data.sales, total: action.payload.data.total}
        },
        [getSales.rejected]: (state) => {
            state.loadingSalesData = false
        },
        [getSale.pending]: (state) => {
            state.loadingSaleData = true
        },
        [getSale.fulfilled]: (state, action) => {
            state.loadingSaleData = false
            state.saleData = action.payload.data.data
        },
        [getSale.rejected]: (state) => {
            state.loadingSaleData = false
        },
        [changeSalesStatus.pending]: (state, action) => {
            console.log("action", action)
            state.loadingChangeStatus = action.meta.arg.id
        },
        [changeSalesStatus.fulfilled]: (state, action) => {
            state.loadingChangeStatus = null
            const { id, status } = action.payload.data
            console.log("sales data", state.salesData)
            const targetIndex = state.salesData.sales.findIndex(
                (e) => e._id === id
            )
            console.log("target", state.salesData.sales[targetIndex] )
            state.salesData.sales[targetIndex].status = status
        },
        [changeSalesStatus.rejected]: (state) => {
            state.loadingChangeStatus = null
        },
        [changeDetailSalesStatus.pending]: (state) => {
            state.loadingSaleDetailStatus = true
        },
        [changeDetailSalesStatus.fulfilled]: (state, action) => {
            state.loadingSaleDetailStatus = false
            const { status } = action.payload.data
            state.saleData.status = status
        },
        [changeDetailSalesStatus.rejected]: (state) => {
            state.loadingSaleDetailStatus = false
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
