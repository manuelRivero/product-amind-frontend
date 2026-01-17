import React from 'react'
import {
    Box,
    CircularProgress,
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
import ReactPaginate from 'react-paginate'
import TextInput from 'components/TextInput/Index'

import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { getCategories, deleteCategory } from 'store/categories'
import { DeleteForever, Search } from '@material-ui/icons'
import EmptyTablePlaceholder from '../../components/EmptyTablePlaceholder'
import CustomModal from 'components/CustomModal'

const schema = yup.object({
    search: yup.string(),
})

const useStyles = makeStyles({
    cardCategory: {
        color: '#999',
    },
    cardTitle: { color: '#3C4858' },
    cardTitleWhite: {
        color: '#FFFFFF',
        marginTop: 0,
        minHeight: 'auto',
        fontWeight: '300',
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        marginBottom: '3px',
        textDecoration: 'none',
    },
    cardCategoryWhite: {
        color: '#fff',
        margin: 0,
        fontSize: '14px',
        marginTop: 0,
        marginBottom: 0,
    },
    ctaRow: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: '1rem',
        margin: '1rem 0',
        padding: 0,
        width: '100%',
    },
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
    addCategoryContainer: {
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

export default function Categories() {
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const {
        categoriesData,
        loadingCategoriesData,
        error
    } = useSelector((state) => state.categories)

    // styles
    const classes = useStyles()
    // states
    const [page, setPage] = useState(0)

    // Estados para modales de eliminación
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [showErrorModal, setShowErrorModal] = useState(false)
    const [categoryToDelete, setCategoryToDelete] = useState(null)
    const [loadingDeleteCategory, setLoadingDeleteCategory] = useState(false)

    //form
    const { control, handleSubmit, watch, reset } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            search: '',
        },
    })

    const watchSearch = watch('search')

    const handlePageClick = ({ selected }) => {
        setPage(selected)
        const element = document.getElementById('table-header')
        element.scrollIntoView()
    }

    const submit = (values) => {
        setPage(0)
        dispatch(
            getCategories({
                access: user.token,
                filters: { search: values.search, page: 0 },
            })
        )
    }

    const handleDeleteSearch = () => {
        reset({ search: '' })
        setPage(0)
        dispatch(
            getCategories({
                access: user.token,
                filters: { search: '', page: 0 },
            })
        )
    }

    const handleDeleteClick = (category) => {
        setCategoryToDelete(category)
        setShowDeleteConfirmModal(true)
    }

    const handleDeleteConfirm = async () => {
        console.log('categoryToDelete', categoryToDelete)
        try {
            setShowDeleteConfirmModal(false)
            setLoadingDeleteCategory(true)
            await dispatch(deleteCategory({id:categoryToDelete._id})).unwrap()
            setCategoryToDelete(null)
            setShowSuccessModal(true)
        } catch (error) {
            console.log('error al eliminar la categoría', error)
            setShowErrorModal(true)
        }
    }

    const handleDeleteCancel = () => {
        setShowDeleteConfirmModal(false)
        setCategoryToDelete(null)
    }

    const handleSuccessModalClose = () => {
        setShowSuccessModal(false)
    }

    const handleErrorModalClose = () => {
        setShowErrorModal(false)
    }

    const handleContent = () => {
        return categoriesData.data.length > 0 ? (
            <>
                <Table
                    tableHeaderColor="primary"
                    tableHead={['id', 'Nombre', 'Acciones']}
                    tableData={categoriesData.data.map((e) => {
                        return [
                            e._id,
                            e.name,
                            <ActionGroup
                                category={e}
                                onDelete={handleDeleteClick}
                                loadingDelete={loadingDeleteCategory === e._id}
                                key={`action-group-${e._id}`}
                            />,
                        ]
                    })}
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
                    pageCount={Math.ceil(categoriesData.data.length / 10)}
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
        ) : (
            <EmptyTablePlaceholder title={'No hay categorías para mostrar'} />
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
        dispatch(getCategories(params))
    }, [page])

    return (
        <>
            <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                    <Card>
                        <CardHeader id="table-header" color="primary">
                            <GridContainer>
                                <GridItem xs={12} sm={12} md={6}>
                                    <h4 className={classes.cardTitleWhite}>
                                        Categorías
                                    </h4>
                                    <p className={classes.cardCategoryWhite}>
                                        Aquí puedes visualizar todas las categorías
                                    </p>
                                <Box className={classes.ctaRow}>
                                    <Box className={classes.addCategoryContainer}>
                                        <p className={classes.cardCategoryWhite}>
                                            Agregar nueva categoría
                                        </p>
                                        <Link to="/admin/categories/add-category">
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
                                                    label={'Nombre de la categoría'}
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
                            {loadingCategoriesData ? (
                                <Box display="flex" justifyContent="center">
                                    <CircularProgress />
                                </Box>
                            ) : (
                                handleContent()
                            )}
                        </CardBody>
                    </Card>
                </GridItem>
            </GridContainer>

            {/* Modal de confirmación de eliminación */}
            <CustomModal
                open={showDeleteConfirmModal}
                handleClose={handleDeleteCancel}
                icon="warning"
                title="¿Eliminar categoría?"
                subTitle={`¿Estás seguro de que deseas eliminar la categoría "${categoryToDelete?.name}"? Esta acción no se puede deshacer. No se eliminara la categoría de los productos asociados a la misma pero ya no podras agregar nuevos productos a esta categoría.`}
                hasConfirm={true}
                hasCancel={true}
                confirmCb={handleDeleteConfirm}
                cancelCb={handleDeleteCancel}
                confirmText="Eliminar"
                cancelText="Cancelar"
            />

            {/* Modal de éxito */}
            <CustomModal
                open={showSuccessModal}
                handleClose={handleSuccessModalClose}
                icon="success"
                title="Categoría eliminada"
                subTitle="La categoría ha sido eliminada exitosamente."
                hasConfirm={true}
                hasCancel={false}
                confirmCb={handleSuccessModalClose}
                confirmText="Aceptar"
            />

            {/* Modal de error */}
            <CustomModal
                open={showErrorModal}
                handleClose={handleErrorModalClose}
                icon="error"
                title="Error al eliminar"
                subTitle={error?.message || 'Ha ocurrido un error al eliminar la categoría. Por favor, intenta nuevamente.'}
                hasConfirm={true}
                hasCancel={false}
                confirmCb={handleErrorModalClose}
                confirmText="Aceptar"
            />
        </>
    )
}

const ActionGroup = ({ category, onDelete, loadingDelete }) => {
    const classes = useStyles()
    return (
        <Box className={classes.actionWrapper}>
            <Link
                to={`/admin/categories/edit-category/${category.name}/${category._id}`}
            >
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
            <Button
                isLoading={loadingDelete}
                variant="contained"
                color="secondary"
                type="button"
                justIcon
                onClick={() => onDelete(category)}
                disabled={loadingDelete}
            >
                <DeleteForever />
            </Button>
        </Box>
    )
}

ActionGroup.propTypes = {
    category: PropTypes.object,
    onDelete: PropTypes.func,
    loadingDelete: PropTypes.bool,
}
