import React, { useCallback, useEffect, useState, useMemo } from 'react'

import { makeStyles } from '@material-ui/core/styles'
import { useDropzone } from 'react-dropzone'
import uploadImage from 'assets/img/upload-cloud.png'
import {
    Box,
    Checkbox,
    Chip,
    Divider,
    IconButton,
    MenuItem,
    Switch,
    TextField,
    Typography,
} from '@material-ui/core'
import TextInput from 'components/TextInput/Index'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Button from 'components/CustomButtons/Button'
import TextDanger from 'components/Typography/Danger'

import { useParams, useHistory } from 'react-router-dom'

import { primaryColor } from 'assets/jss/material-dashboard-react.js'
import { useDispatch, useSelector } from 'react-redux'
import {
    postProducts,
    getProductDetail,
    editProduct,
    searchColors,
    createColor,
    searchSizes,
    createSize,
} from 'store/products'
import CustomModal from 'components/CustomModal'
import LoadinScreen from 'components/LoadingScreen'
import AutocompleteWithCreate from 'components/AutocompleteWithCreate'
import { Delete, DeleteForever, Crop, Add } from '@material-ui/icons'
import { NumericFormat } from 'react-number-format'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import { getCategories } from 'store/categories'
import Card from 'components/Card/Card.js'
import CardHeader from 'components/Card/CardHeader.js'
import CardBody from 'components/Card/CardBody.js'
import CropModal from 'components/CropModal'
import TinyMCEEditor from 'components/TinyMCEEditor'
import { getCurrentTenant } from 'utils/tenant'

// schema
const featureSchema = yup.object({
    color: yup
        .string()
        .defined()
        .required('Campo obligatorio'), // Ahora es un _id, no solo letras
    size: yup
        .string()
        .nullable()
        .when('hasSize', {
            is: true,
            then: yup
                .string()
                .required('La talla es obligatoria')
                .min(1, 'La talla no puede estar vacía'),
            otherwise: yup.string().nullable(),
        }),
    stock: yup
        .number()
        .required('El stock es obligatorio')
        .min(0, 'El stock no puede ser negativo')
        .integer('El stock debe ser un número entero'),
    hasSize: yup.boolean().nullable(),
})
const schema = yup.object({
    featuresArray: yup.array().of(featureSchema),
    images: yup
        .array()
        .min(1, 'Campo obligatorio')
        .max(5, 'Máximo 5 imágenes')
        .required('Campo obligatorio'),
    name: yup.string().required('Campo obligatorio'),
    category: yup.string().required('Campo obligatorio'),
    price: yup.string().required('Campo obligatorio'),
    stock: yup
        .string()
        .nullable()
        .when('hasFeatures', {
            is: false,
            then: yup.string().required('Campo obligatorio'),
            otherwise: yup.string().nullable(), // No es obligatorio si hasFeatures es true
        }),
    description: yup.string()
        .required('Campo obligatorio')
        .test('not-empty-html', 'La descripción no puede estar vacía', (value) => {
            if (!value) return false
            // Remover etiquetas HTML y espacios para verificar si hay contenido real
            const textContent = value.replace(/<[^>]*>/g, '').trim()
            return textContent.length > 0
        }),
    keywords: yup.array().min(1, 'Debe agregar al menos una palabra clave').required('Campo obligatorio'),
    status: yup
        .string()
        .oneOf(['1', '0'], 'Campo obligatorio')
        .required('Campo obligatorio'),
    unique: yup.boolean().required('Campo obligatorio'),
    cost: yup.string().nullable(),
    discount: yup.string().nullable(),
})

const useStyles = makeStyles({
    uploadImage: {
        maxWidth: '50px',
    },
    dropZone: {
        borderRadius: '16px',
        display: 'flex',
        justifyContent: 'center',
        padding: '1rem',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '220px',
        boxSizing: 'border-box',
        background: '#fff',
    },
    imagesRow: {
        display: 'flex',
        gap: '1.5rem',
        flexWrap: 'wrap',
    },
    inputRow: {
        margin: '1rem 0',
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
    },
    descriptionRow: {
        margin: '1rem 0',
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
        '& > *': {
            width: '100%',
        },
        '& .MuiFormControl-root': {
            width: '100%',
        },
    },

    buttonsRow: {
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        marginTop: '1rem',
    },
    checked: {
        color: primaryColor[0] + '!important',
    },
    errorText: {
        marginBottom: 0,
        marginTop: '5px',
    },
    imagesWrapper: {
        position: 'relative',
        maxWidth: '220px',
        height: '220px',
        width: '100%',
        background: '#fff',
    },
    productImage: {
        borderRadius: '16px',
        width: '100%',
        height: '100%',
        objectFit: 'contain',
    },
    trashICon: {
        position: 'absolute',
        top: '5px',
        right: '5px',
        '& img': {
            width: '24px',
        },
    },
    input: {
        width: '100%',
        '& .MuiInputBase-input': {
            background: '#fff !important',
        },
    },
    card: {
        marginBottom: '20px',
    },
    cardTitleWhite: {
        color: '#FFFFFF',
        marginTop: '0px',
        minHeight: 'auto',
        fontWeight: '300',
        fontFamily: "'Roboto",
        marginBottom: '3px',
        textDecoration: 'none',
    },
    cardCategoryWhite: {
        color: 'rgba(255, 255, 255, 0.62)',
        margin: '0',
        fontSize: '14px',
        marginTop: '0',
        marginBottom: '0',
    },
    keywordsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    keywordsInputRow: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-end',
    },
    keywordsChipsContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginTop: '0.5rem',
    },
    keywordChip: {
        backgroundColor: primaryColor[0],
        color: '#fff',
        '& .MuiChip-deleteIcon': {
            color: '#fff',
        },
    },
    successActions: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginTop: '1rem',
        alignItems: 'center',
    },

})

