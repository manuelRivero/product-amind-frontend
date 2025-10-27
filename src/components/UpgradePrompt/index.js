import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import { Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button as MuiButton } from '@material-ui/core'
import { Lock as LockIcon, CheckCircle, ErrorOutline } from '@material-ui/icons'
import Button from 'components/CustomButtons/Button'
import { usePlanPermissions } from '../../hooks/usePlanPermissions'
import { isBinaryFeatureType } from '../../views/helpers/planFeatures'
import { useHistory } from 'react-router-dom'

const useStyles = makeStyles((theme) => ({
    upgradePrompt: {
        position: 'relative',
        width: '100%',
        maxHeight: 300,
        overflow: 'hidden',
        borderRadius: theme.spacing(2),
        border: '3px dashed #e0e0e0'
    },
    proBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        background: 'linear-gradient(45deg, #FF6B35 30%, #F7931E 90%)',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        zIndex: 20,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        animation: '$glow 2s ease-in-out infinite alternate',
    },
    '@keyframes glow': {
        '0%': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        },
        '100%': {
            boxShadow: '0 2px 8px rgba(255,107,53,0.4)',
        },
    },
    contentWithBlur: {
        filter: 'blur(1px)',
        opacity: 0.8,
        pointerEvents: 'none',
        transition: 'all 0.3s ease',
        '&:hover': {
            filter: 'blur(0.5px)',
            opacity: 0.9,
        },
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.spacing(2),
        backdropFilter: 'blur(1px)',
        zIndex: 10,
        transition: 'all 0.3s ease',
        '&:hover': {
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 100%)',
            transform: 'scale(1.02)',
        },
    },
    featureLocked: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing(2),
        textAlign: 'center',
        maxWidth: 300,
    },
    lockIcon: {
        fontSize: 32,
        color: '#6c757d',
        marginBottom: theme.spacing(1),
        animation: '$pulse 2s infinite',
    },
    title: {
        fontSize: '1.1rem',
        fontWeight: 600,
        color: '#495057',
        marginBottom: theme.spacing(1),
        margin: 0,
    },
    description: {
        fontSize: '0.875rem',
        color: '#6c757d',
        marginBottom: theme.spacing(2),
        lineHeight: 1.4,
        margin: '0 0 12px 0',
    },
    featureType: {
        fontSize: '0.8rem',
        color: '#888',
        marginBottom: theme.spacing(1),
        textAlign: 'center',
        fontStyle: 'italic',
    },
    ctaLink: {
        textDecoration: 'underline',
        cursor: 'pointer',
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        background: 'none',
        border: 'none',
        fontSize: '1rem',
        '&:hover': {
            color: theme.palette.primary.main,
        },
    },
    modalHeadline: {
        fontSize: '1.3rem',
        fontWeight: 700,
        marginBottom: theme.spacing(1),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    modalIntro: {
        fontSize: '1rem',
        marginBottom: theme.spacing(2),
        color: '#333',
        whiteSpace: 'pre-line',
    },
    modalBenefits: {
        marginBottom: theme.spacing(2),
        paddingLeft: theme.spacing(2),
        '& li': {
            marginBottom: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
        },
    },
    modalLossReasons: {
        marginBottom: theme.spacing(2),
        paddingLeft: theme.spacing(2),
        '& li': {
            marginBottom: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
        },
    },
    modalClosing: {
        fontWeight: 600,
        fontSize: '1.05rem',
        marginBottom: theme.spacing(2),
        textAlign: 'center',
    },

    disabledContent: {
        opacity: 0.5,
        pointerEvents: 'none',
        filter: 'grayscale(100%)',
    },
    '@keyframes pulse': {
        '0%': {
            transform: 'scale(1)',
        },
        '50%': {
            transform: 'scale(1.1)',
        },
        '100%': {
            transform: 'scale(1)',
        },
    },
    previewHint: {
        fontSize: '0.75rem',
        color: '#6c757d',
        fontStyle: 'italic',
        marginTop: theme.spacing(1),
    },
}))

/**
 * Componente que muestra contenido condicional basado en permisos del plan
 * @param {string} featureKey - Nombre de la feature requerida
 * @param {React.ReactNode} children - Contenido a mostrar si tiene permisos
 * @param {boolean} showUpgradePrompt - Si mostrar el prompt de actualización
 * @param {boolean} showPreview - Si mostrar preview con blur y overlay
 * @returns {React.ReactNode} - Contenido o prompt de actualización
 */
