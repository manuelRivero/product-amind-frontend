// src/pages/admin/MercadoPagoConnect.jsx

import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
    Dialog,
    DialogActions,
    DialogTitle,
} from '@material-ui/core'
import Button from 'components/CustomButtons/Button'

import { makeStyles } from '@material-ui/core/styles'
import { useDispatch, useSelector } from 'react-redux'

import LoadinScreen from '../../components/LoadingScreen'
import {
    PaymentPending,
    PaymentPaused,
    PaymentCancelled,
    SubscriptionDetails,
    PaymentAuthorized,
    PaymentFormWrapper,
    PlanSelection,
    MarketplaceConnection
} from './ActivationComponents'
import { getPlans } from '../../api/plans'
import moment from 'moment'
import { getConfigRequest, cancelSubscriptionRequest, pauseSubscriptionRequest, resumeSubscriptionRequest } from '../../store/config'
import { SUBSCRIPTION_MESSAGES, ACTION_TYPES, PLAN_CHANGE_MESSAGES, UNAVAILABLE_FEATURE_FALLBACK } from '../const'
import PlanComparisonModal from '../../components/PlanComparisonModal'
import ProductSelectionModal from '../../components/ProductSelectionModal'
import CategorySelectionModal from '../../components/CategorySelectionModal'
import { PLAN_DISPLAY_TEXTS } from '../helpers'

const useStyles = makeStyles((theme) => ({
    // Modal
    modalContent: {
        padding: '0 24px 24px 24px',
    },
    modalDescription: {
        marginBottom: theme.spacing(2),
        fontWeight: 'bold',
    },
    modalList: {
        marginBottom: theme.spacing(2),
        paddingLeft: theme.spacing(2.5),
    },
    modalListItem: {
        marginBottom: theme.spacing(1),
    },
    modalWarning: {
        marginBottom: theme.spacing(2),
        padding: theme.spacing(1.5),
        borderRadius: theme.spacing(0.5),
        fontSize: '14px',
    },
    modalWarningSuccess: {
        backgroundColor: '#e8f5e8',
        border: '1px solid #4caf50',
    },
    modalWarningWarning: {
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
    },
}))

