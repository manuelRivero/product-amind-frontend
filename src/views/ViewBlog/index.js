import React, { useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Box, IconButton, Divider, Chip } from '@material-ui/core'
import { useParams, useHistory } from 'react-router-dom'
import { primaryColor } from 'assets/jss/material-dashboard-react.js'
import { useDispatch, useSelector } from 'react-redux'
import LoadinScreen from 'components/LoadingScreen'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import Card from 'components/Card/Card.js'
import CardHeader from 'components/Card/CardHeader.js'
import CardBody from 'components/Card/CardBody.js'
import Button from 'components/CustomButtons/Button'
import EditIcon from '@material-ui/icons/Edit'
import { 
    getBlogDetailRequest,
    selectLoadingBlogDetail,
    selectBlogDetail,
    selectBlogDetailError,
} from 'store/blogs'

const useStyles = makeStyles({
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
    sectionTitle: {
        fontSize: '1.5rem',
        fontWeight: '600',
        color: '#3C4858',
        marginBottom: '1.5rem',
        paddingBottom: '0.5rem',
    },
    imagesWrapper: {
        position: 'relative',
        maxWidth: '500px',
        height: '400px',
        width: '100%',
        background: '#fff',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        marginBottom: '2rem',
    },
    blogImage: {
        borderRadius: '16px',
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    infoSection: {
        marginBottom: '2rem',
    },
    infoItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        marginBottom: '1.5rem',
    },
    infoLabel: {
        fontSize: '0.875rem',
        color: '#666',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    infoValue: {
        fontSize: '1.125rem',
        fontWeight: '600',
        color: '#3C4858',
    },
    titleValue: {
        fontSize: '2rem',
        fontWeight: '700',
        color: '#3C4858',
        lineHeight: '1.2',
    },
    descriptionText: {
        fontSize: '1.125rem',
        lineHeight: '1.6',
        color: '#555',
        marginTop: '0.5rem',
    },
    contentText: {
        fontSize: '1rem',
        lineHeight: '1.8',
        color: '#333',
        marginTop: '1rem',
        '& img': {
            maxWidth: '100%',
            height: 'auto',
            borderRadius: '8px',
        },
        '& p': {
            marginBottom: '1rem',
        },
        '& h1, & h2, & h3, & h4, & h5, & h6': {
            marginTop: '1.5rem',
            marginBottom: '1rem',
            fontWeight: '600',
        },
    },
    keywordsSection: {
        background: '#f8f9fa',
        borderRadius: '16px',
        padding: '2rem',
        marginTop: '2rem',
    },
    keywordsList: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginTop: '1rem',
    },
    buttonsRow: {
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        marginTop: '2rem',
    },
    dateInfo: {
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
        marginTop: '1rem',
    },
    dateItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
    },
    dateLabel: {
        fontSize: '0.75rem',
        color: '#999',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    dateValue: {
        fontSize: '0.875rem',
        color: '#666',
    },
})

