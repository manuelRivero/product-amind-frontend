
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import React, { useEffect, useState } from 'react'
//
import { makeStyles } from '@material-ui/core/styles'

import styles from 'assets/jss/material-dashboard-react/views/dashboardStyle.js'
import { useDispatch, useSelector } from 'react-redux'
import { getSales } from 'store/sales'
import TotalSalesSelect from '../totalSalesSelect'
import moment from 'moment'
import { Box } from '@material-ui/core'
// import io from 'socket.io-client'
// import { userAdded } from 'store/dashboard'

// const socket = io('ws://localhost:5000')

const useStyles = makeStyles(() => ({
    ...styles,
    container: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectorContainer: {
        flexGrow: 0,
    },
    // Estilos para el resumen financiero
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
}))

export default function MainStats() {

    const classes = useStyles()
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)

    const [date, setDate] = useState(moment(new Date()).format('DD-MM-YYYY'))
    const [financialSummary, setFinancialSummary] = useState({
        totalRevenue: 0,
        totalReceived: 0,
        totalCommissions: 0
    })

    // Función para cargar datos completos de todas las páginas
    const loadCompleteData = async (selectedDate) => {
        try {
            const dateFrom = moment(selectedDate, 'DD-MM-YYYY').startOf('month').format('DD-MM-YYYY')
            const dateTo = moment(selectedDate, 'DD-MM-YYYY').endOf('month').format('DD-MM-YYYY')

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

            // 2. Si solo hay una página, usar esos datos
            if (totalPages <= 1) {
                const processedData = processSalesData(firstPageResponse.data.sales || [])
                setFinancialSummary(processedData.financialSummary)
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

            // 5. Procesar datos para el resumen financiero
            const processedData = processSalesData(allSales)
            setFinancialSummary(processedData.financialSummary)

        } catch (error) {
            console.error('Error loading complete data:', error)
            setFinancialSummary({
                totalRevenue: 0,
                totalReceived: 0,
                totalCommissions: 0
            })
        }
    }

    // Función para procesar datos de ventas y calcular resumen financiero
    const processSalesData = (sales) => {
        let totalRevenue = 0
        let totalReceived = 0

        sales.forEach(sale => {
            const amount = sale.total || 0
            
            // Calcular comisión y monto recibido
            const marketplaceFee = sale.marketplaceFee || 0;
            const feePercentage = marketplaceFee < 1 ? marketplaceFee * 100 : marketplaceFee;
            const commissionAmount = (amount * feePercentage / 100);
            const receivedAmount = amount - commissionAmount;
            
            totalRevenue += amount
            totalReceived += receivedAmount
        })

        const totalCommissions = totalRevenue - totalReceived

        const financialSummary = {
            totalRevenue,
            totalReceived,
            totalCommissions
        }

        return { financialSummary }
    }

    useEffect(() => {
        // Cargar datos iniciales
        loadCompleteData(date)
    }, [])

    const handleDaylySaleDate = (date) => {
        console.log("date", date)
        const formattedDate = date.format('DD-MM-YYYY')
        setDate(formattedDate)
        loadCompleteData(formattedDate)
    }

    // useEffect(() => {

    //     socket.on('user-subcription', (user) => {
    //         dispatch(userAdded(user))
    //     })

    //     return () => {
    //         socket.off('user-subcription')
    //     }
    // }, [])

    return (

        <Card>
            <CardHeader color="primary">
                <h4 className={classes.cardTitleWhite}>Resumen Financiero del Mes</h4>
            </CardHeader>
            <CardBody>
                <div className={classes.container}>
                    <div className={classes.selectorContainer}>
                        <TotalSalesSelect onDateChange={handleDaylySaleDate} />
                    </div>
                </div>
                
                {/* Resumen financiero del mes */}
                <Box className={classes.financialSummary}>
                    <div className={classes.financialItem}>
                        <div className={classes.financialValue} style={{ color: '#1976d2' }}>
                            ${financialSummary.totalRevenue.toFixed(2)}
                        </div>
                        <div className={classes.financialLabel}>Ingresos Totales del Mes</div>
                    </div>
                    <div className={classes.financialItem}>
                        <div className={classes.financialValue} style={{ color: '#4CAF50' }}>
                            ${financialSummary.totalReceived.toFixed(2)}
                        </div>
                        <div className={classes.financialLabel}>Total Recibido del Mes</div>
                    </div>
                    <div className={classes.financialItem}>
                        <div className={classes.financialValue} style={{ color: '#ff9800' }}>
                            ${financialSummary.totalCommissions.toFixed(2)}
                        </div>
                        <div className={classes.financialLabel}>Comisiones del Mes</div>
                    </div>
                </Box>
            </CardBody>
        </Card>

    )
}
