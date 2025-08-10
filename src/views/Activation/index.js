// src/pages/admin/MercadoPagoConnect.jsx

import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
    Dialog,
    DialogActions,
    DialogTitle,
    IconButton,
} from '@material-ui/core'
import Button from 'components/CustomButtons/Button'
import Card from 'components/Card/Card.js'
import CardHeader from 'components/Card/CardHeader.js'
import CardBody from 'components/Card/CardBody.js'
import GridContainer from 'components/Grid/GridContainer.js'
import GridItem from 'components/Grid/GridItem.js'

import { makeStyles } from '@material-ui/core/styles'
import { useDispatch, useSelector } from 'react-redux'

import client from '../../api/client'
import TextInput from '../../components/TextInput/Index'
import LoadinScreen from '../../components/LoadingScreen'
import { getPlans } from '../../api/plans'
import { formatNumber } from '../../helpers/product'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import ScheduleIcon from '@material-ui/icons/Schedule'
import PauseCircleFilledIcon from '@material-ui/icons/PauseCircleFilled'
import CancelIcon from '@material-ui/icons/Cancel'
import moment from 'moment'
import { getConfigRequest, cancelSubscriptionRequest, pauseSubscriptionRequest, resumeSubscriptionRequest } from '../../store/config'
import { SUBSCRIPTION_MESSAGES, ACTION_TYPES, PLAN_CHANGE_MESSAGES, UNAVAILABLE_FEATURE_FALLBACK } from '../const'
import FeatureAlert from 'components/FeatureAlert'
import {
    PlanFeaturesList,
    PLAN_DISPLAY_TEXTS,
    formatBillingCycle
} from '../helpers'
import PlanComparisonModal from '../../components/PlanComparisonModal'
import ProductSelectionModal from '../../components/ProductSelectionModal'
import CategorySelectionModal from '../../components/CategorySelectionModal'

const useStyles = makeStyles((theme) => ({
    input: {
        marginBottom: theme.spacing(2),
    },
    card: {
        maxWidth: 1000,
        margin: 'auto',
        marginTop: theme.spacing(8),
    },
    success: {
        color: theme.palette.success.main,
        marginBottom: theme.spacing(2),
    },
    error: {
        color: theme.palette.error.main,
        marginBottom: theme.spacing(2),
    },
    button: {
        marginTop: theme.spacing(4),
    },
    backButton: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        cursor: 'pointer',
    },
    // Títulos y textos
    title: {
        fontWeight: 'bold',
    },
    subtitle: {
        fontWeight: 'bold',
        marginBottom: theme.spacing(1),
    },
    description: {
        color: '#666',
        fontSize: '14px',
        marginTop: theme.spacing(1),
    },
    // Contenedores
    buttonContainer: {
        marginBottom: theme.spacing(2.5),
        display: 'flex',
        gap: theme.spacing(1.25),
        flexWrap: 'wrap',
    },
    planCard: {
        textAlign: 'center',
        marginBottom: theme.spacing(2.5),
    },
    planTitle: {
        margin: '0 0 10px 0',
        color: '#1976d2',
    },
    planPrice: {
        margin: '10px 0',
        color: '#2e7d32',
    },
    planButton: {
        width: '100%',
    },
    continueButtonContainer: {
        marginTop: theme.spacing(2.5),
        display: 'flex',
        gap: theme.spacing(1.25),
        justifyContent: 'center',
    },
    // Formularios
    formField: {
        marginBottom: theme.spacing(2.5),
    },
    // Modal
    modalContent: {
        padding: '0 24px 24px 24px',
    },
    modalDescription: {
        marginBottom: theme.spacing(2),
        fontWeight: 'bold',
    },
    modalList: {
        marginBottom: theme.spacing(2),
        paddingLeft: theme.spacing(2.5),
    },
    modalListItem: {
        marginBottom: theme.spacing(1),
    },
    modalWarning: {
        marginBottom: theme.spacing(2),
        padding: theme.spacing(1.5),
        borderRadius: theme.spacing(0.5),
        fontSize: '14px',
    },
    modalWarningSuccess: {
        backgroundColor: '#e8f5e8',
        border: '1px solid #4caf50',
    },
    modalWarningWarning: {
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
    },
    // Imágenes
    successImage: {
        width: 100,
    },
    // Lista de detalles de suscripción
    subscriptionDetailsList: {
        listStyle: 'none',
        padding: 0,
        margin: `${theme.spacing(2)} 0`,
    },
    subscriptionDetailItem: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: theme.spacing(1),
        fontSize: '16px',
    },
    subscriptionDetailBullet: {
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: '#000',
        marginRight: theme.spacing(1),
        flexShrink: 0,
    },
    subscriptionDetailLabel: {
        color: '#666',
        marginRight: theme.spacing(1),
    },
    subscriptionDetailValue: {
        fontWeight: 'bold',
        color: '#333',
    },
    // Estilos para el Card personalizado
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
        color: '#fff',
        margin: '0',
        fontSize: '14px',
        marginTop: '0',
        marginBottom: '0',
    },
    subscriptionActiveBanner: {
        color: '#388e3c',
        display: 'flex',
        alignItems: 'center',
        fontWeight: 'bold',
        fontSize: '1.5rem',
        marginTop: `calc(${theme.spacing(3)}px + 1rem)`,
        marginBottom: theme.spacing(1),
        justifyContent: 'flex-start',
        padding: 0,
    },
    subscriptionPendingBanner: {
        color: theme.palette.info.main,
        display: 'flex',
        alignItems: 'center',
        fontWeight: 'bold',
        fontSize: '1.5rem',
        marginTop: `calc(${theme.spacing(3)}px + 1rem)`,
        marginBottom: theme.spacing(1),
        justifyContent: 'flex-start',
        padding: 0,
    },
    subscriptionPausedBanner: {
        color: theme.palette.warning.main,
        display: 'flex',
        alignItems: 'center',
        fontWeight: 'bold',
        fontSize: '1.5rem',
        marginTop: `calc(${theme.spacing(3)}px + 1rem)`,
        marginBottom: theme.spacing(1),
        justifyContent: 'flex-start',
        padding: 0,
    },
    subscriptionCancelledBanner: {
        color: theme.palette.error.main,
        display: 'flex',
        alignItems: 'center',
        fontWeight: 'bold',
        fontSize: '1.5rem',
        marginTop: `calc(${theme.spacing(3)}px + 1rem)`,
        marginBottom: theme.spacing(1),
        justifyContent: 'flex-start',
        padding: 0,
    },
    planCardHeaderGray: {
        background: '#f5f5f5',
        padding: theme.spacing(2, 2, 2, 2),
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        borderBottom: '1px solid #e0e0e0',
    },
    planTitleDark: {
        color: '#222',
        fontWeight: 'bold',
        margin: 0,
    },
    planPriceDark: {
        color: '#444',
        margin: 0,
    },
    featureAlert: {
        margin: theme.spacing(2, 0),
        fontSize: '1rem',
        borderLeft: '6px solid #20b6c9',
        background: '#e3f2fd',
        color: theme.palette.primary.main,
        boxShadow: '0 2px 8px rgba(33,150,243,0.10)',
    },
    planGlow: {
        boxShadow: '0 0 0 4px #fff, 0 0 16px 4px #20b6c9',
        animation: '$glowAnim 1.5s infinite alternate',
    },
    '@keyframes glowAnim': {
        '0%': { boxShadow: '0 0 0 4px #fff, 0 0 8px 2px #20b6c9' },
        '100%': { boxShadow: '0 0 0 4px #fff, 0 0 24px 8px #20b6c9' },
    },
    planPriceBig: {
        fontSize: '2.1rem',
        fontWeight: 700,
        color: '#2e7d32',
        margin: 0,
        lineHeight: 1.1,
        display: 'inline-block',
    },
    planBillingCycle: {
        fontSize: '1rem',
        color: '#666',
        marginLeft: 8,
        fontWeight: 400,
        display: 'inline-block',
        verticalAlign: 'bottom',
    },
    planDescription: {
        fontSize: '1rem',
        color: '#444',
        margin: '4px 0 0 0',
        fontWeight: 400,
    },
}))

