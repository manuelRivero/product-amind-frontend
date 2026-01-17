// src/pages/admin/MercadoPagoConnect.jsx

import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { useDispatch, useSelector } from 'react-redux'

import {
    PaymentPending,
    PaymentPaused,
    PaymentCancelled,
    SubscriptionDetails,
    PaymentAuthorized,
    PlanSelection,
    MarketplaceConnection
} from './ActivationComponents'
import PaymentForm from '../../components/PaymentForm'
import { getConfigRequest, cancelSubscriptionRequest, pauseSubscriptionRequest, resumeSubscriptionRequest } from '../../store/config'
import { ACTION_TYPES } from '../const'
import PlanComparisonModal from '../../components/PlanComparisonModal'
import ProductSelectionModal from '../../components/ProductSelectionModal'
import CategorySelectionModal from '../../components/CategorySelectionModal'
import { useActivationStatus } from './hooks/useActivationStatus'
import { useConfirmation } from './hooks/useConfirmation'
import { getViewMode } from './activationUtils'
import {
    ACTIVATION_ERROR_TYPES,
    ACTIVATION_SUPPORT_MESSAGE,
    MODAL_KEYS,
    VIEW_MODE_KEYS
} from './activationConstants'
import ConfirmActionModal from './ActivationComponents/ConfirmActionModal'
import ActivationErrorModal from './ActivationComponents/ActivationErrorModal'

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
    modalSupport: {
        color: theme.palette.text.secondary,
        fontSize: '0.875rem',
        marginTop: theme.spacing(1.5),
    },
}))

