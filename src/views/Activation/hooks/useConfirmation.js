import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ACTION_TYPES, PLAN_CHANGE_MESSAGES, SUBSCRIPTION_MESSAGES } from '../../const';
import { MODAL_KEYS } from '../activationConstants';
import { isFreePlan } from '../../../utils/planPermissions';

const getPlanChangeConfig = (currentPlan, selectedPlan) => {
    if (!currentPlan || !selectedPlan) {
        return PLAN_CHANGE_MESSAGES.INITIAL;
    }

    const currentIsFree = isFreePlan(currentPlan);
    const newIsFree = isFreePlan(selectedPlan);

    if (currentIsFree && !newIsFree) {
        return PLAN_CHANGE_MESSAGES.UPGRADE;
    }

    if (!currentIsFree && newIsFree) {
        return PLAN_CHANGE_MESSAGES.DOWNGRADE;
    }

    if (!currentIsFree && !newIsFree) {
        if (selectedPlan.price > currentPlan.price) {
            return PLAN_CHANGE_MESSAGES.UPGRADE;
        }
        if (selectedPlan.price < currentPlan.price) {
            return PLAN_CHANGE_MESSAGES.DOWNGRADE;
        }
    }

    return PLAN_CHANGE_MESSAGES.SAME_PLAN;
};

const normalizeConfig = (config, warningVariant = 'warning', confirmColor = 'primary') => {
    if (!config) {
        return null;
    }

    return {
        title: config.title,
        description: config.description || config.message || '',
        listItems: config.benefits || config.consequences || [],
        warning: config.warning || '',
        confirmText: config.confirmText || 'Confirmar',
        cancelText: config.cancelText || 'Cancelar',
        warningVariant,
        confirmColor,
    };
};

export const useConfirmation = ({ confirmAction, selectedPlan, setActiveModal }) => {
    const { configDetail, loadingCancelSubscription, loadingPauseSubscription } = useSelector((state) => state.config);

    const modalConfig = useMemo(() => {
        if (!confirmAction) {
            return null;
        }

        if (confirmAction === ACTION_TYPES.CANCEL) {
            return normalizeConfig(SUBSCRIPTION_MESSAGES.CANCEL, 'warning', 'danger');
        }

        if (confirmAction === ACTION_TYPES.PAUSE) {
            return normalizeConfig(SUBSCRIPTION_MESSAGES.PAUSE, 'warning', 'warning');
        }

        if (confirmAction === ACTION_TYPES.RESUME) {
            return normalizeConfig(SUBSCRIPTION_MESSAGES.RESUME, 'success', 'success');
        }

        if (confirmAction === ACTION_TYPES.CHANGE_PLAN_INITIAL) {
            return normalizeConfig(PLAN_CHANGE_MESSAGES.INITIAL, 'success', 'primary');
        }

        if (confirmAction === ACTION_TYPES.CHANGE_PLAN) {
            const config = getPlanChangeConfig(configDetail?.plan, selectedPlan);
            const variant = config === PLAN_CHANGE_MESSAGES.DOWNGRADE ? 'warning' : 'success';
            return normalizeConfig(config, variant, 'primary');
        }

        return null;
    }, [confirmAction, configDetail?.plan, selectedPlan]);

    const isPauseAction = [
        ACTION_TYPES.PAUSE,
        ACTION_TYPES.RESUME,
        ACTION_TYPES.CHANGE_PLAN,
        ACTION_TYPES.CHANGE_PLAN_INITIAL,
    ].includes(confirmAction);

    const confirmLoading = (confirmAction === ACTION_TYPES.CANCEL && loadingCancelSubscription)
        || (isPauseAction && loadingPauseSubscription);

    const confirmDisabled = confirmLoading;
    const cancelDisabled = confirmLoading;

    const handleClose = () => {
        setActiveModal(MODAL_KEYS.NONE);
    };

    return {
        modalConfig,
        confirmDisabled,
        confirmLoading,
        cancelDisabled,
        handleClose,
    };
};
