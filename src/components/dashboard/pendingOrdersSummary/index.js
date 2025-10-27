import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Card from 'components/Card/Card.js'
import CardHeader from 'components/Card/CardHeader.js'
import CardBody from 'components/Card/CardBody.js'
import { useDispatch, useSelector } from 'react-redux'
import { getSales } from '../../../store/sales'
import { Box, CircularProgress } from '@material-ui/core'
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
import moment from 'moment'
import MomentUtils from '@date-io/moment'
import 'moment/locale/es'

moment.locale('es')

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
    summaryContainer: {
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: '1rem',
        marginTop: '1rem',
        padding: '1rem',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
    },
    summaryItem: {
        textAlign: 'center',
        minWidth: '120px',
    },
    summaryValue: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '0.25rem',
    },
    summaryLabel: {
        fontSize: '0.875rem',
        color: '#666',
    },
}

const useStyles = makeStyles(styles)

export default function PendingOrdersSummary() {
    const classes = useStyles()
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)

    const [selectedDate, setSelectedDate] = useState(
        moment(new Date()).format('DD-MM-YYYY')
    )
    const [loadingState, setLoadingState] = useState('initial')
    const [summaryData, setSummaryData] = useState({
        pending: 0,
        shipped: 0,
        cancelled: 0,
        total: 0
    })

    // Función para cargar datos completos de todas las páginas
    const loadCompleteData = async (date) => {
        setLoadingState('loading')

        try {
            const dateFrom = moment(date, 'DD-MM-YYYY').startOf('month').format('DD-MM-YYYY')
            const dateTo = moment(date, 'DD-MM-YYYY').endOf('month').format('DD-MM-YYYY')

            // 1. Obtener primera página para obtener metadata
            const firstPageResponse = await dispatch(getSales({
                access: user.token,
                filters: {},
                page: 0,
                dateFrom,
                dateTo,
            })).unwrap()

            const totalSales = firstPageResponse.data.total || 0
            const itemsPerPage = 10
            const totalPages = Math.ceil(totalSales / itemsPerPage)

            console.log(`Total de ventas: ${totalSales}, Total de páginas: ${totalPages}`)

            // 2. Si solo hay una página, usar esos datos
            if (totalPages <= 1) {
                const processedData = processSalesData(firstPageResponse.data.sales || [])
                setSummaryData(processedData.summary)
                setLoadingState('complete')
                return
            }

            // 3. Obtener todas las páginas restantes en paralelo
            const remainingPagesPromises = []
            for (let page = 1; page < totalPages; page++) {
                remainingPagesPromises.push(
                    dispatch(getSales({
                        access: user.token,
                        filters: {},
                        page,
                        dateFrom,
                        dateTo,
                    })).unwrap()
                )
            }

            const remainingPagesResponses = await Promise.all(remainingPagesPromises)

            // 4. Consolidar todas las ventas
            const allSales = [
                firstPageResponse.data.sales || [],
                ...remainingPagesResponses.map(response => response.data.sales || [])
            ].flat()

            console.log(`Ventas consolidadas: ${allSales.length}`)

            // 5. Procesar datos para el resumen
            const processedData = processSalesData(allSales)
            setSummaryData(processedData.summary)

            setLoadingState('complete')

        } catch (error) {
            console.error('Error loading complete data:', error)
            setLoadingState('initial')
            setSummaryData({
                pending: 0,
                shipped: 0,
                cancelled: 0,
                total: 0
            })
        }
    }

    // Función para procesar datos de ventas y agrupar por estado
    const processSalesData = (sales) => {
        let pending = 0
        let shipped = 0
        let cancelled = 0

        console.log('Procesando ventas:', sales.length)

        sales.forEach(sale => {
            const status = sale.status

            console.log('Estado de venta:', status, 'ID:', sale._id, 'Tipo:', typeof status)

            // Manejar tanto strings como números
            if (status === 'PAGADO' || status === 1 || status === 'pending' || status === 'pendiente') {
                pending++
                console.log('→ Clasificado como PENDIENTE')
            } else if (status === 'ENVIADO' || status === 2 || status === 'shipped' || status === 'enviado' || status === 'enviada' || status === 'sent' || status === 'delivered' || status === 'entregado') {
                shipped++
                console.log('→ Clasificado como ENVIADA')
            } else if (status === 'CANCELADO' || status === 3 || status === 'cancelled' || status === 'cancelado' || status === 'cancelada' || status === 'canceled') {
                cancelled++
                console.log('→ Clasificado como CANCELADA')
            } else {
                // Por defecto, considerar como pendiente
                pending++
                console.log('→ Clasificado como PENDIENTE (por defecto) - Estado no reconocido:', status)
            }
        })

        console.log('Resumen de estados:', { pending, shipped, cancelled })

        const total = pending + shipped + cancelled

        const summary = {
            pending,
            shipped,
            cancelled,
            total
        }

        return { summary }
    }

    const dateChangeHandler = async (e) => {
        console.log('selected date', e)
        const formattedDate = moment(e).format('DD-MM-YYYY')
        setSelectedDate(formattedDate)
        await loadCompleteData(formattedDate)
    }

    useEffect(() => {
        // Cargar datos iniciales
        loadCompleteData(selectedDate)
    }, [])

    return (
        <div>
            <MuiPickersUtilsProvider locale={'es'} utils={MomentUtils}>
                <Card>
                    <CardHeader color="primary">
                        <h4 className={classes.cardTitleWhite}>
                            Resumen de Órdenes por Estado
                        </h4>
                    </CardHeader>
                    <CardBody>
                        <DatePicker
                            lang="es"
                            onChange={(e) => dateChangeHandler(e)}
                            value={
                                new Date(
                                    moment(selectedDate, 'DD-MM-YYYY')
                                )
                            }
                            variant="inline"
                            openTo="year"
                            views={['year', 'month']}
                            label="Mes y año"
                            helperText="Seleccione el mes y el año"
                            autoOk={true}
                        />

                        {loadingState === 'loading' ? (
                            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={3}>
                                <CircularProgress size={40} />
                                <div style={{ marginTop: '1rem', textAlign: 'center', color: '#666' }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                        Cargando datos de órdenes...
                                    </div>
                                    <div style={{ fontSize: '0.875rem' }}>
                                        Obteniendo información de todas las ventas del mes
                                    </div>
                                </div>
                            </Box>
                        ) : summaryData.total > 0 ? (
                            <>
                                {/* Resumen de órdenes por estado */}
                                <Box className={classes.summaryContainer}>
                                    <div className={classes.summaryItem}>
                                        <div className={classes.summaryValue} style={{ color: '#ffc107' }}>
                                            {summaryData.pending}
                                        </div>
                                        <div className={classes.summaryLabel}>Órdenes Pendientes</div>
                                    </div>
                                    <div className={classes.summaryItem}>
                                        <div className={classes.summaryValue} style={{ color: '#17a2b8' }}>
                                            {summaryData.shipped}
                                        </div>
                                        <div className={classes.summaryLabel}>Órdenes Enviadas</div>
                                    </div>
                                    <div className={classes.summaryItem}>
                                        <div className={classes.summaryValue} style={{ color: '#dc3545' }}>
                                            {summaryData.cancelled}
                                        </div>
                                        <div className={classes.summaryLabel}>Órdenes Canceladas</div>
                                    </div>
                                    <div className={classes.summaryItem}>
                                        <div className={classes.summaryValue} style={{ color: '#6c757d' }}>
                                            {summaryData.total}
                                        </div>
                                        <div className={classes.summaryLabel}>Total de Órdenes</div>
                                    </div>
                                </Box>
                            </>
                        ) : (
                            <Box display="flex" justifyContent="center" p={3}>
                                <div style={{ textAlign: 'center', color: '#666' }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                        No hay datos disponibles
                                    </div>
                                    <div style={{ fontSize: '0.875rem' }}>
                                        No se encontraron órdenes para el mes seleccionado
                                    </div>
                                </div>
                            </Box>
                        )}
                    </CardBody>
                </Card>
            </MuiPickersUtilsProvider>
        </div>
    )
}