const Activation = () => {
    const { configDetail, loadingCancelSubscription, loadingPauseSubscription } = useSelector((state) => state.config)
    const dispatch = useDispatch()

    // Nueva lógica de validación de estados de suscripción
    const mpSubscriptionId = configDetail?.mpSubscriptionId
    const paymentStatus = configDetail?.paymentStatus
    const preapprovalStatus = configDetail?.preapprovalStatus
    // Tomar el último status de userActionHistory (ordenado por fecha ascendente)
    const lastStatusObj = Array.isArray(configDetail?.userActionHistory) && configDetail.userActionHistory.length > 0
        ? configDetail.userActionHistory[configDetail.userActionHistory.length - 1]
        : null;
    const lastStatus = lastStatusObj?.action;
    const lastPauseDate = lastStatusObj && lastStatusObj.status === 'paused' ? lastStatusObj.date : null;
    const lastCancelDate = lastStatusObj && lastStatusObj.status === 'cancelled' ? lastStatusObj.date : null;

    // Flags de estado
    const isPaymentApproved = (preapprovalStatus === 'authorized' && paymentStatus === 'approved');
    const isPaymentPending = (preapprovalStatus === 'authorized' && paymentStatus === 'pending');
    const isPaymentPaused = (preapprovalStatus === 'paused' || paymentStatus === 'paused' || lastStatus === 'paused');
    const isPaymentCancelled = (preapprovalStatus === 'cancelled' || paymentStatus === 'cancelled' || lastStatus === 'cancelled');
    const isSubscriptionActive = (isPaymentApproved || isPaymentPaused || isPaymentPending) && !isPaymentCancelled;

    // Función para determinar el modo de vista
    const getViewMode = () => {
        if (isPaymentCancelled) return 'payment-cancelled';
        if (isPaymentPaused) return 'payment-paused';
        if (isPaymentPending) return 'payment-pending';
        if (isPaymentApproved && !isSubscriptionActive) return 'payment-authorized';
        if (isSubscriptionActive) return 'subscription-details';
        return 'plan-selection';
    };

    const [viewMode, setViewMode] = React.useState(getViewMode());

    // Actualizar viewMode cuando cambian los flags
    React.useEffect(() => {
        setViewMode(getViewMode());
    }, [isPaymentApproved, isPaymentPending, isPaymentPaused, isPaymentCancelled, isSubscriptionActive]);

    const [mp, setMp] = React.useState(null)
    const [cardNumber, setCardNumber] = React.useState('')
    const [cardExp, setCardExp] = React.useState('')
    const [cardCvv, setCardCvv] = React.useState('')
    const [cardName, setCardName] = React.useState('')
    const [cardDni, setCardDni] = React.useState('')
    const [loading, setLoading] = React.useState(false)
    const [loadingPlans, setLoadingPlans] = React.useState(false)
    const [plans, setPlans] = React.useState([])
    const [error, setError] = React.useState(null)
    const [openModal, setOpenModal] = React.useState(false)
    const [selectedPlan, setSelectedPlan] = React.useState(null)
    const [showConfirmModal, setShowConfirmModal] = React.useState(false)
    const [confirmAction, setConfirmAction] = React.useState(null)
    const [showComparisonModal, setShowComparisonModal] = React.useState(false)
    const [showProductSelectionModal, setShowProductSelectionModal] = React.useState(false)
    const [showCategorySelectionModal, setShowCategorySelectionModal] = React.useState(false)
    const classes = useStyles()

    const location = useLocation()
    const [featureParam, setFeatureParam] = useState(null)
    const [highlightPlans, setHighlightPlans] = useState([])
    const [featureInfo, setFeatureInfo] = useState(null)
    const [selectedProductForPlanChange, setSelectedProductForPlanChange] = useState(null)
    const [selectedCategoryForPlanChange, setSelectedCategoryForPlanChange] = useState(null)
    const [showCardForm, setShowCardForm] = useState(false)
    useEffect(() => {
        const script = document.createElement('script')
        script.src = 'https://sdk.mercadopago.com/js/v2'
        script.async = true
        script.onload = () => {
            const mpInstance = new window.MercadoPago(
                'APP_USR-4cfc2933-f53e-45a8-a2c6-f75b7e6bc0ef',
                { locale: 'es-AR' }
            )
            setMp(mpInstance)
        }
        document.body.appendChild(script)
    }, [])

    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const feature = params.get('feature')
        if (feature) {
            setFeatureParam(feature)
            setViewMode('plan-selection')
        }
    }, [location.search])

    const handleConnect = async (card_token) => {
        console.log('send')
        try {
            const response = await client.post(
                `api/mercado-pago/subscribe-user`,
                {
                    card_token,
                    preapproval_plan_id: selectedPlan._id,
                    planData: selectedProductForPlanChange && selectedCategoryForPlanChange ? {
                        product_ids: selectedProductForPlanChange?.productsToRemove.map(p => p._id),
                        category_ids: selectedCategoryForPlanChange?.categoriesToRemove.map(c => c._id)
                    } : null
                }
            )
            console.log('authUrl', response.data)
            setOpenModal(true)
            dispatch(getConfigRequest())
            setSelectedPlan(null)
            setViewMode('subscription-details')
        } catch (error) {
            setError('Error al enviar el token de la tarjeta')
            return
        }
    }


    const handleCancelSubscription = async () => {
        try {
            await dispatch(cancelSubscriptionRequest(mpSubscriptionId))
            setError(null)
            setShowConfirmModal(false)
            setConfirmAction(null)
        } catch (error) {
            setError('Error al cancelar la suscripción')
        }
    }

    const handlePauseSubscription = async () => {
        try {
            await dispatch(pauseSubscriptionRequest(mpSubscriptionId))
            setError(null)
            setShowConfirmModal(false)
            setConfirmAction(null)
            dispatch(getConfigRequest()) // Refrescar la configuración tras pausar
        } catch (error) {
            setError('Error al pausar la suscripción')
        }
    }

    const handleResumeSubscription = async () => {
        try {
            await dispatch(resumeSubscriptionRequest(mpSubscriptionId))
            setError(null)
            setShowConfirmModal(false)
            setConfirmAction(null)
            dispatch(getConfigRequest()) // Refrescar la configuración tras reactivar
        } catch (error) {
            setError('Error al reactivar la suscripción')
        }
    }

    const handleChangePlan = async () => {
        try {
            console.log('Ejecutando handleChangePlan');
            console.log('Cambiando a plan:', selectedPlan)

            // Verificar si el nuevo plan tiene límite de productos menor
            const currentPlan = configDetail?.plan;
            const currentProductLimit = currentPlan?.features?.createProducts?.limits?.maxProducts || Infinity;
            const newProductLimit = selectedPlan?.features?.createProducts?.limits?.maxProducts || Infinity;

            console.log('Límites de productos:');
            console.log('- Plan actual:', currentPlan?.name, 'Límite:', currentProductLimit);
            console.log('- Plan nuevo:', selectedPlan?.name, 'Límite:', newProductLimit);
            console.log('- Estructura del plan nuevo:', selectedPlan);
            console.log('- Features del plan nuevo:', selectedPlan?.features);
            console.log('- ¿Nuevo límite es menor?', newProductLimit !== Infinity && newProductLimit < currentProductLimit);

            // Si el nuevo plan tiene límite menor, obtener productos y mostrar modal de selección
            if (newProductLimit !== Infinity && newProductLimit < currentProductLimit) {
                console.log('Límite menor detectado, obteniendo productos...');
                setShowProductSelectionModal(true);
                setShowConfirmModal(false);
            } else {
                console.log('No hay límite menor, procediendo con cambio directo');
                await proceedWithPlanChange();
            }

            // Si no hay límite menor o no hay productos que excedan el límite, proceder con el cambio

        } catch (error) {
            console.error('Error en handleChangePlan:', error);
            setError('Error al cambiar el plan')
        }
    }

    const proceedWithPlanChange = async () => {
        try {


            setShowConfirmModal(false)
            setShowProductSelectionModal(false)
            setConfirmAction(null)
            setSelectedPlan(null)
            setViewMode('subscription-details')
            setShowCardForm(true)

        } catch (error) {
            console.error('Error en proceedWithPlanChange:', error);
            setError('Error al cambiar el plan')
        }
    }

    const handleProductSelectionConfirm = async (selectionData) => {
        try {
            setSelectedProductForPlanChange(selectionData)
            console.log('Productos seleccionados:', selectionData);
            const currentPlan = configDetail?.plan;
            const currentCategorieLimit = currentPlan?.features?.createCategories?.limits?.maxCategories || Infinity;
            const newCategoriesLimit = selectedPlan?.features?.createCategories?.limits?.maxCategories || Infinity;
            console.log("limit", currentCategorieLimit > newCategoriesLimit)
            if (currentCategorieLimit > newCategoriesLimit) {
                setShowProductSelectionModal(false)
                setShowCategorySelectionModal(true)
            }
            // TODO: Implementar la lógica para eliminar productos no seleccionados
            // await dispatch(removeProductsRequest({ productIds: selectionData.productsToRemove.map(p => p._id) }))

            // Proceder con el cambio de plan
            // await proceedWithPlanChange();

        } catch (error) {
            console.error('Error en handleProductSelectionConfirm:', error);
            setError('Error al procesar la selección de productos')
        }
    }

    const handleCategorySelectionConfirm = async (selectionData) => {
        try {
            setSelectedCategoryForPlanChange(selectionData)
            console.log('Categorías seleccionados:', selectionData);
            setShowCardForm(true)
            setViewMode('payment-form')
            setShowCategorySelectionModal(false)

        } catch (error) {
            console.error('Error en handleProductSelectionConfirm:', error);
            setError('Error al procesar la selección de productos')
        }
    }

    const handleConfirmAction = (action) => {
        setConfirmAction(action)
        setShowConfirmModal(true)
    }

    const executeAction = () => {
        if (confirmAction === ACTION_TYPES.CANCEL) {
            handleCancelSubscription()
        } else if (confirmAction === ACTION_TYPES.PAUSE) {
            handlePauseSubscription()
        } else if (confirmAction === ACTION_TYPES.CHANGE_PLAN) {
            console.log('Cambiando de plan')
            setViewMode('plan-selection')
            setShowConfirmModal(false)
        } else if (confirmAction === ACTION_TYPES.CHANGE_PLAN_INITIAL) {
            console.log('Cambiando de plan inicial')

            setShowConfirmModal(false)
            setConfirmAction(null)
            setViewMode('payment-form')
        } else if (confirmAction === ACTION_TYPES.RESUME) {
            handleResumeSubscription()
        }
    }

    const submitCardDetails = async () => {
        if (!mp) {
            setError('Mercado Pago SDK no cargó correctamente')
            return
        }
        try {
            setLoading(true)
            setError(null)
            const cardTokenResponse = await mp.createCardToken({
                cardNumber,
                cardholderName: cardName,
                cardExpirationMonth: cardExp.split('/')[0],
                cardExpirationYear: cardExp.split('/')[1],
                securityCode: cardCvv,
                identificationType: 'DNI', // Cambia según el tipo que uses
                identificationNumber: cardDni,
            })
            console.log('Subscription activated:', cardTokenResponse)
            setError('Error al enviar el token de la tarjeta')

            handleConnect(cardTokenResponse.id)
            // Handle success (e.g., show a success message, redirect, etc.)
        } catch (error) {
            console.error('Error activating subscription:', error)
            // Handle error (e.g., show an error message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const getData = async () => {
            try {
                setLoadingPlans(true)
                const response = await getPlans()
                console.log('Plans fetched:', response)
                setPlans(response.data.plans)
            } catch (error) {
                console.error('Error fetching plans:', error)
                setLoadingPlans(false)
            } finally {
                setLoadingPlans(false)
            }
        }
        getData()
    }, [])

    useEffect(() => {
        if (featureParam && plans.length > 0) {
            const plansWithFeature = plans.filter(plan => plan.features?.[featureParam]?.enabled)
            setHighlightPlans(plansWithFeature.map(p => p._id))

            if (plansWithFeature.length > 0) {
                // Tomar info de la feature (title, description)
                const featureData = plansWithFeature[0]?.features?.[featureParam]
                setFeatureInfo(featureData)
            } else {
                // Ningún plan tiene la feature habilitada, usar fallback
                setFeatureInfo(UNAVAILABLE_FEATURE_FALLBACK)
            }
        }
    }, [featureParam, plans])

    useEffect(() => {
        if (selectedPlan) {
            setCardNumber('')
            setCardExp('')
            setCardCvv('')
            setCardName('')
            setCardDni('')
            setError(null)
        }
    }, [selectedPlan])

    if (loadingPlans) {
        return <LoadinScreen />
    }
    const renderContent = () => {
        switch (viewMode) {
            case 'payment-pending':
                return (
                    <Card className={classes.card}>
                        <CardHeader color="info">
                            <h4 className={classes.cardTitleWhite}>
                                Panel de Activación y Gestión de Suscripción
                            </h4>
                            <p className={classes.cardCategoryWhite}>
                                Aquí puedes ver el estado de tu suscripción, consultar los detalles de tu plan actual y gestionar acciones como cambiar, pausar o cancelar tu suscripción.
                            </p>
                        </CardHeader>
                        <CardBody>
                            <div className={classes.subscriptionPendingBanner}>
                                Tu pago está siendo procesado
                                <ScheduleIcon style={{ marginLeft: 12, fontSize: 32 }} />
                            </div>
                            <p className={classes.description} style={{ marginTop: 0 }}>
                                Estamos verificando tu pago. Este proceso puede tomar un tiempo. Una vez confirmado, tu tienda se activará automáticamente.
                            </p>
                            <p className={classes.description} style={{ marginTop: 0 }}>
                                Si tienes alguna duda o tu tienda no se activa en un plazo de 24 horas, contacta a soporte.
                            </p>
                        </CardBody>
                    </Card>
                );

            case 'payment-paused':
                return (
                    <Card className={classes.card}>
                        <CardHeader color="primary">
                            <h4 className={classes.cardTitleWhite}>
                                Panel de Activación y Gestión de Suscripción
                            </h4>
                            <p className={classes.cardCategoryWhite}>
                                Aquí puedes ver el estado de tu suscripción, consultar los detalles de tu plan actual y gestionar acciones como cambiar, pausar o cancelar tu suscripción.
                            </p>
                        </CardHeader>
                        <CardBody>
                            <div className={classes.subscriptionPausedBanner}>
                                Tu subscripción está pausada temporalmente
                                <PauseCircleFilledIcon style={{ marginLeft: 12, fontSize: 32 }} />
                            </div>
                            <p className={classes.description} style={{ marginTop: 0 }}>
                                Por favor contacta a soporte para reactivar tu subscripción y continuar operando tu tienda.
                            </p>
                            <h4 className={classes.subtitle}>Detalles de tu subscripción:</h4>
                            <ul className={classes.subscriptionDetailsList}>
                                <li className={classes.subscriptionDetailItem}>
                                    <div className={classes.subscriptionDetailBullet}></div>
                                    <span className={classes.subscriptionDetailLabel}>Plan:</span>
                                    <span className={classes.subscriptionDetailValue}>
                                        {configDetail?.plan?.name}
                                    </span>
                                </li>
                                <li className={classes.subscriptionDetailItem}>
                                    <div className={classes.subscriptionDetailBullet}></div>
                                    <span className={classes.subscriptionDetailLabel}>Fecha de activación:</span>
                                    <span className={classes.subscriptionDetailValue}>
                                        {moment(configDetail?.startDate).format('DD/MM/YYYY')}
                                    </span>
                                </li>
                                {lastPauseDate && (
                                    <li className={classes.subscriptionDetailItem}>
                                        <div className={classes.subscriptionDetailBullet}></div>
                                        <span className={classes.subscriptionDetailLabel}>Fecha de pausa:</span>
                                        <span className={classes.subscriptionDetailValue}>
                                            {moment(lastPauseDate).format('DD/MM/YYYY')}
                                        </span>
                                    </li>
                                )}
                            </ul>
                            <div className={classes.buttonContainer}>
                                <Button
                                    type="button"
                                    variant="contained"
                                    color="primary"
                                    disabled={!mp || loading}
                                    loading={loading}
                                    className={classes.button}
                                    onClick={() => handleConfirmAction(ACTION_TYPES.CHANGE_PLAN)}
                                >
                                    Cambiar de plan
                                </Button>
                                <Button
                                    type="button"
                                    variant="contained"
                                    color="danger"
                                    disabled={loadingCancelSubscription}
                                    loading={loadingCancelSubscription}
                                    className={classes.button}
                                    onClick={() => handleConfirmAction(ACTION_TYPES.CANCEL)}
                                >
                                    Cancelar suscripción
                                </Button>
                                <Button
                                    type="button"
                                    variant="contained"
                                    color="success"
                                    className={classes.button}
                                    onClick={() => handleConfirmAction(ACTION_TYPES.RESUME)}
                                >
                                    Reactivar suscripción
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                );

            case 'payment-cancelled':
                return (
                    <Card className={classes.card}>
                        <CardHeader color="primary">
                            <h4 className={classes.cardTitleWhite}>
                                Panel de Activación y Gestión de Suscripción
                            </h4>
                            <p className={classes.cardCategoryWhite}>
                                Aquí puedes ver el estado de tu suscripción, consultar los detalles de tu plan actual y gestionar acciones como cambiar, pausar o cancelar tu suscripción.
                            </p>
                        </CardHeader>
                        <CardBody>
                            <div className={classes.subscriptionCancelledBanner}>
                                Tu subscripción fue cancelada
                                <CancelIcon style={{ marginLeft: 12, fontSize: 32 }} />
                            </div>
                            <p className={classes.description} style={{ marginTop: 0 }}>
                                Por favor contacta a soporte para reactivar tu subscripción y continuar operando tu tienda.
                            </p>
                            <h4 className={classes.subtitle}>Detalles de tu subscripción:</h4>
                            <ul className={classes.subscriptionDetailsList}>
                                <li className={classes.subscriptionDetailItem}>
                                    <div className={classes.subscriptionDetailBullet}></div>
                                    <span className={classes.subscriptionDetailLabel}>Plan:</span>
                                    <span className={classes.subscriptionDetailValue}>
                                        {configDetail?.plan?.name}
                                    </span>
                                </li>
                                <li className={classes.subscriptionDetailItem}>
                                    <div className={classes.subscriptionDetailBullet}></div>
                                    <span className={classes.subscriptionDetailLabel}>Fecha de activación:</span>
                                    <span className={classes.subscriptionDetailValue}>
                                        {moment(configDetail?.startDate).format('DD/MM/YYYY')}
                                    </span>
                                </li>
                                {lastCancelDate && (
                                    <li className={classes.subscriptionDetailItem}>
                                        <div className={classes.subscriptionDetailBullet}></div>
                                        <span className={classes.subscriptionDetailLabel}>Fecha de cancelación:</span>
                                        <span className={classes.subscriptionDetailValue}>
                                            {moment(lastCancelDate).format('DD/MM/YYYY')}
                                        </span>
                                    </li>
                                )}
                            </ul>
                        </CardBody>
                    </Card>
                );

            case 'subscription-details':
                return (
                    <Card className={classes.card}>
                        <CardHeader color="primary">
                            <h4 className={classes.cardTitleWhite}>
                                Panel de Activación y Gestión de Suscripción
                            </h4>
                            <p className={classes.cardCategoryWhite}>
                                Aquí puedes ver el estado de tu suscripción, consultar los detalles de tu plan actual y gestionar acciones como cambiar, pausar o cancelar tu suscripción.
                            </p>
                        </CardHeader>
                        <CardBody>
                            <div className={classes.subscriptionActiveBanner}>
                                Tu subscripción está activa
                                <CheckCircleIcon style={{ marginLeft: 12, fontSize: 32 }} />
                            </div>
                            <p className={classes.description} style={{ marginTop: 0 }}>
                                Puedes operar tu tienda con normalidad
                            </p>
                            <h4 className={classes.subtitle}>Detalles de tu subscripción:</h4>
                            <ul className={classes.subscriptionDetailsList}>
                                <li className={classes.subscriptionDetailItem}>
                                    <div className={classes.subscriptionDetailBullet}></div>
                                    <span className={classes.subscriptionDetailLabel}>Plan:</span>
                                    <span className={classes.subscriptionDetailValue}>
                                        {configDetail?.plan?.name}
                                    </span>
                                </li>
                                <li className={classes.subscriptionDetailItem}>
                                    <div className={classes.subscriptionDetailBullet}></div>
                                    <span className={classes.subscriptionDetailLabel}>Fecha de activación:</span>
                                    <span className={classes.subscriptionDetailValue}>
                                        {moment(configDetail?.startDate).format('DD/MM/YYYY')}
                                    </span>
                                </li>
                                <li className={classes.subscriptionDetailItem}>
                                    <div className={classes.subscriptionDetailBullet}></div>
                                    <span className={classes.subscriptionDetailLabel}>Fecha del próximo cobro:</span>
                                    <span className={classes.subscriptionDetailValue}>
                                        {moment(configDetail?.nextPaymentDate).format('DD/MM/YYYY')}
                                    </span>
                                </li>
                            </ul>
                            <div className={classes.buttonContainer}>
                                <Button
                                    type="button"
                                    variant="contained"
                                    color="primary"
                                    disabled={!mp || loading}
                                    loading={loading}
                                    className={classes.button}
                                    onClick={() => handleConfirmAction(ACTION_TYPES.CHANGE_PLAN)}
                                >
                                    Cambiar de plan
                                </Button>
                                <Button
                                    type="button"
                                    variant="contained"
                                    color="warning"
                                    disabled={loadingPauseSubscription}
                                    loading={loadingPauseSubscription}
                                    className={classes.button}
                                    onClick={() => handleConfirmAction(ACTION_TYPES.PAUSE)}
                                >
                                    Pausar suscripción
                                </Button>
                                <Button
                                    type="button"
                                    variant="contained"
                                    color="danger"
                                    disabled={loadingCancelSubscription}
                                    loading={loadingCancelSubscription}
                                    className={classes.button}
                                    onClick={() => handleConfirmAction(ACTION_TYPES.CANCEL)}
                                >
                                    Cancelar suscripción
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                );

            case 'payment-authorized':
                return (
                    <Card className={classes.card}>
                        <CardHeader color="info">
                            <h4 className={classes.cardTitleWhite}>
                                Tu pago está autorizado
                            </h4>
                            <p className={classes.cardCategoryWhite}>
                                Tu tarjeta fue autorizada exitosamente
                            </p>
                        </CardHeader>
                        <CardBody>
                            <p>
                                Estamos procesando el pago para activar tu tienda. Este proceso puede tomar unos minutos. Una vez completado, tu tienda estará lista para operar.
                            </p>
                            <h4 className={classes.subtitle}>Detalles de tu subscripción:</h4>
                            <ul className={classes.subscriptionDetailsList}>
                                <li className={classes.subscriptionDetailItem}>
                                    <div className={classes.subscriptionDetailBullet}></div>
                                    <span className={classes.subscriptionDetailLabel}>Plan:</span>
                                    <span className={classes.subscriptionDetailValue}>
                                        {configDetail?.plan?.name}
                                    </span>
                                </li>
                                <li className={classes.subscriptionDetailItem}>
                                    <div className={classes.subscriptionDetailBullet}></div>
                                    <span className={classes.subscriptionDetailLabel}>Fecha de autorización:</span>
                                    <span className={classes.subscriptionDetailValue}>
                                        {moment(configDetail?.startDate).format('DD/MM/YYYY')}
                                    </span>
                                </li>
                            </ul>
                        </CardBody>
                    </Card>
                );

            case 'payment-form':
                return (
                    <Card className={classes.card}>
                        <CardHeader color="primary">
                            <h4 className={classes.cardTitleWhite}>
                                Activar suscripción
                            </h4>
                            <p className={classes.cardCategoryWhite}>
                                 Completa el pago con tu tarjeta.
                            </p>
                        </CardHeader>
                        <CardBody>
                            {showCardForm && (
                                <>
                                    <TextInput
                                        className={classes.input}
                                        error={false}
                                        errorMessage={null}
                                        icon={null}
                                        label={'Numero de Tarjeta'}
                                        placeholder={'Ingrese el numero de tarjeta'}
                                        value={cardNumber}
                                        onChange={({ target }) => {
                                            setCardNumber(target.value)
                                        }}
                                    />
                                    <TextInput
                                        className={classes.input}
                                        error={false}
                                        errorMessage={null}
                                        icon={null}
                                        label={'Expira'}
                                        placeholder={'MM/AA'}
                                        value={cardExp}
                                        onChange={({ target }) => {
                                            setCardExp(target.value)
                                        }}
                                    />
                                    <TextInput
                                        className={classes.input}
                                        error={false}
                                        errorMessage={null}
                                        icon={null}
                                        label={'CVV'}
                                        placeholder={'Ingrese el CVV'}
                                        value={cardCvv}
                                        onChange={({ target }) => {
                                            setCardCvv(target.value)
                                        }}
                                    />
                                    <TextInput
                                        className={classes.input}
                                        error={false}
                                        errorMessage={null}
                                        icon={null}
                                        label={'Titular de la Tarjeta'}
                                        placeholder={'Ingrese el nombre del titular'}
                                        value={cardName}
                                        onChange={({ target }) => {
                                            setCardName(target.value)
                                        }}
                                    />
                                    <TextInput
                                        className={classes.input}
                                        error={false}
                                        errorMessage={null}
                                        icon={null}
                                        label={'DNI del titular de la Tarjeta'}
                                        placeholder={'Ingrese el DNI del titular'}
                                        value={cardDni}
                                        onChange={({ target }) => {
                                            setCardDni(target.value)
                                        }}
                                    />
                                    {error && (
                                        <p className={classes.error}>
                                            {error}
                                        </p>
                                    )}
                                    <Button
                                        type="button"
                                        variant="contained"
                                        color="primary"
                                        disabled={!mp || loading}
                                        loading={loading}
                                        className={classes.button}
                                        onClick={submitCardDetails}
                                    >
                                        Aceptar
                                    </Button>
                                </>
                            )}
                        </CardBody>
                    </Card>
                );

            case 'plan-selection':
                // Este caso se mantiene como está, sin envolver en Card personalizado
                return (
                    <>
                        <IconButton
                            className={classes.backButton}
                            onClick={() => setViewMode('subscription-details')}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        {featureParam && featureInfo && (
                            <FeatureAlert severity="info" className={classes.featureAlert}>
                                {featureInfo === UNAVAILABLE_FEATURE_FALLBACK ? (
                                    <div>
                                        <strong>{featureInfo.title}</strong>
                                        {featureInfo.paragraphs.map((paragraph, index) => (
                                            <p key={index} dangerouslySetInnerHTML={{ __html: paragraph }} />
                                        ))}
                                        <a href={featureInfo.cta.href} style={{ color: 'inherit', textDecoration: 'underline' }}>
                                            {featureInfo.cta.label}
                                        </a>
                                    </div>
                                ) : (
                                    <div>
                                        {PLAN_DISPLAY_TEXTS.FEATURE_HIGHLIGHT_MESSAGE} <b>{featureInfo.title}</b>.
                                    </div>
                                )}
                            </FeatureAlert>
                        )}
                        <Card className={classes.card}>
                            <CardHeader color="primary">
                                <h4 className={classes.cardTitleWhite}>
                                    {PLAN_DISPLAY_TEXTS.PLAN_SELECTION_TITLE}
                                </h4>
                                <p className={classes.cardCategoryWhite}>
                                    {PLAN_DISPLAY_TEXTS.PLAN_SELECTION_DESCRIPTION}
                                </p>
                            </CardHeader>
                            <CardBody>
                                <GridContainer>
                                    {plans
                                        .filter((plan) =>
                                            (isSubscriptionActive || isPaymentApproved)
                                                ? plan._id !==
                                                configDetail?.plan?._id
                                                : true
                                        )
                                        .map((plan) => (
                                            <GridItem xs={12} sm={6} md={4} key={plan._id}>
                                                <Card className={highlightPlans.includes(plan._id) ? `${classes.card} ${classes.planGlow}` : classes.card}>
                                                    <CardHeader className={classes.planCardHeaderGray}>
                                                        <h4 className={classes.planTitleDark}>
                                                            {plan.name}
                                                        </h4>
                                                        {plan.description && (
                                                            <div className={classes.planDescription}>{plan.description}</div>
                                                        )}
                                                        <div style={{ marginTop: 8, marginBottom: 2 }}>
                                                            <span className={classes.planPriceBig}>
                                                                ${formatNumber(plan.price.toFixed(1))}
                                                            </span>
                                                            {plan.billingCycle && (
                                                                <span className={classes.planBillingCycle}>
                                                                    {formatBillingCycle(plan.billingCycle)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </CardHeader>
                                                    <CardBody>
                                                        <PlanFeaturesList features={plan.features} />
                                                        <Button
                                                            type="button"
                                                            variant="contained"
                                                            color="primary"
                                                            disabled={false}
                                                            loading={false}
                                                            className={`${classes.button} ${classes.planButton}`}
                                                            onClick={() => {
                                                                // Determinar el tipo de cambio de plan
                                                                const currentPlan = configDetail?.plan;
                                                                let changeType = 'SAME_PLAN';
                                                                if (currentPlan) {
                                                                    if (plan.price > currentPlan.price) {
                                                                        changeType = 'UPGRADE';
                                                                    } else if (plan.price < currentPlan.price) {
                                                                        changeType = 'DOWNGRADE';
                                                                    }
                                                                }

                                                                console.log('Tipo de cambio:', changeType);

                                                                // Si es el mismo plan, no hacer nada
                                                                if (changeType === 'SAME_PLAN') {
                                                                    console.log('Mismo plan, no mostrar modal');
                                                                    return;
                                                                }

                                                                // Si es un plan diferente, mostrar modal de comparación
                                                                console.log('Plan diferente, mostrando modal de comparación');
                                                                setSelectedPlan(plan);
                                                                setShowComparisonModal(true);
                                                            }}
                                                        >
                                                            {PLAN_DISPLAY_TEXTS.SELECT_BUTTON_PREFIX} {plan.name}
                                                        </Button>
                                                    </CardBody>
                                                </Card>
                                            </GridItem>
                                        ))}
                                </GridContainer>
                                <div className={classes.continueButtonContainer}>
                                    <Button
                                        type="button"
                                        variant="contained"
                                        color="primary"
                                        disabled={!mp || loading}
                                        loading={loading}
                                        className={classes.button}
                                        onClick={() => setViewMode('subscription-details')}
                                    >
                                        {PLAN_DISPLAY_TEXTS.CONTINUE_BUTTON}
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <>

            {renderContent()}
            <Dialog open={openModal} onClose={() => setOpenModal(false)}>
                <DialogTitle>¡Suscripción exítosa!</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)} color="primary">
                        Aceptar
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={showConfirmModal} onClose={
                loadingCancelSubscription || loadingPauseSubscription ? undefined : () => setShowConfirmModal(false)
            } maxWidth="sm" fullWidth>
                {console.log('Modal abierto:', showConfirmModal, 'Acción:', confirmAction)}
                <DialogTitle>
                    {confirmAction === ACTION_TYPES.CANCEL
                        ? SUBSCRIPTION_MESSAGES.CANCEL.title
                        : confirmAction === ACTION_TYPES.PAUSE
                            ? SUBSCRIPTION_MESSAGES.PAUSE.title
                            : confirmAction === ACTION_TYPES.CHANGE_PLAN_INITIAL
                                ? PLAN_CHANGE_MESSAGES.INITIAL.title
                                : confirmAction === ACTION_TYPES.CHANGE_PLAN
                                    ? (() => {
                                        const currentPlan = configDetail?.plan;
                                        const selectedPlanData = selectedPlan;

                                        if (currentPlan && selectedPlanData) {
                                            if (selectedPlanData.price > currentPlan.price) {
                                                return PLAN_CHANGE_MESSAGES.UPGRADE.title;
                                            } else if (selectedPlanData.price < currentPlan.price) {
                                                return PLAN_CHANGE_MESSAGES.DOWNGRADE.title;
                                            } else {
                                                return PLAN_CHANGE_MESSAGES.SAME_PLAN.title;
                                            }
                                        }
                                        return 'Cambiar plan';
                                    })()
                                    : confirmAction === ACTION_TYPES.RESUME
                                        ? SUBSCRIPTION_MESSAGES.RESUME.title
                                        : 'Confirmar acción'
                    }
                </DialogTitle>
                <div className={classes.modalContent}>
                    {confirmAction === ACTION_TYPES.CHANGE_PLAN ? (
                        <>
                            <p className={classes.modalDescription}>
                                {PLAN_CHANGE_MESSAGES.INITIAL.description}
                            </p>
                            <ul className={classes.modalList}>
                                {PLAN_CHANGE_MESSAGES.INITIAL.benefits.map((benefit, index) => (
                                    <li key={index} className={classes.modalListItem}>
                                        {benefit}
                                    </li>
                                ))}
                            </ul>
                            <p className={`${classes.modalWarning} ${classes.modalWarningSuccess}`}>
                                {PLAN_CHANGE_MESSAGES.INITIAL.warning}
                            </p>
                        </>
                    ) : confirmAction === ACTION_TYPES.RESUME ? (
                        <>
                            <p className={classes.modalDescription}>
                                {SUBSCRIPTION_MESSAGES.RESUME.description}
                            </p>
                            <ul className={classes.modalList}>
                                {SUBSCRIPTION_MESSAGES.RESUME.benefits.map((benefit, index) => (
                                    <li key={index} className={classes.modalListItem}>
                                        {benefit}
                                    </li>
                                ))}
                            </ul>
                            <p className={`${classes.modalWarning} ${classes.modalWarningSuccess}`}>
                                {SUBSCRIPTION_MESSAGES.RESUME.warning}
                            </p>
                        </>
                    ) : (
                        <>
                            <p className={classes.modalDescription}>
                                {confirmAction === ACTION_TYPES.CANCEL
                                    ? SUBSCRIPTION_MESSAGES.CANCEL.description
                                    : SUBSCRIPTION_MESSAGES.PAUSE.description
                                }
                            </p>
                            <ul className={classes.modalList}>
                                {(confirmAction === ACTION_TYPES.CANCEL
                                    ? SUBSCRIPTION_MESSAGES.CANCEL.consequences
                                    : SUBSCRIPTION_MESSAGES.PAUSE.consequences
                                ).map((consequence, index) => (
                                    <li key={index} className={classes.modalListItem}>
                                        {consequence}
                                    </li>
                                ))}
                            </ul>
                            <p className={`${classes.modalWarning} ${classes.modalWarningWarning}`}>
                                {confirmAction === ACTION_TYPES.CANCEL
                                    ? SUBSCRIPTION_MESSAGES.CANCEL.warning
                                    : SUBSCRIPTION_MESSAGES.PAUSE.warning
                                }
                            </p>
                        </>
                    )}
                </div>
                <DialogActions>
                    <Button
                        onClick={() => setShowConfirmModal(false)}
                        color="transparent"
                        disabled={loadingCancelSubscription || loadingPauseSubscription}
                    >
                        {confirmAction === ACTION_TYPES.CANCEL
                            ? SUBSCRIPTION_MESSAGES.CANCEL.cancelText
                            : confirmAction === ACTION_TYPES.PAUSE
                                ? SUBSCRIPTION_MESSAGES.PAUSE.cancelText
                                : confirmAction === ACTION_TYPES.CHANGE_PLAN_INITIAL
                                    ? PLAN_CHANGE_MESSAGES.INITIAL.cancelText
                                    : confirmAction === ACTION_TYPES.CHANGE_PLAN
                                        ? (() => {
                                            const currentPlan = configDetail?.plan;
                                            const selectedPlanData = selectedPlan;

                                            if (currentPlan && selectedPlanData) {
                                                if (selectedPlanData.price > currentPlan.price) {
                                                    return PLAN_CHANGE_MESSAGES.UPGRADE.cancelText;
                                                } else if (selectedPlanData.price < currentPlan.price) {
                                                    return PLAN_CHANGE_MESSAGES.DOWNGRADE.cancelText;
                                                } else {
                                                    return PLAN_CHANGE_MESSAGES.SAME_PLAN.cancelText;
                                                }
                                            }
                                            return 'Cancelar';
                                        })()
                                        : confirmAction === ACTION_TYPES.RESUME
                                            ? SUBSCRIPTION_MESSAGES.RESUME.cancelText
                                            : 'Cancelar'
                        }
                    </Button>
                    <Button
                        onClick={executeAction}
                        color={confirmAction === ACTION_TYPES.CANCEL ? 'danger' : confirmAction === ACTION_TYPES.RESUME ? 'success' : 'primary'}
                        disabled={
                            (confirmAction === ACTION_TYPES.CANCEL && loadingCancelSubscription) ||
                            (confirmAction === ACTION_TYPES.PAUSE && loadingPauseSubscription) ||
                            (confirmAction === ACTION_TYPES.RESUME && loadingPauseSubscription) ||
                            (confirmAction === ACTION_TYPES.CHANGE_PLAN && loadingPauseSubscription) ||
                            (confirmAction === ACTION_TYPES.CHANGE_PLAN_INITIAL && loadingPauseSubscription)
                        }
                        loading={
                            (confirmAction === ACTION_TYPES.CANCEL && loadingCancelSubscription) ||
                            (confirmAction === ACTION_TYPES.PAUSE && loadingPauseSubscription) ||
                            (confirmAction === ACTION_TYPES.RESUME && loadingPauseSubscription) ||
                            (confirmAction === ACTION_TYPES.CHANGE_PLAN && loadingPauseSubscription) ||
                            (confirmAction === ACTION_TYPES.CHANGE_PLAN_INITIAL && loadingPauseSubscription)
                        }
                    >
                        {confirmAction === ACTION_TYPES.CANCEL
                            ? SUBSCRIPTION_MESSAGES.CANCEL.confirmText
                            : confirmAction === ACTION_TYPES.PAUSE
                                ? SUBSCRIPTION_MESSAGES.PAUSE.confirmText
                                : confirmAction === ACTION_TYPES.CHANGE_PLAN_INITIAL
                                    ? PLAN_CHANGE_MESSAGES.INITIAL.confirmText
                                    : confirmAction === ACTION_TYPES.CHANGE_PLAN
                                        ? PLAN_CHANGE_MESSAGES.INITIAL.confirmText
                                        : confirmAction === ACTION_TYPES.RESUME
                                            ? SUBSCRIPTION_MESSAGES.RESUME.confirmText
                                            : 'Confirmar'
                        }
                    </Button>
                </DialogActions>
            </Dialog>

            {error && (
                <Dialog open={!!error} onClose={() => setError(null)}>
                    <DialogTitle>Error</DialogTitle>
                    <DialogActions>
                        <Button onClick={() => setError(null)} color="primary">
                            Aceptar
                        </Button>
                    </DialogActions>
                </Dialog>
            )}

            {/* Modal de comparación de planes */}
            <PlanComparisonModal
                open={showComparisonModal}
                onClose={() => setShowComparisonModal(false)}
                currentPlan={configDetail?.plan}
                newPlan={selectedPlan}
                onConfirm={() => {
                    setShowComparisonModal(false);
                    // Proceder con el flujo normal de cambio de plan
                    handleChangePlan()
                }}
            />

            {configDetail && showProductSelectionModal && <ProductSelectionModal
                open={showProductSelectionModal}
                onClose={() => setShowProductSelectionModal(false)}
                newPlan={selectedPlan}
                onConfirm={handleProductSelectionConfirm}
            />}

            {configDetail && showCategorySelectionModal && <CategorySelectionModal
                open={showCategorySelectionModal}
                onClose={() => showCategorySelectionModal(false)}
                newPlan={selectedPlan}
                onConfirm={handleCategorySelectionConfirm}
            />}
        </>
    )
}

export default Activation
