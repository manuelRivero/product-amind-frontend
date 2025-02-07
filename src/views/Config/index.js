import { Box, makeStyles } from '@material-ui/core'
import React, { useCallback, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import TextInput from '../../components/TextInput/Index'
import TextDanger from 'components/Typography/Danger'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useDropzone } from 'react-dropzone/.'
import uploadImage from 'assets/img/upload-cloud.png'
import CustomModal from '../../components/CustomModal'
import Button from 'components/CustomButtons/Button'
import LoadinScreen from '../../components/LoadingScreen'
import { useDispatch, useSelector } from 'react-redux'
import { getConfigRequest } from '../../store/config'
import { editConfig } from '../../api/config'

const schema = yup.object({
    logoUrl: yup.string().url('Debe ser una URL válida').nullable(),
    title: yup.string().required('El título es obligatorio'),
    phone: yup.string().required('El título es obligatorio'),
    description: yup.string().required('La descripción es obligatoria'),
    primaryColor: yup.string().required('El color primario es obligatorio'),
    contrastTextColor: yup
        .string()
        .required('El color de contraste es obligatorio'),
    logo: yup.mixed().when('logoUrl', {
        is: (logoUrl) => !logoUrl, // Si no hay logoUrl, logo es obligatorio
        then: yup
            .mixed()
            .test('fileRequired', 'El logo es obligatorio', (value) => {
                return value && value.length > 0
            })
            .test('fileSize', 'El archivo no debe superar los 2MB', (value) => {
                return value && value[0] && value[0].size <= 2 * 1024 * 1024 // 2MB
            })
            .test(
                'fileType',
                'Solo se permiten archivos PNG, JPG o JPEG',
                (value) => {
                    return (
                        value &&
                        value[0] &&
                        ['image/png', 'image/jpg', 'image/jpeg'].includes(
                            value[0].type
                        )
                    )
                }
            ),
        otherwise: yup.mixed().notRequired(), // Si hay logoUrl, logo no es obligatorio
    }),
})

