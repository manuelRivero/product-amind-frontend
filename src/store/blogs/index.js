import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import client from '../../api/client'

// Async thunks
export const getBlogsRequest = createAsyncThunk(
    'blogs/getBlogsRequest',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await client.get(`/api/blogs/admin`, { params })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message)
        }
    }
)

export const getBlogDetailRequest = createAsyncThunk(
    'blogs/getBlogDetailRequest',
    async (blogId, { rejectWithValue }) => {
        try {
            const response = await client.get(`/api/blogs/admin/${blogId}`)
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message)
        }
    }
)

export const createBlogRequest = createAsyncThunk(
    'blogs/createBlogRequest',
    async (blogData, { rejectWithValue }) => {
        try {
            const response = await client.post(`/api/blogs/admin`, blogData)
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message)
        }
    }
)

export const updateBlogRequest = createAsyncThunk(
    'blogs/updateBlogRequest',
    async ({ blogId, blogData }, { rejectWithValue }) => {
        try {
            const response = await client.put(`/api/blogs/admin/${blogId}`, blogData)
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message)
        }
    }
)

export const deleteBlogRequest = createAsyncThunk(
    'blogs/deleteBlogRequest',
    async (blogId, { rejectWithValue }) => {
        try {
            const response = await client.delete(`/api/blogs/admin/${blogId}`)
            return { blogId, ...response.data }
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message)
        }
    }
)

// Initial state
const initialState = {
    // Listado de blogs
    blogs: [],
    totalBlogs: 0,
    currentPage: 0,
    totalPages: 0,
    loadingBlogs: false,
    blogsError: null,
    
    // Detalle de blog
    blogDetail: null,
    loadingBlogDetail: false,
    blogDetailError: null,
    
    // Creación de blog
    loadingCreateBlog: false,
    createBlogError: null,
    createBlogSuccess: false,
    
    // Actualización de blog
    loadingUpdateBlog: false,
    updateBlogError: null,
    updateBlogSuccess: false,
    
    // Eliminación de blog
    loadingDeleteBlog: false,
    deleteBlogError: null,
    deleteBlogSuccess: false,
}

