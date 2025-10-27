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
import ChartistGraph from 'react-chartist'
import ChartistTooltip from 'chartist-plugin-tooltips-updated'
import 'chartist-plugin-tooltips-updated/dist/chartist-plugin-tooltip.css'
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
    legendContainer: {
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginTop: '.5rem',
        marginBottom: '.5rem',
    },
    financialSummary: {
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: '1rem',
        marginTop: '1rem',
        padding: '1rem',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
    },
    financialItem: {
        textAlign: 'center',
        minWidth: '120px',
    },
    financialValue: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        marginBottom: '0.25rem',
    },
    financialLabel: {
        fontSize: '0.875rem',
        color: '#666',
    },
    legendItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.875rem',
        fontWeight: '500',
    },
    legendColor: {
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        border: '2px solid #fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    },
    pendingColor: {
        backgroundColor: '#ffc107',
    },
    shippedColor: {
        backgroundColor: '#17a2b8',
    },
    cancelledColor: {
        backgroundColor: '#dc3545',
    },
    // Estilos para el gráfico de pie
    pieChart: {
        '& .ct-series-a .ct-slice-donut': {
            stroke: '#ffc107 !important', // Amarillo para pendientes (primera serie)
        },
        '& .ct-series-b .ct-slice-donut': {
            stroke: '#17a2b8 !important', // Azul para enviadas (segunda serie)
        },
        '& .ct-series-c .ct-slice-donut': {
            stroke: '#dc3545 !important', // Rojo para canceladas (tercera serie)
        },
        // Estilos para los labels (números)
        '& .ct-label': {
            fill: '#333333 !important', // Color oscuro para mejor visibilidad
            fontSize: '14px !important',
            fontWeight: 'bold !important',
            textShadow: '1px 1px 2px rgba(255,255,255,0.8) !important', // Sombra blanca para contraste
        },
        // Estilos para el tooltip
        '& .chartist-tooltip': {
            position: 'absolute',
            display: 'inline-block',
            opacity: '1',
            minWidth: '10em',
            padding: '0.5em',
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            textAlign: 'center',
            pointerEvents: 'none',
            zIndex: '1000',
            transition: 'opacity 0.2s linear',
            borderRadius: '4px',
            fontSize: '12px',
        },
    },
}

const useStyles = makeStyles(styles)

