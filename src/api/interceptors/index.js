import { logout } from '../../store/auth'
import client from '../client'
import { history } from './../../index'

export const setUpInterceptor = (store) => {
    // Función para obtener el token de forma consistente
    const getToken = () => {
        try {
            // Primero intentar obtener del estado de Redux
            const state = store.getState()
            const userToken = state.auth.user?.token
            
            if (userToken) {
                return userToken
            }
            
            // Fallback a localStorage si no está en Redux
            const userData = JSON.parse(
                localStorage.getItem('PRODUCT-ADMIN-USER')
            )
            return userData?.token
        } catch (err) {
            console.warn('Error al obtener el token:', err)
            return null
        }
    }

    client.interceptors.request.use(
        (config) => {
            console.log('request', config)
            
            const access = getToken()
            console.log('access', access)
            
            if (access) {
                config.headers['x-token'] = access
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
            
            // Manejar diferentes tipos de errores de autenticación
            if (error.response?.status === 401 || error.response?.status === 403) {
                console.log('Token inválido o expirado, cerrando sesión')
                store.dispatch(logout())
                history.push('/auth/login')
            }
            
            // Manejar errores de red
            if (!error.response) {
                console.log('Error de red detectado')
                // No hacer logout por errores de red, solo log
            }
            
            return Promise.reject(error)
        }
    )
}
