// src/pages/admin/MercadoPagoConnect.jsx

import React, { useEffect } from 'react'
import {
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogTitle,
    IconButton,
    Typography,
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
    const [changingPlan, setChangingPlan] = React.useState(
        !isSubscriptionActive && !isPaymentAuthorized && !isPaymentPending ? true : false
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
            setChangingPlan(false)
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

    const handleConfirmAction = (action) => {
        setConfirmAction(action)
        setShowConfirmModal(true)
    }

    const executeAction = () => {
        if (confirmAction === 'cancel') {
            handleCancelSubscription()
        } else if (confirmAction === 'pause') {
            handlePauseSubscription()
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

    if (loadingPlans) {
        return <LoadinScreen />
    }
    return (
        <>
            {isPaymentPending && (
                <>
                <h2 style={{ fontWeight: 'bold' }}>
                    Tu pago está siendo procesado
                </h2>
                <p>
                    Estamos verificando tu pago. Este proceso puede tomar un tiempo. 
                    Una vez confirmado, tu tienda se activará automáticamente.
                </p>
                <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>
                    Si tienes alguna duda o tu tienda no se activa en un plazo de 24 horas, contacta a soporte.
                </p>
                </>
            )}
            {isPaymentPaused && (
                <>
                    <h2 style={{ fontWeight: 'bold' }}>
                        Tu subscripción está pausada temporalmente
                    </h2>
                    <p>
                        Por favor contacta a soporte para reactivar tu subscripción y continuar operando tu tienda.
                    </p>
                </>
            )}
            {isPaymentCancelled && (
                <>
                    <h2 style={{ fontWeight: 'bold' }}>
                        Tu subscripción fue cancelada
                    </h2>
                    <p>
                        Por favor contacta a soporte para reactivar tu subscripción y continuar operando tu tienda.
                    </p>
                </>
            )}
            {isSubscriptionActive && (
                <>
                    <h2 style={{ fontWeight: 'bold' }}>
                        Tu subscripción está activa, puedes operar tu tienda con
                        normalidad.
                    </h2>
                    <h4>detalles de tu subscripción:</h4>
                    <p>
                        Plan:{' '}
                        <strong>
                            {
                                subscription?.plan?.name
                            }
                        </strong>
                    </p>
                    <p>
                        Fecha de activación:{' '}
                        <strong>
                            {moment(
                                subscription?.startDate
                            ).format('DD/MM/YYYY')}
                        </strong>
                    </p>
                    <p>
                        Fecha del proximo cobro:{' '}
                        <strong>
                            {moment(
                                subscription?.startDate
                            )
                                .add(
                                    subscription?.plan?.billingCycle
                                        ?.frequency || 0,
                                    subscription?.plan?.billingCycle
                                        ?.frequencyType || 'days'
                                )
                                .format('DD/MM/YYYY')}
                        </strong>
                    </p>
                    <div style={{ marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <Button
                            type="button"
                            variant="contained"
                            color="primary"
                            disabled={!mp || loading}
                            loading={loading}
                            className={classes.button}
                            onClick={() => setChangingPlan(true)}
                        >
                            Cambiar de plan
                        </Button>
                        {changingPlan && (
                            <Button
                                type="button"
                                variant="contained"
                                color="primary"
                                disabled={!mp || loading}
                                loading={loading}
                                className={classes.button}
                                onClick={() => setChangingPlan(false)}
                            >
                                Continuar con mi plan actual
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="contained"
                            color="warning"
                            disabled={loadingPauseSubscription}
                            loading={loadingPauseSubscription}
                            className={classes.button}
                            onClick={() => handleConfirmAction('pause')}
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
                            onClick={() => handleConfirmAction('cancel')}
                        >
                            Cancelar suscripción
                        </Button>
                    </div>
                </>
            )}
            
            {isPaymentAuthorized && !isSubscriptionActive && (
                <>
                    <h2 style={{ fontWeight: 'bold' }}>
                        Tu pago está autorizado
                    </h2>
                    <p >
                        Tu tarjeta fue autorizada exitosamente. Estamos procesando el pago para activar tu tienda.
                    </p>
                    <p>
                        Este proceso puede tomar unos minutos. Una vez completado, tu tienda estará lista para operar.
                    </p>
                    <h4 style={{ fontWeight: 'bold' }}>detalles de tu subscripción:</h4>
                    <p>
                        Plan:{' '}
                        <strong>
                            {
                                subscription?.plan?.name
                            }
                        </strong>
                    </p>
                    <p>
                        Fecha de autorización:{' '}
                        <strong>
                            {moment(
                                subscription?.startDate
                            ).format('DD/MM/YYYY')}
                        </strong>
                    </p>
                </>
            )}
            {!selectedPlan && changingPlan && (
                <>
                    <Typography
                        variant="h5"
                        gutterBottom
                        style={{ marginBottom: 10 }}
                    >
                        Selecciona tu plan
                    </Typography>
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
                                    <p style={{ margin: 0 }}>
                                        Nombre del plan:
                                    </p>
                                    <h4 style={{ margin: 0 }}>
                                        <strong>{plan.name}</strong>
                                    </h4>
                                    <p style={{ margin: 0 }}>Precio del plan</p>
                                    <p style={{ margin: 0 }}>
                                        <strong>
                                            $
                                            {formatNumber(
                                                plan.price.toFixed(1)
                                            )}
                                        </strong>
                                    </p>
                                    <Button
                                        type="button"
                                        variant="contained"
                                        color="primary"
                                        disabled={false}
                                        loading={false}
                                        className={classes.button}
                                        onClick={() => {
                                            setSelectedPlan(plan)
                                        }}
                                    >
                                        Seleccionar plan
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    {changingPlan && (isSubscriptionActive || isPaymentAuthorized) && (
                        <div
                            style={{
                                marginTop: 20,
                                display: 'flex',
                                gap: 10,
                                justifyContent: 'center',
                            }}
                        >
                            <Button
                                type="button"
                                variant="contained"
                                color="primary"
                                disabled={!mp || loading}
                                loading={loading}
                                className={classes.button}
                                onClick={() => setChangingPlan(false)}
                            >
                                Continuar con mi plan actual
                            </Button>
                        </div>
                    )}
                </>
            )}
            {selectedPlan && (
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
                                    <Typography
                                        variant="h5"
                                        gutterBottom
                                        style={{ marginBottom: 10 }}
                                    >
                                        Activa tu tienda
                                    </Typography>

                                    <Typography
                                        variant="body1"
                                        style={{ marginBottom: 20 }}
                                    >
                                        Para comenzar a operar tu tienda, selecciona un plan y completa el pago con tu tarjeta.
                                    </Typography>
                                    <div style={{ marginBottom: 20 }}>
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
                                    <div style={{ marginBottom: 20 }}>
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
                                    <div style={{ marginBottom: 20 }}>
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
                                    <div style={{ marginBottom: 20 }}>
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
                                    <div style={{ marginBottom: 20 }}>
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
                                        <Typography
                                            variant="body2"
                                            className={classes.error}
                                        >
                                            {error}
                                        </Typography>
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
                                        style={{ width: 100 }}
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
            )}
            <Dialog open={openModal} onClose={() => setOpenModal(false)}>
                <DialogTitle>¡Suscripción exítosa!</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)} color="primary">
                        Aceptar
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={showConfirmModal} onClose={() => setShowConfirmModal(false)}>
                <DialogTitle>
                    {confirmAction === 'cancel' ? 'Cancelar suscripción' : 'Pausar suscripción'}
                </DialogTitle>
                <DialogActions>
                    <Button onClick={() => setShowConfirmModal(false)} color="default">
                        Cancelar
                    </Button>
                    <Button 
                        onClick={executeAction} 
                        color={confirmAction === 'cancel' ? 'danger' : 'warning'}
                        disabled={loadingCancelSubscription || loadingPauseSubscription}
                    >
                        {confirmAction === 'cancel' ? 'Sí, cancelar' : 'Sí, pausar'}
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
