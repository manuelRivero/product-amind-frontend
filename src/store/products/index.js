import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { uploadZip } from 'api/products'
import { getProducts as getProductsRequest, uploadExcel  } from 'api/products'

const initialState = {
    productsData: null,
    loadingProductsData: true,
    loadingExcel: false,
    loadingZip:false
}

export const getProducts = createAsyncThunk('/get/products', async (args) => {
    const [products] = await Promise.all([
        getProductsRequest(args.access, args.filters),
    ])
    return products
})

export const postProductsExcel = createAsyncThunk('/post/productsExcel', async (args) => {
    const [response] = await Promise.all([
        uploadExcel(args.access, args.form),
    ])
    return response
})

export const postImagesFromZip = createAsyncThunk('/post/productsImages', async (args) => {
    const [response] = await Promise.all([
        uploadZip(args.access, args.form),
    ])
    return response
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
            state.loadingProductsData = false
        },
        [postProductsExcel.pending]: (state) => {
            state.loadingExcel = true
        },
        [postProductsExcel.fulfilled]: (state) => {
            state.loadingExcel = false
        },
        [postProductsExcel.rejected]: (state) => {
            state.loadingExcel = false
        },
        [postImagesFromZip.pending]: (state) => {
            state.loadingZip = true
        },
        [postImagesFromZip.fulfilled]: (state) => {
            state.loadingZip = false
        },
        [postImagesFromZip.rejected]: (state) => {
            state.loadingZip = false
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
