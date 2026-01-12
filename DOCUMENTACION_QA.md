# 📋 Documentación para QA - Sistema de Administración de Productos

## 📌 Descripción General

Sistema de administración multi-tenant para gestión de productos, órdenes, promociones, cupones, banners, blogs y más. El sistema incluye:

- **Autenticación y autorización** basada en roles y permisos
- **Sistema de suscripciones** con planes (gratuito y de pago)
- **Multi-tenancy** (cada tenant tiene su propio dominio/subdominio)
- **Integración con Mercado Pago** para pagos
- **Dashboard** con estadísticas y reportes
- **Gestión de contenido** (productos, categorías, blogs, banners)
- **Sistema de promociones y cupones**
- **Gestión de órdenes/ventas**
- **Anuncios informativos** (comunicados del sistema)

---

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico
- **Frontend**: React con Material-UI
- **Estado**: Redux Toolkit
- **Routing**: React Router
- **HTTP Client**: Axios con interceptores
- **Autenticación**: Token-based (JWT)

### Estructura de Carpetas Principales
```
src/
├── api/              # Servicios API
├── components/       # Componentes reutilizables
├── layouts/          # Layouts (Admin, Auth)
├── views/            # Vistas/páginas principales
├── store/            # Redux stores
├── hooks/            # Custom hooks
├── utils/            # Utilidades
└── routes.js         # Configuración de rutas
```

---

## 🔐 Sistema de Autenticación y Permisos

### Autenticación
- **Login**: Email y contraseña
- **Token**: JWT almacenado en localStorage (`PRODUCT-ADMIN-USER`)
- **Verificación de email**: Los usuarios deben verificar su email antes de acceder
- **Refresh Token**: Sistema de renovación automática de tokens
- **Interceptor**: Manejo automático de tokens en todas las peticiones HTTP

### Permisos y Roles

El sistema utiliza un modelo de permisos basado en **recursos** y **acciones**:

#### Recursos (Resources)
- `reports` - Reportes y dashboard
- `sales` - Órdenes/ventas
- `products` - Productos
- `categories` - Categorías
- `offers` - Promociones
- `coupons` - Cupones
- `banners` - Banners
- `blogs` - Blogs
- `config` - Configuración

#### Acciones (Actions)
- `read` - Lectura/visualización
- `create` - Creación
- `update` - Actualización
- `delete` - Eliminación

#### Ejemplo de Permiso
```javascript
permission: { resource: 'products', action: 'read' }
```

### Estados de Suscripción

El acceso a funcionalidades depende del estado de la suscripción:

1. **Sin suscripción**: Solo acceso a `/inicio` y `/mercado-pago`
2. **Suscripción activa**: Acceso completo según permisos
3. **Pago pendiente**: Solo acceso a `/mercado-pago`
4. **Pago pausado**: Solo acceso a `/mercado-pago`
5. **Pago cancelado**: Solo acceso a `/mercado-pago`
6. **Plan gratuito**: Acceso completo según permisos

### Verificación de Usuario

- Los usuarios **no verificados** solo pueden acceder a `/inicio`
- Deben verificar su email para acceder al resto del sistema
- Existe funcionalidad para reenviar email de verificación

---

## 📱 Módulos y Funcionalidades

### 1. **Inicio** (`/admin/inicio`)
- **Ruta**: `/admin/inicio`
- **Permisos**: No requiere permisos
- **Descripción**: Página de bienvenida/inicio
- **Restricciones**: Disponible para todos los usuarios autenticados

### 2. **Dashboard** (`/admin/dashboard`)
- **Ruta**: `/admin/dashboard`
- **Permisos**: `{ resource: 'reports', action: 'read' }`
- **Descripción**: Panel principal con estadísticas y métricas
- **Componentes principales**:
  - Estadísticas principales (MainStats)
  - Resumen de órdenes pendientes (PendingOrdersSummary)
  - Órdenes pendientes (PendingOrders)
  - Gráficos principales (MainCharts)
  - Productos más vendidos (BestSellers) - Requiere suscripción
  - Alertas de stock (StockAlerts) - Requiere suscripción
  - Comportamiento de clientes (ClientsBehavior) - Requiere suscripción
