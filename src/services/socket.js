import io from 'socket.io-client'
import { store } from '../store'
import { notificationAdded } from '../store/dashboard'

/**
 * Servicio centralizado para manejar la conexión Socket.IO
 * Proporciona una única instancia de socket para toda la aplicación
 */
class SocketService {
    constructor() {
        this.socket = null
        this.isConnected = false
        this.reconnectAttempts = 0
        this.maxReconnectAttempts = 5
    }

    /**
     * Conecta al servidor Socket.IO
     * @param {string} token - Token de autenticación del usuario
     * @returns {Socket} Instancia del socket
     */
    connect(token) {
        // Si ya hay una conexión activa, retornarla
        if (this.socket?.connected) {
            return this.socket
        }

        // Si hay un socket desconectado, desconectarlo primero
        if (this.socket) {
            this.socket.disconnect()
            this.socket = null
        }

        // Obtener URL del servidor desde variables de entorno
        // Si no está definida, intentar derivarla de REACT_APP_API_KEY
        let socketUrl = process.env.REACT_APP_SOCKET_URL
        
        if (!socketUrl) {
            // Intentar derivar la URL del socket desde la URL de la API
            const apiUrl = process.env.REACT_APP_API_KEY
            if (apiUrl) {
                try {
                    const url = new URL(apiUrl)
                    // Convertir http/https a ws/wss
                    const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
                    socketUrl = `${protocol}//${url.host}`
                } catch (error) {
                    console.warn('No se pudo derivar URL de socket desde API URL, usando localhost')
                    socketUrl = 'ws://localhost:5000'
                }
            } else {
                socketUrl = 'ws://localhost:5000'
            }
        }

        console.log('Conectando a Socket.IO:', socketUrl)

        // Crear conexión Socket.IO
        this.socket = io(socketUrl, {
            auth: {
                token: token
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: this.maxReconnectAttempts,
            timeout: 20000,
        })

        this.setupEventHandlers()
        return this.socket
    }

    /**
     * Configura los event handlers del socket
     */
    setupEventHandlers() {
        if (!this.socket) return

        // Evento: Conexión exitosa
        this.socket.on('connect', () => {
            console.log('✅ Socket.IO conectado exitosamente')
            this.isConnected = true
            this.reconnectAttempts = 0
        })

        // Evento: Desconexión
        this.socket.on('disconnect', (reason) => {
            console.log('❌ Socket.IO desconectado:', reason)
            this.isConnected = false
            
            // Si fue desconexión forzada, no intentar reconectar
            if (reason === 'io server disconnect') {
                // El servidor desconectó el socket, necesitas reconectar manualmente
                this.socket.connect()
            }
        })

        // Evento: Nueva notificación recibida
        this.socket.on('notification', (notification) => {
            console.log('🔔 Nueva notificación recibida:', notification)
            store.dispatch(notificationAdded(notification))
            
            // Opcional: Mostrar notificación del navegador (deshabilitado)
            // if ('Notification' in window && Notification.permission === 'granted') {
            //     new Notification('Nueva notificación', {
            //         body: notification.body || 'Tienes una nueva notificación',
            //         icon: '/favicon.png'
            //     })
            // }
        })

        // Evento: Error de conexión
        this.socket.on('connect_error', (error) => {
            console.error('❌ Error de conexión Socket.IO:', error.message)
            this.reconnectAttempts++
            
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('⚠️ Máximo de intentos de reconexión alcanzado')
            }
        })

        // Evento: Reconexión exitosa
        this.socket.on('reconnect', (attemptNumber) => {
            console.log(`✅ Socket.IO reconectado después de ${attemptNumber} intentos`)
            this.isConnected = true
            this.reconnectAttempts = 0
        })

        // Evento: Error de autenticación
        this.socket.on('auth_error', (error) => {
            console.error('❌ Error de autenticación Socket.IO:', error)
            // Desconectar si hay error de autenticación
            this.disconnect()
        })
    }

    /**
     * Emite evento de notificaciones leídas
     * @param {Array} notifications - Array de notificaciones leídas
     */
    emitNotificationRead(notifications) {
        if (this.socket?.connected) {
            this.socket.emit('notification-readed', notifications)
            console.log('📤 Notificaciones marcadas como leídas enviadas al servidor')
        } else {
            console.warn('⚠️ Socket no conectado, no se puede enviar evento de notificaciones leídas')
        }
    }

    /**
     * Emite un evento personalizado
     * @param {string} eventName - Nombre del evento
     * @param {*} data - Datos a enviar
     */
    emit(eventName, data) {
        if (this.socket?.connected) {
            this.socket.emit(eventName, data)
        } else {
            console.warn(`⚠️ Socket no conectado, no se puede emitir evento: ${eventName}`)
        }
    }

    /**
     * Escucha un evento personalizado
     * @param {string} eventName - Nombre del evento
     * @param {Function} callback - Función callback
     */
    on(eventName, callback) {
        if (this.socket) {
            this.socket.on(eventName, callback)
        }
    }

    /**
     * Deja de escuchar un evento
     * @param {string} eventName - Nombre del evento
     * @param {Function} callback - Función callback (opcional)
     */
    off(eventName, callback) {
        if (this.socket) {
            this.socket.off(eventName, callback)
        }
    }

    /**
     * Desconecta el socket
     */
    disconnect() {
        if (this.socket) {
            console.log('🔌 Desconectando Socket.IO...')
            this.socket.disconnect()
            this.socket = null
            this.isConnected = false
            this.reconnectAttempts = 0
        }
    }

    /**
     * Obtiene el estado de conexión
     * @returns {boolean} true si está conectado
     */
    getConnectionStatus() {
        return this.isConnected && this.socket?.connected
    }

    /**
     * Solicita permiso para notificaciones del navegador
     */
    async requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission()
            console.log('Permiso de notificaciones:', permission)
            return permission === 'granted'
        }
        return Notification.permission === 'granted'
    }
}

// Exportar instancia única (Singleton)
export default new SocketService()

