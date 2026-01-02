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

export const resendVerification = createAsyncThunk(
    'auth/resendVerification',
    async (args, { rejectWithValue }) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_KEY}/api/auth/resend-verification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: args.email }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue({ message: error.message || 'Error al reenviar la verificación' });
        }
    }
)

export const verifyToken = createAsyncThunk(
    'auth/verifyToken',
    async (args, { rejectWithValue }) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_KEY}/api/auth/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: args.token }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue({ message: error.message || 'Error al verificar el token' });
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
        },
        updateUserVerification: (state) => {
            if (state.user) {
                state.user.verified = true;
                // Actualizar también en localStorage
                const userData = JSON.parse(localStorage.getItem('PRODUCT-ADMIN-USER') || '{}');
                userData.verified = true;
                localStorage.setItem('PRODUCT-ADMIN-USER', JSON.stringify(userData));
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
            state.user = { token, role, userId: user.id, tenant: tenant, refreshToken, verified: user.verified, email: user.email }
            const parseUser = JSON.stringify({ token, role, userId: user.id, tenant: tenant, refreshToken, verified: user.verified, email: user.email })
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
export const { logout, clearPermissionsError, updateTokens, updateUserVerification } = authSlice.actions;

export default authSlice.reducer
