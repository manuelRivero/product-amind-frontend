import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import GridItem from 'components/Grid/GridItem.js'
import GridContainer from 'components/Grid/GridContainer.js'
import Table from 'components/Table/Table.js'
import Card from 'components/Card/Card.js'
import CardHeader from 'components/Card/CardHeader.js'
import CardBody from 'components/Card/CardBody.js'
import { Box, CircularProgress, IconButton, TextField } from '@material-ui/core'
import { Search } from '@material-ui/icons'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import Button from 'components/CustomButtons/Button'
import ReactPaginate from 'react-paginate'
import EmptyTablePlaceholder from '../../EmptyTablePlaceholder'
import { formatNumber } from '../../../helpers/product'
import { useDispatch, useSelector } from 'react-redux'
import { getProductsWithoutStock } from '../../../store/products'

const MIN_STOCK = 5
const styles = {
    cardCategoryWhite: {
        '&,& a,& a:hover,& a:focus': {
            color: 'rgba(255,255,255,.62)',
            margin: '0',
            fontSize: '14px',
            marginTop: '0',
            marginBottom: '0',
        },
        '& a,& a:hover,& a:focus': {
            color: '#FFFFFF',
        },
    },
    cardTitleWhite: {
        color: '#FFFFFF',
        marginTop: '0px',
        minHeight: 'auto',
        fontWeight: '300',
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        marginBottom: '3px',
        textDecoration: 'none',
        '& small': {
            color: '#777',
            fontSize: '65%',
            fontWeight: '400',
            lineHeight: '1',
        },
    },
    searchWrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1rem',
    },
    stockInput: {
        flex: '0 0 200px',
    },
    errorMessage: {
        color: '#f44336',
        marginTop: '0.5rem',
        fontSize: '0.875rem',
    },
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
}

const useStyles = makeStyles(styles)

