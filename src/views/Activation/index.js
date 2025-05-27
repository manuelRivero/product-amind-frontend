// src/pages/admin/MercadoPagoConnect.jsx

import React from 'react'
import { Button, Card, CardContent, Typography } from '@material-ui/core'

import { makeStyles } from '@material-ui/core/styles'
import { useSelector } from 'react-redux'

import Success from 'assets/img/success-icon.png'

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
    const classes = useStyles()
    const subdomain = window.location.hostname
        .split('.')[0]
        .replace('-admin', '')

    const handleConnect = () => {
        const authUrl = `${process.env.REACT_APP_API_KEY}/api/mercado-pago/auth?tenant=${subdomain}`
        window.open(authUrl, '_blank', 'noopener,noreferrer')
    }
    const isActivate = configDetail?.mercadoPagoConfigured
    console.log('configDetail', configDetail)
    return (
        <Card className={classes.card}>
            <CardContent>
                {!isActivate && (
                    <Typography variant="h5" gutterBottom>
                        Conectar Mercado Pago
                    </Typography>
                )}

                {isActivate && (
                    <>
                        <img
                            src={Success}
                            alt="Success"
                            style={{ width: 100 }}
                        />
                        <h6>¡Cuenta conectada exitosamente!</h6>
                        <p>
                            Ahora puedes empezar a recibir pagos a través de
                            Mercado Pago.
                        </p>
                    </>
                )}

                {/* {status === 'error' && (
                    <>
                        <ErrorIcon className={classes.error} fontSize="large" />
                        <Typography variant="h6" color="error">
                            Error al conectar la cuenta. Inténtalo de nuevo.
                        </Typography>
                    </>
                )}

                {!status && (
                    <Typography variant="body1" style={{ marginBottom: 16 }}>
                        Conecta tu cuenta de Mercado Pago para empezar a recibir
                        pagos.
                    </Typography>
                )} */}

                {/* {status === null && (
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height="100%"
                    >
                        <CircularProgress style={{ marginBottom: 16 }} />
                    </Box>
                )} */}

                {!isActivate && (
                    <Button
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        onClick={handleConnect}
                    >
                        Conectar cuenta
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}

export default Activation
