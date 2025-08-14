import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@material-ui/core'
import Button from 'components/CustomButtons/Button'
import Snackbar from 'components/Snackbar/Snackbar'
import { getCancelReasons } from '../../const/cancelReasons'
import { cancelReason } from '../../const/sales'

const StatusChangeModal = ({
  open,
  onClose,
  onConfirm,
  nextStatus,
  loading = false,
  actionType = 'ORDER_CANCELLATION',
  requireCancelReason = false,
  title = "Confirmar cambio de estado",
  confirmButtonText = "Confirmar",
  cancelButtonText = "Cancelar"
}) => {
  const [selectedReason, setSelectedReason] = useState('')
  const [error, setError] = useState(null)
  
  // Reset selectedReason when modal opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedReason('')
    }
  }, [open])

  // Close modal when loading changes from true to false (request completed)
  useEffect(() => {
    if (!loading && open) {
      onClose()
    }
  }, [loading, open, onClose])

  // Reset error when modal opens
  useEffect(() => {
    if (open) {
      setError(null)
    }
  }, [open])

  const handleConfirm = async () => {
    try {
      // Encontrar la key del motivo seleccionado
      const reasonKey = requireCancelReason && selectedReason ? 
        Object.keys(cancelReason).find(key => cancelReason[key] === selectedReason) : null
      
      const data = {
        nextStatus,
        cancelReason: reasonKey ? parseInt(reasonKey) : null
      }
      await onConfirm(data)
    } catch (error) {
      setError(error.message || 'Error al cambiar el estado. Inténtalo de nuevo.')
    }
  }

  const isCancelAction = nextStatus === 'CANCELADO'
  const showCancelReasons = isCancelAction && requireCancelReason
  const isConfirmDisabled = showCancelReasons && !selectedReason
  const cancelReasons = getCancelReasons(actionType)

  return (
    <>
      <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          ¿Estás seguro de que deseas cambiar el estado a{' '}
          <strong>{nextStatus}</strong>?
        </DialogContentText>
        
        {showCancelReasons && (
          <FormControl component="fieldset" style={{ marginTop: '1rem' }}>
            <FormLabel component="legend">Motivo de cancelación:</FormLabel>
                         <RadioGroup
               value={selectedReason}
               onChange={(e) => setSelectedReason(e.target.value)}
             >
                                          {cancelReasons.map((reason) => (
                                <FormControlLabel
                                    key={reason}
                                    value={reason}
                                    control={<Radio />}
                                    label={
                                        <div>
                                            <div>{reason}</div>
                                                                                         {reason === cancelReason[1] && (
                                                <small style={{ 
                                                    color: '#666', 
                                                    fontSize: '12px',
                                                    display: 'block',
                                                    marginTop: '2px'
                                                }}>
                                                    Alerta: Esta acción no devolverá los productos marcados como vendidos al stock. 
                                                    Sumar productos inexistentes al inventario podría causar inconsistencias en el sistema.
                                                </small>
                                            )}
                                        </div>
                                    }
                                />
                            ))}
            </RadioGroup>
          </FormControl>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button
          onClick={onClose}
          color="secondary"
          disabled={loading}
        >
          {cancelButtonText}
        </Button>
        <Button
          onClick={handleConfirm}
          color="primary"
          variant="contained"
          disabled={isConfirmDisabled || loading}
          isLoading={loading}
        >
          {confirmButtonText}
        </Button>
      </DialogActions>
      </Dialog>
      
      {/* Error Snackbar */}
      <Snackbar
        place="tc"
        color="danger"
        icon={null}
        message={error}
        open={!!error}
        closeNotification={() => setError(null)}
        close
      />
    </>
  )
}

StatusChangeModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  nextStatus: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  actionType: PropTypes.oneOf(['ORDER_CANCELLATION', 'PRODUCT_DELETION']),
  requireCancelReason: PropTypes.bool,
  title: PropTypes.string,
  confirmButtonText: PropTypes.string,
  cancelButtonText: PropTypes.string,
}

export default StatusChangeModal 