import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Box, Typography, Paper } from '@material-ui/core'
import { Error as ErrorIcon } from '@material-ui/icons'

const useStyles = makeStyles({
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
    },
    errorCard: {
        maxWidth: '500px',
        width: '100%',
        padding: '40px',
        textAlign: 'center',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        background: '#fff',
    },
    errorIcon: {
        fontSize: '64px',
        color: '#f44336',
        marginBottom: '24px',
    },
    title: {
        fontSize: '24px',
        fontWeight: '600',
        color: '#333',
        marginBottom: '16px',
    },
    subtitle: {
        fontSize: '16px',
        color: '#666',
        marginBottom: '24px',
        lineHeight: '1.5',
    },
    urlExample: {
        background: '#f5f5f5',
        padding: '12px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#333',
        marginTop: '16px',
        border: '1px solid #e0e0e0',
    },
})

const TenantError = () => {
    const classes = useStyles()

    return (
        <Box className={classes.container}>
            <Paper className={classes.errorCard}>
                <ErrorIcon className={classes.errorIcon} />
                
                <Typography className={classes.title}>
                    Acceso no autorizado
                </Typography>
                
                <Typography className={classes.subtitle}>
                    No se pudo detectar el subdominio de la tienda. 
                    Para acceder al panel de administración, debes usar una URL con el formato correcto.
                </Typography>
                
                <Typography variant="body2" style={{ color: '#666', marginBottom: '16px' }}>
                    Ejemplo de URL válida:
                </Typography>
                
                <Box className={classes.urlExample}>
                    https://miempresa.admin.tiendapro.com.ar
                </Box>
                
                <Typography variant="body2" style={{ color: '#999', marginTop: '16px' }}>
                    Reemplaza &quot;miempresa&quot; con el nombre de tu tienda
                </Typography>
            </Paper>
        </Box>
    )
}

export default TenantError
