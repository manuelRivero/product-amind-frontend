
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import React, { useEffect, useState } from 'react'
//
import { makeStyles } from '@material-ui/core/styles'

import styles from 'assets/jss/material-dashboard-react/views/dashboardStyle.js'
import { useDispatch, useSelector } from 'react-redux'
import { getStats } from 'store/dashboard'
import { getSales } from 'store/sales'
import TotalSalesSelect from '../totalSalesSelect'
import moment from 'moment'
// import io from 'socket.io-client'
// import { userAdded } from 'store/dashboard'

// const socket = io('ws://localhost:5000')

const useStyles = makeStyles((theme) => ({
    ...styles,
    container: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statsContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: theme.spacing(2),
    },
    statItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        margin: 0,
        fontSize: '0.9rem',
        color: '#666',
    },
    statValue: {
        margin: theme.spacing(0.5, 0),
    },
    totalSalesValue: {
        color: '#00ACC1',
    },
    totalReceivedValue: {
        color: '#4CAF50',
    },
    selectorContainer: {
        flexGrow: 0,
    },
}))

export default function MainStats() {

    const classes = useStyles()
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const { salesData } = useSelector((state) => state.sales)

    const [date, setDate] = useState(moment(new Date()).format('DD-MM-YYYY'))
    const [totalSales, setTotalSales] = useState(0)
    const [totalReceived, setTotalReceived] = useState(0)

    useEffect(() => {
        // Obtener ventas para calcular estadísticas
        dispatch(getSales({ access: user.token, page: 0 }))
    }, [])

    // Calcular totales cuando cambien las ventas o la fecha
    useEffect(() => {
        if (salesData && salesData.sales) {
            const {sales} = salesData;

            // Calcular totales
            const total = sales.reduce((acc, sale) => {
                return acc + sale.total;
            }, 0);

            const totalReceivedAmount = sales.reduce((acc, sale) => {
                const marketplaceFee = sale.marketplaceFee || 0;
                const feePercentage = marketplaceFee < 1 ? marketplaceFee * 100 : marketplaceFee;
                const commissionAmount = (sale.total * feePercentage / 100);
                const saleReceived = sale.total - commissionAmount;
                return acc + saleReceived;
            }, 0);

            setTotalSales(total);
            setTotalReceived(totalReceivedAmount);
        }
    }, [salesData, date])

    const handleDaylySaleDate = (date) => {
        console.log("date", date)
        setDate(date.format('DD-MM-YYYY'))
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
                <h4 className={classes.cardTitleWhite}>Ventas para el {date}</h4>
            </CardHeader>
            <CardBody>
                <div className={classes.container}>
                    <div className={classes.selectorContainer}>
                        <TotalSalesSelect onDateChange={handleDaylySaleDate} />
                    </div>
                </div>
                <div className={classes.statsContainer}>
                    <div className={classes.statItem}>
                        <p className={`${classes.cardTitle} ${classes.statLabel}`}>Total en ventas:</p>
                        <h3 className={`${classes.cardTitle} ${classes.statValue} ${classes.totalSalesValue}`}>
                            ${Number(totalSales).toFixed(1)}
                        </h3>
                    </div>
                    <div className={classes.statItem}>
                        <p className={`${classes.cardTitle} ${classes.statLabel}`}>Total recibido:</p>
                        <h3 className={`${classes.cardTitle} ${classes.statValue} ${classes.totalReceivedValue}`}>
                            ${Number(totalReceived).toFixed(1)}
                        </h3>
                    </div>
                </div>
            </CardBody>
        </Card>

    )
}