const Activation = () => {
    const { configDetail, loadingCancelSubscription, loadingPauseSubscription } = useSelector((state) => state.config)
    const dispatch = useDispatch()

    // validación de conexión con mercado pago
    const mercadoPagoMarketplaceAccessToken = configDetail?.mercadoPagoMarketplaceAccessToken
    const mercadoPagoMarketplaceTokenExpiresAt = moment(configDetail?.mercadoPagoMarketplaceTokenExpiresAt).isAfter(moment())

    // Nueva lógica de validación de estados de suscripción
    const mpSubscriptionId = configDetail?.mpSubscriptionId
    const paymentStatus = configDetail?.paymentStatus
    const preapprovalStatus = configDetail?.preapprovalStatus
    const plan = configDetail?.plan
    
    // Tomar el último status de userActionHistory (ordenado por fecha ascendente)
    const lastStatusObj = Array.isArray(configDetail?.userActionHistory) && configDetail.userActionHistory.length > 0
        ? configDetail.userActionHistory[configDetail.userActionHistory.length - 1]
        : null;
    const lastStatus = lastStatusObj?.action;
    const lastPauseDate = lastStatusObj && lastStatusObj.status === 'paused' ? lastStatusObj.date : null;
    const lastCancelDate = lastStatusObj && lastStatusObj.status === 'cancelled' ? lastStatusObj.date : null;

    // Flags de estado - actualizados para manejar tiendas sin plan
    const hasPlan = plan !== null && plan !== undefined;
    const hasSubscription = mpSubscriptionId !== null && mpSubscriptionId !== undefined;
    
    // Estados de pago corregidos
    const isPaymentApproved = hasPlan && hasSubscription && (preapprovalStatus === 'approved' && paymentStatus === 'approved');
    const isPaymentAuthorized = hasPlan && hasSubscription && (preapprovalStatus === 'authorized' && paymentStatus === 'authorized');
    const isPaymentPending = hasPlan && hasSubscription && (preapprovalStatus === 'authorized' && paymentStatus === 'pending');
    const isPaymentPaused = hasPlan && hasSubscription && (preapprovalStatus === 'paused' || paymentStatus === 'paused' || lastStatus === 'paused');
    const isPaymentCancelled = hasPlan && hasSubscription && (preapprovalStatus === 'cancelled' || paymentStatus === 'cancelled' || lastStatus === 'cancelled');
    
    // Suscripción activa solo cuando está aprobada
    const isSubscriptionActive = hasPlan && hasSubscription && isPaymentApproved && !isPaymentCancelled;

    // Función para determinar el modo de vista
    const getViewMode = () => {
        if (mercadoPagoMarketplaceAccessToken && mercadoPagoMarketplaceTokenExpiresAt) return 'marketplace-connection';
        // Si no hay plan configurado, mostrar selección de plan
        if (!hasPlan) return 'plan-selection';
        
        // Si hay plan pero no hay suscripción, mostrar selección de plan
        if (!hasSubscription) return 'plan-selection';
        
        if (isPaymentCancelled) return 'payment-cancelled';
        if (isPaymentPaused) return 'payment-paused';
        if (isPaymentPending) return 'payment-pending';
        if (isPaymentAuthorized) return 'payment-authorized';
        if (isPaymentApproved) return 'subscription-details';
        return 'subscription-details';
    };

    const [viewMode, setViewMode] = React.useState(getViewMode());

    // Actualizar viewMode cuando cambian los flags
    React.useEffect(() => {
        setViewMode(getViewMode());
    }, [hasPlan, hasSubscription, isPaymentApproved, isPaymentAuthorized, isPaymentPending, isPaymentPaused, isPaymentCancelled, isSubscriptionActive]);

    const [loadingPlans, setLoadingPlans] = React.useState(false)
    const [plans, setPlans] = React.useState([])

    const [selectedPlan, setSelectedPlan] = React.useState(null)
    const [showConfirmModal, setShowConfirmModal] = React.useState(false)
    const [confirmAction, setConfirmAction] = React.useState(null)
    const [showComparisonModal, setShowComparisonModal] = React.useState(false)
    const [showProductSelectionModal, setShowProductSelectionModal] = React.useState(false)
    const [showCategorySelectionModal, setShowCategorySelectionModal] = React.useState(false)
    const classes = useStyles()

    const location = useLocation()
    const [featureParam, setFeatureParam] = useState(null)
    const [highlightPlans, setHighlightPlans] = useState([])
    const [featureInfo, setFeatureInfo] = useState(null)
    const [selectedProductForPlanChange, setSelectedProductForPlanChange] = useState(null)
    const [selectedCategoryForPlanChange, setSelectedCategoryForPlanChange] = useState(null)
    const [showCardForm, setShowCardForm] = useState(false)

    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const feature = params.get('feature')
        if (feature) {
            setFeatureParam(feature)
            setViewMode('plan-selection')
        }
    }, [location.search])


    const handleCancelSubscription = async () => {
        if (!mpSubscriptionId) {
            console.error('No hay suscripción para cancelar')
            return
        }
        try {
            await dispatch(cancelSubscriptionRequest(mpSubscriptionId))
            setShowConfirmModal(false)
            setConfirmAction(null)
        } catch (error) {
            console.error('Error al cancelar la suscripción:', error)
        }
    }

    const handlePauseSubscription = async () => {
        if (!mpSubscriptionId) {
            console.error('No hay suscripción para pausar')
            return
        }
        try {
            await dispatch(pauseSubscriptionRequest(mpSubscriptionId))
            setShowConfirmModal(false)
            setConfirmAction(null)
            dispatch(getConfigRequest()) // Refrescar la configuración tras pausar
        } catch (error) {
            console.error('Error al pausar la suscripción:', error)
        }
    }

    const handleResumeSubscription = async () => {
        if (!mpSubscriptionId) {
            console.error('No hay suscripción para reactivar')
            return
        }
        try {
            await dispatch(resumeSubscriptionRequest(mpSubscriptionId))
            setShowConfirmModal(false)
            setConfirmAction(null)
            dispatch(getConfigRequest()) // Refrescar la configuración tras reactivar
        } catch (error) {
            console.error('Error al reactivar la suscripción:', error)
        }
    }

    const handleChangePlan = async () => {
        try {
            console.log('Ejecutando handleChangePlan');
            console.log('Cambiando a plan:', selectedPlan)

            // Verificar si el nuevo plan tiene límite de productos menor
            const currentPlan = configDetail?.plan;
            const currentProductLimit = currentPlan?.features?.createProducts?.limits?.maxProducts || Infinity;
            const newProductLimit = selectedPlan?.features?.createProducts?.limits?.maxProducts || Infinity;

            console.log('Límites de productos:');
            console.log('- Plan actual:', currentPlan?.name || 'Sin plan', 'Límite:', currentProductLimit);
            console.log('- Plan nuevo:', selectedPlan?.name, 'Límite:', newProductLimit);
            console.log('- Estructura del plan nuevo:', selectedPlan);
            console.log('- Features del plan nuevo:', selectedPlan?.features);
            console.log('- ¿Nuevo límite es menor?', newProductLimit !== Infinity && newProductLimit < currentProductLimit);

            // Si el nuevo plan tiene límite menor, obtener productos y mostrar modal de selección
            if (newProductLimit !== Infinity && newProductLimit < currentProductLimit) {
                console.log('Límite menor detectado, obteniendo productos...');
                setShowProductSelectionModal(true);
                setShowConfirmModal(false);
            } else {
                console.log('No hay límite menor, procediendo con cambio directo');
                await proceedWithPlanChange();
            }

            // Si no hay límite menor o no hay productos que excedan el límite, proceder con el cambio

        } catch (error) {
            console.error('Error en handleChangePlan:', error);
        }
    }

    const proceedWithPlanChange = async () => {
        try {

            const currentPlan = configDetail?.plan;
            const currentCategorieLimit = currentPlan?.features?.createCategories?.limits?.maxCategories || Infinity;
            const newCategoriesLimit = selectedPlan?.features?.createCategories?.limits?.maxCategories || Infinity;
            console.log("limit", currentCategorieLimit > newCategoriesLimit)
            if (currentCategorieLimit > newCategoriesLimit) {
                setShowProductSelectionModal(false)
                setShowCategorySelectionModal(true)
            } else {
                setShowConfirmModal(false)
                setViewMode('payment-form')
                setShowCardForm(true)
            }



        } catch (error) {
            console.error('Error en proceedWithPlanChange:', error);
        }
    }

    const handleProductSelectionConfirm = async (selectionData) => {
        try {
            setSelectedProductForPlanChange(selectionData)
            const currentPlan = configDetail?.plan;
            const currentCategorieLimit = currentPlan?.features?.createCategories?.limits?.maxCategories || Infinity;
            const newCategoriesLimit = selectedPlan?.features?.createCategories?.limits?.maxCategories || Infinity;
            console.log("limit", currentCategorieLimit > newCategoriesLimit)
            if (currentCategorieLimit > newCategoriesLimit) {
                setShowProductSelectionModal(false)
                setShowCategorySelectionModal(true)
            }

        } catch (error) {
            console.error('Error en handleProductSelectionConfirm:', error);
        }
    }

    const handleCategorySelectionConfirm = async (selectionData) => {
        try {
            setSelectedCategoryForPlanChange(selectionData)
            console.log('Categorías seleccionados:', selectionData);
            setShowCardForm(true)
            setViewMode('payment-form')
            setShowCategorySelectionModal(false)

        } catch (error) {
            console.error('Error en handleCategorySelectionConfirm:', error);
        }
    }

    const handleConfirmAction = (action) => {
        setConfirmAction(action)
        setShowConfirmModal(true)
    }

    const executeAction = () => {
        if (confirmAction === ACTION_TYPES.CANCEL) {
            handleCancelSubscription()
        } else if (confirmAction === ACTION_TYPES.PAUSE) {
            handlePauseSubscription()
        } else if (confirmAction === ACTION_TYPES.CHANGE_PLAN) {
            console.log('Cambiando de plan')
            setViewMode('plan-selection')
            setShowConfirmModal(false)
        } else if (confirmAction === ACTION_TYPES.CHANGE_PLAN_INITIAL) {
            console.log('Cambiando de plan inicial')

            setShowConfirmModal(false)
            setConfirmAction(null)
            setViewMode('payment-form')
        } else if (confirmAction === ACTION_TYPES.RESUME) {
            handleResumeSubscription()
        }
    }



    useEffect(() => {
        const getData = async () => {
            try {
                setLoadingPlans(true)
                const response = await getPlans({searchAvailable: true })
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
        if (featureParam && plans.length > 0) {
            // Función helper para verificar si un plan tiene una feature habilitada
            const planHasFeature = (plan, featureKey) => {
                if (!plan.features || !Array.isArray(plan.features)) {
                    return false
                }
                
                const feature = plan.features.find(f => f.feature?.name === featureKey)
                return feature?.enabled === true
            }
            
            const plansWithFeature = plans.filter(plan => planHasFeature(plan, featureParam))
            setHighlightPlans(plansWithFeature.map(p => p._id))

            if (plansWithFeature.length > 0) {
                // Tomar info de la feature (title, description)
                const featureData = plansWithFeature[0].features.find(f => f.feature?.name === featureParam)
                setFeatureInfo(featureData?.feature || featureData)
            } else {
                // Ningún plan tiene la feature habilitada, usar fallback
                setFeatureInfo(UNAVAILABLE_FEATURE_FALLBACK)
            }
        }
    }, [featureParam, plans])


const getNextPaymentDate = () => {
    // Validar que configDetail y rawData existan
    if (!configDetail?.rawData?.auto_recurring) {
        return null
    }

    const frequencyType = configDetail.rawData.auto_recurring.frequency_type
    const frequencyInterval = configDetail.rawData.auto_recurring.frequency
    const startDate = configDetail.rawData.auto_recurring.start_date

    if (frequencyType === 'days') {
        return moment(startDate).add(frequencyInterval, 'days').format('DD/MM/YYYY')
    } else if (frequencyType === 'weeks') {
        return moment(startDate).add(frequencyInterval, 'weeks').format('DD/MM/YYYY')
    } else if (frequencyType === 'months') {
        return moment(startDate).add(frequencyInterval, 'months').format('DD/MM/YYYY')
    }
    
    return null
}
console.log('configDetail.rawData.next_payment_date', configDetail?.rawData?.auto_recurring?.frequency_type)

    if (loadingPlans) {
        return <LoadinScreen />
    }
    const renderContent = () => {
        switch (viewMode) {
            case 'payment-pending':
                return <PaymentPending />;

            case 'payment-paused':
                return (
                    <PaymentPaused
                        configDetail={configDetail}
                        lastPauseDate={lastPauseDate}
                        loadingCancelSubscription={loadingCancelSubscription}
                        handleConfirmAction={handleConfirmAction}
                        ACTION_TYPES={ACTION_TYPES}
                        hasSubscription={hasSubscription}
                    />
                );

            case 'payment-cancelled':
                return (
                    <PaymentCancelled
                        configDetail={configDetail}
                        lastCancelDate={lastCancelDate}
                        hasSubscription={hasSubscription}
                    />
                );

            case 'subscription-details':
                return (
                    <SubscriptionDetails
                        configDetail={configDetail}
                        loadingCancelSubscription={loadingCancelSubscription}
                        loadingPauseSubscription={loadingPauseSubscription}
                        handleConfirmAction={handleConfirmAction}
                        ACTION_TYPES={ACTION_TYPES}
                        getNextPaymentDate={getNextPaymentDate}
                        hasSubscription={hasSubscription}
                    />
                );

            case 'payment-authorized':
                return (
                    <PaymentAuthorized
                        configDetail={configDetail}
                        hasSubscription={hasSubscription}
                    />
                );

            case 'payment-form':
                return (
                    <PaymentFormWrapper
                        showCardForm={showCardForm}
                        selectedPlan={selectedPlan}
                        selectedProductForPlanChange={selectedProductForPlanChange}
                        selectedCategoryForPlanChange={selectedCategoryForPlanChange}
                        setSelectedPlan={setSelectedPlan}
                        setViewMode={setViewMode}
                    />
                );

            case 'plan-selection':
                return (
                    <PlanSelection
                        hasPlan={hasPlan}
                        setViewMode={setViewMode}
                        featureParam={featureParam}
                        featureInfo={featureInfo}
                        UNAVAILABLE_FEATURE_FALLBACK={UNAVAILABLE_FEATURE_FALLBACK}
                        plans={plans}
                        isSubscriptionActive={isSubscriptionActive}
                        configDetail={configDetail}
                        highlightPlans={highlightPlans}
                        setSelectedPlan={setSelectedPlan}
                        setShowComparisonModal={setShowComparisonModal}
                        PLAN_DISPLAY_TEXTS={PLAN_DISPLAY_TEXTS}
                    />
                );

            case 'marketplace-connection':
                return (
                    <MarketplaceConnection />
                );

            default:
                return null;
        }
    };

    return (
        <>

            {renderContent()}

            <Dialog open={showConfirmModal} onClose={
                loadingCancelSubscription || loadingPauseSubscription ? undefined : () => setShowConfirmModal(false)
            } maxWidth="sm" fullWidth>
                {console.log('Modal abierto:', showConfirmModal, 'Acción:', confirmAction)}
                <DialogTitle>
                    {confirmAction === ACTION_TYPES.CANCEL
                        ? SUBSCRIPTION_MESSAGES.CANCEL.title
                        : confirmAction === ACTION_TYPES.PAUSE
                            ? SUBSCRIPTION_MESSAGES.PAUSE.title
                            : confirmAction === ACTION_TYPES.CHANGE_PLAN_INITIAL
                                ? PLAN_CHANGE_MESSAGES.INITIAL.title
                                                                    : confirmAction === ACTION_TYPES.CHANGE_PLAN
                                        ? (() => {
                                            const currentPlan = configDetail?.plan;
                                            const selectedPlanData = selectedPlan;

                                            if (currentPlan && selectedPlanData) {
                                                if (selectedPlanData.price > currentPlan.price) {
                                                    return PLAN_CHANGE_MESSAGES.UPGRADE.title;
                                                } else if (selectedPlanData.price < currentPlan.price) {
                                                    return PLAN_CHANGE_MESSAGES.DOWNGRADE.title;
                                                } else {
                                                    return PLAN_CHANGE_MESSAGES.SAME_PLAN.title;
                                                }
                                            }
                                            return 'Seleccionar plan';
                                        })()
                                    : confirmAction === ACTION_TYPES.RESUME
                                        ? SUBSCRIPTION_MESSAGES.RESUME.title
                                        : 'Confirmar acción'
                    }
                </DialogTitle>
                <div className={classes.modalContent}>
                    {confirmAction === ACTION_TYPES.CHANGE_PLAN ? (
                        <>
                            <p className={classes.modalDescription}>
                                {PLAN_CHANGE_MESSAGES.INITIAL.description}
                            </p>
                            <ul className={classes.modalList}>
                                {PLAN_CHANGE_MESSAGES.INITIAL.benefits.map((benefit, index) => (
                                    <li key={index} className={classes.modalListItem}>
                                        {benefit}
                                    </li>
                                ))}
                            </ul>
                            <p className={`${classes.modalWarning} ${classes.modalWarningSuccess}`}>
                                {PLAN_CHANGE_MESSAGES.INITIAL.warning}
                            </p>
                        </>
                    ) : confirmAction === ACTION_TYPES.RESUME ? (
                        <>
                            <p className={classes.modalDescription}>
                                {SUBSCRIPTION_MESSAGES.RESUME.description}
                            </p>
                            <ul className={classes.modalList}>
                                {SUBSCRIPTION_MESSAGES.RESUME.benefits.map((benefit, index) => (
                                    <li key={index} className={classes.modalListItem}>
                                        {benefit}
                                    </li>
                                ))}
                            </ul>
                            <p className={`${classes.modalWarning} ${classes.modalWarningSuccess}`}>
                                {SUBSCRIPTION_MESSAGES.RESUME.warning}
                            </p>
                        </>
                    ) : (
                        <>
                            <p className={classes.modalDescription}>
                                {confirmAction === ACTION_TYPES.CANCEL
                                    ? SUBSCRIPTION_MESSAGES.CANCEL.description
                                    : SUBSCRIPTION_MESSAGES.PAUSE.description
                                }
                            </p>
                            <ul className={classes.modalList}>
                                {(confirmAction === ACTION_TYPES.CANCEL
                                    ? SUBSCRIPTION_MESSAGES.CANCEL.consequences
                                    : SUBSCRIPTION_MESSAGES.PAUSE.consequences
                                ).map((consequence, index) => (
                                    <li key={index} className={classes.modalListItem}>
                                        {consequence}
                                    </li>
                                ))}
                            </ul>
                            <p className={`${classes.modalWarning} ${classes.modalWarningWarning}`}>
                                {confirmAction === ACTION_TYPES.CANCEL
                                    ? SUBSCRIPTION_MESSAGES.CANCEL.warning
                                    : SUBSCRIPTION_MESSAGES.PAUSE.warning
                                }
                            </p>
                        </>
                    )}
                </div>
                <DialogActions>
                    <Button
                        onClick={() => setShowConfirmModal(false)}
                        color="transparent"
                        disabled={loadingCancelSubscription || loadingPauseSubscription}
                    >
                        {confirmAction === ACTION_TYPES.CANCEL
                            ? SUBSCRIPTION_MESSAGES.CANCEL.cancelText
                            : confirmAction === ACTION_TYPES.PAUSE
                                ? SUBSCRIPTION_MESSAGES.PAUSE.cancelText
                                : confirmAction === ACTION_TYPES.CHANGE_PLAN_INITIAL
                                    ? PLAN_CHANGE_MESSAGES.INITIAL.cancelText
                                    : confirmAction === ACTION_TYPES.CHANGE_PLAN
                                        ? (() => {
                                            const currentPlan = configDetail?.plan;
                                            const selectedPlanData = selectedPlan;

                                            if (currentPlan && selectedPlanData) {
                                                if (selectedPlanData.price > currentPlan.price) {
                                                    return PLAN_CHANGE_MESSAGES.UPGRADE.cancelText;
                                                } else if (selectedPlanData.price < currentPlan.price) {
                                                    return PLAN_CHANGE_MESSAGES.DOWNGRADE.cancelText;
                                                } else {
                                                    return PLAN_CHANGE_MESSAGES.SAME_PLAN.cancelText;
                                                }
                                            }
                                            return 'Cancelar';
                                        })()
                                        : confirmAction === ACTION_TYPES.RESUME
                                            ? SUBSCRIPTION_MESSAGES.RESUME.cancelText
                                            : 'Cancelar'
                        }
                    </Button>
                    <Button
                        onClick={executeAction}
                        color={confirmAction === ACTION_TYPES.CANCEL ? 'danger' : confirmAction === ACTION_TYPES.RESUME ? 'success' : 'primary'}
                        disabled={
                            (confirmAction === ACTION_TYPES.CANCEL && loadingCancelSubscription) ||
                            (confirmAction === ACTION_TYPES.PAUSE && loadingPauseSubscription) ||
                            (confirmAction === ACTION_TYPES.RESUME && loadingPauseSubscription) ||
                            (confirmAction === ACTION_TYPES.CHANGE_PLAN && loadingPauseSubscription) ||
                            (confirmAction === ACTION_TYPES.CHANGE_PLAN_INITIAL && loadingPauseSubscription)
                        }
                        loading={
                            (confirmAction === ACTION_TYPES.CANCEL && loadingCancelSubscription) ||
                            (confirmAction === ACTION_TYPES.PAUSE && loadingPauseSubscription) ||
                            (confirmAction === ACTION_TYPES.RESUME && loadingPauseSubscription) ||
                            (confirmAction === ACTION_TYPES.CHANGE_PLAN && loadingPauseSubscription) ||
                            (confirmAction === ACTION_TYPES.CHANGE_PLAN_INITIAL && loadingPauseSubscription)
                        }
                    >
                        {confirmAction === ACTION_TYPES.CANCEL
                            ? SUBSCRIPTION_MESSAGES.CANCEL.confirmText
                            : confirmAction === ACTION_TYPES.PAUSE
                                ? SUBSCRIPTION_MESSAGES.PAUSE.confirmText
                                : confirmAction === ACTION_TYPES.CHANGE_PLAN_INITIAL
                                    ? PLAN_CHANGE_MESSAGES.INITIAL.confirmText
                                    : confirmAction === ACTION_TYPES.CHANGE_PLAN
                                        ? PLAN_CHANGE_MESSAGES.INITIAL.confirmText
                                        : confirmAction === ACTION_TYPES.RESUME
                                            ? SUBSCRIPTION_MESSAGES.RESUME.confirmText
                                            : 'Confirmar'
                        }
                    </Button>
                </DialogActions>
            </Dialog>



            {/* Modal de comparación de planes */}
            <PlanComparisonModal
                open={showComparisonModal}
                onClose={() => setShowComparisonModal(false)}
                currentPlan={configDetail?.plan}
                newPlan={selectedPlan}
                onConfirm={() => {
                    setShowComparisonModal(false);
                    // Proceder con el flujo normal de cambio de plan
                    handleChangePlan()
                }}
            />

            {configDetail && showProductSelectionModal && <ProductSelectionModal
                open={showProductSelectionModal}
                onClose={() => setShowProductSelectionModal(false)}
                newPlan={selectedPlan}
                onConfirm={handleProductSelectionConfirm}
            />}

            {configDetail && showCategorySelectionModal && <CategorySelectionModal
                open={showCategorySelectionModal}
                onClose={() => showCategorySelectionModal(false)}
                newPlan={selectedPlan}
                onConfirm={handleCategorySelectionConfirm}
            />}
        </>
    )
}

export default Activation
