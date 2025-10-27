import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { connectMarketplace as connectMarketplaceApi } from '../../api/mercado-pago'
export const connectMarketplace = createAsyncThunk(
    'mercado-pago/connectMarketplace',
    async (_, { rejectWithValue }) => {
        try {
            const response = await connectMarketplaceApi()
            return response
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Error al obtener permisos' })
        }
    }
)

export const mercadoPagoSlice = createSlice({
    name:"mercado-pago",
    initialState: {},
    reducers: {},
    extraReducers: {},
})

export default mercadoPagoSlice.reducer