export default function ViewBlog() {
    const history = useHistory()
    const params = useParams()
    const dispatch = useDispatch()
    const classes = useStyles()

    const loadingBlogDetail = useSelector(selectLoadingBlogDetail)
    const blogDetail = useSelector(selectBlogDetail)
    const blogDetailError = useSelector(selectBlogDetailError)

    useEffect(() => {
        if (params.id) {
            dispatch(getBlogDetailRequest(params.id))
        }
    }, [params.id, dispatch])

    const formatDate = (dateString) => {
        if (!dateString) return 'No disponible'
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    if (loadingBlogDetail) {
        return <LoadinScreen />
    }

    if (blogDetailError) {
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
                        <h4 className={classes.cardTitleWhite}>Ver blog</h4>
                    </CardHeader>
                    <CardBody>
                        <p>Error al cargar el blog: {blogDetailError}</p>
                        <Box className={classes.buttonsRow}>
                            <Button
                                color="primary"
                                onClick={() => history.push('/admin/blogs')}
                            >
                                Volver a blogs
                            </Button>
                        </Box>
                    </CardBody>
                </Card>
            </section>
        )
    }

    if (!blogDetail) {
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
                        <h4 className={classes.cardTitleWhite}>Ver blog</h4>
                    </CardHeader>
                    <CardBody>
                        <p>No se encontró información para este blog.</p>
                        <Box className={classes.buttonsRow}>
                            <Button
                                color="primary"
                                onClick={() => history.push('/admin/blogs')}
                            >
                                Volver a blogs
                            </Button>
                        </Box>
                    </CardBody>
                </Card>
            </section>
        )
    }

    const keywords = blogDetail.keywords || []

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
                    <h4 className={classes.cardTitleWhite}>Ver blog</h4>
                    <p className={classes.cardCategoryWhite}>
                        Visualiza el contenido completo del blog
                    </p>
                </CardHeader>
                <CardBody>
                    {/* Imagen del blog */}
                    {blogDetail.image && blogDetail.image.url && (
                        <div className={classes.imagesWrapper}>
                            <img
                                className={classes.blogImage}
                                src={blogDetail.image.url}
                                alt={blogDetail.title || 'Blog image'}
                            />
                        </div>
                    )}

                    <Divider style={{ margin: '2rem 0' }} />

                    {/* Título */}
                    <div className={classes.infoItem}>
                        <span className={classes.infoLabel}>Título</span>
                        <span className={classes.titleValue}>{blogDetail.title || 'Sin título'}</span>
                    </div>

                    {/* Fechas */}
                    <div className={classes.dateInfo}>
                        {blogDetail.createdAt && (
                            <div className={classes.dateItem}>
                                <span className={classes.dateLabel}>Fecha de creación</span>
                                <span className={classes.dateValue}>{formatDate(blogDetail.createdAt)}</span>
                            </div>
                        )}
                        {blogDetail.updatedAt && (
                            <div className={classes.dateItem}>
                                <span className={classes.dateLabel}>Última actualización</span>
                                <span className={classes.dateValue}>{formatDate(blogDetail.updatedAt)}</span>
                            </div>
                        )}
                    </div>

                    <Divider style={{ margin: '2rem 0' }} />

                    {/* Extracto/Descripción */}
                    {blogDetail.description && (
                        <div className={classes.infoItem}>
                            <span className={classes.infoLabel}>Extracto</span>
                            <p className={classes.descriptionText}>{blogDetail.description}</p>
                        </div>
                    )}

                    <Divider style={{ margin: '2rem 0' }} />

                    {/* Contenido */}
                    <div className={classes.infoItem}>
                        <span className={classes.infoLabel}>Contenido</span>
                        <div
                            className={classes.contentText}
                            dangerouslySetInnerHTML={{ 
                                __html: blogDetail.content || '<p>Sin contenido</p>' 
                            }}
                        />
                    </div>

                    {/* Palabras clave SEO */}
                    {keywords.length > 0 && (
                        <div className={classes.keywordsSection}>
                            <span className={classes.infoLabel}>Palabras clave SEO</span>
                            <div className={classes.keywordsList}>
                                {keywords.map((keyword, index) => (
                                    <Chip 
                                        key={index} 
                                        label={keyword} 
                                        style={{
                                            backgroundColor: primaryColor[0],
                                            color: '#fff',
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Botones de acción */}
                    <Box className={classes.buttonsRow}>
                        <Button
                            color="primary"
                            onClick={() => history.push(`/admin/blogs/edit-blog/${params.id}`)}
                            startIcon={<EditIcon />}
                        >
                            Editar Blog
                        </Button>
                        <Button
                            color="secondary"
                            onClick={() => history.push('/admin/blogs')}
                        >
                            Volver
                        </Button>
                    </Box>
                </CardBody>
            </Card>
        </section>
    )
}

