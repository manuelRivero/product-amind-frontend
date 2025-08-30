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
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

//icons
import EditIcon from '@material-ui/icons/Edit'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import AddIcon from '@material-ui/icons/Add'
import DescriptionIcon from '@material-ui/icons/Description'

import { useState } from 'react'
import { useEffect } from 'react'
import ReactPaginate from 'react-paginate'
import TextInput from 'components/TextInput/Index'

import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
    RemoveRedEye,
    Search,
    DeleteForeverOutlined,
} from '@material-ui/icons'
import { 
    getBlogsRequest, 
    deleteBlogRequest,
    selectBlogs,
    selectCurrentPage,
    selectTotalPages,
    selectLoadingBlogs,
    selectBlogsError,
    selectLoadingDeleteBlog,
    selectDeleteBlogError,
    selectDeleteBlogSuccess,
    clearBlogsError,
    clearDeleteBlogError,
    clearDeleteBlogSuccess,
    setCurrentPage,
} from 'store/blogs'

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
    addBlogWrapper: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        height: '100%',
    },
    addBlogContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '.5rem',
    },
    actionWrapper: {
        display: 'flex',
        gap: '.5rem',
        justifyContent: 'center',
    },
    searchWrapper: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-end',
        marginBottom: '1rem',
    },
    searchContainer: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-end',
    },
    noDataContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        gap: '1rem',
    },
    noDataText: {
        color: '#999',
        fontSize: '1.1rem',
    },
})

export default function Blogs() {
    const classes = useStyles()
    const dispatch = useDispatch()

    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedBlog, setSelectedBlog] = useState(null)
    const [showErrorModal, setShowErrorModal] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    // Redux selectors
    const blogs = useSelector(selectBlogs)
    const currentPage = useSelector(selectCurrentPage)
    const totalPages = useSelector(selectTotalPages)
    const loadingBlogs = useSelector(selectLoadingBlogs)
    const blogsError = useSelector(selectBlogsError)
    const loadingDeleteBlog = useSelector(selectLoadingDeleteBlog)
    const deleteBlogError = useSelector(selectDeleteBlogError)
    const deleteBlogSuccess = useSelector(selectDeleteBlogSuccess)

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            search: '',
        },
    })



    useEffect(() => {
        // Cargar blogs al montar el componente
        dispatch(getBlogsRequest({ page: 0, limit: 10 }))
    }, [dispatch])

    // Manejar errores de carga de blogs
    useEffect(() => {
        if (blogsError) {
            setErrorMessage(blogsError)
            setShowErrorModal(true)
            dispatch(clearBlogsError())
        }
    }, [blogsError, dispatch])

    // Manejar éxito de eliminación
    useEffect(() => {
        if (deleteBlogSuccess) {
            setShowDeleteModal(false)
            setSelectedBlog(null)
            dispatch(clearDeleteBlogSuccess())
            // Recargar la lista
            dispatch(getBlogsRequest({ page: currentPage, limit: 10 }))
        }
    }, [deleteBlogSuccess, dispatch, currentPage])

    // Manejar errores de eliminación
    useEffect(() => {
        if (deleteBlogError) {
            setErrorMessage(deleteBlogError)
            setShowErrorModal(true)
            dispatch(clearDeleteBlogError())
        }
    }, [deleteBlogError, dispatch])

    const handlePageChange = (data) => {
        const newPage = data.selected + 1
        dispatch(setCurrentPage(newPage))
        dispatch(getBlogsRequest({ page: newPage, limit: 10 }))
    }

    const handleDeleteClick = (blog) => {
        setSelectedBlog(blog)
        setShowDeleteModal(true)
    }

    const handleDeleteConfirm = () => {
        if (selectedBlog) {
            dispatch(deleteBlogRequest(selectedBlog._id))
        }
    }

    const handleErrorModalClose = () => {
        setShowErrorModal(false)
        setErrorMessage('')
    }

    const handleDeleteCancel = () => {
        setShowDeleteModal(false)
        setSelectedBlog(null)
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        })
    }





    const handleSearch = (data) => {
        dispatch(getBlogsRequest({ 
            page: 1, 
            limit: 10, 
            search: data.search 
        }))
    }

    const tableData = blogs.map((blog) => [
        blog.title,
        formatDate(blog.createdAt),
        formatDate(blog.updatedAt),
        <div className={classes.actionWrapper} key={blog._id}>
            <IconButton
                size="small"
                color="primary"
                title="Ver blog"
                component={Link}
                to={`/admin/blogs/view-blog/${blog._id}`}
            >
                <RemoveRedEye />
            </IconButton>
            <IconButton
                size="small"
                color="primary"
                title="Editar blog"
                component={Link}
                to={`/admin/blogs/edit-blog/${blog._id}`}
            >
                <EditIcon />
            </IconButton>
            <IconButton
                size="small"
                color="secondary"
                title="Eliminar blog"
                onClick={() => handleDeleteClick(blog)}
            >
                <DeleteForeverOutlined />
            </IconButton>
        </div>,
    ])

    if (loadingBlogs) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="400px"
            >
                <CircularProgress />
            </Box>
        )
    }

    return (
        <GridContainer>
            <GridItem xs={12} sm={12} md={12}>
                <Card>
                    <CardHeader color="primary">
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box>
                                <h4 className={classes.cardTitle}>Blogs</h4>
                                <p className={classes.cardCategory}>
                                    Gestiona los blogs de tu tienda
                                </p>
                            </Box>
                            <div className={classes.addBlogWrapper}>
                                <div className={classes.addBlogContainer}>
                                    <Button
                                        color="primary"
                                        component={Link}
                                        to="/admin/add-blog"
                                        startIcon={<AddIcon />}
                                    >
                                        Crear Blog
                                    </Button>
                                </div>
                            </div>
                        </Box>
                    </CardHeader>
                    <CardBody>
                        <Box className={classes.searchWrapper}>
                            <Box className={classes.searchContainer}>
                                <Controller
                                    name="search"
                                    control={control}
                                    render={({ field }) => (
                                        <TextInput
                                            {...field}
                                            icon={<Search />}
                                            label="Buscar blogs..."
                                            error={!!errors.search}
                                            errorMessage={errors.search?.message}
                                        />
                                    )}
                                />
                                <Button
                                    color="primary"
                                    onClick={handleSubmit(handleSearch)}
                                >
                                    Buscar
                                </Button>
                            </Box>
                        </Box>

                        {blogs.length === 0 ? (
                            <Box className={classes.noDataContainer}>
                                                                 <DescriptionIcon style={{ fontSize: 64, color: '#ccc' }} />
                                <p className={classes.noDataText}>
                                    No hay blogs creados aún
                                </p>
                                <Button
                                    color="primary"
                                    component={Link}
                                    to="/admin/add-blog"
                                    startIcon={<AddIcon />}
                                >
                                    Crear tu primer blog
                                </Button>
                            </Box>
                        ) : (
                            <>
                                <Table
                                    tableHeaderColor="primary"
                                    tableHead={[
                                        'Título',
                                        'Fecha de creación',
                                        'Última actualización',
                                        'Acciones',
                                    ]}
                                    tableData={tableData}
                                />

                                {totalPages > 1 && (
                                    <ReactPaginate
                                        previousLabel={<ChevronLeftIcon />}
                                        nextLabel={<ChevronRightIcon />}
                                        breakLabel={'...'}
                                        breakClassName={'break-me'}
                                        pageCount={totalPages}
                                        marginPagesDisplayed={2}
                                        pageRangeDisplayed={5}
                                        onPageChange={handlePageChange}
                                        containerClassName={classes.pagination}
                                        pageClassName={classes.page}
                                        activeClassName={classes.activePage}
                                        previousClassName={classes.page}
                                        nextClassName={classes.page}
                                    />
                                )}
                            </>
                        )}
                    </CardBody>
                </Card>
            </GridItem>

            {/* Modal de confirmación de eliminación */}
            <Dialog
                open={showDeleteModal}
                onClose={handleDeleteCancel}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {'¿Eliminar blog?'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                                                 ¿Estás seguro de que quieres eliminar el blog &quot;{selectedBlog?.title}&quot;? 
                         Esta acción no se puede deshacer.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                                                    <Button onClick={handleDeleteCancel} color="primary">
                                    Cancelar
                                </Button>
                                <Button 
                                    onClick={handleDeleteConfirm} 
                                    color="secondary" 
                                    isLoading={loadingDeleteBlog}
                                    autoFocus
                                >
                                    Eliminar
                                </Button>
                </DialogActions>
            </Dialog>

            {/* Modal de error */}
            <Dialog
                open={showErrorModal}
                onClose={handleErrorModalClose}
                aria-labelledby="error-dialog-title"
                aria-describedby="error-dialog-description"
            >
                <DialogTitle id="error-dialog-title">
                    {'Error'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="error-dialog-description">
                        {errorMessage || 'Ha ocurrido un error inesperado.'}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleErrorModalClose} color="primary">
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>
        </GridContainer>
    )
}