- **Restricciones**: Requiere suscripción activa

### 3. **Productos** (`/admin/products`)
- **Ruta principal**: `/admin/products`
- **Rutas hijas**:
  - `/admin/products/add-product` - Agregar producto
  - `/admin/products/edit-product/:id` - Editar producto
  - `/admin/products/product-detail/:id` - Detalle de producto
- **Permisos**: `{ resource: 'products', action: 'read' }`
- **Funcionalidades**:
  - Listado de productos con filtros y paginación
  - Crear nuevo producto
  - Editar producto existente
  - Ver detalle de producto
  - Gestión de imágenes
  - Gestión de stock
- **Restricciones**: Requiere suscripción activa

### 4. **Categorías** (`/admin/categories`)
- **Ruta principal**: `/admin/categories`
- **Rutas hijas**:
  - `/admin/categories/add-category` - Agregar categoría
  - `/admin/categories/edit-category/:name/:id` - Editar categoría
- **Permisos**: `{ resource: 'categories', action: 'read' }`
- **Funcionalidades**:
  - Listado de categorías
  - Crear nueva categoría
  - Editar categoría existente
  - Filtros y búsqueda
- **Restricciones**: Requiere suscripción activa

### 5. **Órdenes/Ventas** (`/admin/orders`)
- **Ruta principal**: `/admin/orders`
- **Rutas hijas**:
  - `/admin/orders/detail/:id` - Detalle de orden
- **Permisos**: `{ resource: 'sales', action: 'read' }`
- **Funcionalidades**:
  - Listado de órdenes/ventas
  - Ver detalle de orden
  - Cambiar estado de orden
  - Filtros por estado, fecha, etc.
  - Gestión de estados de entrega
- **Restricciones**: Requiere suscripción activa

### 6. **Promociones** (`/admin/offers`)
- **Ruta principal**: `/admin/offers`
- **Rutas hijas**:
  - `/admin/offers/add-offers` - Crear promoción
  - `/admin/offers/add-offers/:id` - Editar promoción
- **Permisos**: `{ resource: 'offers', action: 'read' }`
- **Funcionalidades**:
  - Listado de promociones
  - Crear nueva promoción
  - Editar promoción existente
  - Configurar fechas de vigencia
  - Descuentos y condiciones
- **Restricciones**: Requiere suscripción activa
- **Nota**: En la interfaz se muestra como "Promociones" (no "Ofertas")

### 7. **Cupones** (`/admin/coupons`)
- **Ruta principal**: `/admin/coupons`
- **Rutas hijas**:
  - `/admin/coupons/add-coupon` - Crear cupón
  - `/admin/coupons/add-coupon/:id` - Editar cupón
- **Permisos**: `{ resource: 'coupons', action: 'read' }`
- **Funcionalidades**:
  - Listado de cupones
  - Crear nuevo cupón
  - Editar cupón existente
  - Códigos de descuento
  - Configuración de uso y límites
- **Restricciones**: Requiere suscripción activa

### 8. **Banners** (`/admin/banners`)
- **Ruta principal**: `/admin/banners`
- **Rutas hijas**:
  - `/admin/banners/add-banner` - Agregar banner
  - `/admin/banners/admin-banners` - Administrar banners
- **Permisos**: `{ resource: 'banners', action: 'read' }`
- **Funcionalidades**:
  - Listado de banners
  - Crear nuevo banner
  - Administrar banners existentes
  - Gestión de imágenes
  - Configuración de posiciones y visibilidad
- **Restricciones**: Requiere suscripción activa

### 9. **Blogs** (`/admin/blogs`)
- **Ruta principal**: `/admin/blogs`
- **Rutas hijas**:
  - `/admin/blogs/add-blog` - Crear blog
  - `/admin/blogs/edit-blog/:id` - Editar blog
  - `/admin/blogs/view-blog/:id` - Ver blog
- **Permisos**: `{ resource: 'blogs', action: 'read' }`
- **Funcionalidades**:
  - Listado de blogs/artículos
  - Crear nuevo blog
  - Editar blog existente
  - Ver blog (vista previa)
  - Editor de contenido
- **Restricciones**: Requiere suscripción activa

