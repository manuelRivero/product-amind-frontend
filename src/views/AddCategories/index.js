import React, { useCallback, useEffect, useState } from 'react'

import { makeStyles } from '@material-ui/core/styles'
import { Box, IconButton } from '@material-ui/core'
import TextInput from 'components/TextInput/Index'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Button from 'components/CustomButtons/Button'

import { useParams, useHistory, useLocation } from 'react-router-dom'

import { primaryColor } from 'assets/jss/material-dashboard-react.js'
import { useDispatch, useSelector } from 'react-redux'
import CustomModal from 'components/CustomModal'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import { editCategory } from 'store/categories'
import { postCategories } from 'store/categories'
import { resetEditCategorySuccess } from 'store/categories'
import { resetCategorySuccess } from 'store/categories'
import { useDropzone } from 'react-dropzone/.'
import { DeleteForever } from '@material-ui/icons'
import uploadImage from 'assets/img/upload-cloud.png'
import TextDanger from 'components/Typography/Danger'
import { getCategoryDetail } from '../../api/categories'
import LoadinScreen from '../../components/LoadingScreen'

const schema = yup.object({
    name: yup.string().required('Campo obligatorio'),
    images: yup
        .array()
        .min(1, 'Campo obligatorio')
        .max(1, 'Máximo 1 imágenes')
        .required('Campo obligatorio'),
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
        flexWrap: 'wrap',
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
        width: '100%',
        background: '#fff',
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
    const location = useLocation()
    console.log('location', location)

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
    const [loading, setLoading] = useState(false)
    //form
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            name: '',
            images: [],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'images',
    })
    const onDrop = useCallback((acceptedFiles) => {
        // Do something with the files
        console.log('ondrop')
        acceptedFiles.forEach((e) => {
            append({
                file: e,
                preview: URL.createObjectURL(e),
            })
        })
    }, [])
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: 1,
        accept: {
            'image/*': [],
        },
    })

    const submit = async (values) => {
        const data = new FormData()

        data.append('name', values.name)
        if (values.images[0].file) {
            data.append('image', values.images[0].file)
        }
        if (params.id) {
            // Despachar acción de edición
            dispatch(editCategory({ access: user.token, data, id: params.id }))
        } else {
            // Despachar acción de creación
            dispatch(postCategories({ access: user.token, data }))
        }
    }

    const handleDeleteImage = (index) => {
        remove(index)
    }

    useEffect(() => {
        const getData = async () => {
            if (params.id) {
                try {
                    setLoading(true)
                    const { data } = await getCategoryDetail(
                        user.token,
                        params.id
                    )
                    console.log('data', data)
                    reset({
                        name: data.category.name,
                        images: [
                            {
                                file: null,
                                preview: data.category.image.url,
                            },
                        ],
                    })
                } catch (error) {
                    console.log("error", error)
                } finally {
                    setLoading(false)
                }
            }
        }
        getData()
    }, [params.id])

    if (loading) {
        return <LoadinScreen />
    }

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
                <Box>
                    <p>Imágen de la categoría</p>
                </Box>
                <div className={classes.imagesRow}>
                    {fields.map((file, index) => {
                        return (
                            <div
                                className={classes.imagesWrapper}
                                key={`file-${index}`}
                            >
                                <IconButton
                                    className={classes.trashICon}
                                    onClick={() => handleDeleteImage(index)}
                                >
                                    <DeleteForever />
                                </IconButton>
                                <img
                                    className={classes.productImage}
                                    src={file.preview}
                                    alt="product-image"
                                />
                            </div>
                        )
                    })}
                    {fields.length < 1 && (
                        <div {...getRootProps()} className={classes.dropZone}>
                            <img
                                src={uploadImage}
                                alt="Subir archivo"
                                className={classes.uploadImage}
                            />
                            <input {...getInputProps()} />

                            {isDragActive ? (
                                <p>Suelta tu archivo aquí</p>
                            ) : (
                                <p>
                                    Arrastra tu archivo o has click para
                                    seleccionar desde tu ordenador
                                </p>
                            )}
                        </div>
                    )}
                </div>
                <Box>
                    {errors.images && (
                        <TextDanger>
                            <p className={classes.errorText}>
                                {errors.images.message}
                            </p>
                        </TextDanger>
                    )}
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
                open={
                    location.pathname.includes('/edit-category') &&
                    (!params.id || !params.name)
                }
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
