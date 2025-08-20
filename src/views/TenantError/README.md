# TenantError Component

Este componente se muestra cuando no se puede detectar un tenant válido en la URL.

## Funcionalidad

- **Detección automática**: Se activa cuando se accede a URLs sin subdominio válido
- **Pantalla de error amigable**: Explica al usuario cómo acceder correctamente
- **Ejemplo visual**: Muestra el formato correcto de URL

## Casos de uso

### 1. Desarrollo local
- `localhost:3000` → Muestra pantalla de error
- `127.0.0.1:3000` → Muestra pantalla de error

### 2. URLs sin subdominio
- `tiendapro.com.ar` → Muestra pantalla de error
- `admin.tiendapro.com.ar` → Muestra pantalla de error

### 3. URLs válidas
- `miempresa.admin.tiendapro.com.ar` → Funciona normalmente
- `tienda.admin.tiendapro.com.ar` → Funciona normalmente

## Implementación

El componente se integra en el router principal (`src/router/index.js`) y se muestra automáticamente cuando:

```javascript
const validTenant = hasValidTenant()

if (!validTenant) {
    return <TenantError />
}
```

## Estructura de URL esperada

```
https://[tenant].admin.tiendapro.com.ar
```

Donde `[tenant]` es el identificador único de la tienda.

## Personalización

El componente puede ser personalizado modificando:
- Colores y estilos en `useStyles`
- Mensajes de texto
- Ejemplos de URL
- Iconos y elementos visuales