export default function PendingOrdersPieChart() {
    const classes = useStyles()
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)

    const [selectedDate, setSelectedDate] = useState(
        moment(new Date()).format('DD-MM-YYYY')
    )
    const [loadingState, setLoadingState] = useState('initial')
    const [chartData, setChartData] = useState(null)
    const [summaryData, setSummaryData] = useState({
        pending: 0,
        shipped: 0,
        cancelled: 0,
        total: 0,
        totalRevenue: 0,
        totalReceived: 0
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
                setChartData(processedData.chartData)
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

            // 5. Procesar datos para el gráfico
            const processedData = processSalesData(allSales)
            setChartData(processedData.chartData)
            setSummaryData(processedData.summary)

            setLoadingState('complete')

        } catch (error) {
            console.error('Error loading complete data:', error)
            setLoadingState('initial')
            setChartData(null)
            setSummaryData({
                pending: 0,
                shipped: 0,
                cancelled: 0,
                total: 0,
                totalRevenue: 0,
                totalReceived: 0
            })
        }
    }

    // Función para procesar datos de ventas y agrupar por estado
    const processSalesData = (sales) => {
        let pending = 0
        let shipped = 0
        let cancelled = 0
        let totalRevenue = 0
        let totalReceived = 0

        console.log('Procesando ventas:', sales.length)

        sales.forEach(sale => {
            const status = sale.status
            const amount = sale.total || 0
            
            // Calcular comisión y monto recibido
            const marketplaceFee = sale.marketplaceFee || 0;
            const feePercentage = marketplaceFee < 1 ? marketplaceFee * 100 : marketplaceFee;
            const commissionAmount = (amount * feePercentage / 100);
            const receivedAmount = amount - commissionAmount;
            
            totalRevenue += amount
            totalReceived += receivedAmount

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

        // Solo incluir categorías con datos mayores a 0
        const series = []
        const labels = []
        const categoryData = [pending, shipped, cancelled]

        categoryData.forEach((value) => {
            if (value > 0) {
                series.push(value)
                labels.push(value.toString())
            }
        })

        const chartData = {
            series: series,
            labels: labels
        }

        const summary = {
            pending,
            shipped,
            cancelled,
            total,
            totalRevenue,
            totalReceived
        }

        console.log('Datos del gráfico:', chartData)

        return { chartData, summary }
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

    // Configuración del gráfico de pie
    const pieChartOptions = {
        donut: true,
        donutWidth: 60,
        startAngle: 270,
        total: summaryData.total,
        showLabel: true,
        plugins: [
            ChartistTooltip({
                transformTooltipTextFnc: (value, index) => {
                    // Crear array dinámico de labels basado en los datos disponibles
                    const availableLabels = []
                    if (summaryData.pending > 0) availableLabels.push('Pendientes')
                    if (summaryData.shipped > 0) availableLabels.push('Enviadas')
                    if (summaryData.cancelled > 0) availableLabels.push('Canceladas')

                    const percentage = summaryData.total > 0 ? Math.round((value / summaryData.total) * 100) : 0
                    return `${availableLabels[index]}: ${value} (${percentage}%)`
                },
                appendToBody: true,
                class: 'chartist-tooltip',
            }),
        ],
    }

    return (
        <div>

            <MuiPickersUtilsProvider locale={'es'} utils={MomentUtils}>
                <Card>
                    <CardHeader color="primary">
                        <h4 className={classes.cardTitleWhite}>
                            Estado de Órdenes
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
                        ) : chartData && summaryData.total > 0 ? (
                            <>
                                {/* Leyenda */}
                                <Box className={classes.legendContainer}>
                                    {summaryData.pending > 0 && (
                                        <div className={classes.legendItem}>
                                            <div className={`${classes.legendColor} ${classes.pendingColor}`}></div>
                                            <span>Pendientes</span>
                                        </div>
                                    )}
                                    {summaryData.shipped > 0 && (
                                        <div className={classes.legendItem}>
                                            <div className={`${classes.legendColor} ${classes.shippedColor}`}></div>
                                            <span>Enviadas</span>
                                        </div>
                                    )}
                                    {summaryData.cancelled > 0 && (
                                        <div className={classes.legendItem}>
                                            <div className={`${classes.legendColor} ${classes.cancelledColor}`}></div>
                                            <span>Canceladas</span>
                                        </div>
                                    )}
                                </Box>

                                {/* Gráfico de pie */}
                                <ChartistGraph
                                    className={classes.pieChart}
                                    data={chartData}
                                    type="Pie"
                                    options={pieChartOptions}
                                />

                                {/* Resumen financiero */}
                                <Box className={classes.financialSummary}>
                                    <div className={classes.financialItem}>
                                        <div className={classes.financialValue} style={{ color: '#1976d2' }}>
                                            ${summaryData.totalRevenue.toFixed(2)}
                                        </div>
                                        <div className={classes.financialLabel}>Ingresos Totales</div>
                                    </div>
                                    <div className={classes.financialItem}>
                                        <div className={classes.financialValue} style={{ color: '#4CAF50' }}>
                                            ${summaryData.totalReceived.toFixed(2)}
                                        </div>
                                        <div className={classes.financialLabel}>Total Recibido</div>
                                    </div>
                                    <div className={classes.financialItem}>
                                        <div className={classes.financialValue} style={{ color: '#ff9800' }}>
                                            ${(summaryData.totalRevenue - summaryData.totalReceived).toFixed(2)}
                                        </div>
                                        <div className={classes.financialLabel}>Comisiones</div>
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