### 10. **Configuración** (`/admin/config`)
- **Ruta**: `/admin/config`
- **Permisos**: `{ resource: 'config', action: 'read' }`
- **Funcionalidades**:
  - Configuración general del tenant
  - Configuración de la tienda
  - Ajustes de suscripción
  - Configuración de integraciones
- **Restricciones**: Requiere suscripción activa

### 11. **Cuenta/Mercado Pago** (`/admin/mercado-pago`)
- **Ruta**: `/admin/mercado-pago`
- **Permisos**: No requiere permisos
- **Funcionalidades**:
  - Conexión con Mercado Pago Marketplace
  - Selección de plan de suscripción
  - Gestión de suscripción:
    - Ver detalles de suscripción
    - Pausar suscripción
    - Cancelar suscripción
    - Reanudar suscripción
  - Estados de pago:
    - `pending` - Pago pendiente
    - `authorized` - Pago autorizado
    - `approved` - Pago aprobado
    - `paused` - Suscripción pausada
    - `cancelled` - Suscripción cancelada
- **Restricciones**: Disponible para todos los usuarios autenticados

### 12. **Anuncios Informativos** (Modal Global)
- **Tipo**: Modal global accesible desde cualquier ruta
- **Permisos**: No requiere permisos específicos (disponible para todos los usuarios autenticados)
- **Funcionalidades**:
  - Visualización de anuncios/comunicados del sistema
  - Navegación entre anuncios (anterior/siguiente)
  - Indicador de posición ("Anuncio X de Y")
  - Marcado automático como leído
  - Contador de no leídos
  - Tipos de anuncios: `info`, `warning`, `success`, `error`, `update`
  - Prioridades: `urgent`, `high`, `medium`, `low`
  - Archivos adjuntos descargables
- **Comportamiento**:
  - Carga automática al iniciar la aplicación
  - Modal se puede abrir programáticamente
  - Muestra el primer anuncio no leído al abrir
- **Endpoints**:
  - `GET /api/announcements/tenant/list` - Lista de anuncios (paginada)
  - `GET /api/announcements/tenant/unread-count` - Contador de no leídos
  - `POST /api/announcements/tenant/:id/read` - Marcar como leído

---

## 🔄 Flujos Principales de Usuario

### Flujo 1: Registro y Primer Acceso
1. Usuario se registra (si aplica) o recibe credenciales
2. Usuario hace login en `/auth/login`
3. Si el email no está verificado:
   - Solo puede acceder a `/admin/inicio`
   - Puede solicitar reenvío de email de verificación
4. Usuario verifica email
5. Si no tiene suscripción activa:
   - Es redirigido a `/admin/mercado-pago`
   - Debe conectar Mercado Pago y seleccionar plan
6. Una vez con suscripción activa, puede acceder a los módulos según sus permisos

### Flujo 2: Gestión de Productos
1. Usuario accede a `/admin/products`
2. Ve listado de productos con filtros
3. Puede:
   - Crear nuevo producto (`/admin/products/add-product`)
   - Editar producto existente (`/admin/products/edit-product/:id`)
   - Ver detalle (`/admin/products/product-detail/:id`)
4. Validaciones:
   - Campos requeridos
   - Validación de imágenes
   - Validación de stock
   - Validación de precios

### Flujo 3: Gestión de Órdenes
1. Usuario accede a `/admin/orders`
2. Ve listado de órdenes con filtros
3. Puede ver detalle de orden (`/admin/orders/detail/:id`)
4. Puede cambiar estado de orden
5. Validaciones:
   - Estados válidos
   - Permisos para cambiar estado

### Flujo 4: Gestión de Suscripción
1. Usuario accede a `/admin/mercado-pago`
2. Según estado actual:
   - **Sin conexión**: Debe conectar Mercado Pago Marketplace
   - **Sin plan**: Debe seleccionar un plan
   - **Pago pendiente**: Ve estado de pago pendiente
   - **Suscripción activa**: Ve detalles y opciones de gestión
3. Puede:
   - Pausar suscripción
   - Cancelar suscripción
   - Reanudar suscripción (si está pausada)

