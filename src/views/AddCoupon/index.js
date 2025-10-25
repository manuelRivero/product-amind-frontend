import {
    CircularProgress,
    Dialog,
    makeStyles,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    FormControlLabel,
    TextField,
    Chip,
    Grid,
} from '@material-ui/core'
import Table from 'components/Table/Table.js'
import React, { useEffect, useState } from 'react'
import { getProducts } from '../../store/products'
import { getCategories } from '../../store/categories'
import { yupResolver } from '@hookform/resolvers/yup'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import * as yup from 'yup'
import ReactPaginate from 'react-paginate'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
import Button from 'components/CustomButtons/Button.js'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'

import MomentUtils from '@date-io/moment'
import { Add } from '@material-ui/icons'
import TextInput from '../../components/TextInput/Index'
import Card from '../../components/Card/Card'
import CardBody from '../../components/Card/CardBody'
import EmptyTablePlaceholder from '../../components/EmptyTablePlaceholder'
import moment from 'moment'
import {
    addCoupon,
    getCouponDetail,
    resetCouponDetail,
    updateCoupon,
} from '../../store/coupons'
import { useHistory, useParams } from 'react-router-dom'
import { COUPON_TYPES } from '../../const/coupons'
import { validateCouponData, generateCouponCode } from '../../helpers/coupon'


const schema = yup.object({
    search: yup.string(),
})

const useStyles = makeStyles({
    cardCategory: {
        color: '#999',
    },
    cardTitle: { color: '#3C4858' },
    pagination: {
        display: 'flex',
        margin: 0,
        padding: 0,
        listStyle: 'none',
        gap: '1rem',
        marginTop: '1rem',
        justifyContent: 'center',
        alignItems: 'center',
    },
    page: {
        padding: '.5rem',
        borderRadius: '4px',
        border: 'solid 1px transparent',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '25px',
        height: '25px',
        '& > a': {
            color: '#3c4858',
        },
    },
    activePage: {
        border: 'solid 1px #00ACC1 !important',
        '& > a': {
            color: '#00ACC1',
        },
    },
    modalBody: {
        padding: '1rem',
    },
    formSection: {
        marginBottom: '2rem',
    },
    sectionTitle: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
        color: '#3C4858',
    },
    chipContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginTop: '0.5rem',
    },
    chip: {
        backgroundColor: '#e3f2fd',
        color: '#1976d2',
    },
})

