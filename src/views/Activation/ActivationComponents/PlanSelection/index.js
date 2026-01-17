import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { IconButton } from '@material-ui/core';
import Card from 'components/Card/Card.js';
import CardHeader from 'components/Card/CardHeader.js';
import CardBody from 'components/Card/CardBody.js';
import GridContainer from 'components/Grid/GridContainer.js';
import GridItem from 'components/Grid/GridItem.js';
import Button from 'components/CustomButtons/Button';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import FeatureAlert from 'components/FeatureAlert';
import LoadinScreen from 'components/LoadingScreen';
import { formatNumber } from '../../../../helpers/product';
import {
    PlanFeaturesList,
    formatBillingCycle
} from '../../../helpers';
import { isFreePlan } from '../../../../utils/planPermissions';
import { UNAVAILABLE_FEATURE_FALLBACK } from '../../../const';
import { VIEW_MODE_KEYS } from '../../activationConstants';
import { PLAN_DISPLAY_TEXTS } from '../../../helpers';
import { usePlanSelectionState } from '../../hooks/usePlanSelectionState';

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
    backButton: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        cursor: 'pointer',
    },
    featureAlert: {
        margin: theme.spacing(2, 0),
        fontSize: '1rem',
        borderLeft: '6px solid #20b6c9',
        background: '#e3f2fd',
        color: theme.palette.primary.main,
        boxShadow: '0 2px 8px rgba(33,150,243,0.10)',
    },
    planGlow: {
        boxShadow: '0 0 0 4px #fff, 0 0 16px 4px #20b6c9',
        animation: '$glowAnim 1.5s infinite alternate',
    },
    '@keyframes glowAnim': {
        '0%': { boxShadow: '0 0 0 4px #fff, 0 0 8px 2px #20b6c9' },
        '100%': { boxShadow: '0 0 0 4px #fff, 0 0 24px 8px #20b6c9' },
    },
    planCardHeaderGray: {
        background: '#f5f5f5',
        padding: theme.spacing(2, 2, 2, 2),
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        borderBottom: '1px solid #e0e0e0',
    },
    planTitleDark: {
        color: '#222',
        fontWeight: 'bold',
        margin: 0,
    },
    planPriceBig: {
        fontSize: '2.1rem',
        fontWeight: 700,
        color: '#2e7d32',
        margin: 0,
        lineHeight: 1.1,
        display: 'inline-block',
    },
    planBillingCycle: {
        fontSize: '1rem',
        color: '#666',
        marginLeft: 8,
        fontWeight: 400,
        display: 'inline-block',
        verticalAlign: 'bottom',
    },
    planDescription: {
        fontSize: '1rem',
        color: '#444',
        margin: '4px 0 0 0',
        fontWeight: 400,
    },
    button: {
        marginTop: theme.spacing(4),
    },
    planButton: {
        width: '100%',
    },
    continueButtonContainer: {
        marginTop: theme.spacing(2.5),
        display: 'flex',
        gap: theme.spacing(1.25),
        justifyContent: 'center',
    },
}));

