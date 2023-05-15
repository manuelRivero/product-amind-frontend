import React, { useEffect, useState } from 'react'
import { AccessTime, ArrowUpward } from '@material-ui/icons'
import Card from 'components/Card/Card'
import CardFooter from 'components/Card/CardFooter'
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
// import { getMonthlySales } from 'store/dashboard'
import 'moment/locale/es'  // without this line it didn't work

moment.locale('es')
console.log('dailySalesChart', dailySalesChart)
const useStyles = makeStyles(styles)

export default function MainCharts() {
    const classes = useStyles()
    //redux
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)

    //states
    const [chartData, setChartData] = useState(null)
    const [chartLabels, setChartLabels] = useState(null)
    const [sales, setSales] = useState([])
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
            console.log('response', response)
            setSales(response.payload.data.sales)
        }
        getData()
    }, [])

    useEffect(() => {
        const getData = async () => {
            if (sales) {
                console.log('sales')
                const labels = new Array(
                    moment(selectedDate, 'DD-MM-YYYY').daysInMonth()
                )
                    .fill(0)
                    .map((day, i) => i + 1)
                console.log('labels', labels)
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
                            saleValue = sale.total
                        } else {
                            saleValue = 0
                        }
                    })

                    return saleValue
                })
                console.log('series', series)
                setChartData(series)

                setChartLabels(labels)
            }
        }
        getData()
    }, [sales])
    console.log('sales', sales)
    return (
        <MuiPickersUtilsProvider locale={'es'} utils={MomentUtils}>
            <GridContainer>
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
                                        high: Math.max(chartData),
                                    }}
                                    listener={dailySalesChart.animation}
                                />
                            </CardHeader>
                            <CardBody>
                                <h4 className={classes.cardTitle}>
                                    Ventas mensuales
                                </h4>
                                {console.log("selected date",new Date(moment(selectedDate, "DD-MM-YYYY")))}
                                <DatePicker
                                    lang="es"
                                    onChange={(e) => dateChangeHandler(e)}
                                    value={new Date(moment(selectedDate, "DD-MM-YYYY"))}
                                    variant="inline"
                                    openTo="year"
                                    views={['year', 'month']}
                                    label="Mes y año"
                                    helperText="Seleccione el mes y el año"
                                />
                                <p className={classes.cardCategory}>
                                    <span className={classes.successText}>
                                        <ArrowUpward
                                            className={
                                                classes.upArrowCardCategory
                                            }
                                        />{' '}
                                        55%
                                    </span>{' '}
                                    increase in today sales.
                                </p>
                            </CardBody>
                            <CardFooter chart>
                                <div className={classes.stats}>
                                    <AccessTime /> updated 4 minutes ago
                                </div>
                            </CardFooter>
                        </Card>
                    )}
                </GridItem>
            </GridContainer>
        </MuiPickersUtilsProvider>
    )
}
