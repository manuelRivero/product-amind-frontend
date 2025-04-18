import { logout } from '../../store/auth'
import client from '../client'
import { history } from './../../index'
export const setUpInterceptor = (store) => {
    client.interceptors.request.use(
        (config) => {
          console.log('request', config)
            try {
                const userData = JSON.parse(
                    localStorage.getItem('PRODUCT-ADMIN-USER')
                )
                const access = userData?.token
                console.log('access', access)
                if (access) {
                    config.headers['x-token'] = access
                }
            } catch (err) {
                console.warn('Error al obtener el token:', err)
            }

            return config
        },
        (error) => Promise.reject(error)
    )

    client.interceptors.response.use(
        (response) => {
            console.log("interceptor response", response);
            return response
        },
        (error) => {
            console.log('error on interceptor', error)
            if (error.response?.status === 401) {
                store.dispatch(logout())
                history.push('/auth/login')
            }
            return Promise.reject(error)
        }
    )
}
