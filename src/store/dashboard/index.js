import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getDailySales } from 'api/dashboard'
import { getUSers } from 'api/dashboard'
import { getSalesStats } from 'api/dashboard'

const initialState = {
    salesStats: null,
    loadingStats: true,
    users: null,
    dailySales: null
}

export const getStats = createAsyncThunk(
    '/get/stats',
    async (args, { rejectWithValue }) => {
        try {
            const [salesStats, users, dailySales] = await Promise.all([
                getSalesStats(args.access, "week"),
                getUSers(args.access),
                getDailySales(args.access)
            ])
            return [salesStats, users, dailySales]
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)
export const getSalesByDate = createAsyncThunk(
    '/get/getSalesByDate',
    async (args, { rejectWithValue }) => {
        try {
            const response = await getSalesStats(args.access, args.from)
            return response 
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {},
    extraReducers: {
        [getStats.pending]: (state) => {
            state.loadingStats = true
        },
        [getStats.fulfilled]: (state, action) => {
            state.loadingStats = false
            console.log("getStats action", action)

            state.salesStats = action.payload[0].data.total
            state.users = action.payload[1].data.users
            state.dailySales = action.payload[2].data.sales
        },
        [getStats.rejected]: (state) => {
            state.loadingStats = false
        },
        [getSalesByDate.pending]: (state) => {
            state.loadingStats = true
        },
        [getSalesByDate.fulfilled]: (state, action) => {
            state.loadingStats = false
            state.salesStats = action.payload.data.total
        },
        [getSalesByDate.rejected]: (state) => {
            state.loadingStats = false
        },
    },
})
export const { logout } = dashboardSlice.actions

export default dashboardSlice.reducer