### Flujo 5: Visualización de Anuncios
1. Al cargar la aplicación, se cargan automáticamente los anuncios
2. Si hay anuncios no leídos, el modal puede abrirse automáticamente (opcional)
3. Usuario navega entre anuncios con botones anterior/siguiente
4. Al mostrar un anuncio, se marca automáticamente como leído
5. Usuario puede cerrar el modal en cualquier momento

---

## 🧪 Casos de Prueba Sugeridos

### Autenticación y Autorización

#### TC-AUTH-001: Login Exitoso
- **Precondiciones**: Usuario registrado con credenciales válidas
- **Pasos**:
  1. Ir a `/auth/login`
  2. Ingresar email y contraseña válidos
  3. Hacer clic en "Iniciar sesión"
- **Resultado esperado**: 
  - Usuario es autenticado
  - Token se guarda en localStorage
  - Redirección según estado de verificación y suscripción

#### TC-AUTH-002: Login con Credenciales Inválidas
- **Precondiciones**: Ninguna
- **Pasos**:
  1. Ir a `/auth/login`
  2. Ingresar email o contraseña incorrectos
  3. Hacer clic en "Iniciar sesión"
- **Resultado esperado**: 
  - Mensaje de error mostrado
  - No se guarda token
  - Usuario permanece en página de login

#### TC-AUTH-003: Acceso sin Verificación de Email
- **Precondiciones**: Usuario logueado pero email no verificado
- **Pasos**:
  1. Intentar acceder a cualquier ruta excepto `/admin/inicio`
- **Resultado esperado**: 
  - Solo puede acceder a `/admin/inicio`
  - Otras rutas no son accesibles o redirigen

#### TC-AUTH-004: Acceso sin Suscripción Activa
- **Precondiciones**: Usuario verificado pero sin suscripción activa
- **Pasos**:
  1. Intentar acceder a módulos que requieren suscripción
- **Resultado esperado**: 
  - Redirección a `/admin/mercado-pago`
  - Solo puede acceder a `/admin/inicio` y `/admin/mercado-pago`

#### TC-AUTH-005: Verificación de Permisos por Recurso
- **Precondiciones**: Usuario con permisos limitados
- **Pasos**:
  1. Intentar acceder a módulos sin permiso de lectura
  2. Intentar crear/editar sin permiso correspondiente
- **Resultado esperado**: 
  - Rutas sin permiso no aparecen en menú o muestran error
  - Botones de acción deshabilitados o ocultos según permisos

### Gestión de Productos

#### TC-PROD-001: Crear Producto Exitoso
- **Precondiciones**: Usuario con permiso `products:create`, suscripción activa
- **Pasos**:
  1. Ir a `/admin/products`
  2. Hacer clic en "Agregar Producto"
  3. Completar formulario con datos válidos
  4. Subir imágenes
  5. Guardar
- **Resultado esperado**: 
  - Producto creado exitosamente
  - Redirección a listado o detalle
  - Producto visible en listado

#### TC-PROD-002: Validación de Campos Requeridos
- **Precondiciones**: Usuario en formulario de crear producto
- **Pasos**:
  1. Intentar guardar sin completar campos requeridos
- **Resultado esperado**: 
  - Mensajes de validación mostrados
  - Formulario no se envía

#### TC-PROD-003: Editar Producto
- **Precondiciones**: Producto existente, permiso `products:update`
- **Pasos**:
  1. Ir a listado de productos
  2. Seleccionar producto para editar
  3. Modificar campos
  4. Guardar cambios
- **Resultado esperado**: 
  - Cambios guardados correctamente
  - Datos actualizados en listado

### Gestión de Órdenes

#### TC-ORD-001: Ver Listado de Órdenes
- **Precondiciones**: Usuario con permiso `sales:read`, suscripción activa
- **Pasos**:
  1. Ir a `/admin/orders`
- **Resultado esperado**: 
  - Listado de órdenes mostrado
  - Filtros y paginación funcionando

#### TC-ORD-002: Ver Detalle de Orden
- **Precondiciones**: Orden existente
- **Pasos**:
  1. Ir a listado de órdenes
  2. Hacer clic en una orden
- **Resultado esperado**: 
  - Detalle completo de la orden mostrado
  - Información de cliente, productos, totales, etc.

