# TinyMCEEditor Component

Este componente proporciona un editor de texto enriquecido usando TinyMCE para descripciones de productos.

## Configuración

### 1. Obtener API Key gratuita

1. Ve a [https://www.tiny.cloud/](https://www.tiny.cloud/)
2. Regístrate para obtener una cuenta gratuita
3. Obtén tu API key gratuita
4. Reemplaza `'your-api-key-here'` en el componente con tu API key real

### 2. Uso del componente

```jsx
import TinyMCEEditor from 'components/TinyMCEEditor'

<TinyMCEEditor
    value={description}
    onChange={setDescription}
    label="Descripción del producto"
    error={hasError}
    errorMessage="Este campo es obligatorio"
    placeholder="Describe tu producto..."
    height={300}
/>
```

## Props

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `value` | string | No | Contenido actual del editor |
| `onChange` | function | Sí | Función que se ejecuta cuando cambia el contenido |
| `label` | string | No | Etiqueta del campo |
| `error` | boolean | No | Indica si hay un error |
| `errorMessage` | string | No | Mensaje de error a mostrar |
| `height` | number | No | Altura del editor en píxeles (default: 300) |
| `placeholder` | string | No | Texto de placeholder |
| `apiKey` | string | No | API key de TinyMCE |

## Características

- ✅ Editor de texto enriquecido
- ✅ Formato de texto (negrita, cursiva, etc.)
- ✅ Listas (numeradas y con viñetas)
- ✅ Alineación de texto
- ✅ Colores de texto
- ✅ Interfaz en español
- ✅ Validación de errores
- ✅ Placeholder personalizable
- ✅ Altura configurable

## Notas importantes

- La API key gratuita tiene límites de uso pero es suficiente para desarrollo y proyectos pequeños
- El contenido se guarda como HTML
- La validación verifica que haya contenido real (no solo etiquetas HTML vacías)
