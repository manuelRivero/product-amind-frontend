import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getConfig } from '../../api/config'

const initialState = {
    loadingConfig: true,
    configDetail: null,
    error: false,
    tenant: null,
}

export const getConfigRequest = createAsyncThunk(
    'get/config',
    async (args, { rejectWithValue }) => {
        console.log("get", args)
        try {
            const response = await getConfig(args.access)
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
    },
})

export const { setStoreTenant } = configSlice.actions

export default configSlice.reducer