const PlanSelection = ({
    setViewMode,
    isSubscriptionActive,
    setSelectedPlan,
    setShowComparisonModal
}) => {
    const classes = useStyles();
    const {
        loadingPlans,
        plans,
        featureParam,
        featureInfo,
        highlightPlans,
        configDetail
    } = usePlanSelectionState();

    if (loadingPlans) {
        return <LoadinScreen />;
    }

    return (
        <>
            <IconButton
                className={classes.backButton}
                onClick={() => setViewMode(VIEW_MODE_KEYS.SUBSCRIPTION_DETAILS)}
            >
                <ArrowBackIcon />
            </IconButton>
            {featureParam && featureInfo && (
                <FeatureAlert severity="info" className={classes.featureAlert}>
                    {featureInfo === UNAVAILABLE_FEATURE_FALLBACK ? (
                        <div>
                            <strong>{featureInfo.title}</strong>
                            {featureInfo.paragraphs.map((paragraph, index) => (
                                <p key={index} dangerouslySetInnerHTML={{ __html: paragraph }} />
                            ))}
                            <a href={featureInfo.cta.href} style={{ color: 'inherit', textDecoration: 'underline' }}>
                                {featureInfo.cta.label}
                            </a>
                        </div>
                    ) : (
                        <div>
                            {PLAN_DISPLAY_TEXTS.FEATURE_HIGHLIGHT_MESSAGE} <b>{featureInfo.title}</b>.
                        </div>
                    )}
                </FeatureAlert>
            )}
            <Card className={classes.card}>
                <CardHeader color="primary">
                    <h4 className={classes.cardTitleWhite}>
                        {PLAN_DISPLAY_TEXTS.PLAN_SELECTION_TITLE}
                    </h4>
                    <p className={classes.cardCategoryWhite}>
                        {PLAN_DISPLAY_TEXTS.PLAN_SELECTION_DESCRIPTION}
                    </p>
                </CardHeader>
                <CardBody>
                    <GridContainer>
                        {plans
                            .filter((plan) =>
                                isSubscriptionActive
                                    ? plan._id !== configDetail?.plan?._id
                                    : true
                            )
                            .map((plan) => (
                                <GridItem xs={12} sm={6} md={4} key={plan._id}>
                                    <Card className={highlightPlans.includes(plan._id) ? `${classes.card} ${classes.planGlow}` : classes.card}>
                                        <CardHeader className={classes.planCardHeaderGray}>
                                            <h4 className={classes.planTitleDark}>
                                                {plan.name}
                                            </h4>
                                            {plan.description && (
                                                <div className={classes.planDescription}>{plan.description}</div>
                                            )}
                                            <div style={{ marginTop: 8, marginBottom: 2 }}>
                                                <span className={classes.planPriceBig}>
                                                    ${formatNumber(plan.price.toFixed(1))}
                                                </span>
                                                {plan.billingCycle && (
                                                    <span className={classes.planBillingCycle}>
                                                        {formatBillingCycle(plan.billingCycle)}
                                                    </span>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardBody>
                                            <PlanFeaturesList features={plan.features} />
                                            <Button
                                                type="button"
                                                variant="contained"
                                                color="primary"
                                                disabled={false}
                                                loading={false}
                                                className={`${classes.button} ${classes.planButton}`}
                                                onClick={() => {
                                                    // Determinar el tipo de cambio de plan
                                                    const currentPlan = configDetail?.plan;
                                                    let changeType = 'NEW_PLAN'; // Por defecto es nuevo plan
                                                    
                                                    if (currentPlan) {
                                                        if (plan._id === currentPlan._id) {
                                                            changeType = 'SAME_PLAN';
                                                        } else {
                                                            // Mejorar lógica de clasificación considerando planes gratuitos
                                                            const currentIsFree = isFreePlan(currentPlan);
                                                            const newIsFree = isFreePlan(plan);
                                                            
                                                            if (currentIsFree && !newIsFree) {
                                                                changeType = 'UPGRADE'; // De gratuito a pago
                                                            } else if (!currentIsFree && newIsFree) {
                                                                changeType = 'DOWNGRADE'; // De pago a gratuito
                                                            } else if (!currentIsFree && !newIsFree) {
                                                                // Ambos son de pago, comparar precios
                                                                if (plan.price > currentPlan.price) {
                                                                    changeType = 'UPGRADE';
                                                                } else if (plan.price < currentPlan.price) {
                                                                    changeType = 'DOWNGRADE';
                                                                }
                                                            }
                                                            // Si ambos son gratuitos, mantener como NEW_PLAN
                                                        }
                                                    }

                                                    console.log('Tipo de cambio:', changeType);

                                                    // Si es el mismo plan, no hacer nada
                                                    if (changeType === 'SAME_PLAN') {
                                                        console.log('Mismo plan, no mostrar modal');
                                                        return;
                                                    }

                                                    // Si es un plan diferente o nuevo, mostrar modal de comparación
                                                    console.log('Plan diferente o nuevo, mostrando modal de comparación');
                                                    setSelectedPlan(plan);
                                                    setShowComparisonModal(true);
                                                }}
                                            >
                                                {PLAN_DISPLAY_TEXTS.SELECT_BUTTON_PREFIX} {plan.name}
                                            </Button>
                                        </CardBody>
                                    </Card>
                                </GridItem>
                            ))}
                    </GridContainer>
                    <div className={classes.continueButtonContainer}>
                        <Button
                            type="button"
                            variant="contained"
                            color="primary"
                            disabled={false}
                            loading={false}
                            className={classes.button}
                            onClick={() => setViewMode(VIEW_MODE_KEYS.SUBSCRIPTION_DETAILS)}
                        >
                            {PLAN_DISPLAY_TEXTS.CONTINUE_BUTTON}
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </>
    );
};

PlanSelection.propTypes = {
    setViewMode: PropTypes.func.isRequired,
    isSubscriptionActive: PropTypes.bool,
    setSelectedPlan: PropTypes.func.isRequired,
    setShowComparisonModal: PropTypes.func.isRequired
};

export default PlanSelection;