#### TC-ORD-003: Cambiar Estado de Orden
- **Precondiciones**: Orden existente, permiso para cambiar estado
- **Pasos**:
  1. Ir a detalle de orden
  2. Cambiar estado
  3. Confirmar cambio
- **Resultado esperado**: 
  - Estado actualizado
  - Cambio reflejado en listado

### Gestión de Suscripción

#### TC-SUB-001: Conectar Mercado Pago
- **Precondiciones**: Usuario sin conexión a Mercado Pago
- **Pasos**:
  1. Ir a `/admin/mercado-pago`
  2. Conectar cuenta de Mercado Pago
- **Resultado esperado**: 
  - Conexión exitosa
  - Opción de seleccionar plan disponible

#### TC-SUB-002: Seleccionar Plan
- **Precondiciones**: Mercado Pago conectado
- **Pasos**:
  1. Seleccionar un plan
  2. Confirmar selección
- **Resultado esperado**: 
  - Plan seleccionado
  - Proceso de pago iniciado o suscripción activada

#### TC-SUB-003: Pausar Suscripción
- **Precondiciones**: Suscripción activa
- **Pasos**:
  1. Ir a `/admin/mercado-pago`
  2. Pausar suscripción
  3. Confirmar
- **Resultado esperado**: 
  - Suscripción pausada
  - Acceso restringido a módulos
  - Redirección a `/admin/mercado-pago`

### Anuncios Informativos

#### TC-ANN-001: Carga Automática de Anuncios
- **Precondiciones**: Usuario autenticado, anuncios disponibles
- **Pasos**:
  1. Cargar aplicación
- **Resultado esperado**: 
  - Anuncios cargados automáticamente
  - Contador de no leídos actualizado

#### TC-ANN-002: Navegación entre Anuncios
- **Precondiciones**: Modal abierto con múltiples anuncios
- **Pasos**:
  1. Abrir modal de anuncios
  2. Navegar al siguiente anuncio
  3. Navegar al anterior
- **Resultado esperado**: 
  - Navegación funciona correctamente
  - Indicador de posición actualizado
  - Botones deshabilitados cuando corresponde

#### TC-ANN-003: Marcado Automático como Leído
- **Precondiciones**: Anuncio no leído
- **Pasos**:
  1. Abrir modal de anuncios
  2. Mostrar un anuncio no leído
- **Resultado esperado**: 
  - Anuncio marcado automáticamente como leído
  - Contador de no leídos disminuye

### Validaciones y Errores

#### TC-ERR-001: Manejo de Error 401 (No Autorizado)
- **Precondiciones**: Token expirado o inválido
- **Pasos**:
  1. Realizar acción que requiere autenticación
- **Resultado esperado**: 
  - Redirección a login
  - Token eliminado
  - Mensaje apropiado mostrado

#### TC-ERR-002: Manejo de Error 403 (Sin Permisos)
- **Precondiciones**: Usuario sin permiso para acción
- **Pasos**:
  1. Intentar acceder a recurso sin permiso
- **Resultado esperado**: 
  - Acceso denegado
  - Mensaje de error apropiado

#### TC-ERR-003: Manejo de Error de Red
- **Precondiciones**: Sin conexión a internet
- **Pasos**:
  1. Intentar realizar acción que requiere API
- **Resultado esperado**: 
  - Mensaje de error de conexión
  - Opción de reintentar

---

## 🔍 Matriz de Permisos

| Módulo | Recurso | Acción Read | Acción Create | Acción Update | Acción Delete |
|--------|---------|-------------|---------------|---------------|---------------|
| Dashboard | `reports` | ✅ | ❌ | ❌ | ❌ |
| Productos | `products` | ✅ | ✅ | ✅ | ✅ |
| Categorías | `categories` | ✅ | ✅ | ✅ | ✅ |
| Órdenes | `sales` | ✅ | ❌ | ✅* | ❌ |
| Promociones | `offers` | ✅ | ✅ | ✅ | ✅ |
| Cupones | `coupons` | ✅ | ✅ | ✅ | ✅ |
| Banners | `banners` | ✅ | ✅ | ✅ | ✅ |
| Blogs | `blogs` | ✅ | ✅ | ✅ | ✅ |
| Configuración | `config` | ✅ | ❌ | ✅ | ❌ |
| Anuncios | N/A | ✅** | ❌ | ❌ | ❌ |

