import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
    getCategories as getCategoriesRequest,
    addCategory,
    editCategory as editCategoryRequest,
} from 'api/categories'

const initialState = {
    categoriesData: null,
    loadingCategoriesData: true,
    categoriesDataError: false,
}

export const getCategories = createAsyncThunk(
    '/get/categories',
    async (args, { rejectWithValue }) => {
        try {
            console.log("thunk")
            const [categories] = await Promise.all([
                getCategoriesRequest(args.access, args.filters, args.limit, args.ids),
            ])
            return categories
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Error al obtener las categorías' })
        }
    }
)

export const editCategory = createAsyncThunk(
    '/put/categories',
    async (args, { rejectWithValue }) => {
        try {
            const [categories] = await Promise.all([
                editCategoryRequest(args.access, args.data, args.id),
            ])
            return categories
        } catch (error) {
            return rejectWithValue(error.response?.data)
        }
    }
)

export const postCategories = createAsyncThunk(
    '/post/categories',
    async (args, { rejectWithValue }) => {
        try {
            const [categories] = await Promise.all([
                addCategory(args.access, args.data),
            ])
            return categories
        } catch (error) {
            return rejectWithValue(error.response?.data)
        }
    }
)

export const categoriesSlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {},
    extraReducers: {
        [getCategories.pending]: (state) => {
            state.loadingCategoriesData = true
        },
        [getCategories.fulfilled]: (state, action) => {
            state.loadingCategoriesData = false
            state.categoriesData = {
                data: action.payload.data.categories,
            }
        },
        [getCategories.rejected]: (state, action) => {
            console.log("action", action)
            state.loadingCategoriesData = false
            state.categoriesDataError = true
            state.error = action.payload
        },
    },
})

export default categoriesSlice.reducer
