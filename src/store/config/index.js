import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getConfig } from '../../api/config'
import { cancelSubscription, pauseSubscription } from '../../api/subscriptions'

const initialState = {
    loadingConfig: true,
    loadingCancelSubscription: false,
    loadingPauseSubscription: false,
    configDetail: null,
    error: false,
    tenant: null,
}

export const getConfigRequest = createAsyncThunk(
    'get/config',
    async (_, { rejectWithValue }) => {
        console.log("get config request")
        try {
            const response = await getConfig()
            return response
        } catch (error) {
            console.error('Config request error:', error)
            // Handle different types of errors
            if (error.response) {
                // Server responded with error status
                return rejectWithValue({
                    message: error.response.data?.message || 'Error del servidor',
                    status: error.response.status
                })
            } else if (error.request) {
                // Network error
                return rejectWithValue({
                    message: 'Error de conexión. Verifique su conexión a internet.',
                    status: 0
                })
            } else {
                // Other error
                return rejectWithValue({
                    message: error.message || 'Error desconocido',
                    status: -1
                })
            }
        }
    }
)

export const cancelSubscriptionRequest = createAsyncThunk(
    'cancel/subscription',
    async (_, { rejectWithValue }) => {
        try {
            const response = await cancelSubscription()
            return response
        } catch (error) {
            console.error('Cancel subscription error:', error)
            if (error.response) {
                return rejectWithValue({
                    message: error.response.data?.message || 'Error al cancelar la suscripción',
                    status: error.response.status
                })
            } else if (error.request) {
                return rejectWithValue({
                    message: 'Error de conexión. Verifique su conexión a internet.',
                    status: 0
                })
            } else {
                return rejectWithValue({
                    message: error.message || 'Error desconocido',
                    status: -1
                })
            }
        }
    }
)

export const pauseSubscriptionRequest = createAsyncThunk(
    'pause/subscription',
    async (_, { rejectWithValue }) => {
        try {
            const response = await pauseSubscription()
            return response
        } catch (error) {
            console.error('Pause subscription error:', error)
            if (error.response) {
                return rejectWithValue({
                    message: error.response.data?.message || 'Error al pausar la suscripción',
                    status: error.response.status
                })
            } else if (error.request) {
                return rejectWithValue({
                    message: 'Error de conexión. Verifique su conexión a internet.',
                    status: 0
                })
            } else {
                return rejectWithValue({
                    message: error.message || 'Error desconocido',
                    status: -1
                })
            }
        }
    }
)

export const configSlice = createSlice({
    name: 'config',
    initialState,
    reducers: {
        setStoreTenant: (state, action) => {
            state.tenant = action.payload
        }
    },
    extraReducers: {
        [getConfigRequest.pending]: (state) => {
            state.loadingConfig = true
        },
        [getConfigRequest.fulfilled]: (state, action) => {
            state.loadingConfig = false
            state.configDetail = action.payload.data.config
        },
        [getConfigRequest.rejected]: (state, action) => {
            state.loadingConfig = false
            state.error = true
            state.errorDetails = action.payload
        },
        [cancelSubscriptionRequest.pending]: (state) => {
            state.loadingCancelSubscription = true
        },
        [cancelSubscriptionRequest.fulfilled]: (state, action) => {
            state.loadingCancelSubscription = false
            // Refresh config after successful cancellation
            state.configDetail = action.payload.data.config
        },
        [cancelSubscriptionRequest.rejected]: (state, action) => {
            state.loadingCancelSubscription = false
            state.error = true
            state.errorDetails = action.payload
        },
        [pauseSubscriptionRequest.pending]: (state) => {
            state.loadingPauseSubscription = true
        },
        [pauseSubscriptionRequest.fulfilled]: (state, action) => {
            state.loadingPauseSubscription = false
            // Refresh config after successful pause
            state.configDetail = action.payload.data.config
        },
        [pauseSubscriptionRequest.rejected]: (state, action) => {
            state.loadingPauseSubscription = false
            state.error = true
            state.errorDetails = action.payload
        },
    },
})

export const { setStoreTenant } = configSlice.actions

export default configSlice.reducer
