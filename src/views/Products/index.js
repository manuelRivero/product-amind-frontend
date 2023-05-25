import React from 'react'
import { Box, makeStyles } from '@material-ui/core'
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import GridContainer from 'components/Grid/GridContainer'
import GridItem from 'components/Grid/GridItem'
import Table from 'components/Table/Table.js'
import Button from 'components/CustomButtons/Button.js'
import PropTypes from 'prop-types'

//icons
import VisibilityIcon from '@material-ui/icons/Visibility'
import EditIcon from '@material-ui/icons/Edit'
import DeleteIcon from '@material-ui/icons/Delete'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import AddIcon from '@material-ui/icons/Add';

import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { getProducts } from 'store/products'
import ReactPaginate from 'react-paginate'

const useStyles = makeStyles({
    cardCategory: {
        color: '#999',
    },
    cardTitle: { color: '#3C4858' },
    pagination: {
        display: 'flex',
        margin: 0,
        padding: 0,
        listStyle: 'none',
        gap: '1rem',
        marginTop: '1rem',
        justifyContent: 'center',
        alignItems: 'center',
    },
    page: {
        padding: '.5rem',
        borderRadius: '4px',
        border: 'solid 1px transparent',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '25px',
        height: '25px',
    },
    activePage: {
        border: 'solid 1px #9c27b0',
    },
    addProductWrapper: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        height: '100%',
    },
    addProductContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '.5rem'
    },
})

export default function Products() {
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const { productsData, loadingProductsData } = useSelector(
        (state) => state.products
    )
    // styles
    const classes = useStyles()
    // states
    const [page] = useState(0)

    const handlePageClick = (e) => {
        console.log('handlePageClick', e)
    }

    useEffect(() => {
        dispatch(getProducts({ access: user.access, filters: { page: 0 } }))
    }, [])
    useEffect(() => {
        if (page > 0) {
            dispatch(getProducts({ access: user.access, filters: { page } }))
        }
    }, [page])
    console.log('loadingProductsData', loadingProductsData)
    console.log('productsData', productsData)
    return (
        <GridContainer>
            <GridItem xs={12} sm={12} md={6}>
                <Card>
                    <CardHeader color="primary">
                        <h4 className={classes.cardTitleWhite}>
                            Carga masiva de productos
                        </h4>
                    </CardHeader>
                    <CardBody>
                        <p>Sube tus productos masivamente desde un excel</p>
                        <Button
                            isLoading={false}
                            variant="contained"
                            color="primary"
                            type="button"
                        >
                            Ir a carga masiva
                        </Button>
                    </CardBody>
                </Card>
            </GridItem>
            <GridItem xs={12} sm={12} md={6}>
                <Card>
                    <CardHeader color="primary">
                        <h4 className={classes.cardTitleWhite}>
                            Carga masiva de imágenes
                        </h4>
                    </CardHeader>
                    <CardBody>
                        <p>
                            Sube las imágenes de tus productos desde un archivo
                            zip
                        </p>
                        <Button
                            isLoading={false}
                            variant="contained"
                            color="primary"
                            type="button"
                        >
                            Ir a subir fotos
                        </Button>
                    </CardBody>
                </Card>
            </GridItem>
            <GridItem xs={12} sm={12} md={12}>
                <Card>
                    <CardHeader color="primary">
                        <GridContainer>
                            <GridItem xs={12} sm={12} md={6}>
                                <h4 className={classes.cardTitleWhite}>
                                    Productos en la tienda
                                </h4>
                                <p className={classes.cardCategoryWhite}>
                                    Aquí puedes visualizar tu listado de
                                    productos
                                </p>
                            </GridItem>
                            <GridItem xs={12} sm={12} md={6}>
                                <Box className={classes.addProductWrapper}>
                                    <Box
                                        className={classes.addProductContainer}
                                    >
                                        <p
                                            className={
                                                classes.cardCategoryWhite
                                            }
                                        >
                                            Agrega un nuevo producto
                                        </p>
                                        <Button
                                            isLoading={false}
                                            variant="contained"
                                            color="white"
                                            type="button"
                                            size="sm"
                                            justIcon
                                        >
                                            <AddIcon />
                                        </Button>
                                    </Box>
                                </Box>
                            </GridItem>
                        </GridContainer>
                    </CardHeader>
                    <CardBody>
                        {loadingProductsData ? (
                            <p>Cargando datos ...</p>
                        ) : (
                            <>
                                <Table
                                    tableHeaderColor="primary"
                                    tableHead={[
                                        'id',
                                        'Nombre',
                                        'Precio',
                                        'Stock',
                                        'Descuento',
                                        'Etiquetas',
                                        'Estatus',
                                    ]}
                                    tableData={productsData.data.map((e) => {
                                        return [
                                            e._id,
                                            e.name,
                                            e.price,
                                            e.stock,
                                            e.discount ? e.discount : 0,
                                            e.tags
                                                .map((tag) => tag.name)
                                                .join(','),
                                            e.status
                                                ? e.status.available
                                                    ? 'Disponible'
                                                    : 'No disponible'
                                                : 'Sin información',
                                        ]
                                    })}
                                />

                                <ReactPaginate
                                    pageClassName={classes.page}
                                    containerClassName={classes.pagination}
                                    activeClassName={classes.activePage}
                                    breakLabel="..."
                                    nextLabel={
                                        <Button
                                            isLoading={false}
                                            variant="contained"
                                            color="primary"
                                            type="button"
                                            justIcon
                                        >
                                            <ChevronRightIcon />
                                        </Button>
                                    }
                                    onPageChange={() => handlePageClick()}
                                    pageRangeDisplayed={5}
                                    pageCount={Math.ceil(
                                        productsData.pageInfo / 10
                                    )}
                                    previousLabel={
                                        <Button
                                            isLoading={false}
                                            variant="contained"
                                            color="primary"
                                            type="button"
                                            justIcon
                                        >
                                            <ChevronLeftIcon />
                                        </Button>
                                    }
                                    renderOnZeroPageCount={null}
                                />
                            </>
                        )}
                    </CardBody>
                </Card>
            </GridItem>
        </GridContainer>
    )
}

const ActionGroup = ({ product }) => {
    const [isLoading, setIsLoading] = useState(false)
    const deleteHandler = () => {
        try {
            console.log('product', product)
            setIsLoading(true)
        } catch (error) {
            console.log('deleteHandler error', error)
        } finally {
            setIsLoading(false)
        }
    }
    return (
        <Box>
            <Button
                isLoading={false}
                variant="contained"
                color="primary"
                type="submit"
                justIcon
            >
                <VisibilityIcon />
            </Button>
            <Button
                isLoading={false}
                variant="contained"
                color="primary"
                type="submit"
                justIcon
            >
                <EditIcon />
            </Button>
            <Button
                isLoading={isLoading}
                variant="contained"
                color="primary"
                type="submit"
                justIcon
                onClick={deleteHandler}
            >
                <DeleteIcon />
            </Button>
        </Box>
    )
}

ActionGroup.propTypes = {
    product: PropTypes.object,
}
