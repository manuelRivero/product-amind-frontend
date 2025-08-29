import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import PaymentForm from 'components/PaymentForm';
import { getConfigRequest } from '../../../../store/config';

const PaymentFormWrapper = ({ 
    showCardForm,
    selectedPlan,
    selectedProductForPlanChange,
    selectedCategoryForPlanChange,
    setSelectedPlan
}) => {
    const dispatch = useDispatch();

    const handlePaymentSuccess = () => {
        // Después de un pago exitoso, refrescar la configuración
        // para que el componente padre determine automáticamente el estado correcto
        dispatch(getConfigRequest());
        
        // Resetear el plan seleccionado
        setSelectedPlan(null);
    };

    return (
        <PaymentForm
            showCardForm={showCardForm}
            selectedPlan={selectedPlan}
            selectedProductForPlanChange={selectedProductForPlanChange}
            selectedCategoryForPlanChange={selectedCategoryForPlanChange}
            resetPlan={() => setSelectedPlan(null)}
            onSuccess={handlePaymentSuccess}
        />
    );
};

PaymentFormWrapper.propTypes = {
    showCardForm: PropTypes.bool,
    selectedPlan: PropTypes.object,
    selectedProductForPlanChange: PropTypes.object,
    selectedCategoryForPlanChange: PropTypes.object,
    setSelectedPlan: PropTypes.func.isRequired
};

export default PaymentFormWrapper;
