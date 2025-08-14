import React, { useMemo, useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import GridItem from 'components/Grid/GridItem.js'
import GridContainer from 'components/Grid/GridContainer.js'
import Table from 'components/Table/Table.js'
import Card from 'components/Card/Card.js'
import CardHeader from 'components/Card/CardHeader.js'
import CardBody from 'components/Card/CardBody.js'
import { useDispatch, useSelector } from 'react-redux'
import { getTopProducts } from '../../../store/dashboard'
import { formatNumber } from '../../../helpers/product'
import { Box, CircularProgress } from '@material-ui/core'
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
import moment from 'moment'
import MomentUtils from '@date-io/moment'
import EmptyTablePlaceholder from '../../EmptyTablePlaceholder'

const styles = {
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

export default function BestSellers() {
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
            <GridContainer>
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