import { makeStyles, Tooltip } from '@material-ui/core'
import EditIcon from '@material-ui/icons/Edit'
import DeleteForeverIcon from '@material-ui/icons/DeleteForever'
import React, { useCallback, useEffect, useRef, useState } from 'react'
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
import FontPicker from 'font-picker-react'
import QuestionMarkIcon from '@material-ui/icons/Help'
import Card from 'components/Card/Card'
import CardHeader from 'components/Card/CardHeader'
import CardBody from 'components/Card/CardBody'
import { StorePreview } from 'components/StorePreview'
import UpgradePrompt from '../../components/UpgradePrompt'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'

// Lista de países soportados por Mercado Pago (ejemplo, puedes expandirla)
const MP_COUNTRIES = [
    { code: 'AR', name: 'Argentina', dial: '+54', phoneLength: 10 },
    { code: 'BR', name: 'Brasil', dial: '+55', phoneLength: 11 },
    { code: 'CL', name: 'Chile', dial: '+56', phoneLength: 9 },
    { code: 'CO', name: 'Colombia', dial: '+57', phoneLength: 10 },
    { code: 'MX', name: 'México', dial: '+52', phoneLength: 10 },
    { code: 'PE', name: 'Perú', dial: '+51', phoneLength: 9 },
    { code: 'UY', name: 'Uruguay', dial: '+598', phoneLength: 8 },
    // ... puedes agregar más países
]

// Fuentes populares para títulos y body
const TITLE_FONTS = [
    'Montserrat',
    'Oswald',
    'Merriweather',
    'Playfair Display',
    'Roboto Slab',
]
const BODY_FONTS = [
    'Roboto',
    'Open Sans',
    'Lato',
    'Source Sans Pro',
    'Nunito',
]

