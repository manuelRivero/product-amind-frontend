import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getDailySales } from 'api/dashboard'
import { getUSers } from 'api/dashboard'
import { getSalesStats, getNotifications as getNotificationsRequest } from 'api/dashboard'

const initialState = {
    salesStats: null,
    loadingStats: true,
    users: null,
    dailySales: null,
    notifications:[]
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
export const getNotifications = createAsyncThunk(
    '/get/notifications',
    async (args, { rejectWithValue }) => {
        try {
            const response = await getNotificationsRequest(args.access, args.page)
            return response 
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        userAdded : (state, action) =>{
            state.users = [...state.users, action.payload]
        },
        notificationAdded : (state, action) =>{
            console.log("notification added action", action)

            state.notifications = [...state.notifications, action.payload]
        },
        setReadednotification : (state, action) =>{
            console.log("notification added action", action)
            const newNotifications = [...state.notifications].map(e => ({...e, readed: true}))
            state.notifications = newNotifications
        } 
    },
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
        [getNotifications.pending]: (state) => {
            state.loadingNotifications = true
        },
        [getNotifications.fulfilled]: (state, action) => {
            state.loadingNotifications = false
            state.notifications = action.payload.data.notifications
        },
        [getNotifications.rejected]: (state) => {
            state.loadingNotifications = false
        },
    },
})
export const { userAdded, notificationAdded, setReadednotification } = dashboardSlice.actions

export default dashboardSlice.reducer
