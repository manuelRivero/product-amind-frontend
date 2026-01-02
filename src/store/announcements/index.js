import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
    getAnnouncements as getAnnouncementsRequest,
    getUnreadCount as getUnreadCountRequest,
    markAsRead as markAsReadRequest
} from '../../api/announcements'

export const fetchAnnouncements = createAsyncThunk(
    'announcements/fetchAnnouncements',
    async (args, { rejectWithValue }) => {
        try {
            const { page = 0, limit = 10 } = args || {}
            const response = await getAnnouncementsRequest(page, limit)
            return response
        } catch (error) {
            console.log('thunk error', error)
            return rejectWithValue(error.response?.data || { message: 'Error al obtener anuncios' })
        }
    }
)

export const fetchUnreadCount = createAsyncThunk(
    'announcements/fetchUnreadCount',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getUnreadCountRequest()
            return response
        } catch (error) {
            console.log('thunk error', error)
            return rejectWithValue(error.response?.data || { message: 'Error al obtener contador' })
        }
    }
)

export const markAnnouncementAsRead = createAsyncThunk(
    'announcements/markAsRead',
    async (args, { rejectWithValue }) => {
        try {
            const response = await markAsReadRequest(args.id)
            return response
        } catch (error) {
            console.log('thunk error', error)
            return rejectWithValue(error.response?.data || { message: 'Error al marcar como leído' })
        }
    }
)

const initialState = {
    announcements: [],
    unreadCount: 0,
    pagination: null,
    loadingAnnouncements: false,
    loadingUnreadCount: false,
    errorAnnouncements: null,
    currentPage: 0,
    limit: 10,
    currentAnnouncementIndex: 0,
    isModalOpen: false
}

export const announcementSlice = createSlice({
    name: 'announcements',
    initialState,
    reducers: {
        openAnnouncementsModal: (state) => {
            state.isModalOpen = true
            // Si hay anuncios, encontrar el primer no leído o usar el primero
            if (state.announcements.length > 0) {
                const firstUnreadIndex = state.announcements.findIndex(ann => !ann.isRead)
                state.currentAnnouncementIndex = firstUnreadIndex >= 0 ? firstUnreadIndex : 0
            } else {
                state.currentAnnouncementIndex = 0
            }
        },
        closeAnnouncementsModal: (state) => {
            state.isModalOpen = false
            state.currentAnnouncementIndex = 0
        },
        setCurrentAnnouncementIndex: (state, action) => {
            const newIndex = action.payload
            if (newIndex >= 0 && newIndex < state.announcements.length) {
                state.currentAnnouncementIndex = newIndex
            }
        },
        goToNextAnnouncement: (state) => {
            if (state.currentAnnouncementIndex < state.announcements.length - 1) {
                state.currentAnnouncementIndex += 1
            }
        },
        goToPreviousAnnouncement: (state) => {
            if (state.currentAnnouncementIndex > 0) {
                state.currentAnnouncementIndex -= 1
            }
        },
        resetAnnouncementsState: (state) => {
            state.currentAnnouncementIndex = 0
        }
    },
    extraReducers: {
        [fetchAnnouncements.pending]: (state) => {
            state.loadingAnnouncements = true
            state.errorAnnouncements = null
        },
        [fetchAnnouncements.fulfilled]: (state, action) => {
            state.loadingAnnouncements = false
            const data = action.payload.data
            const newAnnouncements = data.announcements || []
            // Si es la primera página (page 0), reemplazar. Si no, agregar
            if (data.pagination && data.pagination.page === 0) {
                state.announcements = newAnnouncements
            } else {
                // Agregar nuevos anuncios sin duplicados
                const existingIds = new Set(state.announcements.map(ann => ann._id))
                const uniqueNewAnnouncements = newAnnouncements.filter(ann => !existingIds.has(ann._id))
                state.announcements = [...state.announcements, ...uniqueNewAnnouncements]
            }
            state.pagination = data.pagination || null
            if (data.pagination) {
                state.currentPage = data.pagination.page
            }
        },
        [fetchAnnouncements.rejected]: (state, action) => {
            state.loadingAnnouncements = false
            state.errorAnnouncements = action.payload?.message || 'Error al cargar anuncios'
        },
        [fetchUnreadCount.pending]: (state) => {
            state.loadingUnreadCount = true
        },
        [fetchUnreadCount.fulfilled]: (state, action) => {
            state.loadingUnreadCount = false
            state.unreadCount = action.payload.data?.unreadCount || 0
        },
        [fetchUnreadCount.rejected]: (state) => {
            state.loadingUnreadCount = false
        },
        [markAnnouncementAsRead.pending]: () => {
            // No cambiar loading state para no bloquear la UI
        },
        [markAnnouncementAsRead.fulfilled]: (state, action) => {
            const announcementId = action.meta.arg.id
            const announcement = state.announcements.find(ann => ann._id === announcementId)
            if (announcement) {
                // Actualizar contador si el anuncio estaba no leído
                const wasUnread = !announcement.isRead
                announcement.isRead = true
                announcement.readAt = new Date().toISOString()
                if (wasUnread) {
                    state.unreadCount = Math.max(0, state.unreadCount - 1)
                }
            }
        },
        [markAnnouncementAsRead.rejected]: () => {
            // Error silencioso, no afecta la UI
        }
    }
})

export const {
    openAnnouncementsModal,
    closeAnnouncementsModal,
    setCurrentAnnouncementIndex,
    goToNextAnnouncement,
    goToPreviousAnnouncement,
    resetAnnouncementsState
} = announcementSlice.actions

export default announcementSlice.reducer

