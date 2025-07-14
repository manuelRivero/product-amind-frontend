// src/pages/admin/MercadoPagoConnect.jsx

import React, { useEffect } from 'react'
import {
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogTitle,
    IconButton,
} from '@material-ui/core'
import Button from 'components/CustomButtons/Button'

import { makeStyles } from '@material-ui/core/styles'
import { useDispatch, useSelector } from 'react-redux'

import Success from 'assets/img/success-icon.png'
import client from '../../api/client'
import TextInput from '../../components/TextInput/Index'
import LoadinScreen from '../../components/LoadingScreen'
import { getPlans } from '../../api/plans'
import { formatNumber } from '../../helpers/product'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import moment from 'moment'
import { getConfigRequest, cancelSubscriptionRequest, pauseSubscriptionRequest } from '../../store/config'
import { SUBSCRIPTION_MESSAGES, ACTION_TYPES, PLAN_CHANGE_MESSAGES } from '../const'

const useStyles = makeStyles((theme) => ({
    card: {
        maxWidth: 500,
        margin: 'auto',
        marginTop: theme.spacing(8),
        textAlign: 'center',
        padding: theme.spacing(3),
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
}))

const Activation = () => {
    const { configDetail, loadingCancelSubscription, loadingPauseSubscription } = useSelector((state) => state.config)
    const dispatch = useDispatch()
    
    // Corregir las validaciones para que coincidan con la estructura real
    const subscriptionDetail = configDetail?.subscriptionDetail
    const isActivate = subscriptionDetail?.hasActiveSubscription ?? false
    const paymentStatus = subscriptionDetail?.subscription?.paymentStatus
    const subscription = subscriptionDetail?.subscription
    
    // Validaciones según el estado real del pago
    const isPaymentAuthorized = paymentStatus === 'authorized' && subscription
    const isPaymentApproved = paymentStatus === 'approved' && subscription
    const isPaymentPending = paymentStatus === 'pending' && subscription
    const isPaymentPaused = paymentStatus === 'paused' && subscription
    const isPaymentCancelled = paymentStatus === 'cancelled' && subscription
    
    // La suscripción está realmente activa solo si está aprobada o si hasActiveSubscription es true
    const isSubscriptionActive = isActivate || isPaymentApproved
    
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
    const [viewMode, setViewMode] = React.useState(
        !isSubscriptionActive && !isPaymentAuthorized && !isPaymentPending ? 'plan-selection' : 'subscription-details'
    )
    const [showConfirmModal, setShowConfirmModal] = React.useState(false)
    const [confirmAction, setConfirmAction] = React.useState(null)
    const classes = useStyles()

    const handleConnect = async (card_token) => {
        console.log('send')
        try {
            const response = await client.post(
                `api/mercado-pago/subscribe-user`,
                {
                    card_token,
                    preapproval_plan_id: selectedPlan._id,
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
            await dispatch(cancelSubscriptionRequest())
            setError(null)
            setShowConfirmModal(false)
            setConfirmAction(null)
        } catch (error) {
            setError('Error al cancelar la suscripción')
        }
    }

    const handlePauseSubscription = async () => {
        try {
            await dispatch(pauseSubscriptionRequest())
            setError(null)
            setShowConfirmModal(false)
            setConfirmAction(null)
        } catch (error) {
            setError('Error al pausar la suscripción')
        }
    }

    const handleChangePlan = async () => {
        try {
            console.log('Ejecutando handleChangePlan');
            // Aquí iría la lógica para cambiar el plan
            // Por ahora solo cerramos el modal y actualizamos el estado
            console.log('Cambiando a plan:', selectedPlan)
            
            // TODO: Implementar la llamada a la API para cambiar el plan
            // await dispatch(changePlanRequest({ planId: selectedPlan._id }))
            
            setShowConfirmModal(false)
            setConfirmAction(null)
            setSelectedPlan(null)
            setViewMode('subscription-details')
            
            // Actualizar la configuración para reflejar el cambio
            dispatch(getConfigRequest())
            
        } catch (error) {
            console.error('Error en handleChangePlan:', error);
            setError('Error al cambiar el plan')
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
            handleChangePlan()
        } else if (confirmAction === ACTION_TYPES.CHANGE_PLAN_INITIAL) {
            // Cerrar el modal y mostrar la selección de planes
            setShowConfirmModal(false)
            setConfirmAction(null)
            setViewMode('plan-selection')
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
        const script = document.createElement('script')
        script.src = 'https://sdk.mercadopago.com/js/v2'
        script.async = true
        script.onload = () => {
            const mpInstance = new window.MercadoPago(
                'APP_USR-4cfc2933-f53e-45a8-a2c6-f75b7e6bc0ef',
                {
                    locale: 'es-AR',
                }
            )
            setMp(mpInstance)
        }
        document.body.appendChild(script)
    }, [])

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
        if (selectedPlan) {
            setCardNumber('')
            setCardExp('')
            setCardCvv('')
            setCardName('')
            setCardDni('')
            setError(null)
        }
    }, [selectedPlan])

    // Debug useEffect para monitorear cambios en el modal
    useEffect(() => {
        console.log('showConfirmModal cambió a:', showConfirmModal);
        console.log('confirmAction cambió a:', confirmAction);
    }, [showConfirmModal, confirmAction])

    if (loadingPlans) {
        return <LoadinScreen />
    }
    const renderContent = () => {
        switch (currentViewMode) {
            case 'payment-pending':
                return (
                    <>
                        <h2 className={classes.title}>
                            Tu pago está siendo procesado
                        </h2>
                        <p>
                            Estamos verificando tu pago. Este proceso puede tomar un tiempo. 
                            Una vez confirmado, tu tienda se activará automáticamente.
                        </p>
                        <p className={classes.description}>
                            Si tienes alguna duda o tu tienda no se activa en un plazo de 24 horas, contacta a soporte.
                        </p>
                    </>
                );

            case 'payment-paused':
                return (
                    <>
                        <h2 className={classes.title}>
                            Tu subscripción está pausada temporalmente
                        </h2>
                        <p>
                            Por favor contacta a soporte para reactivar tu subscripción y continuar operando tu tienda.
                        </p>
                    </>
                );

            case 'payment-cancelled':
                return (
                    <>
                        <h2 className={classes.title}>
                            Tu subscripción fue cancelada
                        </h2>
                        <p>
                            Por favor contacta a soporte para reactivar tu subscripción y continuar operando tu tienda.
                        </p>
                    </>
                );

            case 'subscription-details':
                return (
                    <>
                        <h2 className={classes.title}>
                            Tu subscripción está activa, puedes operar tu tienda con
                            normalidad.
                        </h2>
                        <h4 className={classes.subtitle}>detalles de tu subscripción:</h4>
                        <ul className={classes.subscriptionDetailsList}>
                            <li className={classes.subscriptionDetailItem}>
                                <div className={classes.subscriptionDetailBullet}></div>
                                <span className={classes.subscriptionDetailLabel}>Plan:</span>
                                <span className={classes.subscriptionDetailValue}>
                                    {subscription?.plan?.name}
                                </span>
                            </li>
                            <li className={classes.subscriptionDetailItem}>
                                <div className={classes.subscriptionDetailBullet}></div>
                                <span className={classes.subscriptionDetailLabel}>Fecha de activación:</span>
                                <span className={classes.subscriptionDetailValue}>
                                    {moment(subscription?.startDate).format('DD/MM/YYYY')}
                                </span>
                            </li>
                            <li className={classes.subscriptionDetailItem}>
                                <div className={classes.subscriptionDetailBullet}></div>
                                <span className={classes.subscriptionDetailLabel}>Fecha del próximo cobro:</span>
                                <span className={classes.subscriptionDetailValue}>
                                    {moment(subscription?.nextPaymentDate).format('DD/MM/YYYY')}
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
                                onClick={() => handleConfirmAction(ACTION_TYPES.CHANGE_PLAN_INITIAL)}
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
                    </>
                );

            case 'plan-selection':
                return (
                    <>
                        <IconButton
                            className={classes.backButton}
                            onClick={() => setViewMode('subscription-details')}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <h5 className={classes.subtitle}>
                            Selecciona tu plan
                        </h5>
                        {plans
                            .filter((plan) =>
                                (isSubscriptionActive || isPaymentAuthorized)
                                    ? plan._id !==
                                      subscription?.plan?._id
                                    : true
                            )
                            .map((plan) => (
                                <Card className={classes.card} key={plan._id}>
                                    <CardContent>
                                        <div className={classes.planCard}>
                                            <h3 className={classes.planTitle}>
                                                {plan.name}
                                            </h3>
                                            <h4 className={classes.planPrice}>
                                                ${formatNumber(plan.price.toFixed(1))}
                                            </h4>
                                        </div>
                                        
                                        <Button
                                            type="button"
                                            variant="contained"
                                            color="primary"
                                            disabled={false}
                                            loading={false}
                                            className={`${classes.button} ${classes.planButton}`}
                                            onClick={() => {
                                                // Determinar el tipo de cambio de plan
                                                const currentPlan = subscription?.plan;
                                                let changeType = 'SAME_PLAN';
                                                
                                                console.log('Plan actual:', currentPlan);
                                                console.log('Plan seleccionado:', plan);
                                                console.log('Estado actual del modal:', showConfirmModal);
                                                
                                                if (currentPlan) {
                                                    if (plan.price > currentPlan.price) {
                                                        changeType = 'UPGRADE';
                                                    } else if (plan.price < currentPlan.price) {
                                                        changeType = 'DOWNGRADE';
                                                    }
                                                }
                                                
                                                console.log('Tipo de cambio:', changeType);
                                                
                                                // Mostrar alerta si es downgrade o upgrade
                                                if (changeType !== 'SAME_PLAN') {
                                                    console.log('Mostrando modal de confirmación');
                                                    console.log('Antes de setConfirmAction:', confirmAction);
                                                    setConfirmAction(ACTION_TYPES.CHANGE_PLAN);
                                                    console.log('Después de setConfirmAction:', ACTION_TYPES.CHANGE_PLAN);
                                                    setSelectedPlan(plan);
                                                    console.log('Antes de setShowConfirmModal:', showConfirmModal);
                                                    setShowConfirmModal(true);
                                                    console.log('Después de setShowConfirmModal: true');
                                                } else {
                                                    console.log('Mismo plan, no mostrar modal');
                                                    setSelectedPlan(plan);
                                                }
                                            }}
                                        >
                                            Seleccionar {plan.name}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
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
                                Continuar con mi plan actual
                            </Button>
                        </div>
                    </>
                );

            case 'payment-authorized':
                return (
                    <>
                        <h2 className={classes.title}>
                            Tu pago está autorizado
                        </h2>
                        <p>
                            Tu tarjeta fue autorizada exitosamente. Estamos procesando el pago para activar tu tienda.
                        </p>
                        <p>
                            Este proceso puede tomar unos minutos. Una vez completado, tu tienda estará lista para operar.
                        </p>
                        <h4 className={classes.subtitle}>detalles de tu subscripción:</h4>
                        <ul className={classes.subscriptionDetailsList}>
                            <li className={classes.subscriptionDetailItem}>
                                <div className={classes.subscriptionDetailBullet}></div>
                                <span className={classes.subscriptionDetailLabel}>Plan:</span>
                                <span className={classes.subscriptionDetailValue}>
                                    {subscription?.plan?.name}
                                </span>
                            </li>
                            <li className={classes.subscriptionDetailItem}>
                                <div className={classes.subscriptionDetailBullet}></div>
                                <span className={classes.subscriptionDetailLabel}>Fecha de autorización:</span>
                                <span className={classes.subscriptionDetailValue}>
                                    {moment(subscription?.startDate).format('DD/MM/YYYY')}
                                </span>
                            </li>
                        </ul>
                    </>
                );

            case 'plan-details':
                return (
                    <>
                        <IconButton
                            onClick={() => setSelectedPlan(null)}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Card className={classes.card}>
                            <CardContent>
                                {!isSubscriptionActive && !isPaymentAuthorized && (
                                    <>
                                        <h5 className={classes.subtitle}>
                                            Activa tu tienda
                                        </h5>

                                        <p className={classes.formField}>
                                            Para comenzar a operar tu tienda, selecciona un plan y completa el pago con tu tarjeta.
                                        </p>
                                        <div className={classes.formField}>
                                            <TextInput
                                                error={false}
                                                errorMessage={null}
                                                icon={null}
                                                label={'Numero de Tarjeta'}
                                                placeholder={
                                                    'Ingrese el numero de tarjeta'
                                                }
                                                value={cardNumber}
                                                onChange={({ target }) => {
                                                    setCardNumber(target.value)
                                                }}
                                            />
                                        </div>
                                        <div className={classes.formField}>
                                            <TextInput
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
                                        </div>
                                        <div className={classes.formField}>
                                            <TextInput
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
                                        </div>
                                        <div className={classes.formField}>
                                            <TextInput
                                                error={false}
                                                errorMessage={null}
                                                icon={null}
                                                label={'Titular de la Tarjeta'}
                                                placeholder={
                                                    'Ingrese el nombre del titular'
                                                }
                                                value={cardName}
                                                onChange={({ target }) => {
                                                    setCardName(target.value)
                                                }}
                                            />
                                        </div>
                                        <div className={classes.formField}>
                                            <TextInput
                                                error={false}
                                                errorMessage={null}
                                                icon={null}
                                                label={
                                                    'DNI del titular de la Tarjeta'
                                                }
                                                placeholder={
                                                    'Ingrese el DNI del titular'
                                                }
                                                value={cardDni}
                                                onChange={({ target }) => {
                                                    setCardDni(target.value)
                                                }}
                                            />
                                        </div>
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
                                            Activar Tienda
                                        </Button>
                                    </>
                                )}

                                {(isSubscriptionActive || isPaymentAuthorized) && (
                                    <>
                                        <img
                                            src={Success}
                                            alt="Success"
                                            className={classes.successImage}
                                        />
                                        {isSubscriptionActive ? (
                                            <>
                                                <h6>¡Subscripción al día!</h6>
                                                <p>
                                                    Puedes operar tu tienda con normalidad.
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <h6>¡Pago autorizado exitosamente!</h6>
                                                <p>
                                                    Tu tarjeta fue autorizada. Estamos procesando el pago para activar tu tienda.
                                                </p>
                                            </>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </>
                );

            default:
                return null;
        }
    };

    // Determinar el modo de vista basado en el estado
    const getCurrentViewMode = () => {
        if (isPaymentPending) return 'payment-pending';
        if (isPaymentPaused) return 'payment-paused';
        if (isPaymentCancelled) return 'payment-cancelled';
        if (isPaymentAuthorized && !isSubscriptionActive) return 'payment-authorized';
        if (selectedPlan) return 'plan-details';
        if (viewMode === 'plan-selection') return 'plan-selection';
        if (isSubscriptionActive) return 'subscription-details';
        return 'subscription-details';
    };

    const currentViewMode = getCurrentViewMode();

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

            <Dialog open={showConfirmModal} onClose={() => setShowConfirmModal(false)} maxWidth="sm" fullWidth>
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
                            const currentPlan = subscription?.plan;
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
                        : 'Confirmar acción'
                    }
                </DialogTitle>
                <div className={classes.modalContent}>
                    {confirmAction === ACTION_TYPES.CHANGE_PLAN_INITIAL ? (
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
                    ) : confirmAction === ACTION_TYPES.CHANGE_PLAN ? (
                        (() => {
                            const currentPlan = subscription?.plan;
                            const selectedPlanData = selectedPlan;
                            
                                                            if (currentPlan && selectedPlanData) {
                                    if (selectedPlanData.price > currentPlan.price) {
                                        return (
                                            <>
                                                <p className={classes.modalDescription}>
                                                    {PLAN_CHANGE_MESSAGES.UPGRADE.description}
                                                </p>
                                                <ul className={classes.modalList}>
                                                    {PLAN_CHANGE_MESSAGES.UPGRADE.benefits.map((benefit, index) => (
                                                        <li key={index} className={classes.modalListItem}>
                                                            {benefit}
                                                        </li>
                                                    ))}
                                                </ul>
                                                <p className={`${classes.modalWarning} ${classes.modalWarningSuccess}`}>
                                                    {PLAN_CHANGE_MESSAGES.UPGRADE.warning}
                                                </p>
                                            </>
                                        );
                                    } else if (selectedPlanData.price < currentPlan.price) {
                                        return (
                                            <>
                                                <p className={classes.modalDescription}>
                                                    {PLAN_CHANGE_MESSAGES.DOWNGRADE.description}
                                                </p>
                                                <ul className={classes.modalList}>
                                                    {PLAN_CHANGE_MESSAGES.DOWNGRADE.consequences.map((consequence, index) => (
                                                        <li key={index} className={classes.modalListItem}>
                                                            {consequence}
                                                        </li>
                                                    ))}
                                                </ul>
                                                <p className={`${classes.modalWarning} ${classes.modalWarningWarning}`}>
                                                    {PLAN_CHANGE_MESSAGES.DOWNGRADE.warning}
                                                </p>
                                            </>
                                        );
                                    } else {
                                        return (
                                            <p className={classes.modalDescription}>
                                                {PLAN_CHANGE_MESSAGES.SAME_PLAN.message}
                                            </p>
                                        );
                                    }
                                }
                            return <p>Cambiando plan...</p>;
                        })()
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
                    <Button onClick={() => setShowConfirmModal(false)} color="transparent">
                        {confirmAction === ACTION_TYPES.CANCEL 
                            ? SUBSCRIPTION_MESSAGES.CANCEL.cancelText 
                            : confirmAction === ACTION_TYPES.PAUSE
                            ? SUBSCRIPTION_MESSAGES.PAUSE.cancelText
                            : confirmAction === ACTION_TYPES.CHANGE_PLAN_INITIAL
                            ? PLAN_CHANGE_MESSAGES.INITIAL.cancelText
                            : confirmAction === ACTION_TYPES.CHANGE_PLAN
                            ? (() => {
                                const currentPlan = subscription?.plan;
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
                            : 'Cancelar'
                        }
                    </Button>
                    <Button 
                        onClick={executeAction} 
                        color={confirmAction === ACTION_TYPES.CANCEL ? 'danger' : 'primary'}
                        disabled={loadingCancelSubscription || loadingPauseSubscription}
                    >
                        {confirmAction === ACTION_TYPES.CANCEL 
                            ? SUBSCRIPTION_MESSAGES.CANCEL.confirmText 
                            : confirmAction === ACTION_TYPES.PAUSE
                            ? SUBSCRIPTION_MESSAGES.PAUSE.confirmText
                            : confirmAction === ACTION_TYPES.CHANGE_PLAN_INITIAL
                            ? PLAN_CHANGE_MESSAGES.INITIAL.confirmText
                            : confirmAction === ACTION_TYPES.CHANGE_PLAN
                            ? (() => {
                                const currentPlan = subscription?.plan;
                                const selectedPlanData = selectedPlan;
                                
                                if (currentPlan && selectedPlanData) {
                                    if (selectedPlanData.price > currentPlan.price) {
                                        return PLAN_CHANGE_MESSAGES.UPGRADE.confirmText;
                                    } else if (selectedPlanData.price < currentPlan.price) {
                                        return PLAN_CHANGE_MESSAGES.DOWNGRADE.confirmText;
                                    } else {
                                        return PLAN_CHANGE_MESSAGES.SAME_PLAN.confirmText;
                                    }
                                }
                                return 'Confirmar';
                            })()
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
        </>
    )
}

export default Activation
