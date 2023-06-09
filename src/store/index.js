import { configureStore } from '@reduxjs/toolkit'
import { setUpInterceptor } from 'api/interceptors'
import auth from "./auth"
import dashboard from "./dashboard"
import products from "./products"
import sales from "./sales"

export const store = configureStore({
  reducer: {
    auth,
    dashboard,
    products,
    sales
  },
})

setUpInterceptor(store)