export default function AddCoupon() {
    try {
        console.log('🔵 AddCoupon: Component starting to render')

        const classes = useStyles()
        const dispatch = useDispatch()
        const history = useHistory()
        const { id } = useParams()

        console.log('🔵 AddCoupon: Basic hooks initialized', { id })

        console.log('🔵 AddCoupon: About to initialize selectors')

        const { productsData } = useSelector((state) => state.products)
        const { categoriesData } = useSelector((state) => state.categories)
        const { loadingCouponDetail, couponDetail } = useSelector((state) => state.coupons)


        const [selectedProducts, setSelectedProducts] = useState([])
        const [selectedCategories, setSelectedCategories] = useState([])
        const [excludedProducts, setExcludedProducts] = useState([])
        const [specificUsers, setSpecificUsers] = useState([])
        // Server-side pagination states
        const [currentPageProducts, setCurrentPageProducts] = useState(0)
        const [currentPageCategories, setCurrentPageCategories] = useState(0)
        const [currentPageExcluded, setCurrentPageExcluded] = useState(0)
        const [totalPagesProducts, setTotalPagesProducts] = useState(0)
        const [totalPagesCategories, setTotalPagesCategories] = useState(0)
        const [totalPagesExcluded, setTotalPagesExcluded] = useState(0)
        const [showProductModal, setShowProductModal] = useState(false)
        const [showCategoryModal, setShowCategoryModal] = useState(false)
        const [showExcludedModal, setShowExcludedModal] = useState(false)
        const [loadingSubmit, setLoadingSubmit] = useState(false)
        const [searchTerm, setSearchTerm] = useState('')
        const [searchTermCategories, setSearchTermCategories] = useState('')
        const [searchTermExcluded, setSearchTermExcluded] = useState('')
        const [loadingProducts, setLoadingProducts] = useState(false)
        const [loadingCategories, setLoadingCategories] = useState(false)


        const itemsPerPage = 10


        const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
            resolver: yupResolver(schema),
            defaultValues: {
                code: generateCouponCode('CUPON', 6),
                name: '',
                description: '',
                type: COUPON_TYPES.PERCENTAGE,
                value: 0,
                minimumAmount: 0,
                maximumDiscount: 0,
                usageLimit: 0,
                validFrom: moment(),
                validUntil: moment().add(1, 'month'),
                firstTimeOnly: false,
                maxUsesPerUser: 1,
            }
        })

        console.log('🔵 AddCoupon: useForm initialized')

        console.log('🔵 AddCoupon: About to initialize watch and user selector')

        const watchedType = watch('type')
        const { user } = useSelector((state) => state.auth)

        console.log('🔵 AddCoupon: watch and user initialized', {
            watchedType,
            user: user ? 'exists' : 'null'
        })

        console.log('🔵 AddCoupon: About to initialize debounce states')

        const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
        const [debouncedSearchTermCategories, setDebouncedSearchTermCategories] = useState('')
        const [debouncedSearchTermExcluded, setDebouncedSearchTermExcluded] = useState('')

        console.log('🔵 AddCoupon: Debounce states initialized')

        // Debounce effects
        console.log('🔵 AddCoupon: About to initialize debounce effects')

        useEffect(() => {
            console.log('🔵 AddCoupon: searchTerm debounce effect triggered', searchTerm)
            const handler = setTimeout(() => {
                setDebouncedSearchTerm(searchTerm)
                // Reset pagination when search term changes
                setCurrentPageProducts(0)
            }, 500)
            return () => clearTimeout(handler)
        }, [searchTerm])

        useEffect(() => {
            console.log('🔵 AddCoupon: searchTermCategories debounce effect triggered', searchTermCategories)
            const handler = setTimeout(() => {
                setDebouncedSearchTermCategories(searchTermCategories)
                // Reset pagination when search term changes
                setCurrentPageCategories(0)
            }, 500)
            return () => clearTimeout(handler)
        }, [searchTermCategories])

        useEffect(() => {
            console.log('🔵 AddCoupon: searchTermExcluded debounce effect triggered', searchTermExcluded)
            const handler = setTimeout(() => {
                setDebouncedSearchTermExcluded(searchTermExcluded)
                // Reset pagination when search term changes
                setCurrentPageExcluded(0)
            }, 500)
            return () => clearTimeout(handler)
        }, [searchTermExcluded])

        console.log('🔵 AddCoupon: Debounce effects initialized')

        console.log('🔵 AddCoupon: About to initialize main useEffect')

        useEffect(() => {
            console.log('🔵 AddCoupon: Main useEffect triggered', { id, userToken: user?.token })

            if (user?.token) {
                console.log('🔵 AddCoupon: Dispatching getProducts and getCategories')
                dispatch(getProducts({
                    access: user.token,
                    filters: { page: 0, search: '', limit: 10 }
                }))
                dispatch(getCategories({
                    access: user.token,
                    filters: { page: 0, search: '' }
                }))
            }

            if (id) {
                console.log('🔵 AddCoupon: Dispatching getCouponDetail', { id })
                dispatch(getCouponDetail({ id }))
            }

            return () => {
                console.log('🔵 AddCoupon: Main useEffect cleanup')
                dispatch(resetCouponDetail())
            }
        }, [id, user?.token])

        console.log('🔵 AddCoupon: Main useEffect initialized')

        // Effect for product search and pagination
        useEffect(() => {
            if (showProductModal && user?.token) {
                setLoadingProducts(true)
                dispatch(getProducts({
                    access: user.token,
                    filters: { page: currentPageProducts, search: debouncedSearchTerm, limit: itemsPerPage }
                }))
                .then((response) => {
                    // Use pagination info from backend response (if available) or calculate from total
                    const pagination = response.payload?.pagination
                    if (pagination) {
                        setTotalPagesProducts(pagination.totalPages || 0)
                    } else {
                        // Fallback to calculating from total items
                        const total = response.payload?.total || 0
                        setTotalPagesProducts(Math.ceil(total / itemsPerPage))
                    }
                })
                    .finally(() => setLoadingProducts(false))
            }
        }, [debouncedSearchTerm, currentPageProducts, showProductModal, user?.token])

        useEffect(() => {
            if (productsData) {
                setTotalPagesProducts(Math.ceil(productsData.data.total / itemsPerPage))
            }
        }, [
            productsData
        ])
        useEffect(() => {
            if (categoriesData) {
                setTotalPagesCategories(categoriesData.data.pagination.totalPages)
            }
        }, [
            categoriesData
        ])
        // Initial load when modal opens
        useEffect(() => {
            if (showProductModal && user?.token && !debouncedSearchTerm) {
                setLoadingProducts(true)
                dispatch(getProducts({
                    access: user.token,
                    filters: { page: 0, search: '', limit: 10 }
                }))
                    .finally(() => setLoadingProducts(false))
            }
        }, [showProductModal, user?.token])

    // Effect for category search and pagination
    useEffect(() => {
        if (showCategoryModal && user?.token) {
            setLoadingCategories(true)
            dispatch(getCategories({ 
                access: user.token, 
                filters: { page: currentPageCategories, search: debouncedSearchTermCategories, limit: itemsPerPage } 
            }))
                .then((response) => {
                    // Use pagination info from backend response
                    const pagination = response.payload?.pagination
                    if (pagination) {
                        setTotalPagesCategories(pagination.totalPages || 0)
                    } else {
                        // Fallback to calculating from total items
                        const total = response.payload?.total || 0
                        setTotalPagesCategories(Math.ceil(total / itemsPerPage))
                    }
                })
                .finally(() => setLoadingCategories(false))
        }
    }, [debouncedSearchTermCategories, currentPageCategories, showCategoryModal, user?.token])

        // Initial load when category modal opens
        useEffect(() => {
            if (showCategoryModal && user?.token && !debouncedSearchTermCategories) {
                setLoadingCategories(true)
                dispatch(getCategories({
                    access: user.token,
                    filters: { page: 0, search: '' }
                }))
                    .finally(() => setLoadingCategories(false))
            }
        }, [showCategoryModal, user?.token])

        // Effect for excluded products search and pagination
        useEffect(() => {
            if (showExcludedModal && user?.token) {
                setLoadingProducts(true)
                dispatch(getProducts({
                    access: user.token,
                    filters: { page: currentPageExcluded, search: debouncedSearchTermExcluded, limit: itemsPerPage }
                }))
                .then((response) => {
                    // Use pagination info from backend response (if available) or calculate from total
                    const pagination = response.payload?.pagination
                    if (pagination) {
                        setTotalPagesExcluded(pagination.totalPages || 0)
                    } else {
                        // Fallback to calculating from total items
                        const total = response.payload?.total || 0
                        setTotalPagesExcluded(Math.ceil(total / itemsPerPage))
                    }
                })
                    .finally(() => setLoadingProducts(false))
            }
        }, [debouncedSearchTermExcluded, currentPageExcluded, showExcludedModal, user?.token])

        // Initial load when excluded products modal opens
        useEffect(() => {
            if (showExcludedModal && user?.token && !debouncedSearchTermExcluded) {
                setLoadingProducts(true)
                dispatch(getProducts({
                    access: user.token,
                    filters: { page: 0, search: '', limit: 10 }
                }))
                    .finally(() => setLoadingProducts(false))
            }
        }, [showExcludedModal, user?.token])

        useEffect(() => {
            if (couponDetail) {
                setValue('code', couponDetail.code)
                setValue('name', couponDetail.name)
                setValue('description', couponDetail.description)
                setValue('type', couponDetail.type)
                setValue('value', couponDetail.value)
                setValue('minimumAmount', couponDetail.minimumAmount)
                setValue('maximumDiscount', couponDetail.maximumDiscount)
                setValue('usageLimit', couponDetail.usageLimit)
                setValue('validFrom', moment(couponDetail.validFrom))
                setValue('validUntil', moment(couponDetail.validUntil))
                setValue('firstTimeOnly', couponDetail.userRestrictions?.firstTimeOnly || false)
                setValue('maxUsesPerUser', couponDetail.userRestrictions?.maxUsesPerUser || 1)

                setSelectedProducts(couponDetail.applicableProducts || [])
                setSelectedCategories(couponDetail.applicableCategories || [])
                setExcludedProducts(couponDetail.excludedProducts || [])
                setSpecificUsers(couponDetail.userRestrictions?.specificUsers || [])
            }
        }, [couponDetail])
        
        // Use products directly from the service (already filtered and paginated by backend)
        console.log('categoriesData', categoriesData)
        const products = productsData?.products || []
        const categories = categoriesData ? categoriesData.data.categories : []

        console.log('🔵 AddCoupon: Using server-side paginated data:', {
            productsLength: products.length,
            categoriesLength: categories.length,
            totalPagesProducts,
            totalPagesCategories,
            totalPagesExcluded,
            note: 'Data comes pre-filtered and paginated from backend'
        })
        
        // Debug: Log detailed structure for categories
        console.log('🔵 AddCoupon: Categories debug:', {
            categoriesDataStructure: categoriesData,
            categoriesArray: categories,
            categoriesLength: categories.length,
            firstCategory: categories[0] || 'none',
            isCategoriesDataNull: categoriesData === null,
            isCategoriesDataUndefined: categoriesData === undefined
        })

        const handlePageChangeProducts = ({ selected }) => {
            setCurrentPageProducts(selected)
        }

        const handlePageChangeCategories = ({ selected }) => {
            setCurrentPageCategories(selected)
        }

        const handlePageChangeExcluded = ({ selected }) => {
            setCurrentPageExcluded(selected)
        }

        const handleAddProduct = (product) => {
            if (!selectedProducts.find(p => p._id === product._id)) {
                setSelectedProducts([...selectedProducts, product])
            }
            setShowProductModal(false)
        }

        const handleAddCategory = (category) => {
            if (!selectedCategories.find(c => c._id === category._id)) {
                setSelectedCategories([...selectedCategories, category])
            }
            setShowCategoryModal(false)
        }

        const handleAddExcludedProduct = (product) => {
            if (!excludedProducts.find(p => p._id === product._id)) {
                setExcludedProducts([...excludedProducts, product])
            }
            setShowExcludedModal(false)
        }

        const handleOpenProductModal = () => {
            setSearchTerm('')
            setCurrentPageProducts(0)
            setShowProductModal(true)
        }

        const handleOpenCategoryModal = () => {
            setSearchTermCategories('')
            setCurrentPageCategories(0)
            setShowCategoryModal(true)
        }

        const handleOpenExcludedModal = () => {
            setSearchTermExcluded('')
            setCurrentPageExcluded(0)
            setShowExcludedModal(true)
        }

        const handleRemoveProduct = (productId) => {
            setSelectedProducts(selectedProducts.filter(p => p._id !== productId))
        }

        const handleRemoveCategory = (categoryId) => {
            setSelectedCategories(selectedCategories.filter(c => c._id !== categoryId))
        }

        const handleRemoveExcludedProduct = (productId) => {
            setExcludedProducts(excludedProducts.filter(p => p._id !== productId))
        }

        const onSubmit = async (data) => {
            try {
                setLoadingSubmit(true)

                const couponData = {
                    ...data,
                    validFrom: data.validFrom.toISOString(),
                    validUntil: data.validUntil.toISOString(),
                    applicableProducts: selectedProducts.map(p => p._id),
                    applicableCategories: selectedCategories.map(c => c._id),
                    excludedProducts: excludedProducts.map(p => p._id),
                    userRestrictions: {
                        firstTimeOnly: data.firstTimeOnly,
                        specificUsers: specificUsers,
                        maxUsesPerUser: data.maxUsesPerUser
                    }
                }

                // Validate coupon data
                const validation = validateCouponData(couponData)
                if (!validation.isValid) {
                    console.log('Validation errors:', validation.errors)
                    // You could show these errors to the user
                    return
                }

                if (id) {
                    await dispatch(updateCoupon({ data: couponData, id }))
                } else {
                    await dispatch(addCoupon(couponData))
                }

                history.push('/admin/coupons')
            } catch (error) {
                console.log('Error submitting coupon:', error)
            } finally {
                setLoadingSubmit(false)
            }
        }

        console.log('🔵 AddCoupon: About to check loadingCouponDetail', { loadingCouponDetail, id })

        if (loadingCouponDetail && id) {
            console.log('🔵 AddCoupon: Showing loading spinner')
            return (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                    <CircularProgress />
                </div>
            )
        }

        console.log('🔵 AddCoupon: About to render main component')

        return (
            <MuiPickersUtilsProvider utils={MomentUtils}>
                <div style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                        <Button
                            color="primary"
                            variant="contained"
                            onClick={() => history.goBack()}
                            style={{ marginRight: '1rem' }}
                        >
                            <ArrowBackIcon />
                        </Button>
                        <h2>{id ? 'Editar Cupón' : 'Agregar Cupón'}</h2>
                    </div>

                    <Card>
                        <CardBody>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                {/* Basic Information */}
                                <div className={classes.formSection}>
                                    <h3 className={classes.sectionTitle}>Información Básica</h3>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <Controller
                                                name="code"
                                                control={control}
                                                render={({ field }) => (
                                                    <TextInput
                                                        {...field}
                                                        label="Código del cupón"
                                                        error={errors.code}
                                                        helperText="Código único que los clientes usarán"
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Controller
                                                name="name"
                                                control={control}
                                                render={({ field }) => (
                                                    <TextInput
                                                        {...field}
                                                        label="Nombre del cupón"
                                                        error={errors.name}
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Controller
                                                name="description"
                                                control={control}
                                                render={({ field }) => (
                                                    <TextField
                                                        {...field}
                                                        label="Descripción"
                                                        multiline
                                                        rows={3}
                                                        fullWidth
                                                        variant="outlined"
                                                    />
                                                )}
                                            />
                                        </Grid>
                                    </Grid>
                                </div>

                                {/* Discount Configuration */}
                                <div className={classes.formSection}>
                                    <h3 className={classes.sectionTitle}>Configuración del Descuento</h3>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={4}>
                                            <Controller
                                                name="type"
                                                control={control}
                                                render={({ field }) => (
                                                    <FormControl fullWidth variant="outlined">
                                                        <InputLabel>Tipo de descuento</InputLabel>
                                                        <Select {...field} label="Tipo de descuento">
                                                            <MenuItem value={COUPON_TYPES.PERCENTAGE}>Porcentaje</MenuItem>
                                                            <MenuItem value={COUPON_TYPES.FIXED}>Monto fijo</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <Controller
                                                name="value"
                                                control={control}
                                                render={({ field }) => (
                                                    <TextInput
                                                        {...field}
                                                        type="number"
                                                        label={watchedType === COUPON_TYPES.PERCENTAGE ? 'Porcentaje (%)' : 'Monto ($)'}
                                                        error={errors.value}
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <Controller
                                                name="minimumAmount"
                                                control={control}
                                                render={({ field }) => (
                                                    <TextInput
                                                        {...field}
                                                        type="number"
                                                        label="Monto mínimo"
                                                        error={errors.minimumAmount}
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        {watchedType === COUPON_TYPES.PERCENTAGE && (
                                            <Grid item xs={12} md={6}>
                                                <Controller
                                                    name="maximumDiscount"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <TextInput
                                                            {...field}
                                                            type="number"
                                                            label="Descuento máximo ($)"
                                                            error={errors.maximumDiscount}
                                                        />
                                                    )}
                                                />
                                            </Grid>
                                        )}
                                        <Grid item xs={12} md={6}>
                                            <Controller
                                                name="usageLimit"
                                                control={control}
                                                render={({ field }) => (
                                                    <TextInput
                                                        {...field}
                                                        type="number"
                                                        label="Límite de uso total"
                                                        error={errors.usageLimit}
                                                    />
                                                )}
                                            />
                                        </Grid>
                                    </Grid>
                                </div>

                                {/* Validity Period */}
                                <div className={classes.formSection}>
                                    <h3 className={classes.sectionTitle}>Período de Validez</h3>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <Controller
                                                name="validFrom"
                                                control={control}
                                                render={({ field }) => (
                                                    <DatePicker
                                                        {...field}
                                                        label="Fecha de inicio"
                                                        inputVariant="outlined"
                                                        fullWidth
                                                        format="DD/MM/YYYY"
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Controller
                                                name="validUntil"
                                                control={control}
                                                render={({ field }) => (
                                                    <DatePicker
                                                        {...field}
                                                        label="Fecha de finalización"
                                                        inputVariant="outlined"
                                                        fullWidth
                                                        format="DD/MM/YYYY"
                                                    />
                                                )}
                                            />
                                        </Grid>
                                    </Grid>
                                </div>

                                {/* Applicable Products */}
                                <div className={classes.formSection}>
                                    <h3 className={classes.sectionTitle}>Productos Aplicables</h3>
                                    <Button
                                        color="primary"
                                        variant="contained"
                                        onClick={handleOpenProductModal}
                                        style={{ marginBottom: '1rem' }}
                                    >
                                        <Add /> Agregar Productos
                                    </Button>
                                    <div className={classes.chipContainer}>
                                        {selectedProducts.map(product => (
                                            <Chip
                                                key={product._id}
                                                label={product.name}
                                                onDelete={() => handleRemoveProduct(product._id)}
                                                className={classes.chip}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Applicable Categories */}
                                <div className={classes.formSection}>
                                    <h3 className={classes.sectionTitle}>Categorías Aplicables</h3>
                                    <Button
                                        color="primary"
                                        variant="contained"
                                        onClick={handleOpenCategoryModal}
                                        style={{ marginBottom: '1rem' }}
                                    >
                                        <Add /> Agregar Categorías
                                    </Button>
                                    <div className={classes.chipContainer}>
                                        {selectedCategories.map(category => (
                                            <Chip
                                                key={category._id}
                                                label={category.name}
                                                onDelete={() => handleRemoveCategory(category._id)}
                                                className={classes.chip}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Excluded Products */}
                                <div className={classes.formSection}>
                                    <h3 className={classes.sectionTitle}>Productos Excluidos</h3>
                                    <Button
                                        color="secondary"
                                        variant="contained"
                                        onClick={handleOpenExcludedModal}
                                        style={{ marginBottom: '1rem' }}
                                    >
                                        <Add /> Agregar Productos Excluidos
                                    </Button>
                                    <div className={classes.chipContainer}>
                                        {excludedProducts.map(product => (
                                            <Chip
                                                key={product._id}
                                                label={product.name}
                                                onDelete={() => handleRemoveExcludedProduct(product._id)}
                                                style={{ backgroundColor: '#ffebee', color: '#d32f2f' }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* User Restrictions */}
                                <div className={classes.formSection}>
                                    <h3 className={classes.sectionTitle}>Restricciones de Usuario</h3>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <Controller
                                                name="firstTimeOnly"
                                                control={control}
                                                render={({ field }) => (
                                                    <FormControlLabel
                                                        control={<Checkbox {...field} checked={field.value} />}
                                                        label="Solo para nuevos usuarios"
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Controller
                                                name="maxUsesPerUser"
                                                control={control}
                                                render={({ field }) => (
                                                    <TextInput
                                                        {...field}
                                                        type="number"
                                                        label="Máximo usos por usuario"
                                                        error={errors.maxUsesPerUser}
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <h4>Usuarios específicos (IDs separados por comas)</h4>
                                            <TextField
                                                value={specificUsers.join(', ')}
                                                onChange={(e) => setSpecificUsers(e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                                                multiline
                                                rows={3}
                                                fullWidth
                                                variant="outlined"
                                                placeholder="user_id_1, user_id_2, user_id_3"
                                            />
                                        </Grid>
                                    </Grid>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                                    <Button
                                        color="secondary"
                                        variant="contained"
                                        onClick={() => history.goBack()}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        color="primary"
                                        variant="contained"
                                        type="submit"
                                        isLoading={loadingSubmit}
                                    >
                                        {id ? 'Actualizar Cupón' : 'Crear Cupón'}
                                    </Button>
                                </div>
                            </form>
                        </CardBody>
                    </Card>

                    {/* Product Selection Modal */}
                    <Dialog open={showProductModal} onClose={() => setShowProductModal(false)} maxWidth="md" fullWidth>
                        <div className={classes.modalBody}>
                            <h3>Seleccionar Productos</h3>
                            <TextField
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                label="Buscar productos"
                                fullWidth
                                style={{ marginBottom: '1rem' }}
                            />
                            {loadingProducts ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                                    <CircularProgress />
                                </div>
                        ) : products && products.length > 0 ? (
                            <Table
                                tableHeaderColor="primary"
                                tableHead={['Nombre', 'Precio', 'Acción']}
                                tableData={products.map(product => [
                                    product.name,
                                    `$${product.price?.toLocaleString() || '0'}`,
                                    <Button
                                        key={product._id}
                                        color="primary"
                                        size="sm"
                                        onClick={() => handleAddProduct(product)}
                                    >
                                        Agregar
                                    </Button>
                                ])}
                            />
                        ) : (
                            <EmptyTablePlaceholder title="No hay productos disponibles" />
                        )}

                            <ReactPaginate
                                previousLabel={<ChevronLeftIcon />}
                                nextLabel={<ChevronRightIcon />}
                                pageCount={totalPagesProducts}
                                onPageChange={handlePageChangeProducts}
                                forcePage={currentPageProducts}
                                containerClassName={classes.pagination}
                                pageClassName={classes.page}
                                activeClassName={classes.activePage}
                            />
                        </div>
                    </Dialog>

                    {/* Category Selection Modal */}
                    <Dialog open={showCategoryModal} onClose={() => setShowCategoryModal(false)} maxWidth="md" fullWidth>
                        <div className={classes.modalBody}>
                            <h3>Seleccionar Categorías</h3>
                            <TextField
                                value={searchTermCategories}
                                onChange={(e) => setSearchTermCategories(e.target.value)}
                                label="Buscar categorías"
                                fullWidth
                                style={{ marginBottom: '1rem' }}
                            />
                            {loadingCategories ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                                    <CircularProgress />
                                </div>
                        ) : categories && categories.length > 0 ? (
                            <Table
                                tableHeaderColor="primary"
                                tableHead={['Nombre', 'Acción']}
                                tableData={categories.map(category => [
                                    category.name,
                                    <Button
                                        key={category._id}
                                        color="primary"
                                        size="sm"
                                        onClick={() => handleAddCategory(category)}
                                    >
                                        Agregar
                                    </Button>
                                ])}
                            />
                        ) : (
                            <EmptyTablePlaceholder title="No hay categorías disponibles" />
                        )}

                            <ReactPaginate
                                previousLabel={<ChevronLeftIcon />}
                                nextLabel={<ChevronRightIcon />}
                                pageCount={totalPagesCategories}
                                onPageChange={handlePageChangeCategories}
                                forcePage={currentPageCategories}
                                containerClassName={classes.pagination}
                                pageClassName={classes.page}
                                activeClassName={classes.activePage}
                            />
                        </div>
                    </Dialog>

                    {/* Excluded Product Selection Modal */}
                    <Dialog open={showExcludedModal} onClose={() => setShowExcludedModal(false)} maxWidth="md" fullWidth>
                        <div className={classes.modalBody}>
                            <h3>Seleccionar Productos Excluidos</h3>
                            <TextField
                                value={searchTermExcluded}
                                onChange={(e) => setSearchTermExcluded(e.target.value)}
                                label="Buscar productos"
                                fullWidth
                                style={{ marginBottom: '1rem' }}
                            />
                            {loadingProducts ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                                    <CircularProgress />
                                </div>
                        ) : products && products.length > 0 ? (
                            <Table
                                tableHeaderColor="primary"
                                tableHead={['Nombre', 'Precio', 'Acción']}
                                tableData={products.map(product => [
                                    product.name,
                                    `$${product.price?.toLocaleString() || '0'}`,
                                    <Button
                                        key={product._id}
                                        color="secondary"
                                        size="sm"
                                        onClick={() => handleAddExcludedProduct(product)}
                                    >
                                        Excluir
                                    </Button>
                                ])}
                            />
                        ) : (
                            <EmptyTablePlaceholder title="No hay productos disponibles" />
                        )}
                            {totalPagesExcluded > 1 && (
                                <ReactPaginate
                                    previousLabel={<ChevronLeftIcon />}
                                    nextLabel={<ChevronRightIcon />}
                                    pageCount={totalPagesExcluded}
                                    onPageChange={handlePageChangeExcluded}
                                    forcePage={currentPageExcluded}
                                    containerClassName={classes.pagination}
                                    pageClassName={classes.page}
                                    activeClassName={classes.activePage}
                                />
                            )}
                        </div>
                    </Dialog>
                </div>
            </MuiPickersUtilsProvider>
        )
    } catch (error) {
        console.error('🔴 AddCoupon: Error in component', error)
        return (
            <div style={{ padding: '2rem', color: 'red' }}>
                <h2>Error en AddCoupon</h2>
                <p>{error.message}</p>
                <pre>{error.stack}</pre>
            </div>
        )
    }
}
