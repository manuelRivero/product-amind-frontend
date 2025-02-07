import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getConfig } from '../../api/config'

const initialState = {
    loadingConfig: true,
    configDetail: null,
    error: false,
}

export const getConfigRequest = createAsyncThunk(
    'get/config',
    async (args, { rejectWithValue }) => {
        console.log("get", args)
        try {
            const response = await getConfig(args.access)
            return response
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const configSlice = createSlice({
    name: 'config',
    initialState,
    reducers: {},
    extraReducers: {
        [getConfigRequest.pending]: (state) => {
            state.loadingConfig = true
        },
        [getConfigRequest.fulfilled]: (state, action) => {
            state.loadingConfig = false
            state.configDetail = action.payload.data.config
        },
        [getConfigRequest.rejected]: (state) => {
            state.loadingConfig = false
            state.error = true
        },
    },
})

export default configSlice.reducer