// Slice
const blogsSlice = createSlice({
    name: 'blogs',
    initialState,
    reducers: {
        // Limpiar errores
        clearBlogsError: (state) => {
            state.blogsError = null
        },
        clearBlogDetailError: (state) => {
            state.blogDetailError = null
        },
        clearCreateBlogError: (state) => {
            state.createBlogError = null
        },
        clearUpdateBlogError: (state) => {
            state.updateBlogError = null
        },
        clearDeleteBlogError: (state) => {
            state.deleteBlogError = null
        },
        
        // Limpiar mensajes de éxito
        clearCreateBlogSuccess: (state) => {
            state.createBlogSuccess = false
        },
        clearUpdateBlogSuccess: (state) => {
            state.updateBlogSuccess = false
        },
        clearDeleteBlogSuccess: (state) => {
            state.deleteBlogSuccess = false
        },
        
        // Limpiar blog detail
        clearBlogDetail: (state) => {
            state.blogDetail = null
            state.blogDetailError = null
        },
        
        // Actualizar página actual
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload
        },
    },
    extraReducers: (builder) => {
        // Get Blogs
        builder
            .addCase(getBlogsRequest.pending, (state) => {
                state.loadingBlogs = true
                state.blogsError = null
            })
            .addCase(getBlogsRequest.fulfilled, (state, action) => {
                state.loadingBlogs = false
                state.blogs = action.payload.blogs || action.payload
                state.totalBlogs = action.payload.total || action.payload.length || 0
                state.totalPages = action.payload.totalPages || Math.ceil((action.payload.total || action.payload.length || 0) / 10)
            })
            .addCase(getBlogsRequest.rejected, (state, action) => {
                state.loadingBlogs = false
                state.blogsError = action.payload || 'Error al cargar los blogs'
            })
        
        // Get Blog Detail
        builder
            .addCase(getBlogDetailRequest.pending, (state) => {
                state.loadingBlogDetail = true
                state.blogDetailError = null
            })
            .addCase(getBlogDetailRequest.fulfilled, (state, action) => {
                state.loadingBlogDetail = false
                // Extraer el blog de la respuesta del backend
                console.log('Respuesta completa del backend:', action.payload)
                
                // Manejar diferentes estructuras de respuesta
                if (action.payload && action.payload.blog) {
                    // Estructura: { ok: true, blog: {...} }
                    state.blogDetail = action.payload.blog
                } else if (action.payload && action.payload._id) {
                    // Estructura directa: { _id: ..., title: ..., ... }
                    state.blogDetail = action.payload
                } else {
                    // Fallback
                    state.blogDetail = action.payload
                }
                
                console.log('BlogDetail guardado en Redux:', state.blogDetail)
            })
            .addCase(getBlogDetailRequest.rejected, (state, action) => {
                state.loadingBlogDetail = false
                state.blogDetailError = action.payload || 'Error al cargar el blog'
            })
        
        // Create Blog
        builder
            .addCase(createBlogRequest.pending, (state) => {
                state.loadingCreateBlog = true
                state.createBlogError = null
                state.createBlogSuccess = false
            })
            .addCase(createBlogRequest.fulfilled, (state, action) => {
                state.loadingCreateBlog = false
                state.createBlogSuccess = true
                // Agregar el nuevo blog a la lista
                state.blogs.unshift(action.payload)
                state.totalBlogs += 1
            })
            .addCase(createBlogRequest.rejected, (state, action) => {
                state.loadingCreateBlog = false
                state.createBlogError = action.payload || 'Error al crear el blog'
            })
        
        // Update Blog
        builder
            .addCase(updateBlogRequest.pending, (state) => {
                state.loadingUpdateBlog = true
                state.updateBlogError = null
                state.updateBlogSuccess = false
            })
            .addCase(updateBlogRequest.fulfilled, (state, action) => {
                state.loadingUpdateBlog = false
                state.updateBlogSuccess = true
                // Actualizar el blog en la lista
                const index = state.blogs.findIndex(blog => blog._id === action.payload._id)
                if (index !== -1) {
                    state.blogs[index] = action.payload
                }
                // Actualizar el blog detail si existe
                if (state.blogDetail && state.blogDetail._id === action.payload._id) {
                    state.blogDetail = action.payload
                }
            })
            .addCase(updateBlogRequest.rejected, (state, action) => {
                state.loadingUpdateBlog = false
                state.updateBlogError = action.payload || 'Error al actualizar el blog'
            })
        
        // Delete Blog
        builder
            .addCase(deleteBlogRequest.pending, (state) => {
                state.loadingDeleteBlog = true
                state.deleteBlogError = null
                state.deleteBlogSuccess = false
            })
            .addCase(deleteBlogRequest.fulfilled, (state, action) => {
                state.loadingDeleteBlog = false
                state.deleteBlogSuccess = true
                // Remover el blog de la lista
                state.blogs = state.blogs.filter(blog => blog._id !== action.payload.blogId)
                state.totalBlogs -= 1
                // Limpiar blog detail si era el mismo blog
                if (state.blogDetail && state.blogDetail._id === action.payload.blogId) {
                    state.blogDetail = null
                }
            })
            .addCase(deleteBlogRequest.rejected, (state, action) => {
                state.loadingDeleteBlog = false
                state.deleteBlogError = action.payload || 'Error al eliminar el blog'
            })
    },
})

// Actions
export const {
    clearBlogsError,
    clearBlogDetailError,
    clearCreateBlogError,
    clearUpdateBlogError,
    clearDeleteBlogError,
    clearCreateBlogSuccess,
    clearUpdateBlogSuccess,
    clearDeleteBlogSuccess,
    clearBlogDetail,
    setCurrentPage,
} = blogsSlice.actions

// Selectors
export const selectBlogs = (state) => state.blogs.blogs
export const selectTotalBlogs = (state) => state.blogs.totalBlogs
export const selectCurrentPage = (state) => state.blogs.currentPage
export const selectTotalPages = (state) => state.blogs.totalPages
export const selectLoadingBlogs = (state) => state.blogs.loadingBlogs
export const selectBlogsError = (state) => state.blogs.blogsError

export const selectBlogDetail = (state) => state.blogs.blogDetail
export const selectLoadingBlogDetail = (state) => state.blogs.loadingBlogDetail
export const selectBlogDetailError = (state) => state.blogs.blogDetailError

export const selectLoadingCreateBlog = (state) => state.blogs.loadingCreateBlog
export const selectCreateBlogError = (state) => state.blogs.createBlogError
export const selectCreateBlogSuccess = (state) => state.blogs.createBlogSuccess

export const selectLoadingUpdateBlog = (state) => state.blogs.loadingUpdateBlog
export const selectUpdateBlogError = (state) => state.blogs.updateBlogError
export const selectUpdateBlogSuccess = (state) => state.blogs.updateBlogSuccess

export const selectLoadingDeleteBlog = (state) => state.blogs.loadingDeleteBlog
export const selectDeleteBlogError = (state) => state.blogs.deleteBlogError
export const selectDeleteBlogSuccess = (state) => state.blogs.deleteBlogSuccess

export default blogsSlice.reducer
