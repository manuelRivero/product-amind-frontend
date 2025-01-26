import React, { useEffect } from 'react'

import { makeStyles } from '@material-ui/core/styles'
import { Box, IconButton } from '@material-ui/core'
import TextInput from 'components/TextInput/Index'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Button from 'components/CustomButtons/Button'

import { useParams, useHistory } from 'react-router-dom'

import { primaryColor } from 'assets/jss/material-dashboard-react.js'
import { useDispatch, useSelector } from 'react-redux'
import CustomModal from 'components/CustomModal'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import { editCategory } from 'store/categories'
import { postCategories } from 'store/categories'
import { resetEditCategorySuccess } from 'store/categories'
import { resetCategorySuccess } from 'store/categories'

const schema = yup.object({
    name: yup.string().required('Campo obligatorio'),
})

const useStyles = makeStyles({
    uploadImage: {
        maxWidth: '50px',
    },
    dropZone: {
        borderRadius: '16px',
        display: 'flex',
        justifyContent: 'center',
        padding: '1rem',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '220px',
        boxSizing: 'border-box',
        background: '#fff',
    },
    imagesRow: {
        display: 'flex',
        gap: '1.5rem',
    },
    inputRow: {
        margin: '1rem 0',
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
    },
    descriptionRow: {
        margin: '1rem 0',
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
        '& > *': {
            width: '100%',
        },
        '& .MuiFormControl-root': {
            width: '100%',
        },
    },

    buttonsRow: {
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        marginTop: '1rem',
    },
    checked: {
        color: primaryColor[0] + '!important',
    },
    errorText: {
        marginBottom: 0,
        marginTop: '5px',
    },
    imagesWrapper: {
        position: 'relative',
        maxWidth: '220px',
        height: '220px',
    },
    productImage: {
        borderRadius: '16px',
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    trashICon: {
        position: 'absolute',
        top: '5px',
        right: '5px',
        '& img': {
            width: '24px',
        },
    },
    input: {
        '& .MuiInputBase-input': {
            background: '#fff !important',
        },
    },
})

export default function AddCategories() {
    const history = useHistory()
    const params = useParams()
    const { user } = useSelector((state) => state.auth)
    const {
        loadingCategory,
        categorySuccess,
        categoryError,
        loadingEditCategory,
        editCategoryError,
        editCategorySuccess,
    } = useSelector((state) => state.categories)
    const dispatch = useDispatch()
    const classes = useStyles()
    //form
    const { control, handleSubmit, reset } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            name: '',
        },
    })

    const submit = async (values) => {
        const data = new FormData()

        data.append('name', values.name || '')
        if (params.id) {
            // Despachar acción de edición
            dispatch(editCategory({ access: user.token, data, id: params.id }))
        } else {
            // Despachar acción de creación
            dispatch(postCategories({ access: user.token, data }))
        }
    }

    useEffect(async () => {
        if (params.id && params.name) {
            reset({
                name: params.name,
            })
        } else {
            reset({
                name: '',
            })
        }
    }, [])

    return (
        <section>
            <IconButton
                className={classes.backButton}
                onClick={() => history.push('/admin/categories')}
            >
                <ArrowBackIcon />
            </IconButton>
            <form onSubmit={handleSubmit(submit)}>
                <Box>
                    <h3>Información de la categoría</h3>
                </Box>
                <Box className={classes.inputRow}>
                    <Controller
                        name="name"
                        control={control}
                        render={({ field, fieldState }) => (
                            <TextInput
                                error={fieldState.error ? true : false}
                                errorMessage={fieldState.error}
                                icon={null}
                                label={'Nombre de la categoría'}
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />
                </Box>

                {categoryError ||
                    (editCategoryError && (
                        <p>Hubo un error al guardar la categoría</p>
                    ))}
                <Box className={classes.buttonsRow}>
                    <Button
                        isLoading={loadingCategory | loadingEditCategory}
                        variant="contained"
                        color="primary"
                        type="submit"
                    >
                        Guardar
                    </Button>
                </Box>
            </form>

            <CustomModal
                open={params.id ? editCategorySuccess : categorySuccess}
                handleClose={() => {
                    if (params.id) {
                        dispatch(resetEditCategorySuccess())
                    } else {
                        reset()
                        dispatch(resetCategorySuccess())
                    }
                }}
                icon={'success'}
                title="¡Listo!"
                subTitle="Tu categoría se guardo exitosamente"
                hasCancel={false}
                hasConfirm={true}
                cancelCb={() => {}}
                confirmCb={() => {
                    dispatch(resetCategorySuccess())
                    dispatch(resetEditCategorySuccess())
                    history.push('/admin/categories')
                }}
            />
            <CustomModal
                open={params.id === undefined || params.name === undefined}
                handleClose={() => {
                    history.push('/admin/categories')
                }}
                icon={'error'}
                title="¡Error!"
                subTitle="has navegado a una pagina invalida"
                hasCancel={false}
                hasConfirm={true}
                cancelCb={() => {}}
                confirmCb={() => {
                    history.push('/admin/categories')
                }}
            />
        </section>
    )
}
