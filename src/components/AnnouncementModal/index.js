import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    CircularProgress
} from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import Button from 'components/CustomButtons/Button'
import {
    closeAnnouncementsModal,
    markAnnouncementAsRead,
    fetchAnnouncements,
    setCurrentAnnouncementIndex
} from '../../store/announcements'
import { ANNOUNCEMENT_TYPES, PRIORITIES, MESSAGES } from './const'
import moment from 'moment'

const useStyles = makeStyles({
    dialogPaper: {
        minWidth: '600px',
        maxWidth: '800px',
        maxHeight: '90vh'
    },
    dialogTitle: {
        position: 'relative',
        padding: '1rem 1.5rem',
        paddingRight: '3.5rem',
        borderBottom: '1px solid #e0e0e0'
    },
    titleText: {
        margin: 0,
        fontSize: '1.25rem',
        fontWeight: 500,
        paddingRight: '1rem'
    },
    closeButton: {
        position: 'absolute',
        top: '0.5rem',
        right: '0.5rem',
        padding: '0.5rem',
        zIndex: 1
    },
    dialogContent: {
        padding: '1.5rem'
    },
    headerSection: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem',
        gap: '1rem'
    },
    typeIcon: {
        fontSize: '2rem'
    },
    titleSection: {
        flex: 1
    },
    announcementTitle: {
        margin: 0,
        marginBottom: '0.5rem',
        fontSize: '1.5rem',
        fontWeight: 600
    },
    priorityBadge: {
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 600,
        marginTop: '0.5rem'
    },
    unreadIndicator: {
        display: 'inline-block',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: '#2196F3',
        marginLeft: '0.5rem'
    },
    contentSection: {
        marginBottom: '1.5rem'
    },
    contentText: {
        margin: 0,
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
    },
    metadataSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        padding: '1rem',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px'
    },
    metadataRow: {
        display: 'flex',
        gap: '0.5rem',
        fontSize: '0.875rem',
        color: '#666'
    },
    metadataLabel: {
        fontWeight: 600
    },
    attachmentsSection: {
        marginBottom: '1.5rem'
    },
    attachmentsTitle: {
        margin: 0,
        marginBottom: '0.75rem',
        fontSize: '1rem',
        fontWeight: 600
    },
    imagesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1rem',
        marginTop: '0.75rem'
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        paddingTop: '100%',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
        cursor: 'pointer',
        '&:hover': {
            opacity: 0.9
        }
    },
    attachmentImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '8px'
    },
    imageModal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
    },
    imageModalContent: {
        maxWidth: '90vw',
        maxHeight: '90vh',
        objectFit: 'contain'
    },
    navigationSection: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        borderTop: '1px solid #e0e0e0',
        borderBottom: '1px solid #e0e0e0',
        marginBottom: '1rem'
    },
    navigationButtons: {
        display: 'flex',
        gap: '0.5rem'
    },
    positionIndicator: {
        fontSize: '0.875rem',
        color: '#666',
        fontWeight: 500
    },
    dialogActions: {
        padding: '1rem 1.5rem',
        justifyContent: 'space-between'
    },
    actionsLeft: {
        display: 'flex',
        gap: '0.5rem'
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '300px'
    },
    errorContainer: {
        padding: '2rem',
        textAlign: 'center'
    },
    errorMessage: {
        marginBottom: '1rem',
        color: '#f44336'
    },
    emptyContainer: {
        padding: '2rem',
        textAlign: 'center'
    },
    emptyMessage: {
        color: '#666'
    }
})

