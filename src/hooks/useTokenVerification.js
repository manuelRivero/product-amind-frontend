import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resendVerification, verifyToken } from '../store/auth';
import { getConfigRequest } from '../store/config';
import { ERROR_MESSAGES, USER_FRIENDLY_MESSAGES } from './constants';

export const useTokenVerification = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { user } = useSelector((state) => state.auth);
  const { configDetail } = useSelector((state) => state.config);
  const { token: routeToken } = useParams();
  const location = useLocation();
  
  // Capturar token de query parameters
  const queryParams = new URLSearchParams(location.search);
  const queryToken = queryParams.get('token');
  
  // Usar el token de la query string o de la ruta
  const token = queryToken || routeToken;

  // Estados para verificación de token
  const [message, setMessage] = useState("");
  const [loadingTokenVerification, setLoadingTokenVerification] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Estados para reenvío de verificación
  const [loadingResendVerification, setLoadingResendVerification] = useState(false);
  const [showResendModal, setShowResendModal] = useState(false);
  const [resendModalMessage, setResendModalMessage] = useState("");

  // Función para verificar token automáticamente
  const handleAutoTokenVerification = useCallback(async (tokenValue) => {
    setLoadingTokenVerification(true);
    try {
      const response = await dispatch(verifyToken({ token: tokenValue }));
      
      if (response.type === 'auth/verifyToken/fulfilled') {
        setMessage(response.payload.message || 'Token verificado exitosamente');
        setShowSuccessModal(true);
        setShowTokenModal(false);
        
        // Limpiar los query parameters de la URL
        const newPath = location.pathname;
        history.replace(newPath);
        
        // Refetch de la config para actualizar configDetail.isVerified
        dispatch(getConfigRequest());
      } else if (response.type === 'auth/verifyToken/rejected') {
        const errorMessage = response.payload?.message || '';
        const isTokenError = Object.values(ERROR_MESSAGES).some(msg => 
          errorMessage.includes(msg)
        );
        
        if (isTokenError) {
          // Encontrar el mensaje específico
          const specificError = Object.values(ERROR_MESSAGES).find(msg => 
            errorMessage.includes(msg)
          );
          
          // Mostrar modal de reenvío con explicación
          setResendModalMessage(USER_FRIENDLY_MESSAGES[specificError] || USER_FRIENDLY_MESSAGES[ERROR_MESSAGES.TOKEN_INVALID_EXPIRED]);
          setShowResendModal(true);
          setShowTokenModal(false);
        } else {
          // Error genérico
          setErrorMessage(errorMessage || 'Error al verificar el token. Por favor, inténtalo de nuevo.');
          setShowErrorModal(true);
          setShowTokenModal(false);
        }
      }
    } catch (error) {
      console.error('Error al verificar token:', error);
      setErrorMessage('Error al verificar el token. Por favor, inténtalo de nuevo.');
      setShowErrorModal(true);
      setShowTokenModal(false);
    } finally {
      setLoadingTokenVerification(false);
    }
  }, [dispatch, history, location]);

  // Efecto para manejar la lógica de modales
  useEffect(() => {
    // Si hay token en los parámetros, verificar automáticamente
    if (token) {
      setShowTokenModal(true);
      setShowResendModal(false); // Ocultar modal de reenvío cuando hay token
      handleAutoTokenVerification(token);
      return;
    }
    
    // Si el usuario no está verificado y no hay token, 
    // el modal de reenvío debe estar SIEMPRE visible
    const isVerified = configDetail?.isVerified;
    if (user && !isVerified && !token) {
      setShowResendModal(true);
    } else if (user && isVerified) {
      // Si el usuario está verificado, ocultar el modal de reenvío
      setShowResendModal(false);
    }
  }, [token, user, configDetail, handleAutoTokenVerification]);



  // Función para reenviar verificación
  const handleResendVerification = async () => {
    if (!user?.email) {
      setErrorMessage('No se pudo obtener el email del usuario');
      setShowErrorModal(true);
      return;
    }

    setLoadingResendVerification(true);
    try {
      const response = await dispatch(resendVerification({ email: user.email }));
      
      if (response.type === 'auth/resendVerification/fulfilled') {
        // NO cerrar el modal de reenvío, solo mostrar el de éxito encima
        // El modal de reenvío debe permanecer visible como aviso constante
        setShowSuccessModal(true);
        setMessage('Se ha reenviado el email de verificación. Por favor, revisa tu bandeja de entrada y haz clic en el enlace proporcionado para verificar tu cuenta.');
      } else if (response.type === 'auth/resendVerification/rejected') {
        setErrorMessage(response.payload?.message || 'Error al reenviar la verificación. Por favor, inténtalo de nuevo.');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error al reenviar verificación:', error);
      setErrorMessage('Error al reenviar la verificación. Por favor, inténtalo de nuevo.');
      setShowErrorModal(true);
    } finally {
      setLoadingResendVerification(false);
    }
  };

  // Funciones para cerrar modales
  const handleTokenModalClose = () => {
    setShowTokenModal(false);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Si el usuario sigue sin estar verificado y no hay token, 
    // asegurar que el modal de reenvío esté visible
    const isVerified = configDetail?.isVerified;
    if (user && !isVerified && !token) {
      setShowResendModal(true);
    }
  };

  const handleErrorModalClose = () => {
    setShowErrorModal(false);
    setErrorMessage("");
    // Si el usuario sigue sin estar verificado y no hay token, 
    // asegurar que el modal de reenvío esté visible
    const isVerified = configDetail?.isVerified;
    if (user && !isVerified && !token) {
      setShowResendModal(true);
    }
  };

  const handleResendModalClose = () => {
    // El modal de reenvío NO debe poder cerrarse manualmente
    // Solo se oculta cuando el usuario está verificado o hay un token
    // Esta función no hace nada, pero se mantiene para compatibilidad
  };

  return {
    // Estados
    message,
    loadingTokenVerification,
    loadingResendVerification,
    showSuccessModal,
    showErrorModal,
    showTokenModal,
    showResendModal,
    errorMessage,
    resendModalMessage,
    user,
    
    // Funciones
    handleResendVerification,
    handleTokenModalClose,
    handleSuccessModalClose,
    handleErrorModalClose,
    handleResendModalClose,
  };
};
