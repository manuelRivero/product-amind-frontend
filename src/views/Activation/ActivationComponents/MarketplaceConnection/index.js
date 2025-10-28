import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from 'components/Card/Card.js';
import CardHeader from 'components/Card/CardHeader.js';
import CardBody from 'components/Card/CardBody.js';
import Button from 'components/CustomButtons/Button';
import GridContainer from 'components/Grid/GridContainer.js';
import GridItem from 'components/Grid/GridItem.js';
import SecurityIcon from '@material-ui/icons/Security';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { useDispatch } from 'react-redux';
import { connectMarketplace } from '../../../../store/mercado-pago';

const useStyles = makeStyles((theme) => ({
    card: {
        maxWidth: 1000,
        margin: 'auto',
        marginTop: theme.spacing(8),
    },
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
        color: '#FFFFFF',
        margin: '0',
        fontSize: '14px',
        marginTop: '0',
        marginBottom: '0',
    },
    description: {
        fontSize: '16px',
        lineHeight: '1.6',
        marginBottom: theme.spacing(3),
        color: '#333',
        textAlign: 'center',
    },
    securityBanner: {
        backgroundColor: '#e8f5e8',
        border: '2px solid #4caf50',
        borderRadius: '12px',
        padding: theme.spacing(2.5),
        marginBottom: theme.spacing(3),
        textAlign: 'center',
    },
    securityTitle: {
        fontSize: '20px',
        color: '#2e7d32',
        margin: '0 0 8px 0',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
    },
    securitySubtitle: {
        fontSize: '16px',
        color: '#388e3c',
        margin: '0',
        fontWeight: '500',
    },
    infoBox: {
        backgroundColor: '#f3f8ff',
        border: '2px solid #1976d2',
        borderRadius: '12px',
        padding: theme.spacing(2.5),
        marginBottom: theme.spacing(3),
    },
    infoTitle: {
        fontSize: '18px',
        color: '#1976d2',
        margin: '0 0 12px 0',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    infoText: {
        fontSize: '15px',
        color: '#1565c0',
        margin: '0',
        fontWeight: '400',
        lineHeight: '1.5',
    },
    securityFeatures: {
        marginBottom: theme.spacing(3),
    },
    securityFeature: {
        display: 'flex',
        alignItems: 'flex-start',
        marginBottom: theme.spacing(2),
        padding: theme.spacing(1.5),
        backgroundColor: '#f8f9fa',
        borderRadius: '10px',
        borderLeft: '4px solid #4caf50',
    },
    securityIcon: {
        marginRight: theme.spacing(2),
        color: '#4caf50',
        fontSize: '24px',
        marginTop: '2px',
    },
    securityText: {
        fontSize: '14px',
        color: '#2e7d32',
        fontWeight: '500',
        lineHeight: '1.4',
    },
    summaryBox: {
        backgroundColor: '#fff3e0',
        border: '2px solid #ff9800',
        borderRadius: '12px',
        padding: theme.spacing(2.5),
        marginBottom: theme.spacing(3),
    },
    summaryTitle: {
        fontSize: '18px',
        color: '#f57c00',
        margin: '0 0 16px 0',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    summaryItem: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: theme.spacing(1.5),
        fontSize: '15px',
        color: '#e65100',
        fontWeight: '500',
    },
    summaryIcon: {
        marginRight: theme.spacing(1.5),
        color: '#4caf50',
        fontSize: '20px',
    },
    connectButton: {
        marginTop: theme.spacing(2),
        padding: theme.spacing(2, 4),
        fontSize: '16px',
        fontWeight: '600',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
    },
    waitingBox: {
        backgroundColor: '#e3f2fd',
        border: '2px solid #2196f3',
        borderRadius: '12px',
        padding: theme.spacing(3),
        marginBottom: theme.spacing(3),
        textAlign: 'center',
    },
    waitingText: {
        fontSize: '18px',
        color: '#1976d2',
        margin: '0 0 8px 0',
        fontWeight: '600',
    },
    waitingSubtext: {
        fontSize: '15px',
        color: '#1565c0',
        margin: '0',
        fontWeight: '400',
        lineHeight: '1.5',
    },
}));

