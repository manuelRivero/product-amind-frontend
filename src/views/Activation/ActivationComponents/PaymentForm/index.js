import React from 'react';
import PropTypes from 'prop-types';
import PaymentForm from 'components/PaymentForm';

const PaymentFormWrapper = ({ 
    showCardForm,
    selectedPlan,
    selectedProductForPlanChange,
    selectedCategoryForPlanChange,
    setSelectedPlan,
    setViewMode
}) => {
    return (
        <PaymentForm
            showCardForm={showCardForm}
            selectedPlan={selectedPlan}
            selectedProductForPlanChange={selectedProductForPlanChange}
            selectedCategoryForPlanChange={selectedCategoryForPlanChange}
            resetPlan={() => setSelectedPlan(null)}
            onViewModeChange={setViewMode}
        />
    );
};

PaymentFormWrapper.propTypes = {
    showCardForm: PropTypes.bool,
    selectedPlan: PropTypes.object,
    selectedProductForPlanChange: PropTypes.object,
    selectedCategoryForPlanChange: PropTypes.object,
    setSelectedPlan: PropTypes.func.isRequired,
    setViewMode: PropTypes.func.isRequired,
};

export default PaymentFormWrapper;
