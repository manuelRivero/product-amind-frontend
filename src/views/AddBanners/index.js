import { yupResolver } from '@hookform/resolvers/yup'
import { Box, IconButton, makeStyles } from '@material-ui/core'
import { DeleteForever } from '@material-ui/icons'
import React, { useCallback, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import * as yup from 'yup'
import { primaryColor } from '../../assets/jss/material-dashboard-react'
import { useDropzone } from 'react-dropzone'
import uploadImage from 'assets/img/upload-cloud.png'
import TextDanger from 'components/Typography/Danger'
import { createBanner } from '../../api/banners'
import Button from 'components/CustomButtons/Button'
import CustomModal from '../../components/CustomModal'
import { useHistory } from 'react-router-dom'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import { useSelector } from 'react-redux'


const schema = yup.object({
    images: yup
        .array()
        .min(1, 'Campo obligatorio')
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
        marginTop: '2rem',
        cursor: 'pointer',
    },
    imagesRow: {
        display: 'flex',
        gap: '1.5rem',
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
        maxWidth: '1150px',
        width: '100%',
        maxHeight: '350px',
        aspectRatio: '3/1'
    },
    productImage: {
        borderRadius: '16px',
        width: '100%',
        height: '100%',
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

export default function AddBannersPage() {
        const { user } = useSelector((state) => state.auth)
    
    const history = useHistory()
    const classes = useStyles()
    const {
        control,
        formState: { errors },
        handleSubmit,
        reset,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            images: [],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'images',
    })
    const onDrop = useCallback((acceptedFiles) => {
        // Do something with the files
        console.log('ondrop', acceptedFiles)

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

    const [deleteImages, setDeleteImages] = useState([])
    const [loading, setLoading] = useState(false)
    const [showFormAlert, setShowFormAlert] = useState(undefined)
    const [showModal, setShowModal] = useState(false)

    const handleDeleteImage = (index) => {
        setDeleteImages([...deleteImages, index])
        remove(index)
    }

    const submit = async (values) => {
        const data = new FormData()
        try {
            setShowFormAlert(undefined)
            setLoading(true)
            // Agregar imágenes del producto
            if (Array.isArray(values.images)) {
                values.images.forEach((image) => {
                    if (image.file) {
                        data.append('image', image.file)
                    }
                })
            }
            await createBanner(data, user.token)
            setShowModal(true)
        } catch (error) {
            console.log('error al guardar el banner', error)
            setShowFormAlert(error.response.data.message ? error.response.data.message : 'Error al guardar el banner')
        } finally {
            setLoading(false)
        }
    }
    console.log('fields', fields)

    return (
        <>
            <Box>
            <IconButton
                className={classes.backButton}
                onClick={() => history.push('/admin/banners')}
            >
                <ArrowBackIcon />
            </IconButton>
                <Box>
                    <h3>Cargar un nuevo banner</h3>
                    <p>Las medidas recomendadas para un banner son de 2000px de ancho por 600px de alto o un spect ratio de 2/1</p>
                </Box>
                <div className={classes.imagesRow}>
                    {fields.map((file, index) => {
                        console.log('file', file)
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
                                <p>Esta es una previsualización de tu banner</p>
                            </div>
                        )
                    })}
                </div>
                {fields.length === 0 && (
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
                                Arrastra tu archivo o has click para seleccionar
                                desde tu ordenador
                            </p>
                        )}
                    </div>
                )}
                <Box>
                    {errors.images && (
                        <TextDanger>
                            <p className={classes.errorText}>
                                {errors.images.message}
                            </p>
                        </TextDanger>
                    )}
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
                        isLoading={loading}
                        disabled={Boolean(fields.length === 0)}
                        variant="contained"
                        color="primary"
                        type="button"
                        loading={loading}
                        onClick={handleSubmit(submit)}
                    >
                        Guardar
                    </Button>
                </Box>
            </Box>
            <CustomModal
                open={showModal}
                handleClose={() =>  reset({images:[]})}
                icon={'success'}
                title="¡Listo!"
                subTitle="Tu banner se guardo exitosamente"
                hasCancel={false}
                hasConfirm={true}
                cancelCb={() => {}}
                confirmCb={() => {
                    reset({images:[]})
                    history.push('/admin/banners')
                }}
            />
        </>
    )
}
