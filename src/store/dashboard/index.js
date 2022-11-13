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
                getSalesStats(args.access),
                getUSers(args.access),
                getDailySales(args.access)
            ])
            console.log(salesStats, users)
            return [salesStats, users, dailySales]
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
            console.log('action', action.payload)
            state.salesStats = action.payload[0].data.total
            state.users = action.payload[1].data.users
            state.dailySales = action.payload[2].data.sales
        },
        [getStats.rejected]: (state) => {
            state.loadingStats = false
        },
    },
})
export const { logout } = dashboardSlice.actions

export default dashboardSlice.reducer
