import React, { useCallback, useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useDropzone } from 'react-dropzone'
import uploadImage from 'assets/img/upload-cloud.png'
import {
    Box,
    IconButton,
    TextField,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@material-ui/core'
import TextInput from 'components/TextInput/Index'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Button from 'components/CustomButtons/Button'
import TextDanger from 'components/Typography/Danger'
import { useDispatch, useSelector } from 'react-redux'

import { useParams, useHistory } from 'react-router-dom'

import { primaryColor } from 'assets/jss/material-dashboard-react.js'
import LoadinScreen from 'components/LoadingScreen'
import { Delete, Add, CheckCircle, Error, DeleteForever } from '@material-ui/icons'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import Card from 'components/Card/Card.js'
import CardHeader from 'components/Card/CardHeader.js'
import CardBody from 'components/Card/CardBody.js'
import TinyMCEEditor from 'components/TinyMCEEditor'
import { 
    createBlogRequest, 
    updateBlogRequest, 
    getBlogDetailRequest,
    selectLoadingBlogDetail,
    selectBlogDetail,
    selectBlogDetailError,
} from 'store/blogs'

// schema
const schema = yup.object({
    title: yup.string().required('El título es obligatorio'),
    content: yup.string()
        .required('El contenido es obligatorio')
        .test('not-empty-html', 'El contenido no puede estar vacío', (value) => {
            if (!value) return false
            // Remover etiquetas HTML y espacios para verificar si hay contenido real
            const textContent = value.replace(/<[^>]*>/g, '').trim()
            return textContent.length > 0
        }),
    description: yup.string().required('El extracto es obligatorio'),
    keywords: yup.array().min(1, 'Debe agregar al menos una palabra clave'),
    image: yup
        .array()
        .max(1, 'Máximo 1 imagen'),
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
    input: {
        width: '100%',
        '& .MuiInputBase-input': {
            background: '#fff !important',
        },
    },
    card: {
        marginBottom: '20px',
    },
    cardTitleWhite: {
        color: '#FFFFFF',
        marginTop: '0px',
        minHeight: 'auto',
        fontWeight: '300',
        fontFamily: "'Roboto",
        marginBottom: '3px',
        textDecoration: 'none',
    },
    cardCategoryWhite: {
        color: 'rgba(255, 255, 255, 0.62)',
        margin: '0',
        fontSize: '14px',
        marginTop: '0',
        marginBottom: '0',
    },
    tagsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    tagsInputRow: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-end',
    },
    tagsChipsContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginTop: '0.5rem',
    },
    tagChip: {
        backgroundColor: primaryColor[0],
        color: '#fff',
        '& .MuiChip-deleteIcon': {
            color: '#fff',
        },
    },
    seoSection: {
        marginTop: '2rem',
        padding: '1rem',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
    },
    seoTitle: {
        color: '#333',
        marginBottom: '1rem',
        fontSize: '1.1rem',
        fontWeight: 'bold',
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
})

