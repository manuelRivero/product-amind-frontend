import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { history } from './../../index';
import { getTenantFromHostname } from '../../utils/tenant'
// api
const getUSer = () => {
    const user = window.localStorage.getItem('PRODUCT-ADMIN-USER');
    const parsedUser = user ? JSON.parse(user) : null
    console.log("User loaded from localStorage:", parsedUser)
    return parsedUser
}
import { login as loginRequest, getUserPermissions } from 'api/auth'
const initialState = {
    user: getUSer(),
    permissions: null,
    loadingPermissions: false,
    permissionsError: null,
}

export const login = createAsyncThunk(
    'login',
    async (args, { rejectWithValue }) => {
        console.log("Login thunk called with data:", args.data)
        try {
            const response = await loginRequest(args.data)
            console.log("Login API response:", response)
            return response
        } catch (error) {
            console.error("Login API error:", error)
            return rejectWithValue(error.response.data)
        }
    }
)

export const fetchUserPermissions = createAsyncThunk(
    'auth/fetchPermissions',
    async (args, { rejectWithValue }) => {
        try {
            const response = await getUserPermissions(args.userId, args.token, args.tenant)
            return response
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Error al obtener permisos' })
        }
    }
)

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.permissions = null;
            state.permissionsError = null;
            localStorage.removeItem('PRODUCT-ADMIN-USER');
            history.push("/auth/login");
        },
        clearPermissionsError: (state) => {
            state.permissionsError = null;
        },
        updateTokens: (state, action) => {
            if (state.user) {
                state.user.token = action.payload.token;
                if (action.payload.refreshToken) {
                    state.user.refreshToken = action.payload.refreshToken;
                }
            }
        }
    },
    extraReducers: {
        [login.pending]: (state) => {
            state.loadingLogin = true
        },
        [login.fulfilled]: (state, action) => {
            state.loadingLogin = false
            console.log("Login fulfilled - action", action)
            const { token, role, user, refreshToken } = action.payload.data
            const tenant = getTenantFromHostname()
            state.user = { token, role, userId: user.id, tenant: tenant, refreshToken }
            const parseUser = JSON.stringify({ token, role, userId: user.id, tenant: tenant, refreshToken })
            localStorage.setItem('PRODUCT-ADMIN-USER', parseUser)
            console.log("Login fulfilled - User saved:", state.user)
        },
        [login.rejected]: (state) => {
            state.loadingLogin = false
        },
        [fetchUserPermissions.pending]: (state) => {
            state.loadingPermissions = true
            state.permissionsError = null
        },
        [fetchUserPermissions.fulfilled]: (state, action) => {
            state.loadingPermissions = false
            state.permissions = action.payload.data.permissions
        },
        [fetchUserPermissions.rejected]: (state, action) => {
            state.loadingPermissions = false
            state.permissionsError = action.payload?.message || 'Error al obtener permisos'
        },
    },
})
export const { logout, clearPermissionsError, updateTokens } = authSlice.actions;

export default authSlice.reducer
