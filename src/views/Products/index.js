import React from 'react'
import {
    Box,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    makeStyles,
} from '@material-ui/core'
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import GridContainer from 'components/Grid/GridContainer'
import GridItem from 'components/Grid/GridItem'
import Table from 'components/Table/Table.js'
import Button from 'components/CustomButtons/Button.js'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

//icons
import EditIcon from '@material-ui/icons/Edit'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import AddIcon from '@material-ui/icons/Add'

import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { getProducts } from 'store/products'
import ReactPaginate from 'react-paginate'
import TextInput from 'components/TextInput/Index'

import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { finalPrice, formatNumber } from '../../helpers/product'
import {
    DeleteForever,
    RemoveRedEye,
    Search,
    DeleteForeverOutlined,
} from '@material-ui/icons'
import { deleteProduct } from '../../store/products'

const schema = yup.object({
    search: yup.string(),
})

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
        '& > a': {
            color: '#3c4858',
        },
    },
    activePage: {
        border: 'solid 1px #00ACC1 !important',
        '& > a': {
            color: '#00ACC1',
        },
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
        gap: '.5rem',
    },
    actionWrapper: {
        display: 'flex',
        gap: '1rem',
    },
    filterWrapper: {
        marginTop: '1rem',
        display: 'flex',
        gap: '1rem',
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
    const [page, setPage] = useState(0)

    //form
    const { control, handleSubmit, watch, reset } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            search: '',
        },
    })

    const watchSearch = watch('search')

    const handlePageClick = ({ selected }) => {
        console.log('selected', selected)
        setPage(selected)
        const element = document.getElementById('table-header')
        element.scrollIntoView()
    }

    const handleDeleteSearch = () => {
        setPage(0)
        reset({
            search: '',
        })
        dispatch(
            getProducts({
                access: user.token,
                filters: { page: 0 },
            })
        )
    }

    const submit = () => {
        setPage(0)
        dispatch(
            getProducts({
                access: user.token,
                filters: { search: watchSearch, page: 0 },
            })
        )
    }

    useEffect(() => {
        const params = {
            access: user.token,
            filters: {
                page,
            },
        }
        if (watchSearch) {
            params.filters.search = watchSearch
        }
        dispatch(getProducts(params))
    }, [page])

    return (
        <GridContainer>
            {/* <GridItem xs={12} sm={12} md={6}>
                <Card>
                    <CardHeader color="primary">
                        <h4 className={classes.cardTitleWhite}>
                            Carga masiva de productos
                        </h4>
                    </CardHeader>
                    <CardBody>
                        <p>Sube tus productos masivamente desde un excel</p>
                        <Link to="/admin/products/upload-from-excel">
                            <Button
                                isLoading={false}
                                variant="contained"
                                color="primary"
                                type="button"
                            >
                                Ir a carga masiva
                            </Button>
                        </Link>
                    </CardBody>
                </Card>
            </GridItem> */}
            {/* <GridItem xs={12} sm={12} md={6}>
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
                        <Link to="/admin/products/upload-images-from-zip">
                            <Button
                                isLoading={false}
                                variant="contained"
                                color="primary"
                                type="button"
                            >
                                Ir a subir fotos
                            </Button>
                        </Link>
                    </CardBody>
                </Card>
            </GridItem> */}
            <GridItem xs={12} sm={12} md={12}>
                <Card>
                    <CardHeader id="table-header" color="primary">
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
                                        <Link to="/admin/products/add-product">
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
                                        </Link>
                                    </Box>
                                </Box>
                            </GridItem>
                        </GridContainer>
                    </CardHeader>
                    <CardBody>
                        <form onSubmit={handleSubmit(submit)}>
                            <Box className={classes.filterWrapper}>
                                <Box>
                                    <Controller
                                        name="search"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <TextInput
                                                error={
                                                    fieldState.error
                                                        ? true
                                                        : false
                                                }
                                                errorMessage={fieldState.error}
                                                icon={null}
                                                label={'Nombre del producto'}
                                                value={field.value}
                                                onChange={({ target }) => {
                                                    field.onChange(target.value)
                                                }}
                                            />
                                        )}
                                    />
                                </Box>
                                {watchSearch && (
                                    <Box display="flex" flex={1}>
                                        <IconButton
                                            variant="contained"
                                            color="primary"
                                            type="submit"
                                            style={{
                                                alignSelf: 'center',
                                                color: 'rgba(0,175,195, 1)',
                                            }}
                                        >
                                            <Search />
                                        </IconButton>
                                        <IconButton
                                            onClick={handleDeleteSearch}
                                            variant="contained"
                                            color="primary"
                                            style={{
                                                alignSelf: 'center',
                                                color: 'red',
                                            }}
                                        >
                                            <DeleteForever />
                                        </IconButton>
                                    </Box>
                                )}
                            </Box>
                        </form>
                        {loadingProductsData ? (
                            <Box display="flex" justifyContent="center">
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <Table
                                    tableHeaderColor="primary"
                                    tableHead={[
                                        'id',
                                        'Nombre',
                                        'Categoría',
                                        'Precio',
                                        'Descuento',
                                        'Precio final',
                                        'Estatus',
                                        'Acciones',
                                    ]}
                                    tableData={productsData.data.products.map(
                                        (e) => {
                                            return [
                                                e._id,
                                                e.name,
                                                e.categoryDetail[0]?.name ?? "N/A",
                                                `$${formatNumber(
                                                    e.price.toFixed(1)
                                                )}`,
                                                e.discount
                                                    ? `${e.discount}%`
                                                    : 0,
                                                `$${formatNumber(
                                                    finalPrice(
                                                        e.price,
                                                        e.discount
                                                    )
                                                )}`,
                                                e.status
                                                    ? e.status.available
                                                        ? 'Disponible'
                                                        : 'No disponible'
                                                    : 'Sin información',
                                                <ActionGroup
                                                    product={e}
                                                    key={`action-group-${e._d}`}
                                                />,
                                            ]
                                        }
                                    )}
                                />

                                <ReactPaginate
                                    forcePage={page}
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
                                    onPageChange={(e) => handlePageClick(e)}
                                    pageRangeDisplayed={5}
                                    pageCount={Math.ceil(
                                        productsData.data.total / 10
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
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const classes = useStyles()
    const [isLoading, setIsLoading] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [success, setSuccess] = useState(false)
    const deleteHandler = async () => {
        try {
            setConfirmOpen(false)
            setIsLoading(true)
            await dispatch(
                deleteProduct({ access: user.token, id: product._id })
            ).unwrap()
            setSuccess(true)
        } catch (error) {
            console.log('deleteHandler error', error)
        } finally {
            setIsLoading(false)
        }
    }
    return (
        <>
            <Box className={classes.actionWrapper}>
                <Link to={`/admin/products/edit-product/${product._id}`}>
                    <Button
                        isLoading={false}
                        variant="contained"
                        color="primary"
                        type="submit"
                        justIcon
                    >
                        <EditIcon />
                    </Button>
                </Link>
                <Link to={`/admin/product-detail/${product._id}`}>
                    <Button
                        isLoading={false}
                        variant="contained"
                        color="primary"
                        type="submit"
                        justIcon
                    >
                        <RemoveRedEye />
                    </Button>
                </Link>
                <Button
                    isLoading={isLoading}
                    variant="contained"
                    color="primary"
                    type="submit"
                    justIcon
                    onClick={() => setConfirmOpen(true)}
                >
                    <DeleteForeverOutlined />
                </Button>
            </Box>
            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle>Confirmar cambio de estado</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Estás seguro de que deseas eliminar este producto? Esta
                        acción no se puede deshacer.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        disabled={isLoading}
                        onClick={() => setConfirmOpen(false)}
                        color="secondary"
                    >
                        Cancelar
                    </Button>
                    <Button
                        isLoading={isLoading}
                        onClick={deleteHandler}
                        color="primary"
                        variant="contained"
                    >
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={success} onClose={() => setSuccess(false)}>
                <DialogTitle>¡Exito!</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Producto eliminado correctamente.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setSuccess(false)}
                        color="primary"
                        variant="contained"
                    >
                        Aceptar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

ActionGroup.propTypes = {
    product: PropTypes.object,
}