export default function StockAlerts() {
    const classes = useStyles()
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)

    const [stockAlertsData, setStockAlertsData] = useState(null)
    const [loadingStockAlerts, setLoadingStockAlerts] = useState(false)
    const [error, setError] = useState(null)
    const [page, setPage] = useState(0)
    const [stockInput, setStockInput] = useState('0')
    const [stock, setStock] = useState(0)

    const validateNumberInput = (value) => {
        // Solo permite números (incluyendo 0)
        return /^\d*$/.test(value)
    }

    const handleStockInputChange = (e) => {
        const value = e.target.value
        if (validateNumberInput(value)) {
            setStockInput(value)
            setError(null)
        }
    }

    const handleSearch = () => {
        const stockValue = stockInput === '' ? 0 : parseInt(stockInput, 10)
        if (isNaN(stockValue) || stockValue < 0) {
            setError('Por favor ingrese un número válido')
            return
        }
        setStock(stockValue)
        setPage(0) // Resetear a la primera página al buscar
        setError(null)
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleSearch()
        }
    }

    const getStockAlerts = useCallback(async () => {
        if (!user?.token) return
        
        setLoadingStockAlerts(true)
        setError(null)
        try {
            const response = await dispatch(
                getProductsWithoutStock({
                    access: user.token,
                    params: {
                        page,
                        limit: 10,
                        stock,
                    },
                })
            ).unwrap()

            if (response.data) {
                setStockAlertsData({
                    alerts: response.data.alerts || [],
                    pagination: response.data.pagination || {},
                })
            } else {
                // Fallback en caso de estructura diferente
                setStockAlertsData({
                    alerts: response.alerts || [],
                    pagination: response.pagination || {},
                })
            }
        } catch (error) {
            console.error('Error fetching stock alerts:', error)
            setError('Error al cargar las alertas de stock. Por favor, intente nuevamente.')
            setStockAlertsData({ alerts: [], pagination: {} })
        } finally {
            setLoadingStockAlerts(false)
        }
    }, [dispatch, user?.token, page, stock])

    useEffect(() => {
        getStockAlerts()
    }, [getStockAlerts])

    const handleContent = useMemo(() => {
        if (!stockAlertsData) return null

        // Error de API (no de validación)
        if (error && !error.includes('número válido')) {
            return (
                <Box display="flex" justifyContent="center" flexDirection="column" alignItems="center" padding={4}>
                    <p className={classes.errorMessage}>{error}</p>
                </Box>
            )
        }

        const alerts = stockAlertsData.alerts || []
        const pagination = stockAlertsData.pagination || {}
        
        if (alerts.length === 0) {
            return <EmptyTablePlaceholder title="No hay productos con stock menor o igual al valor especificado" />
        }

        return (
            <>
                <Table
                    tableHeaderColor="danger"
                    tableHead={['ID', 'Nombre', 'Categoría', 'Variante', 'Precio', 'Stock Actual', 'Estado']}
                    tableData={alerts.map((alert) => {
                        const product = alert.product || {}
                        const feature = alert.feature || {}
                        const featureStock = feature.stock ?? 0
                        const isOutOfStock = featureStock <= 0
                        const isLowStock = featureStock > 0 && featureStock <= MIN_STOCK

                        let status = ''
                        let statusColor = ''

                        if (isOutOfStock) {
                            status = 'Sin stock'
                            statusColor = 'danger'
                        } else if (isLowStock) {
                            status = 'Stock bajo'
                            statusColor = 'warning'
                        }

                        const categoryName = product.categoryDetail?.name || 'Sin categoría'
                        
                        // Construir la variante (color y size)
                        let variantText = 'Sin variante'
                        if (feature.color || feature.size) {
                            const colorName = feature.color?.name || ''
                            const sizeName = feature.size?.name || ''
                            const parts = []
                            if (colorName) parts.push(`Color: ${colorName}`)
                            if (sizeName) parts.push(`Talle: ${sizeName}`)
                            variantText = parts.length > 0 ? parts.join(' - ') : 'Sin variante'
                        }

                        return [
                            product._id,
                            product.name,
                            categoryName,
                            variantText,
                            '$' + formatNumber(product.price || 0),
                            featureStock,
                            <span key={`${product._id}-${feature._id}`} style={{
                                color: statusColor === 'danger' ? '#f44336' : '#ff9800',
                                fontWeight: 'bold'
                            }}>
                                {status}
                            </span>
                        ]
                    })}
                />
                {pagination.totalPages > 1 && (
                    <ReactPaginate
                        forcePage={page}
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
                        onPageChange={(e) => {
                            setPage(e.selected)
                        }}
                        pageRangeDisplayed={5}
                        pageCount={pagination.totalPages || 1}
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
                )}
            </>
        )
    }, [stockAlertsData, error, classes.errorMessage])

    return (
        <div>
            <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                    <Card>
                        <CardHeader color="danger">
                            <h4 className={classes.cardTitleWhite}>
                                Alertas de Stock
                            </h4>
                        </CardHeader>
                        <CardBody>
                            <Box className={classes.searchWrapper}>
                                <TextField
                                    className={classes.stockInput}
                                    label="Stock máximo"
                                    value={stockInput}
                                    onChange={handleStockInputChange}
                                    onKeyPress={handleKeyPress}
                                    variant="outlined"
                                    error={!!error && error.includes('número válido')}
                                />
                                <IconButton
                                    onClick={handleSearch}
                                    disabled={loadingStockAlerts}
                                    color="primary"
                                    style={{
                                        color: 'rgba(0,175,195, 1)',
                                    }}
                                >
                                    <Search />
                                </IconButton>
                            </Box>
                            {error && error.includes('número válido') && (
                                <p className={classes.errorMessage}>{error}</p>
                            )}
                            {loadingStockAlerts ? (
                                <Box display="flex" justifyContent="center" padding={4}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                handleContent
                            )}
                        </CardBody>
                    </Card>
                </GridItem>
            </GridContainer>
        </div>
    )
} 