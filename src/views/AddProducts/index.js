import React, { useCallback, useEffect, useState } from 'react'

import { makeStyles } from '@material-ui/core/styles'
import { useDropzone } from 'react-dropzone'
import uploadImage from 'assets/img/upload-cloud.png'
import { Box, Checkbox, Divider, IconButton, Switch } from '@material-ui/core'
import TextInput from 'components/TextInput/Index'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Button from 'components/CustomButtons/Button'
import TextDanger from 'components/Typography/Danger'

import { useParams, useHistory } from 'react-router-dom'

import { primaryColor } from 'assets/jss/material-dashboard-react.js'
import { useDispatch, useSelector } from 'react-redux'
import { postProducts } from 'store/products'
import CustomModal from 'components/CustomModal'
import { resetProductSuccess } from 'store/products'
import LoadinScreen from 'components/LoadingScreen'
import { getProductDetail } from 'store/products'
import { resetEditProductSuccess } from 'store/products'
import { editProduct } from 'store/products'
import { Delete, DeleteForever } from '@material-ui/icons'
import CurrencyTextField from '@unicef/material-ui-currency-textfield'

// schema
const featureSchema = yup.object({
    color: yup
        .string()
        .nullable()
        .matches(/^[a-zA-Z]+$/, 'El color solo puede contener letras'), // Validación de letras
    size: yup
        .string()
        .nullable()
        .oneOf(
            ['S', 'M', 'L', 'XL'],
            'La talla debe ser una de las siguientes: S, M, L, XL'
        ), // Validación de tallas específicas
    stock: yup
        .number()
        .required('El stock es obligatorio')
        .min(0, 'El stock no puede ser negativo')
        .integer('El stock debe ser un número entero'),
    hasColor: yup.boolean().nullable(),
    hasSize: yup.boolean().nullable(), // Validación para que el stock sea un número entero
})
const schema = yup.object({
    features: yup.array().of(featureSchema),
    images: yup
        .array()
        .min(1, 'Campo obligatorio')
        .required('Campo obligatorio'),
    name: yup.string().required('Campo obligatorio'),
    price: yup.string().required('Campo obligatorio'),
    stock: yup
        .string()
        .nullable()
        .when('hasFeatures', {
            is: false,
            then: yup.string().required('Campo obligatorio'),
            otherwise: yup.string().nullable(), // No es obligatorio si hasFeatures es true
        }),
    description: yup.string().required('Campo obligatorio'),
    status: yup
        .string()
        .oneOf(['1', '0'], 'Campo obligatorio')
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
    input:{
        "& .MuiInputBase-input": {
      background: "#fff !important"
    }}
})


