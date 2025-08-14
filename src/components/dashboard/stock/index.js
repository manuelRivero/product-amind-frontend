import React, { useMemo, useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import GridItem from 'components/Grid/GridItem.js'
import GridContainer from 'components/Grid/GridContainer.js'
import Table from 'components/Table/Table.js'
import Card from 'components/Card/Card.js'
import CardHeader from 'components/Card/CardHeader.js'
import CardBody from 'components/Card/CardBody.js'
import { Box, CircularProgress } from '@material-ui/core'
import EmptyTablePlaceholder from '../../EmptyTablePlaceholder'
import { formatNumber } from '../../../helpers/product'
const MIN_STOCK = 5
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

export default function StockAlerts() {
    const classes = useStyles()

    // Mock data for stock alerts - in a real implementation this would come from an API
    const [stockAlertsData, setStockAlertsData] = useState(null)
    const [loadingStockAlerts, setLoadingStockAlerts] = useState(true)
  

    // Mock function to simulate API call
    const getStockAlerts = async () => {
        setLoadingStockAlerts(true)
        // Simulate API delay
        setTimeout(() => {
            // Mock data - products with low stock
            const mockData = {
                data: [
                    {
                        _id: '1',
                        name: 'Producto A',
                        price: 1500,
                        stock: 5,
                        minStock: 10,
                        category: 'Electrónicos'
                    },
                    {
                        _id: '2',
                        name: 'Producto B',
                        price: 2500,
                        stock: 3,
                        minStock: 8,
                        category: 'Ropa'
                    },
                    {
                        _id: '3',
                        name: 'Producto C',
                        price: 800,
                        stock: 0,
                        minStock: 5,
                        category: 'Hogar'
                    },
                    {
                        _id: '4',
                        name: 'Producto D',
                        price: 3200,
                        stock: 2,
                        minStock: 15,
                        category: 'Deportes'
                    },
                    {
                        _id: '5',
                        name: 'Producto E',
                        price: 1200,
                        stock: 1,
                        minStock: 12,
                        category: 'Juguetes'
                    }
                ]
            }
            setStockAlertsData(mockData)
            setLoadingStockAlerts(false)
        }, 1000)
    }


    useEffect(() => {
        getStockAlerts()
    }, [])

    const handleContent = useMemo(() => {
        if (stockAlertsData) {
            return stockAlertsData && stockAlertsData?.data?.length === 0 ? (
                <EmptyTablePlaceholder title="No hay alertas de stock para la fecha seleccionada" />
            ) : (
                <Table
                    tableHeaderColor="danger"
                    tableHead={['ID', 'Nombre', 'Categoría', 'Precio', 'Stock Actual', 'Estado']}
                    tableData={stockAlertsData.data.map((product) => {
                        const isOutOfStock = product.stock === 0
                        const isLowStock = product.stock <= MIN_STOCK && product.stock > 0

                        let status = ''
                        let statusColor = ''

                        if (isOutOfStock) {
                            status = 'Sin stock'
                            statusColor = 'danger'
                        } else if (isLowStock) {
                            status = 'Stock bajo'
                            statusColor = 'warning'
                        }

                        return [
                            product._id,
                            product.name,
                            product.category,
                            '$' + formatNumber(product.price),
                            product.stock,
                            <span key={product._id} style={{
                                color: statusColor === 'danger' ? '#f44336' : '#ff9800',
                                fontWeight: 'bold'
                            }}>
                                {status}
                            </span>
                        ]
                    })}
                />
            )
        }
        return null
    }, [stockAlertsData])

    return (
        <div>
            <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                    <Card>
                        <CardHeader color="danger">
                            <h4 className={classes.cardTitleWhite}>
                                Alertas de Stock
                            </h4>
                        </CardHeader>
                        <CardBody>
                            {loadingStockAlerts && !stockAlertsData ? (
                                <Box display="flex" justifyContent="center">
                                    <CircularProgress />
                                </Box>
                            ) : (
                                handleContent
                            )}
                        </CardBody>
                    </Card>
                </GridItem>
            </GridContainer>
        </div>
    )
} 