export default function AddProducts() {
    const history = useHistory()
    const params = useParams()
    console.log('params', params)
    const { user } = useSelector((state) => state.auth)
    const { categoriesData, loadingCategoriesData } = useSelector(
        (state) => state.categories
    )
    const { loadingProductDetail } = useSelector((state) => state.products)
    const dispatch = useDispatch()
    const classes = useStyles()
    const [deleteImages, setDeleteImages] = useState([])
    const [openConfirmUnique, setOpenConfirmUnique] = useState(false)
    const [productDetail, setProductDetail] = useState(null)
    const [submitError, setSubmitError] = useState(null)
    const [successProductId, setSuccessProductId] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
    const isEditing = useMemo(() => Boolean(params.id), [params.id])
    const tenantSlug = useMemo(() => getCurrentTenant(user) || 'mi-tienda', [user])
    // Estados para crop de imágenes
    const [cropModalOpen, setCropModalOpen] = useState(false)
    const [currentImageForCrop, setCurrentImageForCrop] = useState(null)
    const [currentImageIndex, setCurrentImageIndex] = useState(null)
    const [isSquareAspectRatio, setIsSquareAspectRatio] = useState(true) // true = cuadrado, false = rectangular vertical
    const [keywordInput, setKeywordInput] = useState('') // Estado para el input de keywords
    const [showAspectRatioModal, setShowAspectRatioModal] = useState(false) // Estado para el modal de confirmación

    // Estados para autocomplete de colores
    const [colorsSearchResults, setColorsSearchResults] = useState([])
    const [loadingColorsSearch, setLoadingColorsSearch] = useState(false)
    const [colorsSearchError, setColorsSearchError] = useState(false)
    const [createColorSuccess, setCreateColorSuccess] = useState(false)
    const [createColorError, setCreateColorError] = useState(null)

    // Estados para autocomplete de tallas
    const [sizesSearchResults, setSizesSearchResults] = useState([])
    const [loadingSizesSearch, setLoadingSizesSearch] = useState(false)
    const [sizesSearchError, setSizesSearchError] = useState(false)
    const [createSizeSuccess, setCreateSizeSuccess] = useState(false)
    const [createSizeError, setCreateSizeError] = useState(null)
    //form
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
        watch,
        setValue,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            images: [],
            name: '',
            category: '',
            tags: '',
            price: '',
            stock: '',
            description: '',
            keywords: [],
            status: '',
            featuresArray: [],
            unique: true,
            cost: '',
            discount: '',
        },
    })
    const featuresArray = useFieldArray({
        control,
        name: 'featuresArray', // Nombre del campo repetible
    })
    const keywordsArray = useFieldArray({
        control,
        name: 'keywords', // Nombre del campo repetible
    })
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'images',
    })
    const watchUnique = watch('unique')
    const watchPrice = watch('price')
    const watchDiscount = watch('discount')
    const watchCost = watch('cost')

    // Calcular ganancia
    const calculateProfit = () => {
        if (!watchCost || !watchPrice || (typeof watchCost === 'string' && watchCost.trim() === '') || (typeof watchPrice === 'string' && watchPrice.trim() === '')) {
            return ''
        }

        // Limpiar formato de precio (remover $ y comas)
        const priceCleaned = (watchPrice || '').toString().replace(/[$,]/g, '').trim()
        const costCleaned = (watchCost || '').toString().replace(/[$,]/g, '').trim()

        if (!priceCleaned || !costCleaned) return ''

        const priceValue = parseFloat(priceCleaned)
        const costValue = parseFloat(costCleaned)

        if (isNaN(priceValue) || isNaN(costValue) || costValue <= 0 || priceValue <= 0) {
            return ''
        }

        // Calcular precio final con descuento
        const discountValue = parseFloat(watchDiscount || '0') || 0
        const finalPrice = priceValue * (1 - discountValue / 100)

        // Calcular ganancia
        const profit = finalPrice - costValue

        // Formatear ganancia con 2 decimales y separador de miles
        return profit.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }

    const profitValue = calculateProfit()

    // Función para obtener valores numéricos calculados (optimizada con useMemo)
    const calculatedValues = useMemo(() => {
        if (!watchCost || !watchPrice || (typeof watchCost === 'string' && watchCost.trim() === '') || (typeof watchPrice === 'string' && watchPrice.trim() === '')) {
            return null
        }

        const priceCleaned = (watchPrice || '').toString().replace(/[$,]/g, '').trim()
        const costCleaned = (watchCost || '').toString().replace(/[$,]/g, '').trim()

        if (!priceCleaned || !costCleaned) return null

        const priceValue = parseFloat(priceCleaned)
        const costValue = parseFloat(costCleaned)
        const discountValue = parseFloat(watchDiscount || '0') || 0

        if (isNaN(priceValue) || isNaN(costValue) || costValue <= 0 || priceValue <= 0) {
            return null
        }

        const finalPrice = priceValue * (1 - discountValue / 100)
        const profit = finalPrice - costValue
        const profitMargin = finalPrice > 0 ? (profit / finalPrice) * 100 : 0

        return {
            priceValue,
            costValue,
            discountValue,
            finalPrice,
            profit,
            profitMargin
        }
    }, [watchPrice, watchCost, watchDiscount])

    // Detectar alertas inteligentes (optimizado con useMemo)
    const profitAlerts = useMemo(() => {
        if (!calculatedValues) return []

        const alerts = []

        // Verificar si el descuento causa que el precio final sea menor al costo
        const discountCausesLoss = calculatedValues.finalPrice < calculatedValues.costValue && calculatedValues.discountValue > 0

        // Alerta: Descuento muy alto (>= 50%) - Escenario negativo
        if (calculatedValues.discountValue >= 50) {
            alerts.push({
                severity: 'error',
                message: `Descuento del ${calculatedValues.discountValue}% está afectando significativamente la ganancia. El precio final será $${calculatedValues.finalPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} en lugar de $${calculatedValues.priceValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.`,
                type: 'high-discount'
            })
        } else if (calculatedValues.discountValue >= 30) {
            // Si el precio final es menor al costo, es un error
            if (discountCausesLoss) {
                alerts.push({
                    severity: 'error',
                    message: `Descuento del ${calculatedValues.discountValue}% reducirá el precio final a $${calculatedValues.finalPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}, que es menor que el costo ($${calculatedValues.costValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}). Esto generará pérdidas.`,
                    type: 'medium-discount-error'
                })
            } else {
                alerts.push({
                    severity: 'info',
                    message: `Descuento del ${calculatedValues.discountValue}% reducirá el precio final a $${calculatedValues.finalPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.`,
                    type: 'medium-discount'
                })
            }
        } else if (calculatedValues.discountValue > 0 && discountCausesLoss) {
            // Cualquier descuento que cause pérdidas, incluso si es menor al 30%
            alerts.push({
                severity: 'error',
                message: `Descuento del ${calculatedValues.discountValue}% reducirá el precio final a $${calculatedValues.finalPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}, que es menor que el costo ($${calculatedValues.costValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}). Esto generará pérdidas.`,
                type: 'low-discount-error'
            })
        }

        // Alerta: Ganancia negativa (prioritaria) - Escenario negativo
        if (calculatedValues.profit < 0) {
            alerts.push({
                severity: 'error',
                message: `¡Pérdida detectada! El precio final ($${calculatedValues.finalPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}) es menor que el costo ($${calculatedValues.costValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}). Estarías perdiendo $${Math.abs(calculatedValues.profit).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} por unidad.`,
                type: 'negative-profit'
            })
        }
        // Alerta: Margen de ganancia muy bajo - Escenario negativo
        else if (calculatedValues.profitMargin < 10 && calculatedValues.profit > 0) {
            alerts.push({
                severity: 'error',
                message: `Margen de ganancia muy bajo (${calculatedValues.profitMargin.toFixed(1)}%). La ganancia es de $${calculatedValues.profit.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} sobre un precio final de $${calculatedValues.finalPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}. Considera revisar el precio o el costo.`,
                type: 'low-margin'
            })
        } else if (calculatedValues.profitMargin < 20 && calculatedValues.profitMargin >= 10 && calculatedValues.profit > 0) {
            alerts.push({
                severity: 'info',
                message: `Margen de ganancia: ${calculatedValues.profitMargin.toFixed(1)}%. Ganancia: $${calculatedValues.profit.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.`,
                type: 'medium-margin'
            })
        }

        // Alerta: Precio final muy bajo comparado con costo - Escenario negativo
        if (calculatedValues.finalPrice < calculatedValues.costValue * 1.1 && calculatedValues.profit > 0) {
            alerts.push({
                severity: 'error',
                message: `Precio final muy bajo. El precio final ($${calculatedValues.finalPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}) es solo ${((calculatedValues.finalPrice / calculatedValues.costValue) * 100).toFixed(1)}% del costo. Esto puede no ser rentable.`,
                type: 'low-final-price'
            })
        }

        // Mensaje de éxito si todo está bien (solo si no hay otras alertas críticas)
        if (calculatedValues.profit > 0 && calculatedValues.profitMargin >= 20 && calculatedValues.discountValue < 30 && alerts.length === 0) {
            alerts.push({
                severity: 'success',
                message: `Margen de ganancia saludable: ${calculatedValues.profitMargin.toFixed(1)}%. Ganancia: $${calculatedValues.profit.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.`,
                type: 'healthy-profit'
            })
        }

        // Priorizar alertas: error primero, luego info, luego success
        return alerts.sort((a, b) => {
            const order = { error: 0, info: 1, success: 2 }
            return order[a.severity] - order[b.severity]
        })
    }, [calculatedValues])

    const onDrop = useCallback((acceptedFiles) => {
        // Do something with the files
        console.log('ondrop - archivos aceptados:', acceptedFiles)
        acceptedFiles.forEach((e) => {
            const imageUrl = URL.createObjectURL(e)
            console.log('Abriendo modal de crop para nueva imagen en índice:', fields.length)
            setCurrentImageForCrop(imageUrl)
            setCurrentImageIndex(fields.length)
            setCropModalOpen(true)
        })
    }, [fields.length])
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: 1,
        accept: {
            'image/*': [],
        },
    })

    // Handlers para buscar colores
    const handleSearchColors = useCallback(async (query) => {
        if (!query || query.trim().length === 0) {
            setColorsSearchResults([])
            return
        }
        setLoadingColorsSearch(true)
        setColorsSearchError(false)
        try {
            const result = await dispatch(
                searchColors({ access: user.token, query: query.trim() })
            ).unwrap()
            setColorsSearchResults(result.data?.colors || result.data || [])
        } catch (error) {
            console.error('Error al buscar colores:', error)
            setColorsSearchError(true)
            setColorsSearchResults([])
        } finally {
            setLoadingColorsSearch(false)
        }
    }, [dispatch, user.token])

    // Handlers para crear color
    const handleCreateColor = useCallback(async (colorName) => {
        setCreateColorError(null)
        try {
            const result = await dispatch(
                createColor({ access: user.token, data: { name: colorName } })
            ).unwrap()
            // La respuesta tiene la estructura: { ok: true, message: "...", color: { _id: "...", name: "..." } }
            const newColor = result.color || result.data?.color || result.data || { name: colorName }
            setCreateColorSuccess(true)
            setColorsSearchResults((prev) => [newColor, ...prev])
            // Retornar el objeto completo con _id para que el componente pueda extraer el _id
            return newColor
        } catch (error) {
            console.error('Error al crear color:', error)
            setCreateColorError(error.response?.data?.error || error.message || 'Error al crear el color')
            throw error
        }
    }, [dispatch, user.token])

    // Handlers para buscar tallas
    const handleSearchSizes = useCallback(async (query) => {
        if (!query || query.trim().length === 0) {
            setSizesSearchResults([])
            return
        }
        setLoadingSizesSearch(true)
        setSizesSearchError(false)
        try {
            const result = await dispatch(
                searchSizes({ access: user.token, query: query.trim() })
            ).unwrap()
            setSizesSearchResults(result.data?.sizes || result.data || [])
        } catch (error) {
            console.error('Error al buscar tallas:', error)
            setSizesSearchError(true)
            setSizesSearchResults([])
        } finally {
            setLoadingSizesSearch(false)
        }
    }, [dispatch, user.token])

    // Handlers para crear talla
    const handleCreateSize = useCallback(async (sizeName) => {
        setCreateSizeError(null)
        try {
            const result = await dispatch(
                createSize({ access: user.token, data: { name: sizeName } })
            ).unwrap()
            // La respuesta tiene la estructura: { ok: true, message: "...", size: { _id: "...", name: "..." } }
            const newSize = result.size || result.data?.size || result.data || { name: sizeName }
            setCreateSizeSuccess(true)
            setSizesSearchResults((prev) => [newSize, ...prev])
            // Retornar el objeto completo con _id para que el componente pueda extraer el _id
            return newSize
        } catch (error) {
            console.error('Error al crear talla:', error)
            setCreateSizeError(error.response?.data?.error || error.message || 'Error al crear la talla')
            throw error
        }
    }, [dispatch, user.token])

    const submit = async (values) => {
        setSubmitError(null)
        const data = new FormData()
        setIsSubmitting(true)

        // Agregar datos básicos del producto
        data.append('name', values.name || '')
        data.append('category', values.category || '')
        data.append(
            'price',
            values.price.replace(/[$,]/g, '') || 0
        )
        data.append('description', values.description || '')

        // Agregar costo siempre (nuevo campo requerido)
        const sanitizedCost =
            values.cost !== null && values.cost !== undefined
                ? values.cost.toString().replace(/[$,]/g, '').trim()
                : ''
        data.append('cost', sanitizedCost)

        // Agregar descuento si existe
        if (values.discount !== null && values.discount !== undefined && values.discount !== '') {
            data.append('discount', values.discount)
        }

        // Agregar imágenes del producto
        if (Array.isArray(values.images)) {
            values.images.forEach((image) => {
                if (image.file) {
                    data.append('productImage', image.file)
                }
            })
        }

        // Agregar características (features)
        if (values.featuresArray?.length > 0) {
            data.append('features', JSON.stringify(values.featuresArray))
        }
        if (values.unique) {
            data.append(
                'features',
                JSON.stringify([
                    {
                        color: null,
                        size: null,
                        stock: values.stock || 0,
                    },
                ])
            )
        }

        // Agregar keywords
        if (values.keywords?.length > 0) {
            data.append('keywords', JSON.stringify(values.keywords.map(kw => kw.keyword)))
        }
        // Agregar estado del producto
        data.append(
            'status',
            JSON.stringify({ available: values.status === '0' ? true : false })
        )

        // Si es edición, manejar imágenes eliminadas
        try {
            let response
            if (params.id) {
                if (deleteImages && deleteImages.length > 0) {
                    data.append('deletedImages', JSON.stringify(deleteImages))
                }
                // Despachar acción de edición
                response = await dispatch(editProduct({ access: user.token, data, id: params.id })).unwrap()
                setSuccessProductId(params.id || extractProductId(response))
            } else {
                // Despachar acción de creación
                response = await dispatch(postProducts({ access: user.token, data })).unwrap()
                setSuccessProductId(extractProductId(response))
            }
            setIsSuccessModalOpen(true)
        } catch (error) {
            const errorMessage =
                error?.response?.data?.error ||
                error?.error ||
                error?.message ||
                'Ocurrió un error al guardar el producto.'
            setSubmitError({
                error: errorMessage,
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteImage = (index) => {
        setDeleteImages([...deleteImages, index])
        remove(index)
    }

    // Funciones para manejar el crop
    const handleCropComplete = (croppedImageUrl, croppedBlob) => {
        console.log('Crop completado:', { croppedImageUrl, currentImageIndex })

        // Crear un nuevo archivo desde el blob
        const croppedFile = new File([croppedBlob], `cropped-image-${Date.now()}.jpg`, {
            type: 'image/jpeg',
        })

        if (currentImageIndex !== null) {
            console.log('Reemplazando imagen existente en índice:', currentImageIndex)
            // Reemplazar imagen existente
            remove(currentImageIndex)
            // Usar setTimeout para asegurar que el remove se complete antes del append
            setTimeout(() => {
                append({
                    file: croppedFile,
                    preview: croppedImageUrl,
                }, currentImageIndex)
                console.log('Imagen reemplazada exitosamente')
            }, 0)
        } else {
            console.log('Agregando nueva imagen')
            // Agregar nueva imagen
            append({
                file: croppedFile,
                preview: croppedImageUrl,
            })
            console.log('Nueva imagen agregada exitosamente')
        }

        // Limpiar estados
        setCropModalOpen(false)
        setCurrentImageForCrop(null)
        setCurrentImageIndex(null)
    }

    const handleCropCancel = () => {
        setCropModalOpen(false)
        setCurrentImageForCrop(null)
        setCurrentImageIndex(null)
    }

    const handleCropExistingImage = (index) => {
        console.log('Abriendo modal de crop para imagen existente en índice:', index)
        const image = fields[index]
        setCurrentImageForCrop(image.preview)
        setCurrentImageIndex(index)
        setCropModalOpen(true)
    }

    // Funciones para manejar keywords
    const handleAddKeyword = () => {
        const trimmedKeyword = keywordInput.trim()
        if (trimmedKeyword && !keywordsArray.fields.some(kw => kw.keyword === trimmedKeyword)) {
            keywordsArray.append({ keyword: trimmedKeyword })
            setKeywordInput('')
        }
    }

    const handleRemoveKeyword = (index) => {
        keywordsArray.remove(index)
    }

    const handleKeywordInputKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAddKeyword()
        }
    }

    // Funciones para manejar el cambio de formato de recorte
    const handleAspectRatioChange = () => {
        // Si hay imágenes, mostrar modal de confirmación
        if (fields.length > 0) {
            setShowAspectRatioModal(true)
        } else {
            // Si no hay imágenes, cambiar directamente
            setIsSquareAspectRatio(!isSquareAspectRatio)
        }
    }

    const handleConfirmAspectRatioChange = () => {
        // Eliminar todas las imágenes
        fields.forEach((_, index) => {
            remove(index)
        })
        // Cambiar el formato
        setIsSquareAspectRatio(!isSquareAspectRatio)
        // Cerrar el modal
        setShowAspectRatioModal(false)
    }

    const handleCancelAspectRatioChange = () => {
        setShowAspectRatioModal(false)
    }

    const extractProductId = (response) => {
        if (!response) return null
        return (response?.data?.product?._id)
    }

    const resolveProductId = () => {
        return (successProductId)
    }

    const handleSuccessModalClose = () => {
        setIsSuccessModalOpen(false)
        if (!isEditing) {
            reset()
        }
        setSuccessProductId(params.id || null)
    }

    const handleGoToList = () => {
        handleSuccessModalClose()
        history.push('/admin/products')
    }

    const handleViewDetail = () => {
        const productId = resolveProductId()
        if (!productId) return
        handleSuccessModalClose()
        history.push(`/admin/product-detail/${productId}`)
    }

    const handleViewStore = () => {
        const productId = resolveProductId()
        if (!productId) return
        window.open(
            `https://${tenantSlug}.tiendapro.com.ar/detalle-producto/${productId}`,
            '_blank'
        )
    }

    useEffect(() => {
        const getData = async () => {
            dispatch(
                getCategories({
                    access: user.token,
                    filters: { page: 0, limit: 50 },
                })
            )
            if (params.id) {
                try {
                    const { data } = await dispatch(
                        getProductDetail({ access: user.token, id: params.id })
                    ).unwrap()
                    setProductDetail(data.product)
                } catch (error) {
                    console.log('error en el catch', error)
                    setSubmitError({
                        error: error.error
                    })
                }
            }
        }

        getData()
    }, [])
    useEffect(async () => {
        if (!params.id) {
            featuresArray.append({})
        }
    }, [])

    useEffect(async () => {
        if (productDetail && params.id && categoriesData) {
            console.log('productDetail', productDetail)
            // Preparar keywords para el reset
            const keywordsArrayData = productDetail.keywords && Array.isArray(productDetail.keywords)
                ? productDetail.keywords.map(keyword => ({ keyword: typeof keyword === 'string' ? keyword : keyword.keyword || keyword }))
                : []

            reset({
                images: productDetail.images.map((e) => ({ preview: e.url })),
                name: productDetail.name,
                price: productDetail.price,
                description: productDetail.description,
                status: productDetail.status.available ? 0 : 1,
                discount: productDetail.discount ?? '',
                cost:
                    productDetail.cost === null || productDetail.cost === undefined
                        ? ''
                        : productDetail.cost.toString(),
                hasFeatures: productDetail.features.length > 0,
                category: categoriesData.data.some(
                    (category) => category._id === productDetail.category
                )
                    ? categoriesData.data.find(
                        (category) => category._id === productDetail.category
                    )._id
                    : '',
                keywords: keywordsArrayData,
            })
            if (productDetail.features.length > 0) {
                setValue('unique', false)

                // Cargar colores y tallas seleccionados para que se muestren correctamente
                const colorsToLoad = []
                const sizesToLoad = []

                productDetail.features
                    .filter((feature) => feature.color || feature.size)
                    .forEach((feature) => {
                        // Extraer _id de color y size si vienen como objetos
                        const colorId = feature.color?._id || feature.color?.id || feature.color
                        const sizeId = feature.size?._id || feature.size?.id || feature.size

                        // Si el color viene como objeto, agregarlo a la lista para buscar
                        if (feature.color && typeof feature.color === 'object') {
                            colorsToLoad.push(feature.color)
                        }
                        // Si el size viene como objeto, agregarlo a la lista para buscar
                        if (feature.size && typeof feature.size === 'object') {
                            sizesToLoad.push(feature.size)
                        }

                        featuresArray.append({
                            ...feature,
                            color: colorId,
                            size: sizeId,
                            hasSize: Boolean(feature.size),
                        })
                    })

                // Agregar colores y tallas a los resultados de búsqueda para que se muestren correctamente
                if (colorsToLoad.length > 0) {
                    setColorsSearchResults(colorsToLoad)
                }
                if (sizesToLoad.length > 0) {
                    setSizesSearchResults(sizesToLoad)
                }
                productDetail.features
                    .filter((feature) => !feature.color && !feature.size)
                    .map((feature) => {
                        console.log("feature", feature)
                        setValue('stock', feature.stock)
                        setValue('unique', true)

                    })
            }
        } else {
            reset({
                images: [],
                name: '',
                tags: '',
                price: '',
                stock: '',
                description: '',
                keywords: [],
                status: '',
                featuresArray: [],
                category: '',
                unique: true,
                cost: '',
                discount: '',
            })
        }
    }, [productDetail])

    const handleSetUnique = () => {
        console.log('handleSetUnique')
        if (featuresArray.fields.length > 0) {
            setOpenConfirmUnique(true)
        } else {
            setValue('unique', !watchUnique)
        }
    }

    if ((params.id && loadingProductDetail) || loadingCategoriesData) {
        return <LoadinScreen />
    }
    console.log('category data ', categoriesData)
    console.log('errors ', errors)
    return (
        <section>
            <IconButton
                className={classes.backButton}
                onClick={() => history.push('/admin/products')}
            >
                <ArrowBackIcon />
            </IconButton>
            <Card className={classes.card}>
                <CardHeader color="primary">
                    <h4 className={classes.cardTitleWhite}>
                        {params.id ? 'Editar producto' : 'Agregar producto'}
                    </h4>
                    <p className={classes.cardCategoryWhite}>
                        Completa la información para {params.id ? 'editar' : 'agregar'} un producto a tu tienda.
                    </p>
                </CardHeader>
                <CardBody>
                    <form onSubmit={handleSubmit(submit)}>
                        <Box>
                            <h3>Imágenes de tu producto</h3>
                            <Box style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <Typography variant="body2" style={{ color: '#666' }}>
                                    Formato de recorte:
                                </Typography>
                                <Box style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Typography variant="body2" style={{ fontSize: '14px' }}>
                                        Cuadrado
                                    </Typography>
                                    <Switch
                                        checked={!isSquareAspectRatio}
                                        onChange={handleAspectRatioChange}
                                        color="primary"
                                        size="small"
                                    />
                                    <Typography variant="body2" style={{ fontSize: '14px' }}>
                                        Rectangular vertical
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                        <div className={classes.imagesRow}>
                            {console.log('fields', fields)}
                            {fields.map((file, index) => {
                                console.log('file', file)
                                return (
                                    <div
                                        className={classes.imagesWrapper}
                                        key={`file-${index}`}
                                    >
                                        <IconButton
                                            className={classes.trashICon}
                                            onClick={() => handleDeleteImage(index)}
                                        >
                                            <DeleteForever />
                                        </IconButton>
                                        <IconButton
                                            style={{
                                                position: 'absolute',
                                                top: '5px',
                                                left: '5px',
                                                background: 'rgba(255,255,255,0.9)',
                                            }}
                                            onClick={() => handleCropExistingImage(index)}
                                        >
                                            <Crop />
                                        </IconButton>
                                        <img
                                            className={classes.productImage}
                                            src={file.preview}
                                            alt="product-image"
                                        />
                                    </div>
                                )
                            })}
                            <div {...getRootProps()} className={classes.dropZone}>
                                <img
                                    src={uploadImage}
                                    alt="Subir archivo"
                                    className={classes.uploadImage}
                                />
                                <input {...getInputProps()} />

                                {isDragActive ? (
                                    <p>Suelta tu archivo aquí</p>
                                ) : (
                                    <p>
                                        Arrastra tu archivo o has click para seleccionar
                                        desde tu ordenador
                                    </p>
                                )}
                            </div>
                        </div>
                        <Box>
                            {errors.images && (
                                <TextDanger>
                                    <p className={classes.errorText}>
                                        {errors.images.message}
                                    </p>
                                </TextDanger>
                            )}
                        </Box>
                        <Box>
                            <h3>Información de tu producto</h3>
                        </Box>
                        <Box className={classes.inputRow}>
                            <Box flex="0 1 812px">
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextInput
                                            error={fieldState.error ? true : false}
                                            errorMessage={fieldState.error}
                                            icon={null}
                                            label={'Nombre del producto'}
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                            </Box>
                        </Box>
                        <Box className={classes.inputRow}>
                            <Box flex="0 1 812px">
                                <Box className={classes.keywordsContainer}>
                                    <Typography variant="body2" style={{ color: '#666', marginBottom: '0.5rem' }}>
                                        Palabras clave del producto
                                    </Typography>
                                    <Box className={classes.keywordsInputRow}>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            placeholder="Escribe una palabra clave..."
                                            value={keywordInput}
                                            onChange={(e) => setKeywordInput(e.target.value)}
                                            onKeyPress={handleKeywordInputKeyPress}
                                            style={{ backgroundColor: '#FFF' }}
                                        />
                                        <Button
                                            onClick={handleAddKeyword}
                                            disabled={!keywordInput.trim()}
                                            variant="contained"
                                            color="primary"
                                            startIcon={<Add />}
                                            style={{ minWidth: '120px' }}
                                        >
                                            Agregar
                                        </Button>
                                    </Box>
                                    <Box className={classes.keywordsChipsContainer}>
                                        {keywordsArray.fields.map((keyword, index) => (
                                            <Chip
                                                key={keyword.id}
                                                label={keyword.keyword}
                                                onDelete={() => handleRemoveKeyword(index)}
                                                className={classes.keywordChip}
                                                deleteIcon={<Delete />}
                                            />
                                        ))}
                                    </Box>
                                    {errors.keywords && (
                                        <TextDanger>
                                            <p className={classes.errorText}>
                                                {errors.keywords.message}
                                            </p>
                                        </TextDanger>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                        <Box className={classes.inputRow}>
                            <Box flex="0 1 250px">
                                <Controller
                                    name="price"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <Box>
                                            <NumericFormat
                                                className={classes.input}
                                                value={field.value}
                                                onChange={field.onChange}
                                                customInput={TextField}
                                                label="Precio en Pesos"
                                                variant="outlined"
                                                thousandSeparator=","
                                                decimalSeparator="."
                                                decimalScale={2} // Máximo 2 decimales
                                                prefix="$"
                                                error={fieldState.error ? true : false}
                                            />
                                            {fieldState.error && (
                                                <Typography
                                                    color="error"
                                                    variant="caption"
                                                    sx={{
                                                        display: 'block',
                                                        marginTop: 1,
                                                        fontSize: '14px',
                                                    }}
                                                >
                                                    {fieldState.error.message}
                                                </Typography>
                                            )}
                                        </Box>
                                    )}
                                />
                            </Box>
                            <Box flex="0 1 250px">
                                <Controller
                                    name="discount"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextInput
                                            error={fieldState.error ? true : false}
                                            errorMessage={fieldState.error}
                                            icon={null}
                                            label={'Descuento en %'}
                                            value={field.value}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value.replace(/[^\d]/g, '')
                                                )
                                            }
                                        />
                                    )}
                                />
                            </Box>
                            <Box flex="0 1 250px">
                                <Controller
                                    name="cost"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <Box>
                                            <NumericFormat
                                                className={classes.input}
                                                value={field.value}
                                                onChange={field.onChange}
                                                customInput={TextField}
                                                label="Costo de la prenda (opcional)"
                                                variant="outlined"
                                                thousandSeparator=","
                                                decimalSeparator="."
                                                decimalScale={2}
                                                prefix="$"
                                                error={fieldState.error ? true : false}
                                            />
                                            {fieldState.error && (
                                                <Typography
                                                    color="error"
                                                    variant="caption"
                                                    sx={{
                                                        display: 'block',
                                                        marginTop: 1,
                                                        fontSize: '14px',
                                                    }}
                                                >
                                                    {fieldState.error.message}
                                                </Typography>
                                            )}
                                        </Box>
                                    )}
                                />
                            </Box>
                            <Box flex="0 1 250px">
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    label="Ganancia"
                                    value={profitValue ? `$${profitValue}` : ''}
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    style={{
                                        backgroundColor: '#f5f5f5',
                                    }}
                                    helperText={profitValue ? 'Ganancia calculada automáticamente' : 'Complete precio y costo para calcular la ganancia'}
                                />
                            </Box>
                        </Box>

                        {/* Alertas inteligentes de ganancia */}
                        {profitAlerts.length > 0 && (
                            <Box style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                                {profitAlerts.map((alert, index) => {
                                    const colorMap = {
                                        error: '#d32f2f',
                                        info: '#20B6C9',
                                        success: '#388e3c'
                                    }
                                    return (
                                        <Typography
                                            key={index}
                                            variant="body2"
                                            style={{
                                                color: colorMap[alert.severity] || '#222',
                                                marginBottom: index < profitAlerts.length - 1 ? '0.5rem' : '0',
                                                fontSize: '0.875rem',
                                            }}
                                        >
                                            {alert.message}
                                        </Typography>
                                    )
                                })}
                            </Box>
                        )}

                        <Box className={classes.inputRow}>
                            <Box flex="0 1 250px">
                                <Controller
                                    name="category"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <>
                                            <TextField
                                                fullWidth
                                                select
                                                error={fieldState.error ? true : false}
                                                errorMessage={fieldState.error}
                                                SelectProps={{
                                                    MenuProps: {
                                                        anchorOrigin: {
                                                            vertical: 'bottom',
                                                            horizontal: 'left',
                                                        },
                                                        transformOrigin: {
                                                            vertical: 'top',
                                                            horizontal: 'left',
                                                        },
                                                        getContentAnchorEl: null, // Esto asegura que el dropdown no se ancle al centro del campo
                                                    },
                                                }}
                                                variant="outlined"
                                                value={field.value}
                                                label="Categoría"
                                                style={{
                                                    backgroundColor: '#FFF',
                                                }}
                                                onChange={field.onChange}
                                            >
                                                {categoriesData &&
                                                    categoriesData.data.map(
                                                        (category) => (
                                                            <MenuItem
                                                                key={category._id}
                                                                value={category._id}
                                                                onClick={() =>
                                                                    setValue(
                                                                        'category',
                                                                        category._id
                                                                    )
                                                                }
                                                            >
                                                                {category.name}
                                                            </MenuItem>
                                                        )
                                                    )}
                                            </TextField>
                                            {fieldState.error && (
                                                <Typography
                                                    variant="caption"
                                                    color="error"
                                                    sx={{
                                                        display: 'block',
                                                        marginTop: 1,
                                                    }}
                                                >
                                                    {fieldState.error.message}
                                                </Typography>
                                            )}
                                        </>
                                    )}
                                />
                            </Box>
                            <Box flex="0 1 250px">
                                <Box>
                                    <p style={{ margin: 0 }}>Estatus</p>
                                    <Box>
                                        <Controller
                                            name="status"
                                            control={control}
                                            render={({ field }) => (
                                                <label htmlFor="available">
                                                    Disponible
                                                    <Checkbox
                                                        id="available"
                                                        classes={{
                                                            checked: classes.checked,
                                                        }}
                                                        checked={
                                                            field.value === 0
                                                                ? true
                                                                : false
                                                        }
                                                        onChange={() =>
                                                            field.onChange(0)
                                                        }
                                                        inputProps={{
                                                            'aria-label':
                                                                'primary checkbox',
                                                        }}
                                                    />
                                                </label>
                                            )}
                                        />

                                        <Controller
                                            name="status"
                                            control={control}
                                            render={({ field }) => (
                                                <label htmlFor="disabled">
                                                    No disponible
                                                    <Checkbox
                                                        id="disabled"
                                                        checked={
                                                            field.value === 1
                                                                ? true
                                                                : false
                                                        }
                                                        onChange={() =>
                                                            field.onChange(1)
                                                        }
                                                        inputProps={{
                                                            'aria-label':
                                                                'primary checkbox',
                                                        }}
                                                    />
                                                </label>
                                            )}
                                        />
                                        <Box>
                                            {console.log('errors', errors)}
                                            {errors.status && (
                                                <TextDanger>
                                                    <p className={classes.errorText}>
                                                        {errors.status.message}
                                                    </p>
                                                </TextDanger>
                                            )}
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                            <Box flex="0 1 350px">
                                <p style={{ margin: 0 }}>Tipo de producto</p>

                                <Controller
                                    name="unique"
                                    control={control}
                                    render={({ field }) => (
                                        <label htmlFor="unique-variant">
                                            Producto único ( sin variantes de color o
                                            talla)
                                            <Checkbox
                                                id="unique-variant"
                                                classes={{
                                                    checked: classes.checked,
                                                }}
                                                checked={field.value}
                                                onChange={() => {
                                                    handleSetUnique(field.value)
                                                }}
                                                inputProps={{
                                                    'aria-label': 'primary checkbox',
                                                }}
                                            />
                                        </label>
                                    )}
                                />
                                <Controller
                                    name="unique"
                                    control={control}
                                    render={({ field }) => (
                                        <label htmlFor="unique-variant">
                                            Producto con colores o tallas
                                            <Checkbox
                                                id="unique-variant"
                                                classes={{
                                                    checked: classes.checked,
                                                }}
                                                checked={!field.value}
                                                onChange={() => field.onChange(false)}
                                                inputProps={{
                                                    'aria-label': 'primary checkbox',
                                                }}
                                            />
                                        </label>
                                    )}
                                />
                            </Box>
                            {watchUnique && (
                                <Box flex="0 1 250px">
                                    <Controller
                                        name="stock"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <TextInput
                                                error={fieldState.error ? true : false}
                                                errorMessage={fieldState.error}
                                                icon={null}
                                                label={'Stock del producto'}
                                                value={field.value}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value.replace(
                                                            /[^\d]/g,
                                                            ''
                                                        )
                                                    )
                                                }
                                            />
                                        )}
                                    />
                                </Box>
                            )}
                        </Box>

                        <>
                            {!watchUnique &&
                                featuresArray.fields.map((field, index) => {
                                    const hasSize = watch(
                                        `featuresArray.${index}.hasSize`
                                    )
                                    return (
                                        <Box
                                            key={field.id}
                                            style={{ marginBottom: 16 }}
                                        >
                                            <Divider style={{ marginBottom: 16 }} />
                                            <Box
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                }}
                                            >
                                                <h4 style={{ margin: 0 }}>
                                                    Variante {index + 1}
                                                </h4>
                                                <IconButton
                                                    onClick={() =>
                                                        featuresArray.remove(index)
                                                    }
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </Box>
                                            <p style={{ margin: 0 }}>Color</p>

                                            <Box style={{ marginBottom: 16 }}>
                                                <Controller
                                                    name={`featuresArray.${index}.color`}
                                                    control={control}
                                                    render={({ field, fieldState }) => {
                                                        return (
                                                            <AutocompleteWithCreate
                                                                label="Color del producto"
                                                                value={field.value || ''}
                                                                onChange={(colorId) => {
                                                                    // El componente ahora retorna el _id directamente
                                                                    field.onChange(colorId)
                                                                }}
                                                                onSearch={handleSearchColors}
                                                                onCreate={handleCreateColor}
                                                                searchResults={colorsSearchResults}
                                                                loading={loadingColorsSearch}
                                                                error={colorsSearchError}
                                                                errorMessage={fieldState.error?.message || createColorError}
                                                                placeholder="Escribe el color del producto"
                                                                createButtonText="Crear nuevo color"
                                                                noOptionsText="No se encontraron colores"
                                                                getOptionLabel={(option) => option.name || option}
                                                                getOptionValue={(option) => option.name || option}
                                                                getOptionId={(option) => option._id || option.id || option}
                                                            />
                                                        )
                                                    }}
                                                />
                                            </Box>
                                            <p style={{ margin: 0 }}>Talla</p>
                                            <Box>
                                                <Controller
                                                    name={`featuresArray.${index}.hasSize`}
                                                    control={control}
                                                    render={({ field }) => (
                                                        <label
                                                            htmlFor={`features-size-${index}`}
                                                        >
                                                            Activar variante de talla
                                                            <Switch
                                                                id={`features-size-${index}`}
                                                                checked={
                                                                    field.value || false
                                                                }
                                                                onChange={
                                                                    field.onChange
                                                                }
                                                                inputProps={{
                                                                    'aria-label':
                                                                        'primary checkbox',
                                                                }}
                                                            />
                                                        </label>
                                                    )}
                                                />
                                            </Box>
                                            {hasSize && (
                                                <Controller
                                                    name={`featuresArray.${index}.size`}
                                                    control={control}
                                                    render={({ field, fieldState }) => (
                                                        <AutocompleteWithCreate
                                                            label="Talla del producto"
                                                            value={field.value || ''}
                                                            onChange={(sizeId) => {
                                                                // El componente ahora retorna el _id directamente
                                                                field.onChange(sizeId)
                                                            }}
                                                            onSearch={handleSearchSizes}
                                                            onCreate={handleCreateSize}
                                                            searchResults={sizesSearchResults}
                                                            loading={loadingSizesSearch}
                                                            error={sizesSearchError}
                                                            errorMessage={fieldState.error?.message || createSizeError}
                                                            placeholder="Escribe la talla del producto"
                                                            createButtonText="Crear nueva talla"
                                                            noOptionsText="No se encontraron tallas"
                                                            getOptionLabel={(option) => option.name || option}
                                                            getOptionValue={(option) => option.name || option}
                                                            getOptionId={(option) => option._id || option.id || option}
                                                        />
                                                    )}
                                                />
                                            )}
                                            <Box style={{ marginTop: 16 }}>
                                                <Controller
                                                    name={`featuresArray.${index}.stock`}
                                                    control={control}
                                                    render={({ field, fieldState }) => (
                                                        <TextInput
                                                            error={!!fieldState.error}
                                                            errorMessage={
                                                                fieldState.error
                                                                    ?.message || ''
                                                            }
                                                            icon={null}
                                                            label="Stock del producto"
                                                            value={field.value || ''}
                                                            onChange={(e) =>
                                                                field.onChange(
                                                                    e.target.value.replace(
                                                                        /[^\d]/g,
                                                                        ''
                                                                    )
                                                                )
                                                            }
                                                        />
                                                    )}
                                                />
                                            </Box>
                                        </Box>
                                    )
                                })}
                            {errors.features && (
                                <p>
                                    Las variantes son obligatorias, debes agregar al
                                    menos 1
                                </p>
                            )}
                            {!watchUnique && (
                                <Box className={classes.buttonsRow}>
                                    <Button
                                        onClick={() => featuresArray.append({})}
                                        variant="contained"
                                        color="primary"
                                        type="button"
                                    >
                                        Agregar variante
                                    </Button>
                                </Box>
                            )}
                        </>

                        <Box className={classes.descriptionRow}>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <TinyMCEEditor
                                        apiKey={process.env.REACT_APP_TINYMCE_API_KEY}
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                        label="Descripción del producto"
                                        error={!!fieldState.error}
                                        errorMessage={fieldState.error?.message}
                                        placeholder="Describe las características, beneficios y detalles de tu producto..."
                                        height={300}
                                    />
                                )}
                            />
                        </Box>
                        {Object.keys(errors).length > 0 && (
                            <p>
                                Al parecer faltan campos obligatorios en el formulario
                            </p>
                        )}
                        <Box className={classes.buttonsRow}>
                            <Button
                                isLoading={isSubmitting}
                                variant="contained"
                                color="primary"
                                type="submit"
                            >
                                Guardar
                            </Button>
                        </Box>
                    </form>
                </CardBody>
            </Card>

            <CustomModal
                open={isSuccessModalOpen}
                handleClose={handleSuccessModalClose}
                icon={'success'}
                title="¡Listo!"
                subTitle="Tu producto se guardó exitosamente"
                body={
                    <Box className={classes.successActions}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleViewDetail}
                        >
                            Ver detalle
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleViewStore}
                        >
                            Ver en la tienda
                        </Button>
                    </Box>
                }
                hasCancel={!isEditing}
                cancelText={isEditing ? 'Cerrar' : 'Crear otro producto'}
                confirmText="Ir al listado de productos"
                hasConfirm={true}
                cancelCb={handleSuccessModalClose}
                confirmCb={handleGoToList}
            />
            <CustomModal
                open={submitError}
                handleClose={() => {
                    setSubmitError(null)
                }}
                icon={'error'}
                title="¡Error!"
                subTitle={submitError?.error}
                hasCancel={false}
                hasConfirm={true}
                cancelCb={() => { }}
                confirmCb={() => {
                    setSubmitError(null)
                }}
            />
            <CustomModal
                open={openConfirmUnique}
                handleClose={() => {
                    setOpenConfirmUnique(false)
                }}
                icon={'warning'}
                title="¡Este producto tiene variantes!"
                subTitle="Si continuas, se eliminaran todas las variantes y el producto sera un producto unico"
                hasCancel={true}
                hasConfirm={true}
                cancelCb={() => {
                    setOpenConfirmUnique(false)
                }}
                confirmCb={() => {
                    featuresArray.remove()
                    setOpenConfirmUnique(false)
                    setValue('unique', true)
                }}
            />
            <CustomModal
                open={showAspectRatioModal}
                handleClose={handleCancelAspectRatioChange}
                icon={'warning'}
                title="¡Cambio de formato de recorte!"
                subTitle="Al cambiar el formato de recorte, se eliminarán todas las imágenes actuales ya que son de un formato distinto. Deberás agregar nuevas imágenes con el formato seleccionado."
                hasCancel={true}
                hasConfirm={true}
                cancelCb={handleCancelAspectRatioChange}
                confirmCb={handleConfirmAspectRatioChange}
                cancelText="Cancelar"
                confirmText="Cambiar formato"
            />

            {/* Modal de crop de imágenes */}
            <CropModal
                open={cropModalOpen}
                onClose={handleCropCancel}
                imageUrl={currentImageForCrop}
                onCropComplete={handleCropComplete}
                isSquareAspectRatio={isSquareAspectRatio}
            />

            {/* Modal de éxito al crear color */}
            <CustomModal
                open={createColorSuccess}
                handleClose={() => {
                    setCreateColorSuccess(false)
                }}
                icon={'success'}
                title="¡Color creado!"
                subTitle="El color se ha creado exitosamente"
                hasCancel={false}
                hasConfirm={true}
                confirmText="Aceptar"
                confirmCb={() => {
                    setCreateColorSuccess(false)
                }}
            />

            {/* Modal de error al crear color */}
            <CustomModal
                open={!!createColorError}
                handleClose={() => {
                    setCreateColorError(null)
                }}
                icon={'error'}
                title="¡Error!"
                subTitle={createColorError || 'Error al crear el color'}
                hasCancel={false}
                hasConfirm={true}
                confirmText="Aceptar"
                confirmCb={() => {
                    setCreateColorError(null)
                }}
            />

            {/* Modal de éxito al crear talla */}
            <CustomModal
                open={createSizeSuccess}
                handleClose={() => {
                    setCreateSizeSuccess(false)
                }}
                icon={'success'}
                title="¡Talla creada!"
                subTitle="La talla se ha creado exitosamente"
                hasCancel={false}
                hasConfirm={true}
                confirmText="Aceptar"
                confirmCb={() => {
                    setCreateSizeSuccess(false)
                }}
            />

            {/* Modal de error al crear talla */}
            <CustomModal
                open={!!createSizeError}
                handleClose={() => {
                    setCreateSizeError(null)
                }}
                icon={'error'}
                title="¡Error!"
                subTitle={createSizeError || 'Error al crear la talla'}
                hasCancel={false}
                hasConfirm={true}
                confirmText="Aceptar"
                confirmCb={() => {
                    setCreateSizeError(null)
                }}
            />
        </section>
    )
}
