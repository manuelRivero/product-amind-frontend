import React, { useMemo, useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import GridItem from 'components/Grid/GridItem.js'
import GridContainer from 'components/Grid/GridContainer.js'
import Table from 'components/Table/Table.js'
import Card from 'components/Card/Card.js'
import CardHeader from 'components/Card/CardHeader.js'
import CardBody from 'components/Card/CardBody.js'
import { useDispatch, useSelector } from 'react-redux'
import { getSales } from '../../../store/sales'
import { formatNumber } from '../../../helpers/product'
import { Box, CircularProgress } from '@material-ui/core'
import Button from 'components/CustomButtons/Button'
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
import moment from 'moment'
import MomentUtils from '@date-io/moment'
import EmptyTablePlaceholder from '../../EmptyTablePlaceholder'
import ReactPaginate from 'react-paginate'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'

const styles = {
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
}

const useStyles = makeStyles(styles)

export default function ClientsBehavior() {
    const classes = useStyles()
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    // Removed unused selector
    
    const [clientsBehaviorData, setClientsBehaviorData] = useState(null)
    const [selectedDate, setSelectedDate] = useState(
        moment(new Date()).format('DD-MM-YYYY')
    )
    const [page, setPage] = useState(0)
    const [showTable, setShowTable] = useState(false)
    const [loadingState, setLoadingState] = useState('initial') // 'initial' | 'loading' | 'complete'
    const [cachedData, setCachedData] = useState({}) // Cache por fecha

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
                const behaviorAnalysis = processSalesData(firstPageResponse.data.sales || [])
                setClientsBehaviorData({
                    data: behaviorAnalysis,
                    summary: calculateSummary(behaviorAnalysis),
                    pagination: {
                        total: behaviorAnalysis.length,
                        itemsPerPage: behaviorAnalysis.length,
                        currentPage: 0
                    }
                })
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
            
            // 5. Procesar datos de comportamiento
            const behaviorAnalysis = processSalesData(allSales)
            
            // 6. Guardar en cache
            const cacheKey = `${dateFrom}-${dateTo}`
            setCachedData(prev => ({
                ...prev,
                [cacheKey]: behaviorAnalysis
            }))
            
            // 7. Actualizar estado
            setClientsBehaviorData({
                data: behaviorAnalysis,
                summary: calculateSummary(behaviorAnalysis),
                pagination: {
                    total: behaviorAnalysis.length,
                    itemsPerPage: behaviorAnalysis.length,
                    currentPage: 0
                }
            })
            
            setLoadingState('complete')
            
        } catch (error) {
            console.error('Error loading complete data:', error)
            setLoadingState('initial')
            setClientsBehaviorData({
                data: [],
                summary: {
                    totalCustomers: 0,
                    newCustomers: 0,
                    returningCustomers: 0,
                    totalRevenue: 0
                },
                pagination: {
                    total: 0,
                    itemsPerPage: 0,
                    currentPage: 0
                }
            })
        }
    }
    
    // Función para procesar datos de ventas y agrupar por cliente
    const processSalesData = (sales) => {
        // Agrupar ventas por cliente
        const clientPurchases = {}
        const clientFirstPurchase = {}
        const clientTotalSpent = {}
        const clientTotalReceived = {}

        sales.forEach(sale => {
            console.log('sale', sale)
            // Usar email como identificador único del cliente
            const clientId = sale.user || 'anonymous'
            const purchaseDate = moment(sale.createdAt)
            const amount = sale.total || 0

            // Calcular comisión y monto recibido
            const marketplaceFee = sale.marketplaceFee || 0;
            const feePercentage = marketplaceFee < 1 ? marketplaceFee * 100 : marketplaceFee;
            const commissionAmount = (amount * feePercentage / 100);
            const receivedAmount = amount - commissionAmount;

            if (!clientPurchases[clientId]) {
                clientPurchases[clientId] = []
                clientFirstPurchase[clientId] = purchaseDate
                clientTotalSpent[clientId] = 0
                clientTotalReceived[clientId] = 0
            }

            clientPurchases[clientId].push({
                id: sale._id,
                date: purchaseDate,
                amount: amount,
                receivedAmount: receivedAmount,
                commissionAmount: commissionAmount,
                name: sale.name,
                lastName: sale.lastName,
                user: sale.user
            })

            clientTotalSpent[clientId] += amount
            clientTotalReceived[clientId] += receivedAmount

            // Actualizar primera compra si es más temprana
            if (purchaseDate.isBefore(clientFirstPurchase[clientId])) {
                clientFirstPurchase[clientId] = purchaseDate
            }
        })

        // Analizar comportamiento de cada cliente
        const behaviorAnalysis = Object.keys(clientPurchases).map(clientId => {
            const purchases = clientPurchases[clientId]
            const totalSpent = clientTotalSpent[clientId]
            const totalReceived = clientTotalReceived[clientId]
            const purchaseCount = purchases.length
            
            // Determinar si es cliente nuevo o recurrente
            const customerType = purchaseCount >= 2 ? 'Recurrente' : 'Nuevo'
            
            // Calcular frecuencia de compra (días entre compras)
            let avgPurchaseFrequency = 'N/A'
            if (purchaseCount > 1) {
                const sortedPurchases = purchases.sort((a, b) => a.date.diff(b.date))
                const totalDays = sortedPurchases[sortedPurchases.length - 1].date.diff(sortedPurchases[0].date, 'days')
                avgPurchaseFrequency = Math.round(totalDays / (purchaseCount - 1))
            }

            // Obtener información del cliente desde la primera venta
            const firstSale = purchases[0]
            console.log('first sale', firstSale)
            const clientName = `${firstSale?.name || ''} ${firstSale?.lastName || ''}`.trim() || 'Cliente Anónimo'
            console.log('client name', firstSale?.name)
            
            return {
                clientId,
                name: clientName,
                email: firstSale?.user || 'N/A',
                customerType,
                purchaseCount,
                totalSpent,
                totalReceived,
                avgPurchaseFrequency,
                lastPurchase: moment.max(...purchases.map(p => p.date)).format('DD/MM/YYYY'),
                firstPurchase: clientFirstPurchase[clientId].format('DD/MM/YYYY'),
                avgOrderValue: Math.round(totalSpent / purchaseCount),
                avgReceivedValue: Math.round(totalReceived / purchaseCount)
            }
        })

        // Ordenar por total gastado (descendente)
        return behaviorAnalysis.sort((a, b) => b.totalSpent - a.totalSpent)
    }
    
    // Función para calcular el resumen
    const calculateSummary = (behaviorAnalysis) => {
        return {
            totalCustomers: behaviorAnalysis.length,
            newCustomers: behaviorAnalysis.filter(c => c.customerType === 'Nuevo').length,
            returningCustomers: behaviorAnalysis.filter(c => c.customerType === 'Recurrente').length,
            totalRevenue: behaviorAnalysis.reduce((sum, c) => sum + c.totalSpent, 0),
            totalReceived: behaviorAnalysis.reduce((sum, c) => sum + c.totalReceived, 0)
        }
    }
    
        // Función para analizar el comportamiento de clientes (mantener para compatibilidad)
    const analyzeClientsBehavior = async (date) => {
        try {
            // Verificar si tenemos datos en cache
            const dateFrom = moment(date, 'DD-MM-YYYY').startOf('month').format('DD-MM-YYYY')
            const dateTo = moment(date, 'DD-MM-YYYY').endOf('month').format('DD-MM-YYYY')
            const cacheKey = `${dateFrom}-${dateTo}`
            
            if (cachedData[cacheKey]) {
                console.log('Usando datos del cache')
                setClientsBehaviorData({
                    data: cachedData[cacheKey],
                    summary: calculateSummary(cachedData[cacheKey]),
                    pagination: {
                        total: cachedData[cacheKey].length,
                        itemsPerPage: cachedData[cacheKey].length,
                        currentPage: 0
                    }
                })
                setLoadingState('complete')
                return
            }
            
            // Si no hay cache, cargar datos completos
            await loadCompleteData(date)
            
        } catch (error) {
            console.error('Error analyzing clients behavior:', error)
            setClientsBehaviorData({
                data: [],
                summary: {
                    totalCustomers: 0,
                    newCustomers: 0,
                    returningCustomers: 0,
                    totalRevenue: 0
                },
                pagination: {
                    total: 0,
                    itemsPerPage: 0,
                    currentPage: 0
                }
            })
        }
    }

    const dateChangeHandler = async (e) => {
        console.log('selected date', e)
        const formattedDate = moment(e).format('DD-MM-YYYY')
        setSelectedDate(formattedDate)
        setPage(0) // Resetear a la primera página
        setShowTable(false) // Ocultar tabla al cambiar fecha
        await analyzeClientsBehavior(formattedDate)
    }

    useEffect(() => {
        analyzeClientsBehavior(selectedDate)
    }, [page])

    useEffect(() => {
        // Cargar datos iniciales
        analyzeClientsBehavior(selectedDate)
    }, [])

    const handleContent = useMemo(() => {
        if (clientsBehaviorData) {
            return clientsBehaviorData && clientsBehaviorData?.data?.length === 0 ? (
                <EmptyTablePlaceholder title="No hay información de clientes para la fecha seleccionada" />
            ) : (
                <>
                    {/* Resumen de métricas */}
                    <Box mb={3} p={2} bgcolor="#f5f5f5" borderRadius={1}>
                        <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1976d2' }}>
                                    {clientsBehaviorData.summary.totalCustomers}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: '#666' }}>Total Clientes</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2e7d32' }}>
                                    {clientsBehaviorData.summary.newCustomers}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: '#666' }}>Clientes Nuevos</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ed6c02' }}>
                                    {clientsBehaviorData.summary.returningCustomers}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: '#666' }}>Clientes Recurrentes</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1976d2' }}>
                                    ${formatNumber(clientsBehaviorData.summary.totalRevenue)}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: '#666' }}>Ingresos Totales</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4CAF50' }}>
                                    ${formatNumber(clientsBehaviorData.summary.totalReceived)}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: '#666' }}>Total Recibido</div>
                            </div>
                        </div>
                    </Box>

                    {/* Información de paginación */}
                    {clientsBehaviorData?.pagination && clientsBehaviorData.pagination.total > 10 && (
                        <Box mb={2} p={2} bgcolor="#e3f2fd" borderRadius={1}>
                            <div style={{ textAlign: 'center', color: '#1976d2', fontSize: '0.875rem' }}>
                                <strong>Información de paginación:</strong> Hay {clientsBehaviorData.pagination.total} clientes en total. 
                                Mostrando página {page + 1} de {Math.ceil(clientsBehaviorData.pagination.total / 10)}. 
                                Cambia de página para ver más clientes de esta fecha.
                            </div>
                        </Box>
                    )}

                    {/* Toggle para mostrar/ocultar tabla */}
                    <Box mb={2} display="flex" justifyContent="center">
                        <Button
                            variant="outlined"
                            color="info"
                            onClick={() => setShowTable(!showTable)}
                            startIcon={showTable ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        >
                            {showTable ? 'Ocultar Detalles' : 'Ver Detalles'}
                        </Button>
                    </Box>

                    {/* Tabla de comportamiento (condicional) */}
                    {showTable && (
                        <>
                            <Table
                                tableHeaderColor="info"
                                tableHead={[
                                    'Cliente', 
                                    'Email', 
                                    'Tipo', 
                                    'Compras', 
                                    'Total Gastado', 
                                    'Total Recibido',
                                    'Valor Promedio',
                                    'Frecuencia (días)',
                                    'Última Compra',
                                    'Primera Compra'
                                ]}
                                tableData={clientsBehaviorData.data.map((client) => [
                                    client.name,
                                    client.email,
                                    <span key={client.clientId} style={{ 
                                        color: client.customerType === 'Nuevo' ? '#2e7d32' : '#ed6c02',
                                        fontWeight: 'bold'
                                    }}>
                                        {client.customerType}
                                    </span>,
                                    client.purchaseCount,
                                    '$' + formatNumber(client.totalSpent),
                                    '$' + formatNumber(client.totalReceived),
                                    '$' + formatNumber(client.avgOrderValue),
                                    client.avgPurchaseFrequency === 'N/A' ? 'N/A' : client.avgPurchaseFrequency + ' días',
                                    client.lastPurchase,
                                    client.firstPurchase
                                ])}
                            />
                            
                            {/* Paginación */}
                            {clientsBehaviorData?.pagination && clientsBehaviorData.pagination.total > 10 && (
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
                                            color="info"
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
                                    pageCount={Math.ceil(
                                        clientsBehaviorData.pagination.total / 10
                                    )}
                                    previousLabel={
                                        <Button
                                            isLoading={false}
                                            variant="contained"
                                            color="info"
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
                    )}
                </>
            )
        }
        return null
    }, [clientsBehaviorData, showTable, page])

    return (
        <div>
            <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                    <MuiPickersUtilsProvider locale={'es'} utils={MomentUtils}>
                        <Card>
                            <CardHeader color="info">
                                <h4 className={classes.cardTitleWhite}>
                                    Comportamiento de Clientes
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
                                                Cargando datos completos de clientes...
                                            </div>
                                            <div style={{ fontSize: '0.875rem' }}>
                                                Obteniendo información de todas las ventas para análisis completo
                                            </div>
                                        </div>
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