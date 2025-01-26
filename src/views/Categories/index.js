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
import { getCategories } from 'store/categories'

const schema = yup.object({
    search: yup.string().nullable(),
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
    addCategoryWrapper: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        height: '100%',
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
        flexWrap: 'wrap',
    },
})

export default function Categories() {
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const { categoriesData, loadingCategoriesData } = useSelector(
        (state) => state.categories
    )

    // styles
    const classes = useStyles()
    // states
    const [page, setPage] = useState(1)

    //form
    const { control, handleSubmit, watch } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            search: null,
        },
    })

    const handlePageClick = ({ selected }) => {
        setPage(selected)
        const element = document.getElementById('table-header')
        element.scrollIntoView()
    }

    const handleFilters = () => {
        const filters = watch()
        let activefilters = {}
        Object.keys(filters).forEach((key) => {
            if (filters[key] !== null) {
                switch (key) {
                    case 'tags':
                        activefilters[key] = filters[key]
                            .replace(/\s/g, '')
                            .toLowerCase()
                        break

                    default:
                        activefilters[key] = filters[key]

                        break
                }
            }
        })
        return activefilters
    }

    const submit = () => {
        dispatch(
            getCategories({
                access: user.token,
                filters: { ...handleFilters(), page },
            })
        )
    }

    useEffect(() => {
        dispatch(
            getCategories({
                access: user.token,
                filters: { ...handleFilters(), page },
            })
        )
    }, [page])

    return (
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
                            </GridItem>
                            <GridItem xs={12} sm={12} md={6}>
                                <Box className={classes.addCategoryWrapper}>
                                    <Box
                                        className={classes.addCategoryContainer}
                                    >
                                        <p
                                            className={
                                                classes.cardCategoryWhite
                                            }
                                        >
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
                                {/* <Box>
                                    <Controller
                                        name="tags"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <TextInput
                                                helperText="Busca por una etiqueta o varias separadas por comas"
                                                error={
                                                    fieldState.error
                                                        ? true
                                                        : false
                                                }
                                                errorMessage={fieldState.error}
                                                icon={null}
                                                label={'Etiquetas del producto'}
                                                value={field.value}
                                                onChange={({ target }) => {
                                                    field.onChange(target.value)
                                                }}
                                            />
                                        )}
                                    />
                                </Box> */}
                            </Box>
                            <Button
                                isLoading={false}
                                variant="contained"
                                color="primary"
                                type="Submit"
                            >
                                Buscar
                            </Button>
                        </form>
                        {loadingCategoriesData ? (
                            <p>Cargando datos ...</p>
                        ) : (
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
                                                key={`action-group-${e._d}`}
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
                                    pageCount={Math.ceil(
                                        categoriesData.data.length / 10
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

const ActionGroup = ({ category }) => {
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
        </Box>
    )
}

ActionGroup.propTypes = {
    category: PropTypes.object,
}
