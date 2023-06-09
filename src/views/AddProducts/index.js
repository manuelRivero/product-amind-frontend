import React, { useCallback } from 'react'

import { makeStyles } from '@material-ui/core/styles'
import { useDropzone } from 'react-dropzone'
import uploadImage from 'assets/img/upload-cloud.png'
import { Box, Checkbox } from '@material-ui/core'
import TextInput from 'components/TextInput/Index'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Button from 'components/CustomButtons/Button'
import TextDanger from 'components/Typography/Danger'

import { primaryColor } from 'assets/jss/material-dashboard-react.js'
import { useDispatch, useSelector } from 'react-redux'
import { postProducts } from 'store/products'
import CustomModal from 'components/CustomModal'
import { resetProductSuccess } from 'store/products'

// schema
const schema = yup.object({
    images: yup
        .array()
        .min(1, 'Campo obligatorio')
        .required('Campo obligatorio'),
    name: yup.string().required('Campo obligatorio'),
    tags: yup.string().required('Campo obligatorio'),
    price: yup.string().required('Campo obligatorio'),
    stock: yup.string().required('Campo obligatorio'),
    description: yup.string().required('Campo obligatorio'),
    status: yup
        .string()
        .oneOf(['1', '0'], 'Campo obligatorio')
        .required('Campo obligatorio'),
})

const useStyles = makeStyles({
    uploadImage: {
        maxWidth: '100px',
    },
    dropZone: {
        borderRadius: '16px',
        border: 'solid 1px #c2c2c2',
        display: 'flex',
        justifyContent: 'center',
        padding: '1rem',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '150px',
    },
    imagesRow: {
        display: 'flex',
        gap: '1.5rem',
        '& > img': {
            borderRadius: '16px',
            maxWidth: '166px',
            objectFit: 'cover',
        },
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
})

export default function AddProducts() {
    const { user } = useSelector((state) => state.auth)
    const { loadingProduct, productSuccess, productError } = useSelector(
        (state) => state.products
    )
    const dispatch = useDispatch()
    const classes = useStyles()
    //form
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            images: [],
            name: '',
            tags: '',
            price: '',
            stock: '',
            description: '',
            status: '',
        },
    })

    const { fields, append } = useFieldArray({ control, name: 'images' })
    const onDrop = useCallback((acceptedFiles) => {
        // Do something with the files
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
        data.append('price', values.price)
        data.append(
            'tags',
            JSON.stringify(values.tags.split(',').map((e) => ({ name: e })))
        )
        data.append('stock', values.stock)
        data.append('description', values.description)

        values.images.forEach((image) => {
            data.append('productImage', image.file)
        })
        data.append(
            'status',
            JSON.stringify({ available: values.status === "0" ? true : false })
        )
        try {
            await dispatch(postProducts({ access: user.token, data }))
        } catch (error) {
            console.log(error)
        }
    }
    return (
        <section>
            <form onSubmit={handleSubmit(submit)}>
                <Box>
                    <h3>Imágenes de tu producto</h3>
                </Box>
                <div className={classes.imagesRow}>
                    {fields.map((file, index) => {
                        return (
                            <img
                                key={`file-${index}`}
                                src={file.preview}
                                alt="product-image"
                            />
                        )
                    })}
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
                <Box>
                    <h3>Información de tu producto</h3>
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
                                label={'Nombre del producto'}
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />

                    <Controller
                        name="stock"
                        control={control}
                        render={({ field, fieldState }) => (
                            <TextInput
                                error={fieldState.error ? true : false}
                                errorMessage={fieldState.error}
                                icon={null}
                                label={'Stock del producto'}
                                value={field.value}
                                onChange={(e) =>
                                    field.onChange(
                                        e.target.value.replace(/[^\d]/g, '')
                                    )
                                }
                            />
                        )}
                    />

                    <Controller
                        name="price"
                        control={control}
                        render={({ field, fieldState }) => (
                            <TextInput
                                error={fieldState.error ? true : false}
                                errorMessage={fieldState.error}
                                icon={null}
                                label={'Precio'}
                                value={field.value}
                                onChange={(e) =>
                                    field.onChange(
                                        e.target.value.replace(/[^\d]/g, '')
                                    )
                                }
                            />
                        )}
                    />
                </Box>
                <Box className={classes.inputRow}>
                    <Controller
                        name="tags"
                        control={control}
                        render={({ field, fieldState }) => (
                            <TextInput
                                error={fieldState.error ? true : false}
                                errorMessage={fieldState.error}
                                icon={null}
                                label={'Etiquetas'}
                                value={field.value}
                                helperText=" texto simple separado por comas cada etiqueta"
                                onChange={field.onChange}
                            />
                        )}
                    />
                    <Box>
                        <p style={{ margin: 0 }}>Estatus</p>
                        <Box>
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <label htmlFor="available">
                                        Disponible
                                        <Checkbox
                                            id="available"
                                            classes={{
                                                checked: classes.checked,
                                            }}
                                            checked={
                                                field.value === 0 ? true : false
                                            }
                                            onChange={() => field.onChange(0)}
                                            inputProps={{
                                                'aria-label':
                                                    'primary checkbox',
                                            }}
                                        />
                                    </label>
                                )}
                            />

                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <label htmlFor="disabled">
                                        No disponible
                                        <Checkbox
                                            id="disabled"
                                            checked={
                                                field.value === 1 ? true : false
                                            }
                                            onChange={() => field.onChange(1)}
                                            inputProps={{
                                                'aria-label':
                                                    'primary checkbox',
                                            }}
                                        />
                                    </label>
                                )}
                            />
                            <Box>
                                {console.log('errors', errors)}
                                {errors.status && (
                                    <TextDanger>
                                        <p className={classes.errorText}>
                                            {errors.status.message}
                                        </p>
                                    </TextDanger>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Box>
                <Box className={classes.descriptionRow}>
                    <Controller
                        name="description"
                        control={control}
                        render={({ field, fieldState }) => (
                            <TextInput
                                rows={5}
                                multiline={true}
                                errorMessage={fieldState.error}
                                error={fieldState.error ? true : false}
                                icon={null}
                                label={'Descripción'}
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />
                </Box>
                {productError && <p>Hubo un error al guardar el producto</p>}
                <Box className={classes.buttonsRow}>
                    <Button
                        isLoading={loadingProduct}
                        variant="contained"
                        color="primary"
                        type="submit"
                    >
                        Guardar
                    </Button>
                </Box>
            </form>

            <CustomModal
                open={productSuccess}
                handleClose={() => {
                    reset()
                    dispatch(resetProductSuccess())
                }}
                icon={'success'}
                title="¡Listo!"
                subTitle="Tu producto se guardo exitosamente"
                hasCancel={false}
                hasConfirm={true}
                cancelCb={() => {}}
                confirmCb={() => {
                    reset()
                    dispatch(resetProductSuccess())
                }}
            />
        </section>
    )
}