const schema = yup.object({
    titleFont: yup.string().required('Campo obligatorio'),
    logoUrl: yup.string().url('Debe ser una URL válida').nullable(),
    title: yup.string().required('El título es obligatorio'),
    country: yup.string().required('Selecciona un país'),
    phone: yup
        .string()
        .required('El número es obligatorio')
        .test('solo-numeros', 'Solo se permiten números', value => /^\d+$/.test(value || ''))
        .test('longitud', 'El número es demasiado corto o largo', function (value) {
            const { country } = this.parent
            const countryObj = MP_COUNTRIES.find(c => c.code === country)
            if (!countryObj) return false
            return value && value.length === countryObj.phoneLength
        }),
    description: yup.string().required('La descripción es obligatoria'),
    primaryColor: yup.string().required('El color primario es obligatorio'),
    contrastTextColor: yup
        .string()
        .required('El color de contraste es obligatorio'),
    textColor: yup.string().required('El color de texto es obligatorio'),
    backgroundColor: yup.string().required('El color de fondo es obligatorio'),
    logo: yup.mixed().when('logoUrl', {
        is: (logoUrl) => !logoUrl, // Si no hay logoUrl, logo es obligatorio
        then: yup
            .mixed()
            .test('fileRequired', 'El logo es obligatorio', (value) => {
                return value
            })
            .test('fileSize', 'El archivo no debe superar los 2MB', (value) => {
                return value && value.size <= 2 * 1024 * 1024 // 2MB
            })
            .test(
                'fileType',
                'Solo se permiten archivos PNG, JPG o JPEG',
                (value) => {
                    return (
                        value &&
                        ['image/png', 'image/jpg', 'image/jpeg'].includes(
                            value.type
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
        border: '1px solid #ccc',
        borderRadius: '9999px',
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
    cardTitleWhite: {
        color: '#FFFFFF',
        marginTop: '0px',
        minHeight: 'auto',
        fontWeight: '300',
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        marginBottom: '3px',
        textDecoration: 'none',
    },
    cardCategoryWhite: {
        color: '#FFFFFF',
        margin: '0',
        fontSize: '14px',
        marginTop: '0',
        marginBottom: '0',
    },
    sectionSubtitle: {
        fontSize: '1.15rem',
        fontWeight: 500,
        margin: '16px 0 8px 0',
    },
    logoSection: {
        display: 'flex',
        justifyContent: 'flex-start',
        marginBottom: '16px',
    },
    logoPreviewWrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginRight: '32px',
    },
    logoPreview: {
        marginBottom: '16px',
        borderRadius: '9999px',
        overflow: 'hidden',
    },
    colorSection: {
        backgroundColor: '#fff',
        padding: '1rem',
        borderRadius: '16px',
        marginBottom: '16px',
    },
    colorRow: {
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
        marginTop: '16px',
    },
    fontRow: {
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
    },
    flex1: {
        flex: 1,
        flexBasis: 150,
        marginBottom: '16px',
    },
    flexBasis200: {
        flexBasis: 200,
        marginBottom: '16px',
    },
    errorTextBottom: {
        marginBottom: '1rem',
    },
    colorPreviewRow: {
        display: 'flex',
        gap: 32,
        alignItems: 'flex-start',
        '@media (max-width: 900px)': {
            flexDirection: 'column',
            gap: 24,
        },
    },
})

export default function ConfigPage() {
    const classes = useStyles()
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const { loadingConfig, configDetail, planDetails } = useSelector((state) => state.config)
    const [preview, setPreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const fileInputRef = useRef(null)

    // Debug: Verificar si el plan se está cargando
    console.log('🔍 Debug - planDetails:', planDetails)
    console.log('🔍 Debug - configDetail:', configDetail)
    console.log('🔍 Debug - themeCustomization enabled:', planDetails?.features?.themeCustomization?.enabled)

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
            titleFont: '',
            bodyFont: '',
            country: 'AR',
        },
    })
    const onDrop = useCallback((acceptedFiles) => {
        setValue('logo', acceptedFiles[0])
        setPreview(URL.createObjectURL(acceptedFiles[0]))
    }, [])
    const handleEditImage = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click()
        }
    }
    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setValue('logo', file)
            setPreview(URL.createObjectURL(file))
        }
    }
    const handleDeleteImage = () => {
        setPreview(null)
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: 1,
        accept: {
            'image/*': [],
        },
        noClick: true, // para evitar conflicto con el input file custom
    })

    const onSubmit = async (values) => {
        const form = new FormData()
        form.append('title', values.title)
        form.append('description', values.description)
        form.append('primaryColor', values.primaryColor)
        form.append('contrastTextColor', values.contrastTextColor)
        form.append('textColor', values.textColor)
        form.append('backgroundColor', values.backgroundColor)
        form.append('titleFont', values.titleFont)
        form.append('bodyFont', values.bodyFont)
        if (values.logo) {
            form.append('logo', values.logo)
        }
        form.append('country', values.country)
        form.append('phone', values.phone)

        try {
            setLoading(true)
            await editConfig(form)
            setShowSuccessModal(true)
            dispatch(getConfigRequest())
        } catch (error) {
            console.log('error en config', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!configDetail) {
            dispatch(getConfigRequest({ access: user.token }))
        }
    }, [configDetail])

    useEffect(() => {
        if (configDetail) {
            setPreview(configDetail.metadata.logo)
            setTimeout(() => {
                reset({
                    title: configDetail.metadata.title,
                    description: configDetail.metadata.description,
                    primaryColor: configDetail.palette.primary.main,
                    contrastTextColor:
                        configDetail.palette.primary.contrastText,
                    textColor: configDetail.palette.textColor || '#2F4858',
                    backgroundColor: configDetail.palette.backgroundColor || '#f5f6fa',
                    phone: configDetail.phone,
                    logoUrl: configDetail.metadata.logo,
                    titleFont: configDetail.typography?.title ?? '',
                    bodyFont: configDetail.typography?.body ?? '',
                    country: configDetail.metadata.country || 'AR',
                })
            }, 1000)
        }
    }, [configDetail])

    if (loadingConfig) {
        return <LoadinScreen />
    }
    console.log('values', errors)
    return (
        <>
            <Card>
                <CardHeader color="primary">
                    <h4 className={classes.cardTitleWhite}>Personaliza tu tienda</h4>
                    <p className={classes.cardCategoryWhite}>
                        Configura el logo, los colores, la tipografía y la información principal de tu tienda para que se vea como tú quieras.
                    </p>
                </CardHeader>
                <CardBody>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <p className={classes.sectionSubtitle}>Logo de tu tienda</p>
                        <div className={classes.logoSection}>
                            {preview ? (
                                <div className={classes.logoPreviewWrapper} style={{ position: 'relative' }}>
                                    <div className={classes.logoPreview}>
                                        <img
                                            src={preview}
                                            className={classes.logo}
                                            alt={'logo'}
                                        />
                                        <div style={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            display: 'flex',
                                            gap: 8,
                                            background: 'rgba(0,0,0,0.3)',
                                            borderRadius: 8,
                                            padding: 4,
                                        }}>
                                            <Tooltip title="Editar logo">
                                                <EditIcon style={{ cursor: 'pointer', color: '#fff' }} onClick={handleEditImage} />
                                            </Tooltip>
                                            <Tooltip title="Eliminar logo">
                                                <DeleteForeverIcon style={{ cursor: 'pointer', color: '#fff' }} onClick={handleDeleteImage} />
                                            </Tooltip>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                </div>
                            ) : (
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
                        {errors.logo && (
                            <TextDanger>
                                <p className={classes.errorText + ' ' + classes.errorTextBottom}>
                                    {errors.logo.message}
                                </p>
                            </TextDanger>
                        )}
                        <div>
                            <h4 className={classes.sectionSubtitle}>Información de tu tienda</h4>
                            <div className={classes.colorRow}>
                                <div className={classes.flex1}>
                                    <Controller
                                        name="title"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <TextInput
                                                className={classes.input}
                                                error={fieldState.error ? true : false}
                                                errorMessage={fieldState.error}
                                                icon={null}
                                                label={'Nombre de la tienda'}
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        )}
                                    />
                                </div>
                                <div className={classes.flex1}>
                                    <Controller
                                        name="country"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <TextField
                                                fullWidth
                                                select
                                                error={fieldState.error ? true : false}
                                                value={field.value}
                                                label="País"
                                                variant="outlined"
                                                className={classes.input}
                                                onChange={field.onChange}
                                                style={{ backgroundColor: '#FFF' }}
                                                disabled
                                            >
                                                {MP_COUNTRIES.map((c) => (
                                                    <MenuItem key={c.code} value={c.code}>
                                                        {c.name} ({c.dial})
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        )}
                                    />
                                </div>
                                <div className={classes.flex1}>
                                    <Controller
                                        name="phone"
                                        control={control}
                                        render={({ field, fieldState }) => {
                                            const countryObj = MP_COUNTRIES.find(c => c.code === watch('country'))
                                            return (
                                                <TextField
                                                    {...field}
                                                    className={classes.input}
                                                    error={fieldState.error ? true : false}
                                                    helperText={fieldState.error ? fieldState.error.message : ''}
                                                    label={`Télefono de contacto (${countryObj ? countryObj.dial : ''})`}
                                                    variant="outlined"
                                                    fullWidth
                                                    inputProps={{
                                                        maxLength: countryObj ? countryObj.phoneLength : 15,
                                                        inputMode: 'numeric',
                                                        pattern: '[0-9]*',
                                                    }}
                                                    onChange={e => {
                                                        let val = e.target.value.replace(/\D/g, '')
                                                        if (countryObj && countryObj.code === 'AR') {
                                                            // Si empieza con 549, remover 549
                                                            if (val.startsWith('549')) {
                                                                val = val.slice(3)
                                                            } else if (val.startsWith('54')) {
                                                                val = val.slice(2)
                                                            }
                                                            // Si después de remover 54 queda un 9 antes de la característica, también removerlo
                                                            if (val.length > 10 && val.startsWith('9')) {
                                                                val = val.slice(1)
                                                            }
                                                            // Tomar siempre los últimos 10 dígitos
                                                            if (val.length > 10) {
                                                                val = val.slice(-10)
                                                            }
                                                        }
                                                        field.onChange(val)
                                                    }}
                                                    onPaste={e => {
                                                        e.preventDefault()
                                                        let paste = (e.clipboardData || window.clipboardData).getData('text')
                                                        paste = paste.replace(/\D/g, '')
                                                        if (countryObj && countryObj.code === 'AR') {
                                                            if (paste.startsWith('549')) {
                                                                paste = paste.slice(3)
                                                            } else if (paste.startsWith('54')) {
                                                                paste = paste.slice(2)
                                                            }
                                                            if (paste.length > 10 && paste.startsWith('9')) {
                                                                paste = paste.slice(1)
                                                            }
                                                            if (paste.length > 10) {
                                                                paste = paste.slice(-10)
                                                            }
                                                        }
                                                        field.onChange(paste)
                                                    }}
                                                />
                                            )
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
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
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <h4 className={classes.sectionSubtitle}>Personalización del tema</h4>
                            <UpgradePrompt
                                featureKey="themeCustomization"
                            >
                                <div className={classes.colorPreviewRow}>
                                    <div style={{ flex: 1 }}>
                                        <div className={classes.colorSection}>
                                            <div className={classes.colorRow}>
                                                <div className={classes.flexBasis200}>
                                                    <Controller
                                                        name="primaryColor"
                                                        control={control}
                                                        render={({ field, fieldState }) => (
                                                            <>
                                                                <div style={{ display: 'flex' }}>
                                                                    <p style={{ marginTop: 0, marginBottom: 0 }}>
                                                                        Color principal
                                                                    </p>
                                                                    <Tooltip
                                                                        title="Este es el color principal de tu tienda, por ejemplo la cabecera y botónes tenndrán este color"
                                                                        placement="top"
                                                                    >
                                                                        <span style={{ marginLeft: 8 }}>
                                                                            <QuestionMarkIcon />
                                                                        </span>
                                                                    </Tooltip>
                                                                </div>
                                                                <input
                                                                    type="color"
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                />
                                                                {fieldState.error && (
                                                                    <TextDanger>
                                                                        <p className={classes.errorText}>
                                                                            {fieldState.error.message}
                                                                        </p>
                                                                    </TextDanger>
                                                                )}
                                                            </>
                                                        )}
                                                    />
                                                </div>
                                                <div className={classes.flexBasis200}>
                                                    <Controller
                                                        name="contrastTextColor"
                                                        control={control}
                                                        render={({ field, fieldState }) => (
                                                            <>
                                                                <div style={{ display: 'flex' }}>
                                                                    <p style={{ marginTop: 0, marginBottom: 0 }}>
                                                                        Color de contraste
                                                                    </p>
                                                                    <Tooltip
                                                                        title="Este es el color que tomaran todos los elementos que estén encima del color principal por ejemplo el texto de un botón"
                                                                        placement="top"
                                                                    >
                                                                        <span style={{ marginLeft: 8 }}>
                                                                            <QuestionMarkIcon />
                                                                        </span>
                                                                    </Tooltip>
                                                                </div>
                                                                <input
                                                                    type="color"
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                />
                                                                {fieldState.error && (
                                                                    <TextDanger>
                                                                        <p className={classes.errorText}>
                                                                            {fieldState.error.message}
                                                                        </p>
                                                                    </TextDanger>
                                                                )}
                                                            </>
                                                        )}
                                                    />
                                                </div>
                                                <div className={classes.flexBasis200}>
                                                    <Controller
                                                        name="textColor"
                                                        control={control}
                                                        render={({ field, fieldState }) => (
                                                            <>
                                                                <div style={{ display: 'flex' }}>
                                                                    <p style={{ marginTop: 0, marginBottom: 0 }}>
                                                                        Color del texto
                                                                    </p>
                                                                    <Tooltip
                                                                        title="Este es el color que tomará el texto principal y secundario de la tienda."
                                                                        placement="top"
                                                                    >
                                                                        <span style={{ marginLeft: 8 }}>
                                                                            <QuestionMarkIcon />
                                                                        </span>
                                                                    </Tooltip>
                                                                </div>
                                                                <input
                                                                    type="color"
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                />
                                                                {fieldState.error && (
                                                                    <TextDanger>
                                                                        <p className={classes.errorText}>
                                                                            {fieldState.error.message}
                                                                        </p>
                                                                    </TextDanger>
                                                                )}
                                                            </>
                                                        )}
                                                    />
                                                </div>
                                                <div className={classes.flexBasis200}>
                                                    <Controller
                                                        name="backgroundColor"
                                                        control={control}
                                                        render={({ field, fieldState }) => (
                                                            <>
                                                                <div style={{ display: 'flex' }}>
                                                                    <p style={{ marginTop: 0, marginBottom: 0 }}>
                                                                        Color de fondo
                                                                    </p>
                                                                    <Tooltip
                                                                        title="Este es el color de fondo general de la tienda."
                                                                        placement="top"
                                                                    >
                                                                        <span style={{ marginLeft: 8 }}>
                                                                            <QuestionMarkIcon />
                                                                        </span>
                                                                    </Tooltip>
                                                                </div>
                                                                <input
                                                                    type="color"
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                />
                                                                {fieldState.error && (
                                                                    <TextDanger>
                                                                        <p className={classes.errorText}>
                                                                            {fieldState.error.message}
                                                                        </p>
                                                                    </TextDanger>
                                                                )}
                                                            </>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                            <div className={classes.fontRow}>
                                                <div className={classes.flex1}>
                                                    <Controller
                                                        name="titleFont"
                                                        control={control}
                                                        render={({ field, fieldState }) => (
                                                            <>
                                                                <div style={{ display: 'flex' }}>
                                                                    <p style={{ marginTop: 0, marginBottom: 0 }}>
                                                                        Fuente para los títulos
                                                                    </p>
                                                                    <Tooltip
                                                                        title="Esta es la fuente principal de tu tienda, se utiliza para titulos, subtitulos y textos principales."
                                                                        placement="top"
                                                                    >
                                                                        <span style={{ marginLeft: 8 }}>
                                                                            <QuestionMarkIcon />
                                                                        </span>
                                                                    </Tooltip>
                                                                </div>
                                                                <FontPicker
                                                                    families={TITLE_FONTS}
                                                                    apiKey={process.env.REACT_APP_FONTS_KEY}
                                                                    activeFontFamily={field.value}
                                                                    onChange={(nextFont) => field.onChange(nextFont.family)}
                                                                />
                                                                {fieldState.error && (
                                                                    <TextDanger>
                                                                        <p className={classes.errorText}>
                                                                            {fieldState.error.message}
                                                                        </p>
                                                                    </TextDanger>
                                                                )}
                                                            </>
                                                        )}
                                                    />
                                                </div>
                                                <div className={classes.flex1}>
                                                    <Controller
                                                        name="bodyFont"
                                                        control={control}
                                                        render={({ field, fieldState }) => (
                                                            <>
                                                                <div style={{ display: 'flex' }}>
                                                                    <p style={{ marginTop: 0, marginBottom: 0 }}>
                                                                        Fuente para el cuerpo
                                                                    </p>
                                                                    <Tooltip
                                                                        title="Esta fuente se utiliza para el cuerpo en general y textos secundarios"
                                                                        placement="top"
                                                                    >
                                                                        <span style={{ marginLeft: 8 }}>
                                                                            <QuestionMarkIcon />
                                                                        </span>
                                                                    </Tooltip>
                                                                </div>
                                                                <FontPicker
                                                                    pickerId="body"
                                                                    families={BODY_FONTS}
                                                                    apiKey={process.env.REACT_APP_FONTS_KEY}
                                                                    activeFontFamily={field.value}
                                                                    onChange={(nextFont) => field.onChange(nextFont.family)}
                                                                />
                                                                {fieldState.error && (
                                                                    <TextDanger>
                                                                        <p className={classes.errorText}>
                                                                            {fieldState.error.message}
                                                                        </p>
                                                                    </TextDanger>
                                                                )}
                                                            </>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ minWidth: 340, maxWidth: 420, flex: 1 }}>
                                        <StorePreview
                                            logo={preview}
                                            title={watch('title')}
                                            description={watch('description')}
                                            primaryColor={watch('primaryColor')}
                                            contrastTextColor={watch('contrastTextColor')}
                                            textColor={watch('textColor')}
                                            backgroundColor={watch('backgroundColor')}
                                            titleFont={watch('titleFont')}
                                            bodyFont={watch('bodyFont')}
                                        />
                                    </div>
                                </div>
                            </UpgradePrompt>
                        </div>
                        {Object.keys(errors).length > 0 && (
                            <p>
                                Al parecer faltan campos obligatorios en el formulario
                            </p>
                        )}
                        <div className={classes.buttonsRow}>
                            <Button
                                isLoading={loading}
                                variant="contained"
                                color="primary"
                                type="submit"
                            >
                                Guardar
                            </Button>
                        </div>
                    </form>
                </CardBody>
            </Card>
            <CustomModal
                open={showSuccessModal}
                handleClose={() => setShowSuccessModal(false)}
                icon={'success'}
                title="¡Listo!"
                subTitle="Configuración guardada exitosamente"
                hasCancel={false}
                hasConfirm={true}
                cancelCb={() => { }}
                confirmCb={() => setShowSuccessModal(false)}
            />
        </>
    )
}
