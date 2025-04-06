// import {
//     Accessibility,
//     DateRange,
//     LocalOffer,
//     Store,
//     Update,
// } from '@material-ui/icons'
import Icon from '@material-ui/core/Icon'
import Card from 'components/Card/Card'
import CardFooter from 'components/Card/CardFooter'
import CardHeader from 'components/Card/CardHeader'
import CardIcon from 'components/Card/CardIcon'
import GridContainer from 'components/Grid/GridContainer'
import GridItem from 'components/Grid/GridItem'
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
        console.log("date",date)
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
        <GridContainer>
            <GridItem xs={12}>
                <Card>
                    <CardHeader color="warning" stats icon>
                        <CardIcon color="warning">
                            <Icon>content_copy</Icon>
                        </CardIcon>
                        <p className={classes.cardCategory}>Ventas para el {date}</p>
                        
                        <h3 className={classes.cardTitle}>${Number(salesStats).toFixed(1)}</h3>
                    </CardHeader>
                    <CardFooter stats>
                        <TotalSalesSelect onDateChange={handleDaylySaleDate} />
                    </CardFooter>
                </Card>
            </GridItem>
            {/* <GridItem xs={12} sm={6} lg={3}>
                <Card>
                    <CardHeader color="success" stats icon>
                        <CardIcon color="success">
                            <Store />
                        </CardIcon>
                        <p className={classes.cardCategory}>Revenue</p>
                        <h3 className={classes.cardTitle}>$34,245</h3>
                    </CardHeader>
                    <CardFooter stats>
                        <div className={classes.stats}>
                            <DateRange />
                            Last 24 Hours
                        </div>
                    </CardFooter>
                </Card>
            </GridItem>
            <GridItem xs={12} sm={6} lg={3}>
                <Card>
                    <CardHeader color="danger" stats icon>
                        <CardIcon color="danger">
                            <Icon>info_outline</Icon>
                        </CardIcon>
                        <p className={classes.cardCategory}>Fixed Issues</p>
                        <h3 className={classes.cardTitle}>75</h3>
                    </CardHeader>
                    <CardFooter stats>
                        <div className={classes.stats}>
                            <LocalOffer />
                            Tracked from Github
                        </div>
                    </CardFooter>
                </Card>
            </GridItem>
            <GridItem xs={12} sm={6} lg={3}>
                <Card>
                    <CardHeader color="info" stats icon>
                        <CardIcon color="info">
                            <Accessibility />
                        </CardIcon>
                        <p className={classes.cardCategory}>Usuarios</p>
                        <h3 className={classes.cardTitle}>{users?.length}</h3>
                    </CardHeader>
                    <CardFooter stats>
                        <div className={classes.stats}>
                            <Update />
                        </div>
                    </CardFooter>
                </Card>
            </GridItem> */}
        </GridContainer>
    )
}
