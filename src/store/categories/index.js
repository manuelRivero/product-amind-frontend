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
    loadingCategory: false,
    categorySuccess: false,
    categoryError: false,
    loadingEditCategory: false,
    editCategoryError: false,
    editCategorySuccess: false,
}

export const getCategories = createAsyncThunk(
    '/get/categories',
    async (args) => {
        const [categories] = await Promise.all([
            getCategoriesRequest(args.access, args.filters, args.limit),
        ])
        return categories
    }
)

export const editCategory = createAsyncThunk(
    '/put/categories',
    async (args) => {
        const [categories] = await Promise.all([
            editCategoryRequest(args.access, args.data, args.id),
        ])
        return categories
    }
)

export const postCategories = createAsyncThunk(
    '/post/categories',
    async (args) => {
        const [categories] = await Promise.all([
            addCategory(args.access, args.data),
        ])
        return categories
    }
)

export const categoriesSlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {
        resetCategorySuccess: (state) => {
            state.categorySuccess = false
        },
        resetEditCategorySuccess: (state) => {
            state.editCategorySuccess = false
        },
    },
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
        [getCategories.rejected]: (state) => {
            state.loadingCategoriesData = false
            state.categoriesDataError = true
        },
        [postCategories.pending]: (state) => {
            state.loadingCategory = true
        },
        [postCategories.fulfilled]: (state) => {
            state.loadingCategory = false
            state.categorySuccess = true
        },
        [postCategories.rejected]: (state) => {
            state.loadingCategory = false
            state.categoryError = true
        },
        [editCategory.pending]: (state) => {
            state.loadingEditCategory = true
        },
        [editCategory.fulfilled]: (state) => {
            state.loadingEditCategory = false
            state.editCategorySuccess = true
            state.editCategoryError = false
        },
        [editCategory.rejected]: (state) => {
            state.loadingEditCategory = false
            state.editCategoryError = true
        },
    },
})
export const {
    resetCategorySuccess,
    resetEditCategorySuccess,
} = categoriesSlice.actions

export default categoriesSlice.reducer
