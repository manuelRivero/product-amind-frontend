import { cancelReason } from './sales'

export const CANCEL_REASONS = {
  ORDER_CANCELLATION: Object.values(cancelReason),
  PRODUCT_DELETION: [
    "Producto descontinuado",
    "Error en la información",
    "Problema de calidad",
    "Otro motivo"
  ]
}

export const getCancelReasons = (actionType) => {
  return CANCEL_REASONS[actionType] || CANCEL_REASONS.ORDER_CANCELLATION
} 