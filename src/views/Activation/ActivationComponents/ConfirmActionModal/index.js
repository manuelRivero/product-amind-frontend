import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogActions, DialogTitle } from '@material-ui/core';
import Button from 'components/CustomButtons/Button';

const ConfirmActionModal = ({
    open,
    onClose,
    onConfirm,
    config,
    classes,
    confirmDisabled,
    confirmLoading,
    cancelDisabled,
    supportMessage,
}) => {
    if (!config) {
        return null;
    }

    const warningClass = config.warningVariant === 'success'
        ? classes.modalWarningSuccess
        : classes.modalWarningWarning;

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{config.title}</DialogTitle>
            <div className={classes.modalContent}>
                {config.description && (
                    <p className={classes.modalDescription}>
                        {config.description}
                    </p>
                )}
                {config.listItems && config.listItems.length > 0 && (
                    <ul className={classes.modalList}>
                        {config.listItems.map((item, index) => (
                            <li key={index} className={classes.modalListItem}>
                                {item}
                            </li>
                        ))}
                    </ul>
                )}
                {config.warning && (
                    <p className={`${classes.modalWarning} ${warningClass}`}>
                        {config.warning}
                    </p>
                )}
                {supportMessage && (
                    <p className={classes.modalSupport}>
                        {supportMessage}
                    </p>
                )}
            </div>
            <DialogActions>
                <Button
                    onClick={onClose}
                    color="transparent"
                    disabled={cancelDisabled}
                >
                    {config.cancelText}
                </Button>
                <Button
                    onClick={onConfirm}
                    color={config.confirmColor || 'primary'}
                    disabled={confirmDisabled}
                    loading={confirmLoading}
                >
                    {config.confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

ConfirmActionModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    config: PropTypes.shape({
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        listItems: PropTypes.arrayOf(PropTypes.string),
        warning: PropTypes.string,
        confirmText: PropTypes.string.isRequired,
        cancelText: PropTypes.string.isRequired,
        confirmColor: PropTypes.string,
        warningVariant: PropTypes.oneOf(['success', 'warning']),
    }),
    classes: PropTypes.object.isRequired,
    confirmDisabled: PropTypes.bool,
    confirmLoading: PropTypes.bool,
    cancelDisabled: PropTypes.bool,
    supportMessage: PropTypes.string,
};

ConfirmActionModal.defaultProps = {
    config: null,
    confirmDisabled: false,
    confirmLoading: false,
    cancelDisabled: false,
    supportMessage: '',
};

export default ConfirmActionModal;
