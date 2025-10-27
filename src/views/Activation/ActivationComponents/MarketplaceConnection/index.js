import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from 'components/Card/Card.js';
import CardHeader from 'components/Card/CardHeader.js';
import CardBody from 'components/Card/CardBody.js';
import Button from 'components/CustomButtons/Button';
import GridContainer from 'components/Grid/GridContainer.js';
import GridItem from 'components/Grid/GridItem.js';
import StorefrontIcon from '@material-ui/icons/Storefront';
import PaymentIcon from '@material-ui/icons/Payment';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
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
    },
    benefitsContainer: {
        marginBottom: theme.spacing(3),
    },
    benefitItem: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: theme.spacing(2),
        padding: theme.spacing(1.5),
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        borderLeft: '4px solid #20b6c9',
    },
    benefitIcon: {
        marginRight: theme.spacing(2),
        color: '#20b6c9',
        fontSize: '24px',
    },
    benefitText: {
        fontSize: '14px',
        color: '#555',
        fontWeight: '500',
    },
    connectButton: {
        marginTop: theme.spacing(2),
        padding: theme.spacing(1.5, 3),
        fontSize: '16px',
        fontWeight: '600',
    },
    infoBox: {
        backgroundColor: '#e3f2fd',
        border: '1px solid #20b6c9',
        borderRadius: '8px',
        padding: theme.spacing(2),
        marginBottom: theme.spacing(3),
    },
    infoText: {
        fontSize: '14px',
        color: '#1976d2',
        margin: 0,
        fontWeight: '500',
    },
    waitingBox: {
        backgroundColor: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '8px',
        padding: theme.spacing(2),
        marginBottom: theme.spacing(3),
        textAlign: 'center',
    },
    waitingText: {
        fontSize: '16px',
        color: '#856404',
        margin: 0,
        fontWeight: '600',
    },
    waitingSubtext: {
        fontSize: '14px',
        color: '#856404',
        margin: '8px 0 0 0',
        fontWeight: '400',
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
            icon: <StorefrontIcon className={classes.benefitIcon} />,
            text: 'Integra tu tienda directamente con el marketplace de Mercado Pago'
        },
        {
            icon: <PaymentIcon className={classes.benefitIcon} />,
            text: 'Procesa pagos de manera segura y confiable'
        },
        {
            icon: <TrendingUpIcon className={classes.benefitIcon} />,
            text: 'Aumenta tus ventas con acceso a millones de compradores'
        }
    ];

    return (
        <Card className={classes.card}>
            <CardHeader color="success">
                <h4 className={classes.cardTitleWhite}>
                    Conectar con Mercado Pago Marketplace
                </h4>
                <p className={classes.cardCategoryWhite}>
                    Integra tu tienda con la plataforma de pagos más confiable de Latinoamérica
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
                        <p className={classes.description}>
                            Conecta tu tienda con Mercado Pago Marketplace para acceder a una plataforma completa de comercio electrónico. 
                            Esta integración te permitirá gestionar pagos, envíos y expandir tu negocio de manera profesional.
                        </p>

                        <div className={classes.infoBox}>
                            <p className={classes.infoText}>
                                <strong>Importante:</strong> Esta conexión es requerida para continuar con la gestión de tu tienda. 
                                Te dará acceso a herramientas avanzadas de gestión de pagos y te permitirá llegar a una base de clientes más amplia a través del marketplace de Mercado Pago.
                            </p>
                        </div>

                        <div className={classes.benefitsContainer}>
                            <h5 style={{ marginBottom: '16px', color: '#333', fontWeight: '600' }}>
                                Beneficios de la conexión:
                            </h5>
                            {benefits.map((benefit, index) => (
                                <div key={index} className={classes.benefitItem}>
                                    {benefit.icon}
                                    <span className={classes.benefitText}>
                                        {benefit.text}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <GridContainer justify="center">
                            <GridItem xs={12} sm={6} md={4}>
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
                                    Conectar con Mercado Pago
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
