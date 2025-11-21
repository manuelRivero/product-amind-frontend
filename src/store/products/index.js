import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { uploadZip } from 'api/products'
import {
    getProducts as getProductsRequest,
    uploadExcel,
    uploadProduct,
    getProductDetail as getProductsDetailRequest,
    editProduct as editProductRequest,
    getProductsTemplateExcel as getProductsTemplateExcelRequest,
    deleteProduct as deleteProductRequest,
    searchColors as searchColorsRequest,
    createColor as createColorRequest,
    searchSizes as searchSizesRequest,
    createSize as createSizeRequest,
    getProductsWithoutStock as getProductsWithoutStockRequest,
    getTopSellingProducts as getTopSellingProductsRequest,
    applyInflationAdjustment as applyInflationAdjustmentRequest
} from 'api/products'

const initialState = {
    productsData: null,
    loadingProductsData: true,
    loadingExcel: false,
    uploadExcelErrors:null,
    loadingZip: false,
    uploadZipError: false,
    zipErrors: null,
    productDetailError:false,
    productDetail:null,
    loadingProductDetail: true,
    loadingTemplateExcel:false,
    templateExcelResult:null,
    loadingInflationAdjustment: false,
    inflationAdjustmentSuccess: false,
    inflationAdjustmentError: null
}

export const getProductsTemplateExcel = createAsyncThunk('/get/excel-template', async (args) => {
    const [response] = await Promise.all([
        getProductsTemplateExcelRequest(args.access),
    ])
    return response
})

export const getProducts = createAsyncThunk('/get/products', async (args) => {
    const [products] = await Promise.all([
        getProductsRequest(args.access, args.filters),
    ])
    return products
})

export const getProductDetail = createAsyncThunk(
    '/get/products-detail',
    async (args) => {
        const [products] = await Promise.all([
            getProductsDetailRequest(args.access, args.id),
        ])
        return products
    }
)

export const editProduct = createAsyncThunk(
    '/put/products',
    async (args) => {
        const [products] = await Promise.all([
            editProductRequest(args.access, args.data, args.id),
        ])
        return products
    }
)

export const postProducts = createAsyncThunk('/post/products', async (args, {rejectWithValue}) => {
    try {
        const [products] = await Promise.all([
            uploadProduct(args.access, args.data),
        ])
        return products
    } catch (error) {
        console.log('error EN EL CATCH de postProducts', error)
        return rejectWithValue(error.response.data)
    }
})

export const postProductsExcel = createAsyncThunk(
    '/post/productsExcel',
    async (args) => {
        const [response] = await Promise.all([
            uploadExcel(args.access, args.form),
        ])
        return response
    }
)

export const postImagesFromZip = createAsyncThunk(
    '/post/productsImages',
    async (args) => {
        const [response] = await Promise.all([
            uploadZip(args.access, args.form),
        ])
        return response
    }
)

export const deleteProduct = createAsyncThunk(
    '/delete/deleteProduct',
    async (args) => {
        const [response] = await Promise.all([
            deleteProductRequest(args.access, args.id),
        ])
        return response
    }
)

export const searchColors = createAsyncThunk(
    '/get/search-colors',
    async (args) => {
        const [response] = await Promise.all([
            searchColorsRequest(args.access, args.query),
        ])
        return response
    }
)

export const createColor = createAsyncThunk(
    '/post/create-color',
    async (args) => {
        const [response] = await Promise.all([
            createColorRequest(args.access, args.data),
        ])
        return response
    }
)

export const searchSizes = createAsyncThunk(
    '/get/search-sizes',
    async (args) => {
        const [response] = await Promise.all([
            searchSizesRequest(args.access, args.query),
        ])
        return response
    }
)

export const createSize = createAsyncThunk(
    '/post/create-size',
    async (args) => {
        const [response] = await Promise.all([
            createSizeRequest(args.access, args.data),
        ])
        return response
    }
)

