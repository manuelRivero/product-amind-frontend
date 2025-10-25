import { configureStore } from '@reduxjs/toolkit'
import { setUpInterceptor } from 'api/interceptors'
import auth from './auth'
import dashboard from './dashboard'
import products from './products'
import sales from './sales'
import categories from './categories'
import config from './config'
import offers from './offers'
import blogs from './blogs'
import coupons from './coupons'

export const store = configureStore({
    reducer: {
        auth,
        dashboard,
        products,
        sales,
        categories,
        config,
        offers,
        blogs,
        coupons
    },
})

setUpInterceptor(store)
