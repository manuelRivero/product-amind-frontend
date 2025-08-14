import { useState } from 'react'

export const useStatusChange = () => {
  const [modalState, setModalState] = useState({
    open: false,
    nextStatus: ''
  })

  const openModal = (nextStatus) => {
    setModalState({
      open: true,
      nextStatus
    })
  }

  const closeModal = () => {
    setModalState({
      open: false,
      nextStatus: ''
    })
  }

  const getStatusIndex = (status, statusOptions) => {
    return statusOptions.findIndex(option => option === status) + 1
  }

  const handleConfirm = (data, statusOptions, onStatusChange) => {
    const { nextStatus } = data
    const statusIndex = getStatusIndex(nextStatus, statusOptions)
    onStatusChange(statusIndex)
    closeModal()
  }

  return {
    modalState,
    openModal,
    closeModal,
    handleConfirm
  }
} 