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
import { useDropzone } from 'react-dropzone/.'
import { DeleteForever } from '@material-ui/icons'
import uploadImage from 'assets/img/upload-cloud.png'
import TextDanger from 'components/Typography/Danger'
import { getCategoryDetail } from '../../api/categories'
import LoadinScreen from '../../components/LoadingScreen'
import Card from 'components/Card/Card'
import CardHeader from 'components/Card/CardHeader'
import CardBody from 'components/Card/CardBody'

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
        border: '1px solid #ccc',
        cursor: 'pointer',
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
    cardTitleWhite: {
        color: '#FFFFFF',
        marginTop: '0px',
        minHeight: 'auto',
        fontWeight: '300',
        fontFamily: "'Roboto",
        marginBottom: '3px',
        textAlign: 'left',
    },
    cardCategoryWhite: {
        color: '#FFFFFF',
        margin: '0',
        fontSize: '14px',
        marginTop: '0',
        marginBottom: '0',
    },
})

export default function AddCategories() {
    const location = useLocation()
    console.log('location', location)

    const history = useHistory()
    const params = useParams()
    const { user } = useSelector((state) => state.auth)
    const dispatch = useDispatch()
    const classes = useStyles()
    const [loading, setLoading] = useState(false)
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    // Estados para manejo de errores
    const [showErrorModal, setShowErrorModal] = useState(false)
    const [showFormAlert, setShowFormAlert] = useState(undefined)

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

        try {
            if (params.id) {
                // Despachar acción de edición
                setLoadingSubmit(true)
                await dispatch(editCategory({ access: user.token, data, id: params.id })).unwrap()
                setShowSuccessModal(true)
            } else {
                // Despachar acción de creación
                setLoadingSubmit(true)
                await dispatch(postCategories({ access: user.token, data })).unwrap()
                setShowSuccessModal(true)
            }
        } catch (error) {
            console.log('error al guardar la categoría', error)
            setShowFormAlert(
                error.error)
            setShowErrorModal({ error: error.error || 'Error al guardar la categoría' })
        } finally {
            setLoadingSubmit(false)
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
            <Card>
                <CardHeader color="primary">
                    <h4 className={classes.cardTitleWhite}>Información de la categoría</h4>
                    <p className={classes.cardCategoryWhite}>
                        Agrega o edita una categoría para tu tienda. Sube una imagen y asigna un nombre descriptivo.
                    </p>
                </CardHeader>
                <CardBody>
                    <form onSubmit={handleSubmit(submit)}>
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

                        <Box>
                            {showFormAlert && (
                                <TextDanger>
                                    <p className={classes.errorText}>{showFormAlert}</p>
                                </TextDanger>
                            )}
                        </Box>

                        <Box className={classes.buttonsRow}>
                            <Button
                                isLoading={loadingSubmit}
                                variant="contained"
                                color="primary"
                                type="submit"
                            >
                                Guardar
                            </Button>
                        </Box>
                    </form>
                </CardBody>
            </Card>
            <CustomModal
                open={showSuccessModal}
                handleClose={() => setShowSuccessModal(false)}
                icon={'success'}
                title="¡Listo!"
                subTitle="Tu categoría se guardo exitosamente"
                hasCancel={true}
                cancelText="Volver al listado de categorías"
                confirmText="Guardar otra categoría"
                hasConfirm={true}
                cancelCb={() => { history.push('/admin/categories') }}
                confirmCb={() => {
                    setShowSuccessModal(false)

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
                cancelCb={() => { }}
                confirmCb={() => {
                    history.push('/admin/categories')
                }}
            />

            {/* Modal de error */}
            <CustomModal
                open={showErrorModal}
                handleClose={() => setShowErrorModal(false)}
                icon={'error'}
                title="¡Error!"
                subTitle={showErrorModal.error}
                hasCancel={false}
                hasConfirm={true}
                confirmText="Volver al listado de categorías"
                cancelCb={() => { }}
                confirmCb={() => {
                    setShowErrorModal(false)
                    history.push('/admin/categories')
                }}
            />
        </section>
    )
}