export const getProductsWithoutStock = createAsyncThunk(
    '/get/products-without-stock',
    async (args) => {
        const [response] = await Promise.all([
            getProductsWithoutStockRequest(args.access, args.params),
        ])
        return response
    }
)

export const getTopSellingProducts = createAsyncThunk(
    '/get/top-selling-products',
    async (args) => {
        const [response] = await Promise.all([
            getTopSellingProductsRequest(args.access, args.params),
        ])
        return response
    }
)

export const applyInflationAdjustment = createAsyncThunk(
    '/put/adjust-prices',
    async (args, { rejectWithValue }) => {
        try {
            const [response] = await Promise.all([
                applyInflationAdjustmentRequest(args.access, args.data),
            ])
            return response
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Error al aplicar ajuste inflacionario' })
        }
    }
)

export const productsSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        resetZipErrors: (state) => {
            state.zipErrors = null
        },
        resetExcelErrors: (state) => {
            state.uploadExcelErrors = null
        },
        resetInflationAdjustmentState: (state) => {
            state.inflationAdjustmentSuccess = false
            state.inflationAdjustmentError = null
        }
    },
    extraReducers: {
        [getProducts.pending]: (state) => {
            state.loadingProductsData = true
        },
        [getProducts.fulfilled]: (state, action) => {
            state.loadingProductsData = false
            console.log('action.payload.data', action.payload.data)
            state.productsData = {
                data: action.payload.data,
                pageInfo: action.payload.data.pageInfo,
            }
        },
        [getProducts.rejected]: (state) => {
            state.loadingProductsData = false
        },
        [postProductsExcel.pending]: (state) => {
            state.loadingExcel = true
        },
        [postProductsExcel.fulfilled]: (state, action) => {
            console.log("postProductsExcel", action.payload.data)
            state.loadingExcel = false
            state.uploadExcelErrors = action.payload.data.productWithErrors

        },
        [postProductsExcel.rejected]: (state) => {
            state.loadingExcel = false
        },
        [postImagesFromZip.pending]: (state) => {
            state.loadingZip = true
        },
        [postImagesFromZip.fulfilled]: (state, action) => {
            state.loadingZip = false;
            state.zipErrors = action.payload.data.productWithErrors
        },
        [postImagesFromZip.rejected]: (state) => {
            state.loadingZip = false
        },
        [getProductDetail.pending]: (state) => {
            state.loadingProductDetail = true
        },
        [getProductDetail.fulfilled]: (state, action) => {
            state.loadingProductDetail = false
            state.productDetail = action.payload.data.product
        },
        [getProductDetail.rejected]: (state) => {
            state.loadingProductDetail = false
            state.productDetailError = true
        },
        [getProductsTemplateExcel.pending]: (state) => {
            state.loadingTemplateExcel = true
        },
        [getProductsTemplateExcel.fulfilled]: (state, action) => {
            state.loadingTemplateExcel = false;
            state.templateExcelResult = action.payload.data
        },
        [getProductsTemplateExcel.rejected]: (state) => {
            state.loadingTemplateExcel = false
        },
        [deleteProduct.fulfilled]: (state, action) => {
            const {id} = action.payload.data
            console.log('deleteProduct', id)
            const products = state.productsData.data.products.filter((product) => product._id !== id)
            state.productsData.data.products = products
        },
        [applyInflationAdjustment.pending]: (state) => {
            state.loadingInflationAdjustment = true
            state.inflationAdjustmentSuccess = false
            state.inflationAdjustmentError = null
        },
        [applyInflationAdjustment.fulfilled]: (state) => {
            state.loadingInflationAdjustment = false
            state.inflationAdjustmentSuccess = true
            state.inflationAdjustmentError = null
        },
        [applyInflationAdjustment.rejected]: (state, action) => {
            state.loadingInflationAdjustment = false
            state.inflationAdjustmentSuccess = false
            state.inflationAdjustmentError = action.payload || { message: 'Error al aplicar ajuste inflacionario' }
        },
    },
})
export const { resetExcelErrors, resetZipErrors, resetInflationAdjustmentState } = productsSlice.actions

export default productsSlice.reducer
