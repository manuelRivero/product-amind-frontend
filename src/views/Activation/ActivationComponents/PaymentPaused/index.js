import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Card from 'components/Card/Card.js';
import CardHeader from 'components/Card/CardHeader.js';
import CardBody from 'components/Card/CardBody.js';
import Button from 'components/CustomButtons/Button';
import PauseCircleFilledIcon from '@material-ui/icons/PauseCircleFilled';
import moment from 'moment';
import { isFreePlan } from '../../../../utils/planPermissions';

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
    subscriptionPausedBanner: {
        color: theme.palette.warning.main,
        display: 'flex',
        alignItems: 'center',
        fontWeight: 'bold',
        fontSize: '1.5rem',
        marginTop: `calc(${theme.spacing(3)}px + 1rem)`,
        marginBottom: theme.spacing(1),
        justifyContent: 'flex-start',
        padding: 0,
    },
    description: {
        color: '#666',
        fontSize: '14px',
        marginTop: theme.spacing(1),
    },
    subtitle: {
        fontWeight: 'bold',
        marginBottom: theme.spacing(1),
    },
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
    buttonContainer: {
        marginBottom: theme.spacing(2.5),
        display: 'flex',
        gap: theme.spacing(1.25),
        flexWrap: 'wrap',
    },
    button: {
        marginTop: theme.spacing(4),
    },
}));

const PaymentPaused = ({ 
    configDetail, 
    lastPauseDate, 
    loadingCancelSubscription, 
    handleConfirmAction, 
    ACTION_TYPES 
}) => {
    const classes = useStyles();
    
    // Verificar si el plan actual es gratuito
    const isCurrentPlanFree = isFreePlan(configDetail?.plan);

    return (
        <Card className={classes.card}>
            <CardHeader color="primary">
                <h4 className={classes.cardTitleWhite}>
                    Panel de Activación y Gestión de Suscripción
                </h4>
                <p className={classes.cardCategoryWhite}>
                    Aquí puedes ver el estado de tu suscripción, consultar los detalles de tu plan actual y gestionar acciones como cambiar, pausar o cancelar tu suscripción.
                </p>
            </CardHeader>
            <CardBody>
                <div className={classes.subscriptionPausedBanner}>
                    Tu subscripción está pausada temporalmente
                    <PauseCircleFilledIcon style={{ marginLeft: 12, fontSize: 32 }} />
                </div>
                <p className={classes.description} style={{ marginTop: 0 }}>
                    Por favor contacta a soporte para reactivar tu subscripción y continuar operando tu tienda.
                </p>
                <h4 className={classes.subtitle}>Detalles de tu subscripción:</h4>
                <ul className={classes.subscriptionDetailsList}>
                    <li className={classes.subscriptionDetailItem}>
                        <div className={classes.subscriptionDetailBullet}></div>
                        <span className={classes.subscriptionDetailLabel}>Plan:</span>
                        <span className={classes.subscriptionDetailValue}>
                            {configDetail?.plan?.name}
                        </span>
                    </li>
                    <li className={classes.subscriptionDetailItem}>
                        <div className={classes.subscriptionDetailBullet}></div>
                        <span className={classes.subscriptionDetailLabel}>Fecha de activación:</span>
                        <span className={classes.subscriptionDetailValue}>
                            {moment(configDetail?.startDate).format('DD/MM/YYYY')}
                        </span>
                    </li>
                    {lastPauseDate && (
                        <li className={classes.subscriptionDetailItem}>
                            <div className={classes.subscriptionDetailBullet}></div>
                            <span className={classes.subscriptionDetailLabel}>Fecha de pausa:</span>
                            <span className={classes.subscriptionDetailValue}>
                                {moment(lastPauseDate).format('DD/MM/YYYY')}
                            </span>
                        </li>
                    )}
                </ul>
                <div className={classes.buttonContainer}>
                    <Button
                        type="button"
                        variant="contained"
                        color="primary"
                        disabled={false}
                        loading={false}
                        className={classes.button}
                        onClick={() => handleConfirmAction(ACTION_TYPES.CHANGE_PLAN)}
                    >
                        Cambiar de plan
                    </Button>
                    {!isCurrentPlanFree && (
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
                    )}
                    <Button
                        type="button"
                        variant="contained"
                        color="success"
                        className={classes.button}
                        onClick={() => handleConfirmAction(ACTION_TYPES.RESUME)}
                    >
                        Reactivar suscripción
                    </Button>
                </div>
            </CardBody>
        </Card>
    );
};

PaymentPaused.propTypes = {
    configDetail: PropTypes.object,
    lastPauseDate: PropTypes.string,
    loadingCancelSubscription: PropTypes.bool,
    handleConfirmAction: PropTypes.func.isRequired,
    ACTION_TYPES: PropTypes.object.isRequired,
};

export default PaymentPaused;