const Activation = () => {
    const classes = useStyles()
    const location = useLocation()
    const { configDetail } = useSelector((state) => state.config)
    const dispatch = useDispatch()
    const mpSubscriptionId = configDetail?.mpSubscriptionId
    const { viewState, meta } = useActivationStatus(configDetail)
    const validMPToken = meta.tokenValid

    const [viewMode, setViewMode] = React.useState(getViewMode({ viewState, meta, validMPToken }));
    const [selectedPlan, setSelectedPlan] = React.useState(null)
    const [confirmAction, setConfirmAction] = React.useState(null)
    const [activeModal, setActiveModal] = React.useState(MODAL_KEYS.NONE)
    const [errorInfo, setErrorInfo] = React.useState({ type: null, message: '' })

    const [selectedProductForPlanChange, setSelectedProductForPlanChange] = useState(null)
    const [selectedCategoryForPlanChange, setSelectedCategoryForPlanChange] = useState(null)
    const [showCardForm, setShowCardForm] = useState(false)

    // Nota: sin canal push desde backend, evitamos recalcular viewMode
    

    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const feature = params.get('feature')
        if (feature) {
            setViewMode(VIEW_MODE_KEYS.PLAN_SELECTION)
        }
    }, [location.search])

    const openErrorModal = (type, error) => {
        setErrorInfo({
            type,
            message: error?.message || ''
        })
        setConfirmAction(null)
        setActiveModal(MODAL_KEYS.ERROR_FEEDBACK)
    }

    const handleCloseErrorModal = () => {
        setActiveModal(MODAL_KEYS.NONE)
        setErrorInfo({ type: null, message: '' })
    }

    const handleCancelSubscription = async () => {
        if (!mpSubscriptionId) {
            console.error('No hay suscripción para cancelar')
            return
        }
        try {
            await dispatch(cancelSubscriptionRequest(mpSubscriptionId))
            setActiveModal(MODAL_KEYS.NONE)
            setConfirmAction(null)
        } catch (error) {
            console.error('Error al cancelar la suscripción:', error)
            openErrorModal(ACTIVATION_ERROR_TYPES.CANCEL_SUBSCRIPTION, error)
        }
    }

    const handlePauseSubscription = async () => {
        if (!mpSubscriptionId) {
            console.error('No hay suscripción para pausar')
            return
        }
        try {
            await dispatch(pauseSubscriptionRequest(mpSubscriptionId))
            setActiveModal(MODAL_KEYS.NONE)
            setConfirmAction(null)
            dispatch(getConfigRequest()) // Refrescar la configuración tras pausar
        } catch (error) {
            console.error('Error al pausar la suscripción:', error)
            openErrorModal(ACTIVATION_ERROR_TYPES.PAUSE_SUBSCRIPTION, error)
        }
    }

    const handleResumeSubscription = async () => {
        if (!mpSubscriptionId) {
            console.error('No hay suscripción para reactivar')
            return
        }
        try {
            await dispatch(resumeSubscriptionRequest(mpSubscriptionId))
            setActiveModal(MODAL_KEYS.NONE)
            setConfirmAction(null)
            dispatch(getConfigRequest()) // Refrescar la configuración tras reactivar
        } catch (error) {
            console.error('Error al reactivar la suscripción:', error)
            openErrorModal(ACTIVATION_ERROR_TYPES.RESUME_SUBSCRIPTION, error)
        }
    }

    const handlePaymentSuccess = () => {
        dispatch(getConfigRequest())
        setSelectedPlan(null)
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
                setActiveModal(MODAL_KEYS.PRODUCT_SELECTION);
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
                setActiveModal(MODAL_KEYS.CATEGORY_SELECTION)
            } else {
                setActiveModal(MODAL_KEYS.NONE)
                setViewMode(VIEW_MODE_KEYS.PAYMENT_FORM)
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
                setActiveModal(MODAL_KEYS.CATEGORY_SELECTION)
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
            setViewMode(VIEW_MODE_KEYS.PAYMENT_FORM)
            setActiveModal(MODAL_KEYS.NONE)

        } catch (error) {
            console.error('Error en handleCategorySelectionConfirm:', error);
        }
    }

    const handleConfirmAction = (action) => {
        setConfirmAction(action)
        setActiveModal(MODAL_KEYS.CONFIRM_ACTION)
    }

    const {
        modalConfig,
        confirmDisabled,
        confirmLoading,
        cancelDisabled,
        handleClose
    } = useConfirmation({
        confirmAction,
        selectedPlan,
        setActiveModal
    })

    const handleChangePlanAction = () => {
        console.log('Cambiando de plan')
        setViewMode(VIEW_MODE_KEYS.PLAN_SELECTION)
        setActiveModal(MODAL_KEYS.NONE)
    }

    const handleInitialChangePlanAction = () => {
        console.log('Cambiando de plan inicial')
        setActiveModal(MODAL_KEYS.NONE)
        setConfirmAction(null)
        setViewMode(VIEW_MODE_KEYS.PLAN_SELECTION)
    }

    const actionHandlers = {
        [ACTION_TYPES.CANCEL]: handleCancelSubscription,
        [ACTION_TYPES.PAUSE]: handlePauseSubscription,
        [ACTION_TYPES.RESUME]: handleResumeSubscription,
        [ACTION_TYPES.CHANGE_PLAN]: handleChangePlanAction,
        [ACTION_TYPES.CHANGE_PLAN_INITIAL]: handleInitialChangePlanAction
    }

    const executeAction = () => {
        const handler = actionHandlers[confirmAction]
        if (handler) {
            handler()
        }
    }


    const renderContent = () => {
        switch (viewMode) {
            case VIEW_MODE_KEYS.PAYMENT_PENDING:
                return <PaymentPending />;

            case VIEW_MODE_KEYS.PAYMENT_PAUSED:
                return (
                    <PaymentPaused
                        handleConfirmAction={handleConfirmAction}
                    />
                );

            case VIEW_MODE_KEYS.PAYMENT_CANCELLED:
                return <PaymentCancelled />;

            case VIEW_MODE_KEYS.SUBSCRIPTION_DETAILS:
                return (
                    <SubscriptionDetails
                        handleConfirmAction={handleConfirmAction}
                    />
                );

            case VIEW_MODE_KEYS.PAYMENT_AUTHORIZED:
                return <PaymentAuthorized />;

            case VIEW_MODE_KEYS.PAYMENT_FORM:
                return (
                    <PaymentForm
                        showCardForm={showCardForm}
                        selectedPlan={selectedPlan}
                        selectedProductForPlanChange={selectedProductForPlanChange}
                        selectedCategoryForPlanChange={selectedCategoryForPlanChange}
                        resetPlan={() => setSelectedPlan(null)}
                        onSuccess={handlePaymentSuccess}
                        onCancel={() => {
                            setShowCardForm(false)
                            setSelectedPlan(null)
                            setViewMode(VIEW_MODE_KEYS.PLAN_SELECTION)
                        }}
                    />
                );

            case VIEW_MODE_KEYS.PLAN_SELECTION:
                return (
                    <PlanSelection
                        setViewMode={setViewMode}
                        setSelectedPlan={setSelectedPlan}
                        setShowComparisonModal={() => setActiveModal(MODAL_KEYS.PLAN_COMPARISON)}
                    />
                );

            case VIEW_MODE_KEYS.MARKETPLACE_CONNECTION:
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

            <ConfirmActionModal
                open={activeModal === MODAL_KEYS.CONFIRM_ACTION}
                onClose={handleClose}
                onConfirm={executeAction}
                config={modalConfig}
                classes={classes}
                confirmDisabled={confirmDisabled}
                confirmLoading={confirmLoading}
                cancelDisabled={cancelDisabled}
                supportMessage={ACTIVATION_SUPPORT_MESSAGE}
            />

            <ActivationErrorModal
                open={activeModal === MODAL_KEYS.ERROR_FEEDBACK}
                onClose={handleCloseErrorModal}
                errorType={errorInfo.type}
                errorMessage={errorInfo.message}
            />


            {/* Modal de comparación de planes */}
            <PlanComparisonModal
                open={activeModal === MODAL_KEYS.PLAN_COMPARISON}
                onClose={() => setActiveModal(MODAL_KEYS.NONE)}
                currentPlan={configDetail?.plan}
                newPlan={selectedPlan}
                supportMessage={ACTIVATION_SUPPORT_MESSAGE}
                onConfirm={() => {
                    setActiveModal(MODAL_KEYS.NONE);
                    // Proceder con el flujo normal de cambio de plan
                    handleChangePlan()
                }}
            />

            {configDetail && activeModal === MODAL_KEYS.PRODUCT_SELECTION && <ProductSelectionModal
                open
                onClose={() => setActiveModal(MODAL_KEYS.NONE)}
                newPlan={selectedPlan}
                onConfirm={handleProductSelectionConfirm}
                supportMessage={ACTIVATION_SUPPORT_MESSAGE}
            />}

            {configDetail && activeModal === MODAL_KEYS.CATEGORY_SELECTION && <CategorySelectionModal
                open
                onClose={() => setActiveModal(MODAL_KEYS.NONE)}
                newPlan={selectedPlan}
                onConfirm={handleCategorySelectionConfirm}
                supportMessage={ACTIVATION_SUPPORT_MESSAGE}
            />}
        </>
    )
}

export default Activation