export const UpgradePrompt = ({ 
    featureKey, 
    children, 
    showUpgradePrompt = true,
    showPreview = true // Nueva prop para mostrar preview
}) => {
    console.log('featureKey', featureKey)
    const classes = useStyles()
    const history = useHistory()
    const { hasFeature, getFeature, isPlanLoaded, getType, isBinary, isCountable } = usePlanPermissions()
    const [modalOpen, setModalOpen] = useState(false)
    
    // Si el plan no está cargado, mostrar contenido normal temporalmente
    if (!isPlanLoaded) {
        return children
    }
    
    let feature = null
    try {
        feature = getFeature(featureKey)
        console.log('hasFeature', feature)
        console.log('hasFeature log')
    } catch (error) {
        console.error('Error getting feature info:', error)
        feature = null
    }
    
    const handleUpgrade = () => {
        history.push(`/admin/mercado-pago?feature=${featureKey}`)
    }
    const handleOpenModal = () => setModalOpen(true)
    const handleCloseModal = () => setModalOpen(false)
    
    // Verificar si tiene la feature con validación de errores
    let hasAccess = false
    try {
        hasAccess = hasFeature(featureKey)
    } catch (error) {
        console.error('Error checking feature access:', error)
        // En caso de error, mostrar contenido normal por defecto
        return children
    }
    
    // Si tiene la feature, mostrar el contenido normal
    if (hasAccess) {
        return children
    }
    
    // Si no tiene la feature y no se debe mostrar el prompt, mostrar contenido deshabilitado
    if (!showUpgradePrompt) {
        return (
            <div className={classes.disabledContent}>
                {children}
            </div>
        )
    }
    
    // Mostrar contenido con blur y overlay atractivo
    if (showPreview) {
        return (
            <div className={classes.upgradePrompt}>
                <Tooltip title="Esta función está disponible en el plan PRO. Haz clic para desbloquearla." placement="top">
                    <div className={classes.proBadge}>PRO</div>
                </Tooltip>
                <div className={classes.contentWithBlur}>
                    {children}
                </div>
                <div className={classes.overlay}>
                    <div className={classes.featureLocked}>
                        <LockIcon className={classes.lockIcon} />
                        <h4 className={classes.title}>
                            {feature?.title || 'Función Premium'}
                        </h4>
                        <p className={classes.description}>
                            {feature?.description || 'Desbloquea esta función para personalizar tu tienda.'}
                        </p>
                        {getType(featureKey) && (
                            <p className={classes.featureType}>
                                Tipo: {isBinary(featureKey) ? 'Función Binaria' : 'Función con Límites'}
                            </p>
                        )}
                        {feature?.extendedDescription && (
                            <button className={classes.ctaLink} onClick={handleOpenModal} type="button">
                                ¿Por qué activar esta función?
                            </button>
                        )}
                        <Button
                            variant="contained"
                            color="success"
                            onClick={handleUpgrade}
                        >
                            Desbloquear
                        </Button>
                       
                    </div>
                </div>
                {/* Modal informativo */}
                <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        <span className={classes.modalHeadline}>
                            {feature?.extendedDescription?.headline}
                        </span>
                    </DialogTitle>
                    <DialogContent>
                        <div className={classes.modalIntro}>{feature?.extendedDescription?.intro}</div>
                        {feature?.extendedDescription?.benefits && (
                            <ul className={classes.modalBenefits}>
                                {feature.extendedDescription.benefits.map((b, i) => (
                                    <li key={i}><CheckCircle style={{ color: '#43a047', fontSize: 18 }} /> {b}</li>
                                ))}
                            </ul>
                        )}
                        {feature?.extendedDescription?.lossReasons && (
                            <ul className={classes.modalLossReasons}>
                                {feature.extendedDescription.lossReasons.map((r, i) => (
                                    <li key={i}><ErrorOutline style={{ color: '#e53935', fontSize: 18 }} /> {r}</li>
                                ))}
                            </ul>
                        )}
                        {feature?.extendedDescription?.closing && (
                            <div className={classes.modalClosing}>{feature.extendedDescription.closing}</div>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <MuiButton onClick={handleCloseModal} color="default">
                            Quizás luego
                        </MuiButton>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleUpgrade}
                        >
                             Ir a planes
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        )
    }
    
    // Mostrar prompt de actualización tradicional (no preview)
    return null
}

UpgradePrompt.propTypes = {
    featureKey: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    showUpgradePrompt: PropTypes.bool,
    showPreview: PropTypes.bool,
}

export default UpgradePrompt 