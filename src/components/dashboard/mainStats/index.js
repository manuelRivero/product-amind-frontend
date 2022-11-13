import {
    Accessibility,
    DateRange,
    LocalOffer,
    Store,
    Update,
} from '@material-ui/icons'
import Icon from '@material-ui/core/Icon'
import Card from 'components/Card/Card'
import CardFooter from 'components/Card/CardFooter'
import CardHeader from 'components/Card/CardHeader'
import CardIcon from 'components/Card/CardIcon'
import GridContainer from 'components/Grid/GridContainer'
import GridItem from 'components/Grid/GridItem'
import React, { useEffect } from 'react'
//
import { makeStyles } from '@material-ui/core/styles'

import styles from 'assets/jss/material-dashboard-react/views/dashboardStyle.js'
import { useDispatch, useSelector } from 'react-redux'
import { getStats } from 'store/dashboard'

const useStyles = makeStyles(styles)

export default function MainStats() {
    //redux
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const { salesStats, users } = useSelector((state) => state.dashboard)
    console.log('salesStats from main staks', salesStats)
    const classes = useStyles()

    useEffect(() => {
        dispatch(getStats({ access: user.token }))
    }, [])

    return (
        <GridContainer>
            <GridItem xs={12} sm={6} lg={3}>
                <Card>
                    <CardHeader color="warning" stats icon>
                        <CardIcon color="warning">
                            <Icon>content_copy</Icon>
                        </CardIcon>
                        <p className={classes.cardCategory}>
                            Ventas
                        </p>
                        <h3 className={classes.cardTitle}>{salesStats}</h3>
                    </CardHeader>
                    <CardFooter stats>
                        <div className={classes.stats}>
                            Los ultimos 7 días
                        </div>
                    </CardFooter>
                </Card>
            </GridItem>
            <GridItem xs={12} sm={6} lg={3}>
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
                            Just Updated
                        </div>
                    </CardFooter>
                </Card>
            </GridItem>
        </GridContainer>
    )
}
