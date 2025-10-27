import React, { useEffect, useState } from 'react'
import Card from 'components/Card/Card'
import CardHeader from 'components/Card/CardHeader'
import GridContainer from 'components/Grid/GridContainer'
import GridItem from 'components/Grid/GridItem'
//
import { makeStyles } from '@material-ui/core/styles'

import styles from 'assets/jss/material-dashboard-react/views/dashboardStyle.js'
import { useDispatch, useSelector } from 'react-redux'
import ChartistGraph from 'react-chartist'
import CardBody from 'components/Card/CardBody'
import { dailySalesChart } from 'variables/charts'
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
import MomentUtils from '@date-io/moment'
import moment from 'moment'
import { getMonthlySales } from 'store/dashboard'
import ChartistTooltip from 'chartist-plugin-tooltips-updated'
import 'chartist-plugin-tooltips-updated/dist/chartist-plugin-tooltip.css'
import 'moment/locale/es' // without this line it didn't work
import { Box } from '@material-ui/core'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'

moment.locale('es')
// console.log('dailySalesChart', dailySalesChart)

const additionalStyles = {
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
}

const useStyles = makeStyles(() => ({
    ...styles,
    ...additionalStyles
}))

export default function MainCharts() {
    const classes = useStyles()

    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)

    const history = useHistory()

    const [chartData, setChartData] = useState(null)
    const [chartLabels, setChartLabels] = useState(null)
    const [sales, setSales] = useState([])
    const [totalRevenue, setTotalRevenue] = useState(0)
    const [totalReceived, setTotalReceived] = useState(0)
    const [selectedDate, setSelectedDate] = useState(
        moment(new Date()).format('DD-MM-YYYY')
    )

    const dateChangeHandler = async (e) => {
        const response = await dispatch(
            getMonthlySales({
                access: user.token,
                date: moment(e).format('DD-MM-YYYY'),
            })
        )
        setSelectedDate(moment(e).format('DD-MM-YYYY'))
        setSales(response.payload.data.sales)
    }
    useEffect(() => {
        const getData = async () => {
            const response = await dispatch(
                getMonthlySales({
                    access: user.token,
                    date: selectedDate,
                })
            )
            console.log('monthly sales response', response)
            setSales(response.payload.data.sales)
        }
        getData()
    }, [])

    useEffect(() => {
        const getData = async () => {
            if (sales) {
                // console.log('sales')
                const labels = new Array(
                    moment(selectedDate, 'DD-MM-YYYY').daysInMonth()
                )
                    .fill(0)
                    .map((day, i) => i + 1)

                let monthlyRevenue = 0
                let monthlyReceived = 0

                const series = labels.map((e) => {
                    let saleValue = 0
                    sales.forEach((sale) => {
                        if (
                            moment(sale._id).format('DD-MM-YYYY') ===
                            moment([
                                moment(selectedDate, 'DD-MM-YYYY').year(),
                                moment(selectedDate, 'DD-MM-YYYY').month(),
                                e,
                            ]).format('DD-MM-YYYY')
                        ) {
                            saleValue = saleValue + sale.total
                            
                            // Calcular comisión y monto recibido
                            const marketplaceFee = sale.marketplaceFee || 0;
                            const feePercentage = marketplaceFee < 1 ? marketplaceFee * 100 : marketplaceFee;
                            const commissionAmount = (sale.total * feePercentage / 100);
                            const receivedAmount = sale.total - commissionAmount;
                            
                            // Debug logs
                            console.log('Sale debug:', {
                                id: sale._id,
                                total: sale.total,
                                marketplaceFee: marketplaceFee,
                                feePercentage: feePercentage,
                                commissionAmount: commissionAmount,
                                receivedAmount: receivedAmount
                            });
                            
                            monthlyRevenue += sale.total
                            monthlyReceived += receivedAmount
                        }
                    })
                    console.log('saleValue', saleValue)
                    return saleValue
                })
                console.log('series', series)
                console.log('Monthly totals:', {
                    monthlyRevenue: monthlyRevenue,
                    monthlyReceived: monthlyReceived,
                    commissions: monthlyRevenue - monthlyReceived
                });
                setChartData(series)
                setTotalRevenue(monthlyRevenue)
                setTotalReceived(monthlyReceived)

                setChartLabels(labels)
            }
        }
        getData()
    }, [sales])

    useEffect(() => {
        const handleClick = (e) => {
            const point = e.target
            const points = Array.from(document.querySelectorAll('.ct-point'))
            const index = points.indexOf(point)

            if (index >= 0) {
                const tooltip = document.querySelector('.chartist-tooltip')
                if (tooltip) tooltip.style.display = 'none'
                const base = moment(selectedDate, 'DD-MM-YYYY');
                const date = moment()
                    .set({
                        date: index + 1,
                        month: base.month(),
                        year: base.year(),
                    })
                    .format('DD-MM-YYYY');
                // console.log('chartLabels', chartLabels[index])
                history.push(`/admin/orders?from=${date}&to=${date}`)
            }
        }

        // Esperamos a que Chartist dibuje los puntos
        setTimeout(() => {
            const points = document.querySelectorAll('.ct-point')
            points.forEach((point) => {
                point.addEventListener('click', handleClick)
            })
        }, 500)

        return () => {
            const points = document.querySelectorAll('.ct-point')
            points.forEach((point) => {
                point.removeEventListener('click', handleClick)
            })
        }
    }, [chartLabels])

    useEffect(() => {
        const tooltip = document.querySelector('.chartist-tooltip')
        if (tooltip) tooltip.style.display = 'initial'
    }, [])

    return (
        <MuiPickersUtilsProvider locale={'es'} utils={MomentUtils}>
            <Box style={{ width: '100%', overflow: 'auto' }}>
                <GridContainer style={{ minWidth: 1000 }}>
                    <GridItem xs={12} sm={12} md={12}>
                        {chartData && (
                            <Card chart>
                                <CardHeader color="success">
                                    <ChartistGraph
                                        className="ct-chart"
                                        data={{
                                            labels: chartLabels,
                                            series: [chartData],
                                        }}
                                        type="Line"
                                        options={{
                                            ...dailySalesChart.options,
                                            high:
                                                Math.max.apply(
                                                    Math,
                                                    chartData
                                                ) + 5,
                                            plugins: [
                                                ChartistTooltip({
                                                    transformTooltipTextFnc: (
                                                        value
                                                    ) =>
                                                        `$${Number(
                                                            value
                                                        ).toFixed(1)}`, // Agrega el prefijo $
                                                }),
                                            ],
                                        }}
                                        listener={dailySalesChart.animation}
                                    />
                                </CardHeader>
                                <CardBody>
                                    <h4 className={classes.cardTitle}>
                                        Ventas mensuales
                                    </h4>
                                    {/* {console.log("selected date",new Date(moment(selectedDate, "DD-MM-YYYY")))} */}
                                    <DatePicker
                                        lang="es"
                                        onChange={(e) => dateChangeHandler(e)}
                                        value={
                                            new Date(
                                                moment(
                                                    selectedDate,
                                                    'DD-MM-YYYY'
                                                )
                                            )
                                        }
                                        variant="inline"
                                        openTo="year"
                                        views={['year', 'month']}
                                        label="Mes y año"
                                        helperText="Seleccione el mes y el año"
                                        autoOk={true}
                                    />

                                    {/* Resumen financiero mensual */}
                                    <Box className={classes.financialSummary}>
                                        <div className={classes.financialItem}>
                                            <div className={classes.financialValue} style={{ color: '#1976d2' }}>
                                                ${totalRevenue.toFixed(2)}
                                            </div>
                                            <div className={classes.financialLabel}>Ingresos Totales</div>
                                        </div>
                                        <div className={classes.financialItem}>
                                            <div className={classes.financialValue} style={{ color: '#4CAF50' }}>
                                                ${totalReceived.toFixed(2)}
                                            </div>
                                            <div className={classes.financialLabel}>Total Recibido</div>
                                        </div>
                                        <div className={classes.financialItem}>
                                            <div className={classes.financialValue} style={{ color: '#ff9800' }}>
                                                ${(totalRevenue - totalReceived).toFixed(2)}
                                            </div>
                                            <div className={classes.financialLabel}>Comisiones</div>
                                        </div>
                                    </Box>
                                </CardBody>
                            </Card>
                        )}
                    </GridItem>
                </GridContainer>
            </Box>
        </MuiPickersUtilsProvider>
    )
}