*Solo para cambiar estado de orden
**Disponible para todos los usuarios autenticados, no requiere permiso específico

---

## ⚠️ Validaciones y Restricciones Importantes

### Validaciones de Suscripción
- **Sin suscripción activa**: Solo acceso a `/inicio` y `/mercado-pago`
- **Pago pendiente**: Solo acceso a `/mercado-pago`
- **Pago pausado**: Solo acceso a `/mercado-pago`
- **Pago cancelado**: Solo acceso a `/mercado-pago`
- **Plan gratuito**: Acceso completo según permisos

### Validaciones de Verificación
- **Email no verificado**: Solo acceso a `/inicio`
- **Email verificado**: Acceso según suscripción y permisos

### Validaciones de Permisos
- Las rutas se filtran según permisos del usuario
- Los botones de acción se ocultan/deshabilitan según permisos
- Las peticiones API validan permisos en el backend

### Validaciones de Tenant
- El sistema es multi-tenant
- Cada tenant tiene su propio dominio/subdominio
- Si no hay tenant válido, se muestra pantalla de error

---

## 🔌 Endpoints de API Principales

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/verify` - Verificar token
- `POST /api/auth/resend-verification` - Reenviar verificación
- `GET /api/auth/permissions/:userId` - Obtener permisos

### Productos
- `GET /api/products/...` - Listar productos
- `POST /api/products/...` - Crear producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto

### Categorías
- `GET /api/categories/get-categories` - Listar categorías
- `POST /api/categories/...` - Crear categoría
- `PUT /api/categories/:id` - Actualizar categoría

### Órdenes/Ventas
- `GET /api/sales/...` - Listar órdenes
- `GET /api/sales/:id` - Obtener detalle de orden
- `PUT /api/sales/:id/status` - Cambiar estado de orden

### Promociones
- `GET /api/offers/...` - Listar promociones
- `POST /api/offers/...` - Crear promoción
- `PUT /api/offers/:id` - Actualizar promoción

### Cupones
- `GET /api/coupons/...` - Listar cupones
- `POST /api/coupons/...` - Crear cupón
- `PUT /api/coupons/:id` - Actualizar cupón

### Banners
- `GET /api/banners/...` - Listar banners
- `POST /api/banners/...` - Crear banner
- `PUT /api/banners/:id` - Actualizar banner

### Blogs
- `GET /api/blogs/...` - Listar blogs
- `POST /api/blogs/...` - Crear blog
- `PUT /api/blogs/:id` - Actualizar blog

### Dashboard
- `GET /api/dashboard/stats` - Estadísticas
- `GET /api/dashboard/notifications` - Notificaciones
- `GET /api/dashboard/monthly-sales` - Ventas mensuales
- `GET /api/dashboard/top-products` - Productos más vendidos

### Configuración
- `GET /api/config/...` - Obtener configuración
- `PUT /api/config/...` - Actualizar configuración

### Anuncios
- `GET /api/announcements/tenant/list` - Lista de anuncios (paginada)
- `GET /api/announcements/tenant/unread-count` - Contador de no leídos
- `POST /api/announcements/tenant/:id/read` - Marcar como leído

### Suscripciones y Planes
- `GET /api/plans/get-plans` - Obtener planes disponibles
- `GET /api/subscriptions/...` - Obtener suscripción actual
- `POST /api/mercado-pago/...` - Operaciones con Mercado Pago

**Nota**: Todos los endpoints requieren autenticación mediante token en el header `x-token` (manejado automáticamente por el interceptor).

---

## 🐛 Manejo de Errores

### Códigos de Error Comunes

#### 401 - No Autorizado
- **Causa**: Token inválido o expirado
- **Comportamiento**: Redirección automática a login
- **Acción**: El interceptor maneja esto automáticamente

#### 403 - Prohibido
- **Causa**: Usuario sin permisos para la acción
- **Comportamiento**: Mensaje de error, acceso denegado
- **Acción**: Mostrar mensaje apropiado

#### 400 - Solicitud Incorrecta
- **Causa**: Datos inválidos o faltantes
- **Comportamiento**: Mensaje de error con detalles
- **Acción**: Mostrar errores de validación

#### 404 - No Encontrado
- **Causa**: Recurso no existe
- **Comportamiento**: Mensaje de error
- **Acción**: Redirigir a listado o mostrar mensaje

#### 500 - Error del Servidor
- **Causa**: Error interno del servidor
- **Comportamiento**: Mensaje genérico de error
- **Acción**: Ofrecer opción de reintentar

#### Error de Red
- **Causa**: Sin conexión o timeout
- **Comportamiento**: Mensaje de error de conexión
- **Acción**: No hacer logout, permitir reintentar

---

## 📊 Estados y Flujos de Estado

### Estados de Suscripción
```
Sin conexión MP → Conectado MP → Plan seleccionado → Pago pendiente → Pago aprobado → Suscripción activa
                                                                     ↓
                                                              Pago pausado
                                                                     ↓
                                                              Pago cancelado
