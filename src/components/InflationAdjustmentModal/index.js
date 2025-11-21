import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
    Box,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    makeStyles,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Tabs,
    Tab,
    Tooltip,
} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import Table from 'components/Table/Table.js'
import Button from 'components/CustomButtons/Button.js'
import TextInput from 'components/TextInput/Index'
import ReactPaginate from 'react-paginate'
import { finalPrice, formatNumber } from '../../helpers/product'
import { getProducts as getProductsRequest } from '../../api/products'
import { applyInflationAdjustment, resetInflationAdjustmentState } from '../../store/products'

const inflationSchema = yup.object({
    inflationPercentage: yup
        .number()
        .typeError('Debe ser un número')
        .required('El porcentaje es requerido')
        .min(0, 'El porcentaje debe ser mayor o igual a 0')
        .max(100, 'El porcentaje debe ser menor o igual a 100'),
    search: yup.string(),
})

const useStyles = makeStyles((theme) => ({
    dialogPaper: {
        width: '100%',
        maxWidth: '90vw',
        maxHeight: '90vh',
        overflow: 'auto',
    },
    modalBody: {
        padding: theme.spacing(2),
        overflow: 'auto',
        width: '100%',
        boxSizing: 'border-box',
    },
    modalTitle: {
        margin: 0,
    },
    tabsContainer: {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(3),
    },
    accordionWrapper: {
        marginTop: theme.spacing(2),
    },
    filterWrapper: {
        marginTop: theme.spacing(2),
        display: 'flex',
        gap: theme.spacing(2),
    },
    table: {
        maxHeight: 300,
        overflow: 'auto',
    },
    pagination: {
        display: 'flex',
        margin: 0,
        padding: 0,
        listStyle: 'none',
        gap: theme.spacing(2),
        marginTop: theme.spacing(2),
        justifyContent: 'center',
        alignItems: 'center',
    },
    page: {
        padding: theme.spacing(0.5),
        borderRadius: 4,
        border: 'solid 1px transparent',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: 25,
        height: 25,
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
    disabledButton: {
        backgroundColor: '#9e9e9e !important',
        color: '#fff !important',
        cursor: 'not-allowed !important',
        opacity: 0.6,
    },
    dialogActionsContainer: {
        width: '100%',
    },
    percentageInputWrapper: {
        marginBottom: theme.spacing(3),
    },
    actionsContainer: {
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: theme.spacing(2),
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: theme.spacing(4),
    },
    fullWidthContainer: {
        width: '100%',
    },
}))

const InflationAdjustmentModal = ({
    open,
    onClose,
    onSuccess,
}) => {
    const classes = useStyles()
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const { loadingInflationAdjustment, inflationAdjustmentSuccess, inflationAdjustmentError } = useSelector(
        (state) => state.products
    )

    // Estados locales
    const [inflationTab, setInflationTab] = useState(0)
    const [includedProducts, setIncludedProducts] = useState([])
    const [excludedProducts, setExcludedProducts] = useState([])
    const [includePage, setIncludePage] = useState(0)
    const [excludePage, setExcludePage] = useState(0)
    const [productsData, setProductsData] = useState(null)
    const [loadingProductsData, setLoadingProductsData] = useState(false)
    const [showSuccessDialog, setShowSuccessDialog] = useState(false)
    const [showErrorDialog, setShowErrorDialog] = useState(false)

    // Formulario
    const {
        control: inflationControl,
        handleSubmit: handleInflationSubmit,
        watch: watchInflation,
        reset: resetInflation,
    } = useForm({
        resolver: yupResolver(inflationSchema),
        defaultValues: {
            search: '',
            inflationPercentage: '',
        },
    })

    const watchInflationSearch = watchInflation('search')
    const watchInflationPercentage = watchInflation('inflationPercentage')

    // Funciones de inclusión/exclusión
    const toggleProductInclusion = (product) => {
        const isIncluded = includedProducts.find((p) => p._id === product._id)
        const isExcluded = excludedProducts.find((p) => p._id === product._id)

        if (isIncluded) {
            setIncludedProducts((prev) =>
                prev.filter((p) => p._id !== product._id)
            )
        } else {
            setIncludedProducts((prev) => [...prev, product])
            if (isExcluded) {
                setExcludedProducts((prev) =>
                    prev.filter((p) => p._id !== product._id)
                )
            }
        }
    }

    const toggleProductExclusion = (product) => {
        const isIncluded = includedProducts.find((p) => p._id === product._id)
        const isExcluded = excludedProducts.find((p) => p._id === product._id)

        if (isExcluded) {
            setExcludedProducts((prev) =>
                prev.filter((p) => p._id !== product._id)
            )
        } else {
            setExcludedProducts((prev) => [...prev, product])
            if (isIncluded) {
                setIncludedProducts((prev) =>
                    prev.filter((p) => p._id !== product._id)
                )
            }
        }
    }

    const checkProductIncluded = (productId) => {
        return includedProducts.find((p) => p._id === productId)
    }

    const checkProductExcluded = (productId) => {
        return excludedProducts.find((p) => p._id === productId)
    }

    // Effect para fetch cuando cambia la página o el search del tab activo
    useEffect(() => {
        if (!open) return

        const fetchProducts = async () => {
            setLoadingProductsData(true)
            try {
                const currentPage = inflationTab === 0 ? includePage : excludePage
                const params = {
                    access: user.token,
                    filters: {
                        page: currentPage,
                    },
                }
                if (watchInflationSearch) {
                    params.filters.search = watchInflationSearch
                }
                const response = await getProductsRequest(params.access, params.filters)
                setProductsData({
                    data: response.data.data,
                    pageInfo: response.data.data.pageInfo,
                })
            } catch (error) {
                console.error('Error fetching products:', error)
            } finally {
                setLoadingProductsData(false)
            }
        }

        fetchProducts()
    }, [includePage, excludePage, open, watchInflationSearch, inflationTab, user.token])

    // Handlers de paginación
    const handleIncludePageClick = ({ selected }) => {
        setIncludePage(selected)
    }

    const handleExcludePageClick = ({ selected }) => {
        setExcludePage(selected)
    }

    // Handler para aplicar ajuste inflacionario
    const handleApplyInflation = async (data) => {
        try {
            const requestData = {
                percentage: parseFloat(data.inflationPercentage),
            }

            if (includedProducts.length > 0) {
                requestData.includeProductIds = includedProducts.map((p) => p._id)
            }

            if (excludedProducts.length > 0) {
                requestData.excludeProductIds = excludedProducts.map((p) => p._id)
            }

            await dispatch(
                applyInflationAdjustment({
                    access: user.token,
                    data: requestData,
                })
            ).unwrap()
        } catch (error) {
            // Error manejado por el slice
        }
    }

    // Effect para manejar éxito/error del ajuste
    useEffect(() => {
        if (inflationAdjustmentSuccess) {
            setShowSuccessDialog(true)
            handleClose()
            if (onSuccess) {
                onSuccess()
            }
            dispatch(resetInflationAdjustmentState())
        }
    }, [inflationAdjustmentSuccess, dispatch, onSuccess])

    useEffect(() => {
        if (inflationAdjustmentError) {
            setShowErrorDialog(true)
            dispatch(resetInflationAdjustmentState())
        }
    }, [inflationAdjustmentError, dispatch])

    // Reset cuando se cierra el modal
    const handleClose = () => {
        setIncludedProducts([])
        setExcludedProducts([])
        resetInflation()
        setIncludePage(0)
        setExcludePage(0)
        setInflationTab(0)
        setProductsData(null)
        onClose()
    }

    // Reset page cuando cambia el search
    const handleSearchChange = (value, isIncludeTab) => {
        if (isIncludeTab) {
            setIncludePage(0)
        } else {
            setExcludePage(0)
        }
    }

    return (
        <>
            <Dialog
                PaperProps={{
                    className: classes.dialogPaper,
                }}
                open={open}
                onClose={handleClose}
            >
                <Box className={classes.modalBody}>
                    <Box mb={4}>
                        <h5 className={classes.modalTitle}>
                            Aplicar ajuste inflacionario
                        </h5>
                    </Box>
                    <Box className={classes.tabsContainer}>
                        <Tabs
                            value={inflationTab}
                            onChange={(event, newValue) => setInflationTab(newValue)}
                            indicatorColor="primary"
                            textColor="primary"
                        >
                            <Tab label={`Incluir productos (${includedProducts.length})`} />
                            <Tab label={`Excluir productos (${excludedProducts.length})`} />
                        </Tabs>
                        <Box mt={2}>
                            {inflationTab === 0 && (
                                <Box>
                                    <Accordion className={classes.accordionWrapper}>
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            aria-controls="include-products-content"
                                            id="include-products-header"
                                        >
                                            <p>Buscar productos para incluir</p>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Box className={classes.fullWidthContainer}>
                                                <Box className={classes.filterWrapper}>
                                                    <Box>
                                                        <Controller
                                                            name="search"
                                                            control={inflationControl}
                                                            render={({ field, fieldState }) => (
                                                                <TextInput
                                                                    error={
                                                                        fieldState.error
                                                                            ? true
                                                                            : false
                                                                    }
                                                                    errorMessage={fieldState.error}
                                                                    icon={null}
                                                                    label={'Nombre del producto'}
                                                                    value={field.value}
                                                                    onChange={({ target }) => {
                                                                        field.onChange(target.value)
                                                                        handleSearchChange(target.value, true)
                                                                    }}
                                                                />
                                                            )}
                                                        />
                                                    </Box>
                                                </Box>
                                                {loadingProductsData ? (
                                                    <Box className={classes.loadingContainer}>
                                                        <CircularProgress />
                                                    </Box>
                                                ) : (
                                                    <Box className={classes.table}>
                                                        <Table
                                                            styles={{
                                                                tableWrapper: {
                                                                    overflowX: 'hidden',
                                                                    width: 'fit-content',
                                                                },
                                                            }}
                                                            tableHeaderColor="primary"
                                                            tableHead={[
                                                                'id',
                                                                'Nombre',
                                                                'Categoría',
                                                                'Precio',
                                                                'Descuento',
                                                                'Precio final',
                                                                'Estatus',
                                                                'Acción',
                                                            ]}
                                                            tableData={productsData?.data?.products?.map(
                                                                (e) => {
                                                                    const isIncluded = checkProductIncluded(e._id)
                                                                    const isExcluded = checkProductExcluded(e._id)
                                                                    return [
                                                                        e._id,
                                                                        e.name,
                                                                        e.categoryDetail[0]?.name ??
                                                                        'N/A',
                                                                        `$${formatNumber(
                                                                            e.price.toFixed(1)
                                                                        )}`,
                                                                        e.discount
                                                                            ? `${e.discount}%`
                                                                            : '0%',
                                                                        `$${formatNumber(
                                                                            finalPrice(
                                                                                e.price,
                                                                                (e.discount ?? 0) + (e.offerDiscount ?? 0)
                                                                            )
                                                                        )}`,
                                                                        e.status
                                                                            ? e.status.available
                                                                                ? 'Disponible'
                                                                                : 'No disponible'
                                                                            : 'Sin información',
                                                                        isExcluded ? (
                                                                            <Tooltip
                                                                                title="Este producto está excluido del ajuste. Para incluirlo, ve al tab 'Excluir productos' y quítalo de la lista de excluidos."
                                                                                arrow
                                                                            >
                                                                                <span>
                                                                                    <Button
                                                                                        type="button"
                                                                                        color="default"
                                                                                        key={e._id}
                                                                                        disabled
                                                                                        className={classes.disabledButton}
                                                                                    >
                                                                                        Producto excluido del ajuste
                                                                                    </Button>
                                                                                </span>
                                                                            </Tooltip>
                                                                        ) : (
                                                                            <Button
                                                                                type="button"
                                                                                color={isIncluded ? "success" : "primary"}
                                                                                key={e._id}
                                                                                onClick={() =>
                                                                                    toggleProductInclusion(e)
                                                                                }
                                                                            >
                                                                                {isIncluded ? 'Incluido' : 'Incluir'}
                                                                            </Button>
                                                                        ),
                                                                    ]
                                                                }
                                                            ) || []}
                                                        />

                                                        <ReactPaginate
                                                            forcePage={includePage}
                                                            pageClassName={classes.page}
                                                            containerClassName={classes.pagination}
                                                            activeClassName={classes.activePage}
                                                            breakLabel="..."
                                                            nextLabel={
                                                                <Button
                                                                    isLoading={false}
                                                                    variant="contained"
                                                                    color="primary"
                                                                    type="button"
                                                                    justIcon
                                                                >
                                                                    <ChevronRightIcon />
                                                                </Button>
                                                            }
                                                            onPageChange={handleIncludePageClick}
                                                            pageRangeDisplayed={5}
                                                            pageCount={Math.ceil(
                                                                productsData?.data?.total / 10 || 0
                                                            )}
                                                            previousLabel={
                                                                <Button
                                                                    isLoading={false}
                                                                    variant="contained"
                                                                    color="primary"
                                                                    type="button"
                                                                    justIcon
                                                                >
                                                                    <ChevronLeftIcon />
                                                                </Button>
                                                            }
                                                            renderOnZeroPageCount={null}
                                                        />
                                                    </Box>
                                                )}
                                            </Box>
                                        </AccordionDetails>
                                    </Accordion>
                                </Box>
                            )}
                            {inflationTab === 1 && (
                                <Box>
                                    <Accordion className={classes.accordionWrapper}>
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            aria-controls="exclude-products-content"
                                            id="exclude-products-header"
                                        >
                                            <p>Buscar productos para excluir</p>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Box className={classes.fullWidthContainer}>
                                                <Box className={classes.filterWrapper}>
                                                    <Box>
                                                        <Controller
                                                            name="search"
                                                            control={inflationControl}
                                                            render={({ field, fieldState }) => (
                                                                <TextInput
                                                                    error={
                                                                        fieldState.error
                                                                            ? true
                                                                            : false
                                                                    }
                                                                    errorMessage={fieldState.error}
                                                                    icon={null}
                                                                    label={'Nombre del producto'}
                                                                    value={field.value}
                                                                    onChange={({ target }) => {
                                                                        field.onChange(target.value)
                                                                        handleSearchChange(target.value, false)
                                                                    }}
                                                                />
                                                            )}
                                                        />
                                                    </Box>
                                                </Box>
                                                {loadingProductsData ? (
                                                    <Box className={classes.loadingContainer}>
                                                        <CircularProgress />
                                                    </Box>
                                                ) : (
                                                    <Box className={classes.table}>
                                                        <Table
                                                            styles={{
                                                                tableWrapper: {
                                                                    overflowX: 'hidden',
                                                                    width: 'fit-content',
                                                                },
                                                            }}
                                                            tableHeaderColor="primary"
                                                            tableHead={[
                                                                'id',
                                                                'Nombre',
                                                                'Categoría',
                                                                'Precio',
                                                                'Descuento',
                                                                'Precio final',
                                                                'Estatus',
                                                                'Acción',
                                                            ]}
                                                            tableData={productsData?.data?.products?.map(
                                                                (e) => {
                                                                    const isIncluded = checkProductIncluded(e._id)
                                                                    const isExcluded = checkProductExcluded(e._id)
                                                                    return [
                                                                        e._id,
                                                                        e.name,
                                                                        e.categoryDetail[0]?.name ??
                                                                        'N/A',
                                                                        `$${formatNumber(
                                                                            e.price.toFixed(1)
                                                                        )}`,
                                                                        e.discount
                                                                            ? `${e.discount}%`
                                                                            : '0%',
                                                                        `$${formatNumber(
                                                                            finalPrice(
                                                                                e.price,
                                                                                (e.discount ?? 0) + (e.offerDiscount ?? 0)
                                                                            )
                                                                        )}`,
                                                                        e.status
                                                                            ? e.status.available
                                                                                ? 'Disponible'
                                                                                : 'No disponible'
                                                                            : 'Sin información',
                                                                        isIncluded ? (
                                                                            <Tooltip
                                                                                title="Este producto está incluido en el ajuste. Para excluirlo, ve al tab 'Incluir productos' y quítalo de la lista de incluidos."
                                                                                arrow
                                                                            >
                                                                                <span>
                                                                                    <Button
                                                                                        type="button"
                                                                                        color="default"
                                                                                        key={e._id}
                                                                                        disabled
                                                                                        className={classes.disabledButton}
                                                                                    >
                                                                                        Producto incluido en el ajuste
                                                                                    </Button>
                                                                                </span>
                                                                            </Tooltip>
                                                                        ) : (
                                                                            <Button
                                                                                type="button"
                                                                                color={isExcluded ? "danger" : "primary"}
                                                                                key={e._id}
                                                                                onClick={() =>
                                                                                    toggleProductExclusion(e)
                                                                                }
                                                                            >
                                                                                {isExcluded ? 'Excluido' : 'Excluir'}
                                                                            </Button>
                                                                        ),
                                                                    ]
                                                                }
                                                            ) || []}
                                                        />

                                                        <ReactPaginate
                                                            forcePage={excludePage}
                                                            pageClassName={classes.page}
                                                            containerClassName={classes.pagination}
                                                            activeClassName={classes.activePage}
                                                            breakLabel="..."
                                                            nextLabel={
                                                                <Button
                                                                    isLoading={false}
                                                                    variant="contained"
                                                                    color="primary"
                                                                    type="button"
                                                                    justIcon
                                                                >
                                                                    <ChevronRightIcon />
                                                                </Button>
                                                            }
                                                            onPageChange={handleExcludePageClick}
                                                            pageRangeDisplayed={5}
                                                            pageCount={Math.ceil(
                                                                productsData?.data?.total / 10 || 0
                                                            )}
                                                            previousLabel={
                                                                <Button
                                                                    isLoading={false}
                                                                    variant="contained"
                                                                    color="primary"
                                                                    type="button"
                                                                    justIcon
                                                                >
                                                                    <ChevronLeftIcon />
                                                                </Button>
                                                            }
                                                            renderOnZeroPageCount={null}
                                                        />
                                                    </Box>
                                                )}
                                            </Box>
                                        </AccordionDetails>
                                    </Accordion>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>
                <DialogActions>
                    <div className={classes.dialogActionsContainer}>
                        <Box className={classes.percentageInputWrapper}>
                            <Controller
                                name="inflationPercentage"
                                control={inflationControl}
                                render={({ field, fieldState }) => (
                                    <TextInput
                                        error={
                                            fieldState.error
                                                ? true
                                                : false
                                        }
                                        errorMessage={
                                            fieldState.error?.message
                                        }
                                        icon={null}
                                        label={'Porcentaje inflacionario (%)'}
                                        value={field.value}
                                        onChange={({ target }) => {
                                            field.onChange(target.value)
                                        }}
                                        type="number"
                                    />
                                )}
                            />
                        </Box>
                        <div className={classes.actionsContainer}>
                            <Button
                                color="primary"
                                type="button"
                                onClick={handleClose}
                            >
                                Cancelar
                            </Button>
                            <Box>
                                <Button
                                    type="button"
                                    onClick={handleInflationSubmit(handleApplyInflation)}
                                    color="primary"
                                    variant="contained"
                                    isLoading={loadingInflationAdjustment}
                                    disabled={!watchInflationPercentage}
                                >
                                    Aplicar ajuste
                                </Button>
                            </Box>
                        </div>
                    </div>
                </DialogActions>
            </Dialog>

            {/* Success Dialog */}
            <Dialog open={showSuccessDialog} onClose={() => {
                setShowSuccessDialog(false)
            }}>
                <DialogTitle>¡Éxito!</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Ajuste inflacionario aplicado correctamente.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setShowSuccessDialog(false)
                        }}
                        color="primary"
                        variant="contained"
                    >
                        Aceptar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Error Dialog */}
            <Dialog open={showErrorDialog} onClose={() => {
                setShowErrorDialog(false)
            }}>
                <DialogTitle>Error</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {inflationAdjustmentError?.message || 'Error al aplicar el ajuste inflacionario. Por favor, intenta nuevamente.'}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setShowErrorDialog(false)
                        }}
                        color="primary"
                        variant="contained"
                    >
                        Aceptar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

InflationAdjustmentModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSuccess: PropTypes.func,
}

export default InflationAdjustmentModal
