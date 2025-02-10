import React, { useEffect } from 'react'
// @material-ui/core components
import { makeStyles } from '@material-ui/core/styles'
// core components
import GridItem from 'components/Grid/GridItem.js'
import GridContainer from 'components/Grid/GridContainer.js'
import Table from 'components/Table/Table.js'
import Card from 'components/Card/Card.js'
import CardHeader from 'components/Card/CardHeader.js'
import CardBody from 'components/Card/CardBody.js'
import { useDispatch, useSelector } from 'react-redux'
import { getSale } from 'store/sales'

import { useParams } from 'react-router-dom'
import { Box, Grid, IconButton } from '@material-ui/core'
import moment from 'moment'

import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import { finalPrice, formatNumber } from '../../helpers/product'
import { Link, useHistory } from 'react-router-dom'
import Button from 'components/CustomButtons/Button'

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
    backButton: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        cursor: 'pointer',
    },
}

const useStyles = makeStyles(styles)

export default function SaleDetail() {
    const history = useHistory()
    const { id } = useParams()
    console.log('id', id)
    const classes = useStyles()
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const { saleData, loadingSaleData } = useSelector((state) => state.sales)

    useEffect(() => {
        dispatch(getSale({ access: user.token, id }))
    }, [])
    return (
        <>
            <IconButton
                className={classes.backButton}
                onClick={() => history.push('/admin/orders')}
            >
                <ArrowBackIcon />
            </IconButton>
            <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                    <Card>
                        <CardHeader color="primary">
                            <h4 className={classes.cardTitleWhite}>
                                Detalle de la orden {id}
                            </h4>
                            <p className={classes.cardCategoryWhite}>
                                Visualiza los productos y todo el detalle de la
                                orden
                            </p>
                        </CardHeader>
                        <CardBody>
                            {loadingSaleData ? (
                                <p>Cargando datos...</p>
                            ) : (
                                <Box>
                                    <Grid container spacing={4}>
                                        <Grid item>
                                            <p>
                                                Nombre:{' '}
                                                <strong>{saleData.name}</strong>
                                            </p>
                                            <p>
                                                Apellido:{' '}
                                                <strong>
                                                    {saleData.lastName}
                                                </strong>
                                            </p>
                                            <p>
                                                DNI:{' '}
                                                <strong>{saleData.dni}</strong>
                                            </p>
                                            <p>
                                                Email:{' '}
                                                <strong>{saleData.user}</strong>
                                            </p>
                                            <p>
                                                Dirección:{' '}
                                                <strong>
                                                    {saleData.address}
                                                </strong>
                                            </p>
                                            <p>
                                                Código postal:{' '}
                                                <strong>
                                                    {saleData.postalCode}
                                                </strong>
                                            </p>
                                        </Grid>
                                        <Grid item>
                                            <p>
                                                Estatus:{' '}
                                                <strong>
                                                    {saleData.status}
                                                </strong>
                                            </p>
                                            <p>
                                                Fecha:{' '}
                                                <strong>
                                                    {' '}
                                                    {moment(saleData.createdAt)
                                                        .utc()
                                                        .format(
                                                            'DD-MM-YYYY HH:mm:ss A'
                                                        )}{' '}
                                                </strong>
                                            </p>
                                            <p>
                                                Total de la orden:{' '}
                                                <strong>
                                                    ${' '}
                                                    {saleData.products
                                                        .reduce(
                                                            (acc, item) =>
                                                                acc +
                                                                finalPrice(
                                                                    item.data
                                                                        .price,
                                                                    item.data
                                                                        .discount
                                                                ) *
                                                                    item.quantity,
                                                            0
                                                        )
                                                        .toFixed(1)}
                                                </strong>
                                            </p>
                                        </Grid>
                                    </Grid>
                                    <Table
                                        tableHeaderColor="primary"
                                        tableHead={[
                                            'Id del producto',
                                            'Nombre del producto',
                                            'Cantidad',
                                            'variante',
                                            'Precio',
                                            'Descuento',
                                            'Precio final',
                                            'Acciones',
                                        ]}
                                        tableData={saleData.products.map(
                                            (product) => {
                                                console.log(
                                                    'format number',
                                                    formatNumber(
                                                        finalPrice(
                                                            product.data.price,
                                                            product.data
                                                                .discount
                                                        )
                                                    )
                                                )
                                                return [
                                                    product.data._id,
                                                    product.data.name,
                                                    product.quantity,
                                                    `Color: ${
                                                        product.data.color
                                                    } ${
                                                        product.data.size
                                                            ? '- Talle:' +
                                                              product.data.size
                                                            : ''
                                                    }`,
                                                    '$' +
                                                        formatNumber(
                                                            product.data.price,
                                                            product.data
                                                                .discount
                                                        ) +
                                                        '%',
                                                    `$${formatNumber(
                                                        finalPrice(
                                                            product.data.price,
                                                            product.data
                                                                .discount
                                                        )
                                                    )}`,
                                                    <Link
                                                        key={`detail-button-${product.data._id}`}
                                                        to={`/admin/product-detail/${product.data._id}`}
                                                    >
                                                        <Button
                                                            isLoading={false}
                                                            variant="contained"
                                                            color="primary"
                                                            type="button"
                                                        >
                                                            Ver producto
                                                        </Button>
                                                    </Link>,
                                                ]
                                            }
                                        )}
                                    />
                                </Box>
                            )}
                        </CardBody>
                    </Card>
                </GridItem>
            </GridContainer>
        </>
    )
}