```

### Estados de Orden
- Estados específicos definidos en el backend
- Transiciones válidas según reglas de negocio
- Validación de permisos para cambiar estado

### Estados de Anuncio
- `isRead: false` - No leído
- `isRead: true` - Leído
- `readAt: null | Date` - Fecha de lectura

---

## 🎯 Áreas Críticas para Testing

### 1. **Autenticación y Seguridad**
- Expiración de tokens
- Renovación automática de tokens
- Protección de rutas
- Validación de permisos
- Manejo de sesiones

### 2. **Multi-tenancy**
- Aislamiento de datos entre tenants
- Validación de tenant en cada petición
- Manejo de errores de tenant

### 3. **Suscripciones**
- Transiciones de estado
- Restricciones de acceso según estado
- Integración con Mercado Pago
- Manejo de pagos fallidos

### 4. **Permisos**
- Verificación en frontend y backend
- Ocultación de elementos según permisos
- Validación de acciones según permisos

### 5. **Validaciones de Formularios**
- Campos requeridos
- Formatos de datos (email, números, fechas)
- Límites de caracteres
- Validación de archivos (imágenes)

### 6. **Paginación y Filtros**
- Funcionamiento correcto de paginación
- Filtros combinados
- Búsqueda
- Ordenamiento

### 7. **Estados de Carga**
- Loading states
- Manejo de errores durante carga
- Timeouts

### 8. **Responsive Design**
- Funcionamiento en diferentes tamaños de pantalla
- Navegación móvil
- Formularios en móvil

---

## 📝 Notas Adicionales para QA

### Datos de Prueba
- Crear usuarios de prueba con diferentes roles y permisos
- Crear productos, categorías, órdenes de prueba
- Configurar diferentes estados de suscripción para pruebas

### Entornos
- Verificar en qué entorno se está probando (desarrollo, staging, producción)
- Confirmar URLs de API correctas
- Verificar configuración de Mercado Pago (sandbox vs producción)

### Herramientas Útiles
- **DevTools del navegador**: Para inspeccionar peticiones HTTP
- **Redux DevTools**: Para inspeccionar estado de la aplicación
- **Network tab**: Para ver peticiones y respuestas de API

### Checklist de Testing por Módulo
Para cada módulo, verificar:
- [ ] Listado funciona correctamente
- [ ] Filtros y búsqueda funcionan
- [ ] Paginación funciona
- [ ] Crear nuevo registro funciona
- [ ] Editar registro funciona
- [ ] Eliminar registro funciona (si aplica)
- [ ] Validaciones de formulario funcionan
- [ ] Permisos se respetan
- [ ] Manejo de errores funciona
- [ ] Estados de carga se muestran correctamente
- [ ] Responsive funciona

---

## 📞 Contacto y Soporte

Para dudas sobre funcionalidades específicas o comportamientos esperados, consultar:
- Documentación técnica del código
- Planes de implementación (ej: `PLAN_ANUNCIOS_INFORMATIVOS.md`)
- Equipo de desarrollo

---

**Última actualización**: Generado automáticamente basado en análisis del código fuente.



