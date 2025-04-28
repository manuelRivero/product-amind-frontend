// src/pages/admin/MercadoPagoConnect.jsx

import React from 'react'
import { Button, Card, CardContent, Typography } from '@material-ui/core'

import { makeStyles } from '@material-ui/core/styles'

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
    const classes = useStyles()
    const subdomain = window.location.hostname
        .split('.')[0]
        .replace('-admin', '')

    const handleConnect = () => {
        const authUrl = `${process.env.REACT_APP_API_KEY}/api/mercado-pago/auth?tenant=${subdomain}`
        window.open(authUrl, '_blank', 'noopener,noreferrer')
    }

    return (
        <Card className={classes.card}>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Conectar Mercado Pago
                </Typography>

                {/* {status === 'success' && (
                    <>
                        <CheckCircleIcon
                            className={classes.success}
                            fontSize="large"
                        />
                        <Typography variant="h6" color="primary">
                            ¡Cuenta conectada exitosamente!
                        </Typography>
                    </>
                )} */}

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

                <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    onClick={handleConnect}
                >
                    Conectar cuenta
                </Button>
            </CardContent>
        </Card>
    )
}

export default Activation
