import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogActions, DialogTitle } from '@material-ui/core';
import Button from 'components/CustomButtons/Button';
import { ACTIVATION_ERROR_TYPES } from '../../activationConstants';

const ERROR_CONTENT = {
    [ACTIVATION_ERROR_TYPES.CANCEL_SUBSCRIPTION]: {
        title: 'No pudimos cancelar tu suscripción',
        description: 'Intenta nuevamente o contacta a soporte si el problema persiste.',
    },
    [ACTIVATION_ERROR_TYPES.PAUSE_SUBSCRIPTION]: {
        title: 'No pudimos pausar tu suscripción',
        description: 'Intenta nuevamente o contacta a soporte si el problema persiste.',
    },
    [ACTIVATION_ERROR_TYPES.RESUME_SUBSCRIPTION]: {
        title: 'No pudimos reactivar tu suscripción',
        description: 'Intenta nuevamente o contacta a soporte si el problema persiste.',
    },
};

const ActivationErrorModal = ({ open, onClose, errorType, errorMessage }) => {
    const fallback = {
        title: 'Ocurrió un error',
        description: 'Intenta nuevamente o contacta a soporte si el problema persiste.',
    };

    const content = ERROR_CONTENT[errorType] || fallback;

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{content.title}</DialogTitle>
            <div style={{ padding: '0 24px 24px 24px' }}>
                <p style={{ marginBottom: 0, color: '#666' }}>
                    {content.description}
                </p>
                {errorMessage && (
                    <p style={{ marginTop: 12, color: '#999' }}>
                        {errorMessage}
                    </p>
                )}
            </div>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Aceptar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

ActivationErrorModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    errorType: PropTypes.string,
    errorMessage: PropTypes.string,
};

ActivationErrorModal.defaultProps = {
    errorType: null,
    errorMessage: '',
};

export default ActivationErrorModal;
