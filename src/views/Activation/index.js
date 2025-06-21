// src/pages/admin/MercadoPagoConnect.jsx

import React, { useEffect } from 'react'
import {
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogTitle,
    Typography,
} from '@material-ui/core'

import { makeStyles } from '@material-ui/core/styles'
import { useSelector } from 'react-redux'

import Success from 'assets/img/success-icon.png'
import axios from 'axios'
import TextInput from '../../components/TextInput/Index'

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
    const [mp, setMp] = React.useState(null)
    const [cardNumber, setCardNumber] = React.useState('')
    const [cardExp, setCardExp] = React.useState('')
    const [cardCvv, setCardCvv] = React.useState('')
    const [cardName, setCardName] = React.useState('')
    const [cardDni, setCardDni] = React.useState('')
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(null)
    const [openModal, setOpenModal] = React.useState(false)
    const classes = useStyles()
    const subdomain = window.location.hostname
        .split('.')[0]
        .replace('-admin', '')

    const handleConnect = async () => {
        console.log('send')
        try {
            setLoading(true)
            const card_token = '881285f6e759c1dd08fb36a4ac84a2ed'
            const response = await axios.post(
                `${process.env.REACT_APP_API_KEY}/api/mercado-pago/subscribe-user?tenant=${subdomain}`,
                {
                    card_token,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        // "Authorization": `Bearer ${token}` // si tu API lo requiere
                    },
                }
            )
            console.log('authUrl', response.data)
            setOpenModal(true)
        } catch (error) {
            setError('Error al enviar el token de la tarjeta')
            console.error('Error al enviar el token de la tarjeta:', error)
            return
        } finally {
            setLoading(false)
        }
    }
    // const isActivate =
    //     configDetail?.subscriptionDetail?.hasActiveSubscription ?? false
    const isActivate = false
    console.log('configDetail', configDetail)
    const submitCardDetails = async () => {
        try {
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
            handleConnect(cardTokenResponse.id)
            // Handle success (e.g., show a success message, redirect, etc.)
        } catch (error) {
            console.error('Error activating subscription:', error)
            // Handle error (e.g., show an error message)
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

    return (
        <>
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
                                Para activar tu subscripción, ingresa los
                                detalles de la tarjeta donde se realizará el
                                cobro.
                            </Typography>
                            <div style={{ marginBottom: 20 }}>
                                <TextInput
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
                                    label={'DNI del titular de la Tarjeta'}
                                    placeholder={'Ingrese el DNI del titular'}
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
                            <p>Puedes operar tu tienda con normalidad.</p>
                        </>
                    )}
                </CardContent>
            </Card>
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
