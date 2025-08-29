import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { useDispatch } from 'react-redux';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextInput from '../TextInput/Index';
import client from '../../api/client';
import { getConfigRequest } from '../../store/config';
import Card from '../Card/Card.js';
import CardHeader from '../Card/CardHeader.js';
import CardBody from '../Card/CardBody.js';

const useStyles = makeStyles(() => ({
    card: {
        marginTop: 20,
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
        color: 'rgba(255,255,255,.62)',
        margin: '0',
        fontSize: '14px',
        marginTop: '0',
        marginBottom: '0',
    },
    input: {
        marginBottom: 20,
    },
    error: {
        color: '#f44336',
        fontSize: '14px',
        marginBottom: 20,
    },
    button: {
        marginTop: 20,
    },
}));

const PaymentForm = ({
    showCardForm,
    selectedPlan,
    selectedProductForPlanChange,
    selectedCategoryForPlanChange,
    onSuccess,
    onViewModeChange,
    resetPlan
}) => {
    const classes = useStyles();
    const dispatch = useDispatch();
    // Estados internos del formulario
    const [cardNumber, setCardNumber] = useState('');
    const [cardExp, setCardExp] = useState('');
    const [cardCvv, setCardCvv] = useState('');
    const [cardName, setCardName] = useState('');
    const [cardDni, setCardDni] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mp, setMp] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Inicializar MercadoPago
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://sdk.mercadopago.com/js/v2';
        script.async = true;
        script.onload = () => {
            const mpInstance = new window.MercadoPago(
                'APP_USR-4cfc2933-f53e-45a8-a2c6-f75b7e6bc0ef',
                { locale: 'es-AR' }
            );
            setMp(mpInstance);
        };
        document.body.appendChild(script);
    }, []);

    const handleConnect = async (card_token) => {
        try {
            const response = await client.post(
                `api/mercado-pago/subscribe-user`,
                {
                    card_token,
                    preapproval_plan_id: selectedPlan?._id,
                    planData: selectedProductForPlanChange && selectedCategoryForPlanChange ? {
                        product_ids: selectedProductForPlanChange?.productsToRemove?.map(p => p._id) || [],
                        category_ids: selectedCategoryForPlanChange?.categoriesToRemove?.map(c => c._id) || []
                    } : null
                }
            );
            console.log('authUrl', response.data);
            
            // Mostrar modal de éxito
            setShowSuccessModal(true);
            if (resetPlan) {
                resetPlan();
            }
            dispatch(getConfigRequest())
            
            // Llamar callback de éxito si existe
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('Error en handleConnect:', error);
            
            // Extraer mensaje de error específico del servidor
            let errorMsg = 'Error al procesar el pago';
            
            if (error.response) {
                // Error de respuesta del servidor
                const serverError = error.response.data;
                errorMsg = serverError?.message || serverError?.error || `Error ${error.response.status}: ${error.response.statusText}`;
            } else if (error.request) {
                // Error de red
                errorMsg = 'Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.';
            } else if (error.message) {
                // Error personalizado
                errorMsg = error.message;
            }
            
            setErrorMessage(errorMsg);
            setShowErrorModal(true);
        }
    };

    const handleSubmit = async () => {
        if (!mp) {
            setError('Mercado Pago SDK no cargó correctamente');
            return;
        }

        setLoading(true);
        setError('');
        
        try {
            const cardTokenResponse = await mp.createCardToken({
                cardNumber,
                cardholderName: cardName,
                cardExpirationMonth: cardExp.split('/')[0],
                cardExpirationYear: cardExp.split('/')[1],
                securityCode: cardCvv,
                identificationType: 'DNI',
                identificationNumber: cardDni,
            });
            
            console.log('Subscription activated:', cardTokenResponse);
            await handleConnect(cardTokenResponse.id);
        } catch (err) {
            console.error('Error en handleSubmit:', err);
            
            // Extraer mensaje de error específico
            let errorMsg = 'Error al procesar el pago';
            
            if (err.message) {
                errorMsg = err.message;
            } else if (err.response) {
                const serverError = err.response.data;
                errorMsg = serverError?.message || serverError?.error || `Error ${err.response.status}: ${err.response.statusText}`;
            }
            
            setError(errorMsg);
            setErrorMessage(errorMsg);
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        // Limpiar error cuando el usuario empiece a escribir
        if (error) {
            setError('');
        }
        
        switch (field) {
            case 'cardNumber':
                setCardNumber(value);
                break;
            case 'cardExp': {
                // Formatear fecha de expiración con regex MM/YY
                const formattedExp = formatExpirationDate(value);
                setCardExp(formattedExp);
                break;
            }
            case 'cardCvv':
                setCardCvv(value);
                break;
            case 'cardName':
                setCardName(value);
                break;
            case 'cardDni':
                setCardDni(value);
                break;
            default:
                break;
        }
    };

    // Función para formatear la fecha de expiración
    const formatExpirationDate = (value) => {
        // Remover todos los caracteres no numéricos
        const numbers = value.replace(/\D/g, '');
        
        // Limitar a 4 dígitos máximo
        const limitedNumbers = numbers.slice(0, 4);
        
        // Aplicar formato MM/YY
        if (limitedNumbers.length >= 2) {
            const month = limitedNumbers.slice(0, 2);
            const year = limitedNumbers.slice(2);
            
            // Validar que el mes esté entre 01 y 12
            const monthNum = parseInt(month, 10);
            if (monthNum === 0) {
                return '01/' + (year || '');
            } else if (monthNum > 12) {
                return '12/' + (year || '');
            }
            
            // Siempre agregar "/" después del mes si hay al menos 2 dígitos
            return month + '/' + (year || '');
        }
        
        return limitedNumbers;
    };

    const handleSuccessModalClose = () => {
        setShowSuccessModal(false);
        // Cambiar view mode a subscription-details
        if (onViewModeChange) {
            onViewModeChange('subscription-details');
        }
    };

    const handleErrorModalClose = () => {
        setShowErrorModal(false);
        setError('');
        setErrorMessage('');
    };

    return (
        <>
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
                                    handleInputChange('cardNumber', target.value)
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
                                    handleInputChange('cardExp', target.value)
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
                                    handleInputChange('cardCvv', target.value)
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
                                    handleInputChange('cardName', target.value)
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
                                    handleInputChange('cardDni', target.value)
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
                                onClick={handleSubmit}
                            >
                                Aceptar
                            </Button>
                        </>
                    )}
                </CardBody>
            </Card>

            {/* Modal de éxito */}
            <Dialog open={showSuccessModal} onClose={handleSuccessModalClose}>
                <DialogTitle>¡Suscripción exitosa!</DialogTitle>
                <DialogActions>
                    <Button onClick={handleSuccessModalClose} color="primary">
                        Aceptar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal de error */}
            <Dialog open={showErrorModal} onClose={handleErrorModalClose}>
                <DialogTitle>Error al procesar el pago</DialogTitle>
                <div style={{ padding: '0 24px 24px 24px' }}>
                    <p style={{ marginBottom: '20px', color: '#666' }}>
                        {errorMessage || 'Ha ocurrido un error al procesar tu pago. Por favor, intenta nuevamente.'}
                    </p>
                </div>
                <DialogActions>
                    <Button onClick={handleErrorModalClose} color="primary">
                        Aceptar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

PaymentForm.propTypes = {
    showCardForm: PropTypes.bool,
    selectedPlan: PropTypes.object,
    selectedProductForPlanChange: PropTypes.object,
    selectedCategoryForPlanChange: PropTypes.object,
    onSuccess: PropTypes.func,
    onViewModeChange: PropTypes.func,
    resetPlan: PropTypes.func
};

PaymentForm.defaultProps = {
    showCardForm: false,
    selectedPlan: null,
    selectedProductForPlanChange: null,
    selectedCategoryForPlanChange: null,
    onSuccess: null,
    onViewModeChange: null,
    resetPlan: null
};

export default PaymentForm;
