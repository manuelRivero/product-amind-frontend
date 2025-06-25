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
import { useSelector } from 'react-redux'

import Success from 'assets/img/success-icon.png'
import axios from 'axios'
import TextInput from '../../components/TextInput/Index'
import LoadinScreen from '../../components/LoadingScreen'
import { getPlans } from '../../api/plans'
import { formatNumber } from '../../helpers/product'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import moment from 'moment'

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
    const { configDetail } = useSelector((state) => state.config)
    const { user } = useSelector((state) => state.auth)
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
    const [changingPlan, setChangingPlan] = React.useState(false)
    const classes = useStyles()

    const handleConnect = async (card_token) => {
        console.log('send')
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_KEY}/api/mercado-pago/subscribe-user`,
                {
                    card_token,
                    preapproval_plan_id: selectedPlan._id,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-token': user.token,
                    },
                }
            )
            console.log('authUrl', response.data)
            setOpenModal(true)
        } catch (error) {
            setError('Error al enviar el token de la tarjeta')
            return
        }
    }
    // const isActivate =
    //     configDetail?.subscriptionDetail?.hasActiveSubscription ?? false
    const isActivate =
        configDetail?.subscriptionDetail?.hasActiveSubscription ?? false

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
                const response = await getPlans(user.token)
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
            {isActivate && (
                <>
                    <h2>
                        Tu subscripción está activa, puedes operar tu tienda con
                        normalidad.
                    </h2>
                    <h4>detalles de tu subscripción:</h4>
                    <p>
                        Plan:{' '}
                        <strong>
                            {
                                configDetail?.subscriptionDetail?.subscription
                                    .plan?.name
                            }
                        </strong>
                    </p>
                    <p>
                        Fecha de activación:{' '}
                        <strong>
                            {moment(
                                configDetail?.subscriptionDetail?.subscription
                                    .startDate
                            ).format('DD/MM/YYYY')}
                        </strong>
                    </p>
                    <p>
                        Fecha del proximo cobro:{' '}
                        <strong>
                            {moment(
                                configDetail?.subscriptionDetail?.subscription
                                    .startDate
                            )
                                .add(
                                    configDetail?.subscriptionDetail
                                        ?.subscription.plan.billingCycle
                                        .frequency,
                                    configDetail?.subscriptionDetail
                                        ?.subscription.plan.billingCycle
                                        .frequencyType
                                )
                                .format('DD/MM/YYYY')}
                        </strong>
                    </p>
                    <div style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
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
                    </div>
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
                        .filter(
                            (plan) =>
                                plan._id !==
                                configDetail?.subscriptionDetail?.subscription
                                    .plan
                                    ._id
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
                    {changingPlan && (
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
                        className={classes.backButton}
                        onClick={() => setSelectedPlan(null)}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Card className={classes.card}>
                        <CardContent>
                            {!isActivate && (
                                <>
                                    <Typography
                                        variant="h5"
                                        gutterBottom
                                        style={{ marginBottom: 10 }}
                                    >
                                        Activa tu subscripción
                                    </Typography>

                                    <Typography
                                        variant="body1"
                                        style={{ marginBottom: 20 }}
                                    >
                                        Para activar tu subscripción, ingresa
                                        los detalles de la tarjeta donde se
                                        realizará el cobro.
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
                                        Activar Subscripción
                                    </Button>
                                </>
                            )}

                            {isActivate && (
                                <>
                                    <img
                                        src={Success}
                                        alt="Success"
                                        style={{ width: 100 }}
                                    />
                                    <h6>¡Subscripción al día !</h6>
                                    <p>
                                        Puedes operar tu tienda con normalidad.
                                    </p>
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
        </>
    )
}

export default Activation
