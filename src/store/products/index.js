import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { getProducts as getProductsRequest } from 'api/products'

const initialState = {
    productsData: null,
    loadingProductsData: true,
}

export const getProducts = createAsyncThunk('/get/products', async (args) => {
    const [products] = await Promise.all([
        getProductsRequest(args.access, args.filters),
    ])
    return products
})

export const productsSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {},
    extraReducers: {
        [getProducts.pending]: (state) => {
            state.loadingProductsData = true
        },
        [getProducts.fulfilled]: (state, action) => {
            state.loadingProductsData = false
            state.productsData = {
                data: action.payload.data.data,
                pageInfo: action.payload.data.pageInfo,
            }
        },
        [getProducts.rejected]: (state) => {
            console.log(' get products rejected')
            state.loadingProductsData = false
        },
    },
})
// export const {
//     userAdded,
//     notificationAdded,
//     setReadednotification,
//     setNotificationsPage,
// } = dashboardSlice.actions

export default productsSlice.reducer
