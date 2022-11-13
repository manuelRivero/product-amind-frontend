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
import { useSelector } from 'react-redux'
import ChartistGraph from 'react-chartist'
import CardBody from 'components/Card/CardBody'
import { dailySalesChart } from 'variables/charts'
const useStyles = makeStyles(styles)

export default function MainCharts() {
    const classes = useStyles()
    //redux
    const { dailySales } = useSelector((state) => state.dashboard)
    //states
    const [dailyChartData, setDailyChartData] = useState(null)

    useEffect(() => {
        if (dailySales) {
            const series = dailySalesChart.data.labels.map((e, i) => {
                return dailySales[i] ? dailySales[i].total : 0
            })
            setDailyChartData(series)
        }
    }, [dailySales])

    return (
        <GridContainer>
            <GridItem xs={12} sm={12} md={4}>
                {dailyChartData && (
                    <Card chart>
                        <CardHeader color="success">
                            <ChartistGraph
                                className="ct-chart"
                                data={{
                                    labels: dailySalesChart.data.labels,
                                    series: [dailyChartData],
                                }}
                                type="Line"
                                options={{...dailySalesChart.options, high: Math.max(dailyChartData) }}
                                listener={dailySalesChart.animation}
                            />
                        </CardHeader>
                        <CardBody>
                            <h4 className={classes.cardTitle}>Daily Sales</h4>
                            <p className={classes.cardCategory}>
                                <span className={classes.successText}>
                                    <ArrowUpward
                                        className={classes.upArrowCardCategory}
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
            <GridItem xs={12} sm={12} md={4}>
                <Card chart>
                    <CardHeader color="warning">
                        {/* <ChartistGraph
                    className="ct-chart"
                    data={emailsSubscriptionChart.data}
                    type="Bar"
                    options={emailsSubscriptionChart.options}
                    responsiveOptions={
                        emailsSubscriptionChart.responsiveOptions
                    }
                    listener={emailsSubscriptionChart.animation}
                /> */}
                    </CardHeader>
                    <CardBody>
                        <h4 className={classes.cardTitle}>
                            Email Subscriptions
                        </h4>
                        <p className={classes.cardCategory}>
                            Last Campaign Performance
                        </p>
                    </CardBody>
                    <CardFooter chart>
                        <div className={classes.stats}>
                            <AccessTime /> campaign sent 2 days ago
                        </div>
                    </CardFooter>
                </Card>
            </GridItem>
            <GridItem xs={12} sm={12} md={4}>
                <Card chart>
                    <CardHeader color="danger">
                        {/* <ChartistGraph
                    className="ct-chart"
                    data={completedTasksChart.data}
                    type="Line"
                    options={completedTasksChart.options}
                    listener={completedTasksChart.animation}
                /> */}
                    </CardHeader>
                    <CardBody>
                        <h4 className={classes.cardTitle}>Completed Tasks</h4>
                        <p className={classes.cardCategory}>
                            Last Campaign Performance
                        </p>
                    </CardBody>
                    <CardFooter chart>
                        <div className={classes.stats}>
                            <AccessTime /> campaign sent 2 days ago
                        </div>
                    </CardFooter>
                </Card>
            </GridItem>
        </GridContainer>
    )
}
