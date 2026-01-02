import React from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { 
  Dialog, 
  DialogActions, 
  DialogTitle, 
  DialogContent,
  Button,
  CircularProgress
} from '@material-ui/core';
import Card from 'components/Card/Card.js'
import CardHeader from 'components/Card/CardHeader.js'
import CardIcon from 'components/Card/CardIcon.js'
import CardBody from 'components/Card/CardBody.js'
import StoreIcon from '@material-ui/icons/Store'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import { useTokenVerification } from '../../hooks/useTokenVerification';
import logo from '../../assets/img/logo-blue.svg';
import { getTenantFromHostname } from '../../utils/tenant';

const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '30px',
    padding: '20px',
  },
  logoContainer: {
    border: '5px solid #0065ea',
    padding: '10px',
    borderRadius: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 'fit-content',
    marginBottom: '20px',
  },
  logo: {
    width: '100px',
    height: '100px',
  },
  welcomeSection: {
    textAlign: 'center',
  },
  title: {
    marginBottom: '10px',
    color: '#333',
  },
  description: {
    color: '#666',
    textAlign: 'center',
  },
  cardContainer: {
    width: '100%',
    maxWidth: '500px',
    marginTop: '20px',
  },
  storeLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    textDecoration: 'none',
    color: '#0065ea',
    fontWeight: 600,
    fontSize: '16px',
    padding: '10px',
    borderRadius: '4px',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#f5f5f5',
      textDecoration: 'none',
      color: '#0052cc',
    },
  },
  linkText: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  descriptionText: {
    textAlign: 'center',
    color: '#666',
    fontSize: '14px',
    marginBottom: '15px',
    lineHeight: '1.5',
  },
  modalTitle: {
    textAlign: 'center',
    paddingBottom: '0',
  },
  modalContent: {
    paddingTop: '0',
    textAlign: 'center',
  },
  tokenInput: {
    width: '100%',
    marginBottom: '20px',
  },
}));

export default function Home() {
  const classes = useStyles();
  const { tenant } = useSelector((state) => state.config);

  // Obtener el subdomain del tenant o del hostname
  const getSubdomain = () => {
    if (tenant) {
      // Si el tenant tiene el sufijo "-admin", lo removemos
      return tenant.replace('-admin', '')
    }
    return getTenantFromHostname()
  }
  
  const subdomain = getSubdomain()
  const storeUrl = subdomain ? `https://${subdomain}.tiendapro.com.ar` : null;

  const {
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
    handleResendVerification,
    handleSuccessModalClose,
    handleErrorModalClose,
  } = useTokenVerification();

  return (
    <div className={classes.container}>
      <div className={classes.logoContainer}>
        <img src={logo} alt="logo" className={classes.logo} />
      </div>
      <div className={classes.welcomeSection}>
        <h3 className={classes.title}>Bienvenido al administrador de tú tienda</h3>
      </div>
      
      {storeUrl && (
        <div className={classes.cardContainer}>
          <Card>
            <CardHeader color="primary" icon>
              <CardIcon color="primary">
                <StoreIcon />
              </CardIcon>
              <h3 style={{ color: '#fff', margin: '10px 0', fontSize: '20px' }}>
                Visita tu tienda
              </h3>
            </CardHeader>
            <CardBody>
              <p className={classes.descriptionText}>
                Haz clic en el siguiente enlace para ver tu tienda en línea y verificar cómo la ven tus clientes.
              </p>
              <a 
                href={storeUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className={classes.storeLink}
              >
                <div className={classes.linkText}>
                  <span>Ver mi tienda</span>
                  <OpenInNewIcon style={{ fontSize: '18px' }} />
                </div>
              </a>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Modal para verificar token automáticamente */}
      <Dialog 
        open={showTokenModal} 
        onClose={undefined}
        disableBackdropClick={true}
        disableEscapeKeyDown={true}
      >
        <DialogTitle className={classes.modalTitle} >Verificando Token</DialogTitle>
        <DialogContent className={classes.modalContent}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
            <CircularProgress size={60} style={{ marginBottom: '20px' }} />
            <p>Verificando tu token de verificación...</p>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
              {loadingTokenVerification 
                ? 'Por favor, espera mientras procesamos tu verificación.'
                : 'Procesando...'
              }
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de éxito */}
      <Dialog open={showSuccessModal} onClose={handleSuccessModalClose}>
        <DialogTitle className={classes.modalTitle}>¡Token verificado exitosamente!</DialogTitle>
        <DialogContent className={classes.modalContent}>
          <p>{message}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSuccessModalClose} color="primary">
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de error */}
      <Dialog open={showErrorModal} onClose={handleErrorModalClose}>
        <DialogTitle className={classes.modalTitle}>Error de verificación</DialogTitle>
        <DialogContent className={classes.modalContent}>
          <p>{errorMessage}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleErrorModalClose} color="primary">
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de reenvío de verificación */}
      <Dialog 
        open={showResendModal} 
        onClose={undefined}
        disableBackdropClick={true}
        disableEscapeKeyDown={true}
      >
        <DialogTitle className={classes.modalTitle}>
          {resendModalMessage ? 'Token de verificación inválido' : 'Verificación requerida'}
        </DialogTitle>
        <DialogContent className={classes.modalContent}>
          {resendModalMessage ? (
            <>
              <p>{resendModalMessage}</p>
              <p style={{ marginTop: '15px', fontWeight: 'bold' }}>
                Email: {user?.email}
              </p>
            </>
          ) : (
            <>
              <p>Tu cuenta no está verificada. Para acceder a todas las funcionalidades, necesitas verificar tu email.</p>
              <p style={{ marginTop: '15px', fontWeight: 'bold' }}>
                Email: {user?.email}
              </p>
              <p style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
                Haz clic en &quot;Reenviar verificación&quot; para recibir un nuevo email con el enlace de verificación.
              </p>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleResendVerification} 
            color="primary" 
            disabled={loadingResendVerification}
          >
            {loadingResendVerification ? 'Enviando...' : 'Reenviar verificación'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
