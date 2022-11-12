import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { history } from './../../index';
// api
const getUSer = () =>{
    const user = window.localStorage.getItem('PRODUCT-ADMIN-USER');
    return user ? JSON.parse(user) : null
}
import { login as loginRequest } from 'api/auth'
const initialState = {
    user: getUSer(),
}

export const login = createAsyncThunk(
    'login',
    async (args, { rejectWithValue }) => {
        try {
            const response = await loginRequest(args.data)
            return response
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const authSlice = createSlice({
    name:"auth",
    initialState,
    reducers: {
        logout: (state)=>{
            state.user= null;
            localStorage.removeItem('PRODUCT-ADMIN-USER');
            history.push("/auth/login");
        }
    },
    extraReducers: {
        [login.pending]: (state) => {
            state.loadingLogin = true
        },
        [login.fulfilled]: (state, action) => {
            state.loadingLogin = false
            const {token, role} = action.payload.data
            state.user = {token, role}
            const parseUser = JSON.stringify({token, role})
            localStorage.setItem('PRODUCT-ADMIN-USER', parseUser)
        },
        [login.rejected]: (state) => {
            state.loadingLogin = false
        },
    },
})
export const { logout } = authSlice.actions;

export default authSlice.reducer