export default function AddProducts() {
    const history = useHistory()
    const params = useParams()
    console.log('params', params)
    const { user } = useSelector((state) => state.auth)
    const {
        loadingProduct,
        productSuccess,
        productError,
        loadingProductDetail,
        productDetail,
        productDetailError,
        loadingEditProduct,
        editProductError,
        editProductSuccess,
    } = useSelector((state) => state.products)
    const dispatch = useDispatch()
    const classes = useStyles()
    const [deleteImages, setDeleteImages] = useState([])
    //form
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
        watch,
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
            featuresArray: [],
        },
    })
    const featuresArray = useFieldArray({
        control,
        name: 'featuresArray', // Nombre del campo repetible
    })
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'images',
    })
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

        // Agregar datos básicos del producto
        data.append('name', values.name || '')
        data.append('price', values.price || 0)
        data.append('description', values.description || '')
        data.append('discount', values.discount || '')

        // Agregar imágenes del producto
        if (Array.isArray(values.images)) {
            values.images.forEach((image) => {
                if (image.file) {
                    data.append('productImage', image.file)
                }
            })
        }

        // Agregar características (features)
        if (values.featuresArray.length > 0) {
            data.append('features', JSON.stringify(values.featuresArray))
        }

        // Agregar estado del producto
        data.append('status', JSON.stringify({ available: values.status === '0' ? true : false }))

        // Si es edición, manejar imágenes eliminadas
        if (params.id) {
            if (deleteImages && deleteImages.length > 0) {
                data.append('deletedImages', JSON.stringify(deleteImages))
            }
            // Despachar acción de edición
            dispatch(editProduct({ access: user.token, data, id: params.id }))
        } else {
            // Despachar acción de creación
            dispatch(postProducts({ access: user.token, data }))
        }
    }

    const handleDeleteImage = (index) => {
        setDeleteImages([...deleteImages, index])
        remove(index)
    }
    useEffect(async () => {
        if (params.id) {
            dispatch(getProductDetail({ access: user.token, id: params.id }))
        }
    }, [])
    useEffect(async () => {
        if (!params.id) {
            featuresArray.append({})
        }
    }, [])

    useEffect(async () => {
        if (productDetail && params.id) {
            console.log('productDetail', productDetail)
            reset({
                images: productDetail.images.map((e) => ({ preview: e.url })),
                name: productDetail.name,
                price: productDetail.price,
                description: productDetail.description,
                status: productDetail.status.available ? 0 : 1,
                discount: productDetail.discount,
                hasFeatures: productDetail.features.length > 0,
            })
            if (productDetail.features.length > 0) {
                productDetail.features.map((feature) =>
                    featuresArray.append({
                        ...feature,
                        hasColor: feature.color,
                        hasSize: feature.size,
                    })
                )
            }
        } else {
            reset({
                images: [],
                name: '',
                tags: '',
                price: '',
                stock: '',
                description: '',
                status: '',
                featuresArray: [],
            })
        }
    }, [productDetail])

    if (loadingProductDetail) {
        return <LoadinScreen />
    }
    console.log('values ', watch())
    return (
        <section>
            <form onSubmit={handleSubmit(submit)}>
                <Box>
                    <h3>Imágenes de tu producto</h3>
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
                            </div>
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
                        name="price"
                        control={control}
                        render={({ field, fieldState }) => (
                            <CurrencyTextField
                            variant="outlined"
                            className={classes.input}
                            inputProps={{background: "#fff"}}
                                minimumValue="0"
                                error={fieldState.error ? true : false}
                                errorMessage={fieldState.error}
                                icon={null}
                                label={'Precio en Pesos'}
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />
                    <Controller
                        name="discount"
                        control={control}
                        render={({ field, fieldState }) => (
                            <TextInput
                                error={fieldState.error ? true : false}
                                errorMessage={fieldState.error}
                                icon={null}
                                label={'Descuento en %'}
                                value={field.value}
                                onChange={(e) =>
                                    field.onChange(
                                        e.target.value.replace(/[^\d]/g, '')
                                    )
                                }
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

                <>
                    {featuresArray.fields.map((field, index) => {
                        const hasColor = watch(
                            `featuresArray.${index}.hasColor`
                        )
                        const hasSize = watch(`featuresArray.${index}.hasSize`)
                        console.log('has color', hasColor)
                        return (
                            <Box key={field.id} style={{ marginBottom: 16 }}>
                                <Divider style={{ marginBottom: 16 }} />
                                <Box
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <h4 style={{ margin: 0 }}>
                                        Variante {index + 1}
                                    </h4>
                                    <IconButton
                                        onClick={() =>
                                            featuresArray.remove(index)
                                        }
                                    >
                                        <Delete />
                                    </IconButton>
                                </Box>
                                <p style={{ margin: 0 }}>Color</p>
                                <Box>
                                    <Controller
                                        name={`featuresArray.${index}.hasColor`}
                                        control={control}
                                        render={({ field }) => (
                                            <label
                                                htmlFor={`features-color-${index}`}
                                            >
                                                Activar variante de color
                                                <Switch
                                                    id={`features-color-${index}`}
                                                    checked={
                                                        field.value || false
                                                    }
                                                    onChange={field.onChange}
                                                    inputProps={{
                                                        'aria-label':
                                                            'primary checkbox',
                                                    }}
                                                />
                                            </label>
                                        )}
                                    />
                                </Box>
                                {hasColor && (
                                    <Box style={{ marginBottom: 16 }}>
                                        <Controller
                                            name={`featuresArray.${index}.color`}
                                            control={control}
                                            render={({ field, fieldState }) => (
                                                <TextInput
                                                    error={!!fieldState.error}
                                                    errorMessage={
                                                        fieldState.error
                                                            ?.message || ''
                                                    }
                                                    icon={null}
                                                    label="Color del producto"
                                                    value={field.value || ''}
                                                    onChange={field.onChange}
                                                />
                                            )}
                                        />
                                    </Box>
                                )}
                                <p style={{ margin: 0 }}>Talla</p>
                                <Box>
                                    <Controller
                                        name={`featuresArray.${index}.hasSize`}
                                        control={control}
                                        render={({ field }) => (
                                            <label
                                                htmlFor={`features-size-${index}`}
                                            >
                                                Activar variante de talla
                                                <Switch
                                                    id={`features-size-${index}`}
                                                    checked={
                                                        field.value || false
                                                    }
                                                    onChange={field.onChange}
                                                    inputProps={{
                                                        'aria-label':
                                                            'primary checkbox',
                                                    }}
                                                />
                                            </label>
                                        )}
                                    />
                                </Box>
                                {hasSize && (
                                    <Controller
                                        name={`featuresArray.${index}.size`}
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <TextInput
                                                error={!!fieldState.error}
                                                errorMessage={
                                                    fieldState.error?.message ||
                                                    ''
                                                }
                                                icon={null}
                                                label="Talla del producto"
                                                value={field.value || ''}
                                                onChange={field.onChange}
                                            />
                                        )}
                                    />
                                )}
                                <Box style={{ marginTop: 16 }}>
                                    <Controller
                                        name={`featuresArray.${index}.stock`}
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <TextInput
                                                error={!!fieldState.error}
                                                errorMessage={
                                                    fieldState.error?.message ||
                                                    ''
                                                }
                                                icon={null}
                                                label="Stock del producto"
                                                value={field.value || ''}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value.replace(
                                                            /[^\d]/g,
                                                            ''
                                                        )
                                                    )
                                                }
                                            />
                                        )}
                                    />
                                </Box>
                            </Box>
                        )
                    })}
                    <Box className={classes.buttonsRow}>
                        <Button
                            onClick={() => featuresArray.append({})}
                            variant="contained"
                            color="primary"
                            type="button"
                        >
                            Agregar otra variante
                        </Button>
                    </Box>
                </>

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
                {productError ||
                    (editProductError && (
                        <p>Hubo un error al guardar el producto</p>
                    ))}
                <Box className={classes.buttonsRow}>
                    <Button
                        isLoading={loadingProduct | loadingEditProduct}
                        variant="contained"
                        color="primary"
                        type="submit"
                    >
                        Guardar
                    </Button>
                </Box>
            </form>

            <CustomModal
                open={params.id ? editProductSuccess : productSuccess}
                handleClose={() => {
                    if (params.id) {
                        dispatch(resetEditProductSuccess())
                    } else {
                        reset()
                        dispatch(resetProductSuccess())
                    }
                }}
                icon={'success'}
                title="¡Listo!"
                subTitle="Tu producto se guardo exitosamente"
                hasCancel={false}
                hasConfirm={true}
                cancelCb={() => {}}
                confirmCb={() => {
                    dispatch(resetProductSuccess())
                    dispatch(resetEditProductSuccess())
                    history.push('/admin/products')
                }}
            />
            <CustomModal
                open={productDetailError}
                handleClose={() => {
                    history.push('/admin/products')
                }}
                icon={'error'}
                title="¡Error!"
                subTitle="has navegado a una pagina invalida"
                hasCancel={false}
                hasConfirm={true}
                cancelCb={() => {}}
                confirmCb={() => {
                    history.push('/admin/products')
                }}
            />
        </section>
    )
}