export default function AnnouncementModal() {
    const classes = useStyles()
    const dispatch = useDispatch()
    const [selectedImage, setSelectedImage] = useState(null)
    const {
        announcements,
        pagination,
        loadingAnnouncements,
        errorAnnouncements,
        currentAnnouncementIndex,
        isModalOpen
    } = useSelector((state) => state.announcements)

    // Filtrar solo anuncios no leídos para mostrar
    const unreadAnnouncements = announcements.filter(ann => !ann.isRead)
    const unreadIndices = announcements
        .map((ann, index) => (!ann.isRead ? index : null))
        .filter(index => index !== null)
    
    // Obtener el índice en el array de no leídos
    const currentUnreadIndex = unreadIndices.indexOf(currentAnnouncementIndex)
    const currentAnnouncement = announcements[currentAnnouncementIndex]
    
    // Navegación solo entre no leídos
    const hasNext = currentUnreadIndex < unreadIndices.length - 1 || (pagination && pagination.hasNextPage)
    const hasPrevious = currentUnreadIndex > 0
    const totalAnnouncements = pagination?.unread || unreadAnnouncements.length

    // Debug: verificar estado del anuncio actual
    useEffect(() => {
        if (currentAnnouncement) {
            console.log('Anuncio actual:', {
                id: currentAnnouncement._id,
                isRead: currentAnnouncement.isRead,
                title: currentAnnouncement.title
            })
        }
    }, [currentAnnouncement])

    // Limpiar imagen seleccionada cuando se cierra el modal
    useEffect(() => {
        if (!isModalOpen) {
            setSelectedImage(null)
        }
    }, [isModalOpen])

    // Limpiar imagen seleccionada cuando cambia el anuncio
    useEffect(() => {
        setSelectedImage(null)
    }, [currentAnnouncementIndex])

    // Marcar como leído automáticamente al mostrar el anuncio
    useEffect(() => {
        if (isModalOpen && currentAnnouncement && currentAnnouncement._id && !currentAnnouncement.isRead) {
            console.log('Marcando anuncio como leído automáticamente:', currentAnnouncement._id)
            dispatch(markAnnouncementAsRead({ id: currentAnnouncement._id }))
        }
    }, [isModalOpen, currentAnnouncement?._id, currentAnnouncement?.isRead, dispatch])

    // Cargar más anuncios si se navega cerca del final
    useEffect(() => {
        if (
            isModalOpen &&
            currentAnnouncementIndex >= announcements.length - 2 &&
            pagination &&
            pagination.hasNextPage &&
            !loadingAnnouncements
        ) {
            dispatch(fetchAnnouncements({ page: pagination.page + 1, limit: 10 }))
        }
    }, [isModalOpen, currentAnnouncementIndex, announcements.length, pagination, loadingAnnouncements, dispatch])

    const handleClose = (e) => {
        if (e) {
            e.stopPropagation()
            e.preventDefault()
        }
        // Marcar el anuncio actual como leído antes de cerrar si no está leído
        if (currentAnnouncement && currentAnnouncement._id && !currentAnnouncement.isRead) {
            console.log('Marcando anuncio como leído al cerrar:', currentAnnouncement._id, currentAnnouncement)
            dispatch(markAnnouncementAsRead({ id: currentAnnouncement._id }))
        } else {
            console.log('No se marca como leído al cerrar:', {
                hasAnnouncement: !!currentAnnouncement,
                hasId: !!currentAnnouncement?._id,
                isRead: currentAnnouncement?.isRead
            })
        }
        setSelectedImage(null)
        dispatch(closeAnnouncementsModal())
    }

    const handleNext = () => {
        if (hasNext) {
            // Si hay más no leídos en el array actual, ir al siguiente
            if (currentUnreadIndex < unreadIndices.length - 1) {
                const nextUnreadIndex = unreadIndices[currentUnreadIndex + 1]
                dispatch(setCurrentAnnouncementIndex(nextUnreadIndex))
            } else if (pagination && pagination.hasNextPage) {
                // Si no hay más no leídos pero hay más páginas, cargar siguiente página
                dispatch(fetchAnnouncements({ page: pagination.page + 1, limit: 10 }))
            }
        }
    }

    const handlePrevious = () => {
        if (hasPrevious && currentUnreadIndex > 0) {
            const prevUnreadIndex = unreadIndices[currentUnreadIndex - 1]
            dispatch(setCurrentAnnouncementIndex(prevUnreadIndex))
        }
    }

    const handleMarkAsRead = () => {
        if (currentAnnouncement && !currentAnnouncement.isRead) {
            dispatch(markAnnouncementAsRead({ id: currentAnnouncement._id }))
        }
    }

    const getTypeConfig = (type) => {
        return ANNOUNCEMENT_TYPES[type] || ANNOUNCEMENT_TYPES.info
    }

    const getPriorityConfig = (priority) => {
        return PRIORITIES[priority] || PRIORITIES.medium
    }

    const renderContent = () => {
        if (loadingAnnouncements && announcements.length === 0) {
            return (
                <div className={classes.loadingContainer}>
                    <CircularProgress />
                </div>
            )
        }

        if (errorAnnouncements && announcements.length === 0) {
            return (
                <div className={classes.errorContainer}>
                    <p className={classes.errorMessage}>{MESSAGES.error}</p>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => dispatch(fetchAnnouncements({ page: 0, limit: 10 }))}
                    >
                        {MESSAGES.errorRetry}
                    </Button>
                </div>
            )
        }

        // Verificar si hay anuncios no leídos
        if (unreadAnnouncements.length === 0) {
            return (
                <div className={classes.emptyContainer}>
                    <p className={classes.emptyMessage}>{MESSAGES.noAnnouncements}</p>
                </div>
            )
        }

        if (!currentAnnouncement || currentAnnouncement.isRead) {
            // Si el anuncio actual está leído, buscar el siguiente no leído
            const nextUnreadIndex = unreadIndices[0]
            if (nextUnreadIndex !== undefined) {
                dispatch(setCurrentAnnouncementIndex(nextUnreadIndex))
            }
            return null
        }

        const typeConfig = getTypeConfig(currentAnnouncement.type)
        const priorityConfig = getPriorityConfig(currentAnnouncement.priority)

        return (
            <>
                <div className={classes.headerSection}>
                    <div className={classes.typeIcon}>{typeConfig.icon}</div>
                    <div className={classes.titleSection}>
                        <h2 className={classes.announcementTitle}>
                            {currentAnnouncement.title}
                            {!currentAnnouncement.isRead && <span className={classes.unreadIndicator} />}
                        </h2>
                        <div
                            className={classes.priorityBadge}
                            style={{
                                color: priorityConfig.color,
                                backgroundColor: priorityConfig.backgroundColor
                            }}
                        >
                            {priorityConfig.label}
                        </div>
                    </div>
                </div>

                <div className={classes.contentSection}>
                    <div
                        className={classes.contentText}
                        dangerouslySetInnerHTML={{ __html: currentAnnouncement.content }}
                    />
                </div>

                <div className={classes.metadataSection}>
                    <div className={classes.metadataRow}>
                        <span className={classes.metadataLabel}>{MESSAGES.published}:</span>
                        <span>{moment(currentAnnouncement.publishedAt).format('DD/MM/YYYY HH:mm')}</span>
                    </div>
                    {currentAnnouncement.expiresAt && (
                        <div className={classes.metadataRow}>
                            <span className={classes.metadataLabel}>{MESSAGES.expires}:</span>
                            <span>{moment(currentAnnouncement.expiresAt).format('DD/MM/YYYY HH:mm')}</span>
                        </div>
                    )}
                </div>

                {currentAnnouncement.attachments && currentAnnouncement.attachments.length > 0 && (
                    <div className={classes.attachmentsSection}>
                        <h3 className={classes.attachmentsTitle}>{MESSAGES.attachments}</h3>
                        <div className={classes.imagesGrid}>
                            {currentAnnouncement.attachments.map((attachment, index) => (
                                <div
                                    key={index}
                                    className={classes.imageContainer}
                                    onClick={() => setSelectedImage(attachment.url)}
                                >
                                    <img
                                        src={attachment.url}
                                        alt={attachment.name || `Imagen ${index + 1}`}
                                        className={classes.attachmentImage}
                                        onError={(e) => {
                                            e.target.style.display = 'none'
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className={classes.navigationSection}>
                    <div className={classes.navigationButtons}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handlePrevious}
                            disabled={!hasPrevious}
                            justIcon
                        >
                            <ArrowBackIcon />
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleNext}
                            disabled={!hasNext}
                            justIcon
                        >
                            <ArrowForwardIcon />
                        </Button>
                    </div>
                    <div className={classes.positionIndicator}>
                        {MESSAGES.position
                            .replace('{current}', currentUnreadIndex + 1)
                            .replace('{total}', totalAnnouncements)}
                    </div>
                </div>
            </>
        )
    }

    return (
        <Dialog
            open={isModalOpen}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            classes={{ paper: classes.dialogPaper }}
        >
            <DialogTitle className={classes.dialogTitle}>
                <h2 className={classes.titleText}>{MESSAGES.title}</h2>
                <IconButton 
                    className={classes.closeButton} 
                    onClick={handleClose}
                    aria-label="Cerrar"
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent className={classes.dialogContent}>{renderContent()}</DialogContent>
            <DialogActions className={classes.dialogActions}>
                <div className={classes.actionsLeft}>
                    {currentAnnouncement && !currentAnnouncement.isRead && (
                        <Button variant="outlined" color="primary" onClick={handleMarkAsRead}>
                            {MESSAGES.markAsRead}
                        </Button>
                    )}
                </div>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleClose}
                >
                    {MESSAGES.close}
                </Button>
            </DialogActions>

            {/* Modal para ver imagen en tamaño completo */}
            <Dialog
                open={Boolean(selectedImage)}
                onClose={() => setSelectedImage(null)}
                maxWidth="lg"
                fullWidth
            >
                <DialogContent className={classes.imageModal}>
                    {selectedImage && (
                        <img
                            src={selectedImage}
                            alt="Vista completa"
                            className={classes.imageModalContent}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="primary" onClick={() => setSelectedImage(null)}>
                        {MESSAGES.close}
                    </Button>
                </DialogActions>
            </Dialog>
        </Dialog>
    )
}

