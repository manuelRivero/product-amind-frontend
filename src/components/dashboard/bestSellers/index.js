import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import GridItem from 'components/Grid/GridItem.js'
import GridContainer from 'components/Grid/GridContainer.js'
import Table from 'components/Table/Table.js'
import Card from 'components/Card/Card.js'
import CardHeader from 'components/Card/CardHeader.js'
import CardBody from 'components/Card/CardBody.js'
import { useDispatch, useSelector } from 'react-redux'
import { getTopSellingProducts } from '../../../store/products'
import { Box, CircularProgress } from '@material-ui/core'
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
import moment from 'moment'
import MomentUtils from '@date-io/moment'
import EmptyTablePlaceholder from '../../EmptyTablePlaceholder'
import Button from 'components/CustomButtons/Button'
import ReactPaginate from 'react-paginate'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'

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
    filtersWrapper: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center',
        marginBottom: '1rem',
    },
    dateRangeWrapper: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center',
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

export default function BestSellers() {
    const classes = useStyles()
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)

    const [topProductsData, setTopProductsData] = useState(null)
    const [loadingTopProducts, setLoadingTopProducts] = useState(false)
    const [searchMode, setSearchMode] = useState('month') // 'month' or 'range'
    const [selectedMonth, setSelectedMonth] = useState(moment())
    const [startDate, setStartDate] = useState(null)
    const [endDate, setEndDate] = useState(null)
    const [page, setPage] = useState(0)

    const fetchTopProducts = useCallback(async () => {
        if (!user?.token) return

        setLoadingTopProducts(true)
        try {
            const params = {
                page,
                limit: 10,
            }

            if (searchMode === 'month') {
                params.month = selectedMonth.month() + 1 // moment months are 0-indexed
                params.year = selectedMonth.year()
            } else if (searchMode === 'range') {
                if (startDate && endDate) {
                    params.startDate = moment(startDate).format('DD-MM-YYYY')
                    params.endDate = moment(endDate).format('DD-MM-YYYY')
                }
                // Si no hay fechas, no se agregan filtros (todos los tiempos)
            }

            const response = await dispatch(
                getTopSellingProducts({
                    access: user.token,
                    params,
                })
            ).unwrap()

            if (response.data) {
                setTopProductsData({
                    alerts: response.data.alerts || [],
                    pagination: response.data.pagination || {},
                    filters: response.data.filters || {},
                })
            } else {
                setTopProductsData({
                    alerts: response.alerts || [],
                    pagination: response.pagination || {},
                    filters: response.filters || {},
                })
            }
        } catch (error) {
            console.error('Error fetching top products:', error)
            setTopProductsData({ alerts: [], pagination: {}, filters: {} })
        } finally {
            setLoadingTopProducts(false)
        }
    }, [dispatch, user?.token, page, searchMode, selectedMonth, startDate, endDate])

    useEffect(() => {
        fetchTopProducts()
    }, [fetchTopProducts])

    const handleMonthChange = (date) => {
        setSelectedMonth(moment(date))
        setPage(0)
    }

    const handleStartDateChange = (date) => {
        setStartDate(date)
        setPage(0)
    }

    const handleEndDateChange = (date) => {
        setEndDate(date)
        setPage(0)
    }

    const handleModeChange = () => {
        if (searchMode === 'month') {
            setSearchMode('range')
        } else {
            setSearchMode('month')
            setStartDate(null)
            setEndDate(null)
        }
        setPage(0)
    }

    const handleContent = useMemo(() => {
        if (!topProductsData) return null

        const alerts = topProductsData.alerts || []

        if (alerts.length === 0) {
            return <EmptyTablePlaceholder title="No hay información de productos para los filtros seleccionados" />
        }

        const pagination = topProductsData.pagination || {}

        return (
            <>
                <Table
                    tableHeaderColor="warning"
                    tableHead={['ID', 'Nombre', 'Variante', 'Cantidad Vendida']}
                    tableData={alerts.map((alert) => {
                        const product = alert.product || {}
                        const feature = alert.feature || {}
                        const sales = alert.sales || {}
                        
                        // Construir la variante usando la información de sales o feature
                        let variantText = 'Sin variante'
                        
                        // Obtener color y size, priorizando sales sobre feature
                        // Manejar explícitamente null (productos sin features)
                        const colorName = sales.soldColorName !== null && sales.soldColorName !== undefined
                            ? sales.soldColorName
                            : (feature.color?.name || null)
                        const sizeName = sales.soldSizeName !== null && sales.soldSizeName !== undefined
                            ? sales.soldSizeName
                            : (feature.size?.name || null)
                        
                        // Solo mostrar variante si hay información válida (no null ni undefined)
                        if (colorName || sizeName) {
                            const parts = []
                            if (colorName) parts.push(`Color: ${colorName}`)
                            if (sizeName) parts.push(`Talle: ${sizeName}`)
                            if (parts.length > 0) {
                                variantText = parts.join(' - ')
                            }
                        }

                        return [
                            product._id,
                            product.name,
                            variantText,
                            sales.totalSold || 0,
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
    }, [topProductsData, page, classes.page, classes.pagination, classes.activePage])

    return (
        <div>
            <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                    <MuiPickersUtilsProvider locale={'es'} utils={MomentUtils}>
                        <Card>
                            <CardHeader color="warning">
                                <h4 className={classes.cardTitleWhite}>
                                    Productos más vendidos
                                </h4>
                            </CardHeader>
                            <CardBody>
                                <Box className={classes.filtersWrapper}>
                                    {searchMode === 'month' ? (
                                        <>
                                            <DatePicker
                                                lang="es"
                                                onChange={handleMonthChange}
                                                value={selectedMonth.toDate()}
                                                variant="inline"
                                                openTo="year"
                                                views={['year', 'month']}
                                                label="Mes y año"
                                                helperText="Seleccione el mes y el año"
                                                autoOk={true}
                                            />
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={handleModeChange}
                                            >
                                                Seleccionar rango
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Box className={classes.dateRangeWrapper}>
                                                <DatePicker
                                                    lang="es"
                                                    onChange={handleStartDateChange}
                                                    value={startDate}
                                                    variant="inline"
                                                    format="DD-MM-YYYY"
                                                    label="Fecha inicio"
                                                    helperText="Seleccione la fecha de inicio"
                                                    maxDate={endDate || new Date()}
                                                />
                                                <DatePicker
                                                    lang="es"
                                                    onChange={handleEndDateChange}
                                                    value={endDate}
                                                    variant="inline"
                                                    format="DD-MM-YYYY"
                                                    label="Fecha fin"
                                                    helperText="Seleccione la fecha de fin"
                                                    minDate={startDate}
                                                    maxDate={new Date()}
                                                />
                                            </Box>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={handleModeChange}
                                            >
                                                Seleccionar mes
                                            </Button>
                                        </>
                                    )}
                                </Box>
                                {loadingTopProducts ? (
                                    <Box display="flex" justifyContent="center" padding={4}>
                                        <CircularProgress />
                                    </Box>
                                ) : (
                                    handleContent
                                )}
                            </CardBody>
                        </Card>
                    </MuiPickersUtilsProvider>
                </GridItem>
            </GridContainer>
        </div>
    )
} 