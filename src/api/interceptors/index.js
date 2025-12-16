import { logout, updateTokens } from '../../store/auth'
import client from '../client'
import { history } from './../../index'

export const setUpInterceptor = (store) => {
    let isRefreshing = false
    let failedQueue = []

    const refreshToken = async () => {
        const user = JSON.parse(localStorage.getItem('PRODUCT-ADMIN-USER'))
        const response = await client.post(`${process.env.REACT_APP_API_KEY}/api/auth/refresh-token`, {
            refreshToken: user.refreshToken
        })
        return response.data
    }
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

    const processQueue = (error, token = null) => {
        failedQueue.forEach(prom => {
            if (error) {
                prom.reject(error)
            } else {
                prom.resolve(token)
            }
        })
        failedQueue = []
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
            return response
        },
        async (error) => {
            const originalRequest = error.config
            
            // Verificar si la petición que falló es la de refresh token
            const isRefreshTokenRequest = originalRequest?.url?.includes('/api/auth/refresh-token')
            
            // Si es la petición de refresh token la que falla, hacer logout directamente
            if (error.response?.status === 401 && isRefreshTokenRequest) {
                console.log('Refresh token vencido, cerrando sesión')
                store.dispatch(logout())
                history.push('/auth/login')
                return Promise.reject(error)
            }
            
            // Manejar diferentes tipos de errores de autenticación
            if (error.response?.status === 401 && !originalRequest._retry) {
                if (isRefreshing) {
                    // Si ya se está refrescando, encolar la petición
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject })
                    })
                        .then(token => {
                            originalRequest.headers['x-token'] = token
                            return client(originalRequest)
                        })
                        .catch(err => {
                            return Promise.reject(err)
                        })
                }

                originalRequest._retry = true
                isRefreshing = true

                try {
                    console.log('Token inválido o expirado, intentando refrescar')
                    const newTokenData = await refreshToken()
                    const newToken = newTokenData.data?.token || newTokenData.token
                    
                    // Actualizar el estado de Redux con los nuevos tokens
                    const user = JSON.parse(localStorage.getItem('PRODUCT-ADMIN-USER'))
                    const updatedUser = {
                        ...user,
                        token: newToken,
                        refreshToken: newTokenData.data?.refreshToken || newTokenData.refreshToken || user.refreshToken
                    }
                    localStorage.setItem('PRODUCT-ADMIN-USER', JSON.stringify(updatedUser))
                    
                    // Actualizar Redux state
                    store.dispatch(updateTokens({
                        token: newToken,
                        refreshToken: updatedUser.refreshToken
                    }))
                    
                    originalRequest.headers['x-token'] = newToken
                    processQueue(null, newToken)
                    isRefreshing = false
                    
                    return client(originalRequest)
                } catch (refreshError) {
                    console.log('Error al refrescar el token', refreshError)
                    processQueue(refreshError, null)
                    isRefreshing = false
                    store.dispatch(logout())
                    history.push('/auth/login')
                    return Promise.reject(refreshError)
                }
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
