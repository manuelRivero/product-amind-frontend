import { ACTIVATION_VIEW_STATES, VIEW_MODE_KEYS } from './activationConstants';

export const getViewMode = ({ viewState, meta, validMPToken }) => {
    if (!validMPToken) {
        return VIEW_MODE_KEYS.MARKETPLACE_CONNECTION;
    }

    if (!meta?.hasPlan) {
        return VIEW_MODE_KEYS.PLAN_SELECTION;
    }

    if (meta?.isFreePlan) {
        return VIEW_MODE_KEYS.SUBSCRIPTION_DETAILS;
    }

    if (!meta?.hasSubscription) {
        return VIEW_MODE_KEYS.PLAN_SELECTION;
    }

    switch (viewState) {
        case ACTIVATION_VIEW_STATES.CANCELLED:
            return VIEW_MODE_KEYS.PAYMENT_CANCELLED;
        case ACTIVATION_VIEW_STATES.PAUSED:
            return VIEW_MODE_KEYS.PAYMENT_PAUSED;
        case ACTIVATION_VIEW_STATES.PENDING:
            return VIEW_MODE_KEYS.PAYMENT_PENDING;
        case ACTIVATION_VIEW_STATES.AUTHORIZED:
            return VIEW_MODE_KEYS.PAYMENT_AUTHORIZED;
        case ACTIVATION_VIEW_STATES.ACTIVE:
        default:
            return VIEW_MODE_KEYS.SUBSCRIPTION_DETAILS;
    }
};
