import React, { useMemo, useState } from 'react'
// @material-ui/core
import { makeStyles } from '@material-ui/core/styles'
// @material-ui/icons
// import BugReport from '@material-ui/icons/BugReport'
// import Code from '@material-ui/icons/Code'
// import Cloud from '@material-ui/icons/Cloud'
// core components
import GridItem from 'components/Grid/GridItem.js'
import GridContainer from 'components/Grid/GridContainer.js'
import Table from 'components/Table/Table.js'
// import Tasks from 'components/Tasks/Tasks.js'
// import CustomTabs from 'components/CustomTabs/CustomTabs.js'
import Card from 'components/Card/Card.js'
import CardHeader from 'components/Card/CardHeader.js'
import CardBody from 'components/Card/CardBody.js'

// import { bugs, website, server } from 'variables/general.js'

import styles from 'assets/jss/material-dashboard-react/views/dashboardStyle.js'
import MainStats from 'components/dashboard/mainStats'
import MainCharts from 'components/dashboard/mainCharts'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getTopProducts } from 'store/dashboard'
import PendingOrders from '../../components/dashboard/pendingOrders'
import { formatNumber } from '../../helpers/product'
import { Box, CircularProgress } from '@material-ui/core'
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
import moment from 'moment'
import MomentUtils from '@date-io/moment'
import EmptyTablePlaceholder from '../../components/EmptyTablePlaceholder'

const useStyles = makeStyles(styles)

export default function Dashboard() {
    const classes = useStyles()
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const { topProductsData, loadingTopsProducts } = useSelector(
        (state) => state.dashboard
    )

    const [selectedDate, setSelectedDate] = useState(
        moment(new Date()).format('DD-MM-YYYY')
    )

    const dateChangeHandler = async (e) => {
        console.log('selected date', e)
        dispatch(
            getTopProducts({
                access: user.token,
                page: 0,
                date: moment(e).format('DD-MM-YYYY'),
            })
        )
        setSelectedDate(moment(e).format('DD-MM-YYYY'))
    }

    useEffect(() => {
        const getData = async () => {
            dispatch(
                getTopProducts({
                    access: user.token,
                    page: 0,
                    date: selectedDate,
                })
            )
        }
        getData()
    }, [])

    const handleContent = useMemo(() => {
        if (topProductsData) {
            return topProductsData && topProductsData?.data?.length === 0 ? (
                <EmptyTablePlaceholder title="No hay información de productos para la fecha seleccionada" />
            ) : (
                <Table
                    tableHeaderColor="warning"
                    tableHead={['ID', 'Nombre', 'Precio', 'Cantidad']}
                    tableData={topProductsData.data.map((product) => {
                        const productData = product
                        return [
                            productData.data._id,
                            productData.data.name,
                            '$' + formatNumber(productData.data.price),
                            product.count,
                        ]
                    })}
                />
            )
        }
        return null
    }, [topProductsData])
    return (
        <div>
            <PendingOrders />
            <MainStats />
            <MainCharts />
            <GridContainer>
                {/* <GridItem xs={12} sm={12} md={6}>
                     <CustomTabs
                        title="Tasks:"
                        headerColor="primary"
                        tabs={[
                            {
                                tabName: 'Bugs',
                                tabIcon: BugReport,
                                tabContent: (
                                    <Tasks
                                        checkedIndexes={[0, 3]}
                                        tasksIndexes={[0, 1, 2, 3]}
                                        tasks={bugs}
                                    />
                                ),
                            },
                            {
                                tabName: 'Website',
                                tabIcon: Code,
                                tabContent: (
                                    <Tasks
                                        checkedIndexes={[0]}
                                        tasksIndexes={[0, 1]}
                                        tasks={website}
                                    />
                                ),
                            },
                            {
                                tabName: 'Server',
                                tabIcon: Cloud,
                                tabContent: (
                                    <Tasks
                                        checkedIndexes={[1]}
                                        tasksIndexes={[0, 1, 2]}
                                        tasks={server}
                                    />
                                ),
                            },
                        ]}
                    /> 
                </GridItem> */}
                <GridItem xs={12} sm={12} md={12}>
                    <MuiPickersUtilsProvider locale={'es'} utils={MomentUtils}>
                        <Card>
                            <CardHeader color="warning">
                                <h4 className={classes.cardTitleWhite}>
                                    Productos más vendidos
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
                                {loadingTopsProducts && !topProductsData ? (
                                    <Box display="flex" justifyContent="center">
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