const MarketplaceConnection = () => {
    const classes = useStyles();
    const dispatch = useDispatch();

    const [ loading, setLoading ] = useState(false);
    const [waiting, setWaiting] = useState(false);

    const submit = async () => {
        setLoading(true);
        try {
            const {data} = await dispatch(connectMarketplace()).unwrap();
            if (data && data.url) {
                window.open(data.url, '_blank');
                setWaiting(true);
            }
        } catch (error) {
            console.error('error', error);
        } finally {
            setLoading(false);
        }
    }

    const benefits = [
        {
            icon: <SecurityIcon className={classes.securityIcon} />,
            text: '🔒 Todo se realiza directamente desde la plataforma oficial de Mercado Pago, sin que nosotros almacenemos tus credenciales.'
        },
        {
            icon: <VerifiedUserIcon className={classes.securityIcon} />,
            text: 'Porque Mercado Pago debe verificar tu cuenta y conectar tu identidad de vendedor. Esto asegura que los pagos lleguen correctamente, protege a tus compradores y cumple con las normas de seguridad financiera.'
        }
    ];

    const summaryPoints = [
        'Tus fondos siguen en tu cuenta de Mercado Pago.',
        'Solo se autoriza lo necesario para cobrar y transferir.',
        'Puedes revocar el acceso cuando quieras desde tu cuenta.'
    ];

    return (
        <Card className={classes.card}>
            <CardHeader color="success">
                <h4 className={classes.cardTitleWhite}>
                    Conecta tu cuenta de Mercado Pago con total seguridad
                </h4>
                <p className={classes.cardCategoryWhite}>
                    Autorización segura para procesar pagos en tu tienda
                </p>
            </CardHeader>
            <CardBody>
                {waiting ? (
                    <div className={classes.waitingBox}>
                        <p className={classes.waitingText}>
                            🔄 Conexión en curso
                        </p>
                        <p className={classes.waitingSubtext}>
                            Puedes cerrar esta pestaña de la tienda y continuar en la pestaña de Mercado Pago. 
                            Al finalizar el flujo de conexión, serás redirigido automáticamente de vuelta a tu dashboard de la tienda.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className={classes.securityBanner}>
                            <h3 className={classes.securityTitle}>
                                <SecurityIcon />
                                Conexión Segura
                            </h3>
                            <p className={classes.securitySubtitle}>
                                Para procesar tus cobros, Mercado Pago necesita que autorices algunos permisos. Estos no le dan acceso a tu dinero ni a tu información personal: solo permiten que tu tienda reciba pagos, gestione órdenes y confirme las transacciones automáticamente.
                            </p>
                        </div>

                        <div className={classes.infoBox}>
                            <h4 className={classes.infoTitle}>
                                <VerifiedUserIcon />
                                ¿Por qué se piden estos permisos?
                            </h4>
                            <p className={classes.infoText}>
                                Porque Mercado Pago debe verificar tu cuenta y conectar tu identidad de vendedor. Esto asegura que los pagos lleguen correctamente, protege a tus compradores y cumple con las normas de seguridad financiera.
                            </p>
                        </div>

                        <div className={classes.securityFeatures}>
                            {benefits.map((benefit, index) => (
                                <div key={index} className={classes.securityFeature}>
                                    {benefit.icon}
                                    <span className={classes.securityText}>
                                        {benefit.text}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className={classes.summaryBox}>
                            <h4 className={classes.summaryTitle}>
                                <CheckCircleIcon />
                                En resumen:
                            </h4>
                            {summaryPoints.map((point, index) => (
                                <div key={index} className={classes.summaryItem}>
                                    <CheckCircleIcon className={classes.summaryIcon} />
                                    {point}
                                </div>
                            ))}
                        </div>

                        <p className={classes.description}>
                            <strong>Autorizar estos permisos es el paso final para activar los pagos en tu tienda y comenzar a vender de forma segura y profesional.</strong>
                        </p>

                        <GridContainer justify="center">
                            <GridItem xs={12} sm={8} md={6}>
                                <Button
                                    type="button"
                                    variant="contained"
                                    color="success"
                                    disabled={loading}
                                    loading={loading}
                                    className={classes.connectButton}
                                    onClick={submit}
                                    fullWidth
                                >
                                    Autorizar Conexión Segura
                                </Button>
                            </GridItem>
                        </GridContainer>
                    </>
                )}
            </CardBody>
        </Card>
    );
};

MarketplaceConnection.propTypes = {
    // No props needed anymore
};

export default MarketplaceConnection;