const useStyles = makeStyles({
    uploadImage: {
        maxWidth: '50px',
    },
    logo: {
        width: '150px',
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
    input: {
        width: '100%',
    },
    buttonsRow: {
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        marginTop: '1rem',
    },
    errorText: {
        marginBottom: 0,
        marginTop: '5px',
    },
})

export default function ConfigPage() {
    const classes = useStyles()
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const { loadingConfig, configDetail } = useSelector((state) => state.config)
    const [preview, setPreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    //form
    const {
        reset,
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            title: [],
            description: '',
            primaryColor: '',
            contrastTextColor: '',
            logo: '',
            logoUrl: '',
            phone: '',
        },
    })
    const onDrop = useCallback((acceptedFiles) => {
        setValue('logo', acceptedFiles[0])
        setPreview(URL.createObjectURL(acceptedFiles[0]))
    }, [])
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: 1,
        accept: {
            'image/*': [],
        },
    })

    const onSubmit = async (values) => {
        const form = new FormData()
        form.append('title', values.title)
        form.append('description', values.description)
        form.append('primaryColor', values.primaryColor)
        form.append('contrastTextColor', values.contrastTextColor)
        if (values.logo) {
            form.append('logo', values.logo)
        }

        try {
            setLoading(true)
            await editConfig(user.token, form)
            setShowSuccessModal(true)
        } catch (error) {
            console.log('error en config', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        dispatch(getConfigRequest({ access: user.token }))
    }, [])

    useEffect(() => {
        if (configDetail) {
            console.log('config detail', configDetail)
            reset({
                title: configDetail.metadata.title,
                description: configDetail.metadata.description,
                primaryColor: configDetail.palette.primary.main,
                contrastTextColor: configDetail.palette.primary.contrastText,
                phone: configDetail.phone,
                logoUrl: configDetail.metadata.logo,
            })
            setPreview(configDetail.metadata.logo)
        }
    }, [configDetail])

    if (loadingConfig) {
        return <LoadinScreen />
    }
    console.log('values', watch())
    return (
        <>
            <Box>
                <h3>Personaliza tu tienda</h3>
                <Box>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <p>Logo</p>
                        <Box
                            display="flex"
                            justifyContent="flex-start"
                            marginBottom={2}
                        >
                            {preview && (
                                <Box
                                    display="flex"
                                    flexDirection="column"
                                    alignItems="flex-start"
                                    marginRight={4}
                                >
                                    <Box
                                        marginBottom={2}
                                        borderRadius={9999}
                                        overflow="hidden"
                                    >
                                        <img
                                            src={preview}
                                            className={classes.logo}
                                            alt={'logo'}
                                        />
                                    </Box>
                                </Box>
                            )}{' '}
                            <div
                                {...getRootProps()}
                                className={classes.dropZone}
                            >
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
                        </Box>
                        <Box display="flex" style={{ gap: '2rem' }}>
                            <Box marginBottom={2} flex={1}>
                                <Controller
                                    name="title"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextInput
                                            className={classes.input}
                                            error={
                                                fieldState.error ? true : false
                                            }
                                            errorMessage={fieldState.error}
                                            icon={null}
                                            label={'Nombre'}
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                            </Box>
                            <Box marginBottom={2} flex={1}>
                                <Controller
                                    name="phone"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextInput
                                            className={classes.input}
                                            error={
                                                fieldState.error ? true : false
                                            }
                                            errorMessage={fieldState.error}
                                            icon={null}
                                            label={'Nombre'}
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
                            <Box marginBottom={2} flex={1}>
                                <Controller
                                    name="primaryColor"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <>
                                            <p
                                                style={{
                                                    marginTop: 0,
                                                    marginBottom: 0,
                                                }}
                                            >
                                                Color principal
                                            </p>
                                            <input
                                                type="color"
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                            {fieldState.error && (
                                                <TextDanger>
                                                    <p
                                                        className={
                                                            classes.errorText
                                                        }
                                                    >
                                                        {fieldState.error.message}
                                                    </p>
                                                </TextDanger>
                                            )}
                                        </>
                                    )}
                                />
                            </Box>
                            <Box marginBottom={2} flex={1}>
                                <Controller
                                    name="contrastTextColor"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <>
                                            <p
                                                style={{
                                                    marginTop: 0,
                                                    marginBottom: 0,
                                                }}
                                            >
                                                Color de contraste
                                            </p>
                                            <input
                                                type="color"
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                            {fieldState.error && (
                                                <TextDanger>
                                                    <p
                                                        className={
                                                            classes.errorText
                                                        }
                                                    >
                                                        {
                                                            fieldState.error
                                                                .message
                                                        }
                                                    </p>
                                                </TextDanger>
                                            )}
                                        </>
                                    )}
                                />
                            </Box>
                        </Box>
                        <Box marginBottom={2}>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <TextInput
                                        className={classes.input}
                                        rows={5}
                                        multiline={true}
                                        errorMessage={fieldState.error}
                                        error={fieldState.error ? true : false}
                                        icon={null}
                                        label={'Descripción'}
                                        value={field.value}
                                        onChange={field.onChange}
                                        style={{ width: '100%' }}
                                    />
                                )}
                            />
                        </Box>
                        {Object.keys(errors).length > 0 && (
                            <p>
                                Al parecer faltan campos obligatorios en el
                                formulario
                            </p>
                        )}
                        <Box className={classes.buttonsRow}>
                            <Button
                                isLoading={loading}
                                variant="contained"
                                color="primary"
                                type="submit"
                            >
                                Guardar
                            </Button>
                        </Box>
                    </form>
                </Box>
            </Box>

            <CustomModal
                open={showSuccessModal}
                handleClose={() => setShowSuccessModal(false)}
                icon={'success'}
                title="¡Listo!"
                subTitle="Configuración guardada exitosamente"
                hasCancel={false}
                hasConfirm={true}
                cancelCb={() => {}}
                confirmCb={() =>  setShowSuccessModal(false)}
            />
        </>
    )
}