export default function AddBlog() {
    const history = useHistory()
    const params = useParams()
    const dispatch = useDispatch()
    const classes = useStyles()
    const [keywordInput, setKeywordInput] = useState('')
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [showErrorModal, setShowErrorModal] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [loading, setLoading] = useState(false)

    // Redux selectors (solo para carga de detalle)
    const loadingBlogDetail = useSelector(selectLoadingBlogDetail)
    const blogDetail = useSelector(selectBlogDetail)
    const blogDetailError = useSelector(selectBlogDetailError)
    
    // Debug: Log del blogDetail
    console.log('BlogDetail en componente:', blogDetail)
    console.log('LoadingBlogDetail:', loadingBlogDetail)
    console.log('BlogDetailError:', blogDetailError)
    console.log('param s', params.id)

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            title: '',
            content: '',
            description: '',
            keywords: [],
            image: [],
        },
    })

    const keywordsArray = useFieldArray({
        control,
        name: 'keywords',
    })

    const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
        control,
        name: 'image',
    })

    const onDrop = useCallback((acceptedFiles) => {
        acceptedFiles.forEach((file) => {
            appendImage({
                file: file,
                preview: URL.createObjectURL(file),
            })
        })
    }, [appendImage])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: 1,
        accept: {
            'image/*': [],
        },
    })



    const submit = async (values) => {
        setLoading(true)
        setErrorMessage('')

        try {
            const formData = new FormData()
            formData.append('title', values.title)
            formData.append('content', values.content)
            formData.append('description', values.description)
            formData.append('keywords', JSON.stringify(values.keywords ? values.keywords.map(kw => kw.keyword) : []))
            
            if (values.image[0]?.file) {
                formData.append('image', values.image[0].file)
            }

            if (params.id) {
                // Actualizar blog existente
                const result = await dispatch(updateBlogRequest({ blogId: params.id, blogData: formData }))
                if (updateBlogRequest.fulfilled.match(result)) {
                    setShowSuccessModal(true)
                } else {
                    setErrorMessage(result.payload || 'Error al actualizar el blog')
                    setShowErrorModal(true)
                }
            } else {
                // Crear nuevo blog
                const result = await dispatch(createBlogRequest(formData))
                if (createBlogRequest.fulfilled.match(result)) {
                    setShowSuccessModal(true)
                } else {
                    setErrorMessage(result.payload || 'Error al crear el blog')
                    setShowErrorModal(true)
                }
            }
        } catch (error) {
            setErrorMessage(error.message || 'Error inesperado')
            setShowErrorModal(true)
        } finally {
            setLoading(false)
        }
    }

    // Funciones para manejar keywords
    const handleAddKeyword = () => {
        const trimmedKeyword = keywordInput?.trim() || ''
        if (trimmedKeyword && !keywordsArray.fields.some(keyword => keyword.keyword === trimmedKeyword)) {
            keywordsArray.append({ keyword: trimmedKeyword })
            setKeywordInput('')
        }
    }

    const handleRemoveKeyword = (index) => {
        keywordsArray.remove(index)
    }

    const handleKeywordInputKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAddKeyword()
        }
    }

    const handleDeleteImage = (index) => {
        removeImage(index)
    }

    useEffect(() => {
        if (params.id) {
            dispatch(getBlogDetailRequest(params.id))
        }
    }, [params.id, dispatch])

    useEffect(() => {
        if (blogDetail && params.id) {
            console.log('BlogDetail recibido:', blogDetail)
            reset({
                title: blogDetail.title || '',
                content: blogDetail.content || '',
                description: blogDetail.description || '',
                keywords: blogDetail.keywords ? blogDetail.keywords.map(keyword => ({ keyword: keyword || '' })) : [],
            })
            if(blogDetail.image){
                appendImage({
                    file: blogDetail.image.url,
                    preview: blogDetail.image.url,
                })
            }
        }
    }, [blogDetail, params.id, reset, appendImage])

    // Manejar errores de carga de detalle
    useEffect(() => {
        if (blogDetailError) {
            setErrorMessage(blogDetailError)
            setShowErrorModal(true)
        }
    }, [blogDetailError])

    const handleSuccessModalClose = () => {
        setShowSuccessModal(false)
        history.push('/admin/blogs')
    }

    const handleErrorModalClose = () => {
        setShowErrorModal(false)
        setErrorMessage('')
    }

    if (loadingBlogDetail) {
        return <LoadinScreen />
    }

    return (
        <section>
            <IconButton
                className={classes.backButton}
                onClick={() => history.push('/admin/blogs')}
            >
                <ArrowBackIcon />
            </IconButton>
            <Card className={classes.card}>
                <CardHeader color="primary">
                    <h4 className={classes.cardTitleWhite}>
                        {params.id ? 'Editar blog' : 'Crear blog'}
                    </h4>
                    <p className={classes.cardCategoryWhite}>
                        {params.id ? 'Edita' : 'Crea'} el contenido de tu blog
                    </p>
                </CardHeader>
                <CardBody>
                    <form onSubmit={handleSubmit(submit)}>
                        <Box>
                            <p>Imagen del blog</p>
                        </Box>
                        <div className={classes.imagesRow}>
                            {imageFields.map((file, index) => {
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
                                            alt="blog-image"
                                        />
                                    </div>
                                )
                            })}
                            {imageFields.length < 1 && (
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
                            {errors.image && (
                                <TextDanger>
                                    <p className={classes.errorText}>
                                        {errors.image.message}
                                    </p>
                                </TextDanger>
                            )}
                        </Box>

                        <Box className={classes.inputRow}>
                            <Box flex="0 1 812px">
                                <Controller
                                    name="title"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextInput
                                            error={fieldState.error ? true : false}
                                            errorMessage={fieldState.error?.message}
                                            icon={null}
                                            label="Título del blog"
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                            </Box>
                        </Box>

                        <Box className={classes.inputRow}>
                            <Box flex="0 1 812px">
                                <Controller
                                    name="description"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextInput
                                            error={fieldState.error ? true : false}
                                            errorMessage={fieldState.error?.message}
                                            icon={null}
                                            label="Extracto del blog"
                                            value={field.value}
                                            onChange={field.onChange}
                                            multiline
                                            rows={3}
                                        />
                                    )}
                                />
                            </Box>
                        </Box>



                        <Box className={classes.descriptionRow}>
                            <Controller
                                name="content"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <TinyMCEEditor
                                        apiKey={process.env.REACT_APP_TINYMCE_API_KEY}
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                        label="Contenido del blog"
                                        error={!!fieldState.error}
                                        errorMessage={fieldState.error?.message}
                                        placeholder="Escribe el contenido de tu blog..."
                                        height={400}
                                    />
                                )}
                            />
                        </Box>

                        <Box className={classes.seoSection}>
                            <Typography className={classes.seoTitle}>
                                Configuración SEO
                            </Typography>
                            <Box className={classes.inputRow}>
                                <Box flex="0 1 812px">
                                    <Box className={classes.tagsContainer}>
                                        <Typography variant="body2" style={{ color: '#666', marginBottom: '0.5rem' }}>
                                            Palabras clave SEO
                                        </Typography>
                                        <Box className={classes.tagsInputRow}>
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                placeholder="Escribe una palabra clave..."
                                                value={keywordInput || ''}
                                                onChange={(e) => setKeywordInput(e.target.value)}
                                                onKeyPress={handleKeywordInputKeyPress}
                                                style={{ backgroundColor: '#FFF' }}
                                            />
                                            <Button
                                                onClick={handleAddKeyword}
                                                disabled={!keywordInput.trim()}
                                                variant="contained"
                                                color="primary"
                                                startIcon={<Add />}
                                                style={{ minWidth: '120px' }}
                                            >
                                                Agregar
                                            </Button>
                                        </Box>
                                        <Box className={classes.tagsChipsContainer}>
                                            {keywordsArray.fields.map((keyword, index) => (
                                                <Box
                                                    key={keyword.id}
                                                    style={{
                                                        backgroundColor: primaryColor[0],
                                                        color: '#fff',
                                                        padding: '4px 12px',
                                                        borderRadius: '16px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        fontSize: '14px',
                                                    }}
                                                >
                                                    <span>{keyword.keyword || ''}</span>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleRemoveKeyword(index)}
                                                        style={{ color: '#fff', padding: '2px' }}
                                                    >
                                                        <Delete style={{ fontSize: '16px' }} />
                                                    </IconButton>
                                                </Box>
                                            ))}
                                        </Box>
                                        {errors.keywords && (
                                            <TextDanger>
                                                <p className={classes.errorText}>
                                                    {errors.keywords.message}
                                                </p>
                                            </TextDanger>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        <Box className={classes.buttonsRow}>
                            <Button
                                isLoading={loading}
                                variant="contained"
                                color="primary"
                                type="submit"
                            >
                                {params.id ? 'Actualizar' : 'Crear'} Blog
                            </Button>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={() => history.push('/admin/blogs')}
                            >
                                Cancelar
                            </Button>
                        </Box>
                    </form>
                </CardBody>
            </Card>

            {/* Modal de éxito */}
            <Dialog
                open={showSuccessModal}
                onClose={handleSuccessModalClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <CheckCircle style={{ color: '#4caf50', fontSize: '2rem' }} />
                    <span>¡Éxito!</span>
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {params.id 
                            ? 'El blog ha sido actualizado exitosamente.' 
                            : 'El blog ha sido creado exitosamente.'
                        }
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleSuccessModalClose}
                        variant="contained"
                        color="primary"
                    >
                        Continuar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal de error */}
            <Dialog
                open={showErrorModal}
                onClose={handleErrorModalClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Error style={{ color: '#f44336', fontSize: '2rem' }} />
                    <span>Error</span>
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {errorMessage ? errorMessage.toString() : 'Ha ocurrido un error inesperado.'}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleErrorModalClose}
                        variant="contained"
                        color="primary"
                    >
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>
        </section>
    )
}
