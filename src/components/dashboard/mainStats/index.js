
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import React, { useEffect, useState } from 'react'
//
import { makeStyles } from '@material-ui/core/styles'

import styles from 'assets/jss/material-dashboard-react/views/dashboardStyle.js'
import { useDispatch, useSelector } from 'react-redux'
import { getStats } from 'store/dashboard'
import TotalSalesSelect from '../totalSalesSelect'
import moment from 'moment'
// import io from 'socket.io-client'
// import { userAdded } from 'store/dashboard'

// const socket = io('ws://localhost:5000')

const useStyles = makeStyles(styles)

export default function MainStats() {

    const classes = useStyles()
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const { salesStats } = useSelector((state) => state.dashboard)

    const [date, setDate] = useState(moment(new Date()).format('DD-MM-YYYY'))
    useEffect(() => {
        dispatch(getStats({ access: user.token }))
    }, [])

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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flexGrow: 0 }}>
                        <TotalSalesSelect onDateChange={handleDaylySaleDate} />
                    </div>

                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'baseline', gap: '10px' }}>
                    <p className={classes.cardTitle}>Total en ventas:</p> <h3 className={classes.cardTitle}>${Number(salesStats).toFixed(1)}</h3>
                </div>
            </CardBody>
        </Card>

    )
}
