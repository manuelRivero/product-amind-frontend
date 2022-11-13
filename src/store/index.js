import { configureStore } from '@reduxjs/toolkit'
import { setUpInterceptor } from 'api/interceptors'
import auth from "./auth"
import dashboard from "./dashboard"
export const store = configureStore({
  reducer: {
    auth,
    dashboard,
  },
})

setUpInterceptor